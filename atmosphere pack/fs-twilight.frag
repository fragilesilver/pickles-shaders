// Name: FS Twilight
// Author: fragilesilver
// Version: 1
//
// Ambient environment shader: Golden hour / blue hour adaptive color grade.
// Shifts the palette from warm amber sunset tones to cool moonlit blue
// based on a configurable time-of-day parameter. Like playing under a window
// as the sun sets and night falls.

#pragma parameter time_of_day  "Time: 0 Dawn / 0.3 Day / 0.6 Dusk / 1 Night"  0.55 0.00 1.00 0.01
#pragma parameter warmth       "Warmth Intensity"       0.45 0.00 1.00 0.02
#pragma parameter sky_bleed    "Sky Light Bleed"         0.12 0.00 0.40 0.02
#pragma parameter contrast     "Contrast"                1.08 0.80 1.40 0.02
#pragma parameter sat_shift    "Saturation Shift"        0.05 -0.30 0.30 0.02
#pragma parameter bright_boost "Brightness"              1.00 0.70 1.40 0.02

uniform float time_of_day;
uniform float warmth;
uniform float sky_bleed;
uniform float contrast;
uniform float sat_shift;
uniform float bright_boost;

vec3 rgb_to_hsl(vec3 c) {
    float mx = max(c.r, max(c.g, c.b));
    float mn = min(c.r, min(c.g, c.b));
    float l = (mx + mn) * 0.5;
    if (mx == mn) return vec3(0.0, 0.0, l);
    float d = mx - mn;
    float s = l > 0.5 ? d / (2.0 - mx - mn) : d / (mx + mn);
    float h;
    if (mx == c.r) h = (c.g - c.b) / d + (c.g < c.b ? 6.0 : 0.0);
    else if (mx == c.g) h = (c.b - c.r) / d + 2.0;
    else h = (c.r - c.g) / d + 4.0;
    return vec3(h / 6.0, s, l);
}

float hue2rgb(float p, float q, float t) {
    if (t < 0.0) t += 1.0;
    if (t > 1.0) t -= 1.0;
    if (t < 1.0/6.0) return p + (q - p) * 6.0 * t;
    if (t < 0.5) return q;
    if (t < 2.0/3.0) return p + (q - p) * (2.0/3.0 - t) * 6.0;
    return p;
}

vec3 hsl_to_rgb(vec3 hsl) {
    if (hsl.y == 0.0) return vec3(hsl.z);
    float q = hsl.z < 0.5 ? hsl.z * (1.0 + hsl.y) : hsl.z + hsl.y - hsl.z * hsl.y;
    float p = 2.0 * hsl.z - q;
    return vec3(
        hue2rgb(p, q, hsl.x + 1.0/3.0),
        hue2rgb(p, q, hsl.x),
        hue2rgb(p, q, hsl.x - 1.0/3.0)
    );
}

void main() {
    vec3 col = texture2D(u_tex, v_uv).rgb;

    vec3 dawn_tint  = vec3(1.05, 0.90, 0.80);
    vec3 day_tint   = vec3(1.00, 1.00, 1.00);
    vec3 dusk_tint  = vec3(1.12, 0.88, 0.65);
    vec3 night_tint = vec3(0.75, 0.82, 1.10);

    vec3 tint;
    float t = time_of_day;
    if (t < 0.3) {
        tint = mix(dawn_tint, day_tint, t / 0.3);
    } else if (t < 0.6) {
        tint = mix(day_tint, dusk_tint, (t - 0.3) / 0.3);
    } else {
        tint = mix(dusk_tint, night_tint, (t - 0.6) / 0.4);
    }

    col *= mix(vec3(1.0), tint, warmth);

    float sky = (1.0 - v_uv.y) * sky_bleed;
    col += sky * mix(vec3(0.15, 0.12, 0.08), vec3(0.05, 0.07, 0.15), t);

    col = (col - 0.5) * contrast + 0.5;

    if (abs(sat_shift) > 0.001) {
        vec3 hsl = rgb_to_hsl(col);
        hsl.y = clamp(hsl.y + sat_shift, 0.0, 1.0);
        col = hsl_to_rgb(hsl);
    }

    col *= bright_boost;
    gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
