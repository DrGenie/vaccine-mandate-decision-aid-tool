/* Vaccine Mandate Decision Aid (AU · FR · IT)
   - No external libraries required.
   - All data stored locally via localStorage (can be cleared in Export tab).
*/

(function(){
  'use strict';

  const BUILTIN_PREF = {"meta": {"source": "User-provided MXL and LC estimates (means in preference space) by country and outbreak frame", "coding": "Dummy coding with stated references (scope2 vs scope1; exemption2/3 vs exemption1; coverage2/3 vs coverage1).", "note": "Predicted support is computed for a single configured mandate alternative vs opt-out using ASC_policy and ASC_optout."}, "mxl": {"AUS": {"mild": {"beta": {"ASC_policy": 0.464, "ASC_optout": -0.572, "scope2": -0.319, "exemption2": -0.157, "exemption3": -0.267, "coverage2": 0.171, "coverage3": 0.158, "lives": 0.072}}, "severe": {"beta": {"ASC_policy": 0.535, "ASC_optout": -0.694, "scope2": 0.19, "exemption2": -0.181, "exemption3": -0.305, "coverage2": 0.371, "coverage3": 0.398, "lives": 0.079}}}, "ITA": {"mild": {"beta": {"ASC_policy": 0.625, "ASC_optout": -0.238, "scope2": -0.276, "exemption2": -0.176, "exemption3": -0.289, "coverage2": 0.185, "coverage3": 0.148, "lives": 0.039}}, "severe": {"beta": {"ASC_policy": 0.799, "ASC_optout": -0.463, "scope2": 0.174, "exemption2": -0.178, "exemption3": -0.207, "coverage2": 0.305, "coverage3": 0.515, "lives": 0.045}}}, "FRA": {"mild": {"beta": {"ASC_policy": 0.899, "ASC_optout": 0.307, "scope2": -0.16, "exemption2": -0.121, "exemption3": -0.124, "coverage2": 0.232, "coverage3": 0.264, "lives": 0.049}}, "severe": {"beta": {"ASC_policy": 0.884, "ASC_optout": 0.083, "scope2": -0.019, "exemption2": -0.192, "exemption3": -0.247, "coverage2": 0.267, "coverage3": 0.398, "lives": 0.052}}}}, "lc": {"AUS": {"mild": {"classes": [{"name": "resisters", "share": 0.2532, "beta": {"ASC_policy": 0.11, "ASC_optout": 2.96, "scope2": -0.26, "exemption2": 0.11, "exemption3": 0.15, "coverage2": -0.09, "coverage3": -0.26, "lives": 0.02}}, {"name": "supporters", "share": 0.7468, "beta": {"ASC_policy": 0.28, "ASC_optout": -1.01, "scope2": -0.19, "exemption2": -0.18, "exemption3": -0.21, "coverage2": 0.1, "coverage3": 0.17, "lives": 0.04}}]}, "severe": {"classes": [{"name": "supporters", "share": 0.7776, "beta": {"ASC_policy": 0.27, "ASC_optout": -0.82, "scope2": 0.12, "exemption2": -0.15, "exemption3": -0.23, "coverage2": 0.16, "coverage3": 0.24, "lives": 0.04}}, {"name": "resisters", "share": 0.2224, "beta": {"ASC_policy": 0.15, "ASC_optout": 2.68, "scope2": -0.0, "exemption2": -0.09, "exemption3": 0.06, "coverage2": 0.09, "coverage3": 0.05, "lives": 0.01}}]}}, "ITA": {"mild": {"classes": [{"name": "resisters", "share": 0.2995, "beta": {"ASC_policy": 0.1, "ASC_optout": 2.7, "scope2": -0.24, "exemption2": -0.12, "exemption3": 0.07, "coverage2": -0.09, "coverage3": -0.18, "lives": 0.01}}, {"name": "supporters", "share": 0.7005, "beta": {"ASC_policy": 0.42, "ASC_optout": -0.96, "scope2": -0.18, "exemption2": -0.14, "exemption3": -0.24, "coverage2": 0.13, "coverage3": 0.18, "lives": 0.03}}]}, "severe": {"classes": [{"name": "supporters", "share": 0.7477, "beta": {"ASC_policy": 0.44, "ASC_optout": -0.74, "scope2": 0.17, "exemption2": -0.12, "exemption3": -0.23, "coverage2": 0.2, "coverage3": 0.36, "lives": 0.03}}, {"name": "resisters", "share": 0.2523, "beta": {"ASC_policy": 0.34, "ASC_optout": 2.6, "scope2": -0.06, "exemption2": -0.17, "exemption3": 0.09, "coverage2": -0.06, "coverage3": -0.02, "lives": 0.0}}]}}, "FRA": {"mild": {"classes": [{"name": "resisters", "share": 0.2831, "beta": {"ASC_policy": 0.45, "ASC_optout": 2.75, "scope2": -0.18, "exemption2": 0.07, "exemption3": 0.18, "coverage2": -0.01, "coverage3": -0.02, "lives": 0.01}}, {"name": "supporters", "share": 0.7169, "beta": {"ASC_policy": 0.56, "ASC_optout": -0.68, "scope2": -0.11, "exemption2": -0.16, "exemption3": -0.15, "coverage2": 0.12, "coverage3": 0.19, "lives": 0.03}}]}, "severe": {"classes": [{"name": "resisters", "share": 0.2496, "beta": {"ASC_policy": 0.41, "ASC_optout": 2.4, "scope2": -0.2, "exemption2": -0.1, "exemption3": -0.05, "coverage2": 0.11, "coverage3": 0.18, "lives": 0.0}}, {"name": "supporters", "share": 0.7504, "beta": {"ASC_policy": 0.53, "ASC_optout": -0.57, "scope2": 0.06, "exemption2": -0.12, "exemption3": -0.18, "coverage2": 0.15, "coverage3": 0.27, "lives": 0.04}}]}}}};


  const BUILD = new Date().toISOString().slice(0,19).replace('T',' ') + 'Z';
  const LS_KEY = 'vmda_state_v1';

  // ---- Utilities ----
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));
  const fmtInt = (x) => Number.isFinite(x) ? x.toLocaleString(undefined, {maximumFractionDigits:0}) : '—';
  const fmtNum = (x, d=2) => Number.isFinite(x) ? x.toLocaleString(undefined, {minimumFractionDigits:d, maximumFractionDigits:d}) : '—';
  const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));

  function safeNumber(v){
    const x = Number(String(v).replace(/,/g,'').trim());
    return Number.isFinite(x) ? x : 0;
  }

  function download(filename, content, mime){
    const blob = new Blob([content], {type: mime || 'application/octet-stream'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function esc(s){
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  // ---- Evidence-aware defaults (only where your costing document provides an anchor) ----
  // These are NOT treated as truth for any setting; they are just pre-filled values to save time and must be reviewed.
  // The UI labels some as "Evidence anchor" (reported in your costing file) and others as blanks.
  const COST_LINES = [
    { id:'it_systems', label:'IT systems (certificate apps & backend)', hint:'One-off + maintenance attributable to the mandate infrastructure.', defaultByCountry:{ AUS: 0, FRA: 6500000, ITA: 0 }, tagByCountry:{ FRA:'Evidence anchor' } },
    { id:'public_admin', label:'Public sector staffing/admin (mandate programme)', hint:'Incremental staffing, call centres, reporting.', defaultByCountry:{ AUS: 11000000, FRA: 0, ITA: 0 }, tagByCountry:{ AUS:'Evidence anchor' } },
    { id:'enforcement_ops', label:'Enforcement operations (inspections & checks)', hint:'Police/inspectors time; opportunity cost.', defaultByCountry:{ AUS: 0, FRA: 0, ITA: 0 } },
    { id:'penalty_processing', label:'Penalty processing/administration', hint:'Admin cost per fine; do NOT include fine amounts.', defaultByCountry:{ AUS: 0, FRA: 0, ITA: 0 } },
    { id:'employer_hr', label:'Employer compliance (HR verification & record-keeping)', hint:'Time burden valued as wages; can be large in aggregate.', defaultByCountry:{ AUS: 0, FRA: 0, ITA: 0 } },
    { id:'employer_process', label:'Employer process changes/training/legal advice', hint:'Policy updates, staff training, legal advice.', defaultByCountry:{ AUS: 0, FRA: 0, ITA: 0 } },
    { id:'testing_resource', label:'Testing resource cost (if testing alternative)', hint:'Test kits + processing resources attributable to mandate compliance.', defaultByCountry:{ AUS: 0, FRA: 0, ITA: 0 } },
    { id:'testing_time', label:'Testing time and logistics (if testing alternative)', hint:'Time costs for people/employers to obtain tests, travel, queue.', defaultByCountry:{ AUS: 0, FRA: 0, ITA: 0 } },
    { id:'exemptions_admin', label:'Exemptions processing and fraud prevention', hint:'Clinical/admin time for exemptions and enforcement against fraud.', defaultByCountry:{ AUS: 0, FRA: 0, ITA: 0 } },
    { id:'workforce_turnover', label:'Workforce turnover/temporary staffing attributable to mandate', hint:'Replacement hiring, overtime, agency staff.', defaultByCountry:{ AUS: 0, FRA: 0, ITA: 0 } },
    { id:'adverse_events', label:'Adverse event management attributable to additional vaccination', hint:'Healthcare utilisation attributable to mandate-induced vaccination.', defaultByCountry:{ AUS: 0, FRA: 0, ITA: 0 } },
    { id:'legal_system', label:'Legal/judicial system costs attributable to mandate', hint:'Incremental litigation and adjudication costs.', defaultByCountry:{ AUS: 0, FRA: 0, ITA: 0 } }
  ];

  // References shown in UI (no raw URLs; cite externally in papers)
  const REFERENCES = [
    { label: 'WHO. WHO guide for standardization of economic evaluations of immunization programmes (2nd ed.). (2019).', key:'WHO-2019' },
    { label: 'Walker DG, Hutubessy R, Beutels P. WHO Guide for standardisation of economic evaluations of immunization programmes. Vaccine (2010).', key:'Walker-2010' },
    { label: 'OECD. Mortality risk valuation in policy assessment (2025).', key:'OECD-2025' },
    { label: 'Australian Government Office of Impact Analysis. Value of a statistical life (updated 2024).', key:'OIA-2024' }
  ];

  // ---- State ----
  const state = loadState();

  function blankScenario(){
    return {
      id: cryptoRandomId(),
      name: '',
      createdAt: new Date().toISOString(),
      context: {
        country: 'AUS',
        frame: 'mild',
        population: 0,
        horizonMonths: 12
      },
      design: {
        scope: 'scope1',
        exemptions: 'exemption1',
        coverage: 'coverage2',
        livesPer100k: 10
      }
    };
  }

  function defaultInputs(){
    return {
      current: blankScenario(),
      scenarios: [],
      currency: 'AUD',
      discountRatePct: 0,
      costs: {
        includeTestingAlt: 'no',
        unvaccinatedTestingSharePct: 0,
        lines: {} // id -> value
      },
      benefits: {
        valuationMethod: 'VSL',
        vsl: 0,
        vsly: 0,
        lifeYearsPerDeath: 0,
        willingnessToPayQaly: 0,
        qalysPerDeath: 0,
        includeMorbidity: 'no',
        hospAverted: 0,
        icuAverted: 0,
        longCovidAverted: 0,
        costPerHosp: 0,
        costPerICU: 0,
        costPerLongCovid: 0,
        policyAcceptabilityWeight: 'no'
      },
      preferenceModel: {
        mode: 'builtin_mxl', // builtin_mxl | builtin_lc | none | coeff | bundle
        coeff: null,
        bundles: null
      }
    };
  }

  function loadState(){
    try{
      const raw = localStorage.getItem(LS_KEY);
      if(!raw) return defaultInputs();
      const parsed = JSON.parse(raw);
      // light validation
      if(!parsed || typeof parsed !== 'object') return defaultInputs();
      return Object.assign(defaultInputs(), parsed);
    }catch(_){
      return defaultInputs();
    }
  }

  function saveState(){
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  }

  function cryptoRandomId(){
    // Avoid non-crypto environments
    const buf = new Uint8Array(8);
    (window.crypto || window.msCrypto).getRandomValues(buf);
    return Array.from(buf).map(b=>b.toString(16).padStart(2,'0')).join('');
  }

  // ---- Tabs / Nav ----
  function initNav(){
    const toggle = $('#navToggle');
    const menu = $('#navMenu');
    toggle.addEventListener('click', ()=>{
      const open = menu.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    $$('#navMenu a.nav-link').forEach(a=>{
      a.addEventListener('click', (e)=>{
        e.preventDefault();
        const tab = a.dataset.tab;
        openTab(tab);
        menu.classList.remove('is-open');
        toggle.setAttribute('aria-expanded','false');
      });
    });

    // hash-based init
    const hash = (location.hash || '').replace('#','');
    const wanted = ['configure','costs','benefits','results','evidence','export'].includes(hash) ? hash : 'configure';
    openTab(wanted, false);
  }

  function openTab(tab, push=true){
    $$('#navMenu .nav-link').forEach(a => a.classList.toggle('is-active', a.dataset.tab === tab));
    $$('.tab-panel').forEach(p => p.classList.toggle('is-active', p.dataset.tabpanel === tab));
    if(push) history.replaceState(null,'', '#'+tab);
  }

  // ---- Configure tab ----
  function initConfigure(){
    $('#country').value = state.current.context.country;
    $('#frame').value = state.current.context.frame;
    $('#population').value = state.current.context.population ? state.current.context.population : '';
    $('#horizonMonths').value = state.current.context.horizonMonths;

    $('#scope').value = state.current.design.scope;
    $('#exemptions').value = state.current.design.exemptions;
    $('#coverage').value = state.current.design.coverage;
    $('#livesPer100k').value = state.current.design.livesPer100k;

    // inputs bind
    $('#country').addEventListener('change', () => { state.current.context.country = $('#country').value; saveState(); });
    $('#frame').addEventListener('change', () => { state.current.context.frame = $('#frame').value; saveState(); });
    $('#population').addEventListener('input', () => { state.current.context.population = safeNumber($('#population').value); saveState(); });
    $('#horizonMonths').addEventListener('input', () => { state.current.context.horizonMonths = Math.max(1, safeNumber($('#horizonMonths').value)); saveState(); });

    $('#scope').addEventListener('change', () => { state.current.design.scope = $('#scope').value; saveState(); });
    $('#exemptions').addEventListener('change', () => { state.current.design.exemptions = $('#exemptions').value; saveState(); });
    $('#coverage').addEventListener('change', () => { state.current.design.coverage = $('#coverage').value; saveState(); });
    $('#livesPer100k').addEventListener('input', () => { state.current.design.livesPer100k = Math.max(0, safeNumber($('#livesPer100k').value)); saveState(); });

    $('#resetBtn').addEventListener('click', ()=>{
      state.current = blankScenario();
      saveState();
      initConfigure();
      renderScenariosTable();
      renderResults();
    });

    $('#saveScenarioBtn').addEventListener('click', ()=>{
      const s = structuredClone(state.current);
      s.name = scenarioDefaultName(s);
      state.scenarios.push(s);
      state.current = blankScenario();
      saveState();
      initConfigure();
      renderScenariosTable();
      renderResults();
    });

    renderScenariosTable();
  }

  function scenarioDefaultName(s){
    const c = s.context.country;
    const frame = s.context.frame;
    const sc = s.design.scope;
    const ex = s.design.exemptions;
    const cov = s.design.coverage;
    const lives = s.design.livesPer100k;
    return `${c}-${frame}-${sc}-${ex}-${cov}-L${lives}`;
  }

  function labelFor(code){
    const m = {
      scope1:'High-risk only',
      scope2:'All occupations & public spaces',
      exemption1:'Medical only',
      exemption2:'Medical + religious',
      exemption3:'Medical + religious + personal belief',
      coverage1:'Lift at 50%',
      coverage2:'Lift at 70%',
      coverage3:'Lift at 90%'
    };
    return m[code] || code;
  }

  function renderScenariosTable(){
    const tbody = $('#scenariosTbody');
    tbody.innerHTML = '';
    if(state.scenarios.length === 0){
      const tr = document.createElement('tr');
      tr.innerHTML = `<td colspan="8" class="muted">No saved scenarios yet.</td>`;
      tbody.appendChild(tr);
      updateScenarioSelector();
      return;
    }
    state.scenarios.forEach((s, idx)=>{
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${esc(s.name)}</td>
        <td>${esc(s.context.country)}</td>
        <td>${esc(s.context.frame)}</td>
        <td>${esc(labelFor(s.design.scope))}</td>
        <td>${esc(labelFor(s.design.exemptions))}</td>
        <td>${esc(labelFor(s.design.coverage))}</td>
        <td>${esc(String(s.design.livesPer100k))}</td>
        <td class="right">
          <button class="btn" data-act="clone" data-idx="${idx}">Clone</button>
          <button class="btn danger" data-act="delete" data-idx="${idx}">Delete</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    tbody.querySelectorAll('button[data-act]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const idx = Number(btn.dataset.idx);
        const act = btn.dataset.act;
        if(!Number.isFinite(idx)) return;
        if(act === 'delete'){
          state.scenarios.splice(idx,1);
          saveState();
          renderScenariosTable();
          renderResults();
        }else if(act === 'clone'){
          const copy = structuredClone(state.scenarios[idx]);
          copy.id = cryptoRandomId();
          copy.name = copy.name + '-copy';
          copy.createdAt = new Date().toISOString();
          state.scenarios.push(copy);
          saveState();
          renderScenariosTable();
          renderResults();
        }
      });
    });

    updateScenarioSelector();
  }

  // ---- Costs ----
  function initCosts(){
    $('#currency').value = state.currency;
    $('#discountRate').value = state.discountRatePct;
    $('#includeTestingAlt').value = state.costs.includeTestingAlt;
    $('#unvaccinatedTestingShare').value = state.costs.unvaccinatedTestingSharePct;

    $('#currency').addEventListener('change', ()=>{ state.currency = $('#currency').value; saveState(); renderResults(); });
    $('#discountRate').addEventListener('input', ()=>{ state.discountRatePct = clamp(safeNumber($('#discountRate').value), 0, 100); saveState(); renderResults(); });
    $('#includeTestingAlt').addEventListener('change', ()=>{ state.costs.includeTestingAlt = $('#includeTestingAlt').value; saveState(); renderResults(); });
    $('#unvaccinatedTestingShare').addEventListener('input', ()=>{ state.costs.unvaccinatedTestingSharePct = clamp(safeNumber($('#unvaccinatedTestingShare').value), 0, 100); saveState(); renderResults(); });

    renderCostLines();

    $('#applyCostsBtn').addEventListener('click', ()=>{
      COST_LINES.forEach(line=>{
        const el = document.getElementById('cost_'+line.id);
        if(el) state.costs.lines[line.id] = safeNumber(el.value);
      });
      saveState();
      renderResults();
      openTab('benefits');
    });

    $('#resetCostsBtn').addEventListener('click', ()=>{
      state.costs.lines = {};
      saveState();
      renderCostLines();
      renderResults();
    });
  }

  function renderCostLines(){
    const wrap = $('#costLines');
    wrap.innerHTML = '';
    const country = state.current.context.country || 'AUS';

    COST_LINES.forEach(line=>{
      const tag = (line.tagByCountry && line.tagByCountry[country]) ? line.tagByCountry[country] : '';
      const dflt = (line.defaultByCountry && Number.isFinite(line.defaultByCountry[country])) ? line.defaultByCountry[country] : 0;
      const val = (line.id in state.costs.lines) ? state.costs.lines[line.id] : dflt;

      const div = document.createElement('div');
      div.className = 'field';
      div.innerHTML = `
        <label for="cost_${esc(line.id)}">${esc(line.label)} ${tag ? `<span class="pill">${esc(tag)}</span>` : ''}</label>
        <input id="cost_${esc(line.id)}" type="number" min="0" step="100" value="${esc(String(val||0))}" />
        <div class="help">${esc(line.hint)}</div>
      `;
      wrap.appendChild(div);
    });

    // styling for tag pills
    if(!document.getElementById('pillStyle')){
      const st = document.createElement('style');
      st.id = 'pillStyle';
      st.textContent = `.pill{display:inline-block;margin-left:8px;padding:2px 8px;border-radius:999px;background:#eef4fb;border:1px solid var(--border);font-weight:650;color:var(--muted);font-size:.82rem;}`;
      document.head.appendChild(st);
    }
  }

  function totalCostsForScenario(s){
    const horizonFactor = (s.context.horizonMonths || 12) / 12;
    let total = 0;

    // Apply only relevant lines; testing lines included only if testing alternative is enabled
    COST_LINES.forEach(line=>{
      const v = safeNumber(state.costs.lines[line.id] || 0);
      if((line.id === 'testing_resource' || line.id === 'testing_time') && state.costs.includeTestingAlt !== 'yes'){
        return;
      }
      total += v * horizonFactor;
    });

    return total;
  }

  function costBreakdownForScenario(s){
    const horizonFactor = (s.context.horizonMonths || 12) / 12;
    const rows = [];
    COST_LINES.forEach(line=>{
      if((line.id === 'testing_resource' || line.id === 'testing_time') && state.costs.includeTestingAlt !== 'yes'){
        return;
      }
      const v = safeNumber(state.costs.lines[line.id] || 0) * horizonFactor;
      rows.push({label: line.label, value: v});
    });
    return rows;
  }

  // ---- Benefits ----
  function initBenefits(){
    $('#valuationMethod').value = state.benefits.valuationMethod;
    $('#vsl').value = state.benefits.vsl || '';
    $('#vsly').value = state.benefits.vsly || '';
    $('#lifeYearsPerDeath').value = state.benefits.lifeYearsPerDeath || '';
    $('#willingnessToPayQaly').value = state.benefits.willingnessToPayQaly || '';
    $('#qalysPerDeath').value = state.benefits.qalysPerDeath || '';

    $('#includeMorbidity').value = state.benefits.includeMorbidity;
    $('#hospAverted').value = state.benefits.hospAverted;
    $('#icuAverted').value = state.benefits.icuAverted;
    $('#longCovidAverted').value = state.benefits.longCovidAverted;
    $('#costPerHosp').value = state.benefits.costPerHosp;
    $('#costPerICU').value = state.benefits.costPerICU;
    $('#costPerLongCovid').value = state.benefits.costPerLongCovid;

    $('#prefModelMode').value = state.preferenceModel.mode || 'builtin_mxl';
    $('#policyAcceptabilityWeight').value = state.benefits.policyAcceptabilityWeight;

    showHideValuationFields();
    showHideMorbidity();

    $('#valuationMethod').addEventListener('change', ()=>{
      state.benefits.valuationMethod = $('#valuationMethod').value;
      saveState();
      showHideValuationFields();
      renderResults();
    });

    $('#includeMorbidity').addEventListener('change', ()=>{
      state.benefits.includeMorbidity = $('#includeMorbidity').value;
      saveState();
      showHideMorbidity();
      renderResults();
    });

    $('#prefModelMode').addEventListener('change', ()=>{
      state.preferenceModel.mode = $('#prefModelMode').value;
      state.preferenceModel.coeff = null;
      state.preferenceModel.bundles = null;
      saveState();
      togglePrefUpload();
    renderPreferenceStatus();
      renderResults();
    });

    $('#policyAcceptabilityWeight').addEventListener('change', ()=>{
      state.benefits.policyAcceptabilityWeight = $('#policyAcceptabilityWeight').value;
      saveState();
      renderResults();
    });

    $('#prefFile').addEventListener('change', async (e)=>{
      const file = e.target.files && e.target.files[0];
      if(!file) return;
      try{
        const txt = await file.text();
        const json = JSON.parse(txt);
        if(state.preferenceModel.mode === 'coeff'){
          state.preferenceModel.coeff = json;
          state.preferenceModel.bundles = null;
        }else if(state.preferenceModel.mode === 'bundle'){
          state.preferenceModel.bundles = json;
          state.preferenceModel.coeff = null;
        }else{
          // ignore
        }
        saveState();
        togglePrefUpload();
    renderPreferenceStatus();
        renderResults();
      }catch(err){
        renderPreferenceStatus('Failed to load JSON: ' + (err && err.message ? err.message : 'unknown error'));
      }finally{
        $('#prefFile').value = '';
      }
    });

    $('#applyBenefitsBtn').addEventListener('click', ()=>{
      state.benefits.vsl = safeNumber($('#vsl').value);
      state.benefits.vsly = safeNumber($('#vsly').value);
      state.benefits.lifeYearsPerDeath = safeNumber($('#lifeYearsPerDeath').value);
      state.benefits.willingnessToPayQaly = safeNumber($('#willingnessToPayQaly').value);
      state.benefits.qalysPerDeath = safeNumber($('#qalysPerDeath').value);

      state.benefits.hospAverted = safeNumber($('#hospAverted').value);
      state.benefits.icuAverted = safeNumber($('#icuAverted').value);
      state.benefits.longCovidAverted = safeNumber($('#longCovidAverted').value);
      state.benefits.costPerHosp = safeNumber($('#costPerHosp').value);
      state.benefits.costPerICU = safeNumber($('#costPerICU').value);
      state.benefits.costPerLongCovid = safeNumber($('#costPerLongCovid').value);

      saveState();
      renderResults();
      openTab('results');
    });

    $('#resetBenefitsBtn').addEventListener('click', ()=>{
      state.benefits = defaultInputs().benefits;
      state.preferenceModel = defaultInputs().preferenceModel;
      saveState();
      initBenefits();
      renderResults();
    });

    togglePrefUpload();
    renderPreferenceStatus();
  }

  function showHideValuationFields(){
    const method = $('#valuationMethod').value;
    $$('[data-show-when]').forEach(el=>{
      const rule = el.getAttribute('data-show-when'); // e.g. valuationMethod:VSL
      const [k,v] = rule.split(':');
      if(k === 'valuationMethod'){
        el.style.display = (method === v) ? '' : 'none';
      }
    });
  }

  
  function togglePrefUpload(){
    const mode = $('#prefModelMode').value;
    const show = (mode === 'coeff' || mode === 'bundle');
    const fld = $('#prefUploadField');
    if(fld) fld.style.display = show ? '' : 'none';
  }
function showHideMorbidity(){
    const on = $('#includeMorbidity').value === 'yes';
    $('#morbidityBlock').classList.toggle('is-hidden', !on);
    if(!document.getElementById('morbStyle')){
      const st = document.createElement('style');
      st.id = 'morbStyle';
      st.textContent = `.morbidity-block.is-hidden{display:none}`;
      document.head.appendChild(st);
    }
  }

  function livesSavedTotal(s){
    const pop = safeNumber(s.context.population || 0);
    const horizonFactor = (s.context.horizonMonths || 12) / 12;
    const livesPer100k = safeNumber(s.design.livesPer100k || 0);
    if(pop <= 0) return 0;
    // Simple proportional scaling by horizon
    return (livesPer100k * (pop / 100000)) * horizonFactor;
  }

  function benefitsMonetary(s){
    const method = state.benefits.valuationMethod;
    const deathsAverted = livesSavedTotal(s);

    let healthValue = null;
    if(method === 'VSL'){
      const vsl = safeNumber(state.benefits.vsl);
      if(vsl > 0) healthValue = deathsAverted * vsl;
    }else if(method === 'VSLY'){
      const vsly = safeNumber(state.benefits.vsly);
      const ly = safeNumber(state.benefits.lifeYearsPerDeath);
      if(vsly > 0 && ly > 0) healthValue = deathsAverted * ly * vsly;
    }else if(method === 'QALY'){
      const wtp = safeNumber(state.benefits.willingnessToPayQaly);
      const q = safeNumber(state.benefits.qalysPerDeath);
      if(wtp > 0 && q > 0) healthValue = deathsAverted * q * wtp;
    }else if(method === 'NONE'){
      healthValue = null;
    }

    let morbidityValue = 0;
    if(state.benefits.includeMorbidity === 'yes'){
      morbidityValue += safeNumber(state.benefits.hospAverted) * safeNumber(state.benefits.costPerHosp);
      morbidityValue += safeNumber(state.benefits.icuAverted) * safeNumber(state.benefits.costPerICU);
      morbidityValue += safeNumber(state.benefits.longCovidAverted) * safeNumber(state.benefits.costPerLongCovid);
    }

    // Only add morbidity value if healthValue is monetary OR method is NONE (then morbidity could still be monetary)
    if(healthValue === null && method !== 'NONE'){
      // Not enough info to monetise; return null as "monetisation not available"
      return null;
    }

    if(method === 'NONE'){
      // report only morbidityValue (if any)
      return morbidityValue > 0 ? morbidityValue : null;
    }

    return (healthValue || 0) + morbidityValue;
  }

  function benefitBreakdownForScenario(s){
    const rows = [];
    const deathsAverted = livesSavedTotal(s);
    rows.push({label:'Deaths averted (from lives saved per 100,000)', value: deathsAverted, type:'physical'});
    const method = state.benefits.valuationMethod;

    const monetary = benefitsMonetary(s);
    if(monetary !== null){
      rows.push({label:'Total monetised benefits', value: monetary, type:'money'});
    }else{
      rows.push({label:'Monetised benefits', value: null, type:'money'});
    }

    if(state.benefits.includeMorbidity === 'yes'){
      rows.push({label:'Hospitalisations averted', value: safeNumber(state.benefits.hospAverted), type:'physical'});
      rows.push({label:'ICU admissions averted', value: safeNumber(state.benefits.icuAverted), type:'physical'});
      rows.push({label:'Long COVID cases averted', value: safeNumber(state.benefits.longCovidAverted), type:'physical'});
    }
    return rows;
  }

  // ---- Preference model (support) ----
  function renderPreferenceStatus(msg){
    const el = $('#prefStatus');
    const mode = state.preferenceModel.mode;
    if(msg){
      el.textContent = msg;
      return;
    }
    let text = '';
    if(mode === 'none'){
      text = 'No preference model loaded.';
    }else if(mode === 'builtin_mxl'){
      text = 'Built-in MXL estimates loaded (your country-by-frame means).';
    }else if(mode === 'builtin_lc'){
      text = 'Built-in latent class estimates loaded (class shares + class-specific utilities).';
    }else if(mode === 'coeff'){
      text = state.preferenceModel.coeff ? 'Coefficient JSON loaded.' : 'Awaiting coefficient JSON upload.';
    }else if(mode === 'bundle'){
      text = state.preferenceModel.bundles ? 'Predicted support table loaded.' : 'Awaiting predicted support table upload.';
    }else{
      text = 'Preference model not configured.';
    }
    el.textContent = text;
  }

  function utilityPolicy(beta, s){
    const lives = safeNumber(s.design.livesPer100k);
    let V = 0;
    V += (beta.ASC_policy || 0);
    V += (beta.scope2 || 0) * (s.design.scope === 'scope2' ? 1 : 0);
    V += (beta.exemption2 || 0) * (s.design.exemptions === 'exemption2' ? 1 : 0);
    V += (beta.exemption3 || 0) * (s.design.exemptions === 'exemption3' ? 1 : 0);
    V += (beta.coverage2 || 0) * (s.design.coverage === 'coverage2' ? 1 : 0);
    V += (beta.coverage3 || 0) * (s.design.coverage === 'coverage3' ? 1 : 0);
    V += (beta.lives || 0) * lives;
    return V;
  }

  function utilityOptOut(beta){
    return (beta.ASC_optout || 0);
  }

  function binarySupportFromBetas(beta, s){
    // Probability of choosing the policy alternative vs opting out:
    // p = exp(V_policy) / (exp(V_policy) + exp(V_optout))
    const Vp = utilityPolicy(beta, s);
    const Vo = utilityOptOut(beta);
    const p = Math.exp(Vp) / (Math.exp(Vp) + Math.exp(Vo));
    return Number.isFinite(p) ? clamp(p, 0, 1) : null;
  }

  function predictedSupport(s){
    const mode = state.preferenceModel.mode;
    if(mode === 'none') return null;

    if(mode === 'builtin_mxl'){
      const model = BUILTIN_PREF.mxl?.[s.context.country]?.[s.context.frame];
      const beta = model?.beta;
      return beta ? binarySupportFromBetas(beta, s) : null;
    }

    if(mode === 'builtin_lc'){
      const block = BUILTIN_PREF.lc?.[s.context.country]?.[s.context.frame];
      const classes = block?.classes;
      if(!Array.isArray(classes) || classes.length === 0) return null;
      let p = 0;
      let wsum = 0;
      for(const c of classes){
        const w = safeNumber(c.share);
        const beta = c.beta || {};
        const pc = binarySupportFromBetas(beta, s);
        if(pc === null) continue;
        p += w * pc;
        wsum += w;
      }
      if(wsum <= 0) return null;
      return clamp(p / wsum, 0, 1);
    }

    if(mode === 'bundle' && state.preferenceModel.bundles && Array.isArray(state.preferenceModel.bundles.support)){
      const keyLives = safeNumber(s.design.livesPer100k);
      const found = state.preferenceModel.bundles.support.find(r =>
        r.country === s.context.country &&
        r.frame === s.context.frame &&
        r.scope === s.design.scope &&
        r.exemptions === s.design.exemptions &&
        r.coverage === s.design.coverage &&
        safeNumber(r.livesPer100k) === keyLives
      );
      if(found && Number.isFinite(Number(found.pSupport))) return Number(found.pSupport);
      return null;
    }

    if(mode === 'coeff' && state.preferenceModel.coeff){
      try{
        const m = state.preferenceModel.coeff.models;
        if(!m) return null;
        const model = m[s.context.country] && m[s.context.country][s.context.frame];
        const beta = model && model.beta;
        if(!beta) return null;

        // Support computed as policy vs opt-out using ASC_policy and ASC_optout (preferred).
        // Backward-compat: if ASC_policy not provided, assume 0.
        const b = {
          ASC_policy: beta.ASC_policy || 0,
          ASC_optout: beta.ASC_optout || beta.ASC_noMandate || 0,
          scope2: beta.scope2 || 0,
          exemption2: beta.exemption2 || 0,
          exemption3: beta.exemption3 || 0,
          coverage2: beta.coverage2 || 0,
          coverage3: beta.coverage3 || 0,
          lives: beta.lives || 0
        };
        return binarySupportFromBetas(b, s);
      }catch(_){
        return null;
      }
    }

    return null;
  }

  // ---- Results ----
  function initResults(){
    updateScenarioSelector();
    $('#selectedScenario').addEventListener('change', ()=>{ renderSelectedScenario(); });

    $('#runSensitivityBtn').addEventListener('click', runSensitivity);

    renderResults();
  }

  function updateScenarioSelector(){
    const sel = $('#selectedScenario');
    if(!sel) return;
    sel.innerHTML = '';
    if(state.scenarios.length === 0){
      const opt = document.createElement('option');
      opt.value = '';
      opt.textContent = 'No saved scenarios';
      sel.appendChild(opt);
      renderSelectedScenario();
      return;
    }
    state.scenarios.forEach((s, idx)=>{
      const opt = document.createElement('option');
      opt.value = String(idx);
      opt.textContent = s.name;
      sel.appendChild(opt);
    });
    if(sel.value === '' || Number(sel.value) >= state.scenarios.length) sel.value = '0';
    renderSelectedScenario();
  }

  function renderResults(){
    const tbody = $('#resultsTbody');
    tbody.innerHTML = '';
    if(state.scenarios.length === 0){
      const tr = document.createElement('tr');
      tr.innerHTML = `<td colspan="8" class="muted">Save at least one scenario to view results.</td>`;
      tbody.appendChild(tr);
      renderSelectedScenario();
      return;
    }

    state.scenarios.forEach((s)=>{
      const lives = livesSavedTotal(s);
      const costs = totalCostsForScenario(s);
      const benefits = benefitsMonetary(s);
      const net = (benefits !== null) ? (benefits - costs) : null;
      const bcr = (benefits !== null && costs > 0) ? (benefits / costs) : null;
      const ps = predictedSupport(s);
      const weightedNet = (net !== null && ps !== null && state.benefits.policyAcceptabilityWeight === 'yes') ? (net * ps) : null;

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${esc(s.name)}</td>
        <td class="right">${fmtNum(lives,2)}</td>
        <td class="right">${benefits === null ? '—' : fmtInt(benefits)}</td>
        <td class="right">${fmtInt(costs)}</td>
        <td class="right">${net === null ? '—' : fmtInt(net)}</td>
        <td class="right">${bcr === null ? '—' : fmtNum(bcr,2)}</td>
        <td class="right">${ps === null ? '—' : fmtNum(ps,2)}</td>
        <td class="right">${weightedNet === null ? '—' : fmtInt(weightedNet)}</td>
      `;
      tbody.appendChild(tr);
    });

    renderSelectedScenario();
  }

  function renderSelectedScenario(){
    const idx = Number($('#selectedScenario') ? $('#selectedScenario').value : NaN);
    const kpiBlock = $('#kpiBlock');
    const costTbody = $('#costBreakdownTbody');
    const benTbody = $('#benefitBreakdownTbody');

    kpiBlock.innerHTML = '';
    costTbody.innerHTML = '';
    benTbody.innerHTML = '';

    if(!Number.isFinite(idx) || idx < 0 || idx >= state.scenarios.length){
      kpiBlock.innerHTML = `<div class="muted">Select a scenario.</div>`;
      return;
    }

    const s = state.scenarios[idx];
    const lives = livesSavedTotal(s);
    const costs = totalCostsForScenario(s);
    const benefits = benefitsMonetary(s);
    const net = (benefits !== null) ? (benefits - costs) : null;
    const bcr = (benefits !== null && costs > 0) ? (benefits / costs) : null;
    const ps = predictedSupport(s);

    const kpis = [
      {k:'Total lives saved', v: fmtNum(lives,2)},
      {k:'Total costs ('+state.currency+')', v: fmtInt(costs)},
      {k:'Total benefits ('+state.currency+')', v: benefits === null ? '—' : fmtInt(benefits)},
      {k:'Net benefit ('+state.currency+')', v: net === null ? '—' : fmtInt(net)},
      {k:'Benefit–cost ratio', v: bcr === null ? '—' : fmtNum(bcr,2)},
      {k:'Predicted support', v: ps === null ? '—' : fmtNum(ps,2)}
    ];

    kpis.forEach(x=>{
      const div = document.createElement('div');
      div.className = 'kpi';
      div.innerHTML = `<div class="k">${esc(x.k)}</div><div class="v">${esc(x.v)}</div>`;
      kpiBlock.appendChild(div);
    });

    const cb = costBreakdownForScenario(s);
    cb.forEach(r=>{
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${esc(r.label)}</td><td class="right">${fmtInt(r.value)}</td>`;
      costTbody.appendChild(tr);
    });

    const bb = benefitBreakdownForScenario(s);
    bb.forEach(r=>{
      const tr = document.createElement('tr');
      const val = (r.type === 'money')
        ? (r.value === null ? '—' : fmtInt(r.value))
        : fmtNum(safeNumber(r.value),2);
      tr.innerHTML = `<td>${esc(r.label)}</td><td class="right">${esc(val)}</td>`;
      benTbody.appendChild(tr);
    });
  }

  function runSensitivity(){
    const idx = Number($('#selectedScenario').value);
    if(!Number.isFinite(idx) || idx < 0 || idx >= state.scenarios.length){
      $('#sensOutput').textContent = 'Select a scenario first.';
      return;
    }
    const s0 = structuredClone(state.scenarios[idx]);
    const p = $('#sensParam').value;
    const lo = safeNumber($('#sensLow').value);
    const hi = safeNumber($('#sensHigh').value);

    const out = [];

    function evalAt(x){
      const s = structuredClone(s0);
      if(p === 'livesPer100k'){
        s.design.livesPer100k = x;
      }else if(p === 'vsl'){
        state.benefits.vsl = x; // temporary
      }else if(p === 'totalCosts'){
        // multiply all cost lines by x
        // (done on the fly)
      }

      const lives = livesSavedTotal(s);
      let costs = totalCostsForScenario(s);
      if(p === 'totalCosts'){
        costs = costs * x;
      }
      const benefits = benefitsMonetary(s);
      const net = (benefits !== null) ? (benefits - costs) : null;
      const bcr = (benefits !== null && costs > 0) ? (benefits / costs) : null;
      return {x, lives, costs, benefits, net, bcr};
    }

    const a = evalAt(lo);
    const b = evalAt(hi);

    // Restore vsl if we modified it
    if(p === 'vsl'){
      state.benefits.vsl = safeNumber($('#vsl').value);
      saveState();
    }

    out.push(`<div><strong>${esc(p)}</strong>: low=${esc(String(lo))}, high=${esc(String(hi))}</div>`);
    out.push(`<div class="divider"></div>`);
    out.push(`<div><strong>Low</strong> → Lives saved: ${fmtNum(a.lives,2)}; Costs: ${fmtInt(a.costs)}; Benefits: ${a.benefits===null?'—':fmtInt(a.benefits)}; Net: ${a.net===null?'—':fmtInt(a.net)}; BCR: ${a.bcr===null?'—':fmtNum(a.bcr,2)}</div>`);
    out.push(`<div><strong>High</strong> → Lives saved: ${fmtNum(b.lives,2)}; Costs: ${fmtInt(b.costs)}; Benefits: ${b.benefits===null?'—':fmtInt(b.benefits)}; Net: ${b.net===null?'—':fmtInt(b.net)}; BCR: ${b.bcr===null?'—':fmtNum(b.bcr,2)}</div>`);

    $('#sensOutput').innerHTML = out.join('');
  }

  // ---- Export ----
  function initExport(){
    $('#exportJsonBtn').addEventListener('click', ()=>{
      const pkg = {
        exportedAt: new Date().toISOString(),
        build: BUILD,
        currency: state.currency,
        discountRatePct: state.discountRatePct,
        costs: state.costs,
        benefits: state.benefits,
        preferenceModel: {
          mode: state.preferenceModel.mode,
          note: 'Preference JSON files themselves are not exported by default; include them separately for auditing if needed.'
        },
        scenarios: state.scenarios,
        results: state.scenarios.map(s => ({
          name: s.name,
          livesSavedTotal: livesSavedTotal(s),
          totalCosts: totalCostsForScenario(s),
          monetisedBenefits: benefitsMonetary(s),
          predictedSupport: predictedSupport(s)
        }))
      };
      download('vaccine_mandate_decision_aid_export.json', JSON.stringify(pkg, null, 2), 'application/json');
    });

    $('#exportCsvBtn').addEventListener('click', ()=>{
      const rows = [];
      rows.push(['scenario','country','frame','scope','exemptions','coverage','livesPer100k','population','horizonMonths','livesSavedTotal','totalCosts','monetisedBenefits','netBenefit','bcr','predictedSupport'].join(','));
      state.scenarios.forEach(s=>{
        const lives = livesSavedTotal(s);
        const costs = totalCostsForScenario(s);
        const ben = benefitsMonetary(s);
        const net = (ben!==null) ? (ben-costs) : '';
        const bcr = (ben!==null && costs>0) ? (ben/costs) : '';
        const ps = predictedSupport(s);
        rows.push([
          csv(s.name),
          s.context.country,
          s.context.frame,
          s.design.scope,
          s.design.exemptions,
          s.design.coverage,
          s.design.livesPer100k,
          s.context.population,
          s.context.horizonMonths,
          lives,
          costs,
          ben===null?'':ben,
          net,
          bcr,
          ps===null?'':ps
        ].join(','));
      });
      download('vaccine_mandate_results.csv', rows.join('\n'), 'text/csv');
    });

    $('#printBtn').addEventListener('click', ()=> window.print());

    $('#clearAllBtn').addEventListener('click', ()=>{
      localStorage.removeItem(LS_KEY);
      location.reload();
    });

    // References list
    const ol = $('#refsList');
    ol.innerHTML = '';
    REFERENCES.forEach(r=>{
      const li = document.createElement('li');
      li.textContent = r.label;
      ol.appendChild(li);
    });
  }

  function csv(x){
    const s = String(x ?? '');
    if(/[",\n]/.test(s)) return '"' + s.replace(/"/g,'""') + '"';
    return s;
  }

  // ---- Boot ----
  function init(){
    $('#buildStamp').textContent = `Build: ${BUILD}`;
    initNav();
    initConfigure();
    initCosts();
    initBenefits();
    initResults();
    initExport();

    // Re-render cost lines when current country changes (useful for evidence anchors)
    $('#country').addEventListener('change', ()=>{ renderCostLines(); });

    // Initial renders
    togglePrefUpload();
    renderPreferenceStatus();
    renderResults();
  }

  document.addEventListener('DOMContentLoaded', init);
})();