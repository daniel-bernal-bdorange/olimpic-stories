export type ColdWarMedalDatum = {
  year: number;
  city: string;
  usaGold: number;
  rivalGold: number | null;
  era: "ussr" | "post";
  boycott: "usa" | "ussr" | null;
};

export type SideChoice = "usa" | "ussr";

export type NarrativeBlock = {
  block: number;
  id: string;
  title: string;
  body: string[];
};

export type ChartPanelContent = {
  title: string;
  copy: string;
  meta: string;
  figureMeta: string;
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

export const narrativeText: Record<SideChoice, NarrativeBlock[]> = {
  usa: [
    {
      block: 1,
      id: "block-1",
      title: "THE SCOREBOARD THAT CHANGED HISTORY",
      body: [
        "For four decades, the Olympic medal table was not a sports ranking. It was a geopolitical weapon.",
        "Every gold medal the United States won was proof that democracy could outcompete any state machine. Every anthem played in a foreign stadium was a reminder of what America stood for.",
        "This is the story of how the world's greatest democracy fought the most watched battle of the Cold War - and what it cost.",
      ],
    },
    {
      block: 2,
      id: "block-2",
      title: "USSR PULLS AHEAD",
      body: [
        "Helsinki 1952. For the first time, Soviet athletes stepped onto an Olympic track. The United States had dominated the Games for half a century. That era was over.",
        "Through the 1960s and 1970s, America watched as the USSR built a state-funded athletic machine unlike anything seen before. The gap was growing. Something had to give.",
        "By Munich 1972, the score read 29 to 18. The United States was losing a war it had started.",
      ],
    },
    {
      block: 3,
      id: "block-3",
      title: "THE YEAR AMERICA HAD 6 GOLDS",
      body: [
        "On December 27, 1979, Soviet forces invaded Afghanistan. President Carter gave the order. 65 nations followed. The American team would not march in Moscow.",
        "It was the hardest decision American sport had ever faced. Hundreds of athletes - in their prime, prepared for years - were told their Games were over before they began.",
        "The result was brutal: 6 gold medals. The United States finished a Games it never attended.",
      ],
    },
    {
      block: 4,
      id: "block-4",
      title: "THE REVENGE THAT WASN'T",
      body: [
        "Four years after Moscow, Los Angeles opened its doors. The Soviet Union announced its boycott in May 1984. Thirteen allied nations followed.",
        "America understood the message immediately. It was the same message Carter had sent to Moscow.",
        "Without its greatest rival, the United States won 44 gold medals. The stadium was full. The competition was not. Every victory carried an asterisk neither side would acknowledge.",
      ],
    },
    {
      block: 5,
      id: "block-5",
      title: "AFTER THE WALL",
      body: [
        "On November 9, 1989, the Berlin Wall fell. The rival that had defined American sport for four decades would soon cease to exist.",
        "Atlanta 1996: the United States won 44 golds. Russia won 26. The gap that once threatened American dominance had reversed.",
        "The Cold War was over. The scoreboard finally agreed. America had not just outlasted its rival - it had watched it disappear.",
      ],
    },
  ],
  ussr: [
    {
      block: 1,
      id: "block-1",
      title: "THE SCOREBOARD THAT CHANGED HISTORY",
      body: [
        "For four decades, the Olympic medal table was not a sports ranking. It was a geopolitical weapon.",
        "Every gold medal the Soviet Union won was proof that a collective system could outperform individual ambition. Every podium was a demonstration that socialist sport was the future.",
        "This is the story of how the Soviet Union dominated the Olympic Games - and the price paid for that dominance.",
      ],
    },
    {
      block: 2,
      id: "block-2",
      title: "USSR PULLS AHEAD",
      body: [
        "Helsinki 1952. The Soviet Union arrived at the Olympics for the first time - and immediately changed everything.",
        "Decades of state investment, scientific training, and collective discipline had built the most formidable athletic system in history. Not for personal glory. For the nation.",
        "By Munich 1972, the proof was undeniable: 29 Soviet golds to 18 American. The system worked.",
      ],
    },
    {
      block: 3,
      id: "block-3",
      title: "THE YEAR AMERICA HAD 6 GOLDS",
      body: [
        "On December 27, 1979, Soviet forces entered Afghanistan. The United States called it an invasion. The Soviet Union called it a response to a request for assistance.",
        "When America announced its boycott, the Soviet athletic machine did not pause. The Games went ahead. 80 nations competed.",
        "The result: 45 gold medals. The greatest Soviet Olympic performance in history - achieved on home soil, in front of a home crowd, against the full weight of Western political pressure.",
      ],
    },
    {
      block: 4,
      id: "block-4",
      title: "THE REVENGE THAT WASN'T",
      body: [
        "Los Angeles 1984. The United States had boycotted Moscow. The calculation was simple and the answer was symmetrical.",
        "The Soviet Union would not compete in California. What America had done to Soviet athletes in 1980, the USSR returned in kind in 1984.",
        "6 American golds in Moscow. 6 Soviet golds in Los Angeles. The numbers were not a coincidence. They were a statement.",
      ],
    },
    {
      block: 5,
      id: "block-5",
      title: "AFTER THE WALL",
      body: [
        "On November 9, 1989, the Berlin Wall fell. On December 25, 1991, the Soviet Union was dissolved. The flag that had topped more Olympic podiums than any other was folded away for the last time.",
        "But the athletes remained. The knowledge remained. Russia carried the legacy forward - through doping scandals, partial bans, and forced anonymity as ROC.",
        "The Soviet Union no longer exists. Its record in the Olympic medal table still does. No nation in history has come close.",
      ],
    },
  ],
};

export const chartPanelContent: Record<SideChoice, ChartPanelContent> = {
  usa: {
    title: "The scoreboard that changed history",
    copy:
      "Five narrative blocks follow the Cold War from the American side, keeping the medal chart pinned while Helsinki 1952, the Soviet surge, the boycott years, and the post-wall era unfold.",
    meta: "USA perspective · 5 blocks · sticky chart at 60px",
    figureMeta: "Olympic gold medals per Summer Games edition · USA vs USSR/Russia",
  },
  ussr: {
    title: "The scoreboard that changed history",
    copy:
      "Five narrative blocks follow the Cold War from the Soviet side, keeping the medal chart pinned while Helsinki 1952, socialist dominance, the boycott years, and the post-wall aftermath unfold.",
    meta: "USSR perspective · 5 blocks · sticky chart at 60px",
    figureMeta: "Olympic gold medals per Summer Games edition · USSR/Russia vs USA",
  },
};

export const historicalContext: Record<number, string> = {
  1952: "First Games with USSR participation. Helsinki becomes ground zero.",
  1956: "Soviet tanks in Hungary. The Games go on in Melbourne.",
  1960: "USSR pulls ahead in Rome. Cassius Clay wins gold for USA.",
  1964: "Tokyo marks peak Olympic diplomacy. USSR leads 20-18.",
  1968: "Mexico City. Protest and politics overshadow competition.",
  1972: "Munich massacre. USSR dominates 29-18.",
  1976: "Montreal financial disaster. USSR extends lead 31-18.",
  1980: "USA boycotts Moscow after Soviet invasion of Afghanistan. 65 nations follow.",
  1984: "USSR retaliates. Boycotts Los Angeles. 14 Eastern Bloc nations absent.",
  1988: "Seoul. Last Cold War Games. USSR wins final showdown 33-19.",
  1996: "Russia - not USSR - competes for the first time. USA dominates Atlanta.",
  2000: "Sydney. Closest post-Cold War result: USA 37, Russia 32.",
  2004: "Athens. USA edges Russia 36-28.",
  2008: "Beijing. China enters the race. USA 36, Russia 24.",
  2012: "London. USA asserts dominance 48-18.",
  2016: "Rio. Russia doping scandal. Partial ban. USA 46, Russia 19.",
  2020: "Tokyo. Russia competes as ROC. Geopolitics return to the podium.",
};
