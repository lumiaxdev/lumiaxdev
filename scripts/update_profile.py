"""Render profile cards using unauthenticated, public GitHub data only.

No personal access token, private repository endpoint, or third-party stats service.
If collection fails, no existing graphics are replaced.
"""

from collections import Counter
from datetime import date, datetime, timedelta, timezone
from html import escape
from html.parser import HTMLParser
import json
import os
from pathlib import Path
import re
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
USERNAME = os.environ.get("PROFILE_USERNAME", "lumiaxdev")
BG, PANEL, BORDER = "#0d1117", "#111920", "#26343d"
TEXT, MUTED, ACCENT = "#e8f0f2", "#a5b7c0", "#62e8c1"
SANS = "Segoe UI,Arial,sans-serif"
MONO = "Consolas,monospace"


def fetch(url):
    # Deliberately no Authorization header: only publicly accessible data.
    request = Request(url, headers={"User-Agent": "lumiaxdev-public-profile", "Accept": "application/json" if "api.github.com" in url else "text/html"})
    with urlopen(request, timeout=30) as response:
        return response.read().decode("utf-8")


class CalendarParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.cells, self.tooltips = {}, {}
        self.current, self.text = None, []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if attrs.get("data-date") and attrs.get("data-level") is not None:
            self.cells[attrs.get("id")] = attrs["data-date"]
        if tag == "tool-tip" and attrs.get("for"):
            self.current, self.text = attrs["for"], []

    def handle_data(self, data):
        if self.current:
            self.text.append(data)

    def handle_endtag(self, tag):
        if tag == "tool-tip" and self.current:
            self.tooltips[self.current] = "".join(self.text).strip()
            self.current = None

    def days(self):
        if len(self.cells) < 300:
            raise ValueError("Contribution calendar is incomplete")
        result = {}
        for identifier, day in self.cells.items():
            label = self.tooltips.get(identifier, "")
            match = re.match(r"([\d,]+) contributions? on ", label)
            if match:
                result[day] = int(match[1].replace(",", ""))
            elif label.startswith("No contributions on "):
                result[day] = 0
            else:
                raise ValueError("Unrecognized contribution tooltip")
        return result


def public_owned(repos, username):
    return [r for r in repos if r.get("private") is False and r["owner"]["login"].lower() == username.lower()]


def streaks(days, today):
    counts = {date.fromisoformat(day): count for day, count in days.items()}
    best, run = 0, 0
    for day in sorted(counts):
        if day > today:
            continue
        run = run + 1 if counts[day] > 0 else 0
        best = max(best, run)
    cursor = today if counts.get(today, 0) else today - timedelta(days=1)
    current = 0
    while counts.get(cursor, 0):
        current += 1
        cursor -= timedelta(days=1)
    return current, best


def text(x, y, value, size=16, color=TEXT, weight=400, mono=False, anchor=None):
    extra = f' text-anchor="{anchor}"' if anchor else ""
    return f'<text x="{x}" y="{y}" fill="{color}" font-family="{MONO if mono else SANS}" font-size="{size}" font-weight="{weight}"{extra}>{escape(str(value))}</text>'


def canvas(width, height, title, description, parts):
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}" role="img" aria-labelledby="title desc"><title id="title">{escape(title)}</title><desc id="desc">{escape(description)}</desc><rect x="0.5" y="0.5" width="{width-1}" height="{height-1}" rx="16" fill="{PANEL}" stroke="{BORDER}"/>{"".join(parts)}</svg>\n'


def render_overview(user, repos, stamp, mobile=False):
    forks = sum(r["fork"] for r in repos)
    items = [(f'{len(repos):02}', "Public repos"), (f'{forks:02}', "Forks"), (user["created_at"][:4], "GitHub seit")]
    parts = []
    for i, (value, label) in enumerate(items):
        x = (22 + i * 134) if mobile else (36 + i * 270)
        if i:
            parts.append(f'<path d="M{x-(12 if mobile else 24)} 32V112" stroke="{BORDER}"/>')
        parts += [text(x, 75, value, 34 if mobile else 42, ACCENT, 600, True), text(x, 103, label, 13 if mobile else 15, MUTED)]
    return canvas(420 if mobile else 840, 142, "Öffentliches GitHub-Profil", f'{len(repos)} öffentliche Repositories, {forks} Forks, Konto seit {user["created_at"][:4]}. Stand {stamp}.', parts)


def render_languages(languages, stamp, mobile=False):
    ordered = sorted(languages.items(), key=lambda p: (-p[1], p[0]))[:5]
    total = sum(languages.values())
    height = max(210, 102 + len(ordered) * 48)
    width = 420 if mobile else 840
    subtitle = "Eigener öffentlicher Code, ohne Forks" if mobile else "Öffentliche Original-Repositories, ohne Forks"
    parts = [text(24 if mobile else 32, 39, "Sprachen in meinem Code", 21 if mobile else 22, TEXT, 600), text(24 if mobile else 32, 65, subtitle, 13, MUTED)]
    for i, (name, count) in enumerate(ordered):
        y = 105 + i * 48
        percent = count / total * 100 if total else 0
        left, right = (24, 396) if mobile else (32, 806)
        parts += [text(left, y, name, 16, TEXT, 600), text(right, y, f"{percent:.1f} %", 15, MUTED, mono=True, anchor="end")]
        parts.append(f'<rect x="{left}" y="{y+10}" width="{max(1, (right-left)*percent/100):.2f}" height="5" rx="2.5" fill="{ACCENT}" opacity="{1-i*.15:.2f}"/>')
    if not ordered:
        parts.append(text(32, 116, "Noch keine öffentlichen Sprachdaten verfügbar.", 16, MUTED))
    return canvas(width, height, "Programmiersprachen", f'Sprachanteile nach GitHub-Codebytes ohne Forks. Stand {stamp}.', parts)


def render_activity(days, today, stamp, mobile=False):
    cutoff = today - timedelta(days=364)
    recent = {day: n for day, n in days.items() if cutoff <= date.fromisoformat(day) <= today}
    if len(recent) != 365:
        raise ValueError("Expected all 365 calendar days")
    current, best = streaks(recent, today)
    active = sum(n > 0 for n in recent.values())
    parts = [text(24 if mobile else 32, 42, "Aktivität", 24, TEXT, 600), text(24 if mobile else 32, 69, "Letzte 365 Tage auf GitHub" if mobile else "Letzte 365 Tage im öffentlichen GitHub-Profil", 14, MUTED)]
    metrics = [(24, sum(recent.values()), "Beiträge"), (160, active, "Aktive Tage"), (296, best, "Beste Serie")] if mobile else [(32, sum(recent.values()), "Beiträge"), (294, active, "Aktive Tage"), (556, best, "Beste Serie in Tagen")]
    for x, number, label in metrics:
        parts += [text(x, 122, number, 34, ACCENT, 600, True), text(x, 146, label, 12 if mobile else 14, MUTED)]
    graph_cutoff = today - timedelta(days=181) if mobile else cutoff
    first = graph_cutoff - timedelta(days=(graph_cutoff.weekday()+1) % 7)
    last_month = None
    palette = ["#1d2b32", "#244c43", "#2e7e67", "#41b38e", ACCENT]
    for offset in range((today-first).days+1):
        day = first + timedelta(days=offset)
        col, row = divmod(offset, 7)
        x, y = (24 if mobile else 32) + col*(14 if mobile else 14.65), 200 + row*15
        if row == 0 and day.month != last_month:
            if col < (24 if mobile else 50):
                parts.append(text(x, 185, day.strftime("%b"), 11, MUTED, mono=True))
            last_month = day.month
        if day < graph_cutoff:
            continue
        count = recent[day.isoformat()]
        level = 0 if count == 0 else min(4, 1 + (count-1)//3)
        parts.append(f'<rect x="{x:.2f}" y="{y}" width="11.5" height="11.5" rx="2" fill="{palette[level]}"><title>{day.isoformat()}: {count} Beiträge</title></rect>')
    if mobile:
        parts += [text(24, 331, "Kalender: letzte 26 Wochen", 12, MUTED), text(24, 355, f"Stand {stamp} / Serie: {current} Tage", 12, MUTED)]
    else:
        parts += [text(32, 334, f"Aktuelle Serie: {current} Tage", 13, MUTED), text(806, 334, f"Stand {stamp}", 12, MUTED, mono=True, anchor="end")]
    return canvas(420 if mobile else 840, 378 if mobile else 360, "GitHub-Aktivität der letzten 365 Tage", f'{sum(recent.values())} Beiträge an {active} Tagen; längste Serie {best} Tage; aktuelle Serie {current} Tage. Nur öffentlich angezeigte Kalenderdaten.', parts)


def main():
    if not re.fullmatch(r"[A-Za-z0-9-]+", USERNAME):
        raise ValueError("Invalid GitHub username")
    user = json.loads(fetch(f"https://api.github.com/users/{USERNAME}"))
    repos = []
    for page in range(1, 101):
        batch = json.loads(fetch(f"https://api.github.com/users/{USERNAME}/repos?type=owner&per_page=100&page={page}"))
        repos.extend(public_owned(batch, USERNAME))
        if len(batch) < 100:
            break
    languages = Counter()
    for repo in repos:
        # Profile documentation and all forks are excluded from code shares.
        if repo["fork"] or repo["name"].lower() == USERNAME.lower():
            continue
        languages.update(json.loads(fetch(repo["languages_url"])))
    parser = CalendarParser()
    parser.feed(fetch(f"https://github.com/users/{USERNAME}/contributions"))
    days = parser.days()
    today = datetime.now(timezone.utc).date()
    stamp = today.strftime("%d.%m.%Y")
    outputs = {"overview.svg": render_overview(user, repos, stamp), "languages.svg": render_languages(languages, stamp), "activity.svg": render_activity(days, today, stamp)}
    outputs.update({"overview-mobile.svg": render_overview(user, repos, stamp, True), "languages-mobile.svg": render_languages(languages, stamp, True), "activity-mobile.svg": render_activity(days, today, stamp, True)})
    # All sources and all SVGs are validated before changing a single file.
    import xml.etree.ElementTree as ET
    for content in outputs.values():
        ET.fromstring(content)
    destination = ROOT / "assets"
    destination.mkdir(exist_ok=True)
    for name, content in outputs.items():
        (destination / name).write_text(content, encoding="utf-8")
    print(json.dumps({"public_repos": len(repos), "forks": sum(r["fork"] for r in repos), "languages": dict(languages), "calendar_days": len(days), "updated": stamp}))


if __name__ == "__main__":
    main()
