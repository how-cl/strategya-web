// Dashboard EVOL Conductor — lee track_record.json y lo pinta. Sin frameworks.
const ASSET_VAR = { BTC: '--c-btc', ETH: '--c-eth', SOL: '--c-sol', SUI: '--c-sui', GOLD: '--c-gold', CASH: '--c-cash' };
const MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_ES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

function fmtPct(v, { sign = true, dec = 1 } = {}) {
  const n = Number(v);
  const abs = Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });
  const pre = n < 0 ? '−' : (n > 0 && sign ? '+' : '');
  return `${pre}${abs}%`;
}
function sgn(v) { return v > 0 ? 'pos' : v < 0 ? 'neg' : 'neu'; }
function assetColor(a) { return `var(${ASSET_VAR[a] || '--c-cash'})`; }
function fmtPrice(v) { return Number(v).toLocaleString('en-US', { maximumFractionDigits: Math.abs(Number(v)) < 10 ? 4 : 2 }); }
function dot(a) { return `<span class="asset-dot" style="background:${assetColor(a)}"></span>`; }

function heatStyle(v) {
  if (v === 0) return 'background:rgba(255,255,255,.025);color:#5a6478;';
  const a = Math.min(0.82, 0.16 + Math.abs(v) / 35 * 0.62);
  return v > 0
    ? `background:rgba(63,185,80,${a.toFixed(3)});color:#eafff1;`
    : `background:rgba(240,86,63,${a.toFixed(3)});color:#ffece8;`;
}

function render(d) {
  const s = d.summary, cs = d.current_state || {};
  const yr = String(d.updated).slice(0, 4);

  const cards = [
    { ic: '📈', lbl: `YTD ${yr}`, val: fmtPct(s.ytd_growth_pct), cls: sgn(s.ytd_growth_pct), sub: `All-time (backtest): ${fmtPct(s.all_time_return_pct)}` },
    { ic: '🎯', lbl: 'Win rate', val: fmtPct(s.win_rate_pct, { sign: false }), cls: 'neu', sub: `Mensual ${Math.round(s.monthly_win_rate_pct)}% · ${s.wins}W / ${s.losses}L` },
    { ic: '📊', lbl: 'Retorno mensual prom.', val: fmtPct(s.avg_monthly_return_pct, { dec: 2 }), cls: sgn(s.avg_monthly_return_pct), sub: `Trade prom. ${fmtPct(s.avg_trade_return_pct, { dec: 2 })}` },
    { ic: '◎', lbl: 'Max drawdown', val: fmtPct(s.max_drawdown_pct), cls: 'neg', sub: `Hold prom. ${Number(s.avg_holding_days).toFixed(1)} días` },
    { ic: '↗', lbl: 'Mejor mes', val: fmtPct(s.best_month.pct), cls: 'pos', sub: s.best_month.label },
    { ic: '↘', lbl: 'Peor mes', val: fmtPct(s.worst_month.pct), cls: 'neg', sub: s.worst_month.label },
    { ic: '✓', lbl: 'Win prom.', val: fmtPct(s.avg_win_pct, { dec: 2 }), cls: 'pos', sub: 'Promedio ganador' },
    { ic: '✕', lbl: 'Loss prom.', val: fmtPct(s.avg_loss_pct, { dec: 2 }), cls: 'neg', sub: 'Promedio perdedor' },
  ];
  const kpis = cards.map(c =>
    `<div class="kpi"><div class="lbl"><span class="ic">${c.ic}</span>${c.lbl}</div>
     <div class="val ${c.cls}">${c.val}</div><div class="sub">${c.sub}</div></div>`).join('');

  const cur = new Date(`${d.updated}T00:00:00Z`);
  const curY = cur.getUTCFullYear(), curM = cur.getUTCMonth();
  const heatHead = `<tr><th class="yr"></th>${MONTHS_ES.map(m => `<th>${m}</th>`).join('')}<th class="tot">Total</th></tr>`;
  const heatRows = d.monthly.map(row => {
    const cells = MONTHS_EN.map((mk, i) => {
      if (row.year === curY && i > curM) return '<td class="fut" style="color:#3a4357">·</td>';
      const v = Number(row.months[mk] ?? 0);
      return `<td style="${heatStyle(v)}">${v.toFixed(1)}</td>`;
    }).join('');
    return `<tr><td class="yr">${row.year}</td>${cells}<td class="tot ${sgn(row.total)}">${fmtPct(row.total)}<span class="ratio">${row.positive}</span></td></tr>`;
  }).join('');

  const trades = d.trades.map(t => {
    const isOpen = cs.open && t.asset === cs.asset && t.entry === cs.since;
    const col = assetColor(t.asset);
    return `<div class="trade" style="border-left-color:${col}">
      <div class="t-left">
        <span class="t-asset"><span style="color:${col}">●</span> ${t.asset}${isOpen ? ' <span class="badge-open">ABIERTO</span>' : ''}</span>
        <span class="t-dates">${t.entry} → ${t.exit} · ${t.days}d</span>
      </div>
      <span class="t-ret ${sgn(t.return_pct)}">${fmtPct(t.return_pct, { dec: 2 })}</span>
    </div>`;
  }).join('');

  // Banner de POSICIÓN ACTUAL — modo ESTADO (descriptivo), no es una orden de trade.
  // Lidera con el activo que la estrategia mantiene; el lector de un dashboard (pull)
  // siempre llega tarde al cierre, así que NO se presenta como señal accionable.
  const r = d.rotation;
  let banner = '';
  if (r) {
    const held = `<span class="b-asset">${dot(r.to)}${r.to}</span>`;
    const chip = r.today ? ' <span class="b-tag">CAMBIÓ HOY</span>' : '';
    let ctx;
    if (r.from && r.today) {
      ctx = `Rotó hoy desde <span class="b-asset">${dot(r.from)}${r.from}</span> · al cierre del ${r.since} (00:00 UTC)`;
    } else if (r.from) {
      ctx = `Sin cambios desde ${r.since} · ${r.days_ago}d en posición`;
    } else {
      ctx = `Desde ${r.since} · ${r.days_ago}d en posición`;
    }
    banner = `<div class="banner${r.today ? ' today' : ''}">
      <div class="b-main">📍 Posición actual: ${held}${chip}</div>
      <div class="b-sub">${ctx}</div>
      <div class="b-sub">Estado al cierre diario (00:00 UTC) · informativo, no es una orden ni recomendación.</div>
    </div>`;
  }

  // Tabla de precios por activo (último cierre + % vs día/semana/mes/año).
  let pricesBlock = '';
  if (d.prices && d.prices.assets) {
    const refCell = ref => ref ? `<td class="${sgn(ref.change_pct)}">${fmtPct(ref.change_pct, { dec: 2 })}</td>` : '<td class="neu">—</td>';
    const rows = Object.entries(d.prices.assets).map(([a, p]) =>
      `<tr>
        <td class="p-asset">${dot(a)}${a}</td>
        <td class="p-close">${fmtPrice(p.close)}</td>
        ${refCell(p.refs['1d'])}${refCell(p.refs['1w'])}${refCell(p.refs['1m'])}${refCell(p.refs['1y'])}
      </tr>`).join('');
    pricesBlock = `<div class="section">
      <div class="s-head"><h2>💹 Precios</h2></div>
      <table class="prices">
        <thead><tr><th class="p-asset">Activo</th><th>Último cierre</th><th>Día</th><th>Semana</th><th>Mes</th><th>Año</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <div class="p-asof">Último cierre: <b>${d.prices.as_of}</b></div>
    </div>`;
  }

  document.getElementById('app').innerHTML = `
    ${banner}
    ${pricesBlock}
    <div class="head">
      <div>
        <div class="title-row"><h1>${d.strategy}</h1><span class="badge-sim">Backtest simulado — no es performance real</span></div>
        <div class="subtitle">${d.subtitle}</div>
      </div>
      <div class="meta">Actualizado <b>${d.updated}</b><br>go-live forward: <b>${d.go_live}</b></div>
    </div>
    <div class="kpis">${kpis}</div>
    <div class="section">
      <div class="s-head"><h2>📅 Performance mensual</h2></div>
      <table class="heat"><thead>${heatHead}</thead><tbody>${heatRows}</tbody></table>
    </div>
    <div class="section">
      <div class="s-head"><h2>⚡ Historial de trades</h2><span class="s-note">${s.total_trades} trades · ${s.wins}W / ${s.losses}L</span></div>
      <div class="trades">${trades}</div>
    </div>
    <div class="foot">${d.disclaimer}<span class="dot">·</span>Estado actual: <b>${cs.asset}</b> desde ${cs.since} (${cs.days}d)</div>`;
}

fetch('./track_record.json')
  .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
  .then(render)
  .catch(err => { document.getElementById('app').innerHTML = `<div class="loading">No se pudo cargar track_record.json (${err}). Sírvelo con un servidor (no file://).</div>`; });
