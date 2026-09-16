// Name: FS Rain on Glass
// Author: fragilesilver
// Version: 1
//
// Viewing through a rain-streaked window. Droplet streak distortion lanes
// with micro-refraction. Light diffuses at the edges. Like pressing your
// face against a car window during a rainstorm.

#pragma parameter rain_dir       "Rain Direction (deg, 0=down)" 0.0 0.0 360.0 5.0
#pragma parameter streak_count   "Rain Streak Density"    12.0  4.0  30.0  1.0
#pragma parameter streak_str     "Streak Distortion"       0.004 0.000 0.015 0.001
#pragma parameter drip_speed     "Drip Speed"              0.80 0.10  3.00  0.10
#pragma parameter blur_amount    "Glass Blur"              0.003 0.000 0.010 0.001
#pragma parameter tint_strength  "Rainy Tint"              0.15  0.00  0.50  0.02
#pragma parameter droplet_bright "Droplet Highlight"       0.12  0.00  0.40  0.02
#pragma parameter bright_boost   "Brightness"              1.00  0.80  1.30  0.02

uniform float rain_dir;
uniform float streak_count;
uniform float streak_str;
uniform float drip_speed;
uniform float blur_amount;
uniform float tint_strength;
uniform float droplet_bright;
uniform float bright_boost;

float hash(float n) {
    return fract(sin(n) * 43758.5453123);
}

float hash2(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

void main() {
    vec2 uv = v_uv;
    float t = u_time / 60.0 * drip_speed;

    float ang = radians(rain_dir);
    vec2 fall = vec2(sin(ang), cos(ang));
    vec2 across = vec2(fall.y, -fall.x);

    float rx = dot(uv, across);
    float ry = dot(uv, fall);

    float streak_x = rx * streak_count;
    float lane = floor(streak_x);
    float lane_frac = fract(streak_x);

    float lane_phase = hash(lane * 13.7);
    float lane_speed = 0.7 + hash(lane * 7.3) * 0.6;
    float lane_width = 0.15 + hash(lane * 29.1) * 0.25;

    float streak_mask = smoothstep(0.5 - lane_width, 0.5, lane_frac)
                      * smoothstep(0.5 + lane_width, 0.5, lane_frac);

    float drip_y = fract(ry * 0.5 - t * lane_speed + lane_phase);
    float drip_taper = smoothstep(0.0, 0.3, drip_y) * smoothstep(1.0, 0.5, drip_y);

    float distort = streak_mask * drip_taper * streak_str;
    float side_offset = sin(ry * 40.0 - t * lane_speed * 5.0 + lane_phase * 6.28) * 0.3;
    uv += across * (distort * side_offset);
    uv += fall * (distort * 0.5);

    uv = clamp(uv, 0.0, 1.0);

    vec3 col;
    if (blur_amount > 0.0) {
        vec2 b = vec2(blur_amount);
        col  = texture2D(u_tex, uv).rgb * 0.4;
        col += texture2D(u_tex, uv + vec2( b.x, 0.0)).rgb * 0.15;
        col += texture2D(u_tex, uv + vec2(-b.x, 0.0)).rgb * 0.15;
        col += texture2D(u_tex, uv + vec2(0.0,  b.y)).rgb * 0.15;
        col += texture2D(u_tex, uv + vec2(0.0, -b.y)).rgb * 0.15;
    } else {
        col = texture2D(u_tex, uv).rgb;
    }

    float highlight = streak_mask * drip_taper * droplet_bright;
    col += highlight;

    if (tint_strength > 0.0) {
        float luma = dot(col, vec3(0.299, 0.587, 0.114));
        vec3 rainy = vec3(luma * 0.85, luma * 0.90, luma * 1.05);
        col = mix(col, rainy, tint_strength);
    }

    col *= bright_boost;
    gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
