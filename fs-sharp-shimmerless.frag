// Name: FS Sharp Shimmerless
// Author: fragilesilver
// Ported from "sharp-shimmerless" by zadpos (public domain)
// Version: 1

vec2 native_res() {
    return max(u_native_resolution, vec2(1.0));
}

void main() {
    highp vec2 native   = native_res();
    highp vec2 out_res  = max(u_resolution, vec2(1.0));
    highp vec2 pixel    = v_uv * out_res;      // output-pixel coords
    highp vec2 scale    = out_res / native;    // output px per input px
    highp vec2 invscale = native / out_res;    // input px per output px

    highp vec2 pixel_tl = floor(pixel);
    highp vec2 pixel_br = ceil(pixel);
    highp vec2 texel_tl = floor(invscale * pixel_tl);
    highp vec2 texel_br = floor(invscale * pixel_br);

    // Sampling point for the correct box-filtered value.
    highp vec2 mod_texel = texel_br + vec2(0.5);
    mod_texel -= (vec2(1.0) - step(texel_br, texel_tl)) * (scale * texel_br - pixel_tl);

    vec3 col = texture2D(u_tex, mod_texel / native).rgb;

    gl_FragColor = vec4(col, 1.0);
}
