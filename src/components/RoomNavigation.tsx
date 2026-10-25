import { MUSEUM_ROOMS, type MuseumRoom } from '../model/rooms';

export function RoomNavigation({ current, onChange, disabled = false }: { current: MuseumRoom; onChange: (room: MuseumRoom) => void; disabled?: boolean }) {
  return <nav className="room-navigation" aria-label="Museum rooms"><span className="signpost-caption">A little further inside</span><div className="room-signposts">{MUSEUM_ROOMS.map(room => <button key={room.id} aria-label={`Visit ${room.name}`} aria-current={current === room.id ? 'page' : undefined} disabled={disabled} onClick={() => onChange(room.id)}><span aria-hidden="true">{room.symbol}</span><span>{room.shortName}</span><span className="signpost-arrow" aria-hidden="true">{current === room.id ? '•' : '→'}</span></button>)}</div></nav>;
}
