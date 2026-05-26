<script>
  import { createEventDispatcher } from 'svelte';
  import { club, myPlayers } from '../stores/index.js';
  import { clubs } from '../lib/api.js';
  import { toast } from '../stores/index.js';
  const dispatch = createEventDispatcher();

  const TACTICS = [
    {id:'fast',   icon:'⚡',name:'Contraataque',  desc:'Ritmo alto, triples', pills:['+Veloc','+Tiro','-Def']},
    {id:'post',   icon:'🦾',name:'Juego interior', desc:'Rebotes, físico',    pills:['+Físico','+Def','-Veloc']},
    {id:'zone',   icon:'🛡️',name:'Zona',           desc:'Cierra perímetro',   pills:['+Def','-Tiro']},
    {id:'motion', icon:'🔄',name:'Motion',          desc:'Pase y espacios',    pills:['+Pase','+Tiro','-Físico']},
    {id:'iso',    icon:'⭐',name:'Aislamiento',     desc:'Protagonismo estr.', pills:['+Tiro','+Bote','-Pase']},
    {id:'press',  icon:'🔥',name:'Presión',         desc:'Roba balones',       pills:['+Def','+Veloc','-Físico']},
  ];

  let selTactic = $club?.tactic||'fast';
  let lineup    = $club?.lineup||[0,1,2,3,4];
  let saving    = false;

  $: players  = $myPlayers;
  $: starters = lineup.slice(0,5).map(i=>players[i]).filter(Boolean);
  $: avgOvr   = starters.length ? Math.round(starters.reduce((s,p)=>s+p.ovr,0)/starters.length) : 0;

  function toggle(i) {
    if (lineup.includes(i)) { if(lineup.length<=5){toast('Mínimo 5');return;} lineup=lineup.filter(x=>x!==i); }
    else lineup=[...lineup,i];
  }

  async function save() {
    saving=true;
    try{ await clubs.setTactic(selTactic,lineup); dispatch('refresh'); toast('✅ Táctica guardada'); }
    catch(e){toast(e.message);}
    finally{saving=false;}
  }
</script>

<div>
  <div class="pg-title">Táctica</div>
  <div class="pg-sub">Sistema y titulares · OVR medio: {avgOvr}</div>

  <div class="g2" style="margin-bottom:1.25rem">
    {#each TACTICS as t}
      <div class="tac-card" class:sel={selTactic===t.id}
        on:click={()=>selTactic=t.id} role="button" tabindex="0" on:keydown={e=>e.key==='Enter'&&(selTactic=t.id)}>
        <div style="font-size:13px;font-weight:500;margin-bottom:3px">{t.icon} {t.name}</div>
        <div style="font-size:11px;color:var(--text2);margin-bottom:6px">{t.desc}</div>
        <div style="display:flex;gap:4px;flex-wrap:wrap">
          {#each t.pills as pill}
            <span style="font-size:10px;padding:1px 6px;border-radius:99px;border:.5px solid {pill.startsWith('+')?'#b5d4f4':'#f7c1c1'};color:{pill.startsWith('+')?'#185fa5':'#a32d2d'}">{pill}</span>
          {/each}
        </div>
      </div>
    {/each}
  </div>

  <div class="sec-lbl">Titulares ({starters.length}/5)</div>
  {#each players as p, i}
    <div class="card" style="margin-bottom:6px">
      <div style="display:flex;align-items:center;gap:10px;padding:.75rem">
        <div style="font-size:10px;color:var(--text2);width:26px">{p.position}</div>
        <div style="flex:1;font-weight:500">#{p.jersey_num} {p.name}</div>
        <div style="color:var(--accent);font-weight:500;min-width:28px;text-align:right">{p.ovr}</div>
        <div style="width:40px;height:4px;border-radius:2px;background:var(--border);overflow:hidden">
          <div style="width:{p.energy}%;height:4px;background:{p.energy>70?'var(--green)':p.energy>40?'var(--warn)':'var(--red)'}"></div>
        </div>
        <button on:click={()=>toggle(i)}
          style="font-size:11px;padding:5px 10px;border-radius:99px;border:.5px solid var(--border2);background:{lineup.includes(i)?'var(--accent-l)':'transparent'};color:{lineup.includes(i)?'var(--accent)':'var(--text2)'};cursor:pointer;font-family:var(--mono);min-height:36px;white-space:nowrap">
          {lineup.includes(i)?'Titular':'Banco'}
        </button>
      </div>
    </div>
  {/each}

  {#if starters.length<5}
    <div style="font-size:12px;color:var(--red);margin-bottom:.75rem">⚠ Necesitas {5-starters.length} titular(es) más</div>
  {/if}

  <button class="btn btn-p btn-full" style="margin-top:.5rem" disabled={saving||starters.length<5} on:click={save}>
    {saving?'Guardando...':'💾 Guardar táctica'}
  </button>
</div>
