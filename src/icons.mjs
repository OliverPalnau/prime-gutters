const iconPaths={
 card:'<rect x="2" y="4" width="20" height="16" rx="3"/><path d="M2 9h20M6 15h4"/>',
 document:'<path d="M5 3h10l4 4v14H5zM14 3v5h5M8 12h8M8 16h6"/>',
 phone:'<path d="M21 16.5v3a2 2 0 0 1-2.2 2A18 18 0 0 1 2.5 5.2 2 2 0 0 1 4.5 3h3l1.4 4.6-2.1 2.1a15 15 0 0 0 6.5 6.5l2.1-2.1z"/>',
 message:'<path d="M4 4h16v13H9l-5 4z"/>',
 pin:'<path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2.4"/>',
 globe:'<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/>',
 check:'<path d="m4 12 5 5L20 6"/>', chev:'<path d="m6 9 6 6 6-6"/>',menu:'<path d="M3 6h18M3 12h18M3 18h18"/>',
 drop:'<path d="M12 2s-7 8-7 13a7 7 0 1 0 14 0c0-5-7-13-7-13Z"/><path d="M9 15a3 3 0 0 0 3 3"/>',
 house:'<path d="m2 11 10-8 10 8M5 10v11h14V10M9 21v-7h6v7"/>',
 swatch:'<path d="M3 3h6v14a3 3 0 0 1-6 0zM9 13l7-7 4 4-10 10M12 16h9v5H6"/><circle cx="6" cy="17" r=".6"/>',
 star:'<path d="m12 3 2.8 5.7 6.3.9-4.6 4.4 1.1 6.3-5.6-3-5.6 3 1.1-6.3L3 9.6l6.2-.9z"/>',
 layers:'<path d="m2 9 10-6 10 6-10 6zM2 13l10 6 10-6M2 17l10 6 10-6"/>',
 zoom:'<circle cx="10" cy="10" r="6"/><path d="m15 15 6 6M7 10h6M10 7v6"/>'
};
export function icon(key,size=18){return '<svg width="'+size+'" height="'+size+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+iconPaths[key]+'</svg>'}
export function logo(){
  return '<img class="prime-logo" src="/media/brand/prime-gutters-logo.webp" width="900" height="300" alt="Prime Gutters">';
}
