"""
Swing Terminal — Flask Backend
Endpoints: /api/overview  /api/momentum  /api/adr  /api/ma_stack  /api/sectors
Deploy to Render; frontend on Vercel calls these.
"""

import json, os, time, threading
from datetime import datetime, date
import numpy as np
import pandas as pd
import yfinance as yf
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# ─── Load ticker universe ──────────────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
with open(os.path.join(BASE_DIR, "theme_map.json")) as f:
    THEME_MAP = json.load(f)["themes"]

# All unique tickers
ALL_TICKERS = list({m["ticker"] for v in THEME_MAP.values() for m in v["members"]})

# ─── Sector display groups  (theme_map keys → 8 display buckets) ──────────────
SECTOR_GROUPS = {
    "AI & Tech": {
        "etf": "XLK",
        "themes": ["mag7","ai_compute","ai_optics","ai_networking","ai_connectivity",
                   "semiconductor_ip","memory_cycle","semi_equipment","datacenter_buildout",
                   "ai_compute_clouds","semiconductor_testing","ai_apps_platforms",
                   "quantum_computing","electronic_components","data_analytics_terminals"],
    },
    "Defence & Emerging": {
        "etf": "XAR",
        "themes": ["defense_tech","drones","space_economy","robotics_automation",
                   "autonomous_mobility","critical_minerals"],
    },
    "Finance & Crypto": {
        "etf": "XLF",
        "themes": ["fintech_disruptors","financial_services_specialty","alt_asset_managers",
                   "crypto_platforms","bitcoin_treasury","crypto_miners"],
    },
    "Energy": {
        "etf": "XLE",
        "themes": ["power_demand_for_ai","nuclear_renaissance","uranium_pure_plays",
                   "solar","energy_storage","fuel_cells_hydrogen","oil_gas_ep",
                   "oil_gas_services","electrical_grid"],
    },
    "Software": {
        "etf": "IGV",
        "themes": ["cybersecurity","data_devops_platforms","cloud_infra",
                   "productivity_saas","vertical_saas","ad_tech_marketing"],
    },
    "Healthcare": {
        "etf": "XLV",
        "themes": ["medtech_devices_consumer_health","diagnostics_tools","managed_care","biotech"],
    },
    "Consumer": {
        "etf": "XLY",
        "themes": ["energy_drinks_wellness","restaurants_fast_casual","footwear_apparel",
                   "beauty","discount_retail","ecommerce","travel_services","airlines",
                   "streaming_media","gaming_betting","social_media","consumer_retail",
                   "auto_parts_tech","real_estate_proptech"],
    },
    "Industrials": {
        "etf": "XLI",
        "themes": ["reshoring_construction","hvac_cooling","building_products",
                   "industrial_distribution","transports","industrial_materials",
                   "industrial_metals","gold_silver_miners","latam_em","consulting_govt",
                   "ev_makers","ev_supply_chain"],
    },
}

# ─── Cache ────────────────────────────────────────────────────────────────────
_cache: dict = {}
_lock  = threading.Lock()
TTL    = 300  # 5 minutes

def cache_get(key):
    with _lock:
        e = _cache.get(key)
        if e and time.time() - e["ts"] < TTL:
            return e["data"]
    return None

def cache_set(key, data):
    with _lock:
        _cache[key] = {"data": data, "ts": time.time()}

# ─── yfinance helpers ─────────────────────────────────────────────────────────
def fetch_history(tickers: list[str], period: str = "1y") -> pd.DataFrame:
    """Download adjusted closes for a list of tickers. Returns wide DataFrame."""
    if not tickers:
        return pd.DataFrame()
    try:
        raw = yf.download(tickers, period=period, auto_adjust=True,
                          progress=False, threads=True)
        if raw.empty:
            return pd.DataFrame()
        # Multi-ticker returns MultiIndex; single ticker is flat
        if isinstance(raw.columns, pd.MultiIndex):
            closes = raw["Close"]
        else:
            closes = raw[["Close"]].rename(columns={"Close": tickers[0]})
        closes = closes.dropna(axis=1, how="all")
        return closes
    except Exception as e:
        print(f"fetch_history error: {e}")
        return pd.DataFrame()

def fetch_single(ticker: str, period: str = "1y") -> pd.Series | None:
    """Return adjusted close series for one ticker."""
    try:
        df = yf.download(ticker, period=period, auto_adjust=True,
                         progress=False, threads=False)
        if df.empty:
            return None
        return df["Close"].squeeze()
    except Exception:
        return None

def period_return(closes: pd.Series, period: str) -> float | None:
    """Compute % return over the given period label."""
    closes = closes.dropna()
    if closes.empty:
        return None
    today = closes.index[-1]
    if period == "1W":
        start = today - pd.Timedelta(weeks=1)
    elif period == "1M":
        start = today - pd.DateOffset(months=1)
    elif period == "3M":
        start = today - pd.DateOffset(months=3)
    elif period == "YTD":
        start = pd.Timestamp(today.year, 1, 1)
    else:
        return None
    subset = closes[closes.index >= start]
    if len(subset) < 2:
        return None
    return float((subset.iloc[-1] / subset.iloc[0] - 1) * 100)

def adr_pct(ticker: str, lookback: int = 20) -> float | None:
    """Average Daily Range % over last N days."""
    try:
        df = yf.download(ticker, period="3mo", auto_adjust=True, progress=False)
        if df.empty or len(df) < lookback:
            return None
        recent = df.tail(lookback)
        # Handle MultiIndex columns from yfinance
        high = recent["High"].squeeze() if "High" in recent.columns else None
        low  = recent["Low"].squeeze()  if "Low"  in recent.columns else None
        if high is None or low is None:
            return None
        adr = ((high - low) / low * 100).mean()
        return round(float(adr), 2)
    except Exception:
        return None

def ma_flags(closes: pd.Series) -> dict:
    """Return dict of EMA/SMA flags vs last close."""
    closes = closes.dropna()
    if len(closes) < 200:
        return {"e10": False, "e20": False, "s50": False, "s200": False, "score": 0}
    price = float(closes.iloc[-1])
    e10  = float(closes.ewm(span=10,  adjust=False).mean().iloc[-1])
    e20  = float(closes.ewm(span=20,  adjust=False).mean().iloc[-1])
    s50  = float(closes.rolling(50).mean().iloc[-1])
    s200 = float(closes.rolling(200).mean().iloc[-1])
    flags = {
        "e10":  price > e10,
        "e20":  price > e20,
        "s50":  price > s50,
        "s200": price > s200,
    }
    flags["score"] = sum(flags.values())
    return flags

def rs_score(closes: pd.Series, spy_closes: pd.Series) -> int:
    """
    Composite RS score 0–100.
    Weighted: 40% 3M · 30% 1M · 20% 1W · 10% 1D
    """
    try:
        weights = {"3M": 0.40, "1M": 0.30, "1W": 0.20}
        ticker_score = 0.0
        spy_score    = 0.0
        for p, w in weights.items():
            tr = period_return(closes, p)
            sr = period_return(spy_closes, p)
            if tr is not None and sr is not None:
                ticker_score += tr * w
                spy_score    += sr * w
        diff = ticker_score - spy_score
        # Map diff to 0–100: +20 relative outperformance → ~95, -20 → ~5
        score = 50 + diff * 2.5
        return max(0, min(100, int(score)))
    except Exception:
        return 50

def format_vol(v: float) -> str:
    if v >= 1_000_000_000:
        return f"{v/1_000_000_000:.1f}B"
    if v >= 1_000_000:
        return f"{v/1_000_000:.1f}M"
    return f"{v/1_000:.0f}K"

def format_mktcap(v: float) -> str:
    if v >= 1_000_000_000_000:
        return f"{v/1_000_000_000_000:.1f}T"
    if v >= 1_000_000_000:
        return f"{v/1_000_000_000:.0f}B"
    return f"{v/1_000_000:.0f}M"

def weinstein_stage(closes: pd.Series) -> str:
    closes = closes.dropna()
    if len(closes) < 200:
        return "Stage 1"
    price   = float(closes.iloc[-1])
    ma200   = float(closes.rolling(200).mean().iloc[-1])
    ma200_1 = float(closes.rolling(200).mean().iloc[-20])  # 20 days ago
    above   = price > ma200
    rising  = ma200 > ma200_1
    if above and rising:
        return "Stage 2"
    if above and not rising:
        return "Stage 3"
    if not above and not rising:
        return "Stage 4"
    return "Stage 1"

# ─── /api/overview ─────────────────────────────────────────────────────────────
@app.route("/api/overview")
def overview():
    cached = cache_get("overview")
    if cached:
        return jsonify(cached)

    INDEX_TICKERS = ["SPY","QQQ","IWM","^VIX","DX-Y.NYB","^TNX"]
    DISPLAY_NAMES = {"SPY":"SPY","QQQ":"QQQ","IWM":"IWM","^VIX":"VIX","DX-Y.NYB":"DXY","^TNX":"TNX"}

    indices = []
    for sym in INDEX_TICKERS:
        try:
            tk = yf.Ticker(sym)
            hist = tk.history(period="5d")
            if hist.empty:
                continue
            price  = float(hist["Close"].iloc[-1])
            prev   = float(hist["Close"].iloc[-2]) if len(hist) >= 2 else price
            chg    = round((price - prev) / prev * 100, 2)
            closes = hist["Close"]
            indices.append({
                "sym":   DISPLAY_NAMES.get(sym, sym),
                "price": round(price, 2),
                "chg":   chg,
            })
        except Exception as e:
            print(f"Overview error {sym}: {e}")

    result = {
        "indices":     indices,
        "last_updated": datetime.utcnow().isoformat(),
    }
    cache_set("overview", result)
    return jsonify(result)


# ─── /api/momentum?period=1M ──────────────────────────────────────────────────
@app.route("/api/momentum")
def momentum():
    period = request.args.get("period", "1M").upper()
    if period not in ("1W","1M","3M","YTD"):
        period = "1M"

    cache_key = f"momentum_{period}"
    cached = cache_get(cache_key)
    if cached:
        return jsonify(cached)

    # Fetch SPY as benchmark
    spy = fetch_single("SPY", "1y")

    results = []
    closes_bulk = fetch_history(ALL_TICKERS, period="1y")

    for ticker in ALL_TICKERS:
        try:
            if ticker not in closes_bulk.columns:
                continue
            closes = closes_bulk[ticker].dropna()
            if len(closes) < 20:
                continue

            ret = period_return(closes, period)
            if ret is None or ret < 3.0:   # minimum 3% gain to show
                continue

            tk     = yf.Ticker(ticker)
            info   = tk.fast_info
            price  = float(closes.iloc[-1])
            vol_today = float(info.get("three_month_average_volume", 0) or 0)

            # Average volume (20d)
            avg_vol = float(closes_bulk[ticker].tail(20).count())  # approximation; use info
            try:
                avg_vol   = float(info.get("three_month_average_volume", 1) or 1)
                vol_today = float(tk.history(period="5d")["Volume"].iloc[-1])
                dvol_ratio = round(vol_today / avg_vol, 1) if avg_vol else 1.0
            except Exception:
                dvol_ratio = 1.0
                vol_today  = 0

            mkt_cap  = float(info.get("market_cap", 0) or 0)
            if mkt_cap < 250_000_000:
                continue   # filter < $250M mktcap

            # ADR
            adr = adr_pct(ticker) or 0.0

            # Signal
            rs = rs_score(closes, spy) if spy is not None else 50
            ep_flag = ret > 10 and dvol_ratio >= 3.0
            signal = "Momentum+EP" if ep_flag else "Momentum"

            results.append({
                "ticker":  ticker,
                "price":   round(price, 2),
                "chg":     round(ret, 1),
                "vol":     format_vol(vol_today),
                "dVol":    f"{dvol_ratio}×",
                "mktCap":  format_mktcap(mkt_cap),
                "adr":     adr,
                "signal":  signal,
            })
        except Exception as e:
            print(f"Momentum error {ticker}: {e}")
            continue

    # Sort by period return, return top 25
    results.sort(key=lambda x: x["chg"], reverse=True)
    results = results[:25]

    cache_set(cache_key, results)
    return jsonify(results)


# ─── /api/adr ─────────────────────────────────────────────────────────────────
@app.route("/api/adr")
def adr_scan():
    cached = cache_get("adr")
    if cached:
        return jsonify(cached)

    closes_bulk = fetch_history(ALL_TICKERS, period="1y")
    results = []

    for i, ticker in enumerate(ALL_TICKERS):
        try:
            if ticker not in closes_bulk.columns:
                continue
            closes = closes_bulk[ticker].dropna()
            if len(closes) < 60:
                continue

            adr = adr_pct(ticker) or 0.0
            if adr < 3.0:
                continue

            price  = float(closes.iloc[-1])
            stage  = weinstein_stage(closes)
            ma_f   = ma_flags(closes)
            above200 = ma_f["s200"]

            tk = yf.Ticker(ticker)
            try:
                avg_vol   = float(tk.fast_info.get("three_month_average_volume", 0) or 0)
                vol_today = float(tk.history(period="2d")["Volume"].iloc[-1])
                vol_confirm = vol_today > avg_vol * 1.2
            except Exception:
                vol_confirm = False

            results.append({
                "ticker":  ticker,
                "price":   round(price, 2),
                "adr":     adr,
                "stage":   stage,
                "vol":     vol_confirm,
                "ma200":   above200,
            })
        except Exception as e:
            print(f"ADR error {ticker}: {e}")
            continue

    results.sort(key=lambda x: x["adr"], reverse=True)
    results = results[:20]
    for i, r in enumerate(results, 1):
        r["rank"] = i

    cache_set("adr", results)
    return jsonify(results)


# ─── /api/ma_stack ────────────────────────────────────────────────────────────
@app.route("/api/ma_stack")
def ma_stack():
    cached = cache_get("ma_stack")
    if cached:
        return jsonify(cached)

    closes_bulk = fetch_history(ALL_TICKERS, period="1y")
    results = []

    for ticker in ALL_TICKERS:
        try:
            if ticker not in closes_bulk.columns:
                continue
            closes = closes_bulk[ticker].dropna()
            if len(closes) < 200:
                continue

            price = float(closes.iloc[-1])
            flags = ma_flags(closes)
            if flags["score"] < 2:
                continue   # only show tickers with at least 2 MAs aligned

            trend = "Bull" if flags["score"] == 4 else \
                    "Neutral" if flags["score"] >= 2 else "Weak"

            results.append({
                "ticker": ticker,
                "price":  round(price, 2),
                "e10":    flags["e10"],
                "e20":    flags["e20"],
                "s50":    flags["s50"],
                "s200":   flags["s200"],
                "score":  flags["score"],
                "trend":  trend,
            })
        except Exception as e:
            print(f"MA stack error {ticker}: {e}")
            continue

    results.sort(key=lambda x: x["score"], reverse=True)
    results = results[:30]

    cache_set("ma_stack", results)
    return jsonify(results)


# ─── /api/sectors?period=1M ───────────────────────────────────────────────────
@app.route("/api/sectors")
def sectors():
    period = request.args.get("period", "1M").upper()
    if period not in ("1W","1M","3M","YTD"):
        period = "1M"

    cache_key = f"sectors_{period}"
    cached = cache_get(cache_key)
    if cached:
        return jsonify(cached)

    spy = fetch_single("SPY", "1y")
    all_closes = fetch_history(ALL_TICKERS, period="1y")

    output = []

    for sector_name, cfg in SECTOR_GROUPS.items():
        # Collect all tickers in this sector group
        sector_tickers = []
        for theme_key in cfg["themes"]:
            if theme_key in THEME_MAP:
                for m in THEME_MAP[theme_key]["members"]:
                    sector_tickers.append(m["ticker"])
        sector_tickers = list(set(sector_tickers))

        returns = []
        for t in sector_tickers:
            if t not in all_closes.columns:
                continue
            closes = all_closes[t].dropna()
            if len(closes) < 10:
                continue
            r = period_return(closes, period)
            if r is not None:
                returns.append((t, r))

        if not returns:
            continue

        returns.sort(key=lambda x: x[1], reverse=True)
        sector_chg  = float(np.median([r for _, r in returns]))
        leaders     = [t for t, _ in returns[:3]]
        laggards    = [t for t, _ in returns[-2:]]
        breadth_pct = int(len([r for _, r in returns if r > 0]) / len(returns) * 100)

        # RS score vs SPY
        avg_ret = np.mean([r for _, r in returns])
        spy_ret = period_return(spy, period) if spy is not None else 0
        spy_ret = spy_ret or 0
        diff    = avg_ret - spy_ret
        rs      = max(0, min(100, int(50 + diff * 2.5)))

        # Weinstein stage — proxy from ETF or avg MA position
        etf_sym = cfg["etf"]
        stage = "Stage 2"
        if etf_sym in all_closes.columns:
            stage = weinstein_stage(all_closes[etf_sym].dropna())

        momentum = "Strong" if sector_chg >= 5 else \
                   "Moderate" if sector_chg >= 1 else \
                   "Weak" if sector_chg >= -2 else "Bearish"

        output.append({
            "name":     sector_name,
            "etf":      etf_sym,
            "chg":      round(sector_chg, 1),
            "leaders":  leaders,
            "laggards": laggards,
            "rs":       rs,
            "breadth":  breadth_pct,
            "stage":    stage,
            "momentum": momentum,
        })

    output.sort(key=lambda x: x["chg"], reverse=True)
    cache_set(cache_key, output)
    return jsonify(output)


# ─── Health check ─────────────────────────────────────────────────────────────
@app.route("/")
@app.route("/api/health")
def health():
    return jsonify({
        "status": "ok",
        "tickers": len(ALL_TICKERS),
        "themes":  len(THEME_MAP),
        "cache_keys": list(_cache.keys()),
        "ts": datetime.utcnow().isoformat(),
    })


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
