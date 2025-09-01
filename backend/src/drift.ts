let baseline: { bins: number[]; probs: number[]; at: number } | null = null;

function makeBins(n = 20): number[] {
  const step = 100 / n;
  const edges = Array.from({ length: n + 1 }, (_, i) => +(i * step).toFixed(6));
  edges[edges.length - 1] = 100; // exacto
  return edges;
}
function hist(values: number[], edges: number[]) {
  const n = edges.length - 1;
  const counts = Array(n).fill(0);
  for (const v0 of values) {
    let v = Math.min(100, Math.max(0, v0));
    let i = Math.min(n - 1, Math.floor((v / 100) * n));
    counts[i]++;
  }
  const total = Math.max(1, counts.reduce((a,b)=>a+b,0));
  const probs = counts.map(c => c/total);
  return { counts, probs };
}
function psi(p: number[], q: number[]) {
  const eps = 1e-6;
  let s = 0;
  for (let i=0;i<p.length;i++){
    const pi = Math.max(eps, p[i]);
    const qi = Math.max(eps, q[i]);
    s += (pi - qi) * Math.log(pi/qi);
  }
  return +s.toFixed(6);
}
function ks(p: number[], q: number[]) {
  let maxDiff = 0, cp=0, cq=0;
  for (let i=0;i<p.length;i++){
    cp += p[i]; cq += q[i];
    maxDiff = Math.max(maxDiff, Math.abs(cp - cq));
  }
  return +maxDiff.toFixed(6);
}

export function snapshotBaseline(values: number[], bins = 20) {
  const edges = makeBins(bins);
  const { probs } = hist(values, edges);
  baseline = { bins: edges, probs, at: Date.now() };
  return baseline;
}

export function computeDrift(values: number[], bins = 20) {
  if (!baseline || baseline.bins.length !== bins+1) {
    snapshotBaseline(values, bins); // si no hay baseline, la creamos con snapshot actual
  }
  const edges = baseline!.bins;
  const curr = hist(values, edges);
  const P = curr.probs;
  const Q = baseline!.probs;
  const PSI = psi(P, Q);
  const KS  = ks(P, Q);
  return {
    psi: PSI,
    ks: KS,
    current: { bins: edges, probs: P },
    baseline: { bins: edges, probs: Q, at: baseline!.at }
  };
}