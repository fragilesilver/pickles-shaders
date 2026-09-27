// Name: FS Crop Dusting
// Author: fragilesilver
// Version: 1
// Inspiration: Habbening

#pragma parameter puff_rate    "Puff Frequency"      0.60  0.10  3.00  0.10
#pragma parameter puff_size    "Puff Size"           0.35  0.10  1.00  0.05
#pragma parameter drift_speed  "Drift Speed"         0.50  0.10  2.00  0.10
#pragma parameter drift_dir    "Drift Direction (deg)" 90.0 0.0 360.0 15.0
#pragma parameter warp_amt     "Puff Distortion"     0.005 0.000 0.020 0.001
#pragma parameter green_tint   "Green Tint"          0.55  0.00  1.00  0.02
#pragma parameter bright_boost "Brightness"          1.00  0.80  1.30  0.02

uniform float puff_rate;
uniform float puff_size;
uniform float drift_speed;
uniform float drift_dir;
uniform float warp_amt;
uniform float green_tint;
uniform float bright_boost;

float hash(float n) {
    return fract(sin(n) * 43758.5453123);
}

float puff(vec2 uv, float lane, float t, out vec2 dir) {
    float span  = 1.0 / max(puff_rate, 0.01);
    float cycle = floor(t / span + lane * 0.37);
    float life  = fract(t / span + lane * 0.37);

    float seed  = hash(cycle * 19.7 + lane * 71.3);
    float cross = hash(cycle * 43.1 + lane * 13.9);

    float ang = radians(drift_dir);
    vec2 fwd = vec2(sin(ang), -cos(ang));
    vec2 side = vec2(fwd.y, -fwd.x);

    vec2 start = vec2(0.5) - fwd * 0.75 + side * (cross - 0.5) * 1.1;
    vec2 centre = start + fwd * life * 1.5;

    float radius = puff_size * (0.45 + seed * 0.55) * (0.35 + life * 0.9);

    vec2 d = (uv - centre) / vec2(1.0, 0.85);
    float dist = length(d);

    dir = dist > 0.0001 ? d / dist : vec2(0.0);

    float body = 1.0 - smoothstep(0.0, radius, dist);
    float fade = smoothstep(0.0, 0.18, life) * (1.0 - smoothstep(0.55, 1.0, life));

    return body * fade;
}

void main() {
    float t = u_time / 60.0 * drift_speed;

    vec2 d0, d1, d2;
    float p0 = puff(v_uv, 0.0, t, d0);
    float p1 = puff(v_uv, 1.0, t, d1);
    float p2 = puff(v_uv, 2.0, t, d2);

    float gas = clamp(p0 + p1 + p2, 0.0, 1.0);
    vec2 push = d0 * p0 + d1 * p1 + d2 * p2;

    vec2 uv = clamp(v_uv + push * warp_amt, 0.0, 1.0);
    vec3 col = texture2D(u_tex, uv).rgb;

    float luma = dot(col, vec3(0.299, 0.587, 0.114));
    col = mix(col, vec3(luma), 0.25 * gas);

    vec3 stink = vec3(0.60, 0.97, 0.36);
    col = mix(col, col * stink, green_tint * gas);
    col += stink * 0.06 * gas * green_tint;

    col *= bright_boost;
    gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
