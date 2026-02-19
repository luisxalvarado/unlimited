"""
Pull 12 months of historical WHOOP data for trend analysis
"""
import urllib.request, urllib.parse, json, os
from datetime import datetime, timezone

TOKEN_FILE = os.path.expanduser("~/Desktop/whoop_tokens.json")
CLIENT_ID = "02a085f4-7efd-4dad-8367-33ad2d07811b"
CLIENT_SECRET = "d26a23bf7a79c19c10e2f6390dcca492fdfc3885d97e15e1b9e63ba2e2a3e432"
UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"

def load_tokens():
    with open(TOKEN_FILE) as f: return json.load(f)

def save_tokens(t):
    with open(TOKEN_FILE, "w") as f: json.dump(t, f, indent=2)

def refresh(rt):
    data = urllib.parse.urlencode({"grant_type":"refresh_token","refresh_token":rt,"client_id":CLIENT_ID,"client_secret":CLIENT_SECRET}).encode()
    req = urllib.request.Request("https://api.prod.whoop.com/oauth/oauth2/token",data=data,headers={"Content-Type":"application/x-www-form-urlencoded","User-Agent":UA},method="POST")
    with urllib.request.urlopen(req,timeout=15) as r: return json.loads(r.read())

def get(token, url):
    req = urllib.request.Request(url, headers={"Authorization":f"Bearer {token}","User-Agent":UA,"Accept":"application/json"})
    try:
        with urllib.request.urlopen(req, timeout=15) as r: return json.loads(r.read()), None
    except urllib.error.HTTPError as e:
        return None, e.code

def paginate(token, base_url, limit=50, max_pages=12):
    """Fetch all pages of data"""
    all_records = []
    url = f"{base_url}?limit={limit}"
    page = 0
    while url and page < max_pages:
        data, err = get(token, url)
        if err or not data: break
        records = data.get("records", [])
        all_records.extend(records)
        next_token = data.get("next_token")
        url = f"{base_url}?limit={limit}&nextToken={next_token}" if next_token else None
        page += 1
        print(f"  Page {page}: {len(records)} records (total: {len(all_records)})")
    return all_records

def main():
    print("\n" + "="*55)
    print("  WHOOP History Fetcher — 12 Month Deep Dive")
    print("="*55 + "\n")

    tokens = load_tokens()
    token = tokens["access_token"]

    BASE = "https://api.prod.whoop.com/developer"

    endpoints = [
        ("cycles",    f"{BASE}/v2/cycle",           20, 20),
        ("recovery",  f"{BASE}/v2/recovery",         20, 20),
        ("sleep",     f"{BASE}/v2/activity/sleep",   20, 20),
        ("workouts",  f"{BASE}/v2/activity/workout", 20, 20),
    ]

    results = {}
    for key, url, limit, max_pages in endpoints:
        print(f"⬡ Fetching {key} history...")
        records = paginate(token, url, limit=limit, max_pages=max_pages)
        results[key] = records
        print(f"  → {len(records)} total {key} records\n")

    # Save full history
    out = os.path.expanduser("~/Desktop/whoop_history.json")
    with open(out, "w") as f:
        json.dump(results, f, indent=2)
    print(f"✓ Saved to {out}")

    # Quick stats
    print("\n" + "="*55)
    print("  HISTORY SUMMARY")
    print("="*55)

    cycles = results.get("cycles", [])
    if cycles:
        dated = [(c["start"][:10], c.get("score",{}) or {}) for c in cycles if c.get("score")]
        strains = [(d, s.get("strain",0)) for d,s in dated]
        if strains:
            strains.sort()
            print(f"\n  Cycles: {len(cycles)}")
            print(f"  Date range: {strains[0][0]} → {strains[-1][0]}")
            vals = [s for _,s in strains]
            print(f"  Avg strain: {sum(vals)/len(vals):.1f}")
            print(f"  Max strain: {max(vals):.1f}")
            print(f"  Min strain: {min(vals):.1f}")

    recs = results.get("recovery", [])
    if recs:
        scores = [r["score"]["recovery_score"] for r in recs if r.get("score") and r["score"].get("recovery_score")]
        hrvs = [r["score"]["hrv_rmssd_milli"] for r in recs if r.get("score") and r["score"].get("hrv_rmssd_milli")]
        print(f"\n  Recovery records: {len(recs)}")
        if scores: print(f"  Avg recovery: {sum(scores)/len(scores):.1f}%  |  Range: {min(scores):.0f}%–{max(scores):.0f}%")
        if hrvs: print(f"  Avg HRV: {sum(hrvs)/len(hrvs):.1f}ms  |  Range: {min(hrvs):.1f}–{max(hrvs):.1f}ms")

    wkts = results.get("workouts", [])
    sports = {}
    for w in wkts:
        s = w.get("sport_name","unknown")
        sports[s] = sports.get(s,0)+1
    if sports:
        print(f"\n  Workouts: {len(wkts)}")
        for s,n in sorted(sports.items(), key=lambda x:-x[1]):
            print(f"    {s}: {n}x")

    print(f"\n  Sleep records: {len(results.get('sleep',[]))}")
    print("\n✓ Run: cat ~/Desktop/whoop_history.json | head -200")

if __name__ == "__main__":
    main()
