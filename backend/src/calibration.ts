import { getTop } from "./store";
import { getRecentClaims } from "./claims";
import { getAllEvents } from "./events_store";

function clamp01(x:number){ return Math.max(0, Math.min(1, x)); }
function scoreToProb(score:number, beta=0.25){
  // Mapea score 0..100 a prob 0..beta (ej. beta=0.25 => 25% máx)
  return clamp01(((100 - Math.max(0, Math.min(100, score)))/100) * beta);
}

function makeBins(n=10){
  const step = 100/n;
  const edges = Array.from({length:n+1},(_,i)=>i*step);
  edges[edges.length-1]=100;
  return edges;
}

export function calibrationCurve(days=90, bins=10, beta=0.25){
  const edges = makeBins(bins);
  const scores = getTop(5000).map(s=>({ userId: s.userId, score: s.score }));
  const claims = getRecentClaims(days);
  const cutoff = Date.now() - days*24*60*60*1000;
  const severe = getAllEvents().filter(e=> e.ts>=cutoff && e.severity>=4);

  // etiqueta por usuario: 1 si tuvo claim (o evento severo) en la ventana, 0 si no
  const users = new Map<string, { score:number; p:number; y:number }>();
  const had = new Set<string>(claims.length ? claims.map(c=>c.userId) : severe.map(e=>e.userId));
  for (const s of scores){
    const p = scoreToProb(s.score, beta);
    const y = had.has(s.userId) ? 1 : 0;
    users.set(s.userId, { score: s.score, p, y });
  }

  // binning
  const buckets: { from:number; to:number; pHat:number; yRate:number; n:number }[] = [];
  for (let i=0;i<edges.length-1;i++){
    const from = edges[i], to = edges[i+1];
    let n=0, sumP=0, sumY=0;
    for (const u of users.values()){
      if (u.score>=from && (u.score<to || (i===edges.length-2 && u.score<=to))){
        n++; sumP += u.p; sumY += u.y;
      }
    }
    const pHat = n ? sumP/n : 0;
    const yRate = n ? sumY/n : 0;
    buckets.push({ from, to, pHat:+pHat.toFixed(4), yRate:+yRate.toFixed(4), n });
  }
  const mae = +(
    buckets.reduce((a,b)=>a+Math.abs(b.pHat-b.yRate),0) / Math.max(1,buckets.length)
  ).toFixed(5);

  return { bins: edges, items: buckets, mae };
}

export function brierScore(days=90, beta=0.25){
  const scores = getTop(5000).map(s=>({ userId: s.userId, score: s.score }));
  const claims = getRecentClaims(days);
  const cutoff = Date.now() - days*24*60*60*1000;
  const severe = getAllEvents().filter(e=> e.ts>=cutoff && e.severity>=4);

  const had = new Set<string>(claims.length ? claims.map(c=>c.userId) : severe.map(e=>e.userId));
  let sum = 0, n = 0;
  for (const s of scores){
    const p = scoreToProb(s.score, beta);
    const y = had.has(s.userId) ? 1 : 0;
    sum += Math.pow(p - y, 2);
    n++;
  }
  const brier = +(sum / Math.max(1,n)).toFixed(6);
  return { brier, n };
}