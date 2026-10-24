import type { ArtifactType } from '../model/types';

/** Original miniature illustrations. Animated parts stay in their own groups. */
export function artifactDrawing(type: ArtifactType, id: string) {
  const paint = (name: string) => `url(#${id}-${name})`;
  switch (type) {
    case 'book': return <g className="artifact-book">
      <path d="M44 157Q44 154 47 153L111 178 176 151Q180 151 179 156L177 162 111 188 46 164Z" fill="#667e83" />
      <path d="m46 151 65 25 65-26-2-54-64 23-64-18Z" fill="#a9a0b6" />
      <path d="M110 119v55" stroke="#c8aa71" strokeWidth="4" />
      <g className="book-pages">
        <path d="M110 112C90 95 71 91 45 95l3 52c22-4 41 5 62 19 21-14 41-23 65-20l1-52c-26-2-46 4-66 18Z" fill={paint('paper')} />
        <path d="M110 112v54M50 143c22-2 40 5 56 17M116 160c17-11 35-17 55-16" fill="none" stroke="#a68458" strokeWidth="1.4" />
        <path d="M57 108c15 0 28 5 40 11m-40-2c15 1 27 5 40 12m-39-2c11 1 24 5 34 10m-33-1 20 6" fill="none" stroke="#a99271" strokeWidth="1.1" opacity=".7" />
        <path d="M124 122c10-7 24-11 38-12m-38 21c10-6 23-10 38-12" fill="none" stroke="#c1ac81" strokeWidth="1" />
        <path d="m139 131 5 9 10-3-6 8 5 9-10-4-7 7 1-11-9-5 10-2Z" fill="#d7b86e" opacity=".7" stroke="none" />
      </g>
      <path d="m106 168 1 19 7-6 7 1-3-17" fill="#d69b87" stroke="#8c6c68" strokeWidth="1" />
      <path d="m58 151 6 10-1 5 8-3 7 6-1-10 6-5-10-1-5-7-2 8Z" fill="#efd291" stroke="#8d8467" strokeWidth="1" /><path d="m54 156 49 19m18-1 45-20" stroke="#d0a771" strokeWidth="1" opacity=".7" />
    </g>;
    case 'spaceship': return <g className="artifact-spaceship">
      <g className="spaceship-body">
        <path d="M90 113c-21 3-34 24-33 45 1 9 9 13 14 5l29-27m29-23c21 4 33 24 33 45-1 10-9 13-14 5l-29-27" fill="#d19a89" />
        <path d="M87 139C78 111 88 76 102 60q9-12 18 0c14 18 25 51 15 79-8 16-38 18-48 0Z" fill={paint('ivory')} />
        <path d="M89 87c4-10 8-20 13-27q9-12 18 0c6 8 11 17 14 27-12-6-32-7-45 0Z" fill="#b3a1ba" />
        <path d="M99 140h25l-4 17h-17Z" fill="#768d8c" />
        <ellipse cx="111" cy="107" rx="14" ry="16" fill="#ba995e" />
        <ellipse cx="111" cy="107" rx="10" ry="12" fill={paint('glass')} stroke="#e1c38b" strokeWidth="1.5" />
        <path d="m106 101 5-4m-14 30 3 8m23-45 3 7" stroke="#fff0c2" strokeWidth="2" opacity=".6" />
        <path d="m110 120 3 5 6 1-4 4v6l-5-3-5 3 1-6-5-4 6-1Z" fill="#d9b76f" stroke="#9c875d" strokeWidth=".8" /><circle className="spaceship-lamp" cx="111" cy="143" r="2.2" fill="#e6bd68" stroke="none" />
        <path d="M108 157v13m7-13v9" stroke="#ddb264" strokeWidth="3" />
        <g fill="#b99c6a" stroke="none"><circle cx="89" cy="116" r="1.4"/><circle cx="132" cy="116" r="1.4"/><circle cx="93" cy="132" r="1.4"/><circle cx="128" cy="132" r="1.4"/></g>
      </g>
      <path d="M91 179c10-6 30-6 40 0" fill="none" stroke="#bfaa76" strokeWidth="1" opacity=".4" />
    </g>;
    case 'plant': return <g className="artifact-plant">
      <path d="M83 142c-3 10 1 30 8 36 10 9 32 8 40-2 7-9 8-24 6-34Z" fill={paint('terracotta')} /><path d="M86 156c15 5 34 6 49-1l-2 11c-15 6-31 5-44 0Z" fill="#e9c9a0" stroke="none"/><path d="M110 153v21m-12-10 25-1" stroke="#648683" strokeWidth="3"/><circle cx="99" cy="173" r="2" fill="#bc8175" stroke="none"/>
      <ellipse cx="110" cy="143" rx="29" ry="8" fill="#a5b7ac" /><ellipse cx="110" cy="142" rx="23" ry="4" fill="#566b61" stroke="none" />
      <path d="M110 143c1-29-7-47 0-74m0 57 20-22m-23 5L87 89" stroke="#849c79" strokeWidth="3" fill="none" />
      <path d="M109 111c-28 3-35-14-34-34 21 0 34 9 34 34Z" fill={paint('leaf')} />
      <path d="M111 124c26 1 37-16 33-35-22 4-33 15-33 35Z" fill="#729980" />
      <path d="M110 88c-17-12-15-30-6-43 15 11 22 28 6 43Z" fill="#9fb48b" />
      <g className="plant-leaf"><path d="M109 101c4-26 21-34 37-31-2 21-15 33-37 31Z" fill={paint('leaf')} /><path d="m112 98 25-21" fill="none" stroke="#cbd4a0" strokeWidth="1" /></g>
      <path d="m105 107-22-23m32 35 23-22m-28-17-6-27" stroke="#bed0a4" strokeWidth="1" fill="none" />
      <path d="m96 153 3 16m23-17-2 21" stroke="#e0ae85" strokeWidth="2" opacity=".6" />
      <path d="M101 182h19" stroke="#b67758" strokeWidth="2" />
    </g>;
    case 'music-box': return <g className="artifact-music-box">
      <path d="m55 136 57 21 57-24-1 32-56 24-56-21Z" fill={paint('wood')} />
      <path d="m55 136 57-23 57 20-57 24Z" fill="#d5bc9b" />
      <path d="m66 136 46-17 45 15-45 18Z" fill="#51484e" />
      <path d="m58 131-5-49 56-22 7 51" fill="#bda2b6" />
      <path d="m58 124-4-42 55-21 5 44Z" fill="#cbb4c5" />
      <path d="m63 112-2-26 41-16 5 30Z" fill={paint('glass')} stroke="#e0bf7f" strokeWidth="2" />
      <path d="m69 89 24-10m-20 20 26-11" stroke="#e3d2b1" strokeWidth="1" opacity=".3" />
      <path d="m80 84 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1Z" fill="#efcd8d" stroke="#7b7471" strokeWidth="1"/><circle cx="95" cy="77" r="2" fill="#efcd8d" stroke="none"/><path d="m73 157 23 8m34-1 23-10" stroke="#d3b580" strokeWidth="1" />
      <g className="music-turn"><ellipse cx="115" cy="135" rx="18" ry="6" fill="#d1b77b" /><path d="M115 132V102m-8 9c4-6 13-6 17 0" stroke="#caaa70" strokeWidth="2" fill="none" /><path d="m115 91 3 7 8 1-6 5 1 8-6-4-7 4 2-8-6-5 8-1Z" fill="#e4c788" stroke="#a38353" strokeWidth="1" /></g>
      <path d="m169 146 9 4v9l-7 3" fill="none" stroke="#d0aa6f" strokeWidth="3" />
      <path d="M66 174v7m91-9v6" stroke="#6c4b3f" strokeWidth="5" />
      <path d="m107 167 5 2 5-2v9l-5 2-5-2Z" fill="#d2b277" strokeWidth="1" />
    </g>;
    case 'canvas': return <g className="artifact-canvas">
      <path d="m89 87-19 99m62-99 20 99m-43-47 1 47" stroke="#8e654d" strokeWidth="6" fill="none" />
      <path d="m65 70 87-12 2 91-87 12Z" fill="#b69061" />
      <path d="m70 75 76-11 1 79-75 11Z" fill={paint('paper')} />
      <g className="canvas-paint" stroke="none"><path d="M73 116c11-30 20-8 32-24 10-14 20-7 41-16l1 59-74 10Z" fill="#b3c2ba" opacity=".7" /><path d="M74 131c20-13 28-34 40-22s18-9 32-14v46l-73 10Z" fill="#698d91" opacity=".65" /><path d="M74 141c15-12 23-7 38-9 11-2 15-12 24-12l10 15v7l-73 10Z" fill="#9eab91" /><circle cx="129" cy="84" r="9" fill="#d9ba7c" opacity=".8" /><path d="m74 153 71-11-5-9-31 3-15 10Z" fill="#dfceb0" opacity=".8" /></g>
      <path d="m66 164 91-13" stroke="#bd9767" strokeWidth="6" />
      <path d="m70 73 1 73m77-78 3 77" stroke="#e4c99c" strokeWidth="1" opacity=".8" />
      <path d="m77 89 7-2m-7 8 5-1" stroke="#fff0ce" strokeWidth="2"/><path d="m160 169 9-32 3 1-8 32" fill="#a98459" strokeWidth="1" /><path d="m169 136 2-12 4 2-3 12" fill="#668c89" strokeWidth="1" />
    </g>;
  }
}
