// Name: FS PS1 Dither
// Author: fragilesilver
// Version: 1

#pragma parameter dither "Dither Strength" 1.00  0.00  2.00 0.05
#pragma parameter levels "Colour Levels"   31.00 7.00 63.00 1.00
#pragma parameter blur   "Composite Blur"  0.35  0.00  1.00 0.01
#pragma parameter grid   "Grid Strength"   0.35  0.00  1.00 0.01

uniform float dither;
uniform float levels;
uniform float blur;
uniform float grid;

const float EXTRA_SOFTNESS = 0.8;
const float COLOR_TEMP = 0.0;
const float SATURATION = 1.0;
const float BRIGHTNESS_BOOST = 1.0;
const float CONTRAST_BOOST   = 1.0;
const float GRID_LINE_THICKNESS = 0.12;
const float BORDER_FADE_RADIUS   = 0.02;
const float BORDER_FADE_SMOOTH   = 60.0;
const float BORDER_FADE_STRENGTH = 0.2;

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

vec3 sample_blur(highp vec2 uv, highp float scale) {
    highp float texel_x = 1.0 / native_res().x;
    vec3 c0 = sample_sharp_bilinear(uv - vec2(texel_x, 0.0), scale);
    vec3 c1 = sample_sharp_bilinear(uv, scale);
    vec3 c2 = sample_sharp_bilinear(uv + vec2(texel_x, 0.0), scale);
    vec3 blurred = c0 * 0.25 + c1 * 0.5 + c2 * 0.25;
    return mix(c1, blurred, blur);
}

float bayer(vec2 p) {
    p = mod(floor(p), 4.0);
    float a = mod(p.x, 2.0);
    float b = mod(floor(p.x * 0.5), 2.0);
    float c = mod(p.y, 2.0);
    float d = mod(floor(p.y * 0.5), 2.0);
    return (a + b * 2.0 + c * 4.0 + d * 8.0) / 16.0 - 0.5;
}

vec3 ps1_dither(vec3 col, highp vec2 texel_pos) {
    float th = bayer(floor(texel_pos)) * dither;
    return floor(col * levels + th + 0.5) / levels;
}

float grid_mask(highp vec2 texel_pos) {
    highp vec2 cell = fract(texel_pos);
    vec2 line = smoothstep(0.0, GRID_LINE_THICKNESS, cell) *
                smoothstep(0.0, GRID_LINE_THICKNESS, 1.0 - cell);

    return line.x * line.y;
}

float border_fade(vec2 coord) {
    coord = min(coord, vec2(1.0) - coord);
    vec2 cdist = vec2(BORDER_FADE_RADIUS);
    coord = cdist - min(coord, cdist);
    float dist = sqrt(dot(coord, coord));
    float c = clamp((cdist.x - dist) * BORDER_FADE_SMOOTH, 0.0, 1.0);
    return mix(1.0 - BORDER_FADE_STRENGTH, 1.0, c);
}

void main() {
    highp vec2 out_res = max(u_resolution, vec2(1.0));
    vec2 uv = v_uv;
    highp float sample_scale = max(raw_grid_scale() * EXTRA_SOFTNESS, 1.0);
    highp float mask_scale = grid_scale();
    highp vec2 texel_pos = (uv * out_res) / mask_scale;
    vec3 col = sample_blur(uv, sample_scale);
    col *= vec3(1.0 + COLOR_TEMP, 1.0, 1.0 - COLOR_TEMP);
    float l = dot(col, vec3(0.3, 0.6, 0.1));
    col = mix(vec3(l), col, SATURATION);
    col = ps1_dither(col, texel_pos);
    float g = grid_mask(texel_pos);
    col *= mix(1.0 - grid, 1.0, g);
    col *= BRIGHTNESS_BOOST;
    col = (col - 0.5) * CONTRAST_BOOST + 0.5;
    col = max(col, vec3(0.0)) * border_fade(uv);
    gl_FragColor = vec4(col, 1.0);
}
