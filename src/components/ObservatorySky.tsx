import type { CSSProperties } from 'react';
import type { ObservatorySkyState } from '../hooks/useObservatorySky';
import { codePointLength } from '../model/validation';

function starPosition(index: number, mobile: boolean) {
  const columns = mobile ? 3 : 5;
  const column = index % columns;
  const row = Math.floor(index / columns);
  const jitter = [0, -8, 10, -4, 6][index % 5];
  return { x: (mobile ? 16 + column * 34 : 12 + column * 19) + [0, 1.5, -1.5][row % 3], y: 70 + row * 94 + jitter };
}

export function ObservatorySky({ sky, onCreate }: { sky: ObservatorySkyState; onCreate: () => void }) {
  const desktopHeight = Math.max(330, Math.ceil(sky.stars.length / 5) * 94 + 100);
  const mobileHeight = Math.max(330, Math.ceil(sky.stars.length / 3) * 94 + 100);
  const positions = new Map(sky.stars.map((star, index) => [star.id, { desktop: starPosition(index, false), mobile: starPosition(index, true) }]));
  const title = (id: string) => sky.stars.find(star => star.id === id)?.title || 'An unavailable beginning';
  const visibleEdges = sky.map.edges.filter(edge => positions.has(edge.a) && positions.has(edge.b));
  const connectedIds = new Set(visibleEdges.flatMap(edge => [edge.a, edge.b]));
  const from = sky.stars.find(star => star.id === sky.fromId);
  const to = sky.stars.find(star => star.id === sky.toId);
  const groupLabel = sky.group?.names.length ? sky.group.names.map(name => name.text).join(' · ') : 'An unnamed constellation';
  function findStar(id: string) {
    sky.chooseStar(id);
    requestAnimationFrame(() => {
      const target = document.querySelector<HTMLButtonElement>(`[data-star="${id}"]`);
      target?.focus({ preventScroll:true });
      target?.scrollIntoView({ block:'nearest', inline:'nearest', behavior:'instant' });
    });
  }

  return <section className="observatory-universe" aria-labelledby="universe-title">
    <header className="universe-heading"><span className="sky-kicker">A personal atlas · drawn by you</span><h3 id="universe-title">Every beginning becomes a star.</h3><p>Your Main Hall exhibits, in another light. Choose a star to read its title; connect only the ideas you want to bring together.</p></header>
    {(sky.warning || sky.dirty) && <div className="sky-warning" role="status"><p>{sky.warning || 'This open sky has changes that are not saved yet. Retry saving to keep them for another visit.'}</p><div>{sky.dirty && <button className="text-button" onClick={sky.retry}>Retry saving sky</button>}<button className="text-button" onClick={sky.recheck}>Check saved sky</button></div></div>}
    <div className="universe-layout">
      <div className="sky-chart">
        <div className="sky-chart-caption"><span>YOUR LITTLE UNIVERSE</span><span aria-hidden="true">☾</span></div>
        <div className="sky-viewport" tabIndex={0} aria-label="Star map; scroll to explore all beginnings">
          <div className={`star-field ${sky.fromId ? 'is-connecting' : ''}`} style={{ '--sky-desktop-height': `${desktopHeight}px`, '--sky-mobile-height': `${mobileHeight}px` } as CSSProperties}>
            <div className="sky-dust" aria-hidden="true"/>
            {[false, true].map(mobile => <svg key={String(mobile)} className={`sky-threads ${mobile ? 'mobile-sky-threads' : 'desktop-sky-threads'}`} viewBox={`0 0 100 ${mobile ? mobileHeight : desktopHeight}`} preserveAspectRatio="none" aria-hidden="true">
              {visibleEdges.map(edge => {
                const a = positions.get(edge.a)![mobile ? 'mobile' : 'desktop'];
                const b = positions.get(edge.b)![mobile ? 'mobile' : 'desktop'];
                return <path key={edge.id} data-thread={edge.id} className={sky.recentThread === edge.id ? 'thread-arriving' : ''} d={`M${a.x} ${a.y} Q${(a.x + b.x) / 2} ${(a.y + b.y) / 2 - 10} ${b.x} ${b.y}`} vectorEffect="non-scaling-stroke"/>;
              })}
            </svg>)}
            {sky.stars.map((star, index) => {
              const point = positions.get(star.id)!;
              return <button key={star.id} className={`exhibit-star ${connectedIds.has(star.id) ? 'star-connected' : ''} ${sky.fromId === star.id ? 'thread-origin' : ''}`} data-star={star.id} style={{ '--star-x': `${point.desktop.x}%`, '--star-y': `${point.desktop.y}px`, '--star-mobile-x': `${point.mobile.x}%`, '--star-mobile-y': `${point.mobile.y}px`, '--star-delay': `${index % 4}s` } as CSSProperties} aria-label={`Star: ${star.title}`} aria-pressed={sky.selected?.id === star.id} onClick={() => sky.chooseStar(star.id)}>
                <svg viewBox="0 0 44 44" aria-hidden="true"><circle className="star-halo" cx="22" cy="22" r="20"/><path d="m22 8 3.5 10.5L36 22l-10.5 3.5L22 36l-3.5-10.5L8 22l10.5-3.5Z"/><circle cx="22" cy="22" r="3"/></svg><span className="star-title">{star.title}</span>
              </button>;
            })}
            {!sky.stars.length && <div className="empty-sky"><span aria-hidden="true">✧</span><p>A little sky, waiting for your first beginning.</p><button className="primary-button" onClick={onCreate}>Create your first star <span aria-hidden="true">↗</span></button><small>It begins as an exhibit in the Main Hall.</small></div>}
          </div>
        </div>
        <p className="sky-map-note">Stars shine with or without a thread. Your museum lights stay as you left them.</p>
        {sky.stars.length > 0 && <details className="star-index"><summary>Find a beginning <span>{sky.stars.length} {sky.stars.length === 1 ? 'star' : 'stars'}</span></summary><div>{sky.stars.map(star => <button className="text-button" key={star.id} onClick={() => findStar(star.id)} aria-label={`Find star: ${star.title}`}>{star.title}</button>)}</div></details>}
      </div>
      <aside className="star-letter" aria-label="Selected beginning and constellation">
        <span className="star-letter-corner" aria-hidden="true">✧</span>
        {sky.selected ? <>
          <span className="sky-kicker">A beginning you kept</span><h4 className="selected-star-title" aria-live="polite">{sky.selected.title}</h4>
          <p className="star-provenance">{sky.selectedSaved ? 'From your Main Hall collection.' : 'A temporary exhibit. Its star stays for this visit until the exhibit is saved.'}</p>
          {!sky.fromId ? <><button className="primary-button" disabled={sky.stars.length < 2} onClick={sky.beginThread}>Connect to another star</button>{sky.stars.length < 2 && <p className="sky-help">A second exhibit gives this star a companion to connect to. It is welcome here on its own.</p>}</> : <div className="thread-choice">
            <span className="sky-kicker">A thread, only if you choose</span><p><strong>{from?.title}</strong><span aria-hidden="true">↔</span><strong>{to?.title || 'Choose another star in the map or index'}</strong></p>
            {sky.alreadyConnected && <p className="sky-help">These stars already share a thread.</p>}
            <button className="primary-button" onClick={sky.connect} disabled={!sky.pair || sky.alreadyConnected}>Tie a golden thread</button><button className="text-button" onClick={sky.cancelThread}>Cancel connection</button>
          </div>}
          {sky.group && <div className="constellation-name-panel"><span className="sky-kicker">These connected beginnings</span><h5>{groupLabel}</h5>
            {sky.group.names.length > 1 && <p className="sky-help">This joined constellation keeps both names. Saving a name below replaces them with your chosen words.</p>}
            <form onSubmit={event => {event.preventDefault(); sky.saveName();}}><label htmlFor="constellation-name">Name this constellation <span>(optional)</span></label><input id="constellation-name" value={sky.nameValue} onChange={event => sky.changeName(event.target.value)} aria-describedby="constellation-name-help" aria-invalid={!!sky.nameError}/><div id="constellation-name-help" className="sky-name-help"><span>{sky.nameError || 'Your words alone. Leave blank to keep it unnamed.'}</span><span>{codePointLength(sky.nameValue)} / 100</span></div><button className="text-button" type="submit" disabled={!!sky.nameError}>Keep constellation name</button></form>
            {sky.groupDrafts.filter(([anchor]) => anchor !== sky.activeNameAnchor).map(([anchor, words]) => <div className="other-open-name" key={anchor}><p>Another name you were writing is still here: <span>{words || '(unnamed)'}</span></p><button className="text-button" onClick={() => sky.useOtherName(anchor)}>Use these words</button></div>)}
            <details className="thread-index"><summary>Threads in this constellation</summary><ul>{sky.group.edges.map(edge => <li key={edge.id}><span>{title(edge.a)} <span aria-hidden="true">↔</span> {title(edge.b)}</span><button className="text-button" aria-label={`Untie thread: ${title(edge.a)} and ${title(edge.b)}`} onClick={() => sky.removeThread(edge.id)}>Untie</button></li>)}</ul><p className="sky-help">Untying leaves both stars in the sky. Names stay with the star selected when each name was kept.</p></details>
          </div>}
        </> : <div className="unselected-star"><span aria-hidden="true">☾</span><h4>Things once imagined.</h4><p>Each star is an exhibit you gave a place to exist. Choose one; its own words will meet you here.</p><small>No right shapes. No suggested meanings.</small></div>}
      </aside>
    </div>
    {sky.groups.length > 0 && <nav className="constellation-index" aria-label="Your constellations"><span className="sky-kicker">The shapes you chose</span>{sky.groups.map((group, index) => <button key={group.id} aria-label={`Select constellation ${index + 1}: ${group.names.map(name => name.text).join(' · ') || 'Unnamed constellation'}`} aria-pressed={sky.group?.id === group.id} onClick={() => sky.chooseStar(group.starIds[0])}><span aria-hidden="true">✦</span><span>{group.names.map(name => name.text).join(' · ') || 'Unnamed constellation'}</span></button>)}</nav>}
    <div className="sky-save-state" aria-live="polite" role="status">{sky.message || (sky.dirty ? 'This sky has changes that are not saved yet.' : sky.stars.length ? 'Connections and names are kept in this browser when saving is available.' : 'No shapes to finish. No names required.')}</div>
    {sky.missingThreads && <p className="sky-help sky-missing">Some saved threads belong to exhibits this browser cannot currently show. Their saved connections and names have been left untouched.</p>}
  </section>;
}
