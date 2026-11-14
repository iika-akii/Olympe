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

# nom, traitement, cadrage (x0, y0, x1, y1 en fractions), largeur de sortie, part basse fondue,
# seuil d'ombre à partir duquel la première taille apparaît (peintures seulement : plus haut = fond plus blanc),
# pas des tailles en pixels pour 1440 px de large (peintures seulement : plus petit = plus de détail, pour les vues d'ensemble).
# La hauteur suit le cadrage. Une gravure n'est jamais agrandie au-delà de sa définition d'origine : c'est ce qui pixelise.
JOBS = [
    ("adam", "graver", (0.0, 0.03, 1.0, 1.0), 1440, 0.20, 0.26, 6.0),  # la fresque entière : Adam et Dieu
    ("ange", "graver", (0.13, 0.12, 0.66, 0.60), 1440, 0.20, 0.18, 8.0),
    ("hercule", "encre", (0.12, 0.09, 0.88, 0.42), 1440, 0.24, 0, 0),
    ("forge", "encre", (0.14, 0.05, 0.86, 0.63), 1440, 0.24, 0, 0),
    ("bacchus", "encre", (0.03, 0.03, 0.97, 0.64), 1440, 0.16, 0, 0),  # le médaillon presque entier
    ("phaeton", "encre", (0.035, 0.0, 0.99, 0.975), 900, 0.0, 0, 0),
    ("mains", "graver", (0.325, 0.345, 0.455, 0.63), 1024, 0.0, 0.30, 12.0),
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


def graver(im: Image.Image, size, start: float, pitch: float) -> np.ndarray:
    """Peinture → tailles croisées. Les lignes s'épaississent dans l'ombre et s'infléchissent avec le modelé.

    Le modelé est largement adouci avant de tracer : une taille s'effile au lieu de s'arrêter net,
    ce qui évite l'effet d'escalier (« pixelisé ») sur un écran de téléphone.
    """
    ss = 3
    w, h = size[0] * ss, size[1] * ss
    unit = size[0] / 1440  # les mesures ci-dessous sont données pour une sortie de 1440 px de large
    grey = im.convert("L").resize((w, h), Image.LANCZOS)
    lum = levels(np.asarray(grey.filter(ImageFilter.GaussianBlur(0.32 * pitch * unit * ss)), dtype=np.float32) / 255, 1, 99) ** 0.72
    form = np.asarray(grey.filter(ImageFilter.GaussianBlur(2.2 * pitch * unit * ss)), dtype=np.float32) / 255
    dark = 1 - lum
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)

    def hatch(angle, period, bend, begin, width, gamma):
        t = np.deg2rad(angle)
        phase = (xx * np.cos(t) + yy * np.sin(t)) / (period * unit * ss) + bend * form
        dist = np.abs((phase % 1) - 0.5) * 2
        thick = np.clip((dark - begin) / (1 - begin), 0, 1) ** gamma * width
        # Bord adouci sur un demi-pas : le trait reste net sans crénelage. Sous le seuil d'ombre, le papier reste nu.
        return np.clip((thick - dist) / 0.22 + 0.5, 0, 1) * np.clip(thick / 0.10, 0, 1)

    ink = np.maximum.reduce([
        hatch(32, pitch, 4.0, start, 0.90, 0.9),          # première taille : tout sauf les lumières
        hatch(-38, pitch * 1.05, -3.0, 0.50, 0.78, 1.0),  # contre-taille : les ombres
        hatch(84, pitch * 1.1, 2.5, 0.76, 0.66, 1.0),     # troisième taille : les noirs
    ])
    # Contours : le trait de burin qui cerne les formes.
    sharp = levels(np.asarray(grey.filter(ImageFilter.GaussianBlur(0.16 * pitch * unit * ss)), dtype=np.float32) / 255, 1, 99)
    gy, gx = np.gradient(sharp)
    edge = np.clip((np.hypot(gx, gy) * ss / unit - 0.034) / 0.05, 0, 1)
    edge = np.asarray(Image.fromarray((edge * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.9 * ss)), dtype=np.float32) / 255
    ink = np.maximum(ink, np.clip(edge * 1.5, 0, 1) * 0.95)
    out = Image.fromarray((ink * 255).astype(np.uint8)).resize(size, Image.LANCZOS)
    return np.asarray(out, dtype=np.float32) / 255


def prepare(src_dir: str, out_dir: str) -> None:
    os.makedirs(out_dir, exist_ok=True)
    sources = {"mains": "adam"}
    for name, mode, box, width, fade, start, pitch in JOBS:
        im = crop(Image.open(os.path.join(src_dir, f"{sources.get(name, name)}.jpg")).convert("RGB"), box)
        if mode == "encre":
            width = min(width, im.size[0])  # jamais d'agrandissement d'une gravure
        size = (width, round(width * im.size[1] / im.size[0]))
        ink = encre(im, size) if mode == "encre" else graver(im, size, start, pitch)
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
