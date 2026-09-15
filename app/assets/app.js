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

  const attribution = (() => {
    const qs = new URLSearchParams(location.search);
    return Object.fromEntries(["utm_source","utm_medium","utm_campaign","utm_content","utm_term"].map(k => [k, qs.get(k)]));
  })();

  const postLead = async (payload) => {
    if (!cfg.leadEndpoint) throw new Error("lead_endpoint_missing");
    const body = {
      ...payload,
      session_id: sessionId,
      page_path: location.pathname,
      referrer: document.referrer || null,
      offer: cfg.offer,
      ...attribution
    };
    const res = await fetch(cfg.leadEndpoint, {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify(body)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.error) throw new Error(data.error || "request_failed");
    return data;
  };

  track("page_view", { page });
  document.querySelectorAll(".js-cta").forEach(el => el.addEventListener("click", () => track("cta_click", { label: el.textContent.trim(), page })));
  document.querySelectorAll(".js-demo-link").forEach(el => el.addEventListener("click", () => track("demo_viewed", { from: page })));

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
  if (roiSection) roiSection.addEventListener("change", () => track("roi_calculated", {
    leads: Number(document.querySelector("#roi-leads")?.value || 0),
    lift_pp: Number(document.querySelector("#roi-lift")?.value || 0)
  }), {once:false});
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
    sim.addEventListener("input", updateSim);
    updateSim();
    track("demo_viewed", { direct: true });
  }

  const form = document.querySelector("#lead-form");
  if (form) {
    const startedAt = document.querySelector("#form-started-at");
    if (startedAt) startedAt.value = Date.now();
    let started = false;
    form.addEventListener("focusin", () => {
      if (!started) {
        started = true;
        track("form_started", { source: "full_form" });
      }
    });
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const status = document.querySelector("#form-status");
      const fd = new FormData(form);
      const payload = Object.fromEntries(fd.entries());
      payload.consent = fd.get("consent") === "on";
      payload.monthly_leads = payload.monthly_leads ? Number(payload.monthly_leads) : null;
      payload.monthly_sales = payload.monthly_sales ? Number(payload.monthly_sales) : null;
      payload.form_started_at = Number(payload.form_started_at || Date.now());
      payload.source = "venture_architect_mvp";
      if (!payload.email && !payload.phone) {
        status.textContent = "Déjame un email o teléfono para poder contactarte.";
        return;
      }
      if (!payload.consent) {
        status.textContent = "Necesito tu autorización para poder contactarte.";
        return;
      }
      status.textContent = "Enviando…";
      const button = form.querySelector("button[type=submit]");
      if (button) button.disabled = true;
      try {
        await postLead(payload);
        status.textContent = "✓ Recibido. Revisaré el caso para preparar el diagnóstico.";
        form.reset();
        if (startedAt) startedAt.value = Date.now();
      } catch (err) {
        status.textContent = "No pude registrar el formulario. Intenta nuevamente en unos minutos.";
      } finally {
        if (button) button.disabled = false;
      }
    });
  }

  const buildConcierge = () => {
    const root = document.createElement("div");
    root.className = "concierge";
    root.innerHTML = `
      <button class="concierge-launch" type="button" aria-expanded="false" aria-controls="va-concierge-panel">
        <span class="concierge-avatar avatar-placeholder" aria-hidden="true">DD</span>
        <span class="concierge-launch-copy"><b>¿Dónde se pierde tu funnel?</b><small>Concierge interactivo · founder-led</small></span>
        <span class="concierge-pulse" aria-hidden="true"></span>
      </button>
      <section id="va-concierge-panel" class="concierge-panel" hidden aria-label="Concierge de Venture Architect">
        <header class="concierge-head">
          <div class="concierge-identity">
            <span class="concierge-avatar avatar-placeholder">DD</span>
            <span><b>Diego + VA Concierge</b><small>Asistente guiado · no es un humano escribiendo en vivo</small></span>
          </div>
          <button class="concierge-close" type="button" aria-label="Cerrar conversación">×</button>
        </header>
        <div class="concierge-messages" aria-live="polite"></div>
        <div class="concierge-actions"></div>
      </section>
    `;
    document.body.appendChild(root);

    const launch = root.querySelector(".concierge-launch");
    const panel = root.querySelector(".concierge-panel");
    const close = root.querySelector(".concierge-close");
    const messages = root.querySelector(".concierge-messages");
    const actions = root.querySelector(".concierge-actions");

    const state = {
      pain: "",
      monthlyLeads: null
    };

    const addMessage = (text, who = "bot") => {
      const div = document.createElement("div");
      div.className = `concierge-message ${who}`;
      div.textContent = text;
      messages.appendChild(div);
      messages.scrollTop = messages.scrollHeight;
    };

    const clearActions = () => { actions.innerHTML = ""; };

    const addButtons = (items) => {
      clearActions();
      items.forEach(({label, onClick, primary = false}) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = `concierge-chip${primary ? " primary" : ""}`;
        btn.textContent = label;
        btn.addEventListener("click", () => {
          track("cta_click", { label: `concierge:${label}`, page });
          addMessage(label, "user");
          onClick();
        });
        actions.appendChild(btn);
      });
    };

    const linkButton = (label, href, primary = false) => ({
      label,
      primary,
      onClick: () => {
        window.location.href = href;
      }
    });

    const showMiniLeadForm = (context = "diagnostic") => {
      clearActions();
      track("form_started", { source: "concierge", context });
      const formWrap = document.createElement("form");
      formWrap.className = "concierge-lead";
      formWrap.innerHTML = `
        <label>Nombre<input name="full_name" required maxlength="120" autocomplete="name" /></label>
        <label>Empresa<input name="company" required maxlength="160" autocomplete="organization" /></label>
        <label>Email o WhatsApp<input name="contact" required maxlength="180" /></label>
        <label class="concierge-consent"><input name="consent" type="checkbox" required /> Acepto que me contacten sobre este diagnóstico.</label>
        <button class="button small" type="submit">Enviar contexto</button>
        <button class="concierge-text-button" type="button" data-full>Prefiero completar el diagnóstico completo →</button>
        <p class="concierge-status" role="status"></p>
      `;
      actions.appendChild(formWrap);

      formWrap.querySelector("[data-full]").addEventListener("click", () => {
        const target = document.querySelector("#diagnostic");
        if (target) {
          const pain = document.querySelector('#lead-form textarea[name="pain_point"]');
          const leads = document.querySelector('#lead-form input[name="monthly_leads"]');
          if (pain && state.pain) pain.value = state.pain;
          if (leads && state.monthlyLeads) leads.value = state.monthlyLeads;
          panel.hidden = true;
          launch.setAttribute("aria-expanded", "false");
          target.scrollIntoView({behavior:"smooth"});
        } else {
          window.location.href = "index.html#diagnostic";
        }
      });

      formWrap.addEventListener("submit", async (e) => {
        e.preventDefault();
        const fd = new FormData(formWrap);
        const contact = String(fd.get("contact") || "").trim();
        const consent = fd.get("consent") === "on";
        const status = formWrap.querySelector(".concierge-status");
        if (!consent) {
          status.textContent = "Necesito tu autorización para poder contactarte.";
          return;
        }
        const payload = {
          full_name: String(fd.get("full_name") || "").trim(),
          company: String(fd.get("company") || "").trim(),
          role: null,
          email: contact.includes("@") ? contact : null,
          phone: contact.includes("@") ? null : contact,
          company_size: null,
          pain_point: state.pain || (context === "founder" ? "Solicita conversación directa con el founder." : "Solicita diagnóstico desde el concierge."),
          monthly_leads: state.monthlyLeads,
          monthly_sales: null,
          crm: null,
          source: "venture_architect_concierge",
          consent: true,
          form_started_at: Date.now()
        };
        if (!payload.full_name || !payload.company || !contact) {
          status.textContent = "Completa nombre, empresa y un medio de contacto.";
          return;
        }
        const submit = formWrap.querySelector('button[type="submit"]');
        submit.disabled = true;
        status.textContent = "Enviando…";
        try {
          await postLead(payload);
          formWrap.innerHTML = `
            <div class="concierge-success">
              <b>✓ Contexto recibido</b>
              <p>Diego podrá revisar tu caso con esta información antes de contactarte.</p>
              <a class="concierge-text-button" href="demo.html">Mientras tanto, explora el Control Room →</a>
            </div>
          `;
        } catch (err) {
          status.textContent = "No pude registrar el contacto. Puedes usar el formulario completo.";
          submit.disabled = false;
        }
      });
    };

    const showRoot = () => {
      addMessage("Puedo ayudarte a explorar el producto o preparar un diagnóstico en menos de un minuto.");
      addButtons([
        {label:"Diagnosticar mi funnel", primary:true, onClick: showPainChoices},
        linkButton("Ver cómo funciona", "demo.html"),
        linkButton("Conocer la empresa", "company.html"),
        {label:"Precio / piloto", onClick: showPilot},
        {label:"Hablar con Diego", onClick: showFounder}
      ]);
    };

    function showPainChoices() {
      addMessage("¿Qué te preocupa más hoy en el proceso comercial?");
      addButtons([
        {label:"Leads sin contacto", onClick: () => choosePain("Leads sin contacto o respuesta tardía.")},
        {label:"Seguimiento irregular", onClick: () => choosePain("Seguimiento comercial irregular entre asesores.")},
        {label:"Atribución / calidad de leads", onClick: () => choosePain("Atribución, calidad o rentabilidad de los leads.")},
        {label:"Conversión", onClick: () => choosePain("Conversión baja o difícil de explicar entre etapas del funnel.")},
        {label:"Visibilidad gerencial", onClick: () => choosePain("Falta de visibilidad gerencial para priorizar acciones.")},
        {label:"Otro", onClick: () => choosePain("Otro cuello de botella comercial a diagnosticar.")}
      ]);
    }

    function choosePain(pain) {
      state.pain = pain;
      addMessage("Entendido. ¿Aproximadamente cuántos leads reciben al mes?");
      addButtons([
        {label:"Menos de 100", onClick: () => chooseVolume(50)},
        {label:"100–300", onClick: () => chooseVolume(200)},
        {label:"300–1,000", onClick: () => chooseVolume(650)},
        {label:"Más de 1,000", onClick: () => chooseVolume(1200)},
        {label:"No lo sé", onClick: () => chooseVolume(null)}
      ]);
    }

    function chooseVolume(volume) {
      state.monthlyLeads = volume;
      addMessage("Perfecto. Ya tengo suficiente contexto para que la siguiente conversación no empiece de cero. Si quieres, deja un contacto mínimo y Diego revisará el caso.");
      showMiniLeadForm("diagnostic");
    }

    function showPilot() {
      addMessage("El Founding Pilot es una hipótesis comercial de 14 días por S/ 1,500: baseline del funnel, mapa de fugas, scorecard, acciones priorizadas y una automatización solo si está justificada.");
      addButtons([
        linkButton("Ver alcance completo", "index.html#pilot", true),
        {label:"Quiero conversar antes", onClick: showFounder},
        {label:"Volver", onClick: showRoot}
      ]);
    }

    function showFounder() {
      state.pain = "Solicita conversación directa con Diego sobre Revenue Intelligence.";
      addMessage("Claro. El concierge prepara el contexto, pero el diagnóstico inicial es founder-led. Déjame un contacto y Diego podrá revisar el caso antes de escribirte.");
      showMiniLeadForm("founder");
    }

    const open = () => {
      panel.hidden = false;
      launch.setAttribute("aria-expanded", "true");
      track("cta_click", { label: "concierge:open", page });
      if (!messages.children.length) {
        addMessage("Hola. Soy el concierge interactivo de Venture Architect. No soy una persona escribiendo en vivo: te ayudo a orientar el problema y preparar contexto para que Diego lo revise.");
        showRoot();
      }
    };
    const hide = () => {
      panel.hidden = true;
      launch.setAttribute("aria-expanded", "false");
    };

    launch.addEventListener("click", () => panel.hidden ? open() : hide());
    close.addEventListener("click", hide);
    document.querySelectorAll(".js-concierge-open").forEach(el => {
      el.addEventListener("click", (e) => {
        e.preventDefault();
        open();
      });
    });

    window.setTimeout(() => root.classList.add("ready"), 700);
  };

  buildConcierge();
})();