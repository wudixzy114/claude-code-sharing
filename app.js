// ---------- slide navigation, notes, scaling ----------
const slides = [...document.querySelectorAll('.slide')];
let index = 0;
const counter = document.getElementById('counter');
const notes = document.getElementById('notes');
const noteText = document.getElementById('note-text');

function scale(){
  const stage = document.getElementById('stage');
  const s = Math.min(window.innerWidth/1600, window.innerHeight/900);
  slides.forEach(slide => { slide.style.transform = 'scale('+s+')'; });
  stage.style.width = window.innerWidth+'px';
  stage.style.height = window.innerHeight+'px';
}

function show(n){
  index = (n + slides.length) % slides.length;
  slides.forEach((slide,i) => slide.classList.toggle('active', i===index));
  counter.textContent = index===0 ? '封面' : index+' / '+(slides.length-1);
  noteText.textContent = slides[index].dataset.note || '';
  history.replaceState(null,'','#'+(index+1));
  // let per-slide animations reset when the slide comes into view
  if (window.SlideAnim) window.SlideAnim.onShow(index);
}

function toggleNotes(){ notes.classList.toggle('open'); }

// ---------- 聚光灯：高亮鼠标所在范围 ----------
const spotlight = document.getElementById('spotlight');
let spotOn = false;
function setSpot(on){
  spotOn = on;
  spotlight.classList.toggle('on', spotOn);
  document.body.classList.toggle('spot', spotOn);
  document.getElementById('spot-btn').classList.toggle('on', spotOn);
}
function toggleSpot(){ setSpot(!spotOn); }
document.addEventListener('pointermove', e => {
  spotlight.style.left = e.clientX + 'px';
  spotlight.style.top = e.clientY + 'px';
});
document.getElementById('spot-btn').addEventListener('click', toggleSpot);

document.getElementById('prev').addEventListener('click', () => show(index-1));
document.getElementById('next').addEventListener('click', () => show(index+1));
document.getElementById('notes-btn').addEventListener('click', toggleNotes);
document.getElementById('full').addEventListener('click',
  () => document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen());

document.addEventListener('keydown', e => {
  // don't hijack arrows when focus is on a demo button
  const tag = (e.target.tagName || '').toLowerCase();
  if (['ArrowRight',' ','PageDown'].includes(e.key)) { e.preventDefault(); show(index+1); }
  if (['ArrowLeft','PageUp'].includes(e.key)) { e.preventDefault(); show(index-1); }
  if (e.key === 'Home') show(0);
  if (e.key === 'End') show(slides.length-1);
  if (e.key.toLowerCase() === 'n') toggleNotes();
  if (e.key.toLowerCase() === 'h') toggleSpot();
  if (e.key.toLowerCase() === 'f') document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen();
});

window.addEventListener('resize', scale);

if (window.SlideAnim) window.SlideAnim.init();

const hash = Number(location.hash.slice(1));
show(Number.isInteger(hash) && hash>0 && hash<=slides.length ? hash-1 : 0);
scale();
