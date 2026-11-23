import {L,href,esc} from './data.mjs';

export const assessment={slug:'gutter-assessment',short:['Help me figure it out','Ayúdeme a identificarlo']};
const homeownerConcerns=[
 ['Water spills over the edge','El agua rebosa por el borde','Share where it overflows and whether it happens in light rain or only during downpours. Ryan can check the gutter, outlet, and downspout together.','Indique dónde rebosa y si ocurre con lluvia ligera o solo en aguaceros. Ryan puede revisar la canaleta, la salida y la bajante juntas.','gutter-assessment'],
 ['A joint leaks or a section sags','Una unión gotea o un tramo está caído','Tell Ryan which corner or section is affected. A photo of the seam or sag, taken from the ground, will help him plan the visit.','Indique qué esquina o tramo está afectado. Una foto de la unión o del tramo caído, tomada desde el suelo, ayudará a Ryan a planear la visita.','gutter-repair'],
 ['Water pools near my home','El agua se acumula junto a mi casa','Show where the downspout ends and where the puddle forms. Ryan can look at outlet placement and the path water takes away from the house.','Muestre dónde termina la bajante y dónde se forma el charco. Ryan puede revisar la salida y el recorrido del agua desde la casa.','downspouts'],
 ['Leaves keep blocking the gutter','Las hojas obstruyen la canaleta','Tell Ryan which trees are nearby and how often the outlets clog. He can discuss cleaning and whether a guard fits the roof edge.','Indique qué árboles hay cerca y con qué frecuencia se tapan las salidas. Ryan puede hablar sobre la limpieza y si conviene instalar un protector.','gutter-cleaning'],
 ['I’m planning new gutters','Estoy planeando instalar canaletas','Bring a photo or plans of the roofline. Compare sizes, profiles, and downspout locations with Ryan before choosing a finish.','Comparta una foto o los planos del techo. Compare tamaños, perfiles y ubicaciones de bajantes con Ryan antes de elegir el acabado.','seamless-gutter-installation']
];
export function homeownerFinder(l){
 const t=(en,es)=>L(l,en,es);
 return '<section class="section homeowner-finder" id="gutter-help"><div class="wrap"><h2>'+t('What’s happening at your house?','¿Qué está pasando en su casa?')+'</h2><p>'+t('Choose what you’ve noticed. Ryan can help you work out what the gutter system needs.','Elija lo que ha observado. Ryan puede ayudarle a identificar qué necesita el sistema.')+'</p><div class="concerns">'+homeownerConcerns.map(([en,es,den,des,service])=>{
  const title=t(en,es),query=new URLSearchParams({service,concern:title});
  return '<details><summary>'+title+'</summary><div><p>'+t(den,des)+'</p><a class="textlink" href="'+esc(href(l,'/estimate/?'+query))+'">'+t('Ask Ryan about this','Consultar a Ryan')+'</a></div></details>';
 }).join('')+'</div></div></section>';
}
