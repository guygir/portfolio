#!/usr/bin/env python3
"""Generate designed cover / hover posters for projects without photography."""

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
COVER = ROOT / "images" / "covers"
HOVER = ROOT / "images" / "hover"
COVER.mkdir(parents=True, exist_ok=True)
HOVER.mkdir(parents=True, exist_ok=True)


def svg(w, h, body):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}">
  <defs>
    <style>
      .d {{ font-family: "Fraunces", "Times New Roman", serif; }}
      .u {{ font-family: "Figtree", "Helvetica Neue", sans-serif; }}
    </style>
  </defs>
  {body}
</svg>
'''


def write(kind, slug, content):
    dest = (COVER if kind == "cover" else HOVER) / f"{slug}.svg"
    dest.write_text(content)
    print(dest.name, dest.stat().st_size)


def poster(bg, accent, ink, eyebrow, title, lines, marks=""):
    line_xml = ""
    y = 430
    for line in lines:
        line_xml += f'<text x="56" y="{y}" class="u" fill="{ink}" fill-opacity="0.72" font-size="18">{line}</text>\n'
        y += 26
    return svg(800, 600, f'''
  <rect width="800" height="600" fill="{bg}"/>
  {marks}
  <rect x="36" y="36" width="728" height="528" fill="none" stroke="{accent}" stroke-opacity="0.45" stroke-width="1.25"/>
  <text x="56" y="88" class="u" fill="{accent}" font-size="13" letter-spacing="3.2">{eyebrow}</text>
  <text x="56" y="168" class="d" fill="{ink}" font-size="64" font-weight="500">{title}</text>
  {line_xml}
''')


def hover_frame(bg, accent, ink, title, caption, extras=""):
    return svg(800, 600, f'''
  <rect width="800" height="600" fill="{bg}"/>
  {extras}
  <rect x="70" y="70" width="660" height="400" rx="10" fill="#FFFBF4" fill-opacity="0.08" stroke="{accent}" stroke-opacity="0.7"/>
  <circle cx="96" cy="96" r="6" fill="#E24B4B"/>
  <circle cx="118" cy="96" r="6" fill="#E0B44B"/>
  <circle cx="140" cy="96" r="6" fill="#4BB36A"/>
  <text x="70" y="520" class="d" fill="{ink}" font-size="36" font-weight="500">{title}</text>
  <text x="70" y="556" class="u" fill="{accent}" font-size="16">{caption}</text>
''')


# Research / work
write("cover", "zipnn", poster(
    "#24344A", "#E8C39A", "#F3EEE4",
    "IBM RESEARCH  ·  IEEE CLOUD 2025",
    "ZipNN",
    ["Lossless compression for tensors", "in foundation-model pipelines."],
    '''
    <circle cx="640" cy="420" r="120" fill="none" stroke="#E8C39A" stroke-opacity="0.25" stroke-width="40"/>
    <circle cx="640" cy="420" r="48" fill="#C2410C"/>
    ''',
))
write("hover", "zipnn", hover_frame(
    "#1A2433", "#E8C39A", "#F3EEE4",
    "zipnn / zipnn",
    "Python · safetensors · Hugging Face · vLLM",
    '''
    <text x="100" y="220" class="u" fill="#F3EEE4" fill-opacity="0.9" font-size="22">compress(tensor) → smaller, exact</text>
    <text x="100" y="270" class="u" fill="#E8C39A" font-size="16">332★ public library · IEEE CLOUD 2025</text>
    <rect x="100" y="310" width="420" height="10" rx="5" fill="#C2410C"/>
    <rect x="100" y="310" width="180" height="10" rx="5" fill="#E8C39A"/>
    ''',
))

write("cover", "skystore", poster(
    "#1F2A24", "#A8C5B5", "#F3EEE4",
    "IBM RESEARCH + UC BERKELEY  ·  VLDB 2025",
    "SkyStore",
    ["Cost-optimal object placement", "across regions and clouds."],
    '''
    <rect x="520" y="280" width="70" height="180" fill="#A8C5B5" fill-opacity="0.2"/>
    <rect x="600" y="220" width="70" height="240" fill="#A8C5B5" fill-opacity="0.35"/>
    <rect x="680" y="340" width="70" height="120" fill="#C2410C" fill-opacity="0.85"/>
    ''',
))
write("hover", "skystore", hover_frame(
    "#141C18", "#A8C5B5", "#F3EEE4",
    "Virtual buckets",
    "S3-compatible API · TTL placement · up to 6× cheaper",
    '''
    <text x="100" y="200" class="u" fill="#A8C5B5" font-size="15">AWS  ·  Azure  ·  GCS</text>
    <text x="100" y="260" class="d" fill="#F3EEE4" font-size="42">one store</text>
    <text x="100" y="320" class="u" fill="#F3EEE4" fill-opacity="0.7" font-size="18">many clouds, one cost policy</text>
    ''',
))

write("cover", "llmd", poster(
    "#2A2030", "#C9B7E8", "#F3EEE4",
    "IBM RESEARCH  ·  AI PLATFORMS",
    "llm-d",
    ["Distributed inference for large", "language models, in production."],
    '''
    <path d="M520 480 C560 320, 700 320, 740 480" fill="none" stroke="#C9B7E8" stroke-width="3"/>
    <circle cx="560" cy="360" r="10" fill="#C2410C"/>
    <circle cx="640" cy="300" r="10" fill="#C9B7E8"/>
    <circle cx="720" cy="360" r="10" fill="#C9B7E8"/>
    ''',
))
write("hover", "llmd", hover_frame(
    "#1B1520", "#C9B7E8", "#F3EEE4",
    "llm-d.ai",
    "Inference scheduler · KV cache · Kubernetes",
    '''
    <text x="100" y="210" class="u" fill="#C9B7E8" font-size="16">scheduler → prefill / decode → cache</text>
    <rect x="100" y="250" width="200" height="70" rx="8" fill="#C9B7E8" fill-opacity="0.15"/>
    <rect x="320" y="250" width="200" height="70" rx="8" fill="#C2410C" fill-opacity="0.35"/>
    <rect x="540" y="250" width="140" height="70" rx="8" fill="#C9B7E8" fill-opacity="0.15"/>
    ''',
))

write("cover", "clubtech", poster(
    "#3A2A22", "#E0B48A", "#F3EEE4",
    "CONTRACT  ·  2023",
    "Club Tech",
    ["Game development for a Tel Aviv", "studio. Emotions. Matching."],
    '''
    <circle cx="620" cy="360" r="90" fill="#E0B48A" fill-opacity="0.15"/>
    <circle cx="680" cy="400" r="50" fill="#C2410C" fill-opacity="0.7"/>
    ''',
))
write("hover", "clubtech", hover_frame(
    "#261C17", "#E0B48A", "#F3EEE4",
    "Subcontractor",
    "Unity · C# · shipped titles, no longer supported",
))

# Live games without itch art
write("cover", "klafi", poster(
    "#E7D7B8", "#1F4A44", "#1A1612",
    "GAME  ·  LIVE",
    "Klafi",
    ["Hebrew civic card game.", "Packs, binders, a disclosed agenda."],
    '''
    <rect x="560" y="220" width="160" height="230" rx="12" fill="#1F4A44"/>
    <rect x="576" y="248" width="128" height="80" rx="6" fill="#E7D7B8"/>
    <text x="640" y="400" text-anchor="middle" class="d" fill="#E7D7B8" font-size="28">קלפי</text>
    ''',
))
write("hover", "klafi", hover_frame(
    "#1F4A44", "#E7D7B8", "#F3EEE4",
    "klafi.vercel.app",
    "Daily packs · binder · studio · Hebrew-first",
    '''
    <text x="110" y="230" class="d" fill="#E7D7B8" font-size="48">הקלפים</text>
    <text x="110" y="300" class="u" fill="#F3EEE4" fill-opacity="0.8" font-size="18">A collect-only TCG for Israeli elections.</text>
    ''',
))

write("cover", "holdemle", poster(
    "#1E3A2F", "#F2D48A", "#F3EEE4",
    "GAME  ·  LIVE  ·  POKER.ORG",
    "Hold'emle",
    ["Daily poker Wordle.", "Guess four pre-flop equities."],
    '''
    <rect x="560" y="240" width="86" height="120" rx="10" fill="#FFFBF4"/>
    <rect x="656" y="240" width="86" height="120" rx="10" fill="#C2410C"/>
    <text x="603" y="310" text-anchor="middle" class="d" fill="#1E3A2F" font-size="28">A♠</text>
    <text x="699" y="310" text-anchor="middle" class="d" fill="#FFFBF4" font-size="28">7♥</text>
    ''',
))

write("cover", "conveyor", poster(
    "#F0D9A8", "#2A4A28", "#1A1612",
    "GAME  ·  DRAGONCON 2026",
    "Conveyor",
    ["Kitchen belt race.", "Print-and-play + digital playtest."],
    '''
    <rect x="80" y="500" width="640" height="18" rx="9" fill="#2A4A28"/>
    <circle cx="180" cy="509" r="16" fill="#C2410C"/>
    <circle cx="280" cy="509" r="16" fill="#F3EEE4"/>
    <circle cx="380" cy="509" r="16" fill="#C2410C"/>
    ''',
))

write("cover", "u20", poster(
    "#3C2A55", "#E8C36A", "#F3EEE4",
    "GAME  ·  LIVE",
    "U20 Manager",
    ["Browser basketball roguelike.", "Recruit, train, win the week."],
    '''
    <circle cx="640" cy="360" r="100" fill="none" stroke="#E8C36A" stroke-width="8"/>
    <circle cx="640" cy="360" r="8" fill="#F3EEE4"/>
    ''',
))
write("hover", "u20", hover_frame(
    "#26183A", "#E8C36A", "#F3EEE4",
    "14-week season",
    "Chemistry · facilities · 2.2B face combos",
))

write("cover", "packrat", poster(
    "#3A3328", "#D9C29A", "#F3EEE4",
    "GAME  ·  LIVE",
    "Pack Rat",
    ["A collecting hunt.", "pack-rat-game.vercel.app"],
    '''
    <rect x="540" y="260" width="180" height="180" fill="none" stroke="#D9C29A" stroke-width="2"/>
    <rect x="570" y="290" width="50" height="50" fill="#C2410C"/>
    <rect x="640" y="360" width="50" height="50" fill="#D9C29A"/>
    ''',
))
write("hover", "packrat", hover_frame(
    "#241F1A", "#D9C29A", "#F3EEE4",
    "Set Hunter",
    "Live web prototype · no longer the title on the box",
))

# Projects
projects = [
    ("bbfantasy", "#2C3E6B", "#F0C36A", "BB Fantasy", "U21 Israel fantasy + U21dle.", "BuzzerBeater community tools."),
    ("boxscore", "#243028", "#9EC3A0", "Box Score", "A sharper read of BB games.", "Analysis tool, still live."),
    ("riftrade", "#2C2430", "#C9B4E0", "RifTrade", "Riftbound card swaps.", "Non-commercial community directory."),
    ("wc26", "#3A1F1F", "#E8A090", "WC26 Bet", "Friendly World Cup pool.", "Group-stage picks, Hebrew UI."),
    ("gamerev", "#1F2430", "#8FB4D9", "GameRev", "A small reviews catalog.", "Sort by date or rank."),
    ("classmatch", "#24322A", "#A9C9B2", "Class Match", "Students to classes.", "PuLP linear programs, two solvers."),
    ("chores", "#2A2824", "#C9B89A", "Chores", "Recurring home tasks.", "Next.js + Supabase. Parked."),
    ("japan", "#2A2430", "#E0B0C0", "Japan Trip", "Couple travel planner.", "13 areas, 192 activities. Parked."),
    ("digest", "#222830", "#A8C0D8", "AI Digest", "Personalized AI news.", "16 sources, learned ranking. Parked."),
    ("seam", "#26241F", "#C4B49A", "Seam Carve", "Content-aware resize.", "Computer graphics course."),
    ("people", "#242028", "#C0A8C8", "People Data", "People-analytics course.", "Python notebooks. Coursework."),
    ("hwcheck", "#202428", "#A8B8C8", "HW Checker", "Computational models.", "Unity homework checker."),
    ("hrcc", "#20261F", "#A8C0A0", "HRCC", "Hospitals–residents.", "Consistent-couples variation."),
    ("emotions", "#3A2430", "#E0A0B4", "Emotions", "Club Tech title.", "Unity. No longer supported."),
    ("matching", "#24303A", "#A0C0E0", "Matching", "Club Tech title.", "Unity. No longer supported."),
]

for slug, bg, accent, title, a, b in projects:
    write("cover", slug, poster(bg, accent, "#F3EEE4", "PROJECT", title, [a, b]))
    write("hover", slug, hover_frame(
        bg, accent, "#F3EEE4", title,
        "Open the link to see the thing itself.",
        f'<text x="100" y="250" class="u" fill="{accent}" font-size="20">{a}</text>',
    ))

print("done")
