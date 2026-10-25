import { useId } from 'react';

/** Original, layered storybook architecture. All interactive objects live in the HTML scene. */
export function MuseumAtmosphere() {
  const id = `hall-${useId().replace(/:/g, '')}`;
  const paint = (name: string) => `url(#${id}-${name})`;
  return <svg className="room-illustration" viewBox="0 0 1600 1000" aria-hidden="true" focusable="false" preserveAspectRatio="xMinYMid slice">
    <defs>
      <linearGradient id={`${id}-wall`} x1="0" y1="0" x2="0" y2="1"><stop stopColor="#263f43"/><stop offset=".48" stopColor="#496553"/><stop offset="1" stopColor="#354e47"/></linearGradient>
      <linearGradient id={`${id}-side`} x1="0" x2="1"><stop stopColor="#162e36"/><stop offset="1" stopColor="#3e594d"/></linearGradient>
      <linearGradient id={`${id}-night`} x1="0" y1="0" x2="0" y2="1"><stop stopColor="#182641"/><stop offset=".6" stopColor="#444d70"/><stop offset="1" stopColor="#8a879b"/></linearGradient>
      <linearGradient id={`${id}-floor`} x1="0" y1="0" x2="0" y2="1"><stop stopColor="#7c6147"/><stop offset=".35" stopColor="#ac825e"/><stop offset="1" stopColor="#775238"/></linearGradient>
      <linearGradient id={`${id}-brass`} x1="0" x2="1"><stop stopColor="#8c7251"/><stop offset=".45" stopColor="#dfc28a"/><stop offset="1" stopColor="#a18559"/></linearGradient>
      <linearGradient id={`${id}-corridor`} x1="0" x2="1"><stop stopColor="#172e33"/><stop offset="1" stopColor="#0d202b"/></linearGradient>
      <linearGradient id={`${id}-beam`} x1="0" y1="0" x2=".6" y2="1"><stop stopColor="#b7c9e0" stopOpacity=".18"/><stop offset="1" stopColor="#b7c9e0" stopOpacity="0"/></linearGradient>
      <radialGradient id={`${id}-warm`}><stop stopColor="#ffdaa0" stopOpacity=".38"/><stop offset=".55" stopColor="#f1d094" stopOpacity=".1"/><stop offset="1" stopColor="#e6c48a" stopOpacity="0"/></radialGradient>
      <radialGradient id={`${id}-floorlight`}><stop stopColor="#d8b583" stopOpacity=".35"/><stop offset="1" stopColor="#d8b583" stopOpacity="0"/></radialGradient>
      <pattern id={`${id}-wallpaper`} width="54" height="65" patternUnits="userSpaceOnUse"><path d="M27 12v7m-3-3h6M0 49v5m-2-3h4" stroke="#d8d4a8" strokeWidth="1.2" opacity=".065"/></pattern>
      <pattern id={`${id}-woodgrain`} width="110" height="23" patternUnits="userSpaceOnUse"><path d="M3 7q29-3 58 0t46-1M23 16q34-2 66 1" stroke="#e0b687" opacity=".08" fill="none"/></pattern>
      <clipPath id={`${id}-window-left`}><path d="M156 546V265q0-125 86-125t86 125v281Z"/></clipPath>
      <clipPath id={`${id}-window-right`}><path d="M360 546V265q0-125 86-125t86 125v281Z"/></clipPath>
    </defs>

    {/* Background: a high vaulted hall, with a glimpse of the museum beyond. */}
    <path d="M0 0h1600v1000H0Z" fill={paint('wall')}/>
    <path d="M0 0h1600v650H0Z" fill={paint('wallpaper')}/>
    <path d="M0 0h1600v62Q800-64 0 77Z" fill="#122b34" opacity=".65"/>
    <path d="M0 70q800-90 1600-4v29Q800 15 0 105Z" fill="#627260"/>
    <path d="M0 99q800-91 1600-8" fill="none" stroke="#b9a57a" strokeWidth="3" opacity=".6"/>
    <path d="M0 111q800-85 1600-9" fill="none" stroke="#1d373a" strokeWidth="12"/>
    <path d="M0 0 97 103l20 547L0 820Z" fill={paint('side')}/>
    <path d="M0 24 95 112l10 515L0 757Z" fill="none" stroke="#77816a" strokeWidth="4" opacity=".4"/>
    <path d="M1510 92 1600 0v1000l-120-352Z" fill="#213c3e"/>
    <path d="M1486 650V352q0-118 73-118t73 118v398Z" fill="#8e8466"/>
    <path d="M1500 650V355q0-105 61-105t61 105v340Z" fill={paint('corridor')}/>
    <path d="M1542 651V390q0-64 37-64t37 64v291Z" fill="none" stroke="#4e6053" strokeWidth="8"/>
    <path d="m1510 630 90 20v122l-116-122Z" fill="#5b5948"/>
    <path d="m1511 647 89 41m-89-64 89 26" fill="none" stroke="#a8936a" strokeWidth="2" opacity=".35"/>
    <ellipse cx="1578" cy="427" rx="61" ry="106" fill={paint('warm')}/>
    <path d="M1578 373v26" stroke="#a79067" strokeWidth="2"/><path d="m1570 399 16-1 3 25-20 1Z" fill="#d3b17d"/><path d="M1576 403h6v16h-6Z" fill="#f7d693"/>

    {/* The moonlit alcove: tall paired windows, thick surrounds and a deep sill. */}
    <path d="M112 594V257q0-170 231-170t231 170v337Z" fill="#263f42" stroke="#68765e" strokeWidth="7"/>
    <path d="M133 578V260q0-147 210-147t210 147v318Z" fill="#314c49"/>
    {[['left',156,242],['right',360,446]].map(([name, x, center]) => <g key={name}>
      <path d={`M${x} 546V265q0-125 86-125t86 125v281Z`} fill={paint('night')} stroke="#b69b75" strokeWidth="11"/>
      <g clipPath={`url(#${id}-window-${name})`}>
        <path d={`M${Number(x)-5} 502q49-39 99-5t99-12v79H${x}Z`} fill="#606c83"/>
        <path d={`M${Number(x)-8} 526q74-32 115-6t80-3v42H${x}Z`} fill="#40586d"/>
        <path d={`M${Number(x)+12} 540q70-23 150-3v18H${x}Z`} fill="#2d485d"/>
        <g fill="#e4dfc5"><circle cx={Number(x)+29} cy="257" r="2.5"/><circle cx={Number(x)+129} cy="310" r="2"/><circle cx={Number(x)+112} cy="203" r="1.8"/><circle cx={Number(x)+43} cy="422" r="1.5"/><path d={`m${Number(x)+126} 383 2 7 7 2-7 2-2 7-2-7-7-2 7-2Z`}/></g>
      </g>
      <path d={`M${center} 149v391M${Number(x)+3} 332h166M${Number(x)+3} 451h166`} stroke="#b7a07c" strokeWidth="7"/>
      <path d={`M${Number(x)-13} 547h198v20H${Number(x)-13}Z`} fill="#b99670" stroke="#6c6651" strokeWidth="3"/>
      <path d={`M${Number(x)-8} 566h190l-7 14H${Number(x)-2}Z`} fill="#786b52"/>
    </g>)}
    <path d="M490 215a35 35 0 1 0 19 57 37 37 0 0 1-19-57Z" fill="#f4db9e"/>
    <path d="M166 549h358l350 425H331Z" fill={paint('beam')}/>
    <path d="M211 556h36l170 290h-71Z" fill="#ced7de" opacity=".035"/>

    {/* Recesses, wainscot and distant empty frames leave the real collection uncluttered. */}
    <path d="M602 181q383-23 803-3v439H602Z" fill="#324d45" opacity=".6" stroke="#72816a" strokeWidth="2"/>
    <path d="M616 194q385-20 774-2v414H616Z" fill="none" stroke="#182f33" strokeWidth="3" opacity=".45"/>
    <path d="M600 618h808v18H600Z" fill="#6d775d"/><path d="M600 637h808v13H600Z" fill="#203b39"/>
    <path d="M108 598h476v51H108Z" fill="#2d4741"/>
    {[135,245,355,465].map(x => <path key={x} d={`M${x} 610h83v30h-83Z`} fill="none" stroke="#758064" strokeWidth="2" opacity=".5"/>)}
    <path d="M109 649h1378v15H109Z" fill="#bd9c71"/><path d="M109 664h1378v10H109Z" fill="#493f34"/>
    <g transform="translate(1390 298) rotate(2)"><path d="M0 0h65v91H0Z" fill="#294341" stroke="#ad9470" strokeWidth="6"/><path d="M8 9h49v73H8Z" fill="none" stroke="#7d8769" strokeWidth="1.5"/><path d="m30 39 3 9 9 3-9 3-3 9-3-9-9-3 9-3Z" fill="none" stroke="#baac7c" strokeWidth="1.5" opacity=".7"/></g>
    <g transform="translate(1338 103)"><path d="M0 0v80l24-15 24 15V0Z" fill="#ad8280" stroke="#c7a191" strokeWidth="2"/><path d="m22 18 3 10 10 3-10 3-3 10-3-10-10-3 10-3Z" fill="#e1c294"/><path d="M-7 0h62" stroke="#b79d73" strokeWidth="5" strokeLinecap="round"/></g>

    {/* Soft hanging lantern pools mark the height without competing with the exhibits. */}
    {[{x:665,y:118},{x:1240,y:115}].map(({x,y}) => <g key={x} transform={`translate(${x} ${y})`}>
      <ellipse cy="41" rx="120" ry="132" fill={paint('warm')}/>
      <path d="M0-100V0m-15 18q0-13 15-13t15 13" fill="none" stroke="#9c8a61" strokeWidth="3"/>
      <path d="m-19 18 38-1 5 52-47 1Z" fill="#d0b57b" stroke="#806d50" strokeWidth="3"/><path d="M-12 25h24l3 36h-30Z" fill="#f3d89b"/>
      <path d="M0 24v38m-22 5h45M-19 20h38" stroke="#a18a5c" strokeWidth="3"/><path d="m0 33 5 11-5 10-5-10Z" fill="#fff1c6"/>
    </g>)}

    {/* Foreground: converging floorboards, reflected moonlight and a worn welcome rug. */}
    <path d="M109 674h1377l114 326H0Z" fill={paint('floor')}/>
    <path d="M109 674h1377l114 326H0Z" fill={paint('woodgrain')}/>
    <g stroke="#4c4033" strokeWidth="2" opacity=".45" fill="none">
      <path d="M109 674 0 847m254-173L60 1000m331-326L260 1000m267-326-67 326m203-326-3 326m139-326 64 326m73-326 131 326m5-326 198 326m-62-326 265 326m-129-326 206 218"/>
      <path d="M99 702h1398M83 748h1430M58 815h1478M28 905h1540"/>
      <path d="m211 702-8 46m409 0-1 66m409-112 8 46m-591 67-11 89m772-90 26 90"/>
    </g>
    <g stroke="#dfb584" strokeWidth="1" opacity=".13" fill="none"><path d="M173 677 25 997m445-318-94 318m563-319 102 319m-895-241h241m334 64h309m-457 89h242m-116-217h229"/></g>
    <ellipse cx="720" cy="837" rx="598" ry="178" fill={paint('floorlight')}/>
    <path d="m579 775 534-2 149 151-826 4Z" fill="#30443c" opacity=".35"/>
    <path d="m592 770 508-2 137 143-780 3Z" fill="#8b6c70" stroke="#bd9890" strokeWidth="4"/>
    <path d="m608 785 473-2 106 110-686 3Z" fill="none" stroke="#d6b59c" strokeWidth="2" opacity=".65"/>
    <path d="m622 797 441-1 78 82-592 2Z" fill="none" stroke="#b39288" strokeWidth="2" strokeDasharray="5 9"/>
    <path d="m826 817 10 12 25 3-21 8 2 15-17-10-18 10 4-15-20-7 25-4Z" fill="#c9a88e" opacity=".38"/>
    <g stroke="#c8a594" strokeWidth="2" opacity=".65"><path d="m470 921-9 12m35-13-8 13m36-13-7 12m35-12-6 12m38-13-5 13m38-13-4 12m39-13-3 13m39-13-2 13m40-13-1 13m40-13v13m40-13 1 13m39-13 2 13m39-13 3 13m39-13 4 13m39-13 5 13m38-13 6 13m38-13 7 13m37-13 8 13m37-13 9 13m35-13 10 13"/></g>
    {/* Near pillars frame a space extending past the browser, rather than a boxed panel. */}
    <path d="M0 113 39 140l16 680L0 907Z" fill="#173139"/><path d="M20 143 31 782" stroke="#758069" strokeWidth="4" opacity=".4"/>
    <path d="m1579 107 21-15v908h-32Z" fill="#142e35"/><path d="M1581 156v692" stroke="#7d8064" strokeWidth="3" opacity=".35"/>
    <ellipse cx="275" cy="933" rx="254" ry="49" fill="#152c2c" opacity=".17"/>
  </svg>;
}
