<script>
  import { createEventDispatcher } from 'svelte';
  import { auth } from '../lib/api.js';
  const dispatch = createEventDispatcher();
  let mode='login', email='', username='', password='', error='', loading=false;

  async function submit() {
    error=''; loading=true;
    try {
      const res = mode==='login'
        ? await auth.login({email,password})
        : await auth.register({email,username,password});
      dispatch('loggedIn', res.user);
    } catch(e) { error=e.message; }
    finally { loading=false; }
  }
</script>

<div class="wrap">
  <div class="box">
    <div class="icon">🏀</div>
    <h1>Basketball Manager</h1>
    <p class="sub">El juego de gestión de baloncesto</p>

    <div class="tabs">
      <button class:active={mode==='login'}    on:click={()=>{mode='login';error=''}}>Entrar</button>
      <button class:active={mode==='register'} on:click={()=>{mode='register';error=''}}>Crear cuenta</button>
    </div>

    <form on:submit|preventDefault={submit}>
      <div class="field">
        <label>Email</label>
        <input type="email" bind:value={email} placeholder="tu@email.com" autocomplete="email" required />
      </div>
      {#if mode==='register'}
        <div class="field">
          <label>Usuario</label>
          <input type="text" bind:value={username} placeholder="NombreEntrenador" minlength="3" maxlength="24" required autocomplete="username" />
        </div>
      {/if}
      <div class="field">
        <label>Contraseña</label>
        <input type="password" bind:value={password} placeholder="mínimo 8 caracteres" minlength="8" required autocomplete={mode==='login'?'current-password':'new-password'} />
      </div>
      {#if error}<div class="err">{error}</div>{/if}
      <button type="submit" class="btn btn-p btn-full" disabled={loading}>
        {loading ? 'Cargando...' : mode==='login' ? 'Entrar al juego ▷' : 'Crear cuenta'}
      </button>
    </form>
  </div>
</div>

<style>
  .wrap {
    min-height: 100dvh; display: flex; align-items: center; justify-content: center;
    padding: 1.5rem; background: var(--bg);
  }
  .box {
    background: var(--surface); border: .5px solid var(--border2);
    border-radius: 16px; padding: 2rem; width: 100%; max-width: 400px;
    box-shadow: 0 4px 32px rgba(0,0,0,.1);
  }
  .icon { font-size: 40px; text-align: center; margin-bottom: .5rem; }
  h1 { font-size: 20px; font-weight: 500; text-align: center; margin-bottom: .25rem; }
  .sub { font-size: 12px; color: var(--text2); text-align: center; margin-bottom: 1.5rem; }
  .tabs { display: flex; border: .5px solid var(--border2); border-radius: var(--rs); overflow: hidden; margin-bottom: 1.25rem; }
  .tabs button { flex:1; padding:9px; font-size:13px; font-family:var(--mono); background:transparent; border:none; cursor:pointer; color:var(--text2); min-height:44px; }
  .tabs button.active { background:var(--accent); color:#fff; }
  .field { margin-bottom: .85rem; }
  .field label { display:block; font-size:10px; letter-spacing:.1em; text-transform:uppercase; color:var(--text2); margin-bottom:.35rem; }
  .field input { width:100%; padding:10px 12px; font-size:16px; font-family:var(--mono); border:.5px solid var(--border2); border-radius:var(--rs); background:var(--surface2); color:var(--text); outline:none; }
  .field input:focus { border-color:var(--accent); }
  .err { background:var(--red-bg); color:var(--red); border-radius:var(--rs); padding:8px 12px; font-size:12px; margin-bottom:.85rem; }
</style>
