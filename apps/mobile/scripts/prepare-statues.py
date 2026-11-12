#!/usr/bin/env python3
"""Prépare les statues de la DA (docs/DIRECTION_ARTISTIQUE.md) à partir de photos détourées.

Entrée  : un dossier de PNG détourés (fond transparent), nommés par numéro d'objet du Met.
          Détourage : `pip install rembg`, modèle isnet-general-use, sur l'image « primaryImage » de l'API du Met.
Sortie  : assets/statues/<nom>.webp, cadrés, étalonnés (marbre unifié), fondus vers le bas.
Usage   : python3 scripts/prepare-statues.py <dossier_png_détourés>
Dépend de Pillow uniquement. Les photos viennent de la collection Open Access du Met (domaine public, CC0).
"""
import os
import sys

from PIL import Image, ImageEnhance, ImageOps

# nom, objet du Met, (haut, bas) en fraction de la hauteur du sujet, part basse fondue, hauteur de sortie
STATUES = [
    ("hercule", 247000, (0.0, 0.47), 0.30, 900),
    ("athlete", 250556, (0.0, 0.62), 0.24, 900),
    ("bronze", 250947, (0.0, 1.0), 0.16, 900),
    ("dionysos", 256879, (0.0, 0.76), 0.22, 900),
    ("ephebe", 248579, (0.0, 0.79), 0.10, 760),
    ("zeus", 257864, (0.0, 0.9), 0.16, 760),
]


def grade(rgb: Image.Image) -> Image.Image:
    """Unifie les marbres : couleur à moitié retirée, contraste relevé, pour un rendu « pierre éclairée »."""
    grey = ImageOps.grayscale(rgb).convert("RGB")
    out = Image.blend(grey, rgb, 0.45)
    out = ImageEnhance.Contrast(out).enhance(1.18)
    return ImageEnhance.Brightness(out).enhance(1.04)


def prepare(src_dir: str, out_dir: str) -> None:
    os.makedirs(out_dir, exist_ok=True)
    for name, object_id, (top, bottom), fade, height in STATUES:
        im = Image.open(os.path.join(src_dir, f"{object_id}.png")).convert("RGBA")
        im = im.crop(im.getchannel("A").point(lambda a: 255 if a > 24 else 0).getbbox())
        w, h = im.size
        im = im.crop((0, int(h * top), w, int(h * bottom)))
        im = im.crop(im.getchannel("A").point(lambda a: 255 if a > 24 else 0).getbbox())
        w, h = im.size
        alpha = im.getchannel("A")
        # Fondu vers le bas : la statue sort de l'ombre au lieu d'être coupée net.
        start = int(h * (1 - fade))
        ramp = Image.new("L", (1, h), 255)
        for y in range(start, h):
            ramp.putpixel((0, y), int(255 * (1 - (y - start) / max(1, h - start)) ** 1.6))
        alpha = Image.composite(alpha, Image.new("L", (w, h), 0), ramp.resize((w, h)))
        rgb = grade(im.convert("RGB"))
        out = Image.merge("RGBA", (*rgb.split(), alpha))
        out = out.resize((round(w * height / h), height), Image.LANCZOS)
        path = os.path.join(out_dir, f"{name}.webp")
        out.save(path, "WEBP", quality=84, method=6)
        print(f"{name:9s} {out.size[0]}x{out.size[1]}  {os.path.getsize(path) // 1024} Ko")


if __name__ == "__main__":
    prepare(sys.argv[1], os.path.join(os.path.dirname(__file__), "..", "assets", "statues"))
