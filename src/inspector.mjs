import guardPlanes from '../public/media/inspector/guard-planes.json' with {type:'json'};
import {L} from './data.mjs';

export function gutterInspector(l){
 const t=(a,b)=>L(l,a,b);
 return `<script type="application/json" id="inspector-planes">${JSON.stringify(guardPlanes)}</script><div id="inspector-slot"><div class="gutter-inspector" id="gutter-inspector">
  <div class="inspector-tools"><div class="inspector-focus" role="group" aria-label="${t('Inspect a gutter detail','Inspeccione un detalle')}">
  <button type="button" data-focus-detail="profile" aria-pressed="true">${t('Full profile','Perfil completo')}</button>
  <button type="button" data-focus-detail="trough" aria-pressed="false">${t('Inside trough','Interior')}</button>
  <button type="button" data-focus-detail="lip" aria-pressed="false">${t('Front edge','Borde frontal')}</button></div>
  <button type="button" class="inspector-expand" aria-haspopup="dialog">${t('Enlarge','Ampliar')}</button></div>
  <svg id="gutter-cutaway" class="gutter-cutaway" viewBox="130 50 785 507" role="img" aria-label="${t('5-inch K-style gutter cutaway','Sección de una canaleta K de 5 pulgadas')}" xmlns="http://www.w3.org/2000/svg">
   <defs><filter id="metal-finish-filter" color-interpolation-filters="sRGB" x="0%" y="0%" width="100%" height="100%"><feComponentTransfer><feFuncR type="table" tableValues="0 .95 1"/><feFuncG type="table" tableValues="0 .95 1"/><feFuncB type="table" tableValues="0 .95 1"/></feComponentTransfer></filter></defs>
   <image id="inspector-base" href="/media/profiles/k-5.webp" width="960" height="620"/>
   <image id="inspector-metal" href="/media/inspector/k-5-light.webp" width="960" height="620" filter="url(#metal-finish-filter)"/>
   <g id="inspector-guard" display="none"><polygon data-screen-bed fill="#617075" fill-opacity=".81" stroke="#b8c5c9" stroke-width="2.5"/><path data-screen-mesh fill="none" stroke="#c9d7d9" stroke-width="1.25"/><path data-screen-edge fill="none" stroke="#aab9bb" stroke-width="5"/></g>
  </svg>
  <div class="inspector-caption"><strong data-inspector-caption></strong><span data-inspector-focus-note></span></div>
 </div></div><dialog class="inspector-dialog" aria-label="${t('Enlarged gutter detail','Detalle ampliado de la canaleta')}"><div class="inspector-dialog-bar"><strong>${t('Gutter detail','Detalle de la canaleta')}</strong><button type="button" data-close-inspector>${t('Close','Cerrar')}</button></div><div class="dialog-inspector-slot"></div></dialog>`;
}
