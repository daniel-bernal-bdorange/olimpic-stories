export type ColdWarMedalDatum = {
  year: number;
  city: string;
  usaGold: number;
  rivalGold: number | null;
  era: "ussr" | "post";
  boycott: "usa" | "ussr" | null;
};

export const coldWarMedalData: ColdWarMedalDatum[] = [
  { year: 1952, city: "Helsinki", usaGold: 22, rivalGold: 22, era: "ussr", boycott: null },
  { year: 1956, city: "Melbourne", usaGold: 17, rivalGold: 22, era: "ussr", boycott: null },
  { year: 1960, city: "Rome", usaGold: 18, rivalGold: 25, era: "ussr", boycott: null },
  { year: 1964, city: "Tokyo", usaGold: 18, rivalGold: 20, era: "ussr", boycott: null },
  { year: 1968, city: "Mexico City", usaGold: 23, rivalGold: 17, era: "ussr", boycott: null },
  { year: 1972, city: "Munich", usaGold: 18, rivalGold: 29, era: "ussr", boycott: null },
  { year: 1976, city: "Montreal", usaGold: 18, rivalGold: 31, era: "ussr", boycott: null },
  { year: 1980, city: "Moscow", usaGold: 6, rivalGold: 45, era: "ussr", boycott: "usa" },
  { year: 1984, city: "Los Angeles", usaGold: 44, rivalGold: 6, era: "ussr", boycott: "ussr" },
  { year: 1988, city: "Seoul", usaGold: 19, rivalGold: 33, era: "ussr", boycott: null },
  { year: 1996, city: "Atlanta", usaGold: 44, rivalGold: 26, era: "post", boycott: null },
  { year: 2000, city: "Sydney", usaGold: 37, rivalGold: 32, era: "post", boycott: null },
  { year: 2004, city: "Athens", usaGold: 36, rivalGold: 28, era: "post", boycott: null },
  { year: 2008, city: "Beijing", usaGold: 36, rivalGold: 24, era: "post", boycott: null },
  { year: 2012, city: "London", usaGold: 48, rivalGold: 18, era: "post", boycott: null },
  { year: 2016, city: "Rio de Janeiro", usaGold: 46, rivalGold: 19, era: "post", boycott: null },
  { year: 2020, city: "Tokyo", usaGold: 39, rivalGold: null, era: "post", boycott: null },
];
