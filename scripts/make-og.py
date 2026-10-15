"""
페이지별 공유 이미지(1200x630) 만들기 — 카톡·SNS·검색에서 링크를 공유할 때 보이는 그림이에요.
실행: python3 scripts/make-og.py   (npm install 후, Pillow 필요)
결과: client/public/og/{페이지}-{언어}.png
"""
from pathlib import Path
import json
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
FONT_DIR = ROOT / "node_modules/pretendard/dist/public/static"
OUT = ROOT / "client/public/og"
OUT.mkdir(parents=True, exist_ok=True)

W, H = 1200, 630
BG = (7, 9, 15)
FG = (244, 246, 250)
MUTED = (154, 163, 181)
GOLD = (245, 185, 65)
MINT = (61, 220, 168)
IRIS = (139, 156, 255)
BORDER = (35, 42, 57)

def font(weight, size):
    return ImageFont.truetype(str(FONT_DIR / f"Pretendard-{weight}.otf"), size)

PAGES = {
    "reinvest": {
        "ko": ("배당 재투자 계산기", ["배당이 배당을 낳는 복리,", "몇 년 뒤 얼마일까?"], "세후 · ISA · 연금계좌까지"),
        "en": ("Dividend Reinvestment Calculator", ["Watch your dividends", "compound over time"], "DRIP · dividend growth · price growth"),
    },
    "goal": {
        "ko": ("목표 배당금 계산기", ["월 배당 100만원,", "원금은 얼마 필요할까?"], "세후 기준으로 거꾸로 계산"),
        "en": ("Dividend Goal Calculator", ["How much do I need", "for monthly income?"], "Works backward from your after-tax goal"),
    },
    "snowball": {
        "ko": ("배당 스노우볼 계산기", ["배당이 내 저축을", "앞지르는 순간"], "1년 배당금 > 1년 투자금"),
        "en": ("Dividend Snowball Simulator", ["When dividends outrun", "your contributions"], "Find your snowball year"),
    },
    "tax": {
        "ko": ("금융소득종합과세 계산기", ["배당이 연 2,000만원을", "넘으면 세금은?"], "비교과세 · 해외 배당 · 건보료"),
    },
    "compare": {
        "ko": ("계좌별 절세 비교", ["ISA vs 연금저축 vs 일반,", "어디에 담아야 남을까?"], "세금 다 뗀 금액으로 비교"),
    },
    "guide": {
        "ko": ("배당 계산기 사용 가이드", ["입력값 고르는 법부터", "결과 읽는 법까지"], "배당 재투자 · 목표 배당금 · 스노우볼"),
        "en": ("Dividend Calculator Guide", ["How to use the", "dividend calculators"], "Inputs, results and assumptions"),
    },
}

# 배당 ETF 페이지 — client/src/content/etf-data.json 에서 자동으로 만들어요
ETF = json.loads((ROOT / "client/src/content/etf-data.json").read_text(encoding="utf-8"))
GROUP_TITLE = {g["id"]: g["title"] for g in ETF["groups"]}
PAGES["etf"] = {"ko": ("배당 ETF 정보", ["인기 배당 ETF,", "한눈에 비교"], f"배당률 · 총보수 · 배당 주기 · {len(ETF['etfs'])}개")}
def _pct(v):
    s = f"{v:.4f}".rstrip("0").rstrip(".")
    return s + "%"
for e in ETF["etfs"]:
    label = e["ticker"] if e["market"] == "us" else e["name"]
    freq = "매달 배당" if e["freq"] == "월" else "분기 배당"
    PAGES[f"etf-{e['slug']}"] = {"ko": (GROUP_TITLE[e["group"]], [label, f"배당률 {_pct(e['yield'])} · {freq}"], f"총보수 {_pct(e['fee'])} · {e['short']}")}

def glow(img, center, radius, color, alpha):
    layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    x, y = center
    d.ellipse([x - radius, y - radius, x + radius, y + radius], fill=color + (alpha,))
    layer = layer.filter(ImageFilter.GaussianBlur(radius // 2))
    img.alpha_composite(layer)

def brand_mark(img, x, y, s):
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([x, y, x + s, y + s], radius=int(s * 0.28), fill=GOLD)
    bw = s * 0.13
    for i, h in enumerate([0.22, 0.34, 0.5]):
        bx = x + s * (0.25 + i * 0.19)
        d.rounded_rectangle([bx, y + s * (0.75 - h), bx + bw, y + s * 0.75], radius=int(bw * 0.4), fill=(10, 12, 18))

def bars(img, x0, y0, w, h):
    """오른쪽 아래 장식: 점점 커지는 배당 막대"""
    d = ImageDraw.Draw(img)
    n = 10
    gap = 14
    bw = (w - gap * (n - 1)) / n
    for i in range(n):
        frac = 0.18 + 0.82 * ((i + 1) / n) ** 1.6
        bh = h * frac
        bx = x0 + i * (bw + gap)
        top = y0 + h - bh
        col = GOLD if i == n - 1 else (int(GOLD[0] * 0.35 + BG[0]), int(GOLD[1] * 0.35 + BG[1]), int(GOLD[2] * 0.35 + BG[2]))
        d.rounded_rectangle([bx, top, bx + bw, y0 + h], radius=8, fill=col)

for key, langs in PAGES.items():
    for lang, (name, lines, sub) in langs.items():
        img = Image.new("RGBA", (W, H), BG + (255,))
        glow(img, (160, 40), 420, GOLD, 40)
        glow(img, (1150, 120), 360, IRIS, 32)
        d = ImageDraw.Draw(img)
        d.rectangle([0, 0, W - 1, H - 1], outline=BORDER, width=2)

        brand_mark(img, 72, 64, 56)
        d.text((144, 76), "배당 계산기" if lang == "ko" else "Dividend Calculator", font=font("SemiBold", 30), fill=FG)
        d.text((72, 168), name, font=font("SemiBold", 34), fill=GOLD)

        size = 68 if lang == "ko" else 64
        # 긴 이름(국내 ETF)은 한 줄에 들어가게 글자를 줄여요
        while size > 36 and max(d.textlength(l, font=font("ExtraBold", size)) for l in lines) > 1056:
            size -= 2
        y = 228
        for line in lines:
            d.text((72, y), line, font=font("ExtraBold", size), fill=FG)
            y += int(size * 1.25)
        d.text((72, y + 18), sub, font=font("Medium", 30), fill=MUTED)

        bars(img, 820, 330, 300, 220)
        d.text((72, H - 64), "dividendcalcul.jayinform.com", font=font("Medium", 24), fill=(107, 116, 134))

        img.convert("RGB").save(OUT / f"{key}-{lang}.png", optimize=True)
        print("✓", f"og/{key}-{lang}.png")
