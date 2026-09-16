// Name: FS DMG Pocket
// Author: fragilesilver
// Version: 1
//
// Authentic simulation of the 1996 Game Boy Pocket FSTN display.

#pragma parameter contrast       "Pocket Contrast"           1.25 0.50 2.50 0.05
#pragma parameter grid_gap       "LCD Grid Gap Width"        0.10 0.00 0.30 0.01
#pragma parameter grid_dark      "LCD Grid Gap Darkness"     0.35 0.00 1.00 0.02
#pragma parameter shadow_str     "Backplane Shadow Depth"    0.28 0.00 0.80 0.02
#pragma parameter shadow_dist    "Backplane Shadow Offset"   0.35 0.00 1.50 0.05
#pragma parameter silver_tint    "Silver Foil Warmth"        0.00 -0.20 0.20 0.01
#pragma parameter foil_grain     "Metallic Foil Grain"       0.03 0.00 0.20 0.01
#pragma parameter bright_boost   "Brightness Gain"           1.05 0.80 2.00 0.05

uniform float contrast;
uniform float grid_gap;
uniform float grid_dark;
uniform float shadow_str;
uniform float shadow_dist;
uniform float silver_tint;
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

vec3 map_pocket_palette(float luma) {
    vec3 mgb_off   = vec3(0.770 + silver_tint * 0.5, 0.785, 0.730 - silver_tint * 0.5);
    vec3 mgb_light = vec3(0.535, 0.550, 0.505);
    vec3 mgb_dark  = vec3(0.315, 0.325, 0.300);
    vec3 mgb_on    = vec3(0.120, 0.125, 0.115);

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
    luma = pow(clamp(luma, 0.0, 1.0), contrast);

    vec2 shadow_offset = vec2(shadow_dist) / (res * 1.7);
    vec3 shadow_sample = sample_sharp(uv - shadow_offset);
    float shadow_luma = dot(shadow_sample, vec3(0.299, 0.587, 0.114));
    float cast_shadow = clamp((1.0 - shadow_luma) * (luma - 0.20), 0.0, 1.0) * shadow_str;

    vec2 cell_coord = fract(uv * res);
    vec2 dist_from_center = abs(cell_coord - 0.5) * 2.0;
    vec2 grid_edge = smoothstep(1.0 - grid_gap, 1.0, dist_from_center);
    float in_gap = max(grid_edge.x, grid_edge.y);

    vec3 col = map_pocket_palette(luma);
    col *= (1.0 - cast_shadow);

    col = mix(col, col * (1.0 - grid_dark), in_gap);

    if (foil_grain > 0.0) {
        float grain = (hash(gl_FragCoord.xy) - 0.5) * foil_grain;
        col += grain;
    }

    col *= bright_boost;
    gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
