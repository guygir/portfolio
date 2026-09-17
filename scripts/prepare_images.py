#!/usr/bin/env python3
from pathlib import Path
from PIL import Image

ROOT = Path("/agent")
OUT_C = ROOT / "images" / "covers"
OUT_H = ROOT / "images" / "hover"
OUT_C.mkdir(parents=True, exist_ok=True)
OUT_H.mkdir(parents=True, exist_ok=True)
W, H = 1600, 1000


def load(path):
    im = Image.open(path).convert("RGBA")
    return im


def contain(im, size, bg):
    tw, th = size
    r = min(tw / im.width, th / im.height)
    nw, nh = max(1, int(im.width * r)), max(1, int(im.height * r))
    scaled = im.resize((nw, nh), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", size, bg)
    canvas.paste(scaled, ((tw - nw) // 2, (th - nh) // 2), scaled)
    return canvas.convert("RGB")


def cover(im, size):
    tw, th = size
    r = max(tw / im.width, th / im.height)
    nw, nh = max(1, int(im.width * r)), max(1, int(im.height * r))
    scaled = im.resize((nw, nh), Image.Resampling.LANCZOS)
    left = (nw - tw) // 2
    top = (nh - th) // 2
    return scaled.crop((left, top, left + tw, top + th)).convert("RGB")


def save_jpg(im, dest, q=84):
    dest = dest.with_suffix(".jpg")
    im.save(dest, "JPEG", quality=q, optimize=True)
    print(dest.name, dest.stat().st_size)


pairs = [
    # slug, cover src, hover src, cover mode, hover mode, cover bg
    ("zipnn", "/tmp/real-art/ZipNN-logo.png", "/tmp/real-art/zipnn-flow.png", "contain", "cover", (0, 0, 0, 255)),
    ("klafi", "/tmp/real-art/klafi-kalpi.png", "/agent/images/real/klafi-home.png", "cover", "cover", (0, 0, 0, 255)),
    ("holdemle", "/agent/images/real/holdemle-home.png", "/agent/images/real/holdemle-home.png", "cover", "cover", (255, 255, 255, 255)),
    ("conveyor", "/tmp/real-art/conveyor-cover.png", "/agent/images/real/conveyor-home.png", "cover", "cover", (0, 0, 0, 255)),
    ("packrat", "/tmp/real-art/packrat-mammoth.png", "/tmp/real-art/packrat-smilodon.png", "cover", "cover", (20, 16, 12, 255)),
    ("gamerev", "/tmp/real-art/gamerev-hero.png", "/agent/images/real/gamerev-home.png", "contain", "cover", (248, 246, 242, 255)),
    ("wc26", "/tmp/real-art/wc26-banner.png", "/agent/images/real/wc26-home.png", "cover", "cover", (0, 0, 0, 255)),
    ("boxscore", "/tmp/real-art/boxscore-court.png", "/tmp/real-art/boxscore-court.png", "cover", "cover", (20, 40, 20, 255)),
    ("rps", "/agent/images/covers/rps.png", "/tmp/portfolio-assets/itch-extra/rps-0.png", "cover", "contain", (238, 228, 218, 255)),
    ("arrows", "/agent/images/covers/arrows.png", "/tmp/portfolio-assets/itch-extra/arrows-theorem-0.png", "cover", "contain", (248, 241, 231, 255)),
    ("insecurities", "/agent/images/covers/insecurities.png", "/tmp/portfolio-assets/itch-extra/insecurities-2.png", "cover", "cover", (0, 0, 0, 255)),
    ("wonderful-life", "/agent/images/covers/wonderful-life.png", "/tmp/portfolio-assets/itch-extra/wonderful-life-0.png", "cover", "contain", (0, 0, 0, 255)),
    ("sivan", "/agent/images/covers/sivan.png", "/tmp/portfolio-assets/itch-extra/sivan-0.png", "cover", "contain", (228, 166, 114, 255)),
    ("xxkiller", "/agent/images/covers/xxkiller.png", "/tmp/portfolio-assets/itch-extra/xxkillerxxs-pc-0.png", "cover", "contain", (0, 0, 0, 255)),
    ("galaxy", "/agent/images/covers/galaxy.png", "/tmp/portfolio-assets/itch-extra/around-the-galaxy-0.png", "cover", "contain", (0, 0, 0, 255)),
]

# Prefer newly captured homes if they exist and are reasonably large
homes = {
    "holdemle": "/agent/images/real/holdemle-home.png",
    "bbfantasy": "/agent/images/real/bbfantasy-home.png",
    "u20": "/agent/images/real/u20-home.png",
    "riftrade": "/agent/images/real/riftrade-home.png",
    "classmatch": "/agent/images/real/classmatch-home.png",
    "llmd": "/agent/images/real/llmd-home.png",
    "skystore": "/agent/images/real/skystore-arxiv.png",
    "packrat_home": "/agent/images/real/packrat-home.png",
    "zipnn_gh": "/agent/images/real/zipnn-gh.png",
}

# extra home-only tiles
for slug, src in [
    ("bbfantasy", homes["bbfantasy"]),
    ("u20", homes["u20"]),
    ("riftrade", homes["riftrade"]),
    ("classmatch", homes["classmatch"]),
    ("llmd", homes["llmd"]),
    ("skystore", homes["skystore"]),
]:
    p = Path(src)
    if p.exists() and p.stat().st_size > 20000:
        pairs.append((slug, src, src, "cover", "cover", (255, 255, 255, 255)))

# packrat hover should be the live home if we have it
if Path(homes["packrat_home"]).exists() and Path(homes["packrat_home"]).stat().st_size > 20000:
    pairs = [p for p in pairs if p[0] != "packrat"]
    pairs.append(("packrat", "/tmp/real-art/packrat-mammoth.png", homes["packrat_home"], "cover", "cover", (20, 16, 12, 255)))

if Path(homes["zipnn_gh"]).exists() and Path(homes["zipnn_gh"]).stat().st_size > 20000:
    pairs = [p for p in pairs if p[0] != "zipnn"]
    pairs.append(("zipnn", "/tmp/real-art/ZipNN-logo.png", homes["zipnn_gh"], "contain", "cover", (0, 0, 0, 255)))

# klafi second art as alternate if home is weak
if Path("/agent/images/real/klafi-home.png").stat().st_size < 20000:
    pairs = [p for p in pairs if p[0] != "klafi"]
    pairs.append(("klafi", "/tmp/real-art/klafi-kalpi.png", "/tmp/real-art/klafi-knesset.png", "cover", "cover", (0, 0, 0, 255)))

seen = set()
for slug, csrc, hsrc, cmode, hmode, bg in pairs:
    if slug in seen:
        continue
    seen.add(slug)
    cpath, hpath = Path(csrc), Path(hsrc)
    if not cpath.exists():
        print("missing cover", slug, cpath)
        continue
    if not hpath.exists():
        hpath = cpath
    cim, him = load(cpath), load(hpath)
    cout = contain(cim, (W, H), bg) if cmode == "contain" else cover(cim, (W, H))
    hout = contain(him, (W, H), bg) if hmode == "contain" else cover(him, (W, H))
    # if cover and hover ended up identical, try contain vs cover
    save_jpg(cout, OUT_C / slug)
    save_jpg(hout, OUT_H / slug)

print("done", sorted(seen))
