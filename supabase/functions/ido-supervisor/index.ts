import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' },
  });
}

async function exactCount(query: PromiseLike<{ count: number | null; error: unknown }>) {
  const { count, error } = await query;
  if (error) return { count: null, error: String((error as { message?: string }).message ?? error) };
  return { count: count ?? 0, error: null };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'GET') return json({ error: 'method_not_allowed' }, 405);

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !anonKey || !serviceKey) return json({ error: 'server_configuration_missing' }, 500);

  const authorization = req.headers.get('Authorization') ?? '';
  if (!authorization.startsWith('Bearer ')) return json({ error: 'authentication_required' }, 401);

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: authData, error: authError } = await userClient.auth.getUser();
  if (authError || !authData.user) return json({ error: 'invalid_session' }, 401);

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const [{ data: systems, error: systemsError }, { data: datasets, error: datasetsError }] = await Promise.all([
    userClient.from('ido_systems').select('id,label,family,source_ref,gate,status_detail').order('label'),
    userClient.from('ido_datasets').select('id,system_id,label,grain,freshness_slo,sensitivity,dividend,runtime_mode').order('label'),
  ]);

  if (systemsError || datasetsError) {
    return json({ error: 'registry_unavailable', detail: systemsError?.message ?? datasetsError?.message }, 500);
  }

  const [vaEvents, vaLeads, scorecardResult, fxCount, fxLatestResult, fxRunResult] = await Promise.all([
    exactCount(admin.from('va_events').select('*', { count: 'exact', head: true })),
    exactCount(admin.from('va_leads').select('*', { count: 'exact', head: true })),
    admin.from('va_daily_scorecards')
      .select('score_date,prospects_added,outbound_sent,replies,qualified_conversations,meetings_booked,proposals_sent,leads_inbound,customers_won,revenue_pen,build_hours,selling_hours,learning_hours')
      .order('score_date', { ascending: false }).limit(1).maybeSingle(),
    exactCount(admin.from('pm_rates').select('*', { count: 'exact', head: true })),
    admin.from('pm_rates').select('series_code,rate_date,rate,fetched_at').order('rate_date', { ascending: false }).limit(1).maybeSingle(),
    admin.from('pm_ingestion_runs').select('status,rows_received,last_observation,finished_at').order('started_at', { ascending: false }).limit(1).maybeSingle(),
  ]);

  const { data: memberships, error: membershipsError } = await userClient
    .from('hfw_household_members').select('household_id').eq('user_id', authData.user.id);

  let health: Record<string, unknown> = {
    access: membershipsError ? 'unavailable' : 'no_household',
    household_count: memberships?.length ?? 0,
  };

  const householdIds = [...new Set((memberships ?? []).map((x) => x.household_id).filter(Boolean))];
  if (householdIds.length) {
    const [inventoryEvents, mealEvents, scans, latestKitchen] = await Promise.all([
      exactCount(admin.from('hfw_inventory_events').select('*', { count: 'exact', head: true }).in('household_id', householdIds)),
      exactCount(admin.from('hfw_meal_events').select('*', { count: 'exact', head: true }).in('household_id', householdIds)),
      exactCount(admin.from('hfw_scan_sessions').select('*', { count: 'exact', head: true }).in('household_id', householdIds)),
      admin.from('hfw_kitchen_state_snapshots')
        .select('coverage_days,breakfast_count,lunch_count,dinner_count,snack_count,low_stock_count,stockout_count,created_at')
        .in('household_id', householdIds).order('created_at', { ascending: false }).limit(1).maybeSingle(),
    ]);
    health = {
      access: 'authorized',
      household_count: householdIds.length,
      inventory_events: inventoryEvents,
      meal_events: mealEvents,
      scan_sessions: scans,
      latest_snapshot: latestKitchen.error ? null : latestKitchen.data,
    };
  }

  return json({
    generated_at: new Date().toISOString(),
    user_scope: authData.user.id,
    registry: { systems, datasets },
    runtime: {
      revenue_intelligence: {
        status: 'connected',
        event_count: vaEvents,
        lead_count: vaLeads,
        latest_scorecard: scorecardResult.error ? null : scorecardResult.data,
      },
      patrimonio: {
        status: 'connected',
        observation_count: fxCount,
        latest_rate: fxLatestResult.error ? null : fxLatestResult.data,
        latest_ingestion: fxRunResult.error ? null : fxRunResult.data,
      },
      health,
      medallio: {
        status: 'adapter_required',
        note: 'Source remains external/local; no restricted row-level data is copied into the supervisor.',
      },
      goldlab: {
        status: 'adapter_required',
        note: 'Canonical Gold Decision Lab lives in its separate Supabase project; cross-project adapter is intentionally not bridged with a browser credential.',
      },
    },
  });
});
