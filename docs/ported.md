---
title: FS Ported Shaders
nav_order: 2
---

# FS Ported Shaders

Scaling, CRT and LCD shaders ported from other projects. See [Credits]({{ site.baseurl }}{% link credits.md %}) for original authors and licenses.

1. TOC
{:toc}

---

## FS Sharp Shimmerless

`fs-sharp-shimmerless.frag` · Port (zadpos) · [Download](https://raw.githubusercontent.com/fragilesilver/pickles-shaders/master/fs-sharp-shimmerless.frag)
{: .shader-meta }

{% include compare.html slug="fs-sharp-shimmerless" name="FS Sharp Shimmerless" game="Super Mario World (SNES)" %}

Pure area-weighted box-filter scaling. Eliminates scrolling shimmer with pristine pixel integrity.

## FS Sharp Shimmerless Grid

`fs-ssgrid.frag` · Port (zadpos) · [Download](https://raw.githubusercontent.com/fragilesilver/pickles-shaders/master/fs-ssgrid.frag)
{: .shader-meta }

{% include compare.html slug="fs-ssgrid" name="FS Sharp Shimmerless Grid" game="Pokémon Emerald (GBA)" %}

Area-weighted box filter scaling with configurable horizontal and vertical pixel grid lines, adjustable opacity, and simulated LCD motion blur.

## FS Fakelottes Geom Mini

`fs-fakelottes-geom-mini.frag` · Port (Rogalian) · [Download](https://raw.githubusercontent.com/fragilesilver/pickles-shaders/master/fs-fakelottes-geom-mini.frag)
{: .shader-meta }

{% include compare.html slug="fs-fakelottes-geom-mini" name="FS Fakelottes Geom Mini" game="Sonic the Hedgehog 2 (Genesis)" %}

Lightweight CRT simulation combining shadow mask patterns, tube curvature, and rounded border corners, with scanlines intentionally stripped to eliminate moiré on low-resolution displays.

## FS zfast CRT

`fs-zfast-crt.frag` · Port (SoltanGris42) · [Download](https://raw.githubusercontent.com/fragilesilver/pickles-shaders/master/fs-zfast-crt.frag)
{: .shader-meta }

{% include compare.html slug="fs-zfast-crt" name="FS zfast CRT" game="Super Metroid (SNES)" %}

High-performance CRT emulation using sharpened weighted-linear scaling, dynamic brightness-dependent scanlines, and a monochrome aperture mask.

## FS LCD3x

`fs-lcd3x.frag` · Port (Gigaherz) · [Download](https://raw.githubusercontent.com/fragilesilver/pickles-shaders/master/fs-lcd3x.frag)
{: .shader-meta }

{% include compare.html slug="fs-lcd3x" name="FS LCD3x" game="Metroid Fusion (GBA)" %}

Handheld LCD subpixel triad RGB mask simulation featuring luminance-adaptive scanlines and sharp bilinear scaling.
