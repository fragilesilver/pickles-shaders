// Name: FS Projector Film
// Author: fragilesilver
// Version: 1
//
// 8mm home movie projector aesthetic. Film gate weave,
// intermittent hair/scratch lines, warm tungsten lamp color shift,
// slight frame instability, and projector lamp hotspot.
// Like watching your childhood home movies.

#pragma parameter gate_weave    "Film Gate Weave"         0.0015 0.0000 0.0060 0.0005
#pragma parameter weave_speed   "Weave Speed"             1.00  0.20  3.00  0.10
#pragma parameter scratch_rate  "Scratch Frequency"       0.30  0.00  1.00  0.05
#pragma parameter scratch_width "Scratch Width"           0.003 0.001 0.010 0.001
#pragma parameter tungsten      "Tungsten Lamp Warmth"    0.35  0.00  0.80  0.02
#pragma parameter hotspot       "Lamp Hotspot"            0.20  0.00  0.50  0.02
#pragma parameter flicker       "Lamp Flicker"            0.04  0.00  0.15  0.01
#pragma parameter bright_boost  "Brightness"              1.05  0.80  1.40  0.02

uniform float gate_weave;
uniform float weave_speed;
uniform float scratch_rate;
uniform float scratch_width;
uniform float tungsten;
uniform float hotspot;
uniform float flicker;
uniform float bright_boost;

float hash(float n) {
    return fract(sin(n) * 43758.5453123);
}

float hash2(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

void main() {
    vec2 uv = v_uv;
    float t = u_time / 60.0;
    float frame = floor(u_time);

    float weave_x = sin(t * weave_speed * 7.3 + 1.2) * 0.6
                  + sin(t * weave_speed * 13.7 + 3.4) * 0.3
                  + sin(t * weave_speed * 29.1) * 0.1;
    float weave_y = sin(t * weave_speed * 5.1 + 2.0) * 0.5
                  + sin(t * weave_speed * 11.3 + 0.7) * 0.35
                  + sin(t * weave_speed * 23.7 + 4.5) * 0.15;
    uv.x += weave_x * gate_weave;
    uv.y += weave_y * gate_weave;
    uv = clamp(uv, 0.0, 1.0);

    vec3 col = texture2D(u_tex, uv).rgb;

    if (scratch_rate > 0.0) {
        float scratch_seed = floor(frame / 2.0);
        float scratch_x = hash(scratch_seed * 17.3);
        float scratch_appear = hash(scratch_seed * 31.7);

        if (scratch_appear < scratch_rate) {
            float dist = abs(v_uv.x - scratch_x);
            float scratch = smoothstep(scratch_width, 0.0, dist);
            col += scratch * vec3(0.35, 0.30, 0.20);
        }

        float scratch_x2 = hash(scratch_seed * 43.1 + 7.0);
        float scratch_appear2 = hash(scratch_seed * 53.3 + 3.0);
        if (scratch_appear2 < scratch_rate * 0.3) {
            float dist2 = abs(v_uv.x - scratch_x2);
            float scratch2 = smoothstep(scratch_width * 0.5, 0.0, dist2);
            col += scratch2 * vec3(0.20, 0.18, 0.12);
        }
    }

    vec3 tungsten_tint = vec3(1.10, 0.92, 0.72);
    col *= mix(vec3(1.0), tungsten_tint, tungsten);

    if (hotspot > 0.0) {
        float center_dist = length(v_uv - 0.5) * 1.4;
        float spot = 1.0 + hotspot * (1.0 - center_dist * center_dist);
        col *= spot;
    }

    if (flicker > 0.0) {
        float lamp = 1.0 + sin(t * 47.0) * 0.3 * flicker
                         + sin(t * 120.0 + 1.5) * 0.2 * flicker
                         + (hash(frame * 7.1) - 0.5) * flicker;
        col *= lamp;
    }

    float grain = (hash2(gl_FragCoord.xy + fract(t) * 100.0) - 0.5) * 0.04;
    col += grain;

    col *= bright_boost;
    gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
