<script>
  import { onMount } from 'svelte';
  const AT = localStorage.getItem('at');
  let list=[], loading=true;
  onMount(async()=>{
    try{
      const res=await fetch('/api/achievements',{headers:{Authorization:`Bearer ${AT}`}});
      if(res.ok) list=await res.json();
    }finally{loading=false;}
  });
  $: unlocked=list.filter(a=>a.unlocked).length;
</script>

<div>
  <div class="pg-title">Logros</div>
  <div class="pg-sub">{unlocked}/{list.length} desbloqueados</div>
  {#if loading}<div class="loader"><div class="spinner"></div></div>
  {:else}
    {#each list as a}
      <div class="card" style="margin-bottom:8px;display:flex;align-items:center;gap:1rem;padding:.85rem;opacity:{a.unlocked?1:.4};filter:{a.unlocked?'none':'grayscale(1)'}">
        <div style="font-size:28px;flex-shrink:0">{a.icon}</div>
        <div style="flex:1">
          <div style="font-weight:500">{a.name}</div>
          <div style="font-size:11px;color:var(--text2);margin-top:2px">{a.desc}</div>
        </div>
        {#if a.unlocked}<span class="badge b-gold">✓</span>{/if}
      </div>
    {/each}
  {/if}
</div>
