import { calculateDay, validSchedule } from './timer.js';
const $ = selector => document.querySelector(selector);
let schedule = { start: '12:00', end: '20:00' }, saved = false, previousPercent = null;
try {
 const stored = JSON.parse(localStorage.getItem('after-work.schedule'));
 if (stored && validSchedule(stored.start, stored.end)) { schedule = stored; saved = true; }
} catch { /* Storage may be unavailable. */ }
function animatePercent(value) {
 for (const selector of ['.number-base','#percent-line','#percent-fill']) {
  const text = $(selector); text.replaceChildren(document.createTextNode(String(value)));
  const suffix = document.createElementNS('http://www.w3.org/2000/svg','tspan'); suffix.setAttribute('class','percent-sign'); suffix.textContent='%'; text.append(suffix);
 }
 $('.percent-svg').setAttribute('aria-label',`${value}% рабочего дня осталось`);
 for (const selector of ['#percent-line','#percent-fill']) { const el=$(selector);el.classList.remove('draw');void el.getBoundingClientRect();el.classList.add('draw'); }
}
function update() {
 const now = new Date(), state = calculateDay(schedule.start,schedule.end,now);
 $('#edit').textContent=`${schedule.start} — ${schedule.end}`;
 $('#screen-clock').textContent=now.toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'});
 $('#remaining').innerHTML=`${state.hours}<span>Ч</span>${String(state.minutes).padStart(2,'0')}<span>М</span>`;
 $('#remaining').setAttribute('aria-label',`${state.hours} часов ${state.minutes} минут`);
 document.body.classList.toggle('ending',!state.before && state.ratio<=.1);
 if(previousPercent!==state.percent){animatePercent(state.percent);previousPercent=state.percent;}
}
function setSetup(open) {
 $('#setup').hidden=!open;$('#countdown').hidden=open;document.body.classList.toggle('setting-up',open);
 $('#accessible-title').textContent=open?'ANOTHER PERCENT TIMER':'ДО КОНЦА ДНЯ ОСТАЛОСЬ';
 document.dispatchEvent(new CustomEvent('timer-mode',{detail:{setup:open}}));
}
function openSettings(){ $('#start').value=schedule.start;$('#end').value=schedule.end;$('#form-error').textContent='';$('#cancel').hidden=!saved;setSetup(true); }
$('#edit').addEventListener('click',openSettings);
$('#cancel').addEventListener('click',()=>setSetup(false));
$('#schedule-form').addEventListener('submit',event=>{
 event.preventDefault();const start=$('#start').value,end=$('#end').value;
 if(!validSchedule(start,end)){$('#form-error').textContent='Начало и конец должны отличаться.';return;}
 schedule={start,end};saved=true;
 try{localStorage.setItem('after-work.schedule',JSON.stringify(schedule));}catch{/* Keep working for this session. */}
 setSetup(false);update();$('#metric').focus({preventScroll:true});
});
function toggleMetric(){const showing=$('#countdown').classList.toggle('show-time');$('#metric').setAttribute('aria-pressed',String(showing));$('#metric').setAttribute('aria-label',showing?'Показать проценты':'Показать оставшееся время');}
$('#metric').addEventListener('click',toggleMetric);$('#toggle').addEventListener('click',toggleMetric);
update();setInterval(update,1000);if(saved)setSetup(false);else openSettings();
const power=$('#power');
power.addEventListener('click',()=>{
 const off=document.body.classList.toggle('powered-off');
 power.setAttribute('aria-pressed',String(!off));
 power.setAttribute('aria-label',off?'Включить телевизор':'Выключить телевизор');
 power.title=off?'Включить телевизор':'Выключить телевизор';
 $('#screen').inert=off;$('#screen').setAttribute('aria-hidden',String(off));
 document.dispatchEvent(new CustomEvent('timer-power',{detail:{powered:!off}}));
 if(!off)update();
});
if(!matchMedia('(prefers-reduced-motion: reduce)').matches){
 addEventListener('pointermove',event=>{
  if(event.pointerType==='touch')return;
  $('#background').style.transform=`translate3d(${(event.clientX/innerWidth-.5)*6}px,${(event.clientY/innerHeight-.5)*4}px,0)`;
 },{passive:true});
 document.documentElement.addEventListener('pointerleave',()=>{$('#background').style.transform='translate3d(0,0,0)';});
}
import('./television.js').then(module=>module.createTelevision()).catch(error=>{
 console.warn('WebGL scene unavailable:',error.message);
 document.body.classList.add('fallback');$('#stage').append($('#screen'),$('#power'));
 const fit=()=>document.documentElement.style.setProperty('--fallback-scale',String(Math.min((innerWidth-50)/800,(innerHeight*.65)/600)));
 fit();addEventListener('resize',fit);
});
