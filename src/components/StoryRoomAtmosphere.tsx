import { useId } from 'react';

type StoryRoom = 'conservatory' | 'observatory';

/** Original SVG architecture. Room discoveries are separate, accessible HTML buttons. */
export function StoryRoomAtmosphere({ room }: { room: StoryRoom }) {
  const id = `story-${useId().replace(/:/g, '')}`;
  const paint = (name: string) => `url(#${id}-${name})`;
  const garden = room === 'conservatory';
  return <svg className={`story-room-architecture architecture-${room}`} viewBox="0 0 1600 1000" preserveAspectRatio="xMinYMid slice" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id={`${id}-glass`} x1="0" x2=".2" y2="1"><stop stopColor="#183f4b"/><stop offset=".55" stopColor="#6c9691"/><stop offset="1" stopColor="#a1b4a0"/></linearGradient>
      <linearGradient id={`${id}-gardenfloor`} x1="0" x2="0" y2="1"><stop stopColor="#b9917a"/><stop offset="1" stopColor="#875f51"/></linearGradient>
      <linearGradient id={`${id}-wood`} x1="0" x2="0" y2="1"><stop stopColor="#c7a77e"/><stop offset="1" stopColor="#8f7658"/></linearGradient>
      <linearGradient id={`${id}-dome`} x1="0" x2=".2" y2="1"><stop stopColor="#252944"/><stop offset=".45" stopColor="#4b4567"/><stop offset="1" stopColor="#645874"/></linearGradient>
      <linearGradient id={`${id}-night`} x1="0" x2=".2" y2="1"><stop stopColor="#14253f"/><stop offset=".7" stopColor="#3d4d73"/><stop offset="1" stopColor="#9090a4"/></linearGradient>
      <linearGradient id={`${id}-observatoryfloor`} x1="0" x2="0" y2="1"><stop stopColor="#8c757c"/><stop offset="1" stopColor="#554c65"/></linearGradient>
      <radialGradient id={`${id}-lantern`}><stop stopColor="#ffe2a7" stopOpacity=".5"/><stop offset=".5" stopColor="#f0d39d" stopOpacity=".15"/><stop offset="1" stopColor="#e5c58b" stopOpacity="0"/></radialGradient>
      <radialGradient id={`${id}-moonlight`}><stop stopColor="#dae7df" stopOpacity=".2"/><stop offset="1" stopColor="#dae7df" stopOpacity="0"/></radialGradient>
      <pattern id={`${id}-tinytiles`} width="90" height="90" patternUnits="userSpaceOnUse"><path d="m45 22 4 16 16 7-16 5-4 17-5-17-17-5 17-7Z" fill="#e3d8b2" opacity=".07"/></pattern>
      <clipPath id={`${id}-roundwindow`}><circle cx="355" cy="368" r="204"/></clipPath>
    </defs>
    {garden ? <>
      {/* A glasshouse with curved ribs: a different building inside the same museum. */}
      <path d="M0 0h1600v1000H0Z" fill="#466e64"/>
      <path d="M55 660V263Q67 32 796 15q736 15 749 248v397Z" fill={paint('glass')}/>
      <path d="M62 270Q800-10 1538 270V109Q798-88 62 116Z" fill="#2d5861" opacity=".72"/>
      <path d="M62 263Q800-8 1539 263M64 340q737-129 1474 0" fill="none" stroke="#b2bba0" strokeWidth="13"/>
      <path d="M66 265Q120 44 798 16q685 29 740 249M390 657V190Q493 58 798 16M800 657V18m406 639V190Q1100 58 798 16M66 453h1472M66 605h1472" fill="none" stroke="#a1b29a" strokeWidth="12"/>
      <path d="M81 266Q125 66 797 33q657 25 725 234M407 660V193M817 660V32m405 628V193" fill="none" stroke="#c8cbb0" strokeWidth="2" opacity=".65"/>
      <path d="M105 599q59-87 121-18t120-7q51-89 97-5 62-82 115 16 53-57 105 4 55-72 118 4 56-69 117-12 75-100 133-3 41-45 95 6 71-80 135-3 66-63 128 1 72-86 149-23v90H105Z" fill="#628b7b" opacity=".55"/>
      <path d="M332 131a47 47 0 1 0 34 77 49 49 0 0 1-34-77Z" fill="#f3e4ba"/>
      <g fill="#e2e7cf" opacity=".8"><circle cx="189" cy="221" r="3"/><circle cx="478" cy="130" r="2.5"/><circle cx="633" cy="285" r="2"/><circle cx="1006" cy="123" r="2.5"/><circle cx="1408" cy="229" r="2"/><path d="m1170 284 2 8 8 3-8 2-2 8-3-8-8-2 8-3Z"/></g>
      <path d="M98 651h1404v31H98Z" fill="#a4b098" stroke="#355d52" strokeWidth="4"/>
      {/* Planter ledges leave the three central discovery positions open. */}
      <path d="m104 608 427-5 18 24-458 7Z" fill="#c2a57b" stroke="#65705a" strokeWidth="3"/>
      <path d="m122 634 389-5-9 58-374 2Z" fill="#7a8b6d"/>
      <path d="M1084 619h369l12 18h-389Z" fill="#c5aa80" stroke="#69715a" strokeWidth="3"/>
      <path d="m1105 638 327-1v60h-327Z" fill="#7c8e71"/>
      <path d="M1128 647v44m72-44v44m72-44v44m72-44v44m72-44v44" stroke="#a0ac88" strokeWidth="3"/>
      {/* Hanging greenery and empty pots suggest a patient, lived-in garden. */}
      {[{x:116,y:201},{x:1465,y:202}].map(({x,y}) => <g key={x} transform={`translate(${x} ${y})`}>
        <path d="M0-159V0m-26 9L0-20 28 9" stroke="#a8ac88" strokeWidth="3" fill="none"/>
        <path d="m-35 3 68 1-9 43-47-1Z" fill="#c59277" stroke="#6a6d51" strokeWidth="3"/>
        <path d="M-33 5h67" stroke="#e0b18b" strokeWidth="7"/>
        <g fill="#719574" stroke="#3e6d58" strokeWidth="2"><path d="M-11 0q-29-71-39-27 0 22 39 27Zm0 0q-6-79 17-52Q28-25-11 0Zm11 5q53-65 54-23Q50 9 0 5Z"/><path d="M-20 21q-31 42-15 86m52-81q26 49 9 95" fill="none"/><path d="M-35 61q-41-22-19 2 11 10 19-2Zm2 29q24-36 26-12-2 18-26 12Zm64-19q27-33 28-7-6 17-28 7Zm0 25q-36-25-23 2 9 12 23-2Z"/></g>
      </g>)}
      {[{x:584,y:113},{x:1015,y:117}].map(({x,y}) => <g key={x} transform={`translate(${x} ${y})`}>
        <circle cy="45" r="95" fill={paint('lantern')}/><path d="M0-100V8m-15 16q0-14 15-14t15 14" fill="none" stroke="#8d956d" strokeWidth="3"/>
        <path d="m-21 24 41-1 3 45-46 1Z" fill="#d6c087" stroke="#8f895f" strokeWidth="3"/><path d="M-13 30h26v32h-26Z" fill="#f6e3af"/><path d="M0 29v34m-20-37h39" stroke="#b19f6e" strokeWidth="3"/>
      </g>)}
      <g transform="translate(1377 579)"><path d="M-18 0h40l-5 31h-29Z" fill="#bb8d70" stroke="#776d50" strokeWidth="2"/><ellipse cy="-1" rx="22" ry="6" fill="#dac1a0"/><ellipse cy="-1" rx="16" ry="3" fill="#7c7658"/></g>
      {/* Curved terracotta tiles and low step establish a floor, not a panel. */}
      <path d="M0 682h1600v318H0Z" fill={paint('gardenfloor')}/>
      <path d="M0 682h1600v318H0Z" fill={paint('tinytiles')}/>
      <g fill="none" stroke="#665948" strokeWidth="2.5" opacity=".55"><path d="M0 719q800-44 1600 0M0 791q800-69 1600 0M0 898q800-91 1600 0M168 682 18 1000m360-318-94 318m308-318-34 318m250-318 29 318m189-318 91 318m126-318 151 318"/></g>
      <ellipse cx="755" cy="828" rx="550" ry="138" fill={paint('moonlight')}/>
      <path d="M561 818q223-47 459 0l83 91q-321-54-633 0Z" fill="#b5b598" stroke="#d1c9a5" strokeWidth="4" opacity=".7"/>
      <path d="m592 836 401-3m-416 19 438-4m-455 22 476-5" stroke="#7a9073" strokeWidth="2" opacity=".4"/>
      {/* Close leaves make a soft foreground frame. */}
      <g fill="#355e4d" stroke="#78916b" strokeWidth="3"><path d="M0 1000V803q36-95 68-51 25 41-18 86 106-80 113-20 5 52-99 73 94-15 80 40-10 43-90 42l15 27Z"/><path d="M1600 1000V793q-41-82-68-31-18 36 25 77-98-75-115-17-8 49 92 71-91-17-81 36 11 49 94 45l-16 26Z"/></g>
      <path d="M12 985q37-131 67-180m1505 181q-37-131-67-179" stroke="#9ba77c" strokeWidth="3" fill="none" opacity=".6"/>
    </> : <>
      {/* Curved plum dome and round porthole distinguish the quiet sky room. */}
      <path d="M0 0h1600v1000H0Z" fill={paint('dome')}/>
      <path d="M0 173Q799-164 1600 173v-173H0Z" fill="#202840"/>
      <path d="M0 171Q800-156 1600 171M0 251Q800-52 1600 251" fill="none" stroke="#a2969f" strokeWidth="8" opacity=".55"/>
      <path d="M0 258Q800-40 1600 258" fill="none" stroke="#d2bda4" strokeWidth="2" opacity=".45"/>
      <path d="M243 666Q78 355 800-20q720 369 554 686M799 0v662" fill="none" stroke="#8e8399" strokeWidth="7" opacity=".35"/>
      <g fill="#d6d1c8" opacity=".65">{[[151,122],[390,87],[621,114],[947,83],[1177,107],[1430,144],[687,240],[1018,294],[1457,350],[144,359],[605,418],[1100,447],[1305,375]].map(([x,y],i) => <circle key={i} cx={x} cy={y} r={i%3===0 ? 3 : 1.7}/>)}<path d="m806 95 3 10 10 3-10 3-3 10-3-10-10-3 10-3Zm541 183 2 8 8 2-8 2-2 8-2-8-8-2 8-2Z"/></g>
      <path d="m621 114 66 126 119-132 141-25 71 211 159-187" stroke="#b8acba" strokeWidth="1.5" opacity=".17" fill="none"/>
      <circle cx="355" cy="368" r="230" fill="#3c3b56" stroke="#b7a185" strokeWidth="12"/>
      <circle cx="355" cy="368" r="213" fill={paint('night')} stroke="#736d82" strokeWidth="4"/>
      <g clipPath={`url(#${id}-roundwindow)`}>
        <path d="M108 492q98-89 185-16t165-18q111-57 173 36v125H108Z" fill="#66708c"/>
        <path d="M109 526q163-58 268-11t238 0v97H109Z" fill="#405574"/>
        <path d="M254 248a48 48 0 1 0 34 79 49 49 0 0 1-34-79Z" fill="#eee0b8"/>
        <g fill="#dedecd"><circle cx="426" cy="239" r="3"/><circle cx="481" cy="335" r="2"/><circle cx="206" cy="388" r="2"/><circle cx="391" cy="421" r="2.5"/><path d="m347 304 3 11 11 3-11 3-3 11-3-11-11-3 11-3Z"/></g>
      </g>
      <path d="M355 158v420M145 368h420" stroke="#b39a80" strokeWidth="7"/>
      <circle cx="355" cy="368" r="224" fill="none" stroke="#dfc59d" strokeWidth="2" strokeDasharray="2 14"/>
      {/* A wraparound ledge, brass charts and a little high bookcase. */}
      <path d="M57 616q757 51 1490-1v35Q794 695 57 650Z" fill="#b49b80" stroke="#6c6170" strokeWidth="3"/>
      <path d="M63 651q739 45 1479-1v31H63Z" fill="#4c465d"/>
      <g transform="translate(1322 279) rotate(2)"><path d="M0 0h157v315H0Z" fill="#67566b" stroke="#a08778" strokeWidth="7"/><path d="M10 96h137M10 195h137" stroke="#c0a488" strokeWidth="7"/>
        {[0,1,2].map(row => <g key={row} transform={`translate(13 ${row*100+9})`}><path d="M0 8h18v72H0Zm24-4h17v76H24Zm23 9h20v67H47Zm26-9h18v76H73Z" fill={['#9a879a','#aaa58e','#a38b7b'][row]} stroke="#403f56" strokeWidth="2"/><path d="m99 15 16-4 15 67-16 4Z" fill="#b3a48b" stroke="#62566a" strokeWidth="2"/><path d="M4 22h10m13-2h11m14 11h12m13-10h10" stroke="#d6c4a5" strokeWidth="2"/></g>)}
      </g>
      <g transform="translate(1040 140) rotate(-3)"><path d="M0 0h172v116H0Z" fill="#4a465e" stroke="#b9a184" strokeWidth="5"/><ellipse cx="86" cy="58" rx="53" ry="33" fill="none" stroke="#c5b28f" strokeWidth="1.5"/><ellipse cx="86" cy="58" rx="22" ry="45" transform="rotate(35 86 58)" fill="none" stroke="#c5b28f" strokeWidth="1.5"/><circle cx="86" cy="58" r="6" fill="#d8bb83"/><path d="M18 18h24m86 80h25M86 12v9m0 74v9" stroke="#a99aa6" strokeWidth="2"/></g>
      <g transform="translate(715 174)"><path d="M0-145V-13" stroke="#bdab94" strokeWidth="2"/><ellipse rx="61" ry="18" fill="none" stroke="#c2b498" strokeWidth="3" transform="rotate(-16)"/><circle r="28" fill="#ae9aa8" stroke="#d2bbaa" strokeWidth="2"/><path d="M-26-6q26 13 53 0M-24 11q25 9 48 0" fill="none" stroke="#897d97" strokeWidth="3"/></g>
      <g transform="translate(1240 118)"><circle cy="30" r="100" fill={paint('lantern')}/><path d="M0-118V3m-15 17q0-16 15-16t15 16" fill="none" stroke="#b5a083" strokeWidth="3"/><path d="m-20 20 41-1 3 47-48 1Z" fill="#b99d7b" stroke="#786677" strokeWidth="3"/><path d="M-12 27h25v33h-25Z" fill="#f2d9a7"/><path d="M0 27v33" stroke="#b19875" strokeWidth="3"/></g>
      {/* A circular projection dais and radial floorboards create depth below. */}
      <path d="M0 682h1600v318H0Z" fill={paint('observatoryfloor')}/>
      <g stroke="#342f46" opacity=".4" strokeWidth="2" fill="none"><path d="M0 725q800 41 1600 0M0 801q800 53 1600 0M0 907q800 70 1600 0M193 682 16 1000m393-318-98 318m314-318-25 318m241-318 50 318m166-318 124 318m91-318 199 318"/></g>
      <ellipse cx="831" cy="831" rx="511" ry="127" fill="#36334d" stroke="#af9b96" strokeWidth="5"/>
      <ellipse cx="831" cy="825" rx="465" ry="107" fill="#4c4660" stroke="#c3ad98" strokeWidth="2"/>
      <ellipse cx="831" cy="824" rx="370" ry="83" fill="none" stroke="#a596a3" strokeWidth="1.5" strokeDasharray="5 12"/>
      <path d="M366 824h930m-465-103v207m-320-170 640 137m-641 0 640-137" stroke="#9b8d9e" strokeWidth="1.5" opacity=".35"/>
      <path d="m831 783 11 28 42 12-40 10-13 31-13-31-40-10 42-12Z" fill="#b7a294" opacity=".6"/>
      <g fill="#d8c39b" opacity=".7"><circle cx="550" cy="811" r="3"/><circle cx="735" cy="888" r="3"/><circle cx="1056" cy="826" r="3"/><circle cx="916" cy="757" r="2.5"/></g>
      {/* Lavender curtains occupy the near edge rather than outlining a card. */}
      <path d="M0 0q75 50 78 185t-17 271q-19 253 46 544H0Z" fill="#3e3652" stroke="#8e7890" strokeWidth="4"/>
      <path d="M28 0q63 317-4 670m37-187q-20 281 23 517" fill="none" stroke="#a3899d" strokeWidth="4" opacity=".3"/>
      <path d="M1600 0q-77 64-72 214t18 253q15 244-48 533h102Z" fill="#3e3652" stroke="#8e7890" strokeWidth="4"/>
      <path d="M1578 0q-53 328 2 648m-38-173q16 292-24 525" fill="none" stroke="#a3899d" strokeWidth="4" opacity=".3"/>
      <path d="m39 530 34-3m1459 2 33 6" stroke="#c5ae8b" strokeWidth="10" strokeLinecap="round"/>
    </>}
  </svg>;
}
