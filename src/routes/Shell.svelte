<script>
  import { createEventDispatcher } from 'svelte';
  import { club, currentPage } from '../stores/index.js';
  import { auth } from '../lib/api.js';
  import Settings from '../components/Settings.svelte';

  import Dashboard from './Dashboard.svelte';
  import Squad     from './Squad.svelte';
  import Match     from './Match.svelte';
  import League    from './League.svelte';
  import Market    from './Market.svelte';
  import Tactics   from './Tactics.svelte';
  import Training  from './Training.svelte';
  import History   from './History.svelte';
  import Stadium   from './Stadium.svelte';
  import Awards    from './Awards.svelte';

  const dispatch = createEventDispatcher();

  // Bottom nav tabs (visible on mobile)
  const TABS = [
    { id:'dashboard', icon:'⌂',  label:'Inicio'  },
    { id:'squad',     icon:'◈',  label:'Equipo'  },
    { id:'match',     icon:'▷',  label:'Partido' },
    { id:'league',    icon:'≡',  label:'Liga'    },
    { id:'more',      icon:'···',label:'Más'     },
  ];

  // All pages accessible from "Más" sheet
  const MORE_ITEMS = [
    { id:'tactics',  icon:'◎', label:'Táctica'  },
    { id:'training', icon:'↑', label:'Entrena'  },
    { id:'market',   icon:'⇄', label:'Mercado'  },
    { id:'history',  icon:'◷', label:'Historial'},
    { id:'stadium',  icon:'□', label:'Estadio'  },
    { id:'awards',   icon:'✦', label:'Logros'   },
  ];

  // Sidebar nav (desktop)
  const SIDEBAR = [
    { section:'Club' },
    { id:'dashboard', icon:'⌂', label:'Dashboard'     },
    { id:'squad',     icon:'◈', label:'Plantilla'     },
    { id:'tactics',   icon:'◎', label:'Táctica'       },
    { id:'training',  icon:'↑', label:'Entrenamiento' },
    { section:'Competición' },
    { id:'match',     icon:'▷', label:'Partido'       },
    { id:'league',    icon:'≡', label:'Liga'          },
    { id:'history',   icon:'◷', label:'Historial'     },
    { section:'Gestión' },
    { id:'market',    icon:'⇄', label:'Mercado'       },
    { id:'stadium',   icon:'□', label:'Estadio'       },
    { id:'awards',    icon:'✦', label:'Logros'        },
  ];

  let showMore = false;
  let showSettings = false;

  $: activePg = $currentPage;
  $: activeTab = TABS.find(t => t.id === activePg) ? activePg
    : MORE_ITEMS.find(m => m.id === activePg) ? 'more'
    : 'dashboard';

  function go(id) {
    if (id === 'more') { showMore = !showMore; return; }
    showMore = false;
    currentPage.set(id);
  }

  async function logout() {
    await auth.logout();
    location.reload();
  }
</script>

<!-- TOPBAR -->
<header class="topbar">
  <div class="club-badge"
    style="background:{$club?.color||'var(--accent)'}"
    on:click={() => showSettings=true}
    role="button" tabindex="0"
    on:keydown={e=>e.key==='Enter'&&(showSettings=true)}>
    {$club?.emoji||'🏀'}
  </div>
  <div>
    <div class="top-name">{$club?.name||'Mi Club'}</div>
    <div class="top-sub">{$club?.city||''}</div>
  </div>
  <div class="topbar-spacer"></div>
  <div class="top-kpi">
    <div class="top-kpi-val">{$club?.wins||0}V·{$club?.losses||0}D</div>
    <div class="top-kpi-lbl">Récord</div>
  </div>
  <div class="vdiv"></div>
  <div class="top-kpi">
    <div class="top-kpi-val" style="color:var(--green)">€{(+($club?.budget||0)).toFixed(1)}M</div>
    <div class="top-kpi-lbl">Budget</div>
  </div>
  <!-- Desktop only extras -->
  <div class="vdiv" style="display:none" id="desk-extras"></div>
  <button class="btn btn-s btn-sm" on:click={()=>showSettings=true} style="font-size:15px;padding:6px 8px;min-height:auto">⚙️</button>
</header>

<!-- DESKTOP SIDEBAR -->
<aside class="sidebar">
  {#each SIDEBAR as item}
    {#if item.section}
      <div class="sb-sec">{item.section}</div>
    {:else}
      <div class="nav-item" class:active={activePg===item.id}
        on:click={() => currentPage.set(item.id)}
        role="button" tabindex="0"
        on:keydown={e=>e.key==='Enter'&&currentPage.set(item.id)}>
        <span class="nav-ic">{item.icon}</span>{item.label}
      </div>
    {/if}
  {/each}
  <div style="margin-top:auto;padding:1rem">
    <button class="btn btn-s btn-full btn-sm" on:click={logout}>Salir</button>
  </div>
</aside>

<!-- MAIN -->
<main class="main">
  {#if activePg==='dashboard'}  <Dashboard on:refresh={()=>dispatch('refresh')} />
  {:else if activePg==='squad'}     <Squad     on:refresh={()=>dispatch('refresh')} />
  {:else if activePg==='match'}     <Match     on:refresh={()=>dispatch('refresh')} />
  {:else if activePg==='league'}    <League    />
  {:else if activePg==='market'}    <Market    on:refresh={()=>dispatch('refresh')} />
  {:else if activePg==='tactics'}   <Tactics   on:refresh={()=>dispatch('refresh')} />
  {:else if activePg==='training'}  <Training  on:refresh={()=>dispatch('refresh')} />
  {:else if activePg==='history'}   <History   />
  {:else if activePg==='stadium'}   <Stadium   on:refresh={()=>dispatch('refresh')} />
  {:else if activePg==='awards'}    <Awards    />
  {/if}
</main>

<!-- BOTTOM NAV (mobile) -->
<nav class="bottom-nav">
  {#each TABS as t}
    <button class="nav-tab" class:active={activeTab===t.id} on:click={()=>go(t.id)}>
      <span class="nav-tab-ic">{t.icon}</span>
      <span>{t.label}</span>
    </button>
  {/each}
</nav>

<!-- MORE SHEET (mobile) -->
{#if showMore}
  <div class="sheet-backdrop" on:click={()=>showMore=false} role="button" tabindex="-1" on:keydown={()=>{}}></div>
{/if}
<div class="more-sheet" class:open={showMore}>
  {#each MORE_ITEMS as m}
    <button class="more-item" class:active={activePg===m.id} on:click={()=>go(m.id)}>
      <span class="more-item-ic">{m.icon}</span>
      <span>{m.label}</span>
    </button>
  {/each}
  <button class="more-item" on:click={logout}>
    <span class="more-item-ic">🚪</span>
    <span>Salir</span>
  </button>
</div>

{#if showSettings}
  <Settings on:close={()=>showSettings=false} on:refresh={()=>dispatch('refresh')} />
{/if}
