from pathlib import Path
from PIL import Image

PROJECT_ROOT = Path("/home/ubuntu/functional-bodybuilding-coach")
ASSETS = {
    "assets/images/icon.png": 1024,
    "assets/images/splash-icon.png": 1024,
    "assets/images/android-icon-foreground.png": 1024,
    "assets/images/favicon.png": 512,
}

for relative_path, size in ASSETS.items():
    path = PROJECT_ROOT / relative_path
    image = Image.open(path).convert("RGBA")
    image.thumbnail((size, size), Image.Resampling.LANCZOS)

    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    offset = ((size - image.width) // 2, (size - image.height) // 2)
    canvas.paste(image, offset, image)
    canvas.save(path, format="PNG", optimize=True, compress_level=9)

    kb = path.stat().st_size / 1024
    print(f"{relative_path}: {kb:.1f}KB")
