// Name: FS zfast CRT
// Author: fragilesilver
// Ported from "zfast_crt_standard" by Greg Hogan (SoltanGris42), 2017 (GPLv2+)
// A simple, fast CRT: sharpened weighted-linear scaling (Inigo Quilez),
// brightness-dependent scanlines, and a monochrome aperture mask.
// Version: 1

#pragma parameter blurx       "Horizontal Blur"   0.30 0.00 1.00  0.05
#pragma parameter scan_dark   "Scanline (Dark)"   6.00 0.00 10.00 0.50
#pragma parameter scan_bright "Scanline (Bright)" 8.00 0.00 50.00 1.00
#pragma parameter brightboost "Bright Boost"      1.25 0.50 2.00  0.05
#pragma parameter mask_dark   "Mask Strength"     0.25 0.00 1.00  0.05
#pragma parameter mask_fade   "Mask/Scan Fade"    0.80 0.00 1.00  0.05

uniform float blurx;
uniform float scan_dark;
uniform float scan_bright;
uniform float brightboost;
uniform float mask_dark;
uniform float mask_fade;

vec2 native_res() {
    return max(u_native_resolution, vec2(1.0));
}

void main() {
    highp vec2 TextureSize = native_res();
    highp vec2 OutputSize  = max(u_resolution, vec2(1.0));
    highp vec2 invDims     = 1.0 / TextureSize;
    highp float ratio      = 1.0;
    highp float maskFade   = 0.3333 * mask_fade;

    highp vec2 vTexCoord = v_uv * 1.0001;

    highp vec2 p = vTexCoord * TextureSize;
    highp vec2 i = floor(p) + 0.50;
    highp vec2 f = p - i;
    p = (i + 4.0 * f * f * f) * invDims;
    p.x = mix(p.x, vTexCoord.x, blurx);

    float Y  = f.y * f.y;
    float YY = Y * Y;

    float whichmask = floor(vTexCoord.x * OutputSize.x * ratio) * -0.5;
    float mask = 1.0 + float(fract(whichmask) < 0.5) * -mask_dark;

    vec3 colour = texture2D(u_tex, p).rgb;

    float scanLineWeight  = brightboost - scan_dark * (Y - 2.05 * YY);
    float scanLineWeightB = 1.0 - scan_bright * (YY - 2.8 * YY * Y);

    colour *= mix(scanLineWeight * mask,
                  scanLineWeightB,
                  dot(colour, vec3(maskFade)));

    gl_FragColor = vec4(colour, 1.0);
}
