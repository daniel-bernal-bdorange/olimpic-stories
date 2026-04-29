export type AtlasView = "male" | "female";
export type SortMetric = "height" | "weight" | "bmi";

type AtlasMetricValues = Record<SortMetric, number>;

type AtlasMetricDefinition = {
  label: string;
  unit: string;
};

type AtlasSportEntry = AtlasMetricValues & {
  sport: string;
};

type AtlasSportMetadata = {
  accent: string;
  cluster: "water" | "power" | "outdoor" | "team" | "default";
  detail: string;
  fact: string;
};

export type AtlasAverage = AtlasMetricValues;

export type AtlasProfile = AtlasSportEntry & AtlasSportMetadata;

export const atlasViews: Array<{ key: AtlasView; label: string }> = [
  { key: "male", label: "Male" },
  { key: "female", label: "Female" },
];

export const sortOptions: Array<{ key: SortMetric; label: string }> = [
  { key: "height", label: "Height" },
  { key: "weight", label: "Weight" },
  { key: "bmi", label: "BMI" },
];

export const initialAtlasView: AtlasView = "male";
export const initialAtlasSort: SortMetric = "height";

export const atlasHeroImpact = {
  value: 28.3,
  unit: "CM",
  caption: "Separate the shortest Olympic silhouette from the tallest one on the floor.",
  shortestSport: "Artistic Gymnastics",
  tallestSport: "Basketball",
} as const;

const atlasMetricDefinitions: Record<SortMetric, AtlasMetricDefinition> = {
  height: { label: "Height", unit: "CM" },
  weight: { label: "Weight", unit: "KG" },
  bmi: { label: "BMI", unit: "BMI" },
};

const atlasSportMetadata: Record<string, AtlasSportMetadata> = {
  Basketball: {
    accent: "#F4C300",
    cluster: "team",
    detail: "The tallest Olympic profile, built around reach and floor coverage.",
    fact: "The tallest sport in Olympic history. Every extra centimeter improves the angle of play.",
  },
  Volleyball: {
    accent: "#F4C300",
    cluster: "team",
    detail: "Long levers and repeated jump height define the shape of the net game.",
    fact: "Elite volleyball keeps one of the tallest average frames in the Olympic program.",
  },
  "Beach Volleyball": {
    accent: "#F4C300",
    cluster: "team",
    detail: "Height stays high, but the sand rewards lighter, more elastic movement.",
    fact: "On sand, vertical reach matters, but excess mass is punished over long rallies.",
  },
  "Water Polo": {
    accent: "#0085C7",
    cluster: "water",
    detail: "Swimmer length meets wrestler mass in the pool's most physical sport.",
    fact: "Water polo blends aquatic reach with the density of a contact discipline.",
  },
  Rowing: {
    accent: "#009F6B",
    cluster: "outdoor",
    detail: "Length and power combine to maximize stroke distance and rhythm.",
    fact: "Rowing rewards wingspan, leg drive and repeated force over long intervals.",
  },
  Handball: {
    accent: "#F4C300",
    cluster: "team",
    detail: "Broad frames absorb contact while keeping release height over the defense.",
    fact: "The sport sits near the top end of both height and weight among team disciplines.",
  },
  Swimming: {
    accent: "#0085C7",
    cluster: "water",
    detail: "Long torsos and reach turn every stroke into extra water covered.",
    fact: "Swimming keeps a clear height advantage, especially on the men's side.",
  },
  Tennis: {
    accent: "#C9A84C",
    cluster: "default",
    detail: "Balanced height and lean power support serve speed and lateral recovery.",
    fact: "Tennis stays close to the Olympic middle, but with extra reach for serve dominance.",
  },
  "Ice Hockey": {
    accent: "#0085C7",
    cluster: "water",
    detail: "Compact power and padded mass favor collisions, balance and acceleration.",
    fact: "Ice hockey carries one of the densest male builds in the dataset.",
  },
  "Canoe Sprint": {
    accent: "#0085C7",
    cluster: "water",
    detail: "Torso power concentrates into a narrow chassis built for repeated force.",
    fact: "Upper-body output matters enough to keep canoe sprint heavier than its height suggests.",
  },
  Athletics: {
    accent: "#009F6B",
    cluster: "outdoor",
    detail: "A middle-ground build hides radically different specializations inside one label.",
    fact: "Athletics averages out extremes, landing close to the center of the Olympic body map.",
  },
  "Cycling Track": {
    accent: "#009F6B",
    cluster: "outdoor",
    detail: "Leg-driven force keeps mass controlled while aerodynamics stays critical.",
    fact: "Track cycling mixes compact aerodynamics with enough power to keep BMI elevated.",
  },
  Judo: {
    accent: "#DF0024",
    cluster: "power",
    detail: "Grip fighting and throws push the profile toward dense functional strength.",
    fact: "Judoka sit above Olympic averages in both weight and BMI without needing exceptional height.",
  },
  Boxing: {
    accent: "#DF0024",
    cluster: "power",
    detail: "Leaner frames keep speed high without sacrificing striking range.",
    fact: "Boxing trends lighter than most combat sports while preserving reach efficiency.",
  },
  Weightlifting: {
    accent: "#DF0024",
    cluster: "power",
    detail: "The densest build in the atlas, where mass concentrates into power.",
    fact: "Weightlifting owns the highest BMI in the brief and sits furthest above the mass baseline.",
  },
  Wrestling: {
    accent: "#DF0024",
    cluster: "power",
    detail: "Low-center leverage and contact strength keep density above the Olympic mean.",
    fact: "Wrestling stays compact and heavy enough to outperform the BMI average.",
  },
  Diving: {
    accent: "#0085C7",
    cluster: "water",
    detail: "Compact bodies keep rotation sharp and entries clean.",
    fact: "Diving sits below Olympic mass averages to make spin speed easier to sustain.",
  },
  "Artistic Gymnastics": {
    accent: "#C9A84C",
    cluster: "default",
    detail: "Compact leverage keeps rotation fast without sacrificing control.",
    fact: "Artistic gymnastics marks the shortest profile in the male brief and one of the lightest overall.",
  },
  "Ski Jumping": {
    accent: "#C9A84C",
    cluster: "default",
    detail: "Unusually light builds minimize drag and stretch hang time in the air.",
    fact: "Ski jumping trends lighter than its height would suggest because extra mass hurts flight.",
  },
  "Figure Skating": {
    accent: "#0085C7",
    cluster: "water",
    detail: "Moderate size supports rotational speed while preserving line and extension.",
    fact: "Figure skating balances visual line with the compactness needed for rotation.",
  },
  "Rhythmic Gymnastics": {
    accent: "#C9A84C",
    cluster: "default",
    detail: "Long lines stay exceptionally light to maximize extension and apparent ease.",
    fact: "Rhythmic gymnastics hits the lowest BMI in the brief at 17.3.",
  },
  "Artistic Swimming": {
    accent: "#0085C7",
    cluster: "water",
    detail: "Length, buoyancy and coordinated leg drive keep the silhouette narrow and precise.",
    fact: "Artistic swimming combines aquatic efficiency with the line discipline of gymnastics.",
  },
};

const atlasProfilesByView: Record<AtlasView, AtlasSportEntry[]> = {
  male: [
    { sport: "Basketball", height: 195.5, weight: 91.8, bmi: 24.1 },
    { sport: "Volleyball", height: 193.4, weight: 86.9, bmi: 23.2 },
    { sport: "Beach Volleyball", height: 193.5, weight: 89.6, bmi: 23.9 },
    { sport: "Water Polo", height: 187.2, weight: 87.9, bmi: 25.1 },
    { sport: "Rowing", height: 186.9, weight: 83.8, bmi: 23.9 },
    { sport: "Handball", height: 188.8, weight: 89.6, bmi: 25.1 },
    { sport: "Swimming", height: 184.4, weight: 78.0, bmi: 22.9 },
    { sport: "Tennis", height: 185.1, weight: 79.0, bmi: 23.1 },
    { sport: "Ice Hockey", height: 181.3, weight: 84.1, bmi: 25.6 },
    { sport: "Canoe Sprint", height: 181.9, weight: 81.3, bmi: 24.5 },
    { sport: "Athletics", height: 179.7, weight: 73.7, bmi: 22.8 },
    { sport: "Cycling Track", height: 178.9, weight: 75.5, bmi: 23.6 },
    { sport: "Judo", height: 177.6, weight: 83.4, bmi: 26.4 },
    { sport: "Boxing", height: 172.9, weight: 65.3, bmi: 21.8 },
    { sport: "Weightlifting", height: 169.2, weight: 80.7, bmi: 28.2 },
    { sport: "Wrestling", height: 173.0, weight: 76.7, bmi: 25.6 },
    { sport: "Diving", height: 171.7, weight: 67.0, bmi: 22.7 },
    { sport: "Artistic Gymnastics", height: 167.6, weight: 63.3, bmi: 22.5 },
    { sport: "Ski Jumping", height: 176.6, weight: 64.8, bmi: 20.8 },
    { sport: "Figure Skating", height: 176.3, weight: 70.0, bmi: 22.5 },
  ],
  female: [
    { sport: "Basketball", height: 182.6, weight: 73.8, bmi: 22.1 },
    { sport: "Volleyball", height: 179.7, weight: 69.4, bmi: 21.5 },
    { sport: "Beach Volleyball", height: 179.2, weight: 68.6, bmi: 21.4 },
    { sport: "Water Polo", height: 175.8, weight: 70.4, bmi: 22.8 },
    { sport: "Rowing", height: 176.8, weight: 70.1, bmi: 22.4 },
    { sport: "Handball", height: 174.9, weight: 69.0, bmi: 22.5 },
    { sport: "Swimming", height: 171.6, weight: 61.5, bmi: 20.9 },
    { sport: "Tennis", height: 172.5, weight: 62.2, bmi: 20.9 },
    { sport: "Athletics", height: 169.3, weight: 60.2, bmi: 21.0 },
    { sport: "Cycling Track", height: 168.6, weight: 64.1, bmi: 22.5 },
    { sport: "Judo", height: 166.2, weight: 66.0, bmi: 23.9 },
    { sport: "Boxing", height: 168.6, weight: 61.6, bmi: 21.7 },
    { sport: "Weightlifting", height: 160.5, weight: 67.3, bmi: 26.1 },
    { sport: "Wrestling", height: 164.2, weight: 61.0, bmi: 22.6 },
    { sport: "Diving", height: 161.2, weight: 53.6, bmi: 20.6 },
    { sport: "Artistic Gymnastics", height: 156.2, weight: 47.8, bmi: 19.6 },
    { sport: "Rhythmic Gymnastics", height: 167.8, weight: 48.8, bmi: 17.3 },
    { sport: "Figure Skating", height: 160.4, weight: 49.8, bmi: 19.4 },
    { sport: "Artistic Swimming", height: 168.5, weight: 55.8, bmi: 19.7 },
    { sport: "Ski Jumping", height: 164.7, weight: 52.6, bmi: 19.4 },
  ],
};

function roundMetric(value: number) {
  return Number(value.toFixed(1));
}

function getAverage(profiles: AtlasSportEntry[]): AtlasAverage {
  const totals = profiles.reduce<AtlasMetricValues>(
    (accumulator, profile) => ({
      height: accumulator.height + profile.height,
      weight: accumulator.weight + profile.weight,
      bmi: accumulator.bmi + profile.bmi,
    }),
    { height: 0, weight: 0, bmi: 0 },
  );

  return {
    height: roundMetric(totals.height / profiles.length),
    weight: roundMetric(totals.weight / profiles.length),
    bmi: roundMetric(totals.bmi / profiles.length),
  };
}

export const olympicAverageByView: Record<AtlasView, AtlasAverage> = {
  male: getAverage(atlasProfilesByView.male),
  female: getAverage(atlasProfilesByView.female),
};

export const olympicAverageOverall = getAverage([
  ...atlasProfilesByView.male,
  ...atlasProfilesByView.female,
]);

function resolveSportMetadata(sport: string): AtlasSportMetadata {
  return (
    atlasSportMetadata[sport] ?? {
      accent: "#C9A84C",
      cluster: "default",
      detail: "A balanced Olympic profile waiting for a dedicated editorial note.",
      fact: "Metadata pending for this sport.",
    }
  );
}

export function getAtlasSportCount(view: AtlasView) {
  return atlasProfilesByView[view].length;
}

export function getAtlasMetricLabel(metric: SortMetric) {
  return atlasMetricDefinitions[metric].label;
}

export function formatAtlasMetricValue(metric: SortMetric, value: number) {
  if (metric === "bmi") {
    return `BMI ${value.toFixed(1)}`;
  }

  return `${value.toFixed(1)} ${atlasMetricDefinitions[metric].unit}`;
}

export function getAtlasProfiles(view: AtlasView): AtlasProfile[] {
  return atlasProfilesByView[view].map((profile) => ({
    ...profile,
    ...resolveSportMetadata(profile.sport),
  }));
}

export function getSortedAtlasProfiles(view: AtlasView, metric: SortMetric): AtlasProfile[] {
  return [...getAtlasProfiles(view)].sort((left, right) => right[metric] - left[metric]);
}

export function getOlympicAverage(view: AtlasView | "overall") {
  if (view === "overall") {
    return olympicAverageOverall;
  }

  return olympicAverageByView[view];
}

export function getAtlasContextCopy(view: AtlasView, metric: SortMetric) {
  const audience = view === "male" ? "male" : "female";
  const benchmark = formatAtlasMetricValue(metric, olympicAverageByView[view][metric]);

  if (metric === "height") {
    return `Sorting the ${audience} dataset by height exposes how each sport stretches or compresses the Olympic silhouette against a ${benchmark} benchmark.`;
  }

  if (metric === "weight") {
    return `Sorting the ${audience} dataset by weight surfaces where power adds visible mass and where technique stays below the ${benchmark} Olympic average.`;
  }

  return `Sorting the ${audience} dataset by BMI reveals the densest builds against the leanest frames, using ${benchmark} as the baseline for the current view.`;
}