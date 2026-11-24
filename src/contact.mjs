import {L,esc,href,phone,tel} from './data.mjs';

export const contactPath = '/contact/';
const contactKeys = ['name', 'email', 'phone', 'message', 'language'];
const messageIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function contactSection(l, state = {}) {
 const t = (en, es) => L(l, en, es);
 const value = key => esc(state.values?.[key] || '');
 const recipient = '<div class="contact-recipient"><img src="/media/people/ryan-moore-avatar.webp" width="64" height="64" alt=""><div><strong>Ryan Moore</strong><span>'+t('Owner, Prime Gutters','Propietario de Prime Gutters')+'</span></div></div>';
 const intro = '<div><p class="eyebrow"><span></span>'+t('Contact us','Contacto')+'</p><h1>'+t('Send Ryan a message.','Envíele un mensaje a Ryan.')+'</h1><p class="contact-intro">'+t('Have a question about a loose gutter or a recent job? Want to introduce your business? Tell Ryan what’s on your mind.','¿Tiene una pregunta sobre una canaleta suelta o un trabajo reciente? ¿Le gustaría presentar su empresa? Cuéntele a Ryan.')+'</p>'+recipient+
 '<p class="contact-urgent">'+t('Need urgent gutter help?','¿Necesita ayuda urgente?')+' <a href="'+tel+'">'+t('Call','Llame al')+' '+phone+'</a></p></div>';
 const unavailable = t('Online messaging is temporarily unavailable. Please try again later.','El formulario no está disponible en este momento. Inténtelo de nuevo más tarde.');
 const errors = {
  invalid:t('Check your name, email address and message. If you add a phone number, include its area code.','Revise su nombre, correo electrónico y mensaje. Si añade un teléfono, incluya el código de área.'),
  busy:unavailable, conflict:t('Your earlier message was already received. Review this version and submit it as a new message if needed.','Ya recibimos su mensaje anterior. Revise esta versión y envíela como un mensaje nuevo si lo desea.')
 };
 const note = state.received ? '<div class="contact-form-panel" role="status"><h2>'+t('Message received','Mensaje recibido')+'</h2><p>'+t('Thank you for contacting Prime Gutters. Ryan can reply using the contact details you provided.','Gracias por contactar a Prime Gutters. Ryan podrá responderle con los datos que compartió.')+'</p><a class="textlink" href="'+href(l,contactPath)+'">'+t('Write another message','Escribir otro mensaje')+'</a></div>' : '';
 const form = note || '<form class="contact-form-panel" method="post" action="'+href(l,contactPath)+'"><h2>'+t('Your message','Su mensaje')+'</h2>'+
 (state.error||state.unavailable?'<p role="alert" class="contact-error">'+(errors[state.error]||unavailable)+'</p>':'')+
 '<input type="hidden" name="requestId" value="'+esc(state.id||crypto.randomUUID())+'"><label class="trap" aria-hidden="true">Website<input tabindex="-1" name="website" autocomplete="off"></label>'+
 '<div class="fields"><label class="fullcol">'+t('Name','Nombre')+'<input name="name" autocomplete="name" required maxlength="90" value="'+value('name')+'"></label>'+
 '<label>'+t('Email address','Correo electrónico')+'<input type="email" name="email" autocomplete="email" required maxlength="254" value="'+value('email')+'"></label>'+
 '<label>'+t('Phone number (optional)','Teléfono (opcional)')+'<input type="tel" name="phone" autocomplete="tel" maxlength="30" value="'+value('phone')+'"></label>'+
 '<label class="fullcol">'+t('Message','Mensaje')+'<textarea name="message" required maxlength="3000" rows="5">'+value('message')+'</textarea></label></div>'+
 '<button class="btn cyan" type="submit"'+(state.unavailable?' disabled':'')+'>'+t('Send message','Enviar mensaje')+'</button></form>';
 return '<section class="section contact-page"><div class="wrap contact-layout">'+intro+form+'</div></section>';
}

export async function acceptContact(request, env, language) {
 const failure = (status, error, values, id) => ({status, state:{error, values, id}});
 if (request.headers.has('origin') && request.headers.get('origin') !== new URL(request.url).origin) return failure(403,'invalid');
 if (!request.headers.get('content-type')?.startsWith('application/x-www-form-urlencoded')) return failure(415,'invalid');
 if (Number(request.headers.get('content-length')) > 45000) return failure(413,'invalid');
 const body = await request.text();
 if (body.length > 45000) return failure(413,'invalid');
 const form = new URLSearchParams(body);
 const id = form.get('requestId');
 const values = Object.fromEntries(contactKeys.slice(0,4).map(key => [key, (form.get(key)||'').trim()]));
 const {name,email,phone:callback,message} = values;
 if (!messageIdPattern.test(id||'') || form.get('website') || !name || name.length>90 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length>254 || callback.length>30 || (callback && !/^[\d+().\s-]+$/.test(callback)) || (callback && !/^\d{7,15}$/.test(callback.replace(/\D/g,''))) || !message || message.length>3000) return failure(422,'invalid',values);
 const record = {...values,language};
 try {
  let status;
  if (env?.storeContact) status = await env.storeContact(id,record);
  else if (env?.DB) {
   const ins=await env.DB.prepare('INSERT INTO contact_messages(request_id,name,email,phone,message,language) VALUES(?,?,?,?,?,?) ON CONFLICT(request_id) DO NOTHING').bind(id,name,email,callback,message,language).run();
   if (!ins.meta?.changes) {
    const existing=await env.DB.prepare('SELECT name,email,phone,message,language FROM contact_messages WHERE request_id=?').bind(id).first();
    if (!existing || contactKeys.some(key=>existing[key]!==record[key])) status=409;
   }
  } else return failure(503,'busy',values,id);
  if (status===409) return failure(409,'conflict',values);
  return {status:303};
 } catch {return failure(503,'busy',values,id);}
}
