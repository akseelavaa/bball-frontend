const BASE = import.meta.env.VITE_API_URL || '/api';
let _a = localStorage.getItem('at'), _r = localStorage.getItem('rt');
const save  = (a,r) => { _a=a; _r=r; localStorage.setItem('at',a); localStorage.setItem('rt',r); };
const clear = ()    => { _a=_r=null; localStorage.removeItem('at'); localStorage.removeItem('rt'); };

async function req(path, opts={}, retry=true) {
  const h = { 'Content-Type':'application/json', ...(opts.headers||{}) };
  if (_a) h['Authorization'] = `Bearer ${_a}`;
  const res = await fetch(BASE+path, { ...opts, headers:h, body: opts.body ? JSON.stringify(opts.body) : undefined });
  if (res.status===401 && retry && _r) {
    const r2 = await fetch(BASE+'/auth/refresh', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({refreshToken:_r}) });
    if (r2.ok) { const {accessToken} = await r2.json(); save(accessToken,_r); return req(path,opts,false); }
    clear(); throw new Error('Sesión expirada');
  }
  const data = await res.json().catch(()=>({}));
  if (!res.ok) throw new Error(data.error || `Error ${res.status}`);
  return data;
}
const get   = p     => req(p, {method:'GET'});
const post  = (p,b) => req(p, {method:'POST',  body:b});
const patch = (p,b) => req(p, {method:'PATCH', body:b});
const del   = p     => req(p, {method:'DELETE'});

export const isLoggedIn = () => !!_a;
export const auth = {
  register: d => post('/auth/register',d).then(r=>{save(r.accessToken,r.refreshToken);return r;}),
  login:    d => post('/auth/login',d).then(r=>{save(r.accessToken,r.refreshToken);return r;}),
  logout:   () => post('/auth/logout').finally(clear),
  me:       () => get('/auth/me'),
};
export const clubs = {
  mine:      () => get('/clubs/mine'),
  create:    d  => post('/clubs',d),
  update:    d  => patch('/clubs/mine',d),
  setTactic: (t,l) => patch('/clubs/mine/tactic',{tactic:t,lineup:l}),
  matches:   () => get('/clubs/mine/matches'),
};
export const players = {
  mine:  () => get('/players/mine'),
  heal:  id => post(`/players/${id}/heal`),
  rest:  id => post(`/players/${id}/rest`),
  renew: (id,y) => patch(`/players/${id}/renew`,{years:y}),
};
export const league   = { standings: () => get('/league/standings') };
export const market   = { list: (f={}) => get('/market?'+new URLSearchParams(f)), sign: id=>post(`/market/sign/${id}`), scout:()=>post('/market/scout'), scouting:()=>get('/market/scouting') };
export const training = { run: t => post('/train',{type:t}) };
export const stadium  = { info:()=>get('/stadium'), upgrade:k=>post('/stadium/upgrade',{key:k}) };
