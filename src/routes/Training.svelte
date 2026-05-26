<script>
  import { createEventDispatcher } from 'svelte';
  import { training as api } from '../lib/api.js';
  import { club } from '../stores/index.js';
  import { toast } from '../stores/index.js';
  const dispatch = createEventDispatcher();

  const SESSIONS = [
    {id:'shooting',icon:'🏀',name:'Tiro',       desc:'Tiro +2, Bote +1',    morale:5,  energy:-10},
    {id:'defense', icon:'🛡️',name:'Defensa',    desc:'Defensa +2, Físico +1',morale:3, energy:-12},
    {id:'passing', icon:'🤝',name:'Pase',        desc:'Pase +2, Química +5', morale:8,  energy:-8, chem:5},
    {id:'fitness', icon:'💪',name:'Físico',      desc:'+25 energía',          morale:5,  energy:25},
    {id:'mental',  icon:'🧠',name:'Mental',      desc:'+15 moral',            morale:15, energy:-5},
    {id:'video',   icon:'📹',name:'Vídeo',       desc:'+3 OVR vs rival',      morale:2,  energy:0},
  ];

  let busy=null;
  $: sessions=$club?.train_sessions??3;

  async function run(type) {
    if (sessions<=0){toast('Sin sesiones disponibles');return;}
    busy=type;
    try{ await api.run(type); dispatch('refresh'); toast('✅ Sesión completada'); }
    catch(e){toast(e.message);}
    finally{busy=null;}
  }
</script>

<div>
  <div class="pg-title">Entrenamiento</div>
  <div class="pg-sub">
    <span style="color:{sessions>0?'var(--green)':'var(--red)'}">
      {sessions} sesión{sessions!==1?'es':''} disponible{sessions!==1?'s':''}
    </span> · Se reponen tras cada jornada
  </div>

  <div class="g2">
    {#each SESSIONS as s}
      <button class="train-btn" disabled={sessions<=0||busy===s.id} on:click={()=>run(s.id)}>
        <span class="train-ic">{s.icon}</span>
        <span class="train-name">{s.name}</span>
        <span class="train-desc">{s.desc}</span>
        <div class="train-pills">
          {#if s.energy>0}<span class="badge b-green" style="font-size:9px">+{s.energy}⚡</span>{:else if s.energy<0}<span class="badge b-warn" style="font-size:9px">{s.energy}⚡</span>{/if}
          {#if s.morale>0}<span class="badge b-blue" style="font-size:9px">+{s.morale}😊</span>{/if}
          {#if s.chem}<span class="badge b-gold" style="font-size:9px">+{s.chem}🤝</span>{/if}
        </div>
      </button>
    {/each}
  </div>
</div>

<style>
  .train-btn {
    display:flex; flex-direction:column; align-items:flex-start; gap:4px;
    padding:.9rem; background:var(--surface); border:.5px solid var(--border2);
    border-radius:var(--r); cursor:pointer; font-family:var(--mono);
    text-align:left; transition:all .12s; min-height:120px;
    -webkit-tap-highlight-color:transparent;
  }
  .train-btn:disabled { opacity:.45; cursor:not-allowed; }
  .train-btn:not(:disabled):active { background:var(--accent-l); border-color:var(--accent); }
  .train-ic   { font-size:22px; }
  .train-name { font-size:13px; font-weight:500; }
  .train-desc { font-size:11px; color:var(--text2); line-height:1.3; }
  .train-pills { display:flex; gap:4px; flex-wrap:wrap; margin-top:2px; }
</style>
