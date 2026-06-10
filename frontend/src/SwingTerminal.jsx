import { useState, useEffect, useRef, useCallback } from "react";

// ─── API config ───────────────────────────────────────────────────────────────
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

async function apiFetch(path) {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

function useApi(path, defaultValue) {
  const [data, setData]     = useState(defaultValue);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState(null);

  const load = useCallback(async (url) => {
    setLoading(true);
    setError(null);
    try {
      const d = await apiFetch(url);
      setData(d);
    } catch(e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(path); }, [path]);
  return { data, loading, error, reload: () => load(path) };
}

const C = {
  bg:"#F7F6F2", surface:"#FFFFFF", border:"#E4E2DA", borderMed:"#CCC9BE",
  text:"#1A1916", muted:"#6B6860", faint:"#9C9A92",
  accent:"#1B4FD8", accentSoft:"#EBF0FD",
  green:"#147A3B", greenBg:"#E8F5EE",
  red:"#C0272D",   redBg:"#FDECEA",
  amber:"#8A5C00", amberBg:"#FEF3DC",
  purple:"#5B3FBE",purpleBg:"#F0ECFF",
  teal:"#0D6E6E",  tealBg:"#E4F5F5",
};

const GLOBAL_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  html,body{background:${C.bg};font-family:'DM Sans',sans-serif;color:${C.text}}
  ::-webkit-scrollbar{width:5px;height:5px}
  ::-webkit-scrollbar-track{background:${C.border}}
  ::-webkit-scrollbar-thumb{background:${C.borderMed};border-radius:3px}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}
  @keyframes ticker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
  @keyframes fadeIn{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}
`;

const sign = n => n >= 0 ? "+" : "";
const ts = () => new Date().toLocaleTimeString("en-US",{hour12:false,hour:"2-digit",minute:"2-digit",second:"2-digit"});

// ─── Mock data ────────────────────────────────────────────────────────────────
const TAPE = [
  {sym:"SPY",val:542.18,chg:+0.84},{sym:"QQQ",val:471.30,chg:+1.12},
  {sym:"IWM",val:208.44,chg:+0.33},{sym:"VIX",val:18.42,chg:-4.20},
  {sym:"DXY",val:103.82,chg:-0.18},{sym:"TNX",val:4.32,chg:+0.02},
  {sym:"NVDA",val:1082.3,chg:+2.14},{sym:"TSLA",val:248.9,chg:-1.08},
  {sym:"AAPL",val:192.4,chg:+0.44},{sym:"META",val:498.4,chg:+1.78},
];

const MOMENTUM_BY_PERIOD = {
  "1W": [
    {ticker:"NBIS", price:34.80,  chg:+18.4, vol:"8.4M",  dVol:"5.8×", mktCap:"2.9B",  adr:8.1, signal:"Momentum+EP"},
    {ticker:"CRDO", price:38.42,  chg:+12.1, vol:"14.2M", dVol:"4.2×", mktCap:"4.1B",  adr:6.8, signal:"Momentum"},
    {ticker:"AVAV", price:196.10, chg:+9.8,  vol:"3.8M",  dVol:"7.1×", mktCap:"8.2B",  adr:5.1, signal:"Momentum+EP"},
    {ticker:"RXRX", price:8.80,   chg:+14.2, vol:"22.1M", dVol:"6.1×", mktCap:"1.8B",  adr:8.8, signal:"Momentum"},
    {ticker:"IONQ", price:42.30,  chg:+11.3, vol:"9.4M",  dVol:"3.9×", mktCap:"7.2B",  adr:7.9, signal:"Momentum"},
    {ticker:"MARA", price:18.20,  chg:+13.6, vol:"38.2M", dVol:"2.8×", mktCap:"4.4B",  adr:9.2, signal:"Momentum"},
    {ticker:"RKLB", price:28.90,  chg:+8.9,  vol:"11.2M", dVol:"3.2×", mktCap:"12.8B", adr:6.2, signal:"Momentum"},
    {ticker:"AAOI", price:22.10,  chg:+10.4, vol:"6.8M",  dVol:"4.1×", mktCap:"1.2B",  adr:7.4, signal:"Momentum"},
  ],
  "1M": [
    {ticker:"CRDO", price:38.42,  chg:+6.8,  vol:"14.2M", dVol:"4.2×", mktCap:"4.1B",  adr:6.8, signal:"Momentum"},
    {ticker:"AVAV", price:196.10, chg:+5.1,  vol:"3.8M",  dVol:"7.1×", mktCap:"8.2B",  adr:5.1, signal:"Momentum+EP"},
    {ticker:"ALAB", price:112.30, chg:+4.4,  vol:"5.1M",  dVol:"3.3×", mktCap:"12.4B", adr:4.9, signal:"Momentum"},
    {ticker:"PLTR", price:84.20,  chg:+3.8,  vol:"48.2M", dVol:"2.1×", mktCap:"182B",  adr:4.2, signal:"Momentum"},
    {ticker:"NBIS", price:34.80,  chg:+9.2,  vol:"8.4M",  dVol:"5.8×", mktCap:"2.9B",  adr:8.1, signal:"Momentum+EP"},
    {ticker:"APP",  price:312.50, chg:+4.1,  vol:"12.3M", dVol:"1.9×", mktCap:"201B",  adr:4.6, signal:"Momentum"},
    {ticker:"CAVA", price:118.80, chg:+3.3,  vol:"4.2M",  dVol:"2.8×", mktCap:"10.1B", adr:4.1, signal:"Momentum"},
    {ticker:"ONON", price:62.40,  chg:+3.6,  vol:"6.7M",  dVol:"3.2×", mktCap:"22.1B", adr:4.3, signal:"Momentum"},
  ],
  "3M": [
    {ticker:"PLTR", price:84.20,  chg:+48.2, vol:"48.2M", dVol:"2.1×", mktCap:"182B",  adr:4.2, signal:"Momentum"},
    {ticker:"APP",  price:312.50, chg:+41.8, vol:"12.3M", dVol:"1.9×", mktCap:"201B",  adr:4.6, signal:"Momentum"},
    {ticker:"CRDO", price:38.42,  chg:+38.4, vol:"14.2M", dVol:"4.2×", mktCap:"4.1B",  adr:6.8, signal:"Momentum"},
    {ticker:"ALAB", price:112.30, chg:+34.1, vol:"5.1M",  dVol:"3.3×", mktCap:"12.4B", adr:4.9, signal:"Momentum"},
    {ticker:"AVAV", price:196.10, chg:+29.6, vol:"3.8M",  dVol:"7.1×", mktCap:"8.2B",  adr:5.1, signal:"Momentum+EP"},
    {ticker:"RKLB", price:28.90,  chg:+52.3, vol:"11.2M", dVol:"3.2×", mktCap:"12.8B", adr:6.2, signal:"Momentum"},
    {ticker:"ASTS", price:34.10,  chg:+44.8, vol:"9.8M",  dVol:"2.9×", mktCap:"14.2B", adr:7.1, signal:"Momentum"},
    {ticker:"NBIS", price:34.80,  chg:+88.4, vol:"8.4M",  dVol:"5.8×", mktCap:"2.9B",  adr:8.1, signal:"Momentum+EP"},
  ],
  "YTD": [
    {ticker:"NBIS", price:34.80,  chg:+182.4, vol:"8.4M",  dVol:"5.8×", mktCap:"2.9B",  adr:8.1, signal:"Momentum+EP"},
    {ticker:"PLTR", price:84.20,  chg:+112.8, vol:"48.2M", dVol:"2.1×", mktCap:"182B",  adr:4.2, signal:"Momentum"},
    {ticker:"APP",  price:312.50, chg:+98.4,  vol:"12.3M", dVol:"1.9×", mktCap:"201B",  adr:4.6, signal:"Momentum"},
    {ticker:"RKLB", price:28.90,  chg:+94.1,  vol:"11.2M", dVol:"3.2×", mktCap:"12.8B", adr:6.2, signal:"Momentum"},
    {ticker:"CRDO", price:38.42,  chg:+88.2,  vol:"14.2M", dVol:"4.2×", mktCap:"4.1B",  adr:6.8, signal:"Momentum"},
    {ticker:"ASTS", price:34.10,  chg:+76.3,  vol:"9.8M",  dVol:"2.9×", mktCap:"14.2B", adr:7.1, signal:"Momentum"},
    {ticker:"IONQ", price:42.30,  chg:+68.9,  vol:"9.4M",  dVol:"3.9×", mktCap:"7.2B",  adr:7.9, signal:"Momentum"},
    {ticker:"AVAV", price:196.10, chg:+62.4,  vol:"3.8M",  dVol:"7.1×", mktCap:"8.2B",  adr:5.1, signal:"Momentum+EP"},
  ],
};
const MOMENTUM_DATA = MOMENTUM_BY_PERIOD["1M"];

// ─── Sector data (aligned with theme map categories) ─────────────────────────
const SECTOR_DATA = {
  "1W": [
    {name:"Defence & Emerging", etf:"XAR",  chg:+4.8,  leaders:["AVAV","KTOS","RKLB"],  laggards:["MBLY"],  rs:82, breadth:78, stage:"Stage 2", momentum:"Strong"},
    {name:"AI & Tech",          etf:"XLK",  chg:+3.9,  leaders:["CRDO","ALAB","NBIS"],  laggards:["INTC"],  rs:79, breadth:72, stage:"Stage 2", momentum:"Strong"},
    {name:"Finance & Crypto",   etf:"XLF",  chg:+2.8,  leaders:["COIN","HOOD","MSTR"],  laggards:["SLM"],   rs:68, breadth:61, stage:"Stage 2", momentum:"Moderate"},
    {name:"Energy",             etf:"XLE",  chg:+2.1,  leaders:["TLN","CEG","VST"],     laggards:["PLUG"],  rs:61, breadth:55, stage:"Stage 2", momentum:"Moderate"},
    {name:"Software",           etf:"IGV",  chg:+1.8,  leaders:["PLTR","APP","NET"],    laggards:["OTEX"],  rs:58, breadth:52, stage:"Stage 2", momentum:"Moderate"},
    {name:"Healthcare",         etf:"XLV",  chg:+0.4,  leaders:["NTRA","RVMD","AXSM"],  laggards:["HUM"],   rs:44, breadth:41, stage:"Stage 1", momentum:"Weak"},
    {name:"Consumer",           etf:"XLY",  chg:-0.6,  leaders:["CAVA","ONON"],         laggards:["ETSY"],  rs:38, breadth:35, stage:"Stage 1", momentum:"Weak"},
    {name:"Industrials",        etf:"XLI",  chg:-1.2,  leaders:["FIX","PWR"],           laggards:["CLF"],   rs:32, breadth:29, stage:"Stage 1", momentum:"Weak"},
  ],
  "1M": [
    {name:"AI & Tech",          etf:"XLK",  chg:+18.4, leaders:["CRDO","ALAB","NVDA"],  laggards:["INTC"],  rs:88, breadth:81, stage:"Stage 2", momentum:"Strong"},
    {name:"Defence & Emerging", etf:"XAR",  chg:+14.2, leaders:["AVAV","KTOS","RKLB"],  laggards:["MBLY"],  rs:82, breadth:74, stage:"Stage 2", momentum:"Strong"},
    {name:"Finance & Crypto",   etf:"XLF",  chg:+9.8,  leaders:["COIN","HOOD","MSTR"],  laggards:["SLM"],   rs:71, breadth:64, stage:"Stage 2", momentum:"Strong"},
    {name:"Energy",             etf:"XLE",  chg:+6.4,  leaders:["TLN","CEG","VST"],     laggards:["PLUG"],  rs:62, breadth:58, stage:"Stage 2", momentum:"Moderate"},
    {name:"Software",           etf:"IGV",  chg:+5.1,  leaders:["PLTR","APP","NET"],    laggards:["OTEX"],  rs:59, breadth:53, stage:"Stage 2", momentum:"Moderate"},
    {name:"Healthcare",         etf:"XLV",  chg:+1.2,  leaders:["NTRA","RVMD"],         laggards:["HUM"],   rs:42, breadth:38, stage:"Stage 1", momentum:"Weak"},
    {name:"Consumer",           etf:"XLY",  chg:-2.1,  leaders:["CAVA","ONON"],         laggards:["ETSY"],  rs:36, breadth:33, stage:"Stage 1", momentum:"Weak"},
    {name:"Industrials",        etf:"XLI",  chg:-4.8,  leaders:["FIX","PWR"],           laggards:["CLF"],   rs:28, breadth:24, stage:"Stage 4", momentum:"Bearish"},
  ],
  "3M": [
    {name:"AI & Tech",          etf:"XLK",  chg:+38.2, leaders:["CRDO","ALAB","NVDA"],  laggards:["INTC"],  rs:91, breadth:84, stage:"Stage 2", momentum:"Strong"},
    {name:"Defence & Emerging", etf:"XAR",  chg:+32.8, leaders:["RKLB","AVAV","KTOS"],  laggards:["MBLY"],  rs:84, breadth:78, stage:"Stage 2", momentum:"Strong"},
    {name:"Finance & Crypto",   etf:"XLF",  chg:+22.4, leaders:["COIN","MSTR","HOOD"],  laggards:["SLM"],   rs:74, breadth:68, stage:"Stage 2", momentum:"Strong"},
    {name:"Software",           etf:"IGV",  chg:+18.8, leaders:["PLTR","APP","CRWD"],   laggards:["OTEX"],  rs:68, breadth:62, stage:"Stage 2", momentum:"Moderate"},
    {name:"Energy",             etf:"XLE",  chg:+8.4,  leaders:["TLN","CEG"],           laggards:["PLUG"],  rs:54, breadth:48, stage:"Stage 2", momentum:"Moderate"},
    {name:"Healthcare",         etf:"XLV",  chg:+2.1,  leaders:["NTRA","RVMD"],         laggards:["HUM"],   rs:39, breadth:36, stage:"Stage 1", momentum:"Weak"},
    {name:"Industrials",        etf:"XLI",  chg:-6.4,  leaders:["FIX"],                 laggards:["CLF"],   rs:26, breadth:22, stage:"Stage 4", momentum:"Bearish"},
    {name:"Consumer",           etf:"XLY",  chg:-9.2,  leaders:["CAVA"],                laggards:["ETSY","W"], rs:22, breadth:18, stage:"Stage 4", momentum:"Bearish"},
  ],
  "YTD": [
    {name:"AI & Tech",          etf:"XLK",  chg:+62.4, leaders:["CRDO","NVDA","ALAB"],  laggards:["INTC"],  rs:94, breadth:88, stage:"Stage 2", momentum:"Strong"},
    {name:"Defence & Emerging", etf:"XAR",  chg:+54.8, leaders:["RKLB","AVAV","ASTS"],  laggards:["MBLY"],  rs:88, breadth:82, stage:"Stage 2", momentum:"Strong"},
    {name:"Finance & Crypto",   etf:"XLF",  chg:+38.2, leaders:["COIN","MSTR","PLTR"],  laggards:["SLM"],   rs:78, breadth:72, stage:"Stage 2", momentum:"Strong"},
    {name:"Software",           etf:"IGV",  chg:+28.4, leaders:["PLTR","APP","NET"],    laggards:["OTEX"],  rs:71, breadth:65, stage:"Stage 2", momentum:"Moderate"},
    {name:"Energy",             etf:"XLE",  chg:+12.8, leaders:["TLN","CEG","VST"],     laggards:["PLUG"],  rs:58, breadth:52, stage:"Stage 2", momentum:"Moderate"},
    {name:"Healthcare",         etf:"XLV",  chg:+4.2,  leaders:["NTRA","RVMD"],         laggards:["HUM"],   rs:44, breadth:40, stage:"Stage 1", momentum:"Weak"},
    {name:"Industrials",        etf:"XLI",  chg:-8.8,  leaders:["FIX"],                 laggards:["CLF"],   rs:24, breadth:20, stage:"Stage 4", momentum:"Bearish"},
    {name:"Consumer",           etf:"XLY",  chg:-14.2, leaders:["CAVA"],                laggards:["W","M"],  rs:18, breadth:14, stage:"Stage 4", momentum:"Bearish"},
  ],
};
const ADR_DATA = [
  {ticker:"NBIS",price:34.80,adr:8.1,rank:1,stage:"Stage 2",vol:true,ma200:true},
  {ticker:"MARA",price:18.20,adr:9.2,rank:2,stage:"Stage 2",vol:true,ma200:true},
  {ticker:"IONQ",price:42.30,adr:7.9,rank:3,stage:"Stage 2",vol:false,ma200:true},
  {ticker:"RXRX",price:8.80, adr:8.8,rank:4,stage:"Stage 1",vol:true,ma200:false},
  {ticker:"CRDO",price:38.42,adr:6.8,rank:5,stage:"Stage 2",vol:true,ma200:true},
  {ticker:"AAOI",price:22.10,adr:7.4,rank:6,stage:"Stage 2",vol:true,ma200:true},
  {ticker:"RKLB",price:28.90,adr:6.2,rank:7,stage:"Stage 2",vol:true,ma200:true},
  {ticker:"AVAV",price:196.10,adr:5.1,rank:8,stage:"Stage 2",vol:true,ma200:true},
];
const MA_DATA = [
  {ticker:"PLTR", price:84.20, e10:true, e20:true, s50:true, s200:true, score:4, trend:"Bull"},
  {ticker:"APP",  price:312.50, e10:true, e20:true, s50:true, s200:true, score:4, trend:"Bull"},
  {ticker:"CRDO", price:38.42, e10:true, e20:true, s50:true, s200:true, score:4, trend:"Bull"},
  {ticker:"AVAV", price:196.10, e10:true, e20:true, s50:true, s200:true, score:4, trend:"Bull"},
  {ticker:"NBIS", price:34.80, e10:true, e20:true, s50:true, s200:true, score:4, trend:"Bull"},
  {ticker:"CAVA", price:118.80, e10:true, e20:true, s50:true, s200:false, score:3, trend:"Bull"},
  {ticker:"ONON", price:62.40, e10:true, e20:true, s50:false, s200:false, score:2, trend:"Neutral"},
  {ticker:"ANET", price:98.40, e10:true, e20:false, s50:false, s200:false, score:1, trend:"Weak"},
];
const EP_DATA = [
  {ticker:"AVAV", price:196.10, gap:+8.4, vr:7.1, catalyst:"Earnings beat +34% EPS", score:91, hold:true},
  {ticker:"NBIS", price:34.80, gap:+12.2, vr:5.8, catalyst:"Major contract win", score:88, hold:true},
  {ticker:"CRDO", price:38.42, gap:+6.8, vr:4.2, catalyst:"Revenue guidance raise", score:76, hold:true},
  {ticker:"IONQ", price:42.30, gap:+5.1, vr:3.9, catalyst:"Partnership announcement", score:68, hold:true},
  {ticker:"RXRX", price:8.80,  gap:+9.3, vr:6.1, catalyst:"FDA fast-track granted", score:72, hold:false},
];

const CHART_TABS = [
  {id:"rs_leaders",label:"RS Leaders"},
  {id:"top_rvol",label:"Top RVol"},
  {id:"momentum",label:"Momentum"},
  {id:"high_tight",label:"High Tight"},
  {id:"ep_plays",label:"EP Plays"},
  {id:"ma10",label:"10 SMA Bounce"},
];
const CHART_TICKERS = {
  rs_leaders:["PLTR","APP","CRDO","AVAV","NBIS","ALAB","ANET","TSM","NVDA","ONON"],
  top_rvol:  ["NBIS","AVAV","RXRX","IONQ","CRDO","MARA","AAOI","RKLB","COIN","HOOD"],
  momentum:  ["CRDO","AVAV","ALAB","PLTR","NBIS","APP","CAVA","ONON","ASTS","RKLB"],
  high_tight:["CRDO","AAOI","NBIS","IONQ","RXRX","POET","LWLG","QUBT","RGTI","MARA"],
  ep_plays:  ["AVAV","NBIS","CRDO","IONQ","RXRX","PLTR","APP","CAVA","ONON","ALAB"],
  ma10:      ["PLTR","APP","ANET","CRDO","TSM","NVDA","AVGO","MSFT","AAPL","ALAB"],
};
const CHART_DESC = {
  rs_leaders:"Stocks outperforming the market the most right now · ranked by relative strength · strongest names in universe",
  top_rvol:"Stocks with unusually high trading volume today · first place to look for momentum and EP setups",
  momentum:"Top momentum names from the scanner · Mkt Cap >$250M · Vol >1M · ADR >4%",
  high_tight:"Stocks coiling within 15% of 52-week high with volume drying up · pre-breakout setups",
  ep_plays:"Episodic Pivot candidates · gap up on 3×+ volume · price holding above open",
  ma10:"Stocks that made a move up, pulled back, and are sitting right on the 10-day SMA · pause before next leg",
};

// ─── Candle chart component ───────────────────────────────────────────────────
function CandleChart({ ticker, seed }) {
  const candles = useRef(null);
  if (!candles.current) {
    const bars = [];
    let price = 40 + (seed % 17) * 8;
    for (let i = 0; i < 55; i++) {
      const bias = 0.52 + Math.sin(i * 0.4 + seed) * 0.06;
      const open = price;
      const move = (Math.random() < bias ? 1 : -1) * Math.random() * price * 0.022;
      const close = price + move;
      const hi = Math.max(open, close) + Math.random() * price * 0.01;
      const lo = Math.min(open, close) - Math.random() * price * 0.01;
      bars.push({ o: open, c: close, h: hi, l: lo, v: 0.2 + Math.random() * 0.8 });
      price = close;
    }
    candles.current = bars;
  }
  const bars = candles.current;
  const allP = bars.flatMap(b => [b.h, b.l]);
  const minP = Math.min(...allP), maxP = Math.max(...allP), rng = maxP - minP || 1;
  const W = 260, H = 120, pad = 6, volH = 16;
  const chartH = H - volH - pad;
  const toY = v => pad + (1 - (v - minP) / rng) * (chartH - pad);
  const cw = (W - 4) / bars.length;
  const bw = Math.max(0.8, cw * 0.62);

  const smaN = n => bars.map((_,i) => {
    if (i < n-1) return null;
    return bars.slice(i-n+1, i+1).reduce((s,b)=>s+(b.o+b.c)/2,0)/n;
  });
  const s10=smaN(10), s20=smaN(20), s50=smaN(50);
  const maLine = (arr, col) => {
    let d="";
    arr.forEach((v,i) => {
      if(v===null)return;
      const x = 2 + i*cw + cw/2, y = toY(v);
      d += d==="" ? `M${x},${y}` : `L${x},${y}`;
    });
    return d ? <path d={d} fill="none" stroke={col} strokeWidth="1" opacity="0.9"/> : null;
  };

  const last = bars[bars.length-1].c, first = bars[0].c;
  const pct = ((last-first)/first*100).toFixed(1);
  const up = last >= first;

  return (
    <div style={{ userSelect:"none" }}>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display:"block" }}>
        {/* volume */}
        {bars.map((b,i) => {
          const x = 2+i*cw;
          return <rect key={`v${i}`} x={x+(cw-bw)/2} y={H-b.v*volH}
            width={bw} height={b.v*volH}
            fill={b.c>=b.o ? C.green : C.red} opacity="0.15"/>;
        })}
        {/* candles */}
        {bars.map((b,i) => {
          const x = 2+i*cw, cx = x+cw/2;
          const col = b.c>=b.o ? C.green : C.red;
          const bt = toY(Math.max(b.o,b.c)), bb = toY(Math.min(b.o,b.c));
          return (
            <g key={`c${i}`}>
              <line x1={cx} y1={toY(b.h)} x2={cx} y2={toY(b.l)} stroke={col} strokeWidth="0.7"/>
              <rect x={x+(cw-bw)/2} y={bt} width={bw} height={Math.max(1,bb-bt)} fill={col}/>
            </g>
          );
        })}
        {maLine(s10,"#22C55E")}
        {maLine(s20,"#EAB308")}
        {maLine(s50,"#3B82F6")}
      </svg>
      <div style={{
        display:"flex", justifyContent:"space-between", alignItems:"center",
        padding:"2px 4px", marginTop:1
      }}>
        <span style={{fontSize:11,fontWeight:700,fontFamily:"DM Mono,monospace",color:C.text}}>{ticker}</span>
        <span style={{fontSize:10,fontFamily:"DM Mono,monospace",color:up?C.green:C.red,fontWeight:600}}>
          {up?"▲":"▼"}{Math.abs(pct)}%
        </span>
      </div>
      <div style={{display:"flex",gap:6,padding:"0 4px 4px"}}>
        {[["10",C.green],["20","#EAB308"],["50","#3B82F6"]].map(([n,c])=>(
          <span key={n} style={{fontSize:9,fontFamily:"DM Mono,monospace",color:c}}>●{n}</span>
        ))}
      </div>
    </div>
  );
}

// ─── Shared components ────────────────────────────────────────────────────────
function Badge({text}) {
  const m = {
    "Momentum":[C.accent,C.accentSoft],
    "Momentum+EP":[C.purple,C.purpleBg],
    "EP":[C.teal,C.tealBg],
    "Stage 2":[C.green,C.greenBg],
    "Stage 1":[C.amber,C.amberBg],
    "Bull":[C.green,C.greenBg],
    "Neutral":[C.amber,C.amberBg],
    "Weak":[C.red,C.redBg],
  };
  const [fg,bg]=m[text]||[C.muted,C.border];
  return <span style={{
    display:"inline-block",padding:"2px 8px",borderRadius:4,
    fontSize:10,fontWeight:600,color:fg,background:bg,whiteSpace:"nowrap"
  }}>{text}</span>;
}

function TH({children}) {
  return <th style={{
    padding:"8px 12px",textAlign:"left",fontFamily:"DM Sans,sans-serif",
    fontSize:11,fontWeight:600,color:C.muted,textTransform:"uppercase",
    letterSpacing:0.6,whiteSpace:"nowrap",borderBottom:`2px solid ${C.border}`,
    background:C.bg
  }}>{children}</th>;
}

function TR({children, accent}) {
  const [hov,setHov]=useState(false);
  return <tr
    style={{borderBottom:`1px solid ${C.border}`,background:hov?accent:undefined,transition:"background 0.12s",cursor:"pointer"}}
    onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
  >{children}</tr>;
}

function TD({children, mono, color, bold}) {
  return <td style={{
    padding:"9px 12px",
    fontFamily:mono?"DM Mono,monospace":"DM Sans,sans-serif",
    fontSize:mono?12:12, color:color||C.text,
    fontWeight:bold?600:400
  }}>{children}</td>;
}

function ScoreBar({val,max=4}) {
  const col=val===4?C.green:val>=2?C.amber:C.red;
  return <div style={{display:"flex",alignItems:"center",gap:6}}>
    <div style={{width:48,height:5,background:C.border,borderRadius:3,overflow:"hidden"}}>
      <div style={{width:`${(val/max)*100}%`,height:"100%",background:col,borderRadius:3}}/>
    </div>
    <span style={{fontSize:11,fontFamily:"DM Mono,monospace",fontWeight:600,color:col}}>{val}/{max}</span>
  </div>;
}

function Check({on,label}) {
  return <span style={{
    color:on?C.green:C.red,fontSize:12,fontFamily:"DM Mono,monospace",fontWeight:500
  }}>{on?`✓${label?` ${label}`:""}`:`✗${label?` ${label}`:""}`}</span>;
}

// ─── Period dropdown ─────────────────────────────────────────────────────────
const PERIODS = [
  {id:"1W",label:"1 Week"},{id:"1M",label:"1 Month"},
  {id:"3M",label:"3 Months"},{id:"YTD",label:"Year to Date"},
];
function PeriodDropdown({period,onChange}) {
  return (
    <div style={{display:"flex",alignItems:"center",gap:8}}>
      <span style={{fontSize:11,color:C.muted,fontFamily:"DM Sans,sans-serif",whiteSpace:"nowrap"}}>Period</span>
      <select value={period} onChange={e=>onChange(e.target.value)} style={{
        padding:"4px 26px 4px 10px",border:`1px solid ${C.border}`,borderRadius:6,
        background:C.surface,fontFamily:"DM Mono,monospace",fontSize:12,fontWeight:600,
        color:C.accent,cursor:"pointer",outline:"none",
        backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%236B6860'/%3E%3C/svg%3E")`,
        backgroundRepeat:"no-repeat",backgroundPosition:"right 8px center",appearance:"none",
      }}>
        {PERIODS.map(p=><option key={p.id} value={p.id}>{p.label}</option>)}
      </select>
    </div>
  );
}

// ─── API state helpers ────────────────────────────────────────────────────────
function LoadingRows({cols, label}) {
  return (
    <div style={{padding:"32px 20px",textAlign:"center"}}>
      <div style={{fontSize:13,color:C.muted,fontFamily:"DM Mono,monospace",
        animation:"pulse 1.5s ease-in-out infinite"}}>
        ⟳ {label || "Loading live data…"}
      </div>
    </div>
  );
}

function ErrorRow({msg, fallback, period, label}) {
  const data = fallback || [];
  return (
    <div>
      <div style={{padding:"6px 12px",background:C.amberBg,borderBottom:`1px solid ${C.border}`,
        fontSize:11,color:C.amber,fontFamily:"DM Mono,monospace"}}>
        ⚠ Live data unavailable — showing cached data · {msg}
      </div>
      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr>
            {["Ticker","Price",label||"Chg%","Volume","$Vol Ratio","Mkt Cap","ADR%","Signal"].map(h=><TH key={h}>{h}</TH>)}
          </tr></thead>
          <tbody>
            {data.map(r=>(
              <TR key={r.ticker} accent={C.accentSoft}>
                <TD mono bold color={C.accent}>{r.ticker}</TD>
                <TD mono>${r.price.toFixed(2)}</TD>
                <TD mono color={r.chg>=0?C.green:C.red} bold>{sign(r.chg)}{r.chg.toFixed(1)}%</TD>
                <TD mono color={C.muted}>{r.vol}</TD>
                <TD mono>{r.dVol}</TD>
                <TD mono color={C.muted}>{r.mktCap}</TD>
                <TD mono>{r.adr?.toFixed(1)}%</TD>
                <TD><Badge text={r.signal}/></TD>
              </TR>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ErrorRows({data=[]}) {
  return (
    <div style={{padding:"6px 12px",background:C.amberBg,
      fontSize:11,color:C.amber,fontFamily:"DM Mono,monospace"}}>
      ⚠ Live data unavailable — showing cached data
    </div>
  );
}

// ─── Scanner sub-panels ───────────────────────────────────────────────────────
function MomentumTable({period="1M"}) {
  const { data, loading, error } = useApi(`/api/momentum?period=${period}`, MOMENTUM_BY_PERIOD[period]||[]);
  const label = period==="1W"?"Chg (1W)":period==="1M"?"Chg (1M)":period==="3M"?"Chg (3M)":"Chg (YTD)";

  if (loading) return <LoadingRows cols={8} label="Running momentum scan…"/>;
  if (error)   return <ErrorRow msg={error} fallback={MOMENTUM_BY_PERIOD[period]||[]} period={period} label={label}/>;

  return <div style={{overflowX:"auto"}}>
    <table style={{width:"100%",borderCollapse:"collapse"}}>
      <thead><tr>
        {["Ticker","Price",label,"Volume","$Vol Ratio","Mkt Cap","ADR%","Signal"].map(h=><TH key={h}>{h}</TH>)}
      </tr></thead>
      <tbody>
        {data.map(r=>(
          <TR key={r.ticker} accent={C.accentSoft}>
            <TD mono bold color={C.accent}>{r.ticker}</TD>
            <TD mono>${r.price.toFixed(2)}</TD>
            <TD mono color={r.chg>=0?C.green:C.red} bold>{sign(r.chg)}{r.chg.toFixed(1)}%</TD>
            <TD mono color={C.muted}>{r.vol}</TD>
            <TD mono color={parseFloat(r.dVol)>=3?C.purple:C.text} bold={parseFloat(r.dVol)>=3}>{r.dVol}</TD>
            <TD mono color={C.muted}>{r.mktCap}</TD>
            <TD mono color={r.adr>=6?C.green:r.adr>=4?C.amber:C.red} bold>{r.adr.toFixed(1)}%</TD>
            <TD><Badge text={r.signal}/></TD>
          </TR>
        ))}
      </tbody>
    </table>
  </div>;
}

function ADRTable() {
  const { data, loading, error } = useApi("/api/adr", ADR_DATA);
  if (loading) return <LoadingRows cols={7} label="Scanning ADR universe…"/>;
  if (error)   return <ErrorRows data={ADR_DATA}/>;
  return <div style={{overflowX:"auto"}}>
    <table style={{width:"100%",borderCollapse:"collapse"}}>
      <thead><tr>
        {["Rank","Ticker","Price","ADR%","Stage","Vol Confirm","200 SMA"].map(h=><TH key={h}>{h}</TH>)}
      </tr></thead>
      <tbody>
        {data.map(r=>(
          <TR key={r.ticker} accent={C.tealBg}>
            <TD mono color={C.faint}>#{r.rank}</TD>
            <TD mono bold color={C.teal}>{r.ticker}</TD>
            <TD mono>${r.price.toFixed(2)}</TD>
            <TD mono bold color={r.adr>=7?C.green:r.adr>=5?C.amber:C.text}>{r.adr.toFixed(1)}%</TD>
            <TD><Badge text={r.stage}/></TD>
            <TD><Check on={r.vol}/></TD>
            <TD><Check on={r.ma200} label={r.ma200?"Above":"Below"}/></TD>
          </TR>
        ))}
      </tbody>
    </table>
  </div>;
}

function MAStackTable() {
  const { data, loading, error } = useApi("/api/ma_stack", MA_DATA);
  if (loading) return <LoadingRows cols={8} label="Scanning MA alignment…"/>;
  if (error)   return <ErrorRows data={MA_DATA}/>;
  return <div style={{overflowX:"auto"}}>
    <table style={{width:"100%",borderCollapse:"collapse"}}>
      <thead><tr>
        {["Ticker","Price","10 EMA","20 EMA","50 SMA","200 SMA","Stack Score","Trend"].map(h=><TH key={h}>{h}</TH>)}
      </tr></thead>
      <tbody>
        {data.map(r=>(
          <TR key={r.ticker} accent={C.amberBg}>
            <TD mono bold color={C.amber}>{r.ticker}</TD>
            <TD mono>${r.price.toFixed(2)}</TD>
            {[r.e10,r.e20,r.s50,r.s200].map((on,i)=>(
              <td key={i} style={{padding:"9px 12px"}}>
                <span style={{
                  display:"inline-flex",alignItems:"center",justifyContent:"center",
                  width:22,height:22,borderRadius:4,fontSize:12,
                  background:on?C.greenBg:C.redBg,color:on?C.green:C.red,fontWeight:700
                }}>{on?"✓":"✗"}</span>
              </td>
            ))}
            <TD><ScoreBar val={r.score}/></TD>
            <TD><Badge text={r.trend}/></TD>
          </TR>
        ))}
      </tbody>
    </table>
  </div>;
}

function EPTable() {
  return <div style={{overflowX:"auto"}}>
    <table style={{width:"100%",borderCollapse:"collapse"}}>
      <thead><tr>
        {["Ticker","Price","Gap%","Vol Ratio","Catalyst","EP Score","Holding Open"].map(h=><TH key={h}>{h}</TH>)}
      </tr></thead>
      <tbody>
        {EP_DATA.map(r=>(
          <TR key={r.ticker} accent={C.purpleBg}>
            <TD mono bold color={C.purple}>{r.ticker}</TD>
            <TD mono>${r.price.toFixed(2)}</TD>
            <TD mono bold color={r.gap>=0?C.green:C.red}>{sign(r.gap)}{r.gap.toFixed(1)}%</TD>
            <TD mono bold color={r.vr>=5?C.purple:r.vr>=3?C.teal:C.text}>{r.vr.toFixed(1)}×</TD>
            <td style={{padding:"9px 12px",fontSize:11,color:C.muted,maxWidth:180}}>{r.catalyst}</td>
            <td style={{padding:"9px 12px"}}>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <div style={{width:44,height:5,background:C.border,borderRadius:3,overflow:"hidden"}}>
                  <div style={{width:`${r.score}%`,height:"100%",background:r.score>=80?C.purple:C.amber,borderRadius:3}}/>
                </div>
                <span style={{fontSize:11,fontFamily:"DM Mono,monospace",fontWeight:700,color:r.score>=80?C.purple:C.amber}}>{r.score}</span>
              </div>
            </td>
            <TD><Check on={r.hold} label={r.hold?"Yes":"No"}/></TD>
          </TR>
        ))}
      </tbody>
    </table>
  </div>;
}

// ─── Sectors panel ────────────────────────────────────────────────────────────
const MOMENTUM_LABELS = {Strong:C.green, Moderate:C.amber, Weak:C.red, Bearish:C.red};
const STAGE_LABELS    = {"Stage 2":C.green,"Stage 1":C.amber,"Stage 4":C.red,"Stage 3":C.muted};

function SectorsPanel({period}) {
  const { data: rawData, loading, error } = useApi(`/api/sectors?period=${period}`, SECTOR_DATA[period]||SECTOR_DATA["1M"]);
  const sectors = [...rawData].sort((a,b)=>b.chg-a.chg);

  if (loading) return (
    <div style={{padding:40,textAlign:"center"}}>
      <div style={{fontSize:13,color:C.muted,fontFamily:"DM Mono,monospace",animation:"pulse 1.5s ease-in-out infinite"}}>
        ⟳ Scanning 853 tickers across 8 sectors…
      </div>
    </div>
  );

  const best  = sectors[0] || {};
  const worst = sectors[sectors.length-1] || {};
  const maxAbs = Math.max(...sectors.map(s=>Math.abs(s.chg)), 1);

  return (
    <div style={{padding:"20px 20px 28px",animation:"fadeIn 0.2s ease"}}>
      {/* Summary cards */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:20}}>
        {[
          {label:"Strongest sector",   value:best.name,  sub:`+${best.chg.toFixed(1)}%`,  col:C.green,  bg:C.greenBg},
          {label:"Weakest sector",     value:worst.name, sub:`${worst.chg.toFixed(1)}%`,  col:C.red,    bg:C.redBg},
          {label:"Sectors in Stage 2", value:`${sectors.filter(s=>s.stage==="Stage 2").length} / ${sectors.length}`, sub:"Weinstein filter", col:C.accent, bg:C.accentSoft},
        ].map((c,i)=>(
          <div key={i} style={{
            background:c.bg,borderRadius:8,padding:"12px 16px",
            border:`1px solid ${c.col}30`
          }}>
            <div style={{fontSize:11,color:C.muted,fontFamily:"DM Sans,sans-serif",marginBottom:4}}>{c.label}</div>
            <div style={{fontSize:14,fontWeight:700,color:c.col,fontFamily:"DM Mono,monospace",lineHeight:1.2}}>{c.value}</div>
            <div style={{fontSize:11,color:C.muted,fontFamily:"DM Mono,monospace",marginTop:2}}>{c.sub}</div>
          </div>
        ))}
      </div>

      {/* Heatmap bars */}
      <div style={{
        background:C.surface,borderRadius:8,border:`1px solid ${C.border}`,
        overflow:"hidden",marginBottom:20
      }}>
        <div style={{
          padding:"10px 16px",borderBottom:`1px solid ${C.border}`,
          display:"flex",justifyContent:"space-between",alignItems:"center"
        }}>
          <span style={{fontSize:12,fontWeight:600,color:C.text,fontFamily:"DM Sans,sans-serif"}}>
            Sector performance — strongest to weakest
          </span>
          <span style={{fontSize:11,color:C.muted,fontFamily:"DM Mono,monospace"}}>
            {PERIODS.find(p=>p.id===period)?.label}
          </span>
        </div>
        <div style={{padding:"12px 16px",display:"flex",flexDirection:"column",gap:8}}>
          {sectors.map((s,i)=>{
            const isPos = s.chg >= 0;
            const barW  = Math.abs(s.chg) / maxAbs * 100;
            const col   = isPos ? C.green : C.red;
            const bgCol = isPos ? C.greenBg : C.redBg;
            return (
              <div key={i} style={{display:"flex",alignItems:"center",gap:10}}>
                {/* Sector name */}
                <div style={{width:170,flexShrink:0,display:"flex",alignItems:"center",gap:7}}>
                  <span style={{fontSize:12,fontWeight:500,color:C.text,fontFamily:"DM Sans,sans-serif",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{s.name}</span>
                  <span style={{fontSize:9,color:C.faint,fontFamily:"DM Mono,monospace",flexShrink:0}}>{s.etf}</span>
                </div>
                {/* Bar */}
                <div style={{flex:1,height:22,background:C.bg,borderRadius:4,overflow:"hidden",position:"relative"}}>
                  <div style={{
                    width:`${barW}%`,height:"100%",background:bgCol,
                    borderRadius:4,display:"flex",alignItems:"center",
                    paddingLeft:6,minWidth:2,transition:"width 0.4s ease"
                  }}>
                    <span style={{fontSize:11,fontWeight:700,color:col,fontFamily:"DM Mono,monospace",whiteSpace:"nowrap"}}>
                      {isPos?"+":""}{s.chg.toFixed(1)}%
                    </span>
                  </div>
                </div>
                {/* RS score */}
                <div style={{width:40,textAlign:"right",flexShrink:0}}>
                  <span style={{fontSize:11,fontFamily:"DM Mono,monospace",fontWeight:600,
                    color:s.rs>=70?C.green:s.rs>=45?C.amber:C.red}}>{s.rs}</span>
                  <span style={{fontSize:9,color:C.faint,fontFamily:"DM Mono,monospace"}}> RS</span>
                </div>
                {/* Momentum badge */}
                <div style={{width:68,flexShrink:0}}>
                  <span style={{
                    fontSize:10,padding:"2px 7px",borderRadius:4,fontWeight:600,
                    fontFamily:"DM Sans,sans-serif",whiteSpace:"nowrap",
                    color:MOMENTUM_LABELS[s.momentum]||C.muted,
                    background:(MOMENTUM_LABELS[s.momentum]||C.muted)+"18"
                  }}>{s.momentum}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail table */}
      <div style={{background:C.surface,borderRadius:8,border:`1px solid ${C.border}`,overflow:"hidden"}}>
        <div style={{padding:"10px 16px",borderBottom:`1px solid ${C.border}`}}>
          <span style={{fontSize:12,fontWeight:600,color:C.text,fontFamily:"DM Sans,sans-serif"}}>Sector detail</span>
        </div>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead><tr>
              {["Sector","ETF","Perf","RS Score","Breadth","Stage","Leaders","Laggards"].map(h=><TH key={h}>{h}</TH>)}
            </tr></thead>
            <tbody>
              {sectors.map((s,i)=>(
                <TR key={i} accent={s.chg>=0?C.greenBg:C.redBg}>
                  <TD bold>{s.name}</TD>
                  <TD mono color={C.muted}>{s.etf}</TD>
                  <TD mono bold color={s.chg>=0?C.green:C.red}>{sign(s.chg)}{s.chg.toFixed(1)}%</TD>
                  <td style={{padding:"9px 12px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      <div style={{width:36,height:5,background:C.border,borderRadius:3,overflow:"hidden"}}>
                        <div style={{width:`${s.rs}%`,height:"100%",borderRadius:3,background:s.rs>=70?C.green:s.rs>=45?C.amber:C.red}}/>
                      </div>
                      <span style={{fontSize:11,fontFamily:"DM Mono,monospace",fontWeight:600,color:s.rs>=70?C.green:s.rs>=45?C.amber:C.red}}>{s.rs}</span>
                    </div>
                  </td>
                  <TD mono color={s.breadth>=65?C.green:s.breadth>=40?C.amber:C.red}>{s.breadth}%</TD>
                  <td style={{padding:"9px 12px"}}>
                    <span style={{
                      fontSize:10,padding:"2px 7px",borderRadius:4,fontWeight:600,
                      color:STAGE_LABELS[s.stage]||C.muted,
                      background:(STAGE_LABELS[s.stage]||C.muted)+"18"
                    }}>{s.stage}</span>
                  </td>
                  <td style={{padding:"9px 12px"}}>
                    <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                      {s.leaders.map(t=>(
                        <span key={t} style={{
                          fontSize:10,padding:"1px 6px",borderRadius:4,
                          background:C.greenBg,color:C.green,
                          fontFamily:"DM Mono,monospace",fontWeight:600
                        }}>{t}</span>
                      ))}
                    </div>
                  </td>
                  <td style={{padding:"9px 12px"}}>
                    <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                      {s.laggards.map(t=>(
                        <span key={t} style={{
                          fontSize:10,padding:"1px 6px",borderRadius:4,
                          background:C.redBg,color:C.red,
                          fontFamily:"DM Mono,monospace",fontWeight:600
                        }}>{t}</span>
                      ))}
                    </div>
                  </td>
                </TR>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Scanner panel ────────────────────────────────────────────────────────────
const SCAN_TABS = [
  {id:"momentum", label:"Momentum", color:C.accent,  count:8,               desc:"Top performance by period · Mkt Cap >$250M · Vol >1M · $Vol >$50M · ADR >4%"},
  {id:"adr",      label:"High ADR", color:C.teal,    count:ADR_DATA.length,  desc:"High Average Daily Range · ranked by ADR% · Stage 2 candidates · volume confirmed"},
  {id:"ma_stack", label:"MA Stack", color:C.amber,   count:MA_DATA.length,   desc:"Trading above 10/20/50/200 EMA/SMA · stack score 0–4 · Weinstein Stage filter"},
  {id:"ep_radar", label:"EP Radar", color:C.purple,  count:EP_DATA.length,   desc:"Episodic Pivot candidates · gap up on 3×+ volume · catalyst confirmed · holding above open"},
  {id:"sectors",  label:"Sectors",  color:"#0D6E6E",count:8,                desc:"Sector strength ranking · RS score · breadth · Stage filter · leaders & laggards"},
];

function ScannerPanel() {
  const [tab,setTab]       = useState("momentum");
  const [period,setPeriod] = useState("1M");
  const [scanning,setScanning] = useState(false);
  const info = SCAN_TABS.find(t=>t.id===tab);

  const runScan=()=>{ setScanning(true); setTimeout(()=>setScanning(false),1600); };

  return (
    <div style={{animation:"fadeIn 0.2s ease"}}>
      {/* Tab bar */}
      <div style={{
        display:"flex",gap:0,borderBottom:`1px solid ${C.border}`,
        background:C.surface,padding:"0 20px",alignItems:"stretch"
      }}>
        {SCAN_TABS.map(t=>{
          const on=tab===t.id;
          return <button key={t.id} onClick={()=>setTab(t.id)} style={{
            display:"flex",alignItems:"center",gap:7,
            padding:"10px 16px",border:"none",background:"transparent",
            fontFamily:"DM Sans,sans-serif",fontSize:13,
            fontWeight:on?600:400,color:on?t.color:C.muted,
            borderBottom:on?`2.5px solid ${t.color}`:"2.5px solid transparent",
            cursor:"pointer",transition:"all 0.12s",whiteSpace:"nowrap"
          }}>
            {t.label}
            <span style={{
              fontSize:10,padding:"1px 6px",borderRadius:8,
              fontFamily:"DM Mono,monospace",
              background:on?t.color:C.border,
              color:on?"#fff":C.faint,fontWeight:600
            }}>{t.count}</span>
          </button>;
        })}
        <div style={{flex:1}}/>
        {/* Period dropdown — only visible on momentum + sectors tabs */}
        {(tab==="momentum"||tab==="sectors") && (
          <div style={{display:"flex",alignItems:"center",marginRight:12}}>
            <PeriodDropdown period={period} onChange={setPeriod}/>
          </div>
        )}
        <button onClick={runScan} disabled={scanning} style={{
          margin:"8px 0",padding:"0 18px",borderRadius:6,
          border:`1px solid ${scanning?C.border:C.accent}`,
          background:scanning?C.bg:C.accent,
          color:scanning?C.muted:"#fff",
          fontFamily:"DM Sans,sans-serif",fontSize:12,fontWeight:600,
          cursor:scanning?"default":"pointer",transition:"all 0.2s"
        }}>
          {scanning?"Scanning…":"▶ Run Scan"}
        </button>
      </div>

      {/* Desc bar */}
      <div style={{
        padding:"7px 20px",background:C.bg,borderBottom:`1px solid ${C.border}`,
        fontSize:11,color:C.muted,fontFamily:"DM Sans,sans-serif",
        display:"flex",justifyContent:"space-between",alignItems:"center"
      }}>
        <span>{info.desc}</span>
        {(tab==="momentum"||tab==="sectors") && (
          <span style={{
            fontSize:11,fontWeight:600,color:C.accent,
            fontFamily:"DM Mono,monospace",
            background:C.accentSoft,padding:"2px 8px",borderRadius:4
          }}>
            {PERIODS.find(p=>p.id===period)?.label}
          </span>
        )}
      </div>

      {/* Panel content */}
      <div style={{background:C.surface}}>
        {tab==="momentum" && <MomentumTable period={period}/>}
        {tab==="adr"      && <ADRTable/>}
        {tab==="ma_stack" && <MAStackTable/>}
        {tab==="ep_radar" && <EPTable/>}
        {tab==="sectors"  && <SectorsPanel period={period}/>}
      </div>
    </div>
  );
}

// ─── Live charts panel ────────────────────────────────────────────────────────
function LiveChartsPanel() {
  const [tab,setTab]=useState("rs_leaders");
  const tickers=CHART_TICKERS[tab]||[];
  return (
    <div style={{animation:"fadeIn 0.2s ease"}}>
      <div style={{
        display:"flex",gap:0,borderBottom:`1px solid ${C.border}`,
        background:C.surface,padding:"0 20px",overflowX:"auto"
      }}>
        {CHART_TABS.map(t=>{
          const on=tab===t.id;
          return <button key={t.id} onClick={()=>setTab(t.id)} style={{
            padding:"10px 15px",border:"none",background:"transparent",
            fontFamily:"DM Sans,sans-serif",fontSize:12,
            fontWeight:on?600:400,color:on?C.accent:C.muted,
            borderBottom:on?`2.5px solid ${C.accent}`:"2.5px solid transparent",
            cursor:"pointer",transition:"all 0.12s",whiteSpace:"nowrap"
          }}>{t.label}</button>;
        })}
      </div>
      <div style={{
        padding:"7px 20px",background:C.accentSoft,borderBottom:`1px solid ${C.border}`,
        fontSize:11,color:C.muted,fontFamily:"DM Sans,sans-serif"
      }}>{CHART_DESC[tab]}</div>
      <div style={{
        display:"grid",gridTemplateColumns:"repeat(5,1fr)",
        gap:"1px",background:C.border
      }}>
        {tickers.map((ticker,i)=>(
          <div key={`${tab}-${ticker}-${i}`} style={{
            background:C.surface,padding:"10px 10px 4px",
            cursor:"pointer",transition:"background 0.12s"
          }}
            onMouseEnter={e=>e.currentTarget.style.background=C.accentSoft}
            onMouseLeave={e=>e.currentTarget.style.background=C.surface}
          >
            <CandleChart ticker={ticker} seed={i*13+ticker.charCodeAt(0)}/>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Ticker tape ──────────────────────────────────────────────────────────────
function TickerTape() {
  const items=[...TAPE,...TAPE,...TAPE];
  return (
    <div style={{
      background:C.surface,borderBottom:`1px solid ${C.border}`,
      height:30,overflow:"hidden",display:"flex",alignItems:"center"
    }}>
      <div style={{
        display:"flex",whiteSpace:"nowrap",
        animation:"ticker 50s linear infinite",gap:0
      }}>
        {items.map((t,i)=>(
          <span key={i} style={{
            display:"inline-flex",alignItems:"center",gap:6,
            padding:"0 18px",borderRight:`1px solid ${C.border}`,
            fontSize:11,fontFamily:"DM Mono,monospace"
          }}>
            <span style={{fontWeight:600,color:C.text}}>{t.sym}</span>
            <span style={{color:C.muted}}>{t.val.toFixed(2)}</span>
            <span style={{color:t.chg>=0?C.green:C.red,fontWeight:500}}>
              {t.chg>=0?"▲":"▼"}{Math.abs(t.chg).toFixed(2)}%
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Home panel ───────────────────────────────────────────────────────────────
const MARKET_INDICES = [
  {sym:"SPY",  name:"S&P 500",  val:542.18, chg:+0.84, vs20:"Above", vs50:"Above", vs200:"Above"},
  {sym:"QQQ",  name:"Nasdaq",   val:471.30, chg:+1.12, vs20:"Above", vs50:"Above", vs200:"Above"},
  {sym:"IWM",  name:"Russell",  val:208.44, chg:+0.33, vs20:"Below", vs50:"Below", vs200:"Above"},
  {sym:"VIX",  name:"Volatility",val:18.42, chg:-4.20, vs20:null,    vs50:null,    vs200:null},
  {sym:"DXY",  name:"Dollar",   val:103.82, chg:-0.18, vs20:null,    vs50:null,    vs200:null},
  {sym:"TNX",  name:"10Y Yield",val:4.32,   chg:+0.02, vs20:null,    vs50:null,    vs200:null},
];

const BREADTH_DATA = [
  {label:"% above 20 SMA",  val:64, thresh:[40,60]},
  {label:"% above 50 SMA",  val:58, thresh:[35,55]},
  {label:"% above 200 SMA", val:71, thresh:[45,65]},
  {label:"NYSE A/D ratio",   val:68, thresh:[40,60]},
  {label:"New Highs/Lows",   val:74, thresh:[40,60]},
];

const CALENDAR_EVENTS = [
  {date:"Today",   event:"FOMC Minutes",          impact:"High",   time:"14:00 ET"},
  {date:"Wed",     event:"CPI (Core MoM)",         impact:"High",   time:"08:30 ET"},
  {date:"Thu",     event:"Initial Jobless Claims", impact:"Med",    time:"08:30 ET"},
  {date:"Fri",     event:"NFP / Unemployment",     impact:"High",   time:"08:30 ET"},
  {date:"Fri",     event:"UMich Sentiment",        impact:"Med",    time:"10:00 ET"},
];

const TOP_HITS = [
  {ticker:"AVAV", scanner:"EP Radar",  score:91, chg:+8.4,  note:"Earnings gap · 7.1× vol · holding open"},
  {ticker:"NBIS", scanner:"Momentum",  score:88, chg:+9.2,  note:"Contract win · Stage 2 · ADR 8.1%"},
  {ticker:"CRDO", scanner:"MA Stack",  score:84, chg:+6.8,  note:"4/4 MA stack · 4.2× vol · RS leader"},
  {ticker:"PLTR", scanner:"MA Stack",  score:79, chg:+3.8,  note:"4/4 stack · $182B cap · YTD +113%"},
  {ticker:"RKLB", scanner:"ADR",       score:74, chg:+5.4,  note:"ADR 6.2% · Stage 2 · vol confirmed"},
];

const PREP_ITEMS = [
  "Check SPY/QQQ pre-market trend — are futures up or down?",
  "Note VIX direction — rising VIX = reduce size or stand aside",
  "Review earnings calendar — any holdings reporting today?",
  "Check sector rotation — trade in the strongest sector only",
  "Identify 2–3 setups max — quality over quantity",
  "Set max daily loss limit before the open",
];

function ImpactDot({impact}) {
  const col = impact==="High" ? C.red : impact==="Med" ? C.amber : C.green;
  return <span style={{
    display:"inline-block",width:7,height:7,borderRadius:"50%",
    background:col,flexShrink:0,marginTop:1
  }}/>;
}

function ScannerBadgeSmall({text}) {
  const m = {
    "EP Radar":[C.purple,C.purpleBg],
    "Momentum":[C.accent,C.accentSoft],
    "MA Stack":[C.amber,C.amberBg],
    "ADR":[C.teal,C.tealBg],
  };
  const [fg,bg] = m[text]||[C.muted,C.border];
  return <span style={{
    fontSize:9,padding:"1px 6px",borderRadius:3,fontWeight:700,
    color:fg,background:bg,fontFamily:"DM Sans,sans-serif",whiteSpace:"nowrap"
  }}>{text}</span>;
}

function HomePanel({onNavigate}) {
  const sectors1M = [...SECTOR_DATA["1M"]].sort((a,b)=>b.chg-a.chg);
  const maxAbs = Math.max(...sectors1M.map(s=>Math.abs(s.chg)));

  return (
    <div style={{padding:"20px",animation:"fadeIn 0.2s ease",display:"flex",flexDirection:"column",gap:16}}>

      {/* ── Row 1: Indices ── */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:10}}>
        {MARKET_INDICES.map((idx,i)=>{
          const up = idx.chg >= 0;
          const isVix = idx.sym==="VIX";
          const goodChg = isVix ? !up : up;
          return (
            <div key={i} style={{
              background:C.surface,border:`1px solid ${C.border}`,
              borderRadius:8,padding:"12px 14px",
              borderTop:`2.5px solid ${goodChg?C.green:C.red}`
            }}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                <div>
                  <div style={{fontSize:11,fontWeight:700,fontFamily:"DM Mono,monospace",color:C.text}}>{idx.sym}</div>
                  <div style={{fontSize:10,color:C.faint,fontFamily:"DM Sans,sans-serif"}}>{idx.name}</div>
                </div>
                <span style={{
                  fontSize:10,fontWeight:600,fontFamily:"DM Mono,monospace",
                  color:goodChg?C.green:C.red,
                  background:goodChg?C.greenBg:C.redBg,
                  padding:"1px 5px",borderRadius:3
                }}>{up?"+":""}{idx.chg.toFixed(2)}%</span>
              </div>
              <div style={{fontSize:16,fontWeight:700,fontFamily:"DM Mono,monospace",color:C.text,marginBottom:6}}>
                {idx.val.toFixed(2)}
              </div>
              {idx.vs20 && (
                <div style={{display:"flex",gap:4}}>
                  {[["20",idx.vs20],["50",idx.vs50],["200",idx.vs200]].map(([n,v])=>(
                    <span key={n} style={{
                      fontSize:9,padding:"1px 5px",borderRadius:3,fontWeight:600,
                      fontFamily:"DM Mono,monospace",
                      background:v==="Above"?C.greenBg:C.redBg,
                      color:v==="Above"?C.green:C.red
                    }}>{n}d {v==="Above"?"▲":"▼"}</span>
                  ))}
                </div>
              )}
              {!idx.vs20 && (
                <div style={{fontSize:10,color:C.muted,fontFamily:"DM Mono,monospace"}}>
                  {idx.sym==="VIX"?"Percentile: 28th — Low":idx.sym==="DXY"?"Trend: Neutral":"Yield curve: Flat"}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Row 2: Breadth + Calendar + Top Hits ── */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1.4fr",gap:12}}>

        {/* Breadth */}
        <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,overflow:"hidden"}}>
          <div style={{padding:"10px 14px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontSize:12,fontWeight:600,color:C.text,fontFamily:"DM Sans,sans-serif"}}>Market breadth</span>
            <span style={{fontSize:10,color:C.green,fontFamily:"DM Mono,monospace",fontWeight:600,background:C.greenBg,padding:"1px 6px",borderRadius:3}}>Healthy</span>
          </div>
          <div style={{padding:"12px 14px",display:"flex",flexDirection:"column",gap:10}}>
            {BREADTH_DATA.map((b,i)=>{
              const [lo,hi] = b.thresh;
              const col = b.val>=hi ? C.green : b.val>=lo ? C.amber : C.red;
              return (
                <div key={i}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                    <span style={{fontSize:11,color:C.muted,fontFamily:"DM Sans,sans-serif"}}>{b.label}</span>
                    <span style={{fontSize:11,fontWeight:700,color:col,fontFamily:"DM Mono,monospace"}}>{b.val}%</span>
                  </div>
                  <div style={{height:4,background:C.border,borderRadius:2,overflow:"hidden"}}>
                    <div style={{width:`${b.val}%`,height:"100%",background:col,borderRadius:2,transition:"width 0.5s"}}/>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Economic calendar */}
        <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,overflow:"hidden"}}>
          <div style={{padding:"10px 14px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontSize:12,fontWeight:600,color:C.text,fontFamily:"DM Sans,sans-serif"}}>Economic calendar</span>
            <span style={{fontSize:10,color:C.red,fontFamily:"DM Mono,monospace",fontWeight:600,background:C.redBg,padding:"1px 6px",borderRadius:3}}>2 High impact</span>
          </div>
          <div style={{padding:"8px 0"}}>
            {CALENDAR_EVENTS.map((ev,i)=>(
              <div key={i} style={{
                display:"flex",alignItems:"flex-start",gap:10,padding:"7px 14px",
                borderBottom:i<CALENDAR_EVENTS.length-1?`1px solid ${C.border}`:"none",
                background:ev.date==="Today"?C.amberBg:"transparent"
              }}>
                <ImpactDot impact={ev.impact}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:11,fontWeight:500,color:C.text,fontFamily:"DM Sans,sans-serif"}}>{ev.event}</div>
                  <div style={{fontSize:10,color:C.muted,fontFamily:"DM Mono,monospace",marginTop:1}}>
                    {ev.date} · {ev.time}
                    {ev.date==="Today" && <span style={{marginLeft:6,color:C.amber,fontWeight:700}}>TODAY</span>}
                  </div>
                </div>
                <span style={{
                  fontSize:9,padding:"1px 5px",borderRadius:3,fontWeight:600,flexShrink:0,
                  fontFamily:"DM Sans,sans-serif",
                  color:ev.impact==="High"?C.red:ev.impact==="Med"?C.amber:C.green,
                  background:ev.impact==="High"?C.redBg:ev.impact==="Med"?C.amberBg:C.greenBg
                }}>{ev.impact}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top scanner hits */}
        <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,overflow:"hidden"}}>
          <div style={{padding:"10px 14px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontSize:12,fontWeight:600,color:C.text,fontFamily:"DM Sans,sans-serif"}}>Top scanner hits</span>
            <button onClick={()=>onNavigate("scanner")} style={{
              fontSize:10,color:C.accent,fontFamily:"DM Sans,sans-serif",fontWeight:600,
              background:"none",border:"none",cursor:"pointer",padding:0
            }}>View all →</button>
          </div>
          <div style={{padding:"4px 0"}}>
            {TOP_HITS.map((h,i)=>(
              <div key={i} style={{
                display:"flex",alignItems:"center",gap:10,padding:"8px 14px",
                borderBottom:i<TOP_HITS.length-1?`1px solid ${C.border}`:"none",
                cursor:"pointer",transition:"background 0.1s"
              }}
                onMouseEnter={e=>e.currentTarget.style.background=C.accentSoft}
                onMouseLeave={e=>e.currentTarget.style.background="transparent"}
              >
                <div style={{width:38,flexShrink:0}}>
                  <div style={{fontSize:12,fontWeight:700,fontFamily:"DM Mono,monospace",color:C.accent}}>{h.ticker}</div>
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:11,color:C.muted,fontFamily:"DM Sans,sans-serif",
                    whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{h.note}</div>
                </div>
                <ScannerBadgeSmall text={h.scanner}/>
                <span style={{
                  fontSize:11,fontWeight:700,fontFamily:"DM Mono,monospace",
                  color:h.chg>=0?C.green:C.red,minWidth:42,textAlign:"right",flexShrink:0
                }}>{h.chg>=0?"+":""}{h.chg.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Row 3: Sector heatmap + Pre-market checklist ── */}
      <div style={{display:"grid",gridTemplateColumns:"1.6fr 1fr",gap:12}}>

        {/* Sector heatmap */}
        <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,overflow:"hidden"}}>
          <div style={{padding:"10px 14px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontSize:12,fontWeight:600,color:C.text,fontFamily:"DM Sans,sans-serif"}}>Sector rotation · 1 month</span>
            <button onClick={()=>onNavigate("scanner")} style={{
              fontSize:10,color:C.accent,fontFamily:"DM Sans,sans-serif",fontWeight:600,
              background:"none",border:"none",cursor:"pointer",padding:0
            }}>Full view →</button>
          </div>
          <div style={{padding:"12px 14px",display:"flex",flexDirection:"column",gap:7}}>
            {sectors1M.map((s,i)=>{
              const isPos = s.chg>=0;
              const barW  = Math.abs(s.chg)/maxAbs*100;
              const col   = isPos?C.green:C.red;
              const bgCol = isPos?C.greenBg:C.redBg;
              return (
                <div key={i} style={{display:"flex",alignItems:"center",gap:8}}>
                  <div style={{width:140,flexShrink:0,display:"flex",alignItems:"center",gap:6}}>
                    <span style={{fontSize:11,color:C.text,fontFamily:"DM Sans,sans-serif",fontWeight:500,
                      whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{s.name}</span>
                  </div>
                  <div style={{flex:1,height:20,background:C.bg,borderRadius:3,overflow:"hidden"}}>
                    <div style={{
                      width:`${barW}%`,height:"100%",background:bgCol,borderRadius:3,
                      display:"flex",alignItems:"center",paddingLeft:6,minWidth:2
                    }}>
                      <span style={{fontSize:10,fontWeight:700,color:col,fontFamily:"DM Mono,monospace",whiteSpace:"nowrap"}}>
                        {isPos?"+":""}{s.chg.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <span style={{
                    fontSize:9,width:56,textAlign:"right",flexShrink:0,
                    fontFamily:"DM Mono,monospace",fontWeight:600,
                    color:s.rs>=70?C.green:s.rs>=45?C.amber:C.red
                  }}>RS {s.rs}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pre-market checklist */}
        <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,overflow:"hidden"}}>
          <div style={{padding:"10px 14px",borderBottom:`1px solid ${C.border}`}}>
            <span style={{fontSize:12,fontWeight:600,color:C.text,fontFamily:"DM Sans,sans-serif"}}>Pre-market checklist</span>
          </div>
          <div style={{padding:"10px 14px",display:"flex",flexDirection:"column",gap:0}}>
            {PREP_ITEMS.map((item,i)=>(
              <PrepItem key={i} text={item}/>
            ))}
          </div>
          <div style={{
            padding:"10px 14px",borderTop:`1px solid ${C.border}`,
            background:C.bg,display:"flex",justifyContent:"space-between",alignItems:"center"
          }}>
            <span style={{fontSize:11,color:C.muted,fontFamily:"DM Sans,sans-serif"}}>Reset daily</span>
            <button style={{
              fontSize:11,padding:"4px 12px",borderRadius:5,border:`1px solid ${C.border}`,
              background:C.surface,color:C.muted,cursor:"pointer",fontFamily:"DM Sans,sans-serif"
            }}>Clear all</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PrepItem({text}) {
  const [checked,setChecked]=useState(false);
  return (
    <div
      onClick={()=>setChecked(c=>!c)}
      style={{
        display:"flex",alignItems:"flex-start",gap:10,padding:"8px 0",
        borderBottom:`1px solid ${C.border}`,cursor:"pointer",
        opacity:checked?0.45:1,transition:"opacity 0.15s"
      }}
    >
      <div style={{
        width:16,height:16,borderRadius:4,flexShrink:0,marginTop:1,
        border:`1.5px solid ${checked?C.green:C.borderMed}`,
        background:checked?C.greenBg:"transparent",
        display:"flex",alignItems:"center",justifyContent:"center",
        transition:"all 0.15s"
      }}>
        {checked && <span style={{fontSize:10,color:C.green,fontWeight:700,lineHeight:1}}>✓</span>}
      </div>
      <span style={{
        fontSize:11,color:checked?C.faint:C.text,fontFamily:"DM Sans,sans-serif",
        lineHeight:1.4,textDecoration:checked?"line-through":"none",transition:"all 0.15s"
      }}>{text}</span>
    </div>
  );
}

// ─── Market summary bar ───────────────────────────────────────────────────────
function MarketBar({time, liveData}) {
  const regime   = liveData?.regime   || "Stage 2 Uptrend";
  const vixStr   = liveData?.vix      || "—";
  const breadth  = liveData?.breadth  || "—";
  const isLive   = !!liveData;
  return (
    <div style={{
      display:"flex",gap:0,background:C.accentSoft,
      borderBottom:`1px solid ${C.border}`,padding:"5px 20px",
      alignItems:"center",flexWrap:"wrap",rowGap:4
    }}>
      {[
        {l:"Regime",  v:regime,         c:C.green},
        {l:"VIX",     v:vixStr,         c:C.green},
        {l:"Breadth", v:breadth,        c:C.green},
        {l:"Universe",v:"853 tickers",  c:C.accent},
        {l:"Last scan",v:time,          c:C.muted},
      ].map((it,i,arr)=>(
        <div key={i} style={{
          display:"flex",alignItems:"center",gap:6,
          paddingRight:20,marginRight:20,
          borderRight:i<arr.length-1?`1px solid ${C.borderMed}`:"none"
        }}>
          <span style={{fontSize:11,color:C.muted}}>{it.l}</span>
          <span style={{fontSize:11,fontWeight:600,color:it.c,fontFamily:"DM Mono,monospace"}}>{it.v}</span>
        </div>
      ))}
      <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:6}}>
        <div style={{width:7,height:7,borderRadius:"50%",
          background:isLive?C.green:C.amber,
          animation:"pulse 2s ease-in-out infinite"}}/>
        <span style={{fontSize:11,color:isLive?C.green:C.amber,
          fontFamily:"DM Mono,monospace",fontWeight:600}}>
          {isLive?"LIVE":"MOCK"}
        </span>
      </div>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
const MAIN_TABS=[
  {id:"home",      label:"Overview",   icon:"⌂"},
  {id:"scanner",   label:"Scanner",    icon:"⊞"},
  {id:"charts",    label:"Live Charts",icon:"◈"},
  {id:"watchlist", label:"Watchlist",  icon:"★"},
  {id:"ep_log",    label:"EP Log",     icon:"⚡"},
];

export default function SwingTerminal() {
  const [tab,setTab]=useState("home");
  const [time,setTime]=useState(ts());
  const { data: overviewData } = useApi("/api/overview", null);

  useEffect(()=>{
    const t=setInterval(()=>setTime(ts()),1000);
    return ()=>clearInterval(t);
  },[]);

  // Build marketBar props from overview data if live
  const liveBarData = overviewData ? {
    regime:  "Live Data",
    vix:     overviewData.indices?.find(i=>i.sym==="VIX")
               ? `${overviewData.indices.find(i=>i.sym==="VIX").price.toFixed(1)} — ${overviewData.indices.find(i=>i.sym==="VIX").price < 20 ? "Low" : overviewData.indices.find(i=>i.sym==="VIX").price < 30 ? "Elevated" : "High"}`
               : "—",
    breadth: "Live",
  } : null;

  return (
    <>
      <style>{GLOBAL_STYLE}</style>
      <div style={{minHeight:"100vh",background:C.bg,display:"flex",flexDirection:"column"}}>

        {/* Header */}
        <div style={{
          background:C.surface,borderBottom:`1px solid ${C.border}`,
          padding:"0 20px",display:"flex",alignItems:"center",height:52,gap:0
        }}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginRight:32}}>
            <div style={{
              width:30,height:30,borderRadius:7,background:C.accent,
              display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:15,color:"#fff",fontWeight:800,fontFamily:"DM Mono,monospace"
            }}>S</div>
            <div>
              <div style={{fontSize:14,fontWeight:700,color:C.text,lineHeight:1.1}}>Swing Terminal</div>
              <div style={{fontSize:9,color:C.faint,fontFamily:"DM Mono,monospace",letterSpacing:1}}>v1.0 · BETA</div>
            </div>
          </div>
          {MAIN_TABS.map(t=>{
            const on=tab===t.id;
            return <button key={t.id} onClick={()=>setTab(t.id)} style={{
              display:"flex",alignItems:"center",gap:7,
              padding:"0 16px",height:52,border:"none",background:"transparent",
              fontFamily:"DM Sans,sans-serif",fontSize:13,
              fontWeight:on?600:400,color:on?C.accent:C.muted,
              borderBottom:on?`2.5px solid ${C.accent}`:"2.5px solid transparent",
              cursor:"pointer",transition:"all 0.12s"
            }}>
              <span style={{fontSize:11,opacity:0.7}}>{t.icon}</span>{t.label}
            </button>;
          })}
          <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:14}}>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:12,fontFamily:"DM Mono,monospace",fontWeight:500,color:C.text}}>{time} AEST</div>
              <div style={{fontSize:9,color:C.faint,fontFamily:"DM Mono,monospace"}}>US MKT CLOSED</div>
            </div>
            <button style={{
              padding:"6px 14px",borderRadius:6,
              border:`1px solid ${C.border}`,background:C.bg,
              fontFamily:"DM Sans,sans-serif",fontSize:12,color:C.muted,cursor:"pointer"
            }}>⚙ Settings</button>
          </div>
        </div>

        <TickerTape/>
        <MarketBar time={time} liveData={liveBarData}/>

        {/* Content */}
        <div style={{flex:1,overflow:"auto"}}>
          {tab==="home"      && <HomePanel onNavigate={setTab}/>}
          {tab==="scanner"   && <ScannerPanel/>}
          {tab==="charts"    && <LiveChartsPanel/>}
          {tab==="watchlist" && (
            <div style={{padding:40,textAlign:"center"}}>
              <div style={{fontSize:28,marginBottom:10}}>★</div>
              <div style={{fontSize:14,fontWeight:600,color:C.text,marginBottom:6}}>Watchlist</div>
              <div style={{fontSize:13,color:C.muted}}>Add tickers from the scanner. Coming in next build.</div>
            </div>
          )}
          {tab==="ep_log" && (
            <div style={{padding:40,textAlign:"center"}}>
              <div style={{fontSize:28,marginBottom:10}}>⚡</div>
              <div style={{fontSize:14,fontWeight:600,color:C.text,marginBottom:6}}>EP Log</div>
              <div style={{fontSize:13,color:C.muted}}>Historical EP trade log + outcome tracking. Coming in next build.</div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          background:C.surface,borderTop:`1px solid ${C.border}`,
          padding:"5px 20px",display:"flex",justifyContent:"space-between",alignItems:"center"
        }}>
          <span style={{fontSize:10,color:C.faint,fontFamily:"DM Mono,monospace"}}>Swing Terminal · yfinance data · Not financial advice</span>
          <span style={{fontSize:10,color:C.faint,fontFamily:"DM Mono,monospace"}}>853 tickers · theme_map_export.json · {time}</span>
        </div>
      </div>
    </>
  );
}
