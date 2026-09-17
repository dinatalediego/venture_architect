(() => {
  const cfg = window.VENTURE_CONFIG || {};
  const supabaseUrl = cfg.supabaseUrl;
  const supabaseKey = cfg.supabasePublishableKey;
  const supervisorEndpoint = cfg.supervisorEndpoint;
  const ragEndpoint = cfg.ragEndpoint;
  const state = { session:null, summary:null, metrics:[], activeSystem:null, series:{} };
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];

  if (!window.supabase || !supabaseUrl || !supabaseKey) {
    $('#supervisor-gate').textContent = 'CONFIG MISSING';
    $('#freshness-line').textContent = 'Falta Supabase URL / publishable key en config.js';
    return;
  }
  const sb = window.supabase.createClient(supabaseUrl, supabaseKey);

  function escapeHtml(v='') { return String(v).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
  function fmt(n, digits=0) { const x=Number(n); return Number.isFinite(x) ? x.toLocaleString('es-PE',{maximumFractionDigits:digits}) : '—'; }
  function shortDate(v) { if (!v) return '—'; try { return new Intl.DateTimeFormat('es-PE',{day:'2-digit',month:'short',year:'numeric'}).format(new Date(v)); } catch { return v; } }
  function setGate(text, tone='good') { const el=$('#supervisor-gate'); el.textContent=text; el.style.color=tone==='bad'?'#ff8f7e':tone==='warn'?'#f2c15d':'#a7ff4f'; }
  async function token() { const {data}=await sb.auth.getSession(); state.session=data.session; return data.session?.access_token || null; }
  async function api(url, options={}) {
    const access = await token();
    if (!access) throw new Error('AUTH_REQUIRED');
    const res = await fetch(url,{...options,headers:{apikey:supabaseKey,Authorization:`Bearer ${access}`,'Content-Type':'application/json',...(options.headers||{})}});
    const body = await res.json().catch(()=>({}));
    if (!res.ok) throw new Error(body.detail || body.error || `HTTP_${res.status}`);
    return body;
  }

  function renderSystems() {
    const systems=state.summary?.registry?.systems || [];
    $('#system-list').innerHTML=systems.map(s=>`<button class="system-button ${state.activeSystem===s.id?'active':''}" data-system="${escapeHtml(s.id)}"><b>${escapeHtml(s.label)}</b><span>${escapeHtml(s.family)} · ${escapeHtml(s.gate)}</span></button>`).join('') || '<div class="skeleton">Sin sistemas registrados.</div>';
    $$('.system-button').forEach(b=>b.addEventListener('click',()=>{state.activeSystem=b.dataset.system;renderSystems();renderDatasets();renderGates();}));
  }
  function renderDatasets() {
    let rows=state.summary?.registry?.datasets || [];
    if (state.activeSystem) rows=rows.filter(d=>d.system_id===state.activeSystem);
    $('#dataset-list').innerHTML=rows.map(d=>`<div class="dataset-card"><div><b>${escapeHtml(d.label)}</b><p>${escapeHtml(d.dividend)}</p><code>${escapeHtml(d.grain)} · ${escapeHtml(d.freshness_slo||'sin SLO')}</code></div><span class="runtime ${escapeHtml(d.runtime_mode)}">${escapeHtml(d.runtime_mode)}</span></div>`).join('') || '<p class="muted">No hay datasets para este filtro.</p>';
  }
  function renderKpis() {
    const s=state.summary;
    const systems=s?.registry?.systems?.length || 0;
    const datasets=s?.registry?.datasets?.length || 0;
    const connected=(s?.registry?.datasets||[]).filter(d=>d.runtime_mode==='connected').length;
    const cards=[['Sistemas',systems,'registrados'],['Datasets',datasets,'con contrato'],['Conectados',connected,'runtime'],['Model runs',0,'evidencia MLOps'],['RAG turns','live','evaluables']];
    $('#kpi-grid').innerHTML=cards.map(c=>`<article><small>${c[0]}</small><strong>${c[1]}</strong><span>${c[2]}</span></article>`).join('');
  }
  function renderGates() {
    let systems=state.summary?.registry?.systems || [];
    if(state.activeSystem) systems=systems.filter(x=>x.id===state.activeSystem);
    const runtime=state.summary?.runtime || {};
    $('#gate-table').innerHTML=systems.map(s=>{
      const rt=runtime[s.id] || runtime[s.id==='revenue_intelligence'?'revenue_intelligence':s.id] || {};
      const status=rt.status || s.status_detail?.runtime || 'registry';
      return `<div class="gate-row"><b>${escapeHtml(s.label)}</b><span>${escapeHtml(s.gate)}</span><span>${escapeHtml(status)}</span><span>${escapeHtml(s.source_ref||'—')}</span></div>`;
    }).join('') || '<p class="muted">Sin sistemas.</p>';
  }
  function renderSummary() {
    renderSystems(); renderDatasets(); renderKpis(); renderGates();
    const g=state.summary?.generated_at;
    $('#freshness-line').textContent=g?`Snapshot supervisor: ${shortDate(g)}`:'Sin snapshot';
    setGate('TRACEABLE SUPERVISION');
  }

  function lineChart(rows, xKey, yKey, formatY=(v)=>fmt(v,3)) {
    const valid=rows.map(r=>({x:r[xKey],y:Number(r[yKey])})).filter(r=>Number.isFinite(r.y));
    if(valid.length<2) return '<div class="empty-chart">No hay suficientes observaciones.</div>';
    const w=780,h=250,p=28; const ys=valid.map(r=>r.y),min=Math.min(...ys),max=Math.max(...ys); const span=max-min||1;
    const pts=valid.map((r,i)=>{const x=p+(i/(valid.length-1))*(w-2*p);const y=h-p-((r.y-min)/span)*(h-2*p);return `${x.toFixed(1)},${y.toFixed(1)}`;}).join(' ');
    const last=valid.at(-1);
    return `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="Serie temporal"><line x1="${p}" y1="${h-p}" x2="${w-p}" y2="${h-p}" stroke="#293028"/><line x1="${p}" y1="${p}" x2="${p}" y2="${h-p}" stroke="#293028"/><polyline points="${pts}" fill="none" stroke="#a7ff4f" stroke-width="2.3" vector-effect="non-scaling-stroke"/><circle cx="${pts.split(' ').at(-1).split(',')[0]}" cy="${pts.split(' ').at(-1).split(',')[1]}" r="4" fill="#a7ff4f"/><text x="${p}" y="18" fill="#7f897a" font-size="10">max ${escapeHtml(formatY(max))}</text><text x="${p}" y="${h-7}" fill="#7f897a" font-size="10">min ${escapeHtml(formatY(min))}</text><text x="${w-p}" y="18" text-anchor="end" fill="#a7ff4f" font-size="11">${escapeHtml(formatY(last.y))}</text></svg>`;
  }

  async function loadView(view) {
    if(view==='fx_series') {
      const data=await api(`${supervisorEndpoint}?view=fx_series`); state.series.fx=data;
      $('#fx-chart').innerHTML=lineChart(data.rows||[],'rate_date','rate');
      const rows=data.rows||[]; $('#fx-meta').innerHTML=`<span>${fmt(rows.length)} observaciones visibles</span><span>${escapeHtml(data.evidence?.snapshot_key||'')}</span>`;
    }
    if(view==='revenue_daily') {
      const data=await api(`${supervisorEndpoint}?view=revenue_daily`); state.series.revenue=data;
      $('#revenue-chart').innerHTML=lineChart(data.daily||[],'date','count',v=>fmt(v));
      const top=(data.event_counts||[]).slice(0,3).map(x=>`${escapeHtml(x.event_name)} ${fmt(x.count)}`).join(' · ');
      $('#revenue-meta').innerHTML=`<span>${top||'sin eventos'}</span><span>${escapeHtml(data.evidence?.snapshot_key||'')}</span>`;
    }
    if(view==='metrics') {
      const data=await api(`${supervisorEndpoint}?view=metrics`); state.metrics=data.rows||[]; renderMetrics();
    }
  }

  function renderMetrics(){
    $('#metric-table').innerHTML=state.metrics.map(m=>`<div class="metric-row-ido"><b>${escapeHtml(m.label)}</b><span>${escapeHtml(m.family)}</span><span>${escapeHtml(m.status)}</span><code>${escapeHtml(m.formula||m.time_basis||'definition contract')}</code></div>`).join('') || '<p class="muted">No hay metric contracts registrados.</p>';
  }

  function describeFx() {
    const rows=state.series.fx?.rows||[]; if(rows.length<2) return null;
    const vals=rows.map(r=>Number(r.rate)).filter(Number.isFinite); const first=vals[0],last=vals.at(-1); const change=((last/first)-1)*100;
    const recent=vals.slice(-20); const avg=recent.reduce((a,b)=>a+b,0)/recent.length; const sd=Math.sqrt(recent.reduce((s,x)=>s+(x-avg)**2,0)/Math.max(1,recent.length-1));
    return {n:vals.length,first,last,change,avg,sd,snapshot:state.series.fx.evidence?.snapshot_key};
  }
  function describeRevenue() {
    const daily=state.series.revenue?.daily||[]; if(!daily.length) return null;
    const total=daily.reduce((s,x)=>s+Number(x.count||0),0); const last7=daily.slice(-7).reduce((s,x)=>s+Number(x.count||0),0); const prev7=daily.slice(-14,-7).reduce((s,x)=>s+Number(x.count||0),0);
    return {days:daily.length,total,last7,prev7,delta:prev7?((last7/prev7)-1)*100:null,snapshot:state.series.revenue.evidence?.snapshot_key};
  }
  async function runResearch(){
    const dataset=$('#research-dataset').value; const q=$('#research-question').value.trim(); const out=$('#research-output'); out.innerHTML='<p class="muted">Ejecutando sobre snapshot trazable…</p>';
    try{
      if(dataset==='usdpen' && !state.series.fx) await loadView('fx_series');
      if(dataset==='venture_funnel' && !state.series.revenue) await loadView('revenue_daily');
      if(dataset==='usdpen'){
        const d=describeFx(); if(!d) throw new Error('No hay observaciones suficientes');
        out.innerHTML=`<h3>Descriptivo reproducible</h3><p><b>Pregunta:</b> ${escapeHtml(q)}</p><ul><li>N = ${fmt(d.n)} observaciones.</li><li>Primera tasa visible: ${fmt(d.first,4)}; última: ${fmt(d.last,4)}.</li><li>Cambio entre extremos visibles: ${fmt(d.change,2)}%.</li><li>Media últimas 20: ${fmt(d.avg,4)}; desviación estándar muestral: ${fmt(d.sd,4)}.</li></ul><p><b>Snapshot:</b> <code>${escapeHtml(d.snapshot||'')}</code></p><p class="muted">Interpretación: descriptiva, no causal. La decisión posterior requiere coste efectivo, horizonte y benchmark.</p>`;
      } else if(dataset==='venture_funnel'){
        const d=describeRevenue(); if(!d) throw new Error('No hay eventos suficientes');
        out.innerHTML=`<h3>Activity diagnostic</h3><p><b>Pregunta:</b> ${escapeHtml(q)}</p><ul><li>${fmt(d.total)} eventos en ${fmt(d.days)} días visibles.</li><li>Últimos 7 días: ${fmt(d.last7)} eventos.</li><li>7 días previos: ${fmt(d.prev7)} eventos.</li><li>Variación: ${d.delta==null?'sin baseline suficiente':fmt(d.delta,1)+'%'}.</li></ul><p><b>Snapshot:</b> <code>${escapeHtml(d.snapshot||'')}</code></p><p class="muted">Esto mide actividad capturada, no revenue causal. Para afirmar impacto se necesita vínculo decisión→acción→outcome.</p>`;
      } else {
        out.innerHTML='<div class="error-box">MEDALLIO está registrado como fuente externa/local. El notebook no inventa filas: falta conectar su adapter de lectura al supervisor.</div>';
      }
    }catch(e){out.innerHTML=`<div class="error-box">${escapeHtml(e.message)}</div>`;}
  }

  async function askRag(question){
    return api(ragEndpoint,{method:'POST',body:JSON.stringify({question})});
  }
  function appendMessage(kind,text){const d=document.createElement('div');d.className=`rag-message ${kind}`;d.innerHTML=`<b>${kind==='user'?'TÚ':'IDO'}</b><p>${escapeHtml(text)}</p>`;$('#rag-log').appendChild(d);$('#rag-log').scrollTop=$('#rag-log').scrollHeight;}
  function renderRagTrace(data){
    $('#rag-evidence').innerHTML=(data.evidence||[]).map(e=>`<div class="evidence-item"><b>${escapeHtml(e.ref)} · ${escapeHtml(e.kind)}</b><p>${escapeHtml(e.excerpt)}</p></div>`).join('')||'<p class="muted">Sin evidencia recuperada: abstención correcta.</p>';
    const q=data.quality||{}; $('#rag-quality').innerHTML=[['Gate',q.production_gate],['Grounded',fmt(q.grounded_score,2)],['Citations',fmt(q.citation_coverage,2)],['Completeness',fmt(q.completeness_score,2)],['Retriever',q.retrieval_version],['Generator',q.generator]].map(([a,b])=>`<span>${escapeHtml(a)}<b>${escapeHtml(b??'—')}</b></span>`).join('');
  }

  async function loadAll(){
    try{
      setGate('LOADING…','warn'); state.summary=await api(`${supervisorEndpoint}?view=summary`); renderSummary();
      await Promise.allSettled([loadView('fx_series'),loadView('revenue_daily'),loadView('metrics')]);
    }catch(e){setGate(e.message==='AUTH_REQUIRED'?'AUTH REQUIRED':'SUPERVISOR ERROR','bad');$('#freshness-line').textContent=e.message;}
  }

  async function refreshAuth(){
    const {data}=await sb.auth.getSession(); state.session=data.session;
    const btn=$('#auth-button'),label=$('#auth-state');
    if(state.session){label.textContent=state.session.user.email||'Sesión activa';btn.textContent='Salir';btn.onclick=async()=>{await sb.auth.signOut();location.reload();};loadAll();}
    else{label.textContent='Sin sesión';btn.textContent='Entrar con Google';btn.onclick=()=>sb.auth.signInWithOAuth({provider:'google',options:{redirectTo:location.href.split('#')[0]}});setGate('AUTH REQUIRED','warn');}
  }

  $$('.ido-tabs button').forEach(b=>b.addEventListener('click',()=>{$$('.ido-tabs button').forEach(x=>x.classList.remove('active'));b.classList.add('active');$$('.ido-tab').forEach(x=>x.classList.remove('active'));$(`#tab-${b.dataset.tab}`).classList.add('active');}));
  $$('[data-load]').forEach(b=>b.addEventListener('click',()=>loadView(b.dataset.load).catch(e=>alert(e.message))));
  $('#run-research').addEventListener('click',runResearch);
  $('#rag-form').addEventListener('submit',async e=>{e.preventDefault();const q=$('#rag-question').value.trim();if(!q)return;appendMessage('user',q);$('#rag-question').value='';appendMessage('assistant','Consultando corpus, provenance y gates…');const pending=$('#rag-log').lastElementChild;try{const data=await askRag(q);pending.remove();appendMessage('assistant',data.answer||'Sin respuesta.');renderRagTrace(data);}catch(err){pending.remove();appendMessage('assistant',`No pude responder de forma trazable: ${err.message}`);}});
  sb.auth.onAuthStateChange(()=>setTimeout(refreshAuth,0));
  refreshAuth();
})();