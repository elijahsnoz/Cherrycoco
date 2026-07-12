import React from "react";
import founderImg from "./founder.jpeg";
import cofounderImg from "./cofounder.jpg";

// Build a srcset from any generated founder-<width>w.* images next to this file.
const responsiveImages = (() => {
  // Vite provides import.meta.globEager to include files at build time; pattern matches files next to this module.
  // If no responsive files are present, the resulting object will be empty and we'll fall back to the single import above.
  try {
    // match founder-440w.jpg, founder-880w.jpg, founder-1320w.jpg etc
    const matches = import.meta.globEager('./founder-*.{jpg,jpeg,png}');
    const entries = Object.keys(matches).map((k) => {
      // extract width from filename: founder-440w.jpg
      const m = k.match(/founder-(\d+)w\./);
      const w = m ? Number(m[1]) : 0;
      return { path: matches[k].default, w };
    }).filter(Boolean).sort((a,b) => a.w - b.w);
    return entries;
  } catch (err) {
    return [];
  }
})();

export default function About() {
  return (
    <section id="about" className="about reveal">
      <div className="about-grid">
        <img
          className="founder-img"
          src={founderImg}
          srcSet={
            responsiveImages.length > 0
              ? responsiveImages.map((r) => `${r.path} ${r.w}w`).join(', ')
              : `${founderImg} 1x, ${founderImg} 2x`
          }
          sizes="(max-width: 720px) 100vw, 220px"
          alt="Yusintha Kumar"
          width="220"
          height="220"
        />

        <div className="about-copy">
          <h2>About the Founder</h2>
          <p>
            <strong>Yusintha Kumar</strong> is a writer and journalist with The Smart Local Malaysia, where she currently crafts human-interest stories and impactful interviews under the “The Local Stories” pillar. She is also a performing artist with experience in poetry, cultural storytelling, and mental health-focused performances, bringing creativity and emotional depth to all her work.
          </p>

          <p>
            With expertise in personal essays, reflective storytelling, and arts collaborations both locally and internationally, Yusintha founded Cherry Coco to create a platform dedicated to human-centred storytelling, arts and culture, and cross-cultural creative collaborations.
          </p>

          <p>
            Her vision is to provide a space where authentic voices are celebrated, meaningful reading is promoted, and communities are built around creativity, reflection, and emotional connection. Cherry Coco is a human-centred storytelling platform from Malaysia, with the ambition to cultivate a meaningful reading culture locally while expanding into global creative conversation.
          </p>
        </div>
      </div>

      <div className="about-grid cofounder-grid">
        <img
          className="founder-img"
          src={cofounderImg}
          sizes="(max-width: 720px) 100vw, 220px"
          alt="Ajayi Elijah Snoz"
          width="220"
          height="220"
        />

        <div className="about-copy">
          <h2>About the Co-Founder</h2>
          <p>
            <strong>Ajayi Elijah Snoz</strong> is a creative technologist, painter, and musician working at the intersection of art, music, and technology. He is the Founder of{" "}
            <strong>TechArt Venture</strong>, <strong>Planet-B</strong>, and{" "}
            <strong>X Wurld Technology</strong> — ventures spanning creative technology, design, and digital products. Snoz built the technical foundation of Cherry Coco, engineering the platform that carries its storytelling to the world.
          </p>

          <p>
            Beyond code, his practice is a universe built by hand: over 200 original paintings and a body of soulful, atmospheric music released as Ajayi VII. He frames his work around <em>Atunbi</em> — meaning “rebirth” — a convergence where his neo-expressionist paintings and sound meet in a world built for every reborn soul.
          </p>

          <p>
            Learn more about his work at{" "}
            <a href="https://elijahsnoz.me" target="_blank" rel="noopener noreferrer">
              elijahsnoz.me
            </a>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
