// Name: FS Silent But Deadly
// Author: fragilesilver
// Version: 1
// Inspiration: Habbening

#pragma parameter interval     "Seconds Between Events"  18.0  4.0  60.0  1.0
#pragma parameter duration     "Event Length (s)"         6.0  1.0  15.0  0.5
#pragma parameter potency      "Potency"                  0.75 0.10  1.00 0.05
#pragma parameter creep_dir    "Creep: 0 Rnd/1 Btm/2 L/3 R/4 Top" 0.0 0.0 4.0 1.0
#pragma parameter warp_amt     "Air Distortion"           0.004 0.000 0.012 0.001
#pragma parameter green_tint   "Green Tint"               0.50 0.00  1.00 0.02
#pragma parameter bright_boost "Brightness"               1.00 0.80  1.30 0.02

uniform float interval;
uniform float duration;
uniform float potency;
uniform float creep_dir;
uniform float warp_amt;
uniform float green_tint;
uniform float bright_boost;

float hash(float n) {
    return fract(sin(n) * 43758.5453123);
}

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

float fbm2(vec2 p) {
    return (vnoise(p) * 0.65 + vnoise(p * 2.17 + 19.3) * 0.35);
}

void main() {
    float t = u_time / 60.0;

    float cycle = floor(t / interval);
    float phase = fract(t / interval) * interval;

    float seed       = hash(cycle * 37.13 + 5.7);
    float this_pot   = potency * (0.55 + seed * 0.45);
    float this_len   = duration * (0.7 + hash(cycle * 11.9) * 0.6);
    float start_lag  = hash(cycle * 23.3) * max(interval - this_len, 0.0);

    float local = (phase - start_lag) / max(this_len, 0.001);
    float env = smoothstep(0.0, 0.35, local) * (1.0 - smoothstep(0.45, 1.0, local));
    env *= step(0.0, local) * step(local, 1.0);

    float amount = env * this_pot;

    vec2 uv = v_uv;
    vec3 col;

    if (amount <= 0.001) {
        col = texture2D(u_tex, uv).rgb;
    } else {
        float dir = creep_dir < 0.5 ? floor(hash(cycle * 47.1) * 4.0) + 1.0 : creep_dir;

        float edge;
        if (dir < 1.5)      edge = 1.0 - v_uv.y;
        else if (dir < 2.5) edge = 1.0 - v_uv.x;
        else if (dir < 3.5) edge = v_uv.x;
        else                edge = v_uv.y;

        float front = smoothstep(amount * 1.6 - 0.45, amount * 1.6 + 0.35, edge);

        vec2 cp = vec2(v_uv.x * 3.2 + seed * 10.0, v_uv.y * 2.6 - t * 0.4);
        float cloud = fbm2(cp);
        float gas = clamp(cloud * front * 2.1 - 0.15, 0.0, 1.0) * amount;

        if (warp_amt > 0.0) {
            float gx = fbm2(cp + vec2(0.35, 0.0)) - cloud;
            float gy = fbm2(cp + vec2(0.0, 0.35)) - cloud;
            uv += vec2(gx, gy) * warp_amt * gas * 40.0;
            uv = clamp(uv, 0.0, 1.0);
        }

        col = texture2D(u_tex, uv).rgb;

        float luma = dot(col, vec3(0.299, 0.587, 0.114));
        col = mix(col, vec3(luma), 0.30 * gas);

        vec3 stink = vec3(0.58, 0.96, 0.34);
        col = mix(col, col * stink, green_tint * gas);
        col += stink * 0.07 * gas * green_tint;
    }

    col *= bright_boost;
    gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
