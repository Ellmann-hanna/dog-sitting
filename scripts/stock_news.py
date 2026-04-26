#!/usr/bin/env python3
"""
Daily stock market news fetcher.
Pulls headlines from free RSS feeds and market data from yfinance,
then writes a Markdown report to stock_news_report.md.
"""

import datetime
import pathlib
import sys

try:
    import feedparser
except ImportError:
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "feedparser", "-q"])
    import feedparser

try:
    import yfinance as yf
except ImportError:
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "yfinance", "-q"])
    import yfinance as yf

# ── Configuration ────────────────────────────────────────────────────────────

REPORT_PATH = pathlib.Path(
    __import__("os").environ.get("REPORT_PATH", "stock_news_report.md")
)

TODAY = datetime.date.today().strftime("%B %d, %Y")

NEWS_FEEDS = [
    ("CNBC Markets",     "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=20910258"),
    ("MarketWatch",      "https://feeds.content.dowjones.io/public/rss/mw_topstories"),
    ("Reuters Business", "https://feeds.reuters.com/reuters/businessNews"),
    ("Yahoo Finance",    "https://finance.yahoo.com/news/rssindex"),
]

INDICES = {
    "S&P 500":  "^GSPC",
    "Dow Jones": "^DJI",
    "Nasdaq":   "^IXIC",
    "Russell 2000": "^RUT",
}

MAX_ITEMS_PER_FEED = 8

# ── Helpers ──────────────────────────────────────────────────────────────────

def fetch_market_data() -> list[dict]:
    rows = []
    for name, ticker in INDICES.items():
        try:
            t = yf.Ticker(ticker)
            info = t.fast_info
            price  = getattr(info, "last_price",      None)
            prev   = getattr(info, "previous_close",  None)
            if price is None or prev is None:
                hist = t.history(period="2d")
                if len(hist) >= 2:
                    price = float(hist["Close"].iloc[-1])
                    prev  = float(hist["Close"].iloc[-2])
                elif len(hist) == 1:
                    price = float(hist["Close"].iloc[-1])
                    prev  = price
            if price is not None and prev is not None and prev != 0:
                change     = price - prev
                change_pct = change / prev * 100
                arrow      = "▲" if change >= 0 else "▼"
                rows.append({
                    "name":   name,
                    "price":  f"{price:,.2f}",
                    "change": f"{arrow} {abs(change):,.2f} ({abs(change_pct):.2f}%)",
                    "up":     change >= 0,
                })
            else:
                rows.append({"name": name, "price": "N/A", "change": "—", "up": None})
        except Exception as exc:
            rows.append({"name": name, "price": "error", "change": str(exc)[:60], "up": None})
    return rows


def fetch_news_items(feed_url: str, max_items: int) -> list[dict]:
    try:
        parsed = feedparser.parse(feed_url)
        items = []
        for entry in parsed.entries[:max_items]:
            title   = getattr(entry, "title",   "").strip()
            link    = getattr(entry, "link",    "#")
            summary = getattr(entry, "summary", "").strip()
            # Strip HTML tags from summary
            import re
            summary = re.sub(r"<[^>]+>", "", summary)[:200].strip()
            if summary and not summary.endswith((".", "…", "!")):
                summary += "…"
            pub = ""
            if hasattr(entry, "published"):
                try:
                    import email.utils
                    dt = email.utils.parsedate_to_datetime(entry.published)
                    pub = dt.strftime("%I:%M %p ET")
                except Exception:
                    pub = entry.published[:16]
            if title:
                items.append({"title": title, "link": link, "summary": summary, "pub": pub})
        return items
    except Exception as exc:
        print(f"  Warning: could not fetch feed ({exc})", file=sys.stderr)
        return []


# ── Report builder ────────────────────────────────────────────────────────────

def build_report() -> str:
    lines: list[str] = []

    lines.append(f"# 📈 Stock Market News — {TODAY}\n")
    lines.append(
        "> Automated daily digest of major market indices and top financial headlines.\n"
    )

    # Market snapshot
    lines.append("## Market Snapshot\n")
    lines.append("| Index | Price | Change |")
    lines.append("|-------|-------|--------|")
    for row in fetch_market_data():
        emoji = "🟢" if row["up"] else ("🔴" if row["up"] is False else "⚪")
        lines.append(f"| {row['name']} | {row['price']} | {emoji} {row['change']} |")
    lines.append("")

    # News sections
    lines.append("## Top Financial Headlines\n")
    any_news = False
    for source_name, feed_url in NEWS_FEEDS:
        items = fetch_news_items(feed_url, MAX_ITEMS_PER_FEED)
        if not items:
            continue
        any_news = True
        lines.append(f"### {source_name}\n")
        for item in items:
            time_tag = f" _{item['pub']}_" if item["pub"] else ""
            lines.append(f"- **[{item['title']}]({item['link']})**{time_tag}")
            if item["summary"]:
                lines.append(f"  {item['summary']}")
        lines.append("")

    if not any_news:
        lines.append("_No news items could be retrieved today. Please check feeds manually._\n")

    lines.append("---")
    lines.append(
        f"_Report generated automatically on {TODAY}. "
        "Market data via [Yahoo Finance](https://finance.yahoo.com). "
        "News via CNBC, MarketWatch, Reuters, and Yahoo Finance RSS feeds._"
    )

    return "\n".join(lines) + "\n"


# ── Entry point ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print(f"Fetching stock market news for {TODAY}...")
    report = build_report()
    REPORT_PATH.write_text(report, encoding="utf-8")
    print(f"Report written to {REPORT_PATH} ({len(report)} bytes)")
    # Print a brief preview
    preview_lines = report.splitlines()[:12]
    print("\n".join(preview_lines))
    if len(report.splitlines()) > 12:
        print(f"... ({len(report.splitlines())} lines total)")
