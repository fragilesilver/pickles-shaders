// Name: FS Dusty Attic
// Author: fragilesilver
// Version: 1
//
// "Found your childhood Game Boy in grandma's attic" nostalgia shader.
// Yellowed plastic aging tint, faded contrast, animated floating dust
// motes drifting through a shaft of light, and soft warm vignette.

#pragma parameter yellow_age   "Yellowed Plastic Age"     0.35 0.00 0.80 0.02
#pragma parameter fade_amount  "Faded Contrast"           0.20 0.00 0.50 0.02
#pragma parameter dust_density "Dust Mote Density"        0.40 0.00 1.00 0.05
#pragma parameter dust_size    "Dust Mote Size"           1.50 0.50 4.00 0.25
#pragma parameter dust_speed   "Dust Drift Speed"         0.50 0.10 2.00 0.10
#pragma parameter light_shaft  "Light Shaft Strength"     0.15 0.00 0.40 0.02
#pragma parameter vignette     "Warm Vignette"            0.30 0.00 0.60 0.02
#pragma parameter bright_boost "Brightness"               1.00 0.80 1.30 0.02

uniform float yellow_age;
uniform float fade_amount;
uniform float dust_density;
uniform float dust_size;
uniform float dust_speed;
uniform float light_shaft;
uniform float vignette;
uniform float bright_boost;

float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float hash1(float n) {
    return fract(sin(n * 127.1) * 43758.5453123);
}

float dust_mote(vec2 uv, vec2 cell, float t) {
    float id = hash(cell);
    if (id > dust_density) return 0.0;

    float drift_x = sin(t * 0.3 * dust_speed + id * 6.28) * 0.3;
    float drift_y = cos(t * 0.2 * dust_speed + id * 4.17) * 0.2 - t * 0.05 * dust_speed;
    vec2 mote_pos = vec2(hash1(cell.x * 73.1 + cell.y) + drift_x,
                         hash1(cell.y * 37.3 + cell.x) + drift_y);
    mote_pos = fract(mote_pos);

    vec2 local_uv = fract(uv) - mote_pos;
    float dist = length(local_uv);

    float radius = (0.02 + id * 0.03) * dust_size / 20.0;
    float mote = smoothstep(radius, radius * 0.3, dist);

    return mote * (0.4 + id * 0.6);
}

void main() {
    vec3 col = texture2D(u_tex, v_uv).rgb;
    float t = u_time / 60.0;

    vec3 age_tint = vec3(1.08, 0.98, 0.78);
    col *= mix(vec3(1.0), age_tint, yellow_age);

    col.b *= 1.0 - yellow_age * 0.15;

    float luma = dot(col, vec3(0.299, 0.587, 0.114));
    col = mix(col, vec3(luma), fade_amount * 0.4);
    col = mix(vec3(0.15), col, 1.0 - fade_amount * 0.3);

    if (light_shaft > 0.0) {
        float shaft_line = (v_uv.x * 0.6 + (1.0 - v_uv.y) * 0.8);
        float shaft = exp(-pow((shaft_line - 0.65) * 4.0, 2.0)) * light_shaft;
        col += vec3(shaft * 0.95, shaft * 0.85, shaft * 0.55);
    }

    if (dust_density > 0.0) {
        vec2 res = max(u_resolution, vec2(1.0));
        float aspect = res.x / res.y;
        vec2 dust_uv = v_uv * vec2(16.0 * aspect, 16.0);
        vec2 cell = floor(dust_uv);

        float motes = 0.0;
        for (float dy = -1.0; dy <= 1.0; dy += 1.0) {
            for (float dx = -1.0; dx <= 1.0; dx += 1.0) {
                motes += dust_mote(dust_uv, cell + vec2(dx, dy), t);
            }
        }
        col += motes * 0.08 * vec3(1.0, 0.95, 0.75);
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
