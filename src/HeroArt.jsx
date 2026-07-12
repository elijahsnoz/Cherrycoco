import React from "react";

/**
 * Abstract, editorial line-art of a man and a woman writing together —
 * two figures leaning toward a shared page while a ribbon of ink unspools
 * into script. Drawn as continuous strokes so it reads as "beautiful art",
 * not a photograph. Purely decorative.
 */
export default function HeroArt() {
  return (
    <svg
      className="hero-art"
      viewBox="0 0 640 560"
      role="img"
      aria-label="Abstract illustration of a man and a woman writing together"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="ccBlush" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F6D2C4" />
          <stop offset="1" stopColor="#E9A68F" />
        </linearGradient>
        <linearGradient id="ccWarm" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FBE3B8" />
          <stop offset="1" stopColor="#EFB9A0" />
        </linearGradient>
        <linearGradient id="ccInk" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#C6402F" />
          <stop offset="1" stopColor="#8F2C1E" />
        </linearGradient>
      </defs>

      {/* soft organic backdrops */}
      <path
        className="art-blob"
        d="M470 70c70 22 120 96 100 168-19 70-92 96-140 150-52 58-88 118-166 108-74-9-118-78-138-150-21-76 4-158 62-206 60-49 148-45 224-63 20-5 40-11 58-7z"
        fill="url(#ccWarm)"
        opacity="0.55"
      />
      <circle cx="150" cy="150" r="86" fill="url(#ccBlush)" opacity="0.5" />

      {/* the shared page */}
      <g className="art-page">
        <path
          d="M212 372l216-40c10-2 19 5 20 15l16 96c2 10-5 19-15 21l-216 40c-10 2-19-5-20-15l-16-96c-2-10 5-19 15-21z"
          fill="#FFFDF8"
          stroke="#2A211C"
          strokeWidth="3"
        />
        <path d="M244 388l150-28M250 414l150-28M256 440l112-20" stroke="#C9BBAE" strokeWidth="3" strokeLinecap="round" />
      </g>

      {/* woman — left, drawn as one flowing line */}
      <g className="art-figure art-figure-a" fill="none" stroke="#2A211C" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="176" cy="196" r="40" fill="#F6D2C4" stroke="#2A211C" />
        {/* flowing hair */}
        <path d="M138 190c-26-40-6-96 44-104 52-8 86 34 78 78-6 32-30 40-30 62" stroke="#2A211C" fill="none" />
        {/* torso leaning to the page */}
        <path d="M168 236c-18 22-30 52-24 86 4 24 22 40 46 44" />
        {/* arm reaching to write */}
        <path d="M196 300c34 6 66 20 96 44" />
      </g>

      {/* man — right, mirrored flowing line */}
      <g className="art-figure art-figure-b" fill="none" stroke="#2A211C" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="470" cy="184" r="38" fill="#EFB9A0" stroke="#2A211C" />
        {/* short swept hair */}
        <path d="M436 174c-6-40 24-70 60-62 34 8 44 44 30 70" stroke="#2A211C" fill="none" />
        {/* torso */}
        <path d="M486 220c22 18 38 46 36 80-2 24-20 44-44 50" />
        {/* arm reaching to the shared page with a pen */}
        <path d="M456 268c-32 12-60 34-84 64" />
      </g>

      {/* the pen shared between them */}
      <g className="art-pen">
        <path d="M356 356l58-58c6-6 16-6 22 0 6 6 6 16 0 22l-58 58-30 8z" fill="url(#ccInk)" stroke="#2A211C" strokeWidth="2.5" />
        <path d="M348 386l14-14 8 8-14 14z" fill="#2A211C" />
      </g>

      {/* ribbon of ink unspooling into script */}
      <path
        className="art-ink"
        d="M356 372c-70 30-150 4-150-64 0-52 60-70 96-40 34 28 6 78-34 74-30-3-40-34-20-52"
        fill="none"
        stroke="url(#ccInk)"
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.85"
      />

      {/* scattered ink marks / punctuation */}
      <circle cx="132" cy="330" r="5" fill="#C6402F" />
      <circle cx="500" cy="340" r="6" fill="#C6402F" opacity="0.8" />
      <path d="M540 250c10 6 12 20 2 26" stroke="#C6402F" strokeWidth="4" fill="none" strokeLinecap="round" />
    </svg>
  );
}
