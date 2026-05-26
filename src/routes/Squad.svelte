<script>
  import { createEventDispatcher, onMount } from 'svelte';
  import { players as api } from '../lib/api.js';
  import { toast } from '../stores/index.js';
  const dispatch = createEventDispatcher();
  let list=[], loading=true, sel=null;
  onMount(load);
  async function load(){ loading=true; try{list=await api.mine();}catch(e){toast(e.message);}finally{loading=false;} }
  const eColor=e=>e>70?'var(--green)':e>40?'var(--warn)':'var(--red)';
  async function heal(p){ try{await api.heal(p.id);await load();dispatch('refresh');toast('✅ '+p.name+' recuperado');}catch(e){toast(e.message);} }
  async function rest(p){ try{await api.rest(p.id);await load();dispatch('refresh');toast('😴 '+p.name+' descansando');}catch(e){toast(e.message);} }
</script>

<div>
  <div class="pg-title">Plantilla</div>
  <div class="pg-sub">{list.length} jugadores · {list.filter(p=>p.status==='injured').length} lesionados</div>
  {#if loading}<div class="loader"><div class="spinner"></div> Cargando...</div>
  {:else}
    {#each list as p}
      <div class="card" style="margin-bottom:8px;overflow:hidden">
        <div style="display:flex;align-items:center;gap:10px;padding:.85rem;cursor:pointer" on:click={()=>sel=sel?.id===p.id?null:p}>
          <div style="font-size:22px;width:38px;height:38px;border-radius:50%;background:var(--surface2);display:flex;align-items:center;justify-content:center;font-weight:500;color:var(--accent);flex-shrink:0">{p.ovr}</div>
          <div style="flex:1;min-width:0">
            <div style="font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{p.name}</div>
            <div style="font-size:11px;color:var(--text2);margin-top:1px">{p.position} · {p.age}a · €{(+p.salary).toFixed(1)}M/a</div>
          </div>
          <div style="text-align:right;flex-shrink:0">
            {#if p.status==='injured'}<span class="badge b-red">🤕</span>
            {:else if p.status==='tired'}<span class="badge b-warn">Cansado</span>
            {:else}<span class="badge b-green">✓</span>{/if}
          </div>
        </div>
        <!-- Energy bar -->
        <div style="height:3px;background:var(--border);overflow:hidden">
          <div style="width:{p.energy}%;height:3px;background:{eColor(p.energy)};transition:width .4s"></div>
        </div>

        {#if sel?.id===p.id}
          <div style="padding:.85rem;background:var(--surface2);border-top:.5px solid var(--border)">
            <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:.75rem">
              <span class="badge b-blue">OVR {p.ovr}</span>
              <span class="badge b-gold">Pot {p.potential}</span>
              <span class="badge {p.energy>70?'b-green':p.energy>40?'b-warn':'b-red'}">⚡{p.energy}%</span>
              <span style="font-size:12px;color:var(--text2)">{p.contract_years}a contrato</span>
            </div>
            <!-- XP -->
            <div style="display:flex;align-items:center;gap:8px;font-size:12px;margin-bottom:.75rem">
              <span style="color:var(--text2)">XP</span>
              <div style="flex:1;height:5px;background:var(--border);border-radius:3px;overflow:hidden"><div style="width:{p.xp||0}%;height:5px;border-radius:3px;background:var(--gold)"></div></div>
              <span style="color:var(--gold)">{p.xp||0}/100</span>
            </div>
            <!-- Attrs -->
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:5px 1rem;margin-bottom:.85rem">
              {#each [['Velocidad',p.attr_speed],['Tiro',p.attr_shoot],['Pase',p.attr_pass],['Defensa',p.attr_defense],['Bote',p.attr_dribble],['Físico',p.attr_physic]] as [n,v]}
                <div style="font-size:11px;display:flex;justify-content:space-between;padding:3px 0;border-bottom:.5px solid var(--border)">
                  <span style="color:var(--text2)">{n}</span><span style="font-weight:500">{v}</span>
                </div>
              {/each}
            </div>
            <div style="display:flex;gap:8px">
              {#if p.status==='injured'}
                <button class="btn btn-sm" style="flex:1;background:var(--red-bg);color:var(--red);border-color:var(--red)" on:click={()=>heal(p)}>💊 Curar (€0.2M)</button>
              {:else}
                <button class="btn btn-s btn-sm btn-full" on:click={()=>rest(p)}>😴 Dar descanso</button>
              {/if}
            </div>
          </div>
        {/if}
      </div>
    {/each}
  {/if}
</div>
