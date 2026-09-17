import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' } });
}
const stop = new Set(['que','como','para','por','con','del','las','los','una','uno','este','esta','esto','hay','mis','más','mas','the','and','from','what','where','when']);
function tokens(q: string) { return [...new Set(q.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9_\s-]/g,' ').split(/\s+/).filter(x => x.length > 2 && !stop.has(x)))].slice(0, 12); }
function compact(value: unknown, max = 900) { const s = typeof value === 'string' ? value : JSON.stringify(value); return s.length > max ? s.slice(0, max) + '…' : s; }

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !anonKey || !serviceKey) return json({ error: 'server_configuration_missing' }, 500);
  const authorization = req.headers.get('Authorization') ?? '';
  if (!authorization.startsWith('Bearer ')) return json({ error: 'authentication_required' }, 401);
  const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authorization } }, auth: { persistSession: false, autoRefreshToken: false } });
  const { data: authData, error: authError } = await userClient.auth.getUser();
  if (authError || !authData.user) return json({ error: 'invalid_session' }, 401);
  const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: supervisor } = await admin.from('ido_supervisors').select('role,active').eq('user_id', authData.user.id).eq('active', true).maybeSingle();
  if (!supervisor) return json({ error: 'supervisor_access_required' }, 403);

  let body: { question?: string };
  try { body = await req.json(); } catch { return json({ error: 'invalid_json' }, 400); }
  const question = String(body.question ?? '').trim();
  if (question.length < 3 || question.length > 2000) return json({ error: 'question_length_invalid' }, 400);
  const ts = tokens(question);

  const [systemsR, datasetsR, metricsR, modelsR, decisionsR, evidenceR] = await Promise.all([
    admin.from('ido_systems').select('id,label,family,source_ref,gate,status_detail').order('label'),
    admin.from('ido_datasets').select('id,system_id,label,grain,freshness_slo,sensitivity,dividend,runtime_mode,metadata').order('label'),
    admin.from('ido_metric_definitions').select('metric_id,version,label,family,formula,time_basis,status,definition').limit(100),
    admin.from('ido_model_runs').select('id,system_id,model_name,model_version,training_snapshot_key,feature_version,stage,metrics,gates,created_at').order('created_at',{ascending:false}).limit(30),
    admin.from('ido_decision_outcome_links').select('id,system_id,decision_ref,action_ref,outcome_ref,evidence_refs,expected_effect,observed_effect,lesson,created_at').order('created_at',{ascending:false}).limit(40),
    admin.from('ido_evidence_objects').select('id,evidence_type,system_id,dataset_id,snapshot_key,source_ref,occurred_at,payload').order('occurred_at',{ascending:false}).limit(120),
  ]);
  for (const r of [systemsR,datasetsR,metricsR,modelsR,decisionsR,evidenceR]) if (r.error) return json({ error:'retrieval_failed', detail:r.error.message },500);

  const candidates = [
    ...(systemsR.data ?? []).map(x => ({ kind:'system', id:x.id, text:`${x.label} ${x.family} ${x.source_ref ?? ''} ${x.gate} ${JSON.stringify(x.status_detail)}`, payload:x })),
    ...(datasetsR.data ?? []).map(x => ({ kind:'dataset', id:x.id, text:`${x.label} ${x.system_id} ${x.grain} ${x.freshness_slo ?? ''} ${x.dividend} ${JSON.stringify(x.metadata)}`, payload:x })),
    ...(metricsR.data ?? []).map(x => ({ kind:'metric', id:`${x.metric_id}@${x.version}`, text:`${x.label} ${x.family} ${x.formula ?? ''} ${x.time_basis ?? ''} ${x.status} ${JSON.stringify(x.definition)}`, payload:x })),
    ...(modelsR.data ?? []).map(x => ({ kind:'model_run', id:x.id, text:`${x.system_id ?? ''} ${x.model_name} ${x.model_version} ${x.stage} ${JSON.stringify(x.metrics)} ${JSON.stringify(x.gates)}`, payload:x })),
    ...(decisionsR.data ?? []).map(x => ({ kind:'decision_outcome', id:x.id, text:`${x.system_id ?? ''} ${x.decision_ref ?? ''} ${x.action_ref ?? ''} ${x.outcome_ref ?? ''} ${x.lesson ?? ''} ${JSON.stringify(x.expected_effect)} ${JSON.stringify(x.observed_effect)}`, payload:x })),
    ...(evidenceR.data ?? []).map(x => ({ kind:'evidence', id:x.id, text:`${x.evidence_type} ${x.system_id ?? ''} ${x.dataset_id ?? ''} ${x.snapshot_key ?? ''} ${x.source_ref ?? ''} ${JSON.stringify(x.payload)}`, payload:x })),
  ];
  const ranked = candidates.map(c => {
    const hay = c.text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
    const hits = ts.filter(t => hay.includes(t));
    const boost = c.kind === 'evidence' ? 0.4 : c.kind === 'model_run' ? 0.3 : c.kind === 'dataset' ? 0.2 : 0;
    return { ...c, hits, score: hits.length + (hits.length ? boost : 0) };
  }).filter(x => x.score > 0).sort((a,b) => b.score-a.score).slice(0,8);

  const evidenceRefs = ranked.map((r,i) => ({ ref:`E${i+1}`, kind:r.kind, id:r.id, excerpt:compact(r.payload,700) }));
  const corpusSnapshot = `ido@${new Date().toISOString().slice(0,10)}:${candidates.length}`;
  const openaiKey = Deno.env.get('OPENAI_API_KEY');
  let answer = '';
  let generator = 'deterministic-grounded-v1';
  const abstained = ranked.length === 0;
  if (abstained) answer = 'No encuentro evidencia suficiente en el corpus supervisor para responder con trazabilidad. El siguiente paso es conectar o registrar la fuente que contiene esa evidencia.';
  else if (openaiKey) {
    try {
      const prompt = `Eres el analista supervisor de Information Dividend OS. Responde en español usando SOLO la evidencia. No inventes cifras ni estados. Si falta evidencia, dilo. Cita cada afirmación material con [E1], [E2], etc. Distingue dato observado, definición, modelo y outcome. Pregunta: ${question}\n\nEVIDENCIA:\n${evidenceRefs.map(e=>`[${e.ref}] ${e.kind}/${e.id}: ${e.excerpt}`).join('\n')}`;
      const r = await fetch('https://api.openai.com/v1/responses', { method:'POST', headers:{'Authorization':`Bearer ${openaiKey}`,'Content-Type':'application/json'}, body:JSON.stringify({ model:Deno.env.get('IDO_RAG_MODEL') ?? 'gpt-5.6-luna', input:prompt, max_output_tokens:900 }) });
      if (r.ok) { const out = await r.json(); answer = out.output_text ?? ''; if (answer.trim()) generator = 'openai-grounded-v1'; }
    } catch { /* deterministic fallback */ }
  }
  if (!answer) answer = `Encontré ${evidenceRefs.length} piezas de evidencia relacionadas.\n${evidenceRefs.slice(0,5).map(e => `• [${e.ref}] ${e.kind}: ${e.excerpt}`).join('\n')}\n\nPara una conclusión más fuerte hace falta registrar el outcome o model run correspondiente.`;
  const cited = [...answer.matchAll(/\[E\d+\]/g)].length;
  const citationCoverage = ranked.length ? Math.min(1, cited / Math.min(ranked.length,5)) : 0;
  const groundedScore = abstained ? 1 : (generator.startsWith('openai') ? Math.max(0.5,citationCoverage) : 0.75);
  const { data: turn, error: insertError } = await admin.from('ido_rag_turns').insert({ question, answer, corpus_snapshot_key: corpusSnapshot, prompt_version:'ido-rag-p1', retrieval_version:'lexical-r1', evidence_refs:evidenceRefs, grounded_score:groundedScore, citation_coverage:citationCoverage, completeness_score:abstained?0:Math.min(1,ranked.length/5), abstained, owner_id:authData.user.id }).select('id,created_at').single();
  return json({ answer, evidence:evidenceRefs, quality:{ generator, retrieval_version:'lexical-r1', grounded_score:groundedScore, citation_coverage:citationCoverage, completeness_score:abstained?0:Math.min(1,ranked.length/5), abstained, production_gate: abstained ? 'NEEDS_EVIDENCE' : (citationCoverage >= .6 ? 'TRACEABLE' : 'REVIEW') }, turn: insertError ? null : turn, warning: insertError ? 'turn_not_persisted' : null });
});