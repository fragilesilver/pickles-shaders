// Name: FS Stoner Vision
// Author: fragilesilver
// Version: 1
// Inspiration: Habbening

#pragma parameter redeye        "Bloodshot Vignette"  0.35   0.00  0.80  0.02
#pragma parameter bloom         "Dreamy Bloom"        0.35   0.00  1.00  0.05
#pragma parameter soften        "Soft Focus"          0.30   0.00  1.00  0.05
#pragma parameter breathe       "Breathing Zoom"      0.006  0.000 0.020 0.001
#pragma parameter breathe_speed "Breathing Speed"     0.25   0.05  1.00  0.05
#pragma parameter chroma_drift  "Chromatic Drift"     0.0020 0.0000 0.0080 0.0005
#pragma parameter sat_boost     "Saturation"          0.25   -0.30 0.80  0.05
#pragma parameter bright_boost  "Brightness"          1.00   0.80  1.30  0.02

uniform float redeye;
uniform float bloom;
uniform float soften;
uniform float breathe;
uniform float breathe_speed;
uniform float chroma_drift;
uniform float sat_boost;
uniform float bright_boost;

void main() {
    float t = u_time / 60.0;

    float pulse = sin(t * breathe_speed * 6.2831) * 0.5 + 0.5;
    float zoom = 1.0 - breathe * pulse;
    vec2 uv = clamp((v_uv - 0.5) * zoom + 0.5, 0.0, 1.0);

    vec3 col;
    if (chroma_drift > 0.0) {
        float ang = t * 0.23;
        vec2 off = vec2(cos(ang), sin(ang)) * chroma_drift;
        col.r = texture2D(u_tex, clamp(uv + off, 0.0, 1.0)).r;
        col.g = texture2D(u_tex, uv).g;
        col.b = texture2D(u_tex, clamp(uv - off, 0.0, 1.0)).b;
    } else {
        col = texture2D(u_tex, uv).rgb;
    }

    if (soften > 0.0 || bloom > 0.0) {
        vec2 b = vec2(0.0030);
        vec3 s  = texture2D(u_tex, clamp(uv + vec2( b.x, 0.0), 0.0, 1.0)).rgb;
        s      += texture2D(u_tex, clamp(uv + vec2(-b.x, 0.0), 0.0, 1.0)).rgb;
        s      += texture2D(u_tex, clamp(uv + vec2(0.0,  b.y), 0.0, 1.0)).rgb;
        s      += texture2D(u_tex, clamp(uv + vec2(0.0, -b.y), 0.0, 1.0)).rgb;
        s *= 0.25;

        col = mix(col, s, soften * 0.65);
        col += max(s - vec3(0.50), vec3(0.0)) * bloom * 1.6;
    }

    if (sat_boost != 0.0) {
        float luma = dot(col, vec3(0.299, 0.587, 0.114));
        col = mix(vec3(luma), col, 1.0 + sat_boost);
    }

    if (redeye > 0.0) {
        float d = length((v_uv - 0.5) * vec2(1.0, 0.85));
        float rim = smoothstep(0.25, 0.72, d);
        col.r += rim * redeye * 0.28;
        col.g *= 1.0 - rim * redeye * 0.22;
        col.b *= 1.0 - rim * redeye * 0.26;
    }

    col *= bright_boost;
    gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
