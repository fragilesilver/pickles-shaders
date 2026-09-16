// Name: FS DMG Ghost
// Author: fragilesilver
// Version: 1
//
// Authentic Game Boy DMG-01 STN LCD simulation with physical passive-matrix
// motion smear / liquid crystal decay (ghosting).

#pragma parameter dmg_mode       "Mode: 0 DMG / 1 Pocket / 2 Pass"  0.0  0.0  2.0  1.0
#pragma parameter ghost_amount   "Ghosting / Smear Trail"           0.42 0.00 0.85 0.02
#pragma parameter ghost_decay    "Liquid Crystal Decay"             0.65 0.20 0.95 0.02
#pragma parameter grid_gap       "LCD Grid Gap Width"               0.14 0.00 0.35 0.01
#pragma parameter grid_dark      "LCD Grid Gap Darkness"            0.45 0.00 1.00 0.02
#pragma parameter shadow_str     "Backplane Shadow Depth"           0.30 0.00 0.80 0.02
#pragma parameter foil_grain     "Metallic Foil Grain"              0.03 0.00 0.20 0.01
#pragma parameter bright_boost   "Brightness Gain"                  1.15 0.80 2.00 0.05

uniform float dmg_mode;
uniform float ghost_amount;
uniform float ghost_decay;
uniform float grid_gap;
uniform float grid_dark;
uniform float shadow_str;
uniform float foil_grain;
uniform float bright_boost;

vec2 native_res() {
    return max(u_native_resolution, vec2(1.0));
}

vec3 sample_sharp(vec2 uv) {
    vec2 res = native_res();
    vec2 texel = uv * res;
    vec2 s = fract(texel);
    vec2 center = s - 0.5;
    vec2 f = clamp(center * 4.0, -0.5, 0.5) + 0.5;
    vec2 mod_texel = floor(texel) + f;
    return texture2D(u_tex, mod_texel / res).rgb;
}

float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

vec3 map_dmg_palette(float luma) {
    const vec3 dmg_off   = vec3(0.545, 0.600, 0.408);
    const vec3 dmg_light = vec3(0.420, 0.490, 0.320);
    const vec3 dmg_dark  = vec3(0.247, 0.318, 0.196);
    const vec3 dmg_on    = vec3(0.125, 0.180, 0.106);

    if (luma > 0.75) return dmg_off;
    if (luma > 0.50) return dmg_light;
    if (luma > 0.25) return dmg_dark;
    return dmg_on;
}

vec3 map_pocket_palette(float luma) {
    const vec3 mgb_off   = vec3(0.760, 0.776, 0.710);
    const vec3 mgb_light = vec3(0.533, 0.553, 0.494);
    const vec3 mgb_dark  = vec3(0.318, 0.337, 0.298);
    const vec3 mgb_on    = vec3(0.125, 0.133, 0.122);

    if (luma > 0.75) return mgb_off;
    if (luma > 0.50) return mgb_light;
    if (luma > 0.25) return mgb_dark;
    return mgb_on;
}

void main() {
    vec2 res = native_res();
    vec2 uv = v_uv;

    vec3 base_col = sample_sharp(uv);
    float luma = dot(base_col, vec3(0.299, 0.587, 0.114));

    float ghost = 0.0;
    if (ghost_amount > 0.01) {
        vec2 smear_step = 1.0 / res;
        
        float tap1 = dot(texture2D(u_tex, uv - smear_step * vec2(1.0, 0.0)).rgb, vec3(0.299, 0.587, 0.114));
        float tap2 = dot(texture2D(u_tex, uv - smear_step * vec2(0.0, 1.0)).rgb, vec3(0.299, 0.587, 0.114));
        float tap3 = dot(texture2D(u_tex, uv - smear_step * vec2(1.5, 0.5)).rgb, vec3(0.299, 0.587, 0.114));

        float dark_inertia = (1.0 - tap1) * 0.5 + (1.0 - tap2) * 0.3 + (1.0 - tap3) * 0.2;
        ghost = clamp(dark_inertia * ghost_amount * (1.0 - ghost_decay), 0.0, 0.6);
        
        luma = clamp(luma - ghost, 0.0, 1.0);
    }

    vec2 shadow_offset = vec2(0.35) / (res * 1.5);
    vec3 shadow_sample = sample_sharp(uv - shadow_offset);
    float shadow_luma = dot(shadow_sample, vec3(0.299, 0.587, 0.114));
    float cast_shadow = clamp((1.0 - shadow_luma) * (luma - 0.25), 0.0, 1.0) * shadow_str;

    vec2 cell_coord = fract(uv * res);
    vec2 dist_from_center = abs(cell_coord - 0.5) * 2.0;
    vec2 grid_edge = smoothstep(1.0 - grid_gap, 1.0, dist_from_center);
    float in_gap = max(grid_edge.x, grid_edge.y);

    vec3 col;
    if (dmg_mode < 0.5) {
        col = map_dmg_palette(luma) * (1.0 - cast_shadow);
    } else if (dmg_mode < 1.5) {
        col = map_pocket_palette(luma) * (1.0 - cast_shadow);
    } else {
        col = base_col * (1.0 - cast_shadow * 0.5);
    }

    col = mix(col, col * (1.0 - grid_dark), in_gap);

    if (foil_grain > 0.0) {
        col += (hash(gl_FragCoord.xy) - 0.5) * foil_grain;
    }

    col *= bright_boost;
    gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
