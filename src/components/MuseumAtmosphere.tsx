import { useId } from 'react';

/** Original paper-cut room scenery. Decorative only: the real shelf buttons sit above it. */
export function MuseumAtmosphere() {
  const id = useId().replace(/:/g, '');
  return <svg className="room-illustration" viewBox="0 0 1120 630" aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMid meet">
    <defs>
      <linearGradient id={`${id}-wall`} x2=".6" y2="1"><stop stopColor="#36544f"/><stop offset="1" stopColor="#456458"/></linearGradient>
      <linearGradient id={`${id}-night`} x2="0" y2="1"><stop stopColor="#263653"/><stop offset="1" stopColor="#797b98"/></linearGradient>
      <linearGradient id={`${id}-wood`} x2="0" y2="1"><stop stopColor="#bc8b64"/><stop offset=".5" stopColor="#a77553"/><stop offset="1" stopColor="#7c5945"/></linearGradient>
      <radialGradient id={`${id}-lamp`}><stop stopColor="#ffe1a2" stopOpacity=".32"/><stop offset="1" stopColor="#ffe1a2" stopOpacity="0"/></radialGradient>
      <pattern id={`${id}-wallpaper`} width="42" height="42" patternUnits="userSpaceOnUse"><path d="M21 7v6m-3-3h6M3 30h2m32-2v3" stroke="#b9c3a0" opacity=".15" strokeWidth="1.5" strokeLinecap="round"/></pattern>
    </defs>
    <path d="M61 106Q55 43 150 43L957 30Q1068 27 1072 123L1080 548Q1069 598 1002 603L108 602Q39 591 42 534Z" fill="#081d2a" opacity=".5" transform="translate(0 14)"/>
    <path d="M63 98Q62 40 150 42L957 27Q1061 29 1065 119L1074 539Q1067 586 1002 590L109 590Q48 580 49 529Z" fill="#bd9872" stroke="#9a785c" strokeWidth="3"/>
    <path d="M77 105Q76 58 154 58L951 43Q1045 46 1049 123L1057 500 66 516Z" fill={`url(#${id}-wall)`}/>
    <path d="M77 105Q76 58 154 58L951 43Q1045 46 1049 123L1057 500 66 516Z" fill={`url(#${id}-wallpaper)`}/>
    <path d="M67 481 1057 470 1059 541Q1056 568 1002 574L110 575Q67 567 66 533Z" fill="#926e52"/>
    <g stroke="#654f41" opacity=".65" strokeWidth="2"><path d="m68 509 990-11M69 540l985-10M130 481l-35 93M310 479l-15 95M481 478l4 97M656 476l20 98M828 474l44 99M991 471l55 90"/></g>
    <path d="m69 479 986-12 2 11-990 14Z" fill="#d0a375"/><path d="m69 492 988-12" stroke="#614e3c" strokeWidth="3"/>
    {/* A moon window, with imperfect little panes. */}
    <g transform="translate(183 106) rotate(-3 71 105)">
      <path d="M0 202V79Q-1-7 75-5 153-3 151 80v122Z" fill="#b99676" stroke="#263d40" strokeWidth="5"/>
      <path d="M13 187V79Q12 9 75 10q64 0 62 69v108Z" fill={`url(#${id}-night)`}/>
      <path d="M35 160q43-24 101 1v26H13v-9Z" fill="#52677a"/>
      <path d="M13 182q70-28 124 1v4H13Z" fill="#354c63"/>
      <path d="M100 40a21 21 0 1 0 13 36 22 22 0 0 1-13-36Z" fill="#f8dda0"/>
      <g fill="#e9dfbd"><circle cx="37" cy="58" r="2"/><circle cx="73" cy="30" r="1.5"/><circle cx="121" cy="104" r="1.5"/><path d="m44 111 2 5 5 2-5 2-2 5-2-5-5-2 5-2Z"/></g>
      <path d="M75 12v175M13 105h124" stroke="#c1a17c" strokeWidth="6"/>
      <path d="M-9 199h170v12H-9Z" fill="#c39a70" stroke="#755b49" strokeWidth="2"/>
    </g>
    {/* A pocket doorway and a hanging brass bell. */}
    <g transform="translate(83 302) rotate(-2)"><path d="M0 165V55Q0 0 44 0t43 55v110Z" fill="#263e3b" stroke="#a48163" strokeWidth="7"/><path d="M11 165V57Q12 17 43 16t33 41v108Z" fill="#304a43"/><path d="M44 18v144M20 58v100M66 57v102" stroke="#54705a" strokeWidth="2"/><circle cx="67" cy="107" r="4" fill="#e4bc7f"/><path d="M12 34h64" stroke="#a48667" strokeWidth="3"/></g>
    <g transform="translate(121 264)"><path d="m0 0 4 18" stroke="#d2ac70" strokeWidth="2"/><path d="M-5 28q0-16 9-14t9 14Z" fill="#d2ac70"/><circle cx="4" cy="30" r="2" fill="#e8c990"/></g>
    {/* Slightly crooked moon-chart and a quiet room sign. */}
    <g transform="translate(378 105) rotate(6)"><path d="M0 0h85v103H0Z" fill="#a47a5a" stroke="#674c40" strokeWidth="3"/><path d="M8 8h69v87H8Z" fill="#d5c6a3"/><circle cx="41" cy="40" r="20" fill="none" stroke="#728380"/><path d="m24 78 10-17 14 8 16-24" fill="none" stroke="#8f917f"/><g fill="#b09366"><circle cx="24" cy="78" r="2"/><circle cx="34" cy="61" r="2"/><circle cx="48" cy="69" r="2"/><circle cx="64" cy="45" r="2"/></g></g>
    <path d="m542 86 114-9M561 80l-3-15m76 10 3-16" stroke="#b49b72" strokeWidth="1.5"/>
    <g fill="#e5c68d" opacity=".8"><path d="m596 75 3 9 10 1-8 6 2 10-8-6-9 5 3-10-7-7 10 1Z"/><circle cx="527" cy="126" r="2"/><circle cx="1009" cy="117" r="2"/></g>
    {/* Cabinet drawers: never fake saved exhibits. */}
    <g transform="translate(558 420)"><path d="m0 0 451-5 8 102-466 3Z" fill={`url(#${id}-wood)`} stroke="#634d3e" strokeWidth="3"/><path d="M-12-9 462-14l3 18-479 8Z" fill="#c19971" stroke="#70513e" strokeWidth="2"/>
      {[0,1,2].map(i => <g key={i} transform={`translate(${i * 146 + 10} 16)`}><path d="m0 0 126-2 1 70-127 2Z" fill="#a57d59" stroke="#74563f" strokeWidth="2"/><path d="m5 6 115-1v57L5 65Z" fill="none" stroke="#c59b7080"/><ellipse cx="64" cy="34" rx="9" ry="4" fill="#d4b47e" stroke="#70523b"/><path d="M64 34v6" stroke="#70523b"/></g>)}
      <path d="M12 104v17m431-20v17" stroke="#72533e" strokeWidth="12"/>
      <path d="m378 35 4 9 10 1-7 7 1 10-9-5-8 5 1-10-7-7 10-1Z" fill="#e7c67e" transform="rotate(10 377 48)"/>
    </g>
    {/* Rug, desk, notebooks and lantern pool. */}
    <ellipse cx="399" cy="531" rx="181" ry="32" fill="#314844" opacity=".35"/>
    <ellipse cx="393" cy="526" rx="169" ry="28" fill="#af807d" stroke="#d5a598" strokeWidth="4"/>
    <ellipse cx="393" cy="526" rx="145" ry="19" fill="none" stroke="#e1b8a0" strokeWidth="2" strokeDasharray="4 7"/>
    <path d="m238 469 182-7 9 17-194 7Z" fill="#d0aa80" stroke="#765841" strokeWidth="3"/><path d="m250 483-5 63m166-68 9 59" stroke="#916d4d" strokeWidth="13"/><path d="m260 508 141-5" stroke="#916d4d" strokeWidth="5"/>
    <g transform="translate(278 440) rotate(-6)"><path d="M0 0h55v31H0Z" fill="#859282" stroke="#5b6b60" strokeWidth="2"/><path d="M6-4h50v30H6Z" fill="#ecddbc" stroke="#ad9771" strokeWidth="1.5"/><path d="M14 4h31m-31 6h24m-24 6h29" stroke="#bba783" strokeWidth="1.5"/></g>
    <circle cx="421" cy="381" r="102" fill={`url(#${id}-lamp)`}/>
    <g transform="translate(414 389) rotate(4)"><path d="m0 5 8 55m-22 0h40" stroke="#c2a577" strokeWidth="5" strokeLinecap="round"/><path d="M-21 9q0-32 23-37 24 6 26 38Z" fill="#edcc85" stroke="#ab8657" strokeWidth="2"/><path d="M-10 6h26" stroke="#fae4ad" strokeWidth="3"/></g>
    <g transform="translate(477 464) rotate(8)"><path d="M0 0h21v28H0Z" fill="#bba6ba" stroke="#736e7f" strokeWidth="2"/><path d="M21 4q16 0 10 15l-10 2" fill="none" stroke="#bba6ba" strokeWidth="4"/><path d="m6-4 3-5m5 5 1-6" stroke="#c3beaa" strokeWidth="1.5" opacity=".6"/></g>
    {/* Empty frame, little leaned books, and a star jar are room furnishings. */}
    <g transform="translate(893 91) rotate(-5)"><path d="M0 0h91v61H0Z" fill="#ba9271" stroke="#755d4b" strokeWidth="2"/><path d="M7 7h77v47H7Z" fill="#405954"/><path d="m38 19 3 9 9 1-7 6 2 9-8-5-8 5 2-10-7-6 10-1Z" fill="#b8b397" opacity=".7"/></g>
    <g transform="translate(953 388)"><path d="M0 0h10v30H0Z" fill="#a38eaa" stroke="#5a5c65" strokeWidth="2"/><path d="m15-3 11-3 10 32-10 3Z" fill="#d6ad89" stroke="#716255" strokeWidth="2"/><path d="M2 5h6m10-3 8-2" stroke="#ead5ac" strokeWidth="2"/></g>
    <g transform="translate(735 99)"><path d="M0 11h25l4 38q-18 10-33 0Z" fill="#97adb138" stroke="#9fb5af" strokeWidth="2"/><path d="M-1 6h28v7H-1Z" fill="#b9a27b"/><path d="m12 24 2 5 6 1-4 3 1 6-5-3-5 3 1-6-4-3 6-1Z" fill="#e8cd8b"/><path d="M5 43h4" stroke="#d7dfca" strokeWidth="1.5"/></g>
    <path d="M99 568q122 10 193 7m609-20q74 10 121-8" stroke="#d0aa7b" strokeWidth="2" opacity=".4" fill="none"/>
  </svg>;
}
