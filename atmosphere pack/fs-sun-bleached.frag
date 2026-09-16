// Name: FS Sun Bleached
// Author: fragilesilver
// Version: 1
//
// UV fading simulation — like a poster left in a shop window or a SNES
// cartridge label baking on a car dashboard all summer. Reds shift toward
// salmon/pink, blues fade to grey, greens lose saturation. Whites gain
// slight ivory yellowing. The aesthetic of sun-damaged nostalgia.

#pragma parameter fade_years   "Years of Sun Damage"      0.50 0.00 1.00 0.02
#pragma parameter red_shift    "Red → Salmon/Pink Shift"   0.40 0.00 1.00 0.02
#pragma parameter blue_fade    "Blue → Grey Fade"          0.45 0.00 1.00 0.02
#pragma parameter green_wash   "Green Desaturation"        0.35 0.00 1.00 0.02
#pragma parameter ivory_tint   "Ivory White Yellowing"     0.20 0.00 0.60 0.02
#pragma parameter contrast_loss "Contrast Loss"            0.15 0.00 0.40 0.02
#pragma parameter bright_boost "Brightness"                1.00 0.80 1.30 0.02

uniform float fade_years;
uniform float red_shift;
uniform float blue_fade;
uniform float green_wash;
uniform float ivory_tint;
uniform float contrast_loss;
uniform float bright_boost;

void main() {
    vec3 col = texture2D(u_tex, v_uv).rgb;
    float luma = dot(col, vec3(0.299, 0.587, 0.114));

    float age = fade_years;

    if (red_shift > 0.0) {
        float red_dominance = clamp((col.r - max(col.g, col.b)) * 2.0, 0.0, 1.0);
        float shift = red_dominance * red_shift * age;
        col.r = col.r * (1.0 - shift * 0.15);
        col.b = col.b + shift * 0.20;
        col.g = col.g + shift * 0.08;
    }

    if (blue_fade > 0.0) {
        float blue_dominance = clamp((col.b - max(col.r, col.g)) * 2.0, 0.0, 1.0);
        float fade = blue_dominance * blue_fade * age;
        col.b = mix(col.b, luma, fade * 0.7);
        col.g = col.g + fade * 0.05;
    }

    if (green_wash > 0.0) {
        float green_dominance = clamp((col.g - max(col.r, col.b)) * 2.0, 0.0, 1.0);
        float wash = green_dominance * green_wash * age;
        col.g = mix(col.g, luma * 1.05, wash * 0.5);
        col.r = col.r + wash * 0.08;
    }

    float overall_desat = age * 0.25;
    col = mix(col, vec3(luma), overall_desat);

    if (ivory_tint > 0.0) {
        float whiteness = smoothstep(0.6, 0.95, luma);
        vec3 ivory = vec3(1.04, 1.00, 0.88);
        col *= mix(vec3(1.0), ivory, whiteness * ivory_tint * age);
    }

    if (contrast_loss > 0.0) {
        float lift = contrast_loss * age * 0.5;
        col = col * (1.0 - lift) + lift * 0.2;
        col = mix(col, vec3(0.5), contrast_loss * age * 0.15);
    }

    col *= bright_boost;
    gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
