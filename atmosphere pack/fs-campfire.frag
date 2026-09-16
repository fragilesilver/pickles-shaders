// Name: FS Campfire
// Author: fragilesilver
// Version: 1
//
// Warm ember glow with organic flickering light. Simulates playing a
// handheld near a campfire or candle, gentle, cozy, hypnotic warmth
// pulsation using u_time for natural flame rhythm.

#pragma parameter flicker_speed "Flicker Speed"          1.00 0.20 3.00 0.10
#pragma parameter flicker_depth "Flicker Depth"          0.08 0.00 0.25 0.01
#pragma parameter warmth        "Ember Warmth"           0.40 0.00 1.00 0.02
#pragma parameter glow_radius   "Glow Reach"             0.70 0.20 1.00 0.05
#pragma parameter ember_color   "Ember: 0 Orange / 1 Red / 2 White"  0.0  0.0  2.0  1.0
#pragma parameter bright_boost  "Brightness"             1.05 0.80 1.40 0.02

uniform float flicker_speed;
uniform float flicker_depth;
uniform float warmth;
uniform float glow_radius;
uniform float ember_color;
uniform float bright_boost;

float fire_flicker(float t) {
    float speed = t * flicker_speed;
    float f  = sin(speed * 3.7) * 0.35;
    f += sin(speed * 7.3 + 1.2) * 0.25;
    f += sin(speed * 13.1 + 2.8) * 0.15;
    f += sin(speed * 23.7 + 0.5) * 0.10;
    f += sin(speed * 41.3 + 4.1) * 0.08;
    f += max(sin(speed * 2.1 + 3.0) - 0.7, 0.0) * -0.5;
    return f;
}

void main() {
    vec3 col = texture2D(u_tex, v_uv).rgb;

    vec3 ember_tint;
    if (ember_color < 0.5) {
        ember_tint = vec3(1.15, 0.85, 0.55);
    } else if (ember_color < 1.5) {
        ember_tint = vec3(1.18, 0.75, 0.60);
    } else {
        ember_tint = vec3(1.10, 0.95, 0.80);
    }

    col *= mix(vec3(1.0), ember_tint, warmth);

    float t = u_time / 60.0;
    float flicker = fire_flicker(t) * flicker_depth;

    vec2 light_center = vec2(0.5, 1.2);
    float dist = length((v_uv - light_center) / vec2(1.0, 0.6));
    float falloff = 1.0 - smoothstep(0.0, glow_radius * 1.5, dist);

    col *= 1.0 + flicker * falloff;

    float luma = dot(col, vec3(0.299, 0.587, 0.114));
    float shadow_warmth = (1.0 - smoothstep(0.0, 0.4, luma)) * warmth * 0.15;
    col.r += shadow_warmth;
    col.g += shadow_warmth * 0.4;

    col *= bright_boost;
    gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
