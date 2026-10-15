const paths = {
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  star: '<path d="m12 3 2.8 5.7 6.3.9-4.6 4.5 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  pdf: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M8 13h8m-8 4h5"/>',
  image:
    '<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>',
  document:
    '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M8 12h8m-8 4h8"/>',
  shapes:
    '<path d="m7 3 4 7H3l4-7Z"/><rect x="3" y="14" width="7" height="7" rx="1"/><circle cx="17" cy="17" r="4"/><path d="m17 3 1.5 3.5L22 8l-3.5 1.5L17 13l-1.5-3.5L12 8l3.5-1.5L17 3Z"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 0 1 5 .5c0 2-2.5 2-2.5 4M12 17h.01"/>',
  shield:
    '<path d="m12 3 8 3v6c0 4-5 8-8 9-3-1-8-5-8-9V6l8-3Z"/><path d="M9 12h6m-3-3v6"/>',
  "shield-check":
    '<path d="m12 3 8 3v6c0 4-5 8-8 9-3-1-8-5-8-9V6l8-3Z"/><path d="m8 12 3 3 5-6"/>',
  sparkles:
    '<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3ZM20 2v4m-2-2h4"/>',
  zap: '<path d="m13 2-9 12h7l-1 8 10-12h-7l1-8Z"/>',
  heart:
    '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0l-1 1-1-1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  "arrow-down": '<path d="M12 4v16m-6-6 6 6 6-6"/>',
  "arrow-right": '<path d="M4 12h16m-6-6 6 6-6 6"/>',
  "chevron-down": '<path d="m6 9 6 6 6-6"/>',
  sort: '<path d="M8 3v18m-4-4 4 4 4-4M16 21V3m-4 4 4-4 4 4"/>',
  list: '<path d="M9 5h12M9 12h12M9 19h12M3 5h.01M3 12h.01M3 19h.01"/>',
  merge: '<path d="M5 3v6c0 2 7 3 7 7v5M19 3v6c0 2-7 3-7 7m-4 1 4 4 4-4"/>',
  split:
    '<path d="M12 21v-6c0-4-7-4-7-8V3m0 0L2 6m3-3 3 3m4 9c0-4 7-4 7-8V3m-3 3 3-3 3 3"/>',
  edit: '<path d="m16 3 5 5L8 21H3v-5L16 3ZM13 6l5 5"/>',
  resize: '<path d="M8 3H3v5m0-5 7 7m6 11h5v-5m0 5-7-7M16 3h5v5M3 16v5h5"/>',
  compress:
    '<path d="m3 3 6 6m0-5v5H4m17-6-6 6m0-5v5h5M3 21l6-6m0 5v-5H4m17 6-6-6m0 5v-5h5"/>',
  convert: '<path d="M4 7h15m-4-4 4 4-4 4M20 17H5m4-4-4 4 4 4"/>',
  rotate: '<path d="M3 10a9 9 0 1 1 2 8M3 4v6h6"/>',
  crop: '<path d="M6 3v15h15M3 6h15v15"/>',
  text: '<path d="M4 7V4h16v3M12 4v17m-4 0h8"/>',
  qr: '<rect x="3" y="3" width="6" height="6" rx=".5"/><rect x="15" y="3" width="6" height="6" rx=".5"/><rect x="3" y="15" width="6" height="6" rx=".5"/><path d="M15 15h3v3h3v3h-6v-3m-3-6h9M12 3v6M3 12h6m3 3v6"/>',
  code: '<path d="m8 6-6 6 6 6m8-12 6 6-6 6M14 3l-4 18"/>',
  key: '<circle cx="8" cy="8" r="5"/><path d="m12 12 9 9m-4-4 3-3m-6 0 3-3"/>',
  ruler: '<path d="m15 3 6 6L9 21l-6-6L15 3Zm-3 3 3 3m-6 0 3 3m-6 0 3 3"/>',
  palette:
    '<path d="M12 3a9 9 0 1 0 0 18h2a2 2 0 0 0 1-3.7 2 2 0 0 1 1-3.8h2A3 3 0 0 0 21 10a9 9 0 0 0-9-7Z"/><path d="M7 10h.01M10 6.5h.01M15 7h.01M6.5 14h.01"/>',
  link: '<path d="M10 13a4 4 0 0 0 6 0l4-4a4.2 4.2 0 0 0-6-6l-2 2M14 11a4 4 0 0 0-6 0l-4 4a4.2 4.2 0 0 0 6 6l2-2"/>',
  upload:
    '<path d="M12 16V3m-5 5 5-5 5 5M4 16v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4"/>',
  download:
    '<path d="M12 3v13m-5-5 5 5 5-5M4 16v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  lock: '<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 5v2"/>',
  trash: '<path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7"/>',
  up: '<path d="m6 14 6-6 6 6"/>',
  down: '<path d="m6 10 6 6 6-6"/>',
  copy: '<rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V3H3v13h5"/>',
  plus: '<path d="M12 4v16M4 12h16"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  number: '<path d="m10 3-4 18M18 3l-4 18M4 8h17M3 16h17"/>',
  bold: '<path d="M6 3h7a4 4 0 0 1 0 8H6V3Zm0 8h8a5 5 0 0 1 0 10H6V11Z"/>',
  italic: '<path d="M19 3h-9M14 21H5M15 3 9 21"/>',
  undo: '<path d="M3 10h11a6 6 0 0 1 0 12M3 10l6-6m-6 6 6 6"/>',
};
export function icon(name, cls = "") {
  return `<svg class="icon ${cls}" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.shapes}</svg>`;
}
export function hydrateIcons(root = document) {
  root.querySelectorAll("[data-icon]").forEach((el) => {
    el.innerHTML = icon(el.dataset.icon);
  });
}
