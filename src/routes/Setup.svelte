<script>
  import { createEventDispatcher } from 'svelte';
  import { clubs } from '../lib/api.js';
  const dispatch = createEventDispatcher();

  const EMOJIS  = ['🦅','🐯','🦁','🐺','🦊','🐻','🦈','🐲','⚡','🔥','❄️','🌊','🌙','⭐','💎','🏆','🛡️','⚔️','🎯','💣','🌪️','🦋','🏀','🔱'];
  const COLORS1 = ['#2255a4','#b53030','#1d7a45','#7b2d8b','#c17f00','#1a1a18','#c25c00','#006b6b','#8b1a1a','#1a5c8b','#4a4a8a','#5c7a1a'];
  const COLORS2 = ['#ffffff','#f7f6f2','#e8eef8','#fbeaea','#eaf3ec','#fdf6e0','#f0e8f8','#e8f4f8','#f5f0e8','#e8e8f0','#f8ede8','#eaf0e8'];
  const DIVS    = ['División Este','División Oeste','División Norte','División Sur','Liga Nacional'];

  let step=1, name='', coach='', stadium='', city='';
  let emoji='🦅', color='#2255a4', color2='#e8eef8';
  let division='División Este', difficulty='normal';
  let error='', loading=false;

  async function submit() {
    if (!name.trim()||!coach.trim()) { error='Rellena nombre y entrenador'; return; }
    error=''; loading=true;
    try {
      const res = await clubs.create({ name:name.trim(), coach_name:coach.trim(), emoji, color, color2, city:city.trim()||'Mi Ciudad', stadium_name:stadium.trim()||name.trim()+' Arena', division, difficulty });
      dispatch('created', res);
    } catch(e) { error=e.message; }
    finally { loading=false; }
  }
</script>

<div class="wrap">
  <!-- Progress bar -->
  <div class="progress">
    <div class="progress-fill" style="width:{step*33.3}%"></div>
  </div>

  <div class="hero">{emoji}</div>
  <h1>Crea tu club</h1>

  <!-- Steps -->
  {#if step===1}
    <p class="step-lbl">Paso 1 de 3 — Identidad</p>
    <div class="field"><label>Nombre del club *</label><input bind:value={name} placeholder="Los Cóndores FC..." maxlength="28" /></div>
    <div class="field"><label>Tu nombre (entrenador) *</label><input bind:value={coach} placeholder="Míster García..." maxlength="24" /></div>
    <div class="field"><label>Ciudad</label><input bind:value={city} placeholder="Madrid, Bilbao..." maxlength="20" /></div>
    <div class="field"><label>Nombre del estadio</label><input bind:value={stadium} placeholder="Arena Dorada..." maxlength="32" /></div>
    {#if error}<div class="err">{error}</div>{/if}
    <button class="btn btn-p btn-full" on:click={()=>{if(!name.trim()||!coach.trim()){error='Rellena nombre y entrenador'}else{error='';step=2}}}>Siguiente →</button>

  {:else if step===2}
    <p class="step-lbl">Paso 2 de 3 — Escudo y colores</p>
    <label class="sec-lbl">Escudo</label>
    <div class="emoji-grid">
      {#each EMOJIS as e}
        <button class="em-btn" class:sel={emoji===e} on:click={()=>emoji=e}>{e}</button>
      {/each}
    </div>
    <label class="sec-lbl" style="margin-top:1rem">Color principal</label>
    <div class="swatch-row">
      {#each COLORS1 as c}
        <button class="sw" class:sel={color===c} style="background:{c}" on:click={()=>color=c}></button>
      {/each}
    </div>
    <label class="sec-lbl" style="margin-top:.75rem">Color secundario</label>
    <div class="swatch-row">
      {#each COLORS2 as c}
        <button class="sw" class:sel={color2===c} style="background:{c};border:.5px solid var(--border2)" on:click={()=>color2=c}></button>
      {/each}
    </div>
    <!-- Preview -->
    <div class="preview" style="margin-top:1rem">
      <div class="prev-badge" style="background:{color}">{emoji}</div>
      <div>
        <div style="font-weight:500">{name||'Tu club'}</div>
        <div style="font-size:11px;color:var(--text2);margin-top:2px">{city||'Tu ciudad'}</div>
        <div style="display:flex;gap:5px;margin-top:5px">
          <div style="width:14px;height:14px;border-radius:50%;background:{color}"></div>
          <div style="width:14px;height:14px;border-radius:50%;background:{color2};border:.5px solid var(--border2)"></div>
        </div>
      </div>
    </div>
    <div class="btn-row" style="margin-top:1rem">
      <button class="btn btn-s" on:click={()=>step=1}>← Atrás</button>
      <button class="btn btn-p" style="flex:1" on:click={()=>step=3}>Siguiente →</button>
    </div>

  {:else}
    <p class="step-lbl">Paso 3 de 3 — Liga y dificultad</p>
    <label class="sec-lbl">División</label>
    <div class="div-wrap">
      {#each DIVS as d}
        <button class="div-btn" class:sel={division===d} on:click={()=>division=d}>{d}</button>
      {/each}
    </div>
    <label class="sec-lbl" style="margin-top:1rem">Dificultad</label>
    <div class="diff-wrap">
      {#each [{id:'easy',icon:'🟢',l:'Fácil',d:'Más presupuesto'},{id:'normal',icon:'⚪',l:'Normal',d:'Equilibrado'},{id:'hard',icon:'🔴',l:'Difícil',d:'Sin margen de error'}] as df}
        <button class="diff-btn" class:sel={difficulty===df.id} on:click={()=>difficulty=df.id}>
          <span>{df.icon} {df.l}</span>
          <span class="diff-sub">{df.d}</span>
        </button>
      {/each}
    </div>
    {#if error}<div class="err" style="margin-top:.75rem">{error}</div>{/if}
    <div class="btn-row" style="margin-top:1.25rem">
      <button class="btn btn-s" on:click={()=>step=2}>← Atrás</button>
      <button class="btn btn-p" style="flex:1;background:{color};border-color:{color}" disabled={loading} on:click={submit}>
        {loading?'Creando...':'▷ Empezar'}
      </button>
    </div>
  {/if}
</div>

<style>
  .wrap { min-height:100dvh; padding:1.5rem 1.25rem calc(1.5rem + env(safe-area-inset-bottom)); background:var(--bg); max-width:480px; margin:0 auto; }
  .progress { height:3px; background:var(--border); border-radius:2px; margin-bottom:1.5rem; overflow:hidden; }
  .progress-fill { height:3px; background:var(--accent); border-radius:2px; transition:width .3s; }
  .hero { font-size:44px; text-align:center; margin-bottom:.5rem; }
  h1 { font-size:20px; font-weight:500; text-align:center; margin-bottom:1.25rem; }
  .step-lbl { font-size:10px; letter-spacing:.12em; text-transform:uppercase; color:var(--text2); margin-bottom:.85rem; }
  .field { margin-bottom:.85rem; }
  .field label { display:block; font-size:10px; letter-spacing:.1em; text-transform:uppercase; color:var(--text2); margin-bottom:.35rem; }
  .field input { width:100%; padding:11px 12px; font-size:16px; font-family:var(--mono); border:.5px solid var(--border2); border-radius:var(--rs); background:var(--surface); color:var(--text); outline:none; }
  .field input:focus { border-color:var(--accent); }
  .err { background:var(--red-bg); color:var(--red); border-radius:var(--rs); padding:8px 12px; font-size:12px; margin-bottom:.75rem; }
  .emoji-grid { display:grid; grid-template-columns:repeat(8,1fr); gap:5px; }
  .em-btn { font-size:20px; padding:6px; border-radius:var(--rs); border:.5px solid var(--border); cursor:pointer; background:transparent; min-height:40px; }
  .em-btn.sel { background:var(--accent-l); border-color:var(--accent); transform:scale(1.1); }
  .swatch-row { display:flex; gap:8px; flex-wrap:wrap; }
  .sw { width:32px; height:32px; border-radius:50%; cursor:pointer; border:2px solid transparent; min-height:32px; }
  .sw.sel { border-color:var(--text); transform:scale(1.15); }
  .preview { display:flex; align-items:center; gap:1rem; padding:.85rem 1rem; background:var(--surface); border:.5px solid var(--border2); border-radius:var(--r); }
  .prev-badge { width:48px; height:48px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:24px; flex-shrink:0; }
  .btn-row { display:flex; gap:8px; }
  .div-wrap { display:flex; flex-wrap:wrap; gap:8px; }
  .div-btn { padding:8px 14px; font-size:12px; font-family:var(--mono); border:.5px solid var(--border2); border-radius:var(--rs); cursor:pointer; background:var(--surface); color:var(--text); min-height:40px; }
  .div-btn.sel { background:var(--accent-l); border-color:var(--accent); color:var(--accent); font-weight:500; }
  .diff-wrap { display:flex; flex-direction:column; gap:8px; }
  .diff-btn { display:flex; justify-content:space-between; align-items:center; padding:12px 14px; font-size:13px; font-family:var(--mono); border:.5px solid var(--border2); border-radius:var(--r); cursor:pointer; background:var(--surface); color:var(--text); min-height:52px; }
  .diff-btn.sel { background:var(--accent-l); border-color:var(--accent); color:var(--accent); }
  .diff-sub { font-size:11px; color:inherit; opacity:.65; }
</style>
