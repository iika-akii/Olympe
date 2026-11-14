#!/usr/bin/env python3
"""Prépare les images des directions artistiques Doom et Raven (docs/DA_DOOM_RAVEN.md).

Les gravures de Gustave Doré sont tirées en noir sur papier blanc. Les deux directions ont un fond sombre :
on garde donc la **lumière** de la gravure, pas son encre. Chaque image sort en « trait clair » :
noir pur + transparence, où l'opacité suit la clarté de l'original. L'app la teinte à la couleur du texte
(tintColor) : les lumières deviennent claires, les ombres laissent voir le fond. L'image reste un positif,
contrairement à une gravure « encre seule » posée sur un fond sombre, qui passe en négatif.

Usage : python3 scripts/prepare-dore.py <dossier_des_originaux>
Originaux attendus : les fichiers listés dans JOBS (Wikimedia Commons, domaine public).
Dépend de Pillow et numpy.
"""
import os
import sys

import numpy as np
from PIL import Image

Image.MAX_IMAGE_PIXELS = None

# dossier de sortie, nom, original, cadrage (x0, y0, x1, y1 en fractions), proportion largeur / hauteur,
# éclat maximal (0..1 : plafonne les ciels blancs pour qu'ils n'éblouissent pas sur fond sombre).
JOBS = [
    # Doom : « L'Enfer » de Dante (1861).
    ("doom", "aujourdhui", "enfer-aujourdhui.jpg", (0.02, 0.02, 0.98, 0.75), 1440 / 880, 0.86),
    ("doom", "entrainement", "enfer-entrainement.jpg", (0.02, 0.02, 0.98, 0.80), 1440 / 880, 0.86),
    ("doom", "forger", "enfer-forger.jpg", (0.02, 0.02, 0.98, 0.80), 1440 / 880, 0.86),
    ("doom", "cuisine", "enfer-cuisine.jpg", (0.02, 0.25, 0.98, 0.80), 1440 / 880, 0.86),
    ("doom", "profil", "enfer-profil.jpg", (0.03, 0.22, 0.97, 0.82), 1440 / 880, 0.86),
    ("doom", "attente", "enfer-attente.jpg", (0.10, 0.18, 0.95, 0.83), 1.0, 0.86),
    # Raven : « Le Corbeau » d'Edgar Poe (1884).
    ("raven", "aujourdhui", "corbeau-aujourdhui.jpg", (0.0, 0.0, 1.0, 0.62), 1440 / 880, 0.86),
    ("raven", "entrainement", "corbeau-entrainement.jpg", (0.0, 0.0, 1.0, 0.62), 1440 / 880, 0.86),
    ("raven", "forger", "corbeau-forger.jpg", (0.0, 0.0, 1.0, 0.62), 1440 / 880, 0.86),
    ("raven", "cuisine", "corbeau-cuisine.jpg", (0.0, 0.0, 1.0, 0.62), 1440 / 880, 0.86),
    ("raven", "profil", "corbeau-profil.jpg", (0.0, 0.0, 1.0, 0.62), 1440 / 880, 0.86),
    ("raven", "attente", "corbeau-attente.jpg", (0.0, 0.1, 1.0, 0.8), 1.0, 0.86),
]
# Part basse fondue dans le fond, bords latéraux et haut adoucis.
FADE_BOTTOM, FADE_SIDES, FADE_TOP = 0.30, 0.05, 0.08


def crop(im: Image.Image, box, ratio: float) -> Image.Image:
    """Cadrage demandé, puis recentré à la proportion voulue."""
    w, h = im.size
    x0, y0, x1, y1 = int(box[0] * w), int(box[1] * h), int(box[2] * w), int(box[3] * h)
    cw, ch = x1 - x0, y1 - y0
    if cw / ch > ratio:
        nw = int(ch * ratio)
        x0 += (cw - nw) // 2
        x1 = x0 + nw
    else:
        nh = int(cw / ratio)
        y1 = y0 + nh
    return im.crop((x0, y0, x1, y1))


def light(im: Image.Image, ceiling: float) -> np.ndarray:
    """Clarté de la gravure (0..1), niveaux étirés, plafonnée."""
    lum = np.asarray(im.convert("L"), dtype=np.float32) / 255
    a, b = np.percentile(lum, 2), np.percentile(lum, 98)
    lum = np.clip((lum - a) / max(1e-6, b - a), 0, 1) ** 0.95
    return lum * ceiling


def fades(h: int, w: int, square: bool) -> np.ndarray:
    yy = np.linspace(0, 1, h)[:, None]
    xx = np.linspace(0, 1, w)[None, :]
    ramp = lambda v, e: np.clip(v / e, 0, 1) ** 1.5 if e > 0 else 1
    if square:  # écran d'attente : vignette ronde
        r = np.sqrt((xx - 0.5) ** 2 + (yy - 0.5) ** 2) / 0.5
        return np.clip((1 - r) / 0.35, 0, 1) ** 1.5
    return ramp(1 - yy, FADE_BOTTOM) * ramp(yy, FADE_TOP) * ramp(xx, FADE_SIDES) * ramp(1 - xx, FADE_SIDES)


def main(src: str) -> None:
    here = os.path.dirname(os.path.abspath(__file__))
    for folder, name, original, box, ratio, ceiling in JOBS:
        im = crop(Image.open(os.path.join(src, original)), box, ratio)
        out_w = min(1440, im.width)  # jamais agrandie : c'est ce qui pixelise
        im = im.resize((out_w, round(out_w / ratio)), Image.LANCZOS)
        alpha = light(im, ceiling) * fades(im.height, im.width, ratio == 1.0)
        rgba = np.zeros((im.height, im.width, 4), dtype=np.uint8)
        rgba[..., 3] = np.round(alpha * 255).astype(np.uint8)
        out = os.path.join(here, "..", "assets", folder, f"{name}.webp")
        os.makedirs(os.path.dirname(out), exist_ok=True)
        Image.fromarray(rgba, "RGBA").save(out, "WEBP", quality=82, method=6)
        print(f"{folder}/{name}.webp  {im.width}×{im.height}")


if __name__ == "__main__":
    main(sys.argv[1])
