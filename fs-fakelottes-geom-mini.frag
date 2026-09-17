// Name: FS Fakelottes Geom Mini
// Author: Rogalian (cools) — muOS port by fragilesilver
// Version: 1
//
// Hack-together of fakelottes (shadow mask + curvature)
// and fake-CRT-geom (smooth border & corners).
// Scanline effect intentionally stripped — causes moiré on low-res panels.
//
// Original: https://github.com/libretro/glsl-shaders/blob/master/crt/shaders/fakelottes-geom-mini.glsl

#pragma parameter shadowMask    "Shadow Mask"         1.0 0.0 4.0 1.0
#pragma parameter warpX         "Warp X"              0.031 0.000 0.125 0.010
#pragma parameter warpY         "Warp Y"              0.041 0.000 0.125 0.010
#pragma parameter maskDark      "Mask Dark"           0.5 0.0 2.0 0.1
#pragma parameter maskLight     "Mask Light"          1.5 0.0 2.0 0.1
#pragma parameter crt_gamma     "CRT Gamma"           2.5 1.0 4.0 0.05
#pragma parameter monitor_gamma "Monitor Gamma"       2.2 1.0 4.0 0.05
#pragma parameter bsmooth       "Border Smoothness"   600.0 40.0 600.0 10.0
#pragma parameter a_corner      "Corner Roundness"    0.02 0.00 0.20 0.01
#pragma parameter smoother      "Smoother"            0.0 0.0 8.0 0.25

uniform float shadowMask;
uniform float warpX;
uniform float warpY;
uniform float maskDark;
uniform float maskLight;
uniform float crt_gamma;
uniform float monitor_gamma;
uniform float bsmooth;
uniform float a_corner;
uniform float smoother;

vec2 native_res() {
    return max(u_native_resolution, vec2(1.0));
}

vec3 sample_smooth(vec2 uv, float amount) {
    if (amount <= 0.0) return texture2D(u_tex, uv).rgb;

    vec2 px = amount / native_res();

    vec3 c  = texture2D(u_tex, uv).rgb * 0.25;
    c += texture2D(u_tex, clamp(uv + vec2( px.x, 0.0), 0.0, 1.0)).rgb * 0.125;
    c += texture2D(u_tex, clamp(uv + vec2(-px.x, 0.0), 0.0, 1.0)).rgb * 0.125;
    c += texture2D(u_tex, clamp(uv + vec2(0.0,  px.y), 0.0, 1.0)).rgb * 0.125;
    c += texture2D(u_tex, clamp(uv + vec2(0.0, -px.y), 0.0, 1.0)).rgb * 0.125;
    c += texture2D(u_tex, clamp(uv + vec2( px.x,  px.y), 0.0, 1.0)).rgb * 0.0625;
    c += texture2D(u_tex, clamp(uv + vec2(-px.x,  px.y), 0.0, 1.0)).rgb * 0.0625;
    c += texture2D(u_tex, clamp(uv + vec2( px.x, -px.y), 0.0, 1.0)).rgb * 0.0625;
    c += texture2D(u_tex, clamp(uv + vec2(-px.x, -px.y), 0.0, 1.0)).rgb * 0.0625;
    return c;
}

vec2 warp(vec2 pos) {
    pos = pos * 2.0 - 1.0;
    pos *= vec2(1.0 + (pos.y * pos.y) * warpX,
                1.0 + (pos.x * pos.x) * warpY);
    return pos * 0.5 + 0.5;
}

vec3 mask(vec2 frag) {
    vec3 m = vec3(maskDark);

    if (shadowMask < 1.5 && shadowMask > 0.5) {
        float line = maskLight;
        float odd  = 0.0;

        if (fract(frag.x * 0.166666666) < 0.5) odd = 1.0;
        if (fract((frag.y + odd) * 0.5) < 0.5) line = maskDark;

        float px = fract(frag.x * 0.333333333);
        if      (px < 0.333) m.r = maskLight;
        else if (px < 0.666) m.g = maskLight;
        else                 m.b = maskLight;
        m *= line;
    }
    else if (shadowMask > 1.5 && shadowMask < 2.5) {
        float px = fract(frag.x * 0.333333333);
        if      (px < 0.333) m.r = maskLight;
        else if (px < 0.666) m.g = maskLight;
        else                 m.b = maskLight;
    }
    else {
        m = vec3(1.0);
    }

    return m;
}

float corner(vec2 coord) {
    coord = min(coord, 1.0 - coord);
    vec2 cdist = vec2(a_corner);
    coord = cdist - min(coord, cdist);
    float dist = sqrt(dot(coord, coord));
    return clamp((cdist.x - dist) * bsmooth, 0.0, 1.0);
}

void main() {
    vec2 pos = warp(v_uv);

    if (pos.x <= 0.0 || pos.x >= 1.0 || pos.y <= 0.0 || pos.y >= 1.0) {
        gl_FragColor = vec4(0.0);
        return;
    }

    vec3 in_gamma  = vec3(crt_gamma);
    vec3 out_gamma = vec3(1.0 / monitor_gamma);

    vec3 col = pow(sample_smooth(pos, smoother), in_gamma);

    col *= mask(gl_FragCoord.xy * 1.0001);

    if (a_corner > 0.0) col *= corner(pos);

    gl_FragColor = vec4(pow(col, out_gamma), 1.0);
}
