export type LostSportColorToken = "--ring-blue" | "--ring-green" | "--ring-red" | "--ring-yellow";

export type LostSportNarrativeEraKey = "paris-1900" | "1908-1924" | "1928-1952" | "1956-2012";

export type LostSportEraKey = "all" | LostSportNarrativeEraKey;

export type LostSportMedalShare = {
  country: string;
  pct: number;
};

export type LostSport = {
  id: string;
  sport: string;
  years: string;
  first: number;
  last: number;
  editions: number;
  dominant: string;
  dominance: number;
  medals: readonly LostSportMedalShare[];
  disappeared: string;
  fact: string;
  color: LostSportColorToken;
  iconKey: string;
  era: LostSportNarrativeEraKey;
};

export type LostSportEra = {
  key: LostSportEraKey;
  label: string;
  years: string;
  description: string;
  totalCount: number;
  featuredCount: number;
};

export const lostSports = [
  {
    id: "cricket",
    sport: "Cricket",
    years: "1900",
    first: 1900,
    last: 1900,
    editions: 1,
    dominant: "GBR",
    dominance: 65,
    medals: [
      { country: "GBR", pct: 65 },
      { country: "FRA", pct: 35 },
    ],
    disappeared: "Never returned after Paris. Too British for a global Games.",
    fact: "The only Olympic cricket match ever played lasted two days.",
    color: "--ring-blue",
    iconKey: "cricket",
    era: "paris-1900",
  },
  {
    id: "croquet",
    sport: "Croquet",
    years: "1900",
    first: 1900,
    last: 1900,
    editions: 1,
    dominant: "FRA",
    dominance: 100,
    medals: [{ country: "FRA", pct: 100 }],
    disappeared: "France won every medal. The sport was never invited back.",
    fact: "All competitors were French. The only 'international' event with zero international competition.",
    color: "--ring-green",
    iconKey: "croquet",
    era: "paris-1900",
  },
  {
    id: "motorboating",
    sport: "Motorboating",
    years: "1908",
    first: 1908,
    last: 1908,
    editions: 1,
    dominant: "GBR",
    dominance: 86,
    medals: [
      { country: "GBR", pct: 86 },
      { country: "FRA", pct: 14 },
    ],
    disappeared: "Weather conditions cancelled most races. The IOC quietly removed it.",
    fact: "Competed in the Solent, off the Isle of Wight. Most races were abandoned due to fog.",
    color: "--ring-red",
    iconKey: "motorboating",
    era: "1908-1924",
  },
  {
    id: "racquets",
    sport: "Racquets",
    years: "1908",
    first: 1908,
    last: 1908,
    editions: 1,
    dominant: "GBR",
    dominance: 100,
    medals: [{ country: "GBR", pct: 100 }],
    disappeared: "A precursor to squash, played only in England. Never exported.",
    fact: "All 7 competitors were British. The sport barely existed outside of London clubs.",
    color: "--ring-blue",
    iconKey: "racquets",
    era: "1908-1924",
  },
  {
    id: "tug-of-war",
    sport: "Tug-Of-War",
    years: "1900-1920",
    first: 1900,
    last: 1920,
    editions: 5,
    dominant: "GBR",
    dominance: 42,
    medals: [
      { country: "GBR", pct: 42 },
      { country: "USA", pct: 28 },
      { country: "NED", pct: 18 },
      { country: "BEL", pct: 12 },
    ],
    disappeared: "Dropped in 1920 as the Games modernised. Still has a World Championship.",
    fact: "In 1900, a combined team of Danish and Swedish athletes won gold as a unified Scandinavian squad.",
    color: "--ring-yellow",
    iconKey: "tug-of-war",
    era: "1908-1924",
  },
  {
    id: "rugby",
    sport: "Rugby",
    years: "1900-1924",
    first: 1900,
    last: 1924,
    editions: 4,
    dominant: "FRA",
    dominance: 30,
    medals: [
      { country: "FRA", pct: 30 },
      { country: "USA", pct: 22 },
      { country: "GBR", pct: 15 },
      { country: "ANZ", pct: 15 },
    ],
    disappeared: "Dropped in 1924 due to lack of international participation. Returned as Rugby Sevens in 2016.",
    fact: "The USA is the reigning Olympic Rugby champion - they won gold in 1924 and it was never contested again.",
    color: "--ring-red",
    iconKey: "rugby",
    era: "1908-1924",
  },
  {
    id: "polo",
    sport: "Polo",
    years: "1900-1936",
    first: 1900,
    last: 1936,
    editions: 5,
    dominant: "GBR",
    dominance: 46,
    medals: [
      { country: "GBR", pct: 46 },
      { country: "USA", pct: 17 },
      { country: "ARG", pct: 14 },
      { country: "MEX", pct: 11 },
    ],
    disappeared: "Too expensive. Too elitist. Too few countries could compete.",
    fact: "Argentina's team in 1936 included four brothers from the Andrada family competing simultaneously.",
    color: "--ring-yellow",
    iconKey: "polo",
    era: "1928-1952",
  },
  {
    id: "basque-pelota",
    sport: "Basque Pelota",
    years: "1900",
    first: 1900,
    last: 1900,
    editions: 1,
    dominant: "ESP",
    dominance: 100,
    medals: [{ country: "ESP", pct: 100 }],
    disappeared: "Spain won everything. The sport was never added to the permanent programme.",
    fact: "Spain holds 100% of all Olympic Basque Pelota medals. The only country ever to compete.",
    color: "--ring-red",
    iconKey: "basque-pelota",
    era: "paris-1900",
  },
  {
    id: "jeu-de-paume",
    sport: "Jeu De Paume",
    years: "1908",
    first: 1908,
    last: 1908,
    editions: 1,
    dominant: "GBR",
    dominance: 67,
    medals: [
      { country: "GBR", pct: 67 },
      { country: "USA", pct: 33 },
    ],
    disappeared: "The ancient precursor to tennis. Had fewer than 50 practitioners worldwide by 1908.",
    fact: "Real tennis - played indoors on an asymmetric court - is one of the oldest racket sports in existence.",
    color: "--ring-blue",
    iconKey: "jeu-de-paume",
    era: "1908-1924",
  },
  {
    id: "art-competitions",
    sport: "Art Competitions",
    years: "1912-1952",
    first: 1912,
    last: 1952,
    editions: 6,
    dominant: "ITA",
    dominance: 18,
    medals: [
      { country: "ITA", pct: 18 },
      { country: "GER", pct: 15 },
      { country: "FRA", pct: 13 },
      { country: "HUN", pct: 12 },
    ],
    disappeared: "Removed when the IOC ruled that professional artists could not compete in an amateur Games.",
    fact: "Athletes could win gold medals for painting, sculpture, architecture, and music - all inspired by sport.",
    color: "--ring-green",
    iconKey: "art-competitions",
    era: "1928-1952",
  },
  {
    id: "firefighting",
    sport: "Firefighting",
    years: "1900",
    first: 1900,
    last: 1900,
    editions: 1,
    dominant: "FRA",
    dominance: 100,
    medals: [{ country: "FRA", pct: 100 }],
    disappeared: "Held as a demonstration event at Paris 1900. Never returned.",
    fact: "Firemen competed in teams racing to extinguish fires. Possibly the most practical Olympic event ever held.",
    color: "--ring-red",
    iconKey: "firefighting",
    era: "paris-1900",
  },
  {
    id: "softball",
    sport: "Softball",
    years: "1996-2008",
    first: 1996,
    last: 2008,
    editions: 4,
    dominant: "USA",
    dominance: 33,
    medals: [
      { country: "USA", pct: 33 },
      { country: "AUS", pct: 27 },
      { country: "JPN", pct: 27 },
    ],
    disappeared: "Removed in 2005 by IOC vote. Too American. Returned for Tokyo 2020 as a one-off.",
    fact: "The USA won gold in every edition it was contested - 1996, 2000, 2004. Then it disappeared.",
    color: "--ring-blue",
    iconKey: "softball",
    era: "1956-2012",
  },
] as const satisfies readonly LostSport[];

const lostSportsFeaturedCounts = lostSports.reduce<Record<LostSportNarrativeEraKey, number>>(
  (counts, sport) => {
    counts[sport.era] += 1;
    return counts;
  },
  {
    "paris-1900": 0,
    "1908-1924": 0,
    "1928-1952": 0,
    "1956-2012": 0,
  },
);

const lostSportsFeaturedYears = lostSports.map((sport) => sport.last);

export const lostSportsEras = [
  {
    key: "all",
    label: "ALL",
    years: "1900-2012",
    description: "All sports removed from the Olympic programme since 1900.",
    totalCount: 32,
    featuredCount: lostSports.length,
  },
  {
    key: "paris-1900",
    label: "PARIS 1900",
    years: "1900",
    description: "Single-edition curiosities and early Olympic experiments from Paris 1900.",
    totalCount: 12,
    featuredCount: lostSportsFeaturedCounts["paris-1900"],
  },
  {
    key: "1908-1924",
    label: "1908-1924",
    years: "1908-1924",
    description: "Sports dropped as the Games moved away from regional club traditions.",
    totalCount: 9,
    featuredCount: lostSportsFeaturedCounts["1908-1924"],
  },
  {
    key: "1928-1952",
    label: "1928-1952",
    years: "1928-1952",
    description: "Interwar and postwar removals shaped by cost, professionalisation, and format shifts.",
    totalCount: 8,
    featuredCount: lostSportsFeaturedCounts["1928-1952"],
  },
  {
    key: "1956-2012",
    label: "1956-2012",
    years: "1956-2012",
    description: "Recent removals decided by broadcast logic, lobbying power, and IOC voting cycles.",
    totalCount: 3,
    featuredCount: lostSportsFeaturedCounts["1956-2012"],
  },
] as const satisfies readonly LostSportEra[];

export const lostSportsSummary = {
  featuredSportCount: lostSports.length,
  totalRemovedSports: lostSportsEras[0].totalCount,
  editorialEraCount: lostSportsEras.length - 1,
  firstFeaturedYear: Math.min(...lostSports.map((sport) => sport.first)),
  lastFeaturedYear: Math.max(...lostSportsFeaturedYears),
} as const;

export const lostSportsStoryMeta = {
  currentSliceId: "LS-06",
  currentSliceTitle: "Lifecycle bars and inline icons",
  currentSliceDescription: "Barras de vida SVG e iconos inline por deporte",
} as const;

export const lostSportsHero = {
  number: "03 / LOST SPORTS",
  titleTop: "FORGOTTEN",
  titleBottom: "BY THE GAMES",
  impactValue: String(lostSportsSummary.totalRemovedSports),
  impactLines: [
    "sports removed from",
    "the Olympic programme",
    "since 1900.",
  ],
  subLines: [
    "Some for good reasons.",
    "Some for no reason at all.",
  ],
  ctaLabel: "SCROLL TO DISCOVER",
} as const;

export const lostSportsIntro = [
  "The Olympic programme is not permanent.",
  "Since the first modern Games in Athens 1896, 32 sports have been added - and quietly removed.",
  "Some lasted a single afternoon. Some lasted decades. All of them were, briefly, Olympic.",
] as const;