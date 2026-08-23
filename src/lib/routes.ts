/** Walk-time tips between UTD campus buildings (from navigation spreadsheet + campus layout) */
const ROUTE_TIPS: Record<string, Record<string, string>> = {
  SCI: {
    AD: "4–5 min walk from SCI to AD via Drive D / pedestrian path east (~0.2 mi)",
    CB: "6–7 min walk from SCI to CB via Mall",
    SLC: "2–3 min walk from SCI to SLC (adjacent science complex)",
    ECSW: "8–10 min walk from SCI to ECS West via Rutford Ave",
    ECSS: "8–10 min walk from SCI to ECS South",
  },
  AD: {
    SCI: "4–5 min walk from AD to SCI via Drive D",
    CB: "5–6 min walk from AD to CB via Mall",
    SLC: "5–6 min walk from AD to SLC",
    ECSW: "7–9 min walk from AD to ECS West",
    ECSS: "7–9 min walk from AD to ECS South",
  },
  CB: {
    SCI: "6–7 min walk from CB to SCI via Mall",
    AD: "5–6 min walk from CB to AD via Mall",
    SLC: "6–7 min walk from CB to SLC",
    ECSW: "5–6 min walk from CB to ECS West",
    ECSS: "5–6 min walk from CB to ECS South",
  },
  SLC: {
    SCI: "2–3 min walk from SLC to SCI",
    AD: "5–6 min walk from SLC to AD",
    CB: "6–7 min walk from SLC to CB",
    ECSW: "7–8 min walk from SLC to ECS West",
    ECSS: "7–8 min walk from SLC to ECS South",
  },
  ECSW: {
    SCI: "8–10 min walk from ECSW to SCI",
    AD: "7–9 min walk from ECSW to AD",
    CB: "5–6 min walk from ECSW to CB",
    SLC: "7–8 min walk from ECSW to SLC",
    ECSS: "2–4 min walk from ECSW to ECSS (same ECS complex)",
  },
  ECSS: {
    SCI: "8–10 min walk from ECSS to SCI",
    AD: "7–9 min walk from ECSS to AD",
    CB: "5–6 min walk from ECSS to CB",
    SLC: "7–8 min walk from ECSS to SLC",
    ECSW: "2–4 min walk from ECSS to ECSW (same ECS complex)",
  },
};

function normalizeBuilding(building: string): string {
  return building.trim().split("/")[0].trim();
}

export function getRouteTip(fromBuilding: string, toBuilding: string): string {
  const from = normalizeBuilding(fromBuilding);
  const to = normalizeBuilding(toBuilding);

  if (from === to) {
    return "Same building — no walk needed";
  }

  const tip = ROUTE_TIPS[from]?.[to];
  if (tip) return tip;

  return `${from} → ${to}: allow 5–10 min between buildings`;
}
