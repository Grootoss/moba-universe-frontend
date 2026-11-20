from pathlib import Path

out = Path(__file__).resolve().parents[1] / "public" / "images" / "quiz"
out.mkdir(parents=True, exist_ok=True)
roles = {
    "roam": "#2dd4bf",
    "mid": "#a78bfa",
    "jungle": "#4ade80",
    "exp": "#fb923c",
    "gold": "#fbbf24",
}
spots = [
    [(118, 118, 92), (246, 64, 28), (36, 64, 22)],
    [(150, 124, 86), (40, 72, 34), (248, 150, 26)],
    [(96, 120, 78), (230, 58, 36), (250, 150, 20)],
    [(132, 122, 96), (54, 60, 24), (236, 156, 30)],
]
for role, color in roles.items():
    for variant, marks in enumerate(spots, start=1):
        texts = "".join(
            f'<text x="{x}" y="{y}" font-size="{size}" font-family="Georgia, serif" '
            f'font-weight="700" fill="{color}">?</text>'
            for x, y, size in marks
        )
        svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#1b2230"/>
      <stop offset="1" stop-color="#10141c"/>
    </linearGradient>
  </defs>
  <rect width="320" height="180" fill="url(#g)"/>
  <circle cx="270" cy="30" r="46" fill="{color}" fill-opacity="0.16"/>
  <circle cx="36" cy="150" r="28" fill="{color}" fill-opacity="0.12"/>
  {texts}
</svg>
"""
        (out / f"{role}-{variant}.svg").write_text(svg, encoding="utf-8")

(out / "mlbb.svg").write_text(
    """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#312e81"/>
      <stop offset="1" stop-color="#111827"/>
    </linearGradient>
  </defs>
  <rect width="320" height="180" fill="url(#g)"/>
  <text x="28" y="128" font-size="92" font-family="Georgia, serif" font-weight="700" fill="#c4b5fd">?</text>
  <text x="150" y="78" font-size="42" font-family="Georgia, serif" font-weight="700" fill="#fbbf24">?</text>
  <text x="214" y="142" font-size="34" font-family="Georgia, serif" font-weight="700" fill="#67e8f9">?</text>
</svg>
""",
    encoding="utf-8",
)
print(len(list(out.glob("*.svg"))))
