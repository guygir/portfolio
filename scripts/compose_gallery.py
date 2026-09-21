#!/usr/bin/env python3
"""Build gallery tiles from real brand/key art — logos on fields, not website chrome."""

from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path("/agent")
OUT_C = ROOT / "images" / "covers"
OUT_H = ROOT / "images" / "hover"
OUT_C.mkdir(parents=True, exist_ok=True)
OUT_H.mkdir(parents=True, exist_ok=True)
W, H = 1600, 1000


def load(path):
    im = Image.open(path)
    if im.mode not in ("RGB", "RGBA"):
        im = im.convert("RGBA")
    elif im.mode != "RGBA":
        im = im.convert("RGBA")
    return im


def contain(im, size, bg, pad=0.16):
    tw, th = size
    box_w, box_h = int(tw * (1 - pad * 2)), int(th * (1 - pad * 2))
    r = min(box_w / im.width, box_h / im.height)
    nw, nh = max(1, int(im.width * r)), max(1, int(im.height * r))
    scaled = im.resize((nw, nh), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", size, bg)
    canvas.paste(scaled, ((tw - nw) // 2, (th - nh) // 2), scaled)
    return canvas.convert("RGB")


def cover(im, size):
    if im.mode != "RGBA":
        im = im.convert("RGBA")
    tw, th = size
    r = max(tw / im.width, th / im.height)
    nw, nh = max(1, int(im.width * r)), max(1, int(im.height * r))
    scaled = im.resize((nw, nh), Image.Resampling.LANCZOS)
    left = (nw - tw) // 2
    top = (nh - th) // 2
    return scaled.crop((left, top, left + tw, top + th)).convert("RGB")


def crop_box(im, box, size, bg=None, mode="cover"):
    x0, y0, x1, y1 = box
    w, h = im.size
    piece = im.crop((int(x0 * w), int(y0 * h), int(x1 * w), int(y1 * h)))
    if bg is None:
        return cover(piece, size)
    return contain(piece, size, bg, pad=0.04) if mode == "contain" else cover(piece, size)


def save_jpg(im, dest, q=88):
    dest = dest.with_suffix(".jpg")
    im.save(dest, "JPEG", quality=q, optimize=True)
    print(f"{dest.relative_to(ROOT)}  {dest.stat().st_size // 1024}k  {im.size}")


# Source map
A = {
    "zipnn_logo": "/tmp/real-art/ZipNN-logo.png",
    "zipnn_flow": "/tmp/more-art/zipnn-flow.png",
    "llmd_icon": "/tmp/more-art/llm-d-icon-color.png",
    "llmd_stack": "/tmp/more-art/llm-d-stacked-color.png",
    "llmd_wide": "/tmp/more-art/llm-d-horizontal-color.png",
    "klafi_pack": "/tmp/more-art/klafi-pack.png",
    "klafi_kalpi": "/tmp/real-art/klafi-kalpi.png",
    "klafi_knesset": "/tmp/more-art/klafi-knesset.png",
    "conveyor_kit": "/tmp/real-art/conveyor-cover.png",
    "conveyor_logo": "/tmp/more-art/conveyor-logo.png",
    "pack_ace": "/tmp/more-art/sh-ace_tracker.png",
    "pack_aqua": "/tmp/more-art/sh-aquatic.png",
    "pack_mammoth": "/tmp/more-art/packrat-mammoth.png",
    "wc26_crest": "/tmp/more-art/wc26-battalion.png",
    "wc26_banner": "/tmp/more-art/wc26-banner.png",
    "sky_arch": "/tmp/real-art/skystore-arch.png",
    "sky_ttl": "/tmp/real-art/skystore-ttl.png",
    "grev": "/tmp/more-art/gamerev-hero.png",
    "court": "/tmp/more-art/boxscore-court.png",
    "holdemle": "/agent/images/real/holdemle-home.png",
    "u20": "/agent/images/real/u20-home.png",
    "bb": "/agent/images/real/bbfantasy-home.png",
    "rif": "/agent/images/real/riftrade-home.png",
    "cls": "/agent/images/real/classmatch-home.png",
    "grev_home": "/agent/images/real/gamerev-home.png",
    "box_home": "/agent/images/real/boxscore-home.png",
    "rps": "/agent/images/covers/rps.png",
    "rps_h": "/tmp/portfolio-assets/itch-extra/rps-0.png",
    "arrows": "/agent/images/covers/arrows.png",
    "arrows_h": "/tmp/portfolio-assets/itch-extra/arrows-theorem-0.png",
    "arrows_art": "/tmp/more-art/arrows-img.png",
    "ins": "/agent/images/covers/insecurities.png",
    "ins_h": "/tmp/portfolio-assets/itch-extra/insecurities-0.png",
    "life": "/agent/images/covers/wonderful-life.png",
    "life_h": "/tmp/portfolio-assets/itch-extra/wonderful-life-0.png",
    "sivan": "/agent/images/covers/sivan.png",
    "sivan_h": "/tmp/portfolio-assets/itch-extra/sivan-0.png",
    "xx": "/agent/images/covers/xxkiller.png",
    "xx_h": "/tmp/portfolio-assets/itch-extra/xxkillerxxs-pc-0.png",
    "gal": "/agent/images/covers/galaxy.png",
    "gal_h": "/tmp/portfolio-assets/itch-extra/around-the-galaxy-0.png",
}

WHITE = (255, 255, 255, 255)
CREAM = (246, 241, 232, 255)
INK = (8, 8, 8, 255)
FELT = (18, 56, 38, 255)
PURPLE = (46, 38, 122, 255)
LILAC = (248, 246, 252, 255)
COURT = (16, 36, 22, 255)
PAPER = (252, 252, 252, 255)


def build():
    jobs = []

    jobs.append(("llmd", contain(load(A["llmd_icon"]), (W, H), WHITE, 0.24),
                 contain(load(A["llmd_stack"]), (W, H), WHITE, 0.18)))

    jobs.append(("zipnn", contain(load(A["zipnn_logo"]), (W, H), INK, 0.10),
                 cover(load(A["zipnn_flow"]), (W, H))))

    jobs.append(("klafi", contain(load(A["klafi_pack"]), (W, H), CREAM, 0.08),
                 cover(load(A["klafi_kalpi"]), (W, H))))

    jobs.append(("conveyor", cover(load(A["conveyor_kit"]), (W, H)),
                 contain(load(A["conveyor_logo"]), (W, H), CREAM, 0.18)))

    jobs.append(("packrat", cover(load(A["pack_ace"]), (W, H)),
                 cover(load(A["pack_aqua"]), (W, H))))

    jobs.append(("wc26", contain(load(A["wc26_crest"]), (W, H), WHITE, 0.08),
                 cover(load(A["wc26_banner"]), (W, H))))

    jobs.append(("skystore", contain(load(A["sky_arch"]), (W, H), PAPER, 0.08),
                 contain(load(A["sky_ttl"]), (W, H), PAPER, 0.10)))

    jobs.append(("gamerev", contain(load(A["grev"]), (W, H), LILAC, 0.20),
                 cover(load(A["grev_home"]), (W, H)) if Path(A["grev_home"]).exists()
                 else contain(load(A["grev"]), (W, H), LILAC, 0.12)))

    jobs.append(("boxscore", contain(load(A["court"]), (W, H), COURT, 0.10),
                 cover(load(A["box_home"]), (W, H)) if Path(A["box_home"]).exists()
                 else contain(load(A["court"]), (W, H), COURT, 0.04)))

    hold = load(A["holdemle"])
    jobs.append(("holdemle",
                 crop_box(hold, (0.28, 0.82, 0.72, 0.96), (W, H), FELT, "contain"),
                 crop_box(hold, (0.18, 0.00, 0.82, 0.22), (W, H), WHITE, "contain")))

    u20 = load(A["u20"])
    jobs.append(("u20",
                 crop_box(u20, (0.15, 0.00, 0.85, 0.42), (W, H)),
                 crop_box(u20, (0.10, 0.00, 0.90, 0.70), (W, H))))

    bb = load(A["bb"])
    jobs.append(("bbfantasy",
                 crop_box(bb, (0.18, 0.18, 0.82, 0.88), (W, H), WHITE, "contain"),
                 cover(bb, (W, H))))

    rif = load(A["rif"])
    jobs.append(("riftrade",
                 crop_box(rif, (0.04, 0.06, 0.62, 0.28), (W, H), WHITE, "contain"),
                 cover(rif, (W, H))))

    cls = load(A["cls"])
    jobs.append(("classmatch",
                 crop_box(cls, (0.16, 0.08, 0.84, 0.72), (W, H), (244, 247, 252, 255), "contain"),
                 cover(cls, (W, H))))

    jobs.append(("rps", cover(load(A["rps"]), (W, H)), contain(load(A["rps_h"]), (W, H), CREAM, 0.08)))
    jobs.append(("arrows", cover(load(A["arrows"]), (W, H)),
                 contain(load(A["arrows_art"]), (W, H), (18, 22, 28, 255), 0.12)))
    jobs.append(("insecurities", cover(load(A["ins"]), (W, H)), cover(load(A["ins_h"]), (W, H))))
    jobs.append(("wonderful-life", cover(load(A["life"]), (W, H)),
                 contain(load(A["life_h"]), (W, H), INK, 0.06)))
    jobs.append(("sivan", cover(load(A["sivan"]), (W, H)),
                 contain(load(A["sivan_h"]), (W, H), (228, 166, 114, 255), 0.06)))
    jobs.append(("xxkiller", cover(load(A["xx"]), (W, H)), cover(load(A["xx_h"]), (W, H))))
    jobs.append(("galaxy", cover(load(A["gal"]), (W, H)), cover(load(A["gal_h"]), (W, H))))

    for slug, c, h in jobs:
        save_jpg(c, OUT_C / slug)
        save_jpg(h, OUT_H / slug)

    print("tiles", len(jobs))


if __name__ == "__main__":
    build()
