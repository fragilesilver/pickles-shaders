// Name: FS Neon Noir
// Author: fragilesilver
// Version: 1
//
// Cyberpunk rain-soaked neon aesthetic. High contrast with crushed blacks,
// selective color pop (neon pinks/cyans/purples intensified while muting
// greens/browns), subtle chromatic edge fringing, and deep atmospheric
// blue-black shadows. Late-night arcade in a back alley.

#pragma parameter crush_blacks  "Crush Blacks"            0.06 0.00 0.15 0.01
#pragma parameter neon_pop      "Neon Color Pop"          0.50 0.00 1.00 0.02
#pragma parameter contrast      "Contrast"                1.25 0.80 1.80 0.05
#pragma parameter chroma_fringe "Chromatic Fringe"        0.0015 0.0000 0.0050 0.0005
#pragma parameter shadow_blue   "Shadow Blue Tint"        0.30 0.00 0.60 0.02
#pragma parameter sat_boost     "Saturation Boost"        0.20 0.00 0.60 0.02
#pragma parameter vignette      "Dark Vignette"           0.35 0.00 0.70 0.02
#pragma parameter bright_boost  "Brightness"              1.00 0.80 1.40 0.02

uniform float crush_blacks;
uniform float neon_pop;
uniform float contrast;
uniform float chroma_fringe;
uniform float shadow_blue;
uniform float sat_boost;
uniform float vignette;
uniform float bright_boost;

void main() {
    vec2 uv = v_uv;

    vec3 col;
    if (chroma_fringe > 0.0) {
        vec2 dir = (uv - 0.5) * chroma_fringe;
        col.r = texture2D(u_tex, uv + dir).r;
        col.g = texture2D(u_tex, uv).g;
        col.b = texture2D(u_tex, uv - dir).b;
    } else {
        col = texture2D(u_tex, uv).rgb;
    }

    float luma = dot(col, vec3(0.299, 0.587, 0.114));

    col = max(col - crush_blacks, 0.0) / (1.0 - crush_blacks);

    col = (col - 0.5) * contrast + 0.5;
    col = clamp(col, 0.0, 1.0);

    if (neon_pop > 0.0) {
        float r = col.r, g = col.g, b = col.b;
        float mx = max(r, max(g, b));
        float mn = min(r, min(g, b));
        float sat = (mx > 0.01) ? (mx - mn) / mx : 0.0;

        float is_pink = clamp((r - g) * 2.0, 0.0, 1.0) * clamp(b * 1.5, 0.0, 1.0);
        float is_cyan = clamp((g + b - r * 2.0), 0.0, 1.0);
        float is_purple = clamp((r + b - g * 2.0) * 0.7, 0.0, 1.0);
        float is_earthy = clamp((1.0 - sat) * 0.5, 0.0, 1.0);

        float neon_factor = max(is_pink, max(is_cyan, is_purple));

        float pop = mix(1.0 - is_earthy * 0.15, 1.0 + neon_factor * 0.4, neon_pop);
        col *= pop;
    }

    if (sat_boost > 0.0) {
        float l2 = dot(col, vec3(0.299, 0.587, 0.114));
        col = mix(vec3(l2), col, 1.0 + sat_boost);
    }

    if (shadow_blue > 0.0) {
        float l3 = dot(col, vec3(0.299, 0.587, 0.114));
        float shadow_mask = 1.0 - smoothstep(0.0, 0.35, l3);
        col.r -= shadow_mask * shadow_blue * 0.08;
        col.g += shadow_mask * shadow_blue * 0.02;
        col.b += shadow_mask * shadow_blue * 0.12;
    }

    if (vignette > 0.0) {
        vec2 vpos = uv * (1.0 - uv.yx);
        float vig = vpos.x * vpos.y * 16.0;
        vig = clamp(pow(vig, vignette), 0.0, 1.0);
        col *= vig;
    }

    col *= bright_boost;
    gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
