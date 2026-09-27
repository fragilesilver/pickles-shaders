// Name: FS Purple Haze
// Author: fragilesilver
// Version: 1
// Inspiration: Habbening

#pragma parameter hue_speed    "Hue Cycle Speed"          0.15  0.00  1.00  0.01
#pragma parameter hue_spread   "Hue Spread Across Screen" 0.20  0.00  1.00  0.02
#pragma parameter purple_grade "Purple Grade"             0.35  0.00  1.00  0.02
#pragma parameter wave_amt     "Wave Warp"                0.004 0.000 0.015 0.001
#pragma parameter wave_speed   "Wave Speed"               0.60  0.10  2.00  0.10
#pragma parameter sat_boost    "Saturation"               0.30  -0.30 1.00  0.05
#pragma parameter bright_boost "Brightness"               1.00  0.80  1.30  0.02

uniform float hue_speed;
uniform float hue_spread;
uniform float purple_grade;
uniform float wave_amt;
uniform float wave_speed;
uniform float sat_boost;
uniform float bright_boost;

vec3 hue_rotate(vec3 c, float a) {
    const vec3 k = vec3(0.57735027);
    float co = cos(a);
    return c * co + cross(k, c) * sin(a) + k * dot(k, c) * (1.0 - co);
}

void main() {
    float t = u_time / 60.0;

    vec2 uv = v_uv;
    if (wave_amt > 0.0) {
        float w = t * wave_speed;
        uv.x += sin(v_uv.y * 9.0 + w * 2.1) * wave_amt;
        uv.y += cos(v_uv.x * 7.0 - w * 1.7) * wave_amt * 0.8;
        uv = clamp(uv, 0.0, 1.0);
    }

    vec3 col = texture2D(u_tex, uv).rgb;

    float phase = t * hue_speed * 6.2831
                + (v_uv.x + v_uv.y) * hue_spread * 6.2831;
    col = hue_rotate(col, phase);

    if (sat_boost != 0.0) {
        float luma = dot(col, vec3(0.299, 0.587, 0.114));
        col = mix(vec3(luma), col, 1.0 + sat_boost);
    }

    if (purple_grade > 0.0) {
        float luma = dot(col, vec3(0.299, 0.587, 0.114));
        vec3 haze = vec3(0.62, 0.34, 0.92);
        float shade = 1.0 - smoothstep(0.0, 0.75, luma);
        col = mix(col, col * haze * 1.35, purple_grade * (0.35 + shade * 0.65));
    }

    col *= bright_boost;
    gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
