# Exports web logo assets from the approved brand files.
# Usage: python3 scripts/export-brand-assets.py "<folder with TSMlogo-dark.png and Tradewinds WHITE.png>" public/brand app
import sys
from PIL import Image
src, out, appdir = sys.argv[1], sys.argv[2], sys.argv[3]
def load(name):
    im = Image.open(f"{src}/{name}").convert("RGBA")
    return im.crop(im.getbbox())
dark = load("TSMlogo-dark.png")      # blue monogram + navy wordmark (light surfaces)
white = load("Tradewinds WHITE.png") # all-white (dark surfaces)
print("trimmed sizes", dark.size, white.size)

def split_x(im):
    """Widest transparent column run in the left 40% = gap between monogram and wordmark."""
    a = im.split()[3]
    w, h = im.size
    cols = [any(a.getpixel((x, y)) > 8 for y in range(0, h, 2)) for x in range(int(w * 0.4))]
    best, x = (0, 0), 0
    while x < len(cols):
        if not cols[x]:
            s0 = x
            while x < len(cols) and not cols[x]: x += 1
            if x - s0 > best[1] - best[0]: best = (s0, x)
        x += 1
    return best
for name, im in (("dark", dark), ("white", white)):
    print(name, "gap", split_x(im))

def save_h(im, path, h):
    r = im.resize((round(im.width * h / im.height), h), Image.LANCZOS)
    r.save(path, optimize=True)
    print(path.split("/")[-1], r.size)

save_h(dark, f"{out}/tradewinds-wordmark-navy.png", 96)
save_h(white, f"{out}/tradewinds-wordmark-reversed.png", 96)
g0, _ = split_x(dark)
mono_blue = dark.crop((0, 0, g0, dark.height)); mono_blue = mono_blue.crop(mono_blue.getbbox())
g1, _ = split_x(white)
mono_white = white.crop((0, 0, g1, white.height)); mono_white = mono_white.crop(mono_white.getbbox())
save_h(mono_blue, f"{out}/tradewinds-monogram-blue.png", 160)
save_h(mono_white, f"{out}/tradewinds-monogram-white.png", 160)

def tile(size, bg, pad=0.2, radius=0.18):
    t = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    from PIL import ImageDraw
    ImageDraw.Draw(t).rounded_rectangle([0, 0, size - 1, size - 1], radius=int(size * radius), fill=bg)
    inner = int(size * (1 - 2 * pad))
    m = mono_white.copy()
    m.thumbnail((inner, inner), Image.LANCZOS)
    t.alpha_composite(m, ((size - m.width) // 2, (size - m.height) // 2))
    return t
tile(512, "#004AAD").save(f"{appdir}/icon.png", optimize=True)
tile(180, "#004AAD", radius=0).convert("RGB").save(f"{appdir}/apple-icon.png", optimize=True)
print("icons written")
