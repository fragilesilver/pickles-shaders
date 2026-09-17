// Name: FS Risograph
// Author: fragilesilver
// Version: 1

#pragma parameter ink_pair    "Inks: 0 Pnk/Blu 1 Org/Tel 2 Yel/Pur 3 Red/Grn 4 Pnk/Blk" 0.0 0.0 4.0 1.0
#pragma parameter dot_size    "Halftone Dot Pitch (px)"   3.0  1.5  9.0  0.5
#pragma parameter dot_soft    "Dot Edge Softness"         0.35 0.05 1.00 0.05
#pragma parameter ink_amount  "Ink Coverage"              1.00 0.30 1.60 0.05
#pragma parameter tone_open   "Midtone Openness"          1.35 0.60 2.20 0.05
#pragma parameter misreg      "Misregistration (px)"      1.6  0.0  6.0  0.2
#pragma parameter ink_blotch  "Ink Density Variance"      0.18 0.00 0.60 0.02
#pragma parameter paper_tone  "Paper Cream Tone"          0.55 0.00 1.00 0.05
#pragma parameter paper_grain "Paper Fibre Grain"         0.06 0.00 0.20 0.01

uniform float ink_pair;
uniform float dot_size;
uniform float dot_soft;
uniform float ink_amount;
uniform float tone_open;
uniform float misreg;
uniform float ink_blotch;
uniform float paper_tone;
uniform float paper_grain;

float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float vnoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float halftone(vec2 frag, float angle, float density) {
    float s = sin(angle);
    float c = cos(angle);
    vec2 rot = vec2(frag.x * c - frag.y * s, frag.x * s + frag.y * c);
    vec2 cell = fract(rot / dot_size) - 0.5;

    float r = sqrt(clamp(density, 0.0, 1.0)) * 0.72;
    float aa = dot_soft * 0.5;
    float cov = 1.0 - smoothstep(r - aa, r + aa, length(cell));

    return cov * smoothstep(0.0, 0.03, density);
}

void main() {
    vec3 ink_a;
    vec3 ink_b;
    if (ink_pair < 0.5) {
        ink_a = vec3(1.000, 0.282, 0.690);
        ink_b = vec3(0.000, 0.471, 0.749);
    } else if (ink_pair < 1.5) {
        ink_a = vec3(1.000, 0.424, 0.184);
        ink_b = vec3(0.000, 0.514, 0.541);
    } else if (ink_pair < 2.5) {
        ink_a = vec3(1.000, 0.910, 0.000);
        ink_b = vec3(0.463, 0.357, 0.655);
    } else if (ink_pair < 3.5) {
        ink_a = vec3(0.945, 0.314, 0.376);
        ink_b = vec3(0.000, 0.663, 0.361);
    } else {
        ink_a = vec3(1.000, 0.282, 0.690);
        ink_b = vec3(0.055, 0.055, 0.080);
    }

    vec2 off = vec2(misreg) / u_resolution;
    vec3 src_a = texture2D(u_tex, v_uv + off * vec2(0.92, -0.38)).rgb;
    vec3 src_b = texture2D(u_tex, v_uv + off * vec2(-0.75, 0.66)).rgb;

    float luma_a = dot(src_a, vec3(0.299, 0.587, 0.114));
    float luma_b = dot(src_b, vec3(0.299, 0.587, 0.114));
    float dark_a = pow(clamp(1.0 - luma_a, 0.0, 1.0), tone_open);
    float dark_b = pow(clamp(1.0 - luma_b, 0.0, 1.0), tone_open);
    float warm_a = clamp(0.5 + (src_a.r - src_a.b) * 1.2, 0.0, 1.0);
    float warm_b = clamp(0.5 + (src_b.r - src_b.b) * 1.2, 0.0, 1.0);

    float dens_a = dark_a * mix(0.55, 1.00, warm_a) * ink_amount;
    float dens_b = dark_b * mix(1.00, 0.55, warm_b) * ink_amount;

    if (ink_blotch > 0.0) {
        float blotch_a = 1.0 + (vnoise(gl_FragCoord.xy * 0.012) - 0.5) * 2.0 * ink_blotch;
        float blotch_b = 1.0 + (vnoise(gl_FragCoord.xy * 0.012 + 37.0) - 0.5) * 2.0 * ink_blotch;
        float band = 1.0 + (vnoise(vec2(0.0, gl_FragCoord.y * 0.09)) - 0.5) * ink_blotch * 0.8;
        dens_a *= blotch_a * band;
        dens_b *= blotch_b * band;
    }

    float cov_a = halftone(gl_FragCoord.xy, 0.2618, dens_a);
    float cov_b = halftone(gl_FragCoord.xy, 1.3090, dens_b);

    vec3 paper = mix(vec3(0.960, 0.955, 0.940), vec3(0.940, 0.910, 0.820), paper_tone);
    if (paper_grain > 0.0) {
        float fibre = (hash(gl_FragCoord.xy * 0.9) - 0.5) * paper_grain;
        paper += vec3(fibre * 1.05, fibre, fibre * 0.90);
    }

    vec3 col = paper;
    col *= mix(vec3(1.0), ink_a, clamp(cov_a, 0.0, 1.0));
    col *= mix(vec3(1.0), ink_b, clamp(cov_b, 0.0, 1.0));

    gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
