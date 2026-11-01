// The landing and privacy pages in the reader's language: the one chosen in the app on this phone, else the phone's own.
// Phrases come from the app's i18n/<lang>.json, keyed by the English: an element marked data-t is looked up by its text
// (or by its HTML, when it holds a link or other markup), and every aria-label by itself.
const UI={en:'English',hi:'हिंदी',ta:'தமிழ்',ml:'മലയാളം',te:'తెలుగు'};
const LG=(l=>UI[l]?l:'en')(localStorage.getItem('tolle-lang')||navigator.language.slice(0,2)),LOC=LG==='en'?'en-US':LG+'-IN';
let D={s:{},books:[]};
const tr=(k,a=[])=>(D.s[k]??k).replace(/\{(\d)\}/g,(_,i)=>a[i]);
const L=(s,...a)=>tr(s.reduce((k,x,i)=>k+`{${i-1}}`+x),a); // L`${n} books`: looked up as "{0} books"
const num=n=>n.toLocaleString(LOC),plural=(n,w)=>tr(n==1?`{0} ${w}`:`{0} ${w}s`,[num(n)]);
const ready=(LG==='en'?Promise.resolve():fetch(`i18n/${LG}.json`).then(r=>r.json()).then(j=>{D=j}).catch(()=>{})).then(()=>{ // offline before it was ever fetched: English
  document.documentElement.lang=D.books.length?LG:'en';
  for(const e of document.querySelectorAll('[data-t]'))e.children.length?e.innerHTML=tr(e.innerHTML):e.textContent=tr(e.textContent);
  for(const e of document.querySelectorAll('[aria-label]'))e.ariaLabel=tr(e.ariaLabel);
  for(const e of document.querySelectorAll('[data-b]'))e.textContent=e.textContent.replace(/^.*?(?=( [\d:]+)?$)/,D.books[e.dataset.b]??'$&'); // a book's name, its chapter kept
});
