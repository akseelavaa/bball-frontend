<script>
  import { createEventDispatcher, onMount } from 'svelte';
  import { club, myPlayers, standing, nextMatch, activity, currentPage } from '../stores/index.js';
  import { league } from '../lib/api.js';
  const dispatch = createEventDispatcher();
  let standings=[], loading=true;
  onMount(async()=>{ try{standings=await league.standings();}finally{loading=false;} });
  $: myPos = standings.findIndex(t=>t.user_id===$club?.user_id)+1||'—';
  $: forma = $standing?.forma||[];
</script>

<div>
  <div class="pg-title">Dashboard</div>
  <div class="pg-sub">{$club?.name||'Mi Club'}</div>

  {#if $nextMatch}
    <div class="nm-banner">
      <div>
        <div style="font-size:10px;letter-spacing:.08em;text-transform:uppercase;opacity:.7;margin-bottom:3px">Próximo · J{$nextMatch.matchday_number}</div>
        <div class="nm-match">{$club?.name} vs {$nextMatch.home_club_id===$club?.id?$nextMatch.away_name:$nextMatch.home_name}</div>
        <div class="nm-meta">{new Date($nextMatch.scheduled_at).toLocaleDateString('es',{weekday:'short',day:'numeric',month:'short'})}</div>
      </div>
      <button class="btn-white" on:click={()=>currentPage.set('match')}>▷ Jugar</button>
    </div>
  {/if}

  <div class="g5" style="margin-bottom:1rem">
    <div class="metric"><div class="metric-lbl">V</div><div class="metric-val" style="color:var(--green)">{$club?.wins||0}</div></div>
    <div class="metric"><div class="metric-lbl">D</div><div class="metric-val" style="color:var(--red)">{$club?.losses||0}</div></div>
    <div class="metric"><div class="metric-lbl">OVR</div><div class="metric-val" style="color:var(--accent)">{$myPlayers.length?Math.round($myPlayers.reduce((s,p)=>s+p.ovr,0)/$myPlayers.length):'—'}</div></div>
    <div class="metric"><div class="metric-lbl">Pos.</div><div class="metric-val" style="color:var(--accent)">{myPos}º</div></div>
    <div class="metric"><div class="metric-lbl">💶</div><div class="metric-val" style="color:var(--green);font-size:16px">€{(+($club?.budget||0)).toFixed(1)}M</div></div>
  </div>

  <div class="g2">
    <div class="card card-p">
      <div class="sec-lbl">Actividad</div>
      {#each ($activity||[]).slice(0,6) as a}
        <div style="display:flex;gap:8px;align-items:flex-start;padding:6px 0;border-bottom:.5px solid var(--border);font-size:12px">
          <div style="width:7px;height:7px;border-radius:50%;background:{a.color};margin-top:4px;flex-shrink:0"></div>
          <div style="flex:1;line-height:1.4">{a.text}</div>
        </div>
      {:else}
        <div style="font-size:12px;color:var(--text2)">Sin actividad aún.</div>
      {/each}
    </div>
    <div class="card card-p">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.5rem">
        <div class="sec-lbl" style="margin:0">Clasificación</div>
        {#if myPos !== '—'}<span class="badge b-blue">{myPos}º</span>{/if}
      </div>
      {#if loading}<div class="loader"><div class="spinner"></div></div>
      {:else}
        {#each standings.slice(0,5) as t,i}
          <div style="display:flex;justify-content:space-between;font-size:12px;padding:4px 0;border-bottom:.5px solid var(--border);{t.user_id===$club?.user_id?'color:var(--accent);font-weight:500':''}">
            <span>{i+1}. {t.emoji} {t.club_name}</span><span>{t.pts}pts</span>
          </div>
        {/each}
      {/if}
      {#if forma.length}
        <div style="display:flex;gap:5px;margin-top:.6rem;align-items:center">
          <span style="font-size:10px;color:var(--text2)">Forma</span>
          {#each forma as r}<span class="badge {r==='V'?'b-green':'b-red'}" style="padding:1px 5px">{r}</span>{/each}
        </div>
      {/if}
    </div>
  </div>
</div>
