import {L,href,esc,phone,tel,sms,googleReviews,writeGoogleReview} from './data.mjs';
import {nyForm,taxPath} from './features.mjs';
import {icon} from './icons.mjs';

export const reviewsPath='/reviews/';
export const invoicePath='/pay-invoice/';
export const paymentMethods=[
  ['visa','Visa'],['mastercard','Mastercard'],['amex','American Express'],
  ['discover','Discover'],['zelle','Zelle'],['venmo','Venmo']
];
const reviewSnapshot={
  date:'2026-11-22',rating:4.4,count:20,
  reviews:[
    {author:'Gerald Curreri',rating:5,text:'His price was very fair, maybe even low for the excellent service.',url:'https://www.google.com/maps/reviews/data=!4m5!14m4!1m3!1m2!1s100256627110987139298!2s0x89e827c7aedc0001:0x5a178152b3827fb3'},
    {author:'Alicia Sable',rating:5,text:'The quality of his work is top notch and they are just beautiful!',url:'https://www.google.com/maps/reviews/data=!4m5!14m4!1m3!1m2!1s113772400270308675433!2s0x89e827c7aedc0001:0x5a178152b3827fb3'}
  ]
};
function paymentMarks(l){
  return '<ul class="pay-marks" aria-label="'+L(l,'Payment methods','Métodos de pago')+'">'+paymentMethods.map(([id,label])=>'<li><img src="/media/directory/pay-'+id+'.svg" width="56" height="34" alt="'+label+'"></li>').join('')+'</ul>';
}
export function reviewsSection(l,standalone=false){
 const t=(a,b)=>L(l,a,b),summary=reviewSnapshot,heading=standalone?'h1':'h2';
 const date=t('Nov 22, 2026','22 de noviembre de 2026');
 const cards=summary.reviews.map(r=>'<figure class="review-quote"><div class="review-by"><figcaption>'+r.author+'</figcaption><span class="review-stars" role="img" aria-label="'+r.rating+t(' out of 5 stars',' de 5 estrellas')+'">'+'★'.repeat(r.rating)+'</span></div><blockquote lang="en">“'+esc(r.text)+'”</blockquote><a href="'+esc(r.url)+'">'+t('View original Google review','Ver reseña original en Google')+'</a></figure>').join('');
 return '<section class="section reviews-section"><div class="wrap"><p class="eyebrow"><span></span>Prime Gutters · Huntington, NY</p><div class="review-layout"><div class="review-intro"><'+heading+'>'+t('Google reviews','Reseñas de Google')+'</'+heading+'><p class="review-score"><strong>'+summary.rating.toLocaleString(l)+'</strong> / 5 · '+summary.count+t(' Google reviews',' reseñas en Google')+'</p><p class="review-date">'+t('Checked ','Consultado el ')+'<time datetime="'+summary.date+'">'+date+'</time></p><div class="review-links"><a class="btn ink" href="'+esc(googleReviews)+'">'+t('Read all Google reviews','Leer todas las reseñas')+'</a><a class="textlink" href="'+esc(writeGoogleReview)+'">'+t('Review us on Google','Escribir una reseña en Google')+'</a></div></div><div class="review-quotes">'+cards+'</div></div></div></section>';
}
export function customerFooter(l){
 const t=(a,b)=>L(l,a,b);
 const repair=href(l,'/estimate/?service=gutter-repair');
 return '<div class="wrap footer-tools"><section class="emergency-card"><div><div class="emergency-label">'+icon('phone',18)+t('Call any time','Llame a cualquier hora')+'</div><h2>'+t('24/7 emergency gutter help','Ayuda urgente para canaletas 24/7')+'</h2><p>'+t('A gutter pulling away or water pouring over an entry? Call Ryan to confirm the next available visit.','¿Una canaleta suelta o agua desbordándose sobre una entrada? Llame a Ryan para confirmar la próxima visita disponible.')+'</p></div><div class="emergency-actions"><a class="emergency-call" href="'+tel+'"><img width="40" height="40" src="/media/people/ryan-moore-avatar.webp" alt=""><span>'+t('Call Ryan','Llame a Ryan')+' <b>'+phone+'</b></span></a><a href="'+repair+'">'+t('Request the next available visit','Solicitar la próxima visita disponible')+'</a></div></section>'+
 '<div class="footer-service-cards"><section class="invoice-card"><div class="tool-title">'+icon('card',23)+'<h2>'+t('Pay your invoice','Pague su factura')+'</h2></div><p>'+t('Have your Prime Gutters invoice number handy. Use the payment instructions on your invoice or ask Ryan for a payment link.','Tenga a mano el número de su factura de Prime Gutters. Siga sus instrucciones de pago o pida a Ryan un enlace de pago.')+'</p><a class="btn" href="'+href(l,invoicePath)+'">'+t('Invoice payment options','Opciones para pagar')+'</a>'+paymentMarks(l)+'</section>'+
 '<section class="tax-card"><div class="tool-title">'+icon('document',23)+'<h2>'+t('NY capital improvement form','Certificado de mejora de capital de NY')+'</h2></div><p>'+t('Planning a complete gutter and downspout replacement? Check whether your project qualifies for New York’s capital improvement certificate.','¿Planea sustituir todo el sistema de canaletas y bajantes? Compruebe si su proyecto reúne los requisitos para el certificado estatal.')+'</p><div class="tax-links"><a class="btn" href="'+nyForm+'">'+t('Open ST-124 (PDF)','Abrir ST-124 (PDF)')+'</a><a href="'+href(l,taxPath)+'">'+t('Which projects qualify?','¿Qué proyectos califican?')+'</a></div></section></div></div>';
}
export function invoiceContent(l){
 const t=(a,b)=>L(l,a,b);
 const methods=[
   [t('Credit or debit card','Tarjeta de crédito o débito'),t('If your invoice includes a secure card link, use it to pay. Ryan can help you get the link for your invoice.','Si su factura incluye un enlace de pago seguro, úselo para pagar. Ryan puede facilitarle el enlace correspondiente.'),t('Text Ryan for the card link','Pedir a Ryan el enlace de tarjeta'),t('Please send me the card payment link for my Prime Gutters invoice','Envíeme el enlace de pago con tarjeta para mi factura de Prime Gutters')],
   ['Zelle',t('Follow the Zelle instructions on your invoice, or ask Ryan to confirm the enrolled recipient before you pay.','Siga las instrucciones de Zelle de su factura o pida a Ryan que confirme el destinatario antes de pagar.'),t('Ask for Zelle details','Pedir los datos de Zelle'),t('Please confirm the Zelle recipient for my Prime Gutters invoice','Confirme el destinatario de Zelle para mi factura de Prime Gutters')],
   ['Venmo',t('Use the Venmo profile specified for your invoice. Ryan can send you the business profile link.','Use el perfil indicado para su factura. Ryan puede enviarle el enlace del perfil comercial.'),t('Ask for Venmo details','Pedir los datos de Venmo'),t('Please send me the Venmo business profile for my Prime Gutters invoice','Envíeme el perfil comercial de Venmo para mi factura de Prime Gutters')]
 ];
 const cards=methods.map(([name,desc,label,message])=>'<article><h2>'+name+'</h2><p>'+desc+'</p><a class="textlink" data-invoice-message="'+esc(message)+'" href="'+sms+'?body='+encodeURIComponent(message+'.')+'">'+label+'</a></article>').join('');
 return '<section class="section invoice-page"><div class="wrap"><p class="eyebrow"><span></span>Prime Gutters · Huntington, NY</p><h1>'+t('Pay your invoice','Pague su factura')+'</h1><p class="invoice-intro">'+t('Start with the instructions on your Prime Gutters invoice. If you need a link or payment details, choose a method below to open a text to Ryan.','Comience con las instrucciones de su factura de Prime Gutters. Si necesita un enlace o los datos de pago, elija un método para abrir un mensaje a Ryan.')+'</p>'+paymentMarks(l)+'<label class="invoice-ref" for="invoice-number">'+t('Invoice number (optional)','Número de factura (opcional)')+'<input id="invoice-number" type="text" maxlength="60" autocomplete="off" spellcheck="false" aria-describedby="invoice-hint"></label><p class="invoice-hint" id="invoice-hint">'+t('Included in your text to Ryan.','Se incluirá en su mensaje a Ryan.')+'</p><div class="payment-choices">'+cards+'</div><p class="invoice-call">'+t('Prefer to call? Reach Ryan at ','¿Prefiere llamar? Comuníquese con Ryan al ')+'<a href="'+tel+'">'+phone+'</a>.</p></div></section>';
}
