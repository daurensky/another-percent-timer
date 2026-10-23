import { calculateDay, validSchedule } from './timer.js';
const $ = selector => document.querySelector(selector);
const dialog = $('#setup');
let schedule = { start: '12:00', end: '20:00' }, saved = false;
try {
  const stored = JSON.parse(localStorage.getItem('after-work.schedule'));
  if (stored && validSchedule(stored.start, stored.end)) { schedule = stored; saved = true; }
} catch { /* Storage can be blocked or contain an outdated value. */ }
let previousPercent = null, sandRatio = 1;
function animatePercent(value) {
  for (const selector of ['.number-base', '#percent-line', '#percent-fill']) {
    const text = $(selector);
    text.replaceChildren(document.createTextNode(String(value)));
    const suffix = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
    suffix.setAttribute('class', 'percent-sign'); suffix.textContent = '%'; text.append(suffix);
  }
  $('.percent-svg').setAttribute('aria-label', `${value}% рабочего дня осталось`);
  for (const selector of ['#percent-line', '#percent-fill']) {
    const node = $(selector); node.classList.remove('draw');
    void node.getBoundingClientRect(); node.classList.add('draw');
  }
}
function update() {
  const now = new Date(), state = calculateDay(schedule.start, schedule.end, now);
  sandRatio = state.ratio;
  $('#clock').textContent = now.toLocaleTimeString('ru-RU', { hour12: false });
  $('#day-range').textContent = `${schedule.start} — ${schedule.end} / ТВОЙ РАБОЧИЙ ДЕНЬ`;
  $('#start-label').innerHTML = `${schedule.start} <em>НАЧАЛО</em>`;
  $('#end-label').innerHTML = `<em>СВОБОДА</em> ${schedule.end}`;
  $('#remaining').innerHTML = `${state.hours}<span>Ч</span>${String(state.minutes).padStart(2, '0')}<span>М</span>`;
  $('#remaining').setAttribute('aria-label', `${state.hours} часов ${state.minutes} минут`);
  $('#progress').style.width = `${(1 - state.ratio) * 100}%`;
  $('#progress-dot').style.left = `${(1 - state.ratio) * 100}%`;
  $('#elapsed-label').textContent = state.done ? 'ТЕПЕРЬ ВРЕМЯ ДЛЯ СЕБЯ' : state.before ? 'ВСЁ НАЧНЁТСЯ В СВОЁ ВРЕМЯ' : `ПРОЙДЕНО ${Math.round((1 - state.ratio) * 100)}% ДНЯ`;
  $('#status').innerHTML = `<i class="live-dot"></i> ${state.done ? 'ДЕНЬ ЗАВЕРШЁН. ТЫ СВОБОДЕН.' : state.before ? 'ДЕНЬ ЕЩЁ НЕ НАЧАЛСЯ' : state.ratio <= .1 ? 'СВОБОДА УЖЕ БЛИЗКО' : 'ДЕНЬ ПРОДОЛЖАЕТСЯ'}`;
  document.body.classList.toggle('ending', !state.before && (state.ratio <= .1));
  if (previousPercent !== state.percent) { animatePercent(state.percent); previousPercent = state.percent; }
}
function openSettings() { $('#start').value = schedule.start; $('#end').value = schedule.end; $('#form-error').textContent = ''; dialog.showModal(); }
$('#edit').addEventListener('click', openSettings);
$('#close-dialog').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => { if (event.target === dialog) { const r = dialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close(); } });
$('#schedule-form').addEventListener('submit', event => {
  event.preventDefault();
  const start = $('#start').value, end = $('#end').value;
  if (!validSchedule(start, end)) { $('#form-error').textContent = 'Укажите разное время начала и конца дня.'; return; }
  schedule = { start, end };
  try { localStorage.setItem('after-work.schedule', JSON.stringify(schedule)); } catch { /* Timer still works for this session. */ }
  dialog.close(); update();
});
function toggleMetric() {
  const showing = $('.display').classList.toggle('show-time');
  $('#metric').setAttribute('aria-pressed', String(showing));
  $('#metric').setAttribute('aria-label', showing ? 'Показать проценты' : 'Показать оставшееся время');
}
$('#metric').addEventListener('click', toggleMetric); $('#toggle').addEventListener('click', toggleMetric);
update(); setInterval(update, 1000);
if (!saved) openSettings();

// Load WebGL independently: the timer remains functional without graphics support.
async function createHourglass() {
  const THREE = await import('./vendor/three.module.js');
  const host = $('#hourglass');
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, .1, 100); camera.position.set(0, .1, 8);
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); renderer.setClearColor(0, 0);
  host.appendChild(renderer.domElement);
  scene.add(new THREE.AmbientLight(0xc2e9a7, 2));
  const light = new THREE.DirectionalLight(0xdcffc2, 5); light.position.set(3, 4, 4); scene.add(light);
  const rim = new THREE.PointLight(0xb8ff6d, 15); rim.position.set(-2, 0, 2); scene.add(rim);
  const model = new THREE.Group(); scene.add(model); model.rotation.set(.12, -.3, -.12);
  const metal = new THREE.MeshStandardMaterial({ color: 0x778b5c, metalness: .85, roughness: .25 });
  const sand = new THREE.MeshStandardMaterial({ color: 0xc5f98b, emissive: 0x617d29, emissiveIntensity: .3, roughness: .8 });
  const glass = new THREE.MeshPhysicalMaterial({ color: 0xd7f5c2, metalness: 0, roughness: .12, transparent: true, opacity: .14, side: THREE.DoubleSide, depthWrite: false });
  const points = [];
  for (let i = 0; i <= 60; i++) {
    const y = -1.36 + i / 60 * 2.72;
    const r = .06 + .72 * Math.pow(Math.sin(Math.abs(y) / 1.36 * Math.PI / 2), 1.25);
    points.push(new THREE.Vector2(r, y));
  }
  const shell = new THREE.Mesh(new THREE.LatheGeometry(points, 64), glass); shell.renderOrder = 3; model.add(shell);
  // Fine contour lines make the glass silhouette readable against black.
  const outlineMaterial = new THREE.LineBasicMaterial({ color: 0xa8c78e, transparent: true, opacity: .35 });
  for (const angle of [0, Math.PI]) {
    const contour = points.map(p => new THREE.Vector3(Math.cos(angle) * p.x, p.y, Math.sin(angle) * p.x));
    model.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(contour), outlineMaterial));
  }
  for (const y of [-1.47, 1.47]) {
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(.94, .94, .15, 64), metal); cap.position.y = y; model.add(cap);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(.8, .025, 8, 64), sand); ring.rotation.x = Math.PI / 2; ring.position.y = y + (y > 0 ? -.09 : .09); model.add(ring);
  }
  for (let i = 0; i < 3; i++) {
    const angle = i * Math.PI * 2 / 3;
    const post = new THREE.Mesh(new THREE.CylinderGeometry(.025, .025, 2.85, 12), metal);
    post.position.set(Math.cos(angle) * .86, 0, Math.sin(angle) * .86); model.add(post);
  }
  const upper = new THREE.Mesh(new THREE.ConeGeometry(.68, 1.13, 48), sand); upper.rotation.z = Math.PI; model.add(upper);
  const lower = new THREE.Mesh(new THREE.ConeGeometry(.7, .8, 48), sand); model.add(lower);
  const count = 100, positions = new Float32Array(count * 3);
  const particles = new THREE.BufferGeometry(); particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const stream = new THREE.Points(particles, new THREE.PointsMaterial({ color: 0xdbffa3, size: .018, transparent: true, opacity: .8 })); model.add(stream);
  const resize = () => { const w = host.clientWidth, h = host.clientHeight; renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix(); };
  new ResizeObserver(resize).observe(host); resize();
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function render(time) {
    const topHeight = Math.max(.01, 1.13 * sandRatio);
    upper.scale.set(Math.max(.04, Math.sqrt(sandRatio)), topHeight / 1.13, Math.max(.04, Math.sqrt(sandRatio)));
    upper.position.y = .12 + topHeight / 2; upper.visible = sandRatio > 0;
    const bottomHeight = .05 + .8 * (1 - sandRatio);
    lower.scale.y = bottomHeight / .8; lower.position.y = -1.35 + bottomHeight / 2;
    for (let i = 0; i < count; i++) {
      const t = ((reduced ? 0 : time * .0006) + i / count) % 1;
      positions[i * 3] = Math.sin(i * 14) * .025;
      positions[i * 3 + 1] = -.02 - t * 1.25;
      positions[i * 3 + 2] = Math.cos(i * 17) * .025;
    }
    particles.attributes.position.needsUpdate = true; stream.visible = sandRatio > 0 && sandRatio < 1;
    if (!reduced) model.rotation.y = -.3 + Math.sin(time * .00015) * .16;
    renderer.render(scene, camera);
  }
  renderer.setAnimationLoop(render);
  document.addEventListener('visibilitychange', () => renderer.setAnimationLoop(document.hidden ? null : render));
}
createHourglass().catch(error => { console.warn('3D rendering unavailable:', error.message); $('#hourglass').innerHTML = '<div class="fallback-glass">⌛</div>'; });
