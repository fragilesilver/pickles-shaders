// Name: FS Hotbox
// Author: fragilesilver
// Version: 1
// Inspiration: Habbening

#pragma parameter smoke_density "Smoke Density"      0.55 0.00 1.00 0.02
#pragma parameter smoke_speed   "Smoke Drift Speed"  0.35 0.05 1.50 0.05
#pragma parameter lamp_warmth   "Lamp Warmth"        0.40 0.00 1.00 0.02
#pragma parameter black_lift    "Lifted Blacks"      0.10 0.00 0.30 0.01
#pragma parameter contrast_loss "Contrast Loss"      0.25 0.00 0.60 0.02
#pragma parameter glow          "Hazy Glow"          0.25 0.00 0.60 0.02
#pragma parameter bright_boost  "Brightness"         1.00 0.80 1.30 0.02

uniform float smoke_density;
uniform float smoke_speed;
uniform float lamp_warmth;
uniform float black_lift;
uniform float contrast_loss;
uniform float glow;
uniform float bright_boost;

float hash2(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float vnoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash2(i);
    float b = hash2(i + vec2(1.0, 0.0));
    float c = hash2(i + vec2(0.0, 1.0));
    float d = hash2(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

void main() {
    float t = u_time / 60.0 * smoke_speed;

    float l1 = vnoise(vec2(v_uv.x * 2.1 + t * 0.30, v_uv.y * 1.7 - t * 0.18));
    float l2 = vnoise(vec2(v_uv.x * 3.4 - t * 0.21, v_uv.y * 2.9 + t * 0.26) + 31.7);
    float smoke = clamp(l1 * 0.6 + l2 * 0.4, 0.0, 1.0);

    float bank = mix(0.75, 1.25, smoothstep(0.0, 1.0, v_uv.y));
    float haze = clamp(smoke * bank * smoke_density * 1.6 - 0.12, 0.0, 1.0);

    vec3 col = texture2D(u_tex, v_uv).rgb;

    if (glow > 0.0) {
        vec2 b = vec2(0.0035) * (0.5 + haze);
        vec3 s  = texture2D(u_tex, v_uv + vec2( b.x,  b.y)).rgb;
        s      += texture2D(u_tex, v_uv + vec2(-b.x,  b.y)).rgb;
        s      += texture2D(u_tex, v_uv + vec2( b.x, -b.y)).rgb;
        s      += texture2D(u_tex, v_uv + vec2(-b.x, -b.y)).rgb;
        s *= 0.25;
        vec3 bright = max(s - vec3(0.45), vec3(0.0)) * 1.8;
        col += bright * glow * (0.35 + haze * 0.65);
    }

    if (contrast_loss > 0.0) {
        float luma = dot(col, vec3(0.299, 0.587, 0.114));
        col = mix(col, vec3(luma), contrast_loss * haze);
    }

    vec3 lamp = vec3(1.16, 0.96, 0.70);
    col *= mix(vec3(1.0), lamp, lamp_warmth * (0.35 + haze * 0.65));

    col += vec3(0.85, 0.80, 0.72) * black_lift * haze;

    col *= bright_boost;
    gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
