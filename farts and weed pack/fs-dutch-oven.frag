// Name: FS Dutch Oven
// Author: fragilesilver
// Version: 1
// Inspiration: Habbening

#pragma parameter stink_density "Miasma Density"      0.55   0.00  1.00  0.02
#pragma parameter stink_rise    "Rise Speed"          0.70   0.10  2.50  0.10
#pragma parameter pool_height   "Pooling Height"      0.55   0.10  1.00  0.05
#pragma parameter heat_warp     "Heat Shimmer Warp"   0.0025 0.0000 0.0100 0.0005
#pragma parameter green_tint    "Green Tint"          0.40   0.00  1.00  0.02
#pragma parameter murk          "Murk / Contrast Loss" 0.20  0.00  0.60  0.02
#pragma parameter bright_boost  "Brightness"          1.00   0.80  1.30  0.02

uniform float stink_density;
uniform float stink_rise;
uniform float pool_height;
uniform float heat_warp;
uniform float green_tint;
uniform float murk;
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

float fbm2(vec2 p) {
    return (vnoise(p) * 0.65 + vnoise(p * 2.17 + 19.3) * 0.35);
}

void main() {
    float t = u_time / 60.0 * stink_rise;

    vec2 cp = vec2(v_uv.x * 3.0 + sin(t * 0.35) * 0.4, v_uv.y * 2.2 - t * 0.55);
    float cloud = fbm2(cp);

    float height_mask = 1.0 - smoothstep(0.0, pool_height, v_uv.y);
    float gas = clamp(cloud * height_mask * stink_density * 2.0 - 0.15, 0.0, 1.0);

    vec2 uv = v_uv;
    if (heat_warp > 0.0) {
        float gx = fbm2(cp + vec2(0.35, 0.0)) - cloud;
        float gy = fbm2(cp + vec2(0.0, 0.35)) - cloud;
        uv += vec2(gx, gy) * heat_warp * (0.4 + gas) * 40.0;
        uv = clamp(uv, 0.0, 1.0);
    }

    vec3 col = texture2D(u_tex, uv).rgb;

    if (murk > 0.0) {
        float luma = dot(col, vec3(0.299, 0.587, 0.114));
        col = mix(col, vec3(luma), murk * gas);
        col = mix(col, col + vec3(0.06, 0.08, 0.02), murk * gas);
    }

    vec3 stink = vec3(0.62, 0.95, 0.38);
    col = mix(col, col * stink, green_tint * gas);
    col += stink * 0.05 * gas * green_tint;

    col *= bright_boost;
    gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
