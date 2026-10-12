---
title: Extra Shaders
nav_order: 5
---

# Extra Shaders

Original retro-hardware and print emulation shaders.

1. TOC
{:toc}

---

## FS PS1 Dither

`fs-ps1-dither.frag` · Original · [Download](https://raw.githubusercontent.com/fragilesilver/pickles-shaders/master/fs-ps1-dither.frag)
{: .shader-meta }

{% include compare.html slug="fs-ps1-dither" name="FS PS1 Dither" game="Spyro the Dragon (PS1)" %}

PlayStation 1 hardware rendering aesthetic featuring 15-bit color precision reduction, 4x4 Bayer matrix ordered dithering, horizontal composite blur, and faint line grid borders.

## FS E-Ink

`fs-eink.frag` · Original · [Download](https://raw.githubusercontent.com/fragilesilver/pickles-shaders/master/fs-eink.frag)
{: .shader-meta }

{% include compare.html slug="fs-eink" name="FS E-Ink" game="Phoenix Wright: Ace Attorney (GBA)" %}

Electronic paper display (EPD) simulation featuring selectable greyscale steps (1-bit to Carta 16), Bayer ordered dithering, paper tone warmth, ambient room light sheen, partial-refresh ghosting, and periodic screen inversion flashes.

## FS Risograph

`fs-risograph.frag` · Original · [Download](https://raw.githubusercontent.com/fragilesilver/pickles-shaders/master/fs-risograph.frag)
{: .shader-meta }

{% include compare.html slug="fs-risograph" name="FS Risograph" game="Mega Man 2 (NES)" %}

Two-color Risograph screen printing emulation featuring selectable dual spot-color duotones, rotatable halftone dot screening, mechanical plate misregistration, ink density pooling, and fibrous paper texture.
