/** Rooms are presentation destinations; exhibit records keep their existing schema. */
export const MUSEUM_ROOMS = [
  { id: 'hall', name: 'Hall of Beginnings', shortName: 'Main Hall', symbol: '☾' },
  { id: 'conservatory', name: 'Moonseed Conservatory', shortName: 'Conservatory', symbol: '❀' },
  { id: 'observatory', name: 'Pocket-Sky Observatory', shortName: 'Observatory', symbol: '✧' },
] as const;
export type MuseumRoom = typeof MUSEUM_ROOMS[number]['id'];
