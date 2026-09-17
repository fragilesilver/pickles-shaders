// Name: FS Sharp Shimmerless Grid
// Author: fragilesilver
// Ported from "sharp-shimmerless-grid" by zadpos (public domain)
// "LCD Ghosting" is a FAKE static approximation: muOS shaders get no frame
// history, so real response-time trailing is impossible. This is a short
// leftward horizontal smear that reads as LCD blur on scrolling content.
// Version: 1

#pragma parameter grid_thick_v "Grid Thickness (Vertical)"   0.30 0.00 1.00 0.01
#pragma parameter grid_thick_h "Grid Thickness (Horizontal)" 0.30 0.00 1.00 0.01
#pragma parameter grid_op_v    "Grid Opacity (Vertical)"     0.30 0.00 1.00 0.01
#pragma parameter grid_op_h    "Grid Opacity (Horizontal)"   0.30 0.00 1.00 0.01
#pragma parameter ghosting     "LCD Ghosting (Fake)"         0.00 0.00 1.00 0.05

uniform float grid_thick_v;
uniform float grid_thick_h;
uniform float grid_op_v;
uniform float grid_op_h;
uniform float ghosting;

vec2 native_res() {
    return max(u_native_resolution, vec2(1.0));
}

// Short leftward horizontal smear. Not motion-aware; a stand-in for the slow
// pixel decay of a cheap LCD, visible mainly when the picture scrolls.
vec3 fake_ghost(highp vec2 uv, highp float sx) {
    return texture2D(u_tex, uv + vec2(-3.0 * sx, 0.0)).rgb * 0.10 +
           texture2D(u_tex, uv + vec2(-2.0 * sx, 0.0)).rgb * 0.20 +
           texture2D(u_tex, uv + vec2(-1.0 * sx, 0.0)).rgb * 0.30 +
           texture2D(u_tex, uv).rgb                        * 0.25 +
           texture2D(u_tex, uv + vec2( 1.0 * sx, 0.0)).rgb * 0.15;
}

void main() {
    highp vec2 native   = native_res();
    highp vec2 out_res   = max(u_resolution, vec2(1.0));
    highp vec2 pixel     = v_uv * out_res;                 // output-pixel coords
    highp vec2 invscale  = native / out_res;               // input px per output px

    highp vec2 pixel_tl = invscale * floor(pixel);
    highp vec2 pixel_br = invscale * ceil(pixel);
    highp vec2 texel_tl = floor(pixel_tl);
    highp vec2 texel_br = floor(pixel_br);

    // 1.0 == no grid/scanline; parameters cut into that
    vec2 grid_ratio = vec2(1.0 - grid_thick_v, 1.0 - grid_thick_h);
    vec2 grid_alpha = vec2(1.0 - grid_op_v,    1.0 - grid_op_h);

    vec2 area_tl = mix(
        grid_ratio - fract(pixel_tl) + grid_alpha * (1.0 - grid_ratio),
        grid_alpha * (1.0 - grid_ratio),
        step(grid_ratio, fract(pixel_tl)));
    vec2 area_br = mix(
        fract(pixel_br),
        grid_ratio + grid_alpha * (fract(pixel_br) - grid_ratio),
        step(grid_ratio, fract(pixel_br)));

    vec2 interp_ratio = area_br / (area_tl + area_br);
    interp_ratio = mix(interp_ratio, vec2(1.0), step(texel_br, texel_tl));

    vec2 scanline_factor = (fract(pixel_br) + clamp(grid_ratio - fract(pixel_tl), 0.0, 1.0)) / invscale;
    scanline_factor = mix(scanline_factor, grid_ratio / invscale, step(grid_ratio, fract(pixel_br)));
    scanline_factor = mix(scanline_factor, clamp((grid_ratio - fract(pixel_tl)) / invscale, 0.0, 1.0), step(texel_br, texel_tl));
    scanline_factor = grid_alpha + (1.0 - grid_alpha) * scanline_factor;
    float factor = scanline_factor.x * scanline_factor.y;

    highp vec2 mod_texel = texel_br - vec2(0.5) + interp_ratio;
    vec3 col = factor * texture2D(u_tex, mod_texel / native).rgb;

    // Baked to const 0.0 in the .spv build -> this branch is compiled out.
    if (ghosting > 0.0) {
        vec3 ghost = fake_ghost(v_uv, 1.0 / native.x);
        col = mix(col, ghost, clamp(ghosting, 0.0, 1.0) * 0.8);
    }

    gl_FragColor = vec4(col, 1.0);
}
