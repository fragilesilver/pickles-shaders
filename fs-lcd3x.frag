// Name: FS LCD3x
// Author: fragilesilver
// Ported from "lcd3x" by Gigaherz (classic RetroArch/libretro shader)
// Subpixel mask math shares lineage with "bagel-LCD-mini" by bgelmini/ClaudeAI
// Version: 1

#pragma parameter softness    "Softness"          1.00 0.00 3.00 0.05
#pragma parameter scan_dark   "Scanline (Dark)"   0.35 0.00 1.00 0.01
#pragma parameter scan_bright "Scanline (Bright)" 0.20 0.00 1.00 0.01
#pragma parameter mask_str    "Subpixel Mask"     0.65 0.00 1.00 0.01
#pragma parameter brightboost "Bright Boost"      1.30 1.00 2.00 0.01

uniform float softness;
uniform float scan_dark;
uniform float scan_bright;
uniform float mask_str;
uniform float brightboost;

vec2 native_res() {
    return max(u_native_resolution, vec2(1.0));
}

highp float raw_grid_scale() {
    highp vec2 res = native_res();
    highp vec2 out_res = max(u_resolution, vec2(1.0));
    highp vec2 raw_scale = out_res / res;
    return max(min(raw_scale.x, raw_scale.y), 1.0);
}

highp float grid_scale() {
    return max(floor(raw_grid_scale() + 0.5), 1.0);
}

vec3 sample_sharp_bilinear(highp vec2 uv, highp float scale) {
    highp vec2 res = native_res();
    highp vec2 texel = uv * res;
    highp vec2 s = fract(texel);
    highp vec2 region_range = vec2(0.5) - vec2(0.5) / scale;
    highp vec2 center_dist = s - vec2(0.5);
    highp vec2 f = (center_dist - clamp(center_dist, -region_range, region_range)) * scale + vec2(0.5);
    highp vec2 mod_texel = texel - fract(texel) + f;
    return texture2D(u_tex, mod_texel / res).rgb;
}

vec3 lcd_mask(highp vec2 frag_coord, highp float scale) {
    const float PI = 3.14159265;
    highp vec2 texel_pos = frag_coord / scale;
    highp float phase_x = fract(texel_pos.x) * 2.0 * PI;
    vec3 xoffsets = vec3(1.57079637, -0.52359885, -2.61799407);
    vec3 xphase = phase_x + xoffsets;
    vec3 xfactors = (4.0 + vec3(sin(xphase.x), sin(xphase.y), sin(xphase.z))) / 5.0;
    return mix(vec3(1.0), xfactors, mask_str);
}

void main() {
    const float PI = 3.14159265;
    highp vec2 out_res = max(u_resolution, vec2(1.0));
    highp float sample_scale = max(raw_grid_scale() * softness, 1.0);
    highp float mask_scale = grid_scale();
    vec2 uv = v_uv;
    vec3 col = sample_sharp_bilinear(uv, sample_scale);
    float luma = dot(col, vec3(0.299, 0.587, 0.114));
    float scan_strength = mix(scan_dark, scan_bright, luma);
    highp vec2 texel_pos = (uv * out_res) / mask_scale;
    float phase_y = fract(texel_pos.y) - 0.25;
    float scanline = sin(phase_y * 2.0 * PI);
    col *= scan_strength * scanline + (1.0 - scan_strength);
    col *= lcd_mask(gl_FragCoord.xy, mask_scale);
    col *= brightboost;
    gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
