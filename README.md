# 🥒 Pickles Shaders by fragilesilver

[![MustardOS Compatible](https://img.shields.io/badge/MustardOS-Andromeda%20%2F%20Pickles-5A6F23.svg)](https://muos.dev) [![Shaders](https://img.shields.io/badge/Shaders-9%20Total-purple.svg)](#shader-catalog)

A collection of Pickles shaders made specifically for [MustardOS (Andromeda)](https://muos.dev) on low-power handhelds.

## Overview

The collection is organized as such:

### 1. FS Ported Shaders
* **`fs-sharp-shimmerless.frag`**: Pure area-weighted box-filter scaling. Eliminates scrolling shimmer with pristine pixel integrity.

### 2. FS Atmosphere Pack                                                                                                                             
* **`fs-twilight.frag`**: Configurable dawn-to-dusk progression with warm amber sunset tones, top sky-bleed, and moonlit blue hour tints.
* **`fs-worn-polaroid.frag`**: Faded instant film aesthetic with lifted blacks, orange/teal complementary color split, corner light leak, and paper grain.
* **`fs-campfire.frag`**: Hypnotic warm ember glow with organic multi-frequency flickering and directional bottom light falloff.
* **`fs-rain-on-glass.frag`**: Rain-streaked window effect with droplet distortion, micro-refraction, and cool grey-blue grading.
* **`fs-dusty-attic.frag`**: Yellowed ABS plastic tint, low contrast, warm corner vignette, and drifting animated dust motes in a light shaft.
* **`fs-projector-film.frag`**: 8mm home movie simulation with mechanical gate weave jitter, scratch lines, tungsten lamp warmth, and grain.
* **`fs-neon-noir.frag`**: Cyberpunk aesthetic with crushed blacks, vibrant neon pink/cyan pops, chromatic fringing, and deep shadow blue tints.
* **`fs-sun-bleached.frag`**: Per-dye UV bleaching simulation (faded magenta/cyan, yellow shift) mimicking cartridges left on car dashboards or sunlit store windows.

### 3. FS DMG Pack
* **`fs-dmg-authentic.frag`**: Physical Game Boy DMG-01 STN reflective LCD simulation with subpixel grid gaps, depth backplane shadowing, metallic foil grain, and lens vignette. Includes selectable DMG, Pocket, and Pass-through modes.
* **`fs-dmg-ghost.frag`**: Passive-matrix motion smear and liquid crystal response decay (ghosting) layered over DMG/Pocket LCD grid lines and backplane shadowing.
* **`fs-dmg-pocket.frag`**: Dedicated 1996 Game Boy Pocket (MGB-001) FSTN panel simulation featuring true high-contrast silver-grey grading, tighter pixel grid spacing, and tunable foil warmth.

---

## Shader Catalog

| Shader Name (MustardOS) | File Name | Pack | Provenance | Notes |
|---|---|---|---|---|
| **FS Sharp Shimmerless** | `fs-sharp-shimmerless.frag` | Structure | Port (`zadpos`) | Clean box filter, no shimmering |
| **FS Twilight** | `fs-twilight.frag` | Atmosphere | Original | Golden hour to blue hour ambient shifts |
| **FS Worn Polaroid** | `fs-worn-polaroid.frag` | Atmosphere | Original | Instant film fade, chemical leak, & grain |
| **FS Campfire** | `fs-campfire.frag` | Atmosphere | Original | Dynamic warm ember firelight flicker |
| **FS Rain on Glass** | `fs-rain-on-glass.frag` | Atmosphere | Original | Rain streak refraction & overcast grade |
| **FS Dusty Attic** | `fs-dusty-attic.frag` | Atmosphere | Original | Yellowed plastic, dust motes & light beam |
| **FS Projector Film** | `fs-projector-film.frag` | Atmosphere | Original | 8mm vintage reel with gate weave & scratches |
| **FS Neon Noir** | `fs-neon-noir.frag` | Atmosphere | Original | Cyberpunk high-contrast rain & neon glow |
| **FS Sun Bleached** | `fs-sun-bleached.frag` | Atmosphere | Original | Multi-layer UV dye breakdown simulation |  
| **FS DMG Authentic** | `fs-dmg-authentic.frag` | DMG | Original | STN reflective LCD, backplane shadow, foil grain & vignette |
| **FS DMG Ghost** | `fs-dmg-ghost.frag` | DMG | Original | Physical passive-matrix LCD response decay & motion smear |
| **FS DMG Pocket** | `fs-dmg-pocket.frag` | DMG | Original | Game Boy Pocket FSTN panel with silver foil tint & crisp grid |

---

## Live Parameter Tuning

All shaders declare interactive `#pragma parameter` uniforms that can be tweaked in real-time directly from the MustardOS in-game quick menu:
  1. Open the Quick Menu while running your game.
  2. Navigate to **Settings** → **Visuals** → **Shaders** Enter to view the list.
  3. While highlighting the shader Press North Buton to adjust.
  4. Adjust values to your heart's desire.

────── 
## 📜 Credits & Licensing

• fs-sharp-shimmerless.frag: Ported from sharp-shimmerless by zadpos. Public Domain.
• Original Shaders: All other shaders are original works by fragilesilver, licensed under the MIT License.    
---
