export type ColdWarMedalDatum = {
  year: number;
  city: string;
  usaGold: number;
  sovietOrRussiaGold: number | null;
  era: "ussr" | "russia";
};

export const coldWarMedalData: ColdWarMedalDatum[] = [
  { year: 1952, city: "Helsinki", usaGold: 22, sovietOrRussiaGold: 22, era: "ussr" },
  { year: 1956, city: "Melbourne", usaGold: 17, sovietOrRussiaGold: 22, era: "ussr" },
  { year: 1960, city: "Rome", usaGold: 34, sovietOrRussiaGold: 43, era: "ussr" },
  { year: 1964, city: "Tokyo", usaGold: 36, sovietOrRussiaGold: 30, era: "ussr" },
  { year: 1968, city: "Mexico City", usaGold: 45, sovietOrRussiaGold: 29, era: "ussr" },
  { year: 1972, city: "Munich", usaGold: 33, sovietOrRussiaGold: 50, era: "ussr" },
  { year: 1976, city: "Montreal", usaGold: 34, sovietOrRussiaGold: 49, era: "ussr" },
  { year: 1980, city: "Moscow", usaGold: 6, sovietOrRussiaGold: 80, era: "ussr" },
  { year: 1984, city: "Los Angeles", usaGold: 83, sovietOrRussiaGold: 6, era: "ussr" },
  { year: 1988, city: "Seoul", usaGold: 36, sovietOrRussiaGold: 55, era: "ussr" },
  { year: 1996, city: "Atlanta", usaGold: 44, sovietOrRussiaGold: 26, era: "russia" },
  { year: 2000, city: "Sydney", usaGold: 37, sovietOrRussiaGold: 32, era: "russia" },
  { year: 2004, city: "Athens", usaGold: 36, sovietOrRussiaGold: 27, era: "russia" },
  { year: 2008, city: "Beijing", usaGold: 36, sovietOrRussiaGold: 23, era: "russia" },
  { year: 2012, city: "London", usaGold: 46, sovietOrRussiaGold: 24, era: "russia" },
  { year: 2016, city: "Rio de Janeiro", usaGold: 46, sovietOrRussiaGold: 19, era: "russia" },
  { year: 2020, city: "Tokyo", usaGold: 39, sovietOrRussiaGold: null, era: "russia" },
];
