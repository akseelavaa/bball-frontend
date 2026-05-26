<script>
  import { createEventDispatcher, onMount } from 'svelte';
  import { stadium as api } from '../lib/api.js';
  import { toast } from '../stores/index.js';
  const dispatch = createEventDispatcher();
  let data=null, loading=true, building=null;
  onMount(load);
  async function load(){ loading=true; try{data=await api.info();}catch(e){toast(e.message);}finally{loading=false;} }
  async function upgrade(key,name){ building=key; try{await api.upgrade(key);await load();dispatch('refresh');toast('🏗️ '+name+' completada');}catch(e){toast(e.message);}finally{building=null;} }
</script>

<div>
  <div class="pg-title">Estadio</div>
  <div class="pg-sub">{data?.stadium?.name||'—'}</div>
  {#if loading}<div class="loader"><div class="spinner"></div> Cargando...</div>
  {:else if data}
    <div class="g4" style="margin-bottom:1rem">
      <div class="metric"><div class="metric-lbl">Nivel</div><div class="metric-val">{data.stadium.level}</div></div>
      <div class="metric"><div class="metric-lbl">Aforo</div><div class="metric-val" style="font-size:16px">{(data.stadium.cap||0).toLocaleString('es')}</div></div>
      <div class="metric"><div class="metric-lbl">Fans</div><div class="metric-val" style="font-size:16px">{(data.stadium.fans||0).toLocaleString('es')}</div></div>
      <div class="metric"><div class="metric-lbl">Presup.</div><div class="metric-val" style="color:var(--green);font-size:16px">€{(+data.budget).toFixed(1)}M</div></div>
    </div>
    {#each data.upgrades as u}
      <div class="card" style="margin-bottom:8px;padding:.9rem">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px">
          <div>
            <div style="font-size:14px;font-weight:500">{u.icon} {u.name}</div>
            <div style="font-size:11px;color:var(--text2);margin-top:3px;line-height:1.4">{u.desc}</div>
          </div>
          <span class="badge {u.built?'b-green':'b-gray'}">{u.built?'✓':u.currentLevel+'/'+u.maxLevel}</span>
        </div>
        {#if !u.built}
          <div style="display:flex;justify-content:space-between;align-items:center;margin-top:.5rem">
            <span style="font-size:12px;color:var(--text2)">Coste: <strong>€{u.cost}M</strong></span>
            <button class="btn btn-p btn-sm"
              disabled={building===u.key||(+data.budget)<u.cost}
              on:click={()=>upgrade(u.key,u.name)}>
              {building===u.key?'…':(+data.budget)<u.cost?'Sin fondos':'Construir'}
            </button>
          </div>
        {:else}
          <div style="font-size:11px;color:var(--green);margin-top:4px">✓ Activo</div>
        {/if}
      </div>
    {/each}
  {/if}
</div>
