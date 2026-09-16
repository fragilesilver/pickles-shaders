// Name: FS DMG Authentic
// Author: fragilesilver
// Version: 1
//
// Authentic physical simulation of the original Game Boy
// passive-matrix STN reflective LCD display.

#pragma parameter dmg_mode       "Mode: 0 DMG / 1 Pocket / 2 Pass"  0.0  0.0  2.0  1.0
#pragma parameter grid_gap       "LCD Grid Gap Width"               0.14 0.00 0.35 0.01
#pragma parameter grid_dark      "LCD Grid Gap Darkness"            0.45 0.00 1.00 0.02
#pragma parameter shadow_str     "Backplane Shadow Depth"           0.35 0.00 0.80 0.02
#pragma parameter shadow_dist    "Backplane Shadow Offset"          0.40 0.00 1.50 0.05
#pragma parameter contrast_boost "Contrast / Gamma Curve"           1.15 0.50 2.50 0.05
#pragma parameter foil_grain     "Metallic Foil Grain"              0.04 0.00 0.20 0.01
#pragma parameter vignette_str   "Lens Corner Vignette"             0.20 0.00 0.60 0.02
#pragma parameter bright_boost   "Brightness Gain"                  1.10 0.80 2.00 0.05

uniform float dmg_mode;
uniform float grid_gap;
uniform float grid_dark;
uniform float shadow_str;
uniform float shadow_dist;
uniform float contrast_boost;
uniform float foil_grain;
uniform float vignette_str;
uniform float bright_boost;

vec2 native_res() {
    return max(u_native_resolution, vec2(1.0));
}


vec3 sample_sharp(vec2 uv) {
    vec2 res = native_res();
    vec2 texel = uv * res;
    vec2 s = fract(texel);
    vec2 center = s - 0.5;
    vec2 f = center * 4.0;
    f = clamp(f, -0.5, 0.5) + 0.5;
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
    luma = pow(clamp(luma, 0.0, 1.0), contrast_boost);

    vec2 shadow_offset = vec2(shadow_dist) / (res * 1.5);
    vec3 shadow_sample = sample_sharp(uv - shadow_offset);
    float shadow_luma = dot(shadow_sample, vec3(0.299, 0.587, 0.114));
    
    float cast_shadow = clamp((1.0 - shadow_luma) * (luma - 0.25), 0.0, 1.0) * shadow_str;

    vec2 cell_coord = fract(uv * res);
    vec2 dist_from_center = abs(cell_coord - 0.5) * 2.0;
    
    float half_gap = grid_gap * 0.5;
    vec2 grid_edge = smoothstep(1.0 - grid_gap, 1.0, dist_from_center);
    float in_gap = max(grid_edge.x, grid_edge.y);

    float corner_dist = length(max(dist_from_center - (1.0 - grid_gap * 1.5), 0.0));
    float corner_cut = smoothstep(0.0, grid_gap, corner_dist);
    in_gap = max(in_gap, corner_cut);

    vec3 col;
    if (dmg_mode < 0.5) {
        col = map_dmg_palette(luma);
        col *= (1.0 - cast_shadow);
    } else if (dmg_mode < 1.5) {
        col = map_pocket_palette(luma);
        col *= (1.0 - cast_shadow);
    } else {
        col = base_col * (1.0 - cast_shadow * 0.5);
    }

    col = mix(col, col * (1.0 - grid_dark), in_gap);

    if (foil_grain > 0.0) {
        float grain = (hash(gl_FragCoord.xy) - 0.5) * foil_grain;
        col += grain;
    }

    if (vignette_str > 0.0) {
        vec2 vpos = uv * (1.0 - uv.yx);
        float vig = vpos.x * vpos.y * 16.0;
        vig = clamp(pow(vig, vignette_str), 0.0, 1.0);
        col *= vig;
    }

    col *= bright_boost;
    gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
