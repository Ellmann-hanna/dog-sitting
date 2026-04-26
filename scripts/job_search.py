#!/usr/bin/env python3
"""
Daily Game Design Job Search for Caroline Zhou
USC graduate, master's student - focused on Level Design / Area Design
"""

import os
import json
import urllib.request
import urllib.parse
from datetime import datetime, date, timezone, timedelta

# ── Adzuna API (free tier: https://developer.adzuna.com/) ─────────────────────
ADZUNA_APP_ID  = os.environ.get("ADZUNA_APP_ID", "")
ADZUNA_APP_KEY = os.environ.get("ADZUNA_APP_KEY", "")
ADZUNA_COUNTRY = "us"
ADZUNA_BASE    = f"https://api.adzuna.com/v1/api/jobs/{ADZUNA_COUNTRY}/search"

# ── Search configuration ──────────────────────────────────────────────────────
SEARCH_QUERIES = [
    "level designer entry level",
    "junior level designer game",
    "area designer game studio",
    "environment designer game entry level",
    "associate level designer",
    "world designer game entry level",
    "game designer level design",
]

RELEVANT_KEYWORDS = {
    "level design", "level designer", "area design", "area designer",
    "environment design", "world building", "world design", "game design",
    "unreal engine", "unity", "ue5", "ue4", "game dev", "game developer",
}

# Direct search URLs for major job boards (verified working)
SEARCH_URLS = {
    "LinkedIn": [
        "https://www.linkedin.com/jobs/search/?keywords=junior+level+designer+game&f_E=1%2C2",
        "https://www.linkedin.com/jobs/search/?keywords=area+designer+game+studio&f_E=1%2C2",
        "https://www.linkedin.com/jobs/search/?keywords=entry+level+environment+designer+game&f_E=1%2C2",
    ],
    "Indeed": [
        "https://www.indeed.com/q-junior-level-designer-games-entry-level-jobs.html",
        "https://www.indeed.com/q-area-designer-game-studio-jobs.html",
        "https://www.indeed.com/q-entry-level-game-designer-level-design-jobs.html",
    ],
    "Glassdoor": [
        "https://www.glassdoor.com/Job/junior-level-designer-jobs-SRCH_KO0,21.htm",
        "https://www.glassdoor.com/Job/entry-level-game-designer-jobs-SRCH_KO0,25.htm",
    ],
    "Hitmarker (Game Industry Jobs)": [
        "https://hitmarker.net/entry-level-gaming-jobs",
        "https://hitmarker.net/jobs",
    ],
    "Game Developer Job Board": [
        "https://www.gamedeveloper.com/jobs",
    ],
    "Remote Game Jobs": [
        "https://remotegamejobs.com/search?query=level+designer",
        "https://remotegamejobs.com/search?query=area+designer",
    ],
}

# Major studio career pages (verified working)
STUDIO_CAREER_PAGES = [
    ("Riot Games",        "https://www.riotgames.com/en/work-with-us/jobs"),
    ("Naughty Dog",       "https://www.naughtydog.com/openings"),
    ("Insomniac Games",   "https://insomniac.games/careers/"),
    ("Bungie",            "https://careers.bungie.com/jobs"),
    ("Epic Games",        "https://www.epicgames.com/site/en-US/careers/jobs"),
    ("Blizzard",          "https://careers.blizzard.com/global/en/search-results"),
    ("EA",                "https://www.ea.com/careers"),
    ("Ubisoft",           "https://www.ubisoft.com/en-us/company/careers/search"),
    ("Sony Santa Monica", "https://sms.playstation.com/careers"),
    ("Xbox/Microsoft",    "https://careers.microsoft.com/us/en/search-results?keywords=level%20designer"),
    ("2K Games",          "https://2k.com/careers/"),
    ("Bethesda/ZeniMax",  "https://jobs.zenimax.com/jobs"),
    ("CD Projekt Red",    "https://www.cdprojektred.com/en/jobs"),
    ("Rockstar Games",    "https://www.rockstargames.com/careers/openings"),
    ("Valve",             "https://www.valvesoftware.com/en/jobs"),
]


def fetch_adzuna(query: str, page: int = 1, results_per_page: int = 20) -> list[dict]:
    if not ADZUNA_APP_ID or not ADZUNA_APP_KEY:
        return []
    params = urllib.parse.urlencode({
        "app_id":           ADZUNA_APP_ID,
        "app_key":          ADZUNA_APP_KEY,
        "results_per_page": results_per_page,
        "what":             query,
        "content-type":     "application/json",
        "sort_by":          "date",
        "max_days_old":     1,       # Only return jobs posted in the last 24 hours
    })
    url = f"{ADZUNA_BASE}/{page}?{params}"
    try:
        with urllib.request.urlopen(url, timeout=10) as resp:
            data = json.loads(resp.read())
            return data.get("results", [])
    except Exception as e:
        print(f"  [warn] Adzuna fetch failed for '{query}': {e}")
        return []


def filter_last_24h(jobs: list[dict]) -> list[dict]:
    """Secondary filter: drop any job whose 'created' timestamp is older than 24 hours."""
    cutoff = datetime.now(timezone.utc) - timedelta(hours=24)
    fresh = []
    for job in jobs:
        created_str = job.get("created", "")
        if not created_str:
            fresh.append(job)   # No timestamp — keep it, API already filtered
            continue
        try:
            # Adzuna timestamps look like "2026-04-08T10:23:45Z"
            created_dt = datetime.fromisoformat(created_str.replace("Z", "+00:00"))
            if created_dt >= cutoff:
                fresh.append(job)
            else:
                print(f"  [filtered] '{job.get('title')}' posted {created_str[:10]} — older than 24h, skipped")
        except ValueError:
            fresh.append(job)   # Can't parse timestamp — keep it
    return fresh


def score_job(job: dict) -> int:
    """Score a job by relevance to level/area design."""
    text = (
        job.get("title", "") + " " +
        job.get("description", "") + " " +
        job.get("category", {}).get("label", "")
    ).lower()
    score = sum(2 if kw in text else 0 for kw in RELEVANT_KEYWORDS)
    if any(w in text for w in ("entry", "junior", "associate", "new grad", "graduate")):
        score += 3
    if "remote" in text:
        score += 1
    return score


def deduplicate(jobs: list[dict]) -> list[dict]:
    seen = set()
    unique = []
    for j in jobs:
        key = (j.get("title", "").lower(), j.get("company", {}).get("display_name", "").lower())
        if key not in seen:
            seen.add(key)
            unique.append(j)
    return unique


def format_job(job: dict, idx: int) -> str:
    title    = job.get("title", "N/A")
    company  = job.get("company", {}).get("display_name", "N/A")
    location = job.get("location", {}).get("display_name", "N/A")
    url      = job.get("redirect_url", "#")
    created  = job.get("created", "")
    posted   = f"{created[:10]} {created[11:16]} UTC" if len(created) >= 16 else created[:10] if created else "N/A"
    salary   = ""
    sal_min  = job.get("salary_min")
    sal_max  = job.get("salary_max")
    if sal_min and sal_max:
        salary = f" | \U0001f4b0 ${int(sal_min):,} \u2013 ${int(sal_max):,}/yr"
    remote_flag = " \U0001f310 Remote" if "remote" in (job.get("title","") + job.get("description","")).lower() else ""
    desc_raw = job.get("description", "")
    desc = desc_raw[:280].replace("\n", " ").strip()
    if len(desc_raw) > 280:
        desc += "\u2026"
    return (
        f"### {idx}. [{title}]({url})\n"
        f"**{company}** \u2014 {location}{remote_flag}{salary}\n"
        f"Posted: {posted}\n\n"
        f"> {desc}\n"
    )


def categorize(jobs: list[dict]) -> tuple[list, list, list]:
    scored = [(score_job(j), j) for j in jobs]
    scored.sort(key=lambda x: -x[0])
    top, good, stretch = [], [], []
    for score, j in scored:
        if score >= 8:
            top.append(j)
        elif score >= 4:
            good.append(j)
        else:
            stretch.append(j)
    return top, good, stretch


def build_report(top: list, good: list, stretch: list) -> str:
    today = date.today().strftime("%B %d, %Y")
    total = len(top) + len(good) + len(stretch)

    lines = [
        f"# \U0001f3ae Game Design Jobs \u2014 {today}",
        f"**For:** Caroline Zhou | USC Graduate \u00b7 Master's Student \u00b7 Level / Area Design Focus",
        f"**Listings from last 24 hours:** {total}",
        "",
        "---",
        "",
    ]

    if top:
        lines += ["## \u2b50 Top Picks (Best fit for your profile)", ""]
        for i, j in enumerate(top[:10], 1):
            lines.append(format_job(j, i))
    else:
        lines += ["## \u2b50 Top Picks", "_No new listings in the last 24 hours \u2014 check the board links below for the latest._", ""]

    if good:
        lines += ["---", "## \u2705 Strong Matches", ""]
        for i, j in enumerate(good[:15], 1):
            lines.append(format_job(j, i))

    if stretch:
        lines += ["---", "## \U0001f680 Stretch Roles (Slightly senior \u2014 worth a shot)", ""]
        for i, j in enumerate(stretch[:8], 1):
            lines.append(format_job(j, i))

    lines += [
        "---",
        "## \U0001f517 Live Job Board Searches \u2014 Click to Browse Now",
        "",
        "_These links open pre-configured searches on major job boards._",
        "",
    ]
    for board, urls in SEARCH_URLS.items():
        lines.append(f"### {board}")
        for url in urls:
            lines.append(f"- [{url}]({url})")
        lines.append("")

    lines += [
        "---",
        "## \U0001f3e2 Major Studio Career Pages",
        "",
        "Check these directly \u2014 big studios often don't post to aggregators:",
        "",
    ]
    for name, url in STUDIO_CAREER_PAGES:
        lines.append(f"- **[{name}]({url})**")

    lines += [
        "",
        "---",
        "## \U0001f4a1 Tips for Caroline",
        "",
        "- **Portfolio first:** Ensure your USC portfolio site is linked in every application.",
        "- **USC network:** Check Handshake (USC\u2019s job platform) for game industry postings exclusive to USC students.",
        "- **Keywords to use:** 'Level Designer', 'Environment Designer', 'World Builder', 'Area Designer', 'Gameplay Designer (Environment)'.",
        "- **Tools to highlight:** Unreal Engine 5, Unity, Blender, Maya, Houdini, Perforce, Jira \u2014 mention any you know.",
        "- **Remote roles:** Especially worth targeting as a current student \u2014 many junior design roles are now remote.",
        "- **Game jams:** Itch.io, Global Game Jam, Ludum Dare \u2014 active participation strengthens your application.",
        "",
        "---",
        f"_Generated automatically on {today}. Only listings posted in the last 24 hours are shown._",
    ]

    return "\n".join(lines)


def main():
    print("Starting daily game design job search for Caroline Zhou...")
    all_jobs: list[dict] = []

    if ADZUNA_APP_ID and ADZUNA_APP_KEY:
        print(f"Searching {len(SEARCH_QUERIES)} queries via Adzuna API (last 24h only)...")
        for query in SEARCH_QUERIES:
            print(f"  Querying: '{query}'")
            results = fetch_adzuna(query)
            all_jobs.extend(results)
            print(f"    \u2192 {len(results)} results")

        before = len(all_jobs)
        all_jobs = filter_last_24h(all_jobs)
        print(f"After 24h filter: {len(all_jobs)} (removed {before - len(all_jobs)} older listings)")
    else:
        print("No Adzuna API credentials set \u2014 report will include board links only.")
        print("Add ADZUNA_APP_ID and ADZUNA_APP_KEY as GitHub secrets for live listings.")

    all_jobs = deduplicate(all_jobs)
    print(f"Unique jobs after dedup: {len(all_jobs)}")

    top, good, stretch = categorize(all_jobs)
    report = build_report(top, good, stretch)

    output_path = os.environ.get("REPORT_PATH", "job_report.md")
    with open(output_path, "w") as f:
        f.write(report)

    print(f"Report written to {output_path}")
    print(f"Summary: {len(top)} top picks, {len(good)} strong matches, {len(stretch)} stretch roles")


if __name__ == "__main__":
    main()
