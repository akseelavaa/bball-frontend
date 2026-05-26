<script>
  import { createEventDispatcher } from 'svelte';
  import { club, clubState } from '../stores/index.js';
  import { clubs } from '../lib/api.js';
  import { toast } from '../stores/index.js';
  const dispatch = createEventDispatcher();

  const EMOJIS  = ['🦅','🐯','🦁','🐺','🦊','🐻','🦈','🐲','⚡','🔥','❄️','🌊','🌙','⭐','💎','🏆','🛡️','⚔️','🎯','💣','🌪️','🦋','🏀','🔱'];
  const COLORS1 = ['#2255a4','#b53030','#1d7a45','#7b2d8b','#c17f00','#1a1a18','#c25c00','#006b6b','#8b1a1a','#1a5c8b','#4a4a8a','#5c7a1a'];
  const COLORS2 = ['#ffffff','#f7f6f2','#e8eef8','#fbeaea','#eaf3ec','#fdf6e0','#f0e8f8','#e8f4f8','#f5f0e8','#e8e8f0','#f8ede8','#eaf0e8'];

  let name=$club?.name||'', coach=$club?.coach_name||'', city=$club?.city||'', stad=$club?.stadium_name||'';
  let emoji=$club?.emoji||'🦅', color=$club?.color||'#2255a4', color2=$club?.color2||'#e8eef8';
  let saving=false;

  async function save(){
    saving=true;
    try{
      const updated=await clubs.update({name,coach_name:coach,city,stadium_name:stad,emoji,color,color2});
      clubState.update(s=>s?{...s,club:{...s.club,...updated}}:s);
      document.documentElement.style.setProperty('--accent',color);
      document.documentElement.style.setProperty('--accent-l',color2);
      dispatch('refresh'); dispatch('close'); toast('✅ Guardado');
    }catch(e){toast(e.message);}
    finally{saving=false;}
  }
</script>

<div class="modal-bg" on:click={()=>dispatch('close')} role="button" tabindex="-1" on:keydown={e=>e.key==='Escape'&&dispatch('close')}>
  <div class="modal" on:click|stopPropagation role="dialog">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem">
      <div style="font-size:16px;font-weight:500">⚙️ Ajustes del club</div>
      <button on:click={()=>dispatch('close')} style="background:none;border:none;cursor:pointer;font-size:22px;color:var(--text2);line-height:1;min-height:44px;min-width:44px">×</button>
    </div>

    <div class="f"><label>Nombre del club</label><input bind:value={name} maxlength="28" /></div>
    <div class="f"><label>Entrenador</label><input bind:value={coach} maxlength="24" /></div>
    <div class="f"><label>Ciudad</label><input bind:value={city} maxlength="20" /></div>
    <div class="f"><label>Estadio</label><input bind:value={stad} maxlength="32" /></div>

    <label class="sec-lbl" style="margin-top:.75rem;display:block">Escudo</label>
    <div style="display:grid;grid-template-columns:repeat(8,1fr);gap:5px;margin-bottom:.75rem">
      {#each EMOJIS as e}
        <button class="em" class:sel={emoji===e} on:click={()=>emoji=e}>{e}</button>
      {/each}
    </div>

    <label class="sec-lbl">Color principal</label>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:.75rem">
      {#each COLORS1 as c}
        <button class="sw" class:sel={color===c} style="background:{c}" on:click={()=>color=c}></button>
      {/each}
    </div>

    <label class="sec-lbl">Color secundario</label>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:1rem">
      {#each COLORS2 as c}
        <button class="sw" class:sel={color2===c} style="background:{c};border:.5px solid var(--border2)" on:click={()=>color2=c}></button>
      {/each}
    </div>

    <!-- Preview -->
    <div style="display:flex;align-items:center;gap:.75rem;padding:.75rem;background:var(--surface2);border-radius:var(--rs);margin-bottom:1rem">
      <div style="width:42px;height:42px;border-radius:50%;background:{color};display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0">{emoji}</div>
      <div>
        <div style="font-weight:500">{name||'Tu club'}</div>
        <div style="font-size:11px;color:var(--text2)">{city||'Ciudad'}</div>
      </div>
    </div>

    <div style="display:flex;gap:8px">
      <button class="btn btn-s btn-full" on:click={()=>dispatch('close')}>Cancelar</button>
      <button class="btn btn-p btn-full" disabled={saving} on:click={save}>{saving?'Guardando...':'Guardar'}</button>
    </div>
  </div>
</div>

<style>
  .f { margin-bottom:.75rem; }
  .f label { display:block; font-size:10px; letter-spacing:.1em; text-transform:uppercase; color:var(--text2); margin-bottom:.3rem; }
  .f input { width:100%; padding:10px 12px; font-size:16px; font-family:var(--mono); border:.5px solid var(--border2); border-radius:var(--rs); background:var(--surface2); color:var(--text); outline:none; }
  .f input:focus { border-color:var(--accent); }
  .em { font-size:18px; padding:5px; border-radius:var(--rs); border:.5px solid var(--border); cursor:pointer; background:transparent; min-height:36px; }
  .em.sel { background:var(--accent-l); border-color:var(--accent); }
  .sw { width:30px; height:30px; border-radius:50%; cursor:pointer; border:2px solid transparent; }
  .sw.sel { border-color:var(--text); transform:scale(1.15); }
</style>
