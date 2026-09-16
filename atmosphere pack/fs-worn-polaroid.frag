// Name: FS Worn Polaroid
// Author: fragilesilver
// Version: 1
//
// Faded instant-film photograph aesthetic. Lifted blacks, desaturated
// midtones, orange/teal complementary color split, soft corner light
// leak bleed, and subtle paper fiber texture grain. Not a CRT, not a
// TV, a completely different analog medium.

#pragma parameter fade_amount  "Film Fade"              0.40 0.00 1.00 0.02
#pragma parameter color_split  "Orange/Teal Split"      0.30 0.00 0.80 0.02
#pragma parameter black_lift   "Lifted Blacks"          0.08 0.00 0.20 0.01
#pragma parameter light_leak   "Corner Light Leak"      0.18 0.00 0.50 0.02
#pragma parameter paper_grain  "Paper Fiber Grain"      0.05 0.00 0.15 0.01
#pragma parameter vignette     "Border Vignette"        0.25 0.00 0.60 0.02
#pragma parameter bright_boost "Brightness"             1.05 0.80 1.40 0.02

uniform float fade_amount;
uniform float color_split;
uniform float black_lift;
uniform float light_leak;
uniform float paper_grain;
uniform float vignette;
uniform float bright_boost;

float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

void main() {
    vec3 col = texture2D(u_tex, v_uv).rgb;
    float luma = dot(col, vec3(0.299, 0.587, 0.114));

    col = mix(col, vec3(luma), fade_amount * 0.6);

    vec3 shadow_tint = vec3(1.08, 0.92, 0.78);
    vec3 high_tint   = vec3(0.88, 1.02, 1.08);
    float blend = smoothstep(0.25, 0.75, luma);
    vec3 split_tint = mix(shadow_tint, high_tint, blend);
    col *= mix(vec3(1.0), split_tint, color_split);

    col = col * (1.0 - black_lift) + black_lift;

    col = col * col * (3.0 - 2.0 * col);

    if (light_leak > 0.0) {
        float leak_dist = length(v_uv - vec2(0.85, 0.9));
        float leak = exp(-leak_dist * 4.0) * light_leak;
        col += vec3(leak * 0.9, leak * 0.5, leak * 0.15);

        float leak2_dist = length(v_uv - vec2(0.1, 0.05));
        float leak2 = exp(-leak2_dist * 5.0) * light_leak * 0.4;
        col += vec3(leak2 * 0.6, leak2 * 0.7, leak2 * 0.3);
    }

    if (paper_grain > 0.0) {
        float grain = (hash(gl_FragCoord.xy * 0.7) - 0.5) * paper_grain;
        col += vec3(grain * 1.1, grain, grain * 0.85);
    }

    if (vignette > 0.0) {
        vec2 vpos = v_uv * (1.0 - v_uv.yx);
        float vig = vpos.x * vpos.y * 16.0;
        vig = clamp(pow(vig, vignette), 0.0, 1.0);
        col *= vig;
    }

    col *= bright_boost;
    gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
