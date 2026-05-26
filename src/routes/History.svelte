<script>
  import { onMount } from 'svelte';
  import { clubs } from '../lib/api.js';
  let matches=[], loading=true;
  onMount(async()=>{ try{matches=await clubs.matches();}finally{loading=false;} });
  $: wins   = matches.filter(m=>(m.side==='home'&&m.home_score>m.away_score)||(m.side==='away'&&m.away_score>m.home_score)).length;
  $: losses = matches.length-wins;
</script>

<div>
  <div class="pg-title">Historial</div>
  <div class="pg-sub">{matches.length} partidos jugados</div>

  {#if matches.length}
    <div class="g4" style="margin-bottom:1rem">
      <div class="metric"><div class="metric-lbl">PJ</div><div class="metric-val">{matches.length}</div></div>
      <div class="metric"><div class="metric-lbl">V</div><div class="metric-val" style="color:var(--green)">{wins}</div></div>
      <div class="metric"><div class="metric-lbl">D</div><div class="metric-val" style="color:var(--red)">{losses}</div></div>
      <div class="metric"><div class="metric-lbl">%V</div><div class="metric-val" style="color:var(--accent)">{matches.length?Math.round(wins/matches.length*100):0}%</div></div>
    </div>
  {/if}

  {#if loading}
    <div class="loader"><div class="spinner"></div> Cargando...</div>
  {:else if matches.length===0}
    <div class="card card-p" style="text-align:center;color:var(--text2)">Aún no has jugado ningún partido.</div>
  {:else}
    {#each matches as m}
      {@const win=(m.side==='home'&&m.home_score>m.away_score)||(m.side==='away'&&m.away_score>m.home_score)}
      <div class="card" style="margin-bottom:8px;display:flex;align-items:center;gap:1rem;padding:.85rem">
        <div style="font-size:22px;font-weight:500;color:{win?'var(--accent)':'var(--red)'};min-width:64px">{m.home_score}–{m.away_score}</div>
        <div style="flex:1;min-width:0">
          <div style="font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">vs {m.side==='home'?m.away_name:m.home_name}</div>
          <div style="font-size:11px;color:var(--text2);margin-top:1px">J{m.matchday_number} · {m.home_fg_pct||0}% campo · {m.home_threes||0} triples</div>
        </div>
        <span class="badge {win?'b-green':'b-red'}">{win?'V':'D'}</span>
      </div>
    {/each}
  {/if}
</div>
