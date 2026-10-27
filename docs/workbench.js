/* Interactive explanations only. This page never calls project backends. */
const body = document.body;
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
let motionEnabled = !motionPreference.matches;
const motionButton = document.querySelector('.motion-toggle');
function updateMotion() {
  body.dataset.motion = motionEnabled && !document.hidden ? 'running' : 'paused';
  motionButton.setAttribute('aria-pressed', String(motionEnabled));
  motionButton.setAttribute('aria-label', motionEnabled ? 'Pause motion' : 'Enable motion');
  motionButton.querySelector('.motion-icon').textContent = motionEnabled ? 'Ⅱ' : '▷';
}
motionButton.hidden = false;
motionButton.addEventListener('click', () => {motionEnabled = !motionEnabled; updateMotion();});
motionPreference.addEventListener('change', event => {motionEnabled = !event.matches; updateMotion();});
document.addEventListener('visibilitychange', updateMotion);
updateMotion();
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    entry.target.classList.toggle('in-view', entry.isIntersecting);
    if (entry.isIntersecting) entry.target.classList.add('visible');
  }), {threshold:0.1});
  document.querySelectorAll('.reveal, .motion-scene').forEach(element => observer.observe(element));
  body.classList.add('js-enabled');
} else {
  document.querySelectorAll('.motion-scene').forEach(element => element.classList.add('in-view'));
  document.querySelectorAll('.reveal').forEach(element => element.classList.add('visible'));
  body.classList.add('js-enabled');
}

const benchProjects = {skillforge:'A checked repair becomes a reusable skill.',ohmni:'A measurement becomes a testable circuit hypothesis.',homehub:'Two Linux nodes. Durable state. Deliberate recovery.',scholarsafe:'Student housing, roommates, and the trust between them.'};
document.querySelectorAll('[data-bench]').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('[data-bench]').forEach(node => node.setAttribute('aria-pressed',String(node === button)));
  document.querySelector('#bench-description').textContent = benchProjects[button.dataset.bench];
  const link = document.querySelector('#bench-link');
  link.href = '#project-' + button.dataset.bench;
  link.setAttribute('aria-label','Explore ' + button.querySelector('strong').textContent);
}));

const forgeStages = [
  {label:'01 / INVESTIGATE',title:'A new problem. A little spark.',description:'The local model reads the incident and proposes a bounded repair.',sprite:'investigating'},
  {label:'02 / VERIFY',title:'A fix has to earn its place.',description:'Independent code, replay, and hidden tests check what the model produced.',sprite:'verifying'},
  {label:'03 / REMEMBER',title:'Checked. Approved. Remembered.',description:'A person promotes the skill on the host. Its files are pinned to a version.',sprite:'verified'},
  {label:'04 / REUSE',title:'The next one takes the short path.',description:'Compatible incident: reuse checked code. Incompatible lookalike: refuse.',sprite:'building'}
];
let forgeStep=0, forgeLastChange=Date.now(), forgeManual=false;
function setForgeStage(index,userInitiated=false) {
  forgeStep=index; forgeLastChange=Date.now();
  if (userInitiated) forgeManual=true;
  const stage=forgeStages[index];
  document.querySelector('.forge-message').setAttribute('aria-live',userInitiated?'polite':'off');
  document.querySelector('#forge-step').textContent=stage.label;
  document.querySelector('#forge-title').textContent=stage.title;
  document.querySelector('#forge-description').textContent=stage.description;
  document.querySelectorAll('[data-forge-step]').forEach(button => button.setAttribute('aria-pressed',String(Number(button.dataset.forgeStep) === index)));
}
document.querySelectorAll('[data-forge-step]').forEach(button => button.addEventListener('click',() => setForgeStage(Number(button.dataset.forgeStep),true)));
const emberCanvas=document.querySelector('#ember-canvas'), emberData=window.emberFrames;
let spriteFrame=0, spriteLastChange=0, lastSpriteState='', emberContext=null;
if (emberData && (emberContext=emberCanvas.getContext('2d'))) {
  emberCanvas.hidden=false;
  document.querySelector('.ember-static').hidden=true;
}
function drawEmber(now) {
  if (!emberContext) return;
  const spriteState=motionEnabled?forgeStages[forgeStep].sprite:'idle';
  const state=emberData.states[spriteState];
  if (spriteState !== lastSpriteState) {spriteFrame=0;lastSpriteState=spriteState;spriteLastChange=0;}
  if (motionEnabled && now-spriteLastChange >= state.ms) {spriteFrame=(spriteFrame+1)%state.frames.length;spriteLastChange=now;}
  if (!motionEnabled) spriteFrame=0;
  emberContext.clearRect(0,0,emberData.width,emberData.height);
  state.frames[spriteFrame].forEach(run => {emberContext.fillStyle=run.c;emberContext.fillRect(run.x,run.y,run.w,1);});
}
drawEmber(Date.now());
const forgeScene=document.querySelector('.forge-scene');
setInterval(() => {
  if (document.hidden || !forgeScene.classList.contains('in-view')) return;
  const now=Date.now();
  if (motionEnabled && !forgeManual && now-forgeLastChange>6500) setForgeStage((forgeStep+1)%forgeStages.length);
  drawEmber(now);
},150);

const circuitButton=document.querySelector('#circuit-toggle');
let circuitFrame=0;
let circuitVoltage=2.5;
function showCircuitVoltage(value) {
  circuitVoltage=value;
  document.querySelector('#circuit-output').textContent=value.toFixed(3)+' V';
}
function transitionCircuitVoltage(target) {
  cancelAnimationFrame(circuitFrame);
  const start=circuitVoltage, started=performance.now();
  if (!motionEnabled || document.hidden) {showCircuitVoltage(target);return;}
  function frame(now) {
    const progress=motionEnabled?Math.min((now-started)/650,1):1;
    const eased=1-Math.pow(1-progress,3);
    showCircuitVoltage(start+(target-start)*eased);
    if(progress<1) circuitFrame=requestAnimationFrame(frame);
  }
  circuitFrame=requestAnimationFrame(frame);
}
circuitButton.hidden=false;
circuitButton.addEventListener('click',() => {
  const mismatch=circuitButton.getAttribute('aria-pressed') !== 'true';
  const lowerResistance=mismatch?1000:10000;
  const voltage=5*lowerResistance/(10000+lowerResistance);
  circuitButton.setAttribute('aria-pressed',String(mismatch));
  const scene=document.querySelector('.circuit-scene');
  scene.dataset.mismatch=String(mismatch);
  scene.style.setProperty('--voltage',(voltage/5*100)+'%');
  document.querySelector('#r2-label').textContent=mismatch?'R2 · 1 kΩ':'R2 · 10 kΩ';
  transitionCircuitVoltage(voltage);
  document.querySelector('#circuit-state').textContent=mismatch?'The drawing still expects 2.500 V. A 1 kΩ R2 would produce 0.455 V — one testable explanation for the mismatch.':'Two 10 kΩ resistors divide the 5 V supply equally.';
  circuitButton.firstChild.textContent=mismatch?'Restore the 10 kΩ resistor ':'Swap R2 to 1 kΩ ';
});
const hubModes={
  execution:{label:'01 / BOUNDED EXECUTION',title:'A worker gets a boundary.',copy:'Sessions, leases, and cancellation are owned by the server. Tool access stays bounded.'},
  recovery:{label:'02 / EXPLICIT RECOVERY',title:'A timeout is not a retry permit.',copy:'Session fencing and durable attempt history preserve uncertainty. Recovery is explicit; lease expiry never grants replay authority.'},
  releases:{label:'03 / RELEASE CONTROL',title:'A green build is one checkpoint.',copy:'An exact candidate is validated, frozen, and staged. Promotion and rollback remain explicit decisions; advanced production execution is still gated.'}
};
document.querySelectorAll('[data-hub-mode]').forEach(button=>{
  if(button.tagName!=='BUTTON') return;
  button.addEventListener('click',()=>{
    const mode=button.dataset.hubMode;
    document.querySelectorAll('.hub-modes button').forEach(node=>node.setAttribute('aria-pressed',String(node===button)));
    document.querySelector('.hub-scene').dataset.hubMode=mode;
    document.querySelector('#hub-detail-label').textContent=hubModes[mode].label;
    document.querySelector('#hub-detail-title').textContent=hubModes[mode].title;
    document.querySelector('#hub-detail-copy').textContent=hubModes[mode].copy;
  });
});
const deviceLayers={
  interface:{title:'Built to run\nclose to the metal.',description:'Rust / Slint renders directly through LinuxKMS. Touch navigation and boot recovery are physically validated.'},
  control:{title:'A small daemon.\nA clear boundary.',description:'cyberdeckd owns the control plane. A versioned, read-only local socket carries status to the interface.'},
  fpga:{title:'Control, down\nto the clock tick.',description:'SystemVerilog models tach capture, PI control, PWM, and a watchdog. The cooling core is tested in simulation.'}
};
document.querySelectorAll('[data-device-layer]').forEach(button => button.addEventListener('click',() => {
  const layer=button.dataset.deviceLayer;
  document.querySelectorAll('[data-device-layer]').forEach(node => node.setAttribute('aria-pressed',String(node===button)));
  document.querySelector('.device-scene').dataset.layer=layer;
  document.querySelector('#device-screen-title').innerText=deviceLayers[layer].title;
  document.querySelector('#device-description').textContent=deviceLayers[layer].description;
}));

const projectSearch=document.querySelector('#project-search'), projectRows=[...document.querySelectorAll('.project-row')], filters=[...document.querySelectorAll('[data-filter]')];
let category='all';
function filterProjects() {
  const query=projectSearch.value.trim().toLowerCase();
  let count=0;
  projectRows.forEach(row => {
    const matches=(category==='all'||row.dataset.category===category)&&(row.textContent+' '+row.dataset.search).toLowerCase().includes(query);
    row.hidden=!matches;
    if (matches) count++;
  });
  document.querySelector('#project-count').textContent=`${count} of ${projectRows.length} builds`;
  document.querySelector('.project-empty').hidden=count!==0;
  filters.forEach(button => button.setAttribute('aria-pressed',String(button.dataset.filter===category)));
}
function revealLinkedProject() {
  const target=document.getElementById(location.hash.slice(1));
  if (target && projectRows.includes(target) && target.hidden) {category='all';projectSearch.value='';filterProjects();target.scrollIntoView();}
}
filters.forEach(button => button.addEventListener('click',() => {category=button.dataset.filter;filterProjects();}));
projectSearch.addEventListener('input',filterProjects);
window.addEventListener('hashchange',revealLinkedProject);
document.querySelector('.work-controls').hidden=false;
filterProjects();revealLinkedProject();
document.querySelectorAll('[data-open-dialog]').forEach(button => button.addEventListener('click',() => document.getElementById(button.dataset.openDialog).showModal()));
document.querySelectorAll('dialog').forEach(dialog => dialog.querySelector('.dialog-close').addEventListener('click',() => dialog.close()));
