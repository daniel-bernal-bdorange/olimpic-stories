export type MedalType = "gold" | "silver" | "bronze";

export type AthleteCategory = "equestrian" | "sailing" | "shooting" | "other";

export type OlympicSeason = "summer" | "winter";

export type Athlete = {
  id: string;
  name: string;
  country: string;
  sport: string;
  season: OlympicSeason;
  category: AthleteCategory;
  editions: number;
  span: number;
  years: number[];
  medals: Array<{
    year: number;
    type: MedalType;
    event: string;
  }>;
  bio: string;
  note: string;
  photo: string;
};

export const olympicYears = [
  1948, 1952, 1956, 1960, 1964, 1968, 1972, 1976, 1980,
  1984, 1988, 1992, 1994, 1996, 1998, 2000, 2002, 2004,
  2006, 2008, 2010, 2012, 2014, 2016, 2018, 2020, 2022,
] as const;

export const winterOlympicYears = new Set([1994, 1998, 2002, 2006, 2010, 2014, 2018, 2022]);

const olympicHostsBySeason: Record<OlympicSeason, Record<number, string>> = {
  summer: {
    1948: "London",
    1952: "Helsinki",
    1956: "Melbourne",
    1960: "Rome",
    1964: "Tokyo",
    1968: "Mexico City",
    1972: "Munich",
    1976: "Montreal",
    1980: "Moscow",
    1984: "Los Angeles",
    1988: "Seoul",
    1992: "Barcelona",
    1996: "Atlanta",
    2000: "Sydney",
    2004: "Athens",
    2008: "Beijing",
    2012: "London",
    2016: "Rio de Janeiro",
    2020: "Tokyo",
  },
  winter: {
    1992: "Albertville",
    1994: "Lillehammer",
    1998: "Nagano",
    2002: "Salt Lake City",
    2006: "Turin",
    2010: "Vancouver",
    2014: "Sochi",
    2018: "PyeongChang",
    2022: "Beijing",
  },
};

export function getOlympicHostCity(year: number, season: OlympicSeason): string {
  return olympicHostsBySeason[season][year] ?? "Host city";
}

export const athletes: Athlete[] = [
  {
    id: "ian-millar",
    name: "Ian Millar",
    country: "CAN",
    sport: "Equestrian Jumping",
    season: "summer",
    category: "equestrian",
    editions: 10,
    span: 40,
    years: [1972, 1976, 1984, 1988, 1992, 1996, 2000, 2004, 2008, 2012],
    medals: [{ year: 2008, type: "silver", event: "Team, Open" }],
    bio: "The most decorated Olympic equestrian career in history. Ian Millar competed for Canada across five decades, missing only Moscow 1980 due to the boycott. He was 65 years old at his final Games in London 2012.",
    note: "Missed 1980. Canada boycotted the Moscow Games.",
    photo: "/images/one-life/athletes/ian-millar.webp",
  },
  {
    id: "hubert-raudaschl",
    name: "Hubert Raudaschl",
    country: "AUT",
    sport: "Sailing",
    season: "summer",
    category: "sailing",
    editions: 9,
    span: 32,
    years: [1964, 1968, 1972, 1976, 1980, 1984, 1988, 1992, 1996],
    medals: [
      { year: 1968, type: "silver", event: "One Person Dinghy, Open" },
      { year: 1980, type: "silver", event: "Two Person Keelboat, Open" },
    ],
    bio: "Nine consecutive Olympic Games from Tokyo 1964 to Atlanta 1996. The Austrian sailor competed through boycotts, political storms, and three decades of changing equipment.",
    note: "Competed in both the 1980 and 1984 boycott Games.",
    photo: "/images/one-life/athletes/hubert-raudaschl.webp",
  },
  {
    id: "afanasijs-kuzmins",
    name: "Afanasijs Kuzmins",
    country: "LAT",
    sport: "Shooting",
    season: "summer",
    category: "shooting",
    editions: 9,
    span: 36,
    years: [1976, 1980, 1988, 1992, 1996, 2000, 2004, 2008, 2012],
    medals: [
      { year: 1988, type: "gold", event: "Rapid-Fire Pistol, 25m, Men" },
      { year: 1992, type: "silver", event: "Rapid-Fire Pistol, 25m, Men" },
    ],
    bio: "Competed first for the Soviet Union, then as an independent after Latvia regained independence. His career spans the Cold War, its end, and the birth of a new nation.",
    note: "Competed as USSR, then as independent Latvia.",
    photo: "/images/one-life/athletes/afanasijs-kuzmins.webp",
  },
  {
    id: "nino-salukvadze",
    name: "Nino Salukvadze",
    country: "GEO",
    sport: "Shooting",
    season: "summer",
    category: "shooting",
    editions: 9,
    span: 32,
    years: [1988, 1992, 1996, 2000, 2004, 2008, 2012, 2016, 2020],
    medals: [
      { year: 1988, type: "gold", event: "Sporting Pistol, 25m, Women" },
      { year: 1988, type: "silver", event: "Air Pistol, 10m, Women" },
      { year: 2008, type: "bronze", event: "Air Pistol, 10m, Women" },
    ],
    bio: "Two medals in Seoul 1988 at age 17. A bronze in Beijing 2008 twenty years later. Nino Salukvadze is the only woman in Olympic history to win medals in four different decades.",
    note: "At Tokyo 2020, she carried Georgia's flag at the Opening Ceremony.",
    photo: "/images/one-life/athletes/nino-salukvadze.webp",
  },
  {
    id: "josefa-idem-guerrini",
    name: "Josefa Idem-Guerrini",
    country: "ITA",
    sport: "Canoe Sprint",
    season: "summer",
    category: "other",
    editions: 8,
    span: 28,
    years: [1984, 1988, 1992, 1996, 2000, 2004, 2008, 2012],
    medals: [
      { year: 1984, type: "bronze", event: "Kayak Doubles, 500m, Women" },
      { year: 1996, type: "bronze", event: "Kayak Singles, 500m, Women" },
      { year: 2000, type: "gold", event: "Kayak Singles, 500m, Women" },
      { year: 2004, type: "silver", event: "Kayak Singles, 500m, Women" },
      { year: 2008, type: "silver", event: "Kayak Singles, 500m, Women" },
    ],
    bio: "Born in Germany, she later competed for Italy and collected five Olympic medals across 24 years. Her gold in Sydney 2000 came 16 years after her first Olympic appearance.",
    note: "Competed for West Germany, then Italy.",
    photo: "/images/one-life/athletes/josefa-idem-guerrini.webp",
  },
  {
    id: "andrew-hoy",
    name: "Andrew Hoy",
    country: "AUS",
    sport: "Equestrian Eventing",
    season: "summer",
    category: "equestrian",
    editions: 8,
    span: 36,
    years: [1984, 1988, 1992, 1996, 2000, 2004, 2012, 2020],
    medals: [
      { year: 1992, type: "gold", event: "Team, Open" },
      { year: 1996, type: "gold", event: "Team, Open" },
      { year: 2000, type: "gold", event: "Team, Open" },
      { year: 2000, type: "silver", event: "Individual, Open" },
      { year: 2020, type: "silver", event: "Team, Open" },
      { year: 2020, type: "bronze", event: "Individual, Open" },
    ],
    bio: "Three consecutive team golds from 1992 to 2000. Then a 16-year gap, a comeback at 62, and two more medals in Tokyo 2020.",
    note: "Returned from retirement for Tokyo 2020 aged 62.",
    photo: "/images/one-life/athletes/andrew-hoy.webp",
  },
  {
    id: "paul-elvstrom",
    name: "Paul Elvstrom",
    country: "DEN",
    sport: "Sailing",
    season: "summer",
    category: "sailing",
    editions: 8,
    span: 40,
    years: [1948, 1952, 1956, 1960, 1968, 1972, 1984, 1988],
    medals: [
      { year: 1948, type: "gold", event: "One Person Dinghy, Open" },
      { year: 1952, type: "gold", event: "One Person Dinghy, Open" },
      { year: 1956, type: "gold", event: "One Person Dinghy, Open" },
      { year: 1960, type: "gold", event: "One Person Dinghy, Open" },
    ],
    bio: "Four consecutive gold medals from London 1948 to Rome 1960. Then retirement, a long absence, and two more Games in 1984 and 1988, competing alongside his daughter Trine.",
    note: "Competed with his daughter Trine in Los Angeles 1984 and Seoul 1988.",
    photo: "/images/one-life/athletes/paul-elvstrom.webp",
  },
  {
    id: "oksana-chusovitina",
    name: "Oksana Chusovitina",
    country: "UZB",
    sport: "Artistic Gymnastics",
    season: "summer",
    category: "other",
    editions: 8,
    span: 28,
    years: [1992, 1996, 2000, 2004, 2008, 2012, 2016, 2020],
    medals: [
      { year: 1992, type: "gold", event: "Team All-Around, Women" },
      { year: 2008, type: "silver", event: "Horse Vault, Women" },
    ],
    bio: "At Tokyo 2020, Oksana Chusovitina competed in artistic gymnastics at age 46, in an event dominated by teenagers. Her first Olympic gold came in 1992.",
    note: "Competed for USSR, Uzbekistan and Germany across her Olympic life.",
    photo: "/images/one-life/athletes/oksana-chusovitina.webp",
  },
  {
    id: "claudia-pechstein",
    name: "Claudia Pechstein",
    country: "GER",
    sport: "Speed Skating",
    season: "winter",
    category: "other",
    editions: 8,
    span: 30,
    years: [1992, 1994, 1998, 2002, 2006, 2014, 2018, 2022],
    medals: [
      { year: 1992, type: "bronze", event: "5,000m, Women" },
      { year: 1994, type: "gold", event: "5,000m, Women" },
      { year: 1994, type: "bronze", event: "3,000m, Women" },
      { year: 1998, type: "gold", event: "5,000m, Women" },
      { year: 1998, type: "silver", event: "3,000m, Women" },
      { year: 2002, type: "gold", event: "3,000m, Women" },
      { year: 2002, type: "gold", event: "5,000m, Women" },
      { year: 2006, type: "gold", event: "Team Pursuit, Women" },
      { year: 2006, type: "silver", event: "5,000m, Women" },
    ],
    bio: "Nine Olympic medals across four decades. After a disputed suspension, she returned at 42 for PyeongChang 2018 and again at 50 for Beijing 2022.",
    note: "The oldest German Winter Olympian ever at Beijing 2022.",
    photo: "/images/one-life/athletes/claudia-pechstein.webp",
  },
  {
    id: "jesus-angel-garcia",
    name: "Jesús Ángel García",
    country: "ESP",
    sport: "Athletics",
    season: "summer",
    category: "other",
    editions: 8,
    span: 28,
    years: [1992, 1996, 2000, 2004, 2008, 2012, 2016, 2020],
    medals: [],
    bio: "Eight consecutive Olympic Games in race walking. Zero medals. From Barcelona 1992 to Tokyo 2020, his Olympic life stretched across 28 years without ever leaving the circuit.",
    note: "He opened at his home Games in Barcelona and closed at age 51 in Tokyo.",
    photo: "/images/one-life/athletes/jesus-angel-garcia.webp",
  },
];

export const categoryLabels: Record<"all" | AthleteCategory, string> = {
  all: "All",
  equestrian: "Equestrian",
  sailing: "Sailing",
  shooting: "Shooting",
  other: "Other",
};

export const categoryPills = ["all", "equestrian", "sailing", "shooting", "other"] as const;

export const introCopy = [
  "Some athletes come for one Games and never return.",
  "These ones never left.",
  "Each line is a life stretched across Olympic cycles.",
  "Hover or focus a point to see the city, the athlete, and the outcome of that return.",
];