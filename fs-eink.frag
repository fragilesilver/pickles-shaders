// Name: FS E-Ink
// Author: fragilesilver
// Version: 1

#pragma parameter grey_levels "Greyscale Levels (2=1bit, 16=Carta)" 8.0  2.0  16.0 1.0
#pragma parameter tone_curve  "Image Contrast (pre-dither)"         1.55 0.60 3.00 0.05
#pragma parameter dither_amt  "Ordered Dither Strength"             0.85 0.00 1.50 0.05
#pragma parameter panel_range "Panel Contrast (reflectance range)"  0.62 0.00 1.00 0.02
#pragma parameter paper_tone  "Paper Warmth"                        0.45 0.00 1.00 0.05
#pragma parameter light_angle "Room Light Direction"                0.15 0.00 1.00 0.02
#pragma parameter sheen       "Reflective Sheen"                    0.38 0.00 1.00 0.02
#pragma parameter ghost       "Partial-Refresh Ghosting"            0.25 0.00 1.00 0.02
#pragma parameter pigment     "Pigment Grain"                       0.05 0.00 0.25 0.01
#pragma parameter flash_rate  "Refresh Flash Interval (s, 0=off)"   0.0  0.0  20.0 0.5

uniform float grey_levels;
uniform float tone_curve;
uniform float dither_amt;
uniform float panel_range;
uniform float paper_tone;
uniform float light_angle;
uniform float sheen;
uniform float ghost;
uniform float pigment;
uniform float flash_rate;

float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float bayer2(vec2 a) {
    a = floor(a);
    return fract(a.x * 0.5 + a.y * a.y * 0.75);
}

float bayer4(vec2 a) {
    return bayer2(a * 0.5) * 0.25 + bayer2(a);
}

void main() {
    float lum = dot(texture2D(u_tex, v_uv).rgb, vec3(0.299, 0.587, 0.114));

    lum = clamp((lum - 0.5) * tone_curve + 0.5, 0.0, 1.0);

    if (ghost > 0.0) {
        vec2 goff = vec2(2.5, -2.0) / u_resolution;
        float prev = dot(texture2D(u_tex, v_uv + goff).rgb, vec3(0.299, 0.587, 0.114));
        float residue = max(0.0, lum - prev);
        lum -= residue * ghost * 0.55;
    }

    if (flash_rate > 0.0) {
        float phase = mod(u_time, flash_rate);
        float flash = step(phase, 0.13) * (1.0 - step(phase, 0.04));
        lum = mix(lum, 1.0 - lum, flash);
    }

    float steps = max(grey_levels - 1.0, 1.0);
    float th = (bayer4(gl_FragCoord.xy) - 0.5) * (dither_amt / steps);
    float state = floor(clamp(lum + th, 0.0, 1.0) * steps + 0.5) / steps;

    float black_pt = mix(0.26, 0.06, panel_range);
    float white_pt = mix(0.62, 0.94, panel_range);
    lum = mix(black_pt, white_pt, state);

    if (pigment > 0.0) {
        lum += (hash(gl_FragCoord.xy * 1.3) - 0.5) * pigment * 0.35;
    }

    vec3 cold = vec3(0.97, 0.98, 1.00);
    vec3 warm = vec3(1.00, 0.96, 0.88);
    vec3 col = vec3(clamp(lum, 0.0, 1.0)) * mix(cold, warm, paper_tone);

    if (sheen > 0.0) {
        float a = light_angle * 6.28318;
        vec2 ldir = vec2(cos(a), sin(a));
        vec2 lpos = vec2(0.5) + ldir * 0.55;

        float d = distance(v_uv, lpos);
        float hot = exp(-d * d * 1.8);
        float wash = clamp(0.5 + dot(v_uv - vec2(0.5), ldir) * 0.9, 0.0, 1.0);
        float refl = (hot * 0.7 + wash * 0.3) * sheen;

        col += refl * 0.30;

        col += (hash(gl_FragCoord.xy * 1.7) - 0.5) * refl * 0.14;
    }

    gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
