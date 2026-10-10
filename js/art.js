/*
 * Ilustraciones SVG de los objetos.
 * Cada función recibe un sufijo único (u) para que los ids de los gradientes
 * no choquen cuando la misma pieza aparece varias veces en la página.
 * Devuelven solo el contenido interno; el <svg> lo arma app.js.
 */
const ART = (() => {
  const shadow = (u, rx = 120) => `
    <defs>
      <radialGradient id="sh${u}" cx="50%" cy="50%" r="50%">
        <stop offset="0" stop-color="#000" stop-opacity=".16"/>
        <stop offset="1" stop-color="#000" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <ellipse class="art-shadow" cx="200" cy="356" rx="${rx}" ry="11" fill="url(#sh${u})"/>`;

  const phone = (u) => `
    ${shadow(u, 90)}
    <defs>
      <linearGradient id="ph1${u}" x1="0" x2="1">
        <stop offset="0" stop-color="#dcdbd6"/><stop offset=".5" stop-color="#8f8e89"/><stop offset="1" stop-color="#d2d1cc"/>
      </linearGradient>
      <linearGradient id="ph2${u}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#44444a"/><stop offset=".55" stop-color="#232326"/><stop offset="1" stop-color="#18181a"/>
      </linearGradient>
      <linearGradient id="ph3${u}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#55555a"/><stop offset="1" stop-color="#2a2a2d"/>
      </linearGradient>
    </defs>
    <g transform="rotate(-9 200 200)">
      <rect x="128" y="52" width="144" height="290" rx="26" fill="url(#ph1${u})"/>
      <rect x="132" y="56" width="136" height="282" rx="23" fill="url(#ph2${u})"/>
      <rect x="144" y="68" width="64" height="68" rx="17" fill="url(#ph3${u})"/>
      <circle cx="163" cy="87" r="11" fill="#121214" stroke="#4a4a4e" stroke-width="2"/>
      <circle cx="163" cy="117" r="11" fill="#121214" stroke="#4a4a4e" stroke-width="2"/>
      <circle cx="190" cy="102" r="11" fill="#121214" stroke="#4a4a4e" stroke-width="2"/>
      <circle cx="193" cy="80" r="3" fill="#e9e6df"/>
      <circle cx="200" cy="210" r="10" fill="none" stroke="#8d8c87" stroke-width="1.5" opacity=".5"/>
      <rect x="272" y="128" width="3" height="42" rx="1.5" fill="#9a9994"/>
      <path d="M140 60 L214 60 L140 210 Z" fill="#fff" opacity=".05"/>
    </g>`;

  const sneaker = (u) => `
    ${shadow(u, 150)}
    <defs>
      <linearGradient id="sn1${u}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#f6f5f1"/><stop offset="1" stop-color="#d4d2cc"/>
      </linearGradient>
    </defs>
    <g transform="translate(-8 40)">
      <path d="M76 262 L82 214 Q86 190 108 186 L150 180 Q172 176 184 158 L194 146 Q204 136 216 142 L248 164 Q282 186 318 206 Q346 222 346 262 Z" fill="url(#sn1${u})" stroke="#cfcdc7" stroke-width="1.5"/>
      <path d="M76 262 L82 214 Q84 200 98 193 L104 262 Z" fill="#232323"/>
      <path d="M126 246 Q 210 196 316 226" fill="none" stroke="#1c1c1c" stroke-width="9" stroke-linecap="round"/>
      ${[0, 1, 2, 3].map((i) => {
        const x = 192 + i * 15, y = 160 + i * 10;
        return `<line x1="${x}" y1="${y}" x2="${x + 15}" y2="${y - 9}" stroke="#9b9993" stroke-width="3" stroke-linecap="round"/>`;
      }).join('')}
      <path d="M70 262 L346 262 L346 276 Q345 292 322 292 L92 292 Q70 292 70 276 Z" fill="#fbfbf9" stroke="#d9d7d1" stroke-width="1.5"/>
      <path d="M70 282 L346 282 Q344 292 322 292 L92 292 Q72 292 70 282 Z" fill="#262626"/>
    </g>`;

  const watch = (u) => `
    ${shadow(u, 70)}
    <defs>
      <linearGradient id="ws${u}" x1="0" x2="1">
        <stop offset="0" stop-color="#1c1c1c"/><stop offset=".5" stop-color="#383634"/><stop offset="1" stop-color="#1c1c1c"/>
      </linearGradient>
      <linearGradient id="wc${u}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#f1f0ec"/><stop offset=".45" stop-color="#9e9d98"/><stop offset="1" stop-color="#dcdbd6"/>
      </linearGradient>
      <radialGradient id="wd${u}" cx="40%" cy="35%" r="70%">
        <stop offset="0" stop-color="#2e2e30"/><stop offset="1" stop-color="#111112"/>
      </radialGradient>
    </defs>
    <path d="M166 44 L234 44 L228 136 L172 136 Z" fill="url(#ws${u})"/>
    <path d="M172 264 L228 264 L234 350 L166 350 Z" fill="url(#ws${u})"/>
    <rect x="276" y="191" width="13" height="18" rx="3" fill="url(#wc${u})"/>
    <circle cx="200" cy="200" r="80" fill="url(#wc${u})"/>
    <circle cx="200" cy="200" r="71" fill="#121212"/>
    <circle cx="200" cy="200" r="65" fill="url(#wd${u})"/>
    ${Array.from({ length: 12 }, (_, i) => `<rect x="198.5" y="142" width="3" height="${i % 3 === 0 ? 13 : 7}" fill="#e8e6e0" transform="rotate(${i * 30} 200 200)"/>`).join('')}
    <rect x="197" y="162" width="6" height="42" rx="3" fill="#f2f0ea" transform="rotate(-52 200 200)"/>
    <rect x="198.5" y="146" width="3" height="58" rx="1.5" fill="#f2f0ea" transform="rotate(64 200 200)"/>
    <rect x="199.4" y="140" width="1.2" height="74" fill="#b7a58f" transform="rotate(152 200 200)"/>
    <circle cx="200" cy="200" r="4" fill="#e8e6e0"/>`;

  const headphones = (u) => `
    ${shadow(u, 110)}
    <defs>
      <linearGradient id="hc${u}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#efeee9"/><stop offset="1" stop-color="#bcbab4"/>
      </linearGradient>
    </defs>
    <path d="M116 230 C 116 92, 284 92, 284 230" fill="none" stroke="#d6d4ce" stroke-width="14" stroke-linecap="round"/>
    <path d="M132 168 C 146 120, 254 120, 268 168" fill="none" stroke="#2b2b2b" stroke-width="9" stroke-linecap="round"/>
    <rect x="110" y="196" width="12" height="30" rx="4" fill="#a9a7a1"/>
    <rect x="278" y="196" width="12" height="30" rx="4" fill="#a9a7a1"/>
    <rect x="84" y="206" width="64" height="110" rx="30" fill="url(#hc${u})"/>
    <rect x="252" y="206" width="64" height="110" rx="30" fill="url(#hc${u})"/>
    <rect x="138" y="218" width="18" height="86" rx="9" fill="#2d2d2d"/>
    <rect x="244" y="218" width="18" height="86" rx="9" fill="#2d2d2d"/>
    <rect x="96" y="226" width="5" height="40" rx="2.5" fill="#fff" opacity=".45"/>`;

  const bag = (u) => `
    ${shadow(u, 140)}
    <defs>
      <linearGradient id="bl${u}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#3d3733"/><stop offset="1" stop-color="#1b1816"/>
      </linearGradient>
      <linearGradient id="bg${u}" x1="0" x2="1">
        <stop offset="0" stop-color="#d6cdbb"/><stop offset="1" stop-color="#9c9381"/>
      </linearGradient>
    </defs>
    <path d="M162 172 C162 104, 238 104, 238 172" fill="none" stroke="#3a3430" stroke-width="7"/>
    <path d="M100 340 L80 340 Q74 340 75 334 L98 170 L302 170 L325 334 Q326 340 320 340 Z" fill="url(#bl${u})"/>
    <path d="M148 172 C148 88, 252 88, 252 172" fill="none" stroke="#24201d" stroke-width="10"/>
    <rect x="98" y="170" width="204" height="14" fill="#29241f"/>
    <path d="M104 194 L296 194" stroke="#58504a" stroke-width="1.2" stroke-dasharray="3 5"/>
    <rect x="186" y="204" width="28" height="18" rx="2" fill="url(#bg${u})"/>
    <path d="M110 186 L96 330" stroke="#fff" stroke-width="10" opacity=".04"/>`;

  const perfume = (u) => `
    ${shadow(u, 95)}
    <defs>
      <linearGradient id="pg${u}" x1="0" x2="1">
        <stop offset="0" stop-color="#f4f3ef"/><stop offset=".6" stop-color="#e2e0da"/><stop offset="1" stop-color="#c9c7c1"/>
      </linearGradient>
      <linearGradient id="pl${u}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#e9e0cf"/><stop offset="1" stop-color="#c9b99d"/>
      </linearGradient>
      <linearGradient id="pc${u}" x1="0" x2="1">
        <stop offset="0" stop-color="#2a2a2a"/><stop offset=".5" stop-color="#4a4a4a"/><stop offset="1" stop-color="#1a1a1a"/>
      </linearGradient>
    </defs>
    <rect x="182" y="148" width="36" height="24" fill="#bdbbb5"/>
    <rect x="164" y="92" width="72" height="60" rx="3" fill="url(#pc${u})"/>
    <rect x="126" y="168" width="148" height="176" rx="10" fill="url(#pg${u})" stroke="#c9c7c1" stroke-width="1.5"/>
    <rect x="137" y="202" width="126" height="132" rx="6" fill="url(#pl${u})" opacity=".9"/>
    <rect x="141" y="178" width="7" height="150" rx="3.5" fill="#fff" opacity=".55"/>
    <rect x="166" y="250" width="68" height="34" fill="#f7f6f3" opacity=".9"/>
    <text x="200" y="272" text-anchor="middle" font-size="11" letter-spacing="3" fill="#222" font-family="Inter Tight, sans-serif">Nº 5</text>`;

  const glasses = (u) => `
    ${shadow(u, 130)}
    <defs>
      <linearGradient id="gl${u}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#2b2b2b" stop-opacity=".92"/><stop offset="1" stop-color="#6e6c68" stop-opacity=".78"/>
      </linearGradient>
    </defs>
    <path d="M80 194 L48 186" stroke="#141414" stroke-width="6" stroke-linecap="round"/>
    <path d="M320 194 L352 186" stroke="#141414" stroke-width="6" stroke-linecap="round"/>
    <rect x="78" y="176" width="114" height="80" rx="32" fill="url(#gl${u})" stroke="#141414" stroke-width="7"/>
    <rect x="208" y="176" width="114" height="80" rx="32" fill="url(#gl${u})" stroke="#141414" stroke-width="7"/>
    <path d="M191 196 Q 200 184 209 196" fill="none" stroke="#141414" stroke-width="6"/>
    <path d="M98 196 L124 186 L106 238 Z" fill="#fff" opacity=".13"/>
    <path d="M228 196 L254 186 L236 238 Z" fill="#fff" opacity=".13"/>`;

  const bottle = (u) => `
    ${shadow(u, 70)}
    <defs>
      <linearGradient id="vb${u}" x1="0" x2="1">
        <stop offset="0" stop-color="#a3a29d"/><stop offset=".35" stop-color="#efeeea"/><stop offset=".7" stop-color="#cbcac5"/><stop offset="1" stop-color="#8d8c87"/>
      </linearGradient>
      <linearGradient id="vc${u}" x1="0" x2="1">
        <stop offset="0" stop-color="#1c1c1c"/><stop offset=".45" stop-color="#454545"/><stop offset="1" stop-color="#161616"/>
      </linearGradient>
    </defs>
    <path d="M186 66 Q200 40 214 66" fill="none" stroke="#1e1e1e" stroke-width="6"/>
    <rect x="176" y="98" width="48" height="30" rx="6" fill="#cfcec9"/>
    <rect x="172" y="64" width="56" height="40" rx="8" fill="url(#vc${u})"/>
    <rect x="158" y="120" width="84" height="226" rx="28" fill="url(#vb${u})"/>
    <rect x="158" y="292" width="84" height="3" fill="#fff" opacity=".45"/>
    <rect x="178" y="140" width="6" height="140" rx="3" fill="#fff" opacity=".35"/>`;

  return { phone, sneaker, watch, headphones, bag, perfume, glasses, bottle };
})();
