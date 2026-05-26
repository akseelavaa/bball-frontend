<script>
  import { createEventDispatcher, onMount } from 'svelte';
  import { market as api } from '../lib/api.js';
  import { club } from '../stores/index.js';
  import { toast } from '../stores/index.js';
  const dispatch = createEventDispatcher();
  let agents=[], scouts=[], loading=true, signingId=null, scoutLoading=false, filterPos='';
  onMount(load);
  async function load(){
    loading=true;
    try{ [agents,scouts]=await Promise.all([api.list({pos:filterPos}),api.scouting()]); }
    catch(e){toast(e.message);}
    finally{loading=false;}
  }
  async function sign(id,name){
    signingId=id;
    try{await api.sign(id);await load();dispatch('refresh');toast('✅ '+name+' fichado');}
    catch(e){toast(e.message);}
    finally{signingId=null;}
  }
  async function scout(){
    scoutLoading=true;
    try{await api.scout();await load();toast('◐ 3 prospectos descubiertos');}
    catch(e){toast(e.message);}
    finally{scoutLoading=false;}
  }
</script>

<div>
  <div class="pg-title">Mercado</div>
  <div class="pg-sub">Presupuesto: <strong style="color:var(--green)">€{(+($club?.budget||0)).toFixed(1)}M</strong></div>

  <!-- Filter row -->
  <div style="display:flex;gap:8px;margin-bottom:1rem;align-items:center">
    <select bind:value={filterPos} on:change={load} style="flex:1;padding:10px;font-size:16px;border:.5px solid var(--border2);background:var(--surface);color:var(--text);border-radius:var(--rs);font-family:var(--mono)">
      <option value="">Todas posiciones</option>
      {#each ['PG','SG','SF','PF','C'] as p}<option>{p}</option>{/each}
    </select>
    <button class="btn btn-s btn-sm" disabled={scoutLoading} on:click={scout}>
      {scoutLoading?'…':'◐ Scout'}
    </button>
  </div>

  {#if loading}
    <div class="loader"><div class="spinner"></div> Cargando...</div>
  {:else}
    {#each agents as p}
      <div class="card" style="margin-bottom:8px">
        <div style="display:flex;align-items:center;gap:10px;padding:.85rem">
          <div style="width:44px;height:44px;border-radius:50%;background:var(--accent-l);display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:500;color:var(--accent);flex-shrink:0">{p.ovr}</div>
          <div style="flex:1;min-width:0">
            <div style="font-weight:500">{p.name}</div>
            <div style="font-size:11px;color:var(--text2);margin-top:1px">{p.position} · {p.age}a · €{(+p.salary).toFixed(1)}M/año</div>
            <div style="display:flex;gap:4px;margin-top:4px;flex-wrap:wrap">
              <span class="badge b-gray" style="font-size:9px">Vel {p.attr_speed}</span>
              <span class="badge b-gray" style="font-size:9px">Tiro {p.attr_shoot}</span>
              <span class="badge b-gray" style="font-size:9px">Def {p.attr_defense}</span>
              <span class="badge b-gold" style="font-size:9px">Pot {p.potential}</span>
            </div>
          </div>
          <button class="btn btn-p btn-sm"
            disabled={signingId===p.id||(+($club?.budget||0))<(+p.salary)}
            on:click={()=>sign(p.id,p.name)}>
            {signingId===p.id?'…':(+($club?.budget||0))<(+p.salary)?'Sin €':'Fichar'}
          </button>
        </div>
      </div>
    {/each}

    {#if scouts.length}
      <div class="sec-lbl" style="margin-top:1rem">Prospectos descubiertos</div>
      {#each scouts as s}
        <div class="card" style="margin-bottom:8px">
          <div style="display:flex;align-items:center;gap:10px;padding:.85rem">
            <div style="width:44px;height:44px;border-radius:50%;background:var(--gold-bg);display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:500;color:var(--gold);flex-shrink:0">{s.ovr}</div>
            <div style="flex:1">
              <div style="font-weight:500">{s.name}</div>
              <div style="font-size:11px;color:var(--text2)">{s.position} · {s.age}a · €{(+s.salary).toFixed(1)}M/año</div>
              <span class="badge b-gold" style="margin-top:4px">Pot {s.potential}</span>
            </div>
            <button class="btn btn-p btn-sm" on:click={()=>sign(s.player_id,s.name)}>Fichar</button>
          </div>
        </div>
      {/each}
    {:else}
      <div class="card card-p" style="text-align:center;color:var(--text2);margin-top:.75rem">
        Pulsa ◐ Scout para descubrir prospectos (€0.3M)
      </div>
    {/if}
  {/if}
</div>
