const express = require('express');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = Number(process.env.PORT || 3001);
// ROOT now points to project root (parent of src)
const ROOT = path.resolve(__dirname, '..');
const SPECS_DIR = path.join(ROOT, 'cypress', 'e2e');
const REPORTS_DIR = path.join(ROOT, 'reports');
const IMAGE = process.env.CYPRESS_WORKER_IMAGE || 'cypress-demo:latest';
const DEFAULT_WORKERS = Math.max(1, Math.min(4, Number(process.env.MAX_WORKERS || 2)));
const MAX_RETRIES = 2;
const MARKER = '@@CYPRESS_DASHBOARD@@';

fs.mkdirSync(REPORTS_DIR, { recursive: true });
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(ROOT, 'public')));
app.use('/artifacts', express.static(REPORTS_DIR));

let currentRun = loadLatestRun();
const clients = new Set();

function loadLatestRun() {
  const files = fs.readdirSync(REPORTS_DIR).filter(n => /^.+\.json$/.test(n));
  const runs = files.map(name => {
    try { return JSON.parse(fs.readFileSync(path.join(REPORTS_DIR, name), 'utf8')); }
    catch { return null; }
  }).filter(Boolean);
  runs.sort((a,b) => new Date(b.startedAt || 0) - new Date(a.startedAt || 0));
  const latest = runs[0] || null;
  if (latest?.status === 'running') {
    latest.status = 'interrupted';
    latest.finishedAt = new Date().toISOString();
    latest.logs = latest.logs || [];
    latest.logs.push({ at: latest.finishedAt, workerId: null, text: 'Dashboard restarted while this run was active; run marked interrupted.' });
    saveRun(latest);
  }
  return latest;
}
function publicRun(run) {
  if (!run) return null;
  return {
    id: run.id, status: run.status, startedAt: run.startedAt, finishedAt: run.finishedAt,
    durationMs: run.finishedAt ? new Date(run.finishedAt) - new Date(run.startedAt) : Date.now() - new Date(run.startedAt),
    stats: run.stats, tests: run.tests, specs: run.specs,
    workers: (run.workers || []).map(w => ({ id:w.id, status:w.status, specPath:w.specPath, startedAt:w.startedAt, finishedAt:w.finishedAt, lastExitCode:w.lastExitCode })),
    logs: (run.logs || []).slice(-500), workerLimit: run.workerLimit, retries: run.retries
  };
}
function send(payload) { const data = `data: ${JSON.stringify(payload)}\n\n`; for (const res of clients) { try { res.write(data); } catch {} } }
function emit(type, extra = {}) { if (!currentRun) return; send({ type, run: publicRun(currentRun), ...extra }); }
function saveRun(run) { fs.mkdirSync(REPORTS_DIR, {recursive:true}); fs.writeFileSync(path.join(REPORTS_DIR, `${run.id}.json`), JSON.stringify(publicRun(run), null, 2)); }
function log(message, workerId = null) { if (!currentRun) return; currentRun.logs.push({ at:new Date().toISOString(), workerId, text:String(message) }); if (currentRun.logs.length > 2000) currentRun.logs.shift(); }
function findSpecs(dir = SPECS_DIR, relative = '') {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, {withFileTypes:true}).flatMap(entry => {
    const abs = path.join(dir, entry.name); const rel = path.posix.join(relative, entry.name);
    if (entry.isDirectory()) return findSpecs(abs, rel);
    return /\.(cy|spec)\.(js|jsx|ts|tsx)$/.test(entry.name) ? [rel] : [];
  }).sort();
}
function recalcStats() {
  const tests = currentRun.tests || [];
  currentRun.stats = {
    total: tests.length,
    passed: tests.filter(t => t.state === 'passed').length,
    failed: tests.filter(t => t.state === 'failed').length,
    pending: tests.filter(t => t.state === 'pending').length,
    flaky: tests.filter(t => t.flaky).length,
    retried: tests.filter(t => (t.attempts || []).length > 1).length
  };
}
function safeSpecName(specPath) { return specPath.replace(/[^a-zA-Z0-9_.-]/g, '_'); }
function updateSpec(specPath, patch) { const item = currentRun.specs.find(s => s.path === specPath); if (item) Object.assign(item, patch); }
function parseWorkerLine(line, worker) {
  if (!line.trim()) return;
  const index = line.indexOf(MARKER);
  if (index < 0) { log(line, worker.id); return; }
  try {
    const event = JSON.parse(line.slice(index + MARKER.length));
    if (event.type === 'test' && event.test) {
      const incoming = event.test;
      const id = `${worker.specPath}::${incoming.fullTitle || incoming.id}`;
      let test = currentRun.tests.find(t => t.id === id);
      if (!test) {
        test = { id, title:incoming.title, fullTitle:incoming.fullTitle || incoming.title, spec:worker.specPath, workerId:worker.id, state:incoming.state, durationMs:incoming.durationMs || 0, error:incoming.error || null, attempts:[], flaky:false, artifacts:[] };
        currentRun.tests.push(test);
      }
      const attemptNo = Number(incoming.attempt || 1);
      const attempt = { attempt:attemptNo, state:incoming.state, durationMs:incoming.durationMs || 0, error:incoming.error || null, finishedAt:incoming.finishedAt || new Date().toISOString() };
      const oldAttempt = test.attempts.findIndex(a => a.attempt === attemptNo);
      if (oldAttempt >= 0) test.attempts[oldAttempt] = attempt; else test.attempts.push(attempt);
      test.attempts.sort((a,b) => a.attempt - b.attempt);
      test.state = incoming.state; test.durationMs = incoming.durationMs || test.durationMs;
      test.error = incoming.state === 'failed' ? incoming.error : null;
      test.flaky = incoming.state === 'passed' && test.attempts.some(a => a.state === 'failed');
      test.workerId = worker.id;
      recalcStats(); saveRun(currentRun); emit('test-updated');
    } else if (event.type === 'retry') {
      log(`Retrying ${event.fullTitle || 'test'} (attempt ${event.attempt}) after failure: ${event.message || 'see test error'}`, worker.id);
      emit('retry');
    } else if (event.type === 'stats') { emit('stats-updated'); }
  } catch (error) { log(`Could not parse reporter event: ${error.message}`, worker.id); }
}
function collectFiles(dir, base, prefix, output=[]) {
  if (!fs.existsSync(dir)) return output;
  for (const ent of fs.readdirSync(dir, {withFileTypes:true})) {
    const abs = path.join(dir, ent.name);
    if (ent.isDirectory()) collectFiles(abs, base, prefix, output);
    else {
      const rel = path.relative(base, abs).split(path.sep).join('/');
      output.push({name:ent.name, url:`/artifacts/${currentRun.id}/${prefix}/${rel}`, path:rel});
    }
  }
  return output;
}
function attachArtifacts(worker, specPath) {
  const root = path.join(REPORTS_DIR, currentRun.id, 'artifacts', worker.id);
  const screenshotsDir = path.join(root, 'screenshots');
  const videosDir = path.join(root, 'videos');
  const screenshots = collectFiles(screenshotsDir, root, 'artifacts/' + worker.id).filter(f => f.path.startsWith('screenshots/'));
  const videos = collectFiles(videosDir, root, 'artifacts/' + worker.id).filter(f => f.path.startsWith('videos/'));
  const artifacts = [...screenshots.map(f => ({...f,type:'screenshot'})), ...videos.map(f => ({...f,type:'video'}))];
  const spec = currentRun.specs.find(s => s.path === specPath);
  if (spec) spec.artifacts = artifacts;
  for (const test of currentRun.tests.filter(t => t.spec === specPath)) {
    test.artifacts = artifacts.filter(a => a.type === 'video' || a.name.toLowerCase().includes((test.title || '').toLowerCase().slice(0,18)) || artifacts.length === 1);
    if (!test.artifacts.length && test.state === 'failed') test.artifacts = artifacts.filter(a => a.type === 'screenshot');
  }
}
function finishIfDone() {
  if (!currentRun || currentRun.status !== 'running') return;
  const active = currentRun.workers.some(w => w.status === 'running');
  const queued = currentRun.specs.some(s => s.status === 'queued');
  if (active || queued) return;
  currentRun.finishedAt = new Date().toISOString();
  currentRun.status = currentRun.specs.some(s => s.status === 'failed') || currentRun.stats.failed ? 'failed' : 'passed';
  recalcStats(); saveRun(currentRun); emit('run-finished');
}
function dispatch(worker) {
  if (!currentRun || currentRun.status !== 'running') return;
  const next = currentRun.specs.find(s => s.status === 'queued');
  if (!next) { worker.status = 'idle'; worker.specPath = null; emit('worker-updated'); finishIfDone(); return; }
  next.status = 'running'; next.startedAt = new Date().toISOString();
  worker.status = 'running'; worker.specPath = next.path; worker.startedAt = next.startedAt; worker.finishedAt = null; worker.lastExitCode = null;
  const artifactRoot = path.join(REPORTS_DIR, currentRun.id, 'artifacts', worker.id);
  const screenshotsHost = path.join(artifactRoot, 'screenshots'); const videosHost = path.join(artifactRoot, 'videos');
  fs.mkdirSync(screenshotsHost, {recursive:true}); fs.mkdirSync(videosHost, {recursive:true});
  emit('worker-updated'); log(`Starting ${next.path}`, worker.id); saveRun(currentRun);
  const args = [
    'run','--rm','--shm-size=1g','-e','FORCE_COLOR=0',
    '-v',`${screenshotsHost}:/app/cypress/screenshots`,
    '-v',`${videosHost}:/app/cypress/videos`,
    IMAGE,'npx','cypress','run','--spec',`cypress/e2e/${next.path}`,
    '--reporter','/app/cypress-dashboard-reporter.js',
    '--config',`retries=${currentRun.retries},video=true,screenshotOnRunFailure=true`
  ];
  const child = spawn('docker', args, {cwd:ROOT, stdio:['ignore','pipe','pipe']}); worker.child = child;
  let buffer = '';
  const consume = chunk => { buffer += chunk.toString(); const lines = buffer.split(/\r?\n/); buffer = lines.pop() || ''; for (const line of lines) parseWorkerLine(line, worker); };
  child.stdout.on('data', consume);
  child.stderr.on('data', consume);
  child.on('error', error => {
    log(`Could not start Docker worker: ${error.message}`, worker.id);
    next.status='failed'; next.error=error.message; next.finishedAt=new Date().toISOString();
    worker.status='idle'; worker.finishedAt=next.finishedAt; worker.lastExitCode=127; worker.child=null; saveRun(currentRun); emit('worker-updated'); dispatch(worker);
  });
  child.on('close', code => {
    if (buffer.trim()) parseWorkerLine(buffer, worker);
    worker.child=null; worker.lastExitCode=code; worker.finishedAt=new Date().toISOString(); next.finishedAt=worker.finishedAt; next.exitCode=code;
    attachArtifacts(worker, next.path);
    const hasFailedTests = currentRun.tests.some(t => t.spec === next.path && t.state === 'failed');
    next.status = code === 0 && !hasFailedTests ? 'passed' : 'failed';
    if (code !== 0 && !hasFailedTests) next.error = `Cypress worker exited with code ${code}; inspect worker logs.`;
    worker.status='idle'; log(`${next.path} finished with exit code ${code}`, worker.id); saveRun(currentRun); emit('worker-updated'); dispatch(worker);
  });
}
function startRun(workerLimit, retries) {
  const paths = findSpecs(); if (!paths.length) throw new Error(`No Cypress spec files found under ${SPECS_DIR}`);
  const id = `${new Date().toISOString().replace(/[:.]/g,'-')}-${crypto.randomBytes(3).toString('hex')}`;
  const runDir = path.join(REPORTS_DIR,id);
  fs.mkdirSync(path.join(runDir,'artifacts'),{recursive:true});
  currentRun = { id, status:'running', startedAt:new Date().toISOString(), finishedAt:null, workerLimit, retries,
    stats:{total:0,passed:0,failed:0,pending:0,flaky:0,retried:0}, tests:[],
    specs:paths.map(p=>({path:p,status:'queued',startedAt:null,finishedAt:null,exitCode:null,error:null,artifacts:[]})),
    workers:Array.from({length:Math.min(workerLimit,paths.length)},(_,i)=>({id:`worker-${i+1}`,status:'idle',specPath:null,startedAt:null,finishedAt:null,lastExitCode:null})), logs:[] };
  saveRun(currentRun); emit('run-started'); currentRun.workers.forEach(dispatch);
}
function readReport(id) {
  if (!/^[a-zA-Z0-9-]+$/.test(id)) return null;
  try { return JSON.parse(fs.readFileSync(path.join(REPORTS_DIR,`${id}.json`),'utf8')); } catch { return null; }
}
app.get('/api/events',(req,res)=>{res.setHeader('Content-Type','text/event-stream');res.setHeader('Cache-Control','no-cache');res.setHeader('Connection','keep-alive');res.flushHeaders?.();clients.add(res);res.write(`data: ${JSON.stringify({type:'snapshot',run:publicRun(currentRun)})}\n\n`);req.on('close',()=>clients.delete(res));});
app.get('/api/run',(_req,res)=>res.json(publicRun(currentRun)));
app.get('/api/specs',(_req,res)=>res.json({specs:findSpecs(),defaultWorkers:DEFAULT_WORKERS}));
app.get('/api/reports',(_req,res)=>{
  const reports=fs.readdirSync(REPORTS_DIR).filter(n=>/^.+\.json$/.test(n)).map(name=>readReport(name.slice(0,-5))).filter(Boolean)
    .sort((a,b)=>new Date(b.startedAt)-new Date(a.startedAt)).map(r=>({id:r.id,status:r.status,startedAt:r.startedAt,finishedAt:r.finishedAt,stats:r.stats,workerLimit:r.workerLimit,retries:r.retries}));
  res.json(reports);
});
app.get('/api/reports/:id',(req,res)=>{const report=readReport(req.params.id);if(!report)return res.status(404).json({error:'Report not found'});res.json(report);});
app.get('/api/compare',(req,res)=>{
  const base=readReport(String(req.query.base||''));const target=readReport(String(req.query.target||''));
  if(!base||!target)return res.status(400).json({error:'Provide valid base and target run IDs.'});
  const key=t=>`${t.spec}::${t.fullTitle||t.title}`;const b=new Map((base.tests||[]).map(t=>[key(t),t]));const n=new Map((target.tests||[]).map(t=>[key(t),t]));
  const regressions=[],fixedFailures=[],newFailures=[],addedTests=[],removedTests=[];
  for(const [k,t] of n){const old=b.get(k);if(!old){addedTests.push(t);if(t.state==='failed')newFailures.push(t);}else if(old.state!=='failed'&&t.state==='failed')regressions.push({test:t,previousState:old.state});else if(old.state==='failed'&&t.state==='passed')fixedFailures.push({test:t,previousState:old.state});}
  for(const [k,t] of b)if(!n.has(k))removedTests.push(t);
  res.json({base:{id:base.id,stats:base.stats},target:{id:target.id,stats:target.stats},regressions,fixedFailures,newFailures,addedTests,removedTests});
});
app.post('/api/run',(req,res)=>{
  if(currentRun?.status==='running')return res.status(409).json({error:'A run is already in progress.'});
  const workers=Number(req.body?.workers||DEFAULT_WORKERS);const retries=Number(req.body?.retries??1);
  if(!Number.isInteger(workers)||workers<1||workers>4)return res.status(400).json({error:'workers must be an integer between 1 and 4 for this local demo.'});
  if(!Number.isInteger(retries)||retries<0||retries>MAX_RETRIES)return res.status(400).json({error:`retries must be between 0 and ${MAX_RETRIES}.`});
  try{startRun(workers,retries);res.status(202).json({id:currentRun.id});}catch(error){res.status(400).json({error:error.message});}
});
app.listen(PORT,'0.0.0.0',()=>{console.log(`Cypress dashboard listening on http://localhost:${PORT}`);console.log(`Docker image: ${IMAGE}; workers: ${DEFAULT_WORKERS}; saved history: ${REPORTS_DIR}`);});

