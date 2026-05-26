import { writable, derived } from 'svelte/store';

export const user        = writable(null);
export const clubState   = writable(null);
export const club        = derived(clubState, $s => $s?.club     || null);
export const myPlayers   = derived(clubState, $s => $s?.players  || []);
export const standing    = derived(clubState, $s => $s?.standing || null);
export const nextMatch   = derived(clubState, $s => $s?.nextMatch|| null);
export const activity    = derived(clubState, $s => $s?.activity || []);
export const currentPage = writable('dashboard');
export const toastMsg    = writable('');

let _tt;
export function toast(msg, dur = 3000) {
  toastMsg.set(msg);
  clearTimeout(_tt);
  _tt = setTimeout(() => toastMsg.set(''), dur);
}
