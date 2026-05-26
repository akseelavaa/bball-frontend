<script>
  import './app.css';
  import { onMount } from 'svelte';
  import { isLoggedIn, auth, clubs } from './lib/api.js';
  import { user, clubState, toastMsg } from './stores/index.js';
  import Login  from './routes/Login.svelte';
  import Setup  from './routes/Setup.svelte';
  import Shell  from './routes/Shell.svelte';

  let screen = 'loading';

  onMount(async () => {
    if (!isLoggedIn()) { screen='login'; return; }
    try {
      const me = await auth.me();
      user.set(me);
      const data = await clubs.mine();
      if (!data.club) { screen='setup'; return; }
      clubState.set(data);
      screen='game';
    } catch { screen='login'; }
  });

  async function onLoggedIn(e) {
    user.set(e.detail);
    try { const d=await clubs.mine(); if(!d.club){screen='setup';return;} clubState.set(d); screen='game'; }
    catch { screen='setup'; }
  }

  async function onCreated(e) { clubState.set(e.detail); screen='game'; }

  async function refreshClub() {
    const d = await clubs.mine();
    clubState.set(d);
  }
</script>

{#if screen === 'loading'}
  <div style="display:flex;align-items:center;justify-content:center;height:100dvh;gap:12px;font-size:14px;color:var(--text2)">
    <div class="spinner"></div> Cargando...
  </div>

{:else if screen === 'login'}
  <Login on:loggedIn={onLoggedIn} />

{:else if screen === 'setup'}
  <Setup on:created={onCreated} />

{:else}
  <Shell on:refresh={refreshClub} />
{/if}

{#if $toastMsg}
  <div class="toast show">{$toastMsg}</div>
{/if}
