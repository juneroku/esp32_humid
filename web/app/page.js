'use client';
import { useEffect, useState } from 'react';

function useFetch(url){
  const [data,setData]=useState(null);
  const [err,setErr]=useState(null);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{ let alive=true;(async()=>{
    try{ setLoading(true); const r=await fetch(url,{cache:'no-store'}); if(!r.ok) throw new Error('HTTP '+r.status);
      const j=await r.json(); if(alive) setData(j);
    }catch(e){ if(alive) setErr(String(e)); }finally{ if(alive) setLoading(false); }
  })(); return ()=>{alive=false}; },[url]);
  return {data,err,loading};
}

export default function Page(){
  const {data,err,loading} = useFetch('/api/latest?limit=60');
  const latest = data?.latest;
  const series = data?.recent ?? [];

  const temps = series.map(x=>x.temp);
  const hums  = series.map(x=>x.hum);
  const times = series.map(x=>x.ts);

  return (
    <div style={{display:'grid',gap:16}}>
      <section className="card hero">
        <div>
          <div className="muted" style={{fontSize:12}}>KMITL-FIGHT • HUMID (DHT11/22)</div>
          <h1 style={{margin:'4px 0 8px 0'}}>Live Temperature & Humidity</h1>
          <div className="muted" style={{fontSize:12}}>ESP32 posts to /api/ingest with Bearer token</div>
        </div>
        <div style={{textAlign:'right'}}>
          <div style={{fontSize:34,fontWeight:900}}>{latest?.temp ?? '—'}°C</div>
          <div className="muted">Humidity: <b>{latest?.hum ?? '—'}%</b></div>
          <div className="muted" style={{fontSize:12}}>{latest?.ts ? new Date(latest.ts).toLocaleString() : '—'}</div>
        </div>
      </section>

      <section className="card">
        <h2 style={{margin:'4px 0 12px'}}>Charts</h2>
        {loading && <div className="muted">Loading…</div>}
        {err && <div style={{color:'#b91c1c'}}>Error: {err}</div>}
        {!loading && !err && series.length>0 && (
          <>
            <LineChart xs={times} ys={temps} label="Temperature (°C)"/>
            <div style={{height:10}}/>
            <LineChart xs={times} ys={hums} label="Humidity (%)" colorVar="--bar"/>
          </>
        )}
      </section>
    </div>
  );
}

// Smooth line chart
function LineChart({ xs, ys, height=200, label, colorVar='--line' }){
  if(!ys?.length) return <div className="muted">No data</div>;
  const w=820,h=height,p=18;
  const min=Math.min(...ys), max=Math.max(...ys);
  const X=i=>p+(i/(ys.length-1))*(w-2*p);
  const Y=v=>p+(1-(v-min)/(max-min||1))*(h-2*p);
  const pts = ys.map((v,i)=>({x:X(i), y:Y(v)}));
  const t=0.5;
  const d=(()=>{
    if(pts.length<2) return '';
    const segs=[`M${pts[0].x},${pts[0].y}`];
    for(let i=0;i<pts.length-1;i++){
      const p0=pts[i-1]||pts[i], p1=pts[i], p2=pts[i+1], p3=pts[i+2]||p2;
      const cp1x=p1.x+((p2.x-p0.x)/6)*t, cp1y=p1.y+((p2.y-p0.y)/6)*t;
      const cp2x=p2.x-((p3.x-p1.x)/6)*t, cp2y=p2.y-((p3.y-p1.y)/6)*t;
      segs.push(`C${cp1x},${cp1y},${cp2x},${cp2y},${p2.x},${p2.y}`);
    }
    return segs.join(' ');
  })();
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} role="img" aria-label={label}>
      <rect x="0" y="0" width={w} height={h} rx="18" fill="var(--surface)" stroke="var(--border)"/>
      {Array.from({length:5},(_,i)=>{
        const yy = p + i*(h-2*p)/4;
        return <line key={i} x1={p} y1={yy} x2={w-p} stroke="var(--grid)" strokeDasharray="6 8"/>;
      })}
      <path d={d} fill="none" stroke={`var(${colorVar})`} strokeWidth="3"/>
      {ys.map((v,i)=><circle key={i} cx={X(i)} cy={Y(v)} r="3" fill={`var(${colorVar})`} />)}
      <text x={w-18} y={p-6} textAnchor="end" fontSize="12" fill="var(--muted)">
        max {Number.isFinite(max)?max.toFixed(1):'—'}
      </text>
      <text x={w-18} y={h-6} textAnchor="end" fontSize="12" fill="var(--muted)">
        min {Number.isFinite(min)?min.toFixed(1):'—'}
      </text>
    </svg>
  );
}
