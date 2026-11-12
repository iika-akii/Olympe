#!/usr/bin/env python3
"""Prépare les gravures de la DA (docs/DIRECTION_ARTISTIQUE.md).

Chaque image sort en « encre seule » : noir pur, transparence = papier. L'app la teinte ensuite
dans la couleur d'encre du thème (tintColor), donc changer la palette ne demande pas de refaire les images.

Deux traitements :
- `encre`  : une vraie gravure (Met) → on retire le papier, on garde le trait ;
- `graver` : une peinture (Wikimedia) → on la regrave en tailles croisées dont l'épaisseur suit l'ombre.

Usage : python3 scripts/prepare-engravings.py <dossier_des_originaux>
Originaux attendus : adam.jpg, ange.jpg (Wikimedia Commons), hercule.jpg, forge.jpg, bacchus.jpg, phaeton.jpg (Met Open Access).
Dépend de Pillow et numpy.
"""
import os
import sys

import numpy as np
from PIL import Image, ImageFilter

Image.MAX_IMAGE_PIXELS = None

# nom, traitement, cadrage (x0, y0, x1, y1 en fractions), taille de sortie, part basse fondue,
# seuil d'ombre à partir duquel la première taille apparaît (peintures seulement : plus haut = fond plus blanc)
JOBS = [
    ("adam", "graver", (0.22, 0.20, 0.58, 0.68), (1200, 727), 0.24, 0.24),
    ("ange", "graver", (0.21, 0.17, 0.61, 0.535), (1200, 727), 0.22, 0.16),
    ("hercule", "encre", (0.12, 0.09, 0.88, 0.42), (1200, 727), 0.24, 0),
    ("forge", "encre", (0.14, 0.05, 0.86, 0.63), (1200, 727), 0.24, 0),
    ("bacchus", "encre", (0.12, 0.07, 0.88, 0.43), (1200, 727), 0.18, 0),
    ("phaeton", "encre", (0.035, 0.0, 0.99, 0.975), (900, 900), 0.0, 0),
    ("mains", "graver", (0.325, 0.345, 0.455, 0.63), (1024, 1024), 0.0, 0.30),
]


def crop(im: Image.Image, box) -> Image.Image:
    w, h = im.size
    return im.crop((int(box[0] * w), int(box[1] * h), int(box[2] * w), int(box[3] * h)))


def levels(lum: np.ndarray, low: float, high: float) -> np.ndarray:
    a, b = np.percentile(lum, low), np.percentile(lum, high)
    return np.clip((lum - a) / max(1e-6, b - a), 0, 1)


def encre(im: Image.Image, size) -> np.ndarray:
    """Gravure sur papier vieilli → quantité d'encre (0..1)."""
    lum = np.asarray(im.convert("L").resize(size, Image.LANCZOS), dtype=np.float32) / 255
    return (1 - levels(lum, 3, 82)) ** 0.85


def graver(im: Image.Image, size, start: float) -> np.ndarray:
    """Peinture → tailles croisées. Les lignes s'épaississent dans l'ombre et s'infléchissent avec le modelé."""
    ss = 2
    w, h = size[0] * ss, size[1] * ss
    grey = im.convert("L").resize((w, h), Image.LANCZOS)
    lum = levels(np.asarray(grey.filter(ImageFilter.GaussianBlur(1.6 * ss)), dtype=np.float32) / 255, 1, 99) ** 0.72  # ombres ouvertes : le regard reste lisible
    form = np.asarray(grey.filter(ImageFilter.GaussianBlur(14 * ss)), dtype=np.float32) / 255
    dark = 1 - lum
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)

    def hatch(angle, period, bend, start, width, gamma):
        t = np.deg2rad(angle)
        phase = (xx * np.cos(t) + yy * np.sin(t)) / (period * ss) + bend * form
        dist = np.abs((phase % 1) - 0.5) * 2
        thick = np.clip((dark - start) / (1 - start), 0, 1) ** gamma * width
        # Sous le seuil d'ombre, pas de trait du tout : le papier reste nu.
        return np.where(thick > 0.03, np.clip((thick - dist) / (1.6 / period) + 0.5, 0, 1), 0)

    ink = np.maximum.reduce([
        hatch(32, 7.0, 5.0, start, 0.92, 0.85),  # première taille : toute l'image sauf les lumières
        hatch(-38, 7.5, -4.0, 0.46, 0.80, 0.9),  # contre-taille : les ombres
        hatch(84, 8.0, 3.0, 0.72, 0.70, 1.0),    # troisième taille : les noirs
    ])
    # Contours : le trait de burin qui cerne les formes.
    gy, gx = np.gradient(lum)
    edge = np.clip((np.hypot(gx, gy) * ss - 0.030) / 0.045, 0, 1)
    ink = np.maximum(ink, edge * 0.95)
    out = Image.fromarray((ink * 255).astype(np.uint8)).resize(size, Image.LANCZOS)
    return np.asarray(out, dtype=np.float32) / 255


def prepare(src_dir: str, out_dir: str) -> None:
    os.makedirs(out_dir, exist_ok=True)
    sources = {"mains": "adam"}
    for name, mode, box, size, fade, start in JOBS:
        im = crop(Image.open(os.path.join(src_dir, f"{sources.get(name, name)}.jpg")).convert("RGB"), box)
        ink = encre(im, size) if mode == "encre" else graver(im, size, start)
        h, w = ink.shape
        if fade > 0:  # fondu vers le bas : la gravure se perd dans le papier
            ramp = np.ones(h, dtype=np.float32)
            start = int(h * (1 - fade))
            ramp[start:] = (1 - (np.arange(h - start) / max(1, h - start))) ** 1.5
            ink = ink * ramp[:, None]
        if name == "phaeton":  # médaillon : on ne garde que le disque
            yy, xx = np.mgrid[0:h, 0:w]
            r = np.hypot(xx - w / 2, yy - h / 2)
            ink = ink * np.clip((w / 2 - 3 - r) / 3, 0, 1)
        rgba = np.zeros((h, w, 4), dtype=np.uint8)
        rgba[..., 3] = (np.clip(ink, 0, 1) * 255).astype(np.uint8)
        path = os.path.join(out_dir, f"{name}.webp")
        Image.fromarray(rgba, "RGBA").save(path, "WEBP", quality=80, method=6, exact=True)
        print(f"{name:8s} {w}x{h}  {os.path.getsize(path) // 1024} Ko")


if __name__ == "__main__":
    prepare(sys.argv[1], os.path.join(os.path.dirname(__file__), "..", "assets", "gravures"))
