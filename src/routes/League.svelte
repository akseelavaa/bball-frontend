<script>
  import { onMount } from 'svelte';
  import { club } from '../stores/index.js';
  import { league as leagueApi } from '../lib/api.js';
  let standings=[], loading=true;
  onMount(async()=>{ try{standings=await leagueApi.standings();}finally{loading=false;} });
</script>

<div>
  <div class="pg-title">Liga</div>
  <div class="pg-sub">{$club?.division||'División'}</div>
  {#if loading}
    <div class="loader"><div class="spinner"></div> Cargando...</div>
  {:else}
    <!-- Mobile: card list -->
    <div class="sb-list">
      {#each standings as t, i}
        <div class="sb-row" class:my={t.user_id===$club?.user_id}>
          <div class="sb-pos">{i+1}{i<4?'●':''}</div>
          <div class="sb-info">
            <div style="font-weight:500">{t.emoji} {t.club_name}{t.user_id===$club?.user_id?' ◀':''}</div>
            <div style="font-size:11px;color:var(--text2);margin-top:2px">{t.wins}V · {t.losses}D · {t.gf-t.gc>=0?'+':''}{t.gf-t.gc}</div>
          </div>
          <div style="text-align:right">
            <div style="font-size:18px;font-weight:500">{t.pts}</div>
            <div style="font-size:9px;color:var(--text2)">pts</div>
          </div>
          <div class="fp-col">
            {#each (t.forma||[]).slice(-5) as r}
              <div class="fp {r==='V'?'fp-w':'fp-l'}">{r}</div>
            {/each}
          </div>
        </div>
      {/each}
      {#if standings.length===0}
        <div class="card card-p" style="text-align:center;color:var(--text2)">Sin datos de clasificación.</div>
      {/if}
    </div>

    <!-- Desktop: table -->
    <div class="card desktop-table" style="padding:0;overflow:hidden;display:none">
      <div class="table-wrap">
        <table>
          <thead><tr><th>#</th><th>Equipo</th><th>PJ</th><th>V</th><th>D</th><th>+/-</th><th>Pts</th><th>Forma</th></tr></thead>
          <tbody>
            {#each standings as t,i}
              <tr class="{t.user_id===$club?.user_id?'my-row':''}">
                <td style="color:var(--text3)">{i+1}</td>
                <td style="text-align:left">{t.emoji} {t.club_name}</td>
                <td>{t.pj}</td><td style="color:var(--green)">{t.wins}</td><td style="color:var(--red)">{t.losses}</td>
                <td style="color:{t.diff>=0?'var(--green)':'var(--red)'}">{t.diff>=0?'+':''}{t.diff}</td>
                <td style="font-weight:500">{t.pts}</td>
                <td><div class="fp-row">{#each (t.forma||[]) as r}<div class="fp {r==='V'?'fp-w':'fp-l'}">{r}</div>{/each}</div></td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  {/if}
</div>

<style>
  .sb-list { display:flex; flex-direction:column; gap:6px; }
  .sb-row {
    display:flex; align-items:center; gap:10px;
    background:var(--surface); border:.5px solid var(--border2);
    border-radius:var(--r); padding:.75rem;
  }
  .sb-row.my { background:var(--accent-l); border-color:var(--accent); }
  .sb-row.my .sb-pos, .sb-row.my .sb-info div { color:var(--accent); }
  .sb-pos { font-size:16px; font-weight:500; color:var(--text3); min-width:26px; }
  .sb-info { flex:1; }
  .fp-col { display:flex; flex-direction:column; gap:2px; }
  .fp { width:14px; height:14px; border-radius:2px; font-size:9px; display:flex; align-items:center; justify-content:center; font-weight:500; }
  .fp-w { background:var(--green-bg); color:var(--green); }
  .fp-l { background:var(--red-bg); color:var(--red); }
  @media (min-width:640px) {
    .sb-list { display:none; }
    .desktop-table { display:block !important; }
  }
</style>
