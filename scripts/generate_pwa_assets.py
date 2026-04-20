from pathlib import Path

from PIL import Image

PROJECT_ROOT = Path(__file__).resolve().parent.parent
SOURCE_ICON = PROJECT_ROOT / "assets" / "images" / "icon.png"
PUBLIC_DIR = PROJECT_ROOT / "public"
OUTPUTS = {
    "pwa-192.png": (192, 192),
    "pwa-512.png": (512, 512),
    "apple-touch-icon.png": (180, 180),
    "maskable-512.png": (512, 512),
}


def main() -> None:
    PUBLIC_DIR.mkdir(parents=True, exist_ok=True)

    with Image.open(SOURCE_ICON) as image:
        base = image.convert("RGBA")
        for filename, size in OUTPUTS.items():
            resized = base.resize(size, Image.LANCZOS)
            resized.save(PUBLIC_DIR / filename)


if __name__ == "__main__":
    main()
