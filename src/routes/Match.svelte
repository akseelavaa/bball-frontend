<script>
  import { createEventDispatcher } from 'svelte';
  import { club, myPlayers, nextMatch } from '../stores/index.js';
  import { toast } from '../stores/index.js';
  const dispatch = createEventDispatcher();

  const QNAMES = ['1er cuarto','2do cuarto','3er cuarto','4to cuarto'];
  const rand = (a,b) => a + Math.random()*(b-a);
  const pick = arr => arr[Math.floor(Math.random()*arr.length)];

  let homeScore=0, awayScore=0, clock='10:00', period=QNAMES[0], poss='—';
  let plays=[], playerPerf={}, stats={fg:0,fga:0,reb:0,ast:0,tov:0,threes:0,ft:0,fta:0};
  let qHome=[0,0,0,0], qAway=[0,0,0,0], momentum=0;
  let simRunning=false, simPaused=false, simDone=false, speed=300;
  let elapsed=0, simTimer;

  $: opp = $nextMatch
    ? ($nextMatch.home_club_id===$club?.id ? $nextMatch.away_name : $nextMatch.home_name)
    : 'Rival';
  $: oppOvr = 75;
  $: myOvr = $myPlayers.length
    ? Math.round($myPlayers.slice(0,5).reduce((s,p)=>s+p.ovr,0)/Math.min(5,$myPlayers.length)) : 70;
  $: fgPct = stats.fga>0 ? Math.round(stats.fg/stats.fga*100) : 0;
  $: momText = momentum>=6?'🔥 Dominando':momentum>=3?'↗ Con ventaja':momentum<=-6?`⚠️ ${opp} domina`:momentum<=-3?'↘ Presionados':'Igualado';

  function reset() {
    clearTimeout(simTimer);
    homeScore=0; awayScore=0; clock='10:00'; period=QNAMES[0]; poss='—';
    plays=[]; stats={fg:0,fga:0,reb:0,ast:0,tov:0,threes:0,ft:0,fta:0};
    qHome=[0,0,0,0]; qAway=[0,0,0,0]; momentum=0; elapsed=0;
    playerPerf={};
    $myPlayers.slice(0,5).forEach(p=>{ playerPerf[p.name]={pts:0,reb:0,ast:0}; });
    simRunning=false; simPaused=false; simDone=false;
  }

  function start() { simRunning=true; simPaused=false; simDone=false; step(0); }
  function togglePause() { simPaused=!simPaused; if(!simPaused) step(elapsed); }

  function step(from) {
    if (!simRunning||simPaused) return;
    elapsed = from + rand(10,26);
    if (elapsed>=40*60) { elapsed=40*60; renderClock(); generatePlay(); finish(); return; }
    renderClock();
    generatePlay();
    simTimer = setTimeout(()=>step(elapsed), speed);
  }

  function renderClock() {
    const qtr = Math.min(3,Math.floor(elapsed/(10*60)));
    const rem  = 40*60-elapsed;
    const qSec = Math.round(rem%(10*60));
    clock  = `${Math.floor(qSec/60)}:${String(qSec%60).padStart(2,'0')}`;
    period = QNAMES[qtr];
  }

  function generatePlay() {
    const adv = (myOvr-oppOvr)/100;
    const homeP = Math.random()<0.5+adv*0.15;
    poss = homeP ? ($club?.name||'Local') : opp;
    const starters = $myPlayers.slice(0,5);
    if (!starters.length) return;
    const shooter  = pick(starters);
    const others   = starters.filter(p=>p!==shooter);
    const assister = others.length?pick(others):shooter;
    const defender = pick(starters);
    const qtr = Math.min(3,Math.floor(elapsed/(10*60)));
    const r = Math.random();
    const hitBase = Math.min(0.80,Math.max(0.38, homeP?0.60+adv*0.12:0.60-adv*0.12));

    let html='', hi=false, bad=false;
    const perf = n => { if(!playerPerf[n]) playerPerf[n]={pts:0,reb:0,ast:0}; return playerPerf[n]; };

    if (homeP) {
      if (r<hitBase*0.18) {
        homeScore+=3; stats.fg++; stats.fga++; stats.threes++; stats.ast++; qHome[qtr]+=3; momentum=Math.min(10,momentum+3);
        perf(shooter.name).pts+=3; perf(assister.name).ast++;
        html=`<strong>${shooter.name}</strong> <span style="color:var(--accent);font-weight:500">TRIPLE ⚡</span>`;
        hi=true;
      } else if (r<hitBase*0.58) {
        homeScore+=2; stats.fg++; stats.fga++; stats.ast++; qHome[qtr]+=2; momentum=Math.min(10,momentum+1);
        perf(shooter.name).pts+=2; perf(assister.name).ast++;
        html=Math.random()>0.4?`<strong>${shooter.name}</strong> +2 (asist. ${assister.name})`:`<strong>${shooter.name}</strong> bandeja`;
        hi=true;
      } else if (r<hitBase*0.68) {
        const m=Math.random()>0.2?2:1; homeScore+=m; stats.ft+=m; stats.fta+=2; qHome[qtr]+=m; momentum=Math.min(10,momentum+1);
        perf(shooter.name).pts+=m;
        html=`<strong>${shooter.name}</strong> ${m}/2 TL`;
      } else if (r<0.80) {
        stats.fga++; stats.reb++; momentum=Math.max(-10,momentum-1);
        perf(defender.name).reb++;
        html=`<strong>${shooter.name}</strong> falla — rebote ${defender.name}`;
      } else if (r<0.87) {
        stats.fga++; momentum=Math.max(-10,momentum-2);
        html=`Tiro de <strong>${shooter.name}</strong> bloqueado`;
      } else if (r<0.92) {
        stats.tov++; bad=true; momentum=Math.max(-10,momentum-2);
        html=`Pérdida — <strong>${shooter.name}</strong>`;
      } else {
        html=`Falta personal — ${shooter.name}`;
      }
    } else {
      if (r<hitBase*0.18) { awayScore+=3; qAway[qtr]+=3; momentum=Math.max(-10,momentum-3); html=`<span style="color:var(--text2)">${opp}: triple ⚠️</span>`; bad=true; }
      else if (r<hitBase*0.56) { awayScore+=2; qAway[qtr]+=2; momentum=Math.max(-10,momentum-1); html=`<span style="color:var(--text2)">${opp}: +2</span>`; }
      else if (r<0.80) {
        stats.reb++; momentum=Math.min(10,momentum+1);
        if (Math.random()>0.45) { perf(defender.name).reb++; html=`<strong>${defender.name}</strong> roba el balón`; hi=true; }
        else html=`<span style="color:var(--text2)">${opp}: tiro fallado</span>`;
      } else { html=`<span style="color:var(--text2)">${opp}: pérdida</span>`; }
    }

    const min=Math.floor(elapsed/60), sec=Math.floor(elapsed%60);
    plays = [{time:`${min}:${String(sec).padStart(2,'0')}`,html,hi,bad,score:`${homeScore}–${awayScore}`},...plays.slice(0,59)];
    // force reactivity
    playerPerf = {...playerPerf};
  }

  function finish() {
    simRunning=false; simDone=true;
    const win=homeScore>awayScore;
    toast(win?`🏆 Victoria ${homeScore}–${awayScore} vs ${opp}!`:`Derrota ${homeScore}–${awayScore} vs ${opp}`);
    dispatch('refresh');
  }
</script>

<div>
  <div class="pg-title">Partido</div>
  <div class="pg-sub">J{$nextMatch?.matchday_number||'—'} · {opp}</div>

  <!-- Scoreboard -->
  <div class="card" style="margin-bottom:1rem;overflow:hidden">
    <div class="scoreboard">
      <div class="sb-team">
        <div class="sb-tname">{$club?.name||'Local'}</div>
        <div class="sb-tovr">OVR {myOvr}</div>
        <div class="sb-score sb-h">{homeScore}</div>
        <div style="display:flex;gap:6px;justify-content:center;margin-top:5px;font-size:10px;color:var(--text3)">
          {#each qHome as q,i}<span>Q{i+1}:{q}</span>{/each}
        </div>
      </div>
      <div class="sb-mid">
        <div class="sb-clock">{clock}</div>
        <div class="sb-period">{period}</div>
        <div class="sb-poss">{poss}</div>
        <div style="font-size:10px;margin-top:4px;color:{momentum>0?'var(--green)':momentum<0?'var(--red)':'var(--text3)'}">{momText}</div>
      </div>
      <div class="sb-team">
        <div class="sb-tname">{opp}</div>
        <div class="sb-tovr">OVR {oppOvr}</div>
        <div class="sb-score">{awayScore}</div>
        <div style="display:flex;gap:6px;justify-content:center;margin-top:5px;font-size:10px;color:var(--text3)">
          {#each qAway as q,i}<span>Q{i+1}:{q}</span>{/each}
        </div>
      </div>
    </div>
    <!-- Stats row -->
    <div style="display:grid;grid-template-columns:repeat(4,1fr);border-top:.5px solid var(--border);font-size:11px;text-align:center">
      {#each [[fgPct+'%','% Campo'],[stats.reb,'Reb'],[stats.ast,'Ast'],[stats.tov,'Pérd']] as [v,l]}
        <div style="padding:8px 4px;border-right:.5px solid var(--border)">
          <div style="font-weight:500">{v}</div>
          <div style="color:var(--text3);font-size:10px;margin-top:1px">{l}</div>
        </div>
      {/each}
    </div>
  </div>

  <!-- Controls -->
  <div style="display:flex;gap:8px;margin-bottom:1rem">
    {#if !simRunning && !simDone}
      <button class="btn btn-p" style="flex:1" on:click={start}>▷ Iniciar</button>
    {:else if simDone}
      <button class="btn btn-p" style="flex:1" on:click={reset}>↺ Nuevo partido</button>
    {:else}
      <button class="btn btn-s" style="flex:1" on:click={togglePause}>{simPaused?'▷ Reanudar':'⏸ Pausa'}</button>
    {/if}
    <select bind:value={speed} style="padding:8px;font-size:13px;border:.5px solid var(--border2);background:var(--surface);color:var(--text);border-radius:var(--rs);font-family:var(--mono);min-height:44px">
      <option value={800}>🐢</option>
      <option value={300}>▶</option>
      <option value={80}>⏩</option>
      <option value={8}>⚡</option>
    </select>
  </div>

  <!-- Player performances -->
  {#if Object.keys(playerPerf).some(k=>playerPerf[k].pts>0)}
    <div class="card card-p" style="margin-bottom:1rem">
      <div class="sec-lbl">Actuaciones</div>
      {#each Object.entries(playerPerf).filter(([,v])=>v.pts+v.reb+v.ast>0).sort((a,b)=>b[1].pts-a[1].pts) as [name,perf]}
        <div style="display:flex;justify-content:space-between;font-size:12px;padding:5px 0;border-bottom:.5px solid var(--border)">
          <span style="font-weight:500">{name}</span>
          <span style="color:var(--text2)"><span style="color:{perf.pts>=15?'var(--accent)':'inherit'};font-weight:{perf.pts>=15?'500':'400'}">{perf.pts}pts</span> · {perf.reb}reb · {perf.ast}ast</span>
        </div>
      {/each}
    </div>
  {/if}

  <!-- Play log -->
  <div class="card" style="padding:0;overflow:hidden">
    <div style="padding:.6rem .75rem;border-bottom:.5px solid var(--border2);font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--text2)">Jugadas</div>
    <div class="play-log">
      {#if plays.length===0}
        <div class="pi"><span class="pi-t">—</span><span class="pi-txt" style="color:var(--text3)">El partido aún no ha comenzado.</span></div>
      {:else}
        {#each plays as p}
          <div class="pi" class:pi-hi={p.hi} class:pi-bad={p.bad}>
            <span class="pi-t">{p.time}</span>
            <span class="pi-txt">{@html p.html}</span>
            <span class="pi-sc">{p.score}</span>
          </div>
        {/each}
      {/if}
    </div>
  </div>
</div>
