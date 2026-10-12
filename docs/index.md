---
title: Home
layout: home
nav_order: 1
---

# 🥒 Pickles Shaders
{: .fs-9 }

25 Pickles shaders made for [MustardOS (Andromeda)](https://muos.dev) on low-power handhelds — CRT and LCD ports, moody atmospheres, Game Boy panels, print effects and some very silly gas.
{: .fs-6 .fw-300 }

[Browse the shaders](#packs){: .btn .btn-primary .fs-5 .mb-4 .mb-md-0 .mr-2 }
[View on GitHub](https://github.com/fragilesilver/pickles-shaders){: .btn .fs-5 .mb-4 .mb-md-0 }

---

Every shader has a before/after slider: drag it (or focus it and use the arrow keys) to compare the raw game on the left with the shader on the right. Screenshots are 640×480.

## Packs

| Pack | Shaders | What's inside |
|---|---|---|
| [FS Ported Shaders]({{ site.baseurl }}{% link ported.md %}) | 5 | Sharp scaling, CRT and LCD-grid ports |
| [FS Atmosphere Pack]({{ site.baseurl }}{% link atmosphere.md %}) | 8 | Film, weather and lighting moods |
| [FS DMG Pack]({{ site.baseurl }}{% link dmg.md %}) | 3 | Game Boy DMG-01 and Pocket LCD panels |
| [Extra Shaders]({{ site.baseurl }}{% link extra.md %}) | 3 | PS1 dither, E-Ink and Risograph |
| [FS Farts & Weeds Pack]({{ site.baseurl }}{% link farts-and-weeds.md %}) | 6 | Smoke, haze and gas clouds |

## Install

1. Download the `.frag` files you want (each shader has a download link), or clone the whole repo.
2. Copy them into the MustardOS shader folder `MUOS/save/pickles/shader/{custom folder name}` on your SD card.
3. Pick the shader in MustardOS.

## Live parameter tuning

All shaders declare `#pragma parameter` uniforms you can tweak in real time from the MustardOS quick menu:

1. Open the Quick Menu while running your game.
2. Go to **Settings** → **Visuals** → **Shaders** → **{custom folder name}**, and press Enter to view the list.
3. With the shader highlighted, press the North button to adjust.
4. Change the values until it looks right.
