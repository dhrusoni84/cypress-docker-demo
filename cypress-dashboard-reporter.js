const MARKER = '@@CYPRESS_DASHBOARD@@';
function emit(payload) { process.stdout.write(`${MARKER}${JSON.stringify(payload)}\n`); }
function DashboardReporter(runner) {
  const tests = new Map();
  function publish(test, state, error) {
    const fullTitle = test.fullTitle();
    const currentRetry = typeof test.currentRetry === 'function' ? test.currentRetry() : 0;
    const item = { id:fullTitle, title:test.title, fullTitle, state, attempt:currentRetry+1,
      durationMs:test.duration||0, file:test.file||'', error:error?{message:error.message||String(error),stack:error.stack||''}:null,
      finishedAt:new Date().toISOString() };
    tests.set(`${fullTitle}#${item.attempt}`,item);
    emit({type:'test',test:item});
  }
  runner.on('pass',test=>publish(test,'passed'));
  runner.on('fail',(test,error)=>publish(test,'failed',error));
  runner.on('pending',test=>publish(test,'pending'));
  runner.on('retry',(test,error)=>emit({type:'retry',fullTitle:test.fullTitle(),attempt:(typeof test.currentRetry==='function'?test.currentRetry():0)+1,message:error?.message||''}));
  runner.on('end',()=>{
    const all=[...tests.values()];
    emit({type:'stats',stats:{total:new Set(all.map(t=>t.fullTitle)).size,attempts:all.length,passed:all.filter(t=>t.state==='passed').length,failed:all.filter(t=>t.state==='failed').length,pending:all.filter(t=>t.state==='pending').length}});
  });
}
module.exports=DashboardReporter;
