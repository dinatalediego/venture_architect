(() => {
  const cfg = window.VENTURE_CONFIG || {};
  const page = document.body.dataset.page || "unknown";
  const sessionKey = "va_session_id";
  let sessionId = sessionStorage.getItem(sessionKey);
  if (!sessionId) {
    sessionId = (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`);
    sessionStorage.setItem(sessionKey, sessionId);
  }

  const track = (eventName, properties = {}) => {
    if (!cfg.eventEndpoint) return;
    fetch(cfg.eventEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event_name: eventName, session_id: sessionId, page_path: location.pathname, properties }),
      keepalive: true
    }).catch(() => {});
  };

  track("page_view", { page });
  document.querySelectorAll(".js-cta").forEach(el => el.addEventListener("click", () => track("cta_click", { label: el.textContent.trim(), page })));
  document.querySelectorAll(".js-demo-link").forEach(el => el.addEventListener("click", () => track("demo_viewed", { from: page })));

  const qs = new URLSearchParams(location.search);
  const attribution = Object.fromEntries(["utm_source","utm_medium","utm_campaign","utm_content","utm_term"].map(k => [k, qs.get(k)]));

  const roi = () => {
    const leads = Number(document.querySelector("#roi-leads")?.value || 0);
    const value = Number(document.querySelector("#roi-value")?.value || 0);
    const lift = Number(document.querySelector("#roi-lift")?.value || 0) / 100;
    const extraSales = leads * lift;
    const incremental = extraSales * value;
    const result = document.querySelector("#roi-result");
    const sales = document.querySelector("#roi-extra-sales");
    if (result) result.textContent = new Intl.NumberFormat("es-PE", {style:"currency",currency:"PEN",maximumFractionDigits:0}).format(incremental);
    if (sales) sales.textContent = `+${extraSales.toFixed(1)} ventas / mes`;
  };
  document.querySelectorAll("#roi-leads,#roi-conv,#roi-value,#roi-lift").forEach(el => el.addEventListener("input", roi));
  const roiSection = document.querySelector(".calculator");
  if (roiSection) roiSection.addEventListener("change", () => track("roi_calculated", { leads: Number(document.querySelector("#roi-leads")?.value || 0), lift_pp: Number(document.querySelector("#roi-lift")?.value || 0) }), {once:false});
  roi();

  const sim = document.querySelector("#sim-lift");
  if (sim) {
    const updateSim = () => {
      const pct = Number(sim.value);
      const recovered = Math.round(167 * pct / 100);
      const extraSales = recovered * (8 / 261);
      const value = extraSales * 175000;
      document.querySelector("#sim-lift-label").textContent = `${pct}%`;
      document.querySelector("#sim-leads").textContent = String(recovered);
      document.querySelector("#sim-sales").textContent = extraSales.toFixed(1);
      document.querySelector("#sim-value").textContent = `S/ ${Math.round(value/1000)}k`;
    };
    sim.addEventListener("input", updateSim); updateSim(); track("demo_viewed", { direct: true });
  }

  const form = document.querySelector("#lead-form");
  if (form) {
    const startedAt = document.querySelector("#form-started-at");
    if (startedAt) startedAt.value = Date.now();
    let started = false;
    form.addEventListener("focusin", () => { if (!started) { started = true; track("form_started"); } });
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const status = document.querySelector("#form-status");
      if (!cfg.leadEndpoint) { status.textContent = "El formulario aún no está configurado."; return; }
      const fd = new FormData(form);
      const payload = Object.fromEntries(fd.entries());
      payload.consent = fd.get("consent") === "on";
      payload.monthly_leads = payload.monthly_leads ? Number(payload.monthly_leads) : null;
      payload.monthly_sales = payload.monthly_sales ? Number(payload.monthly_sales) : null;
      payload.form_started_at = Number(payload.form_started_at || Date.now());
      payload.session_id = sessionId;
      payload.page_path = location.pathname;
      payload.referrer = document.referrer || null;
      payload.source = "venture_architect_mvp";
      payload.offer = cfg.offer;
      Object.assign(payload, attribution);
      if (!payload.email && !payload.phone) { status.textContent = "Déjame un email o teléfono para poder contactarte."; return; }
      status.textContent = "Enviando…";
      const button = form.querySelector("button[type=submit]"); if (button) button.disabled = true;
      try {
        const res = await fetch(cfg.leadEndpoint, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(payload) });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || data.error) throw new Error(data.error || "request_failed");
        status.textContent = "✓ Recibido. Revisaré el caso para preparar el diagnóstico.";
        form.reset();
        if (startedAt) startedAt.value = Date.now();
      } catch (err) {
        status.textContent = "No pude registrar el formulario. Escríbeme directamente y lo resolvemos.";
      } finally { if (button) button.disabled = false; }
    });
  }
})();