export function resolveDefaultSeason(reference = new Date()): number {
  const month = reference.getUTCMonth();
  const year = reference.getUTCFullYear();
  return month >= 7 ? year : year - 1;
}

/** Season for API-Football requests — honors API_FOOTBALL_SEASON when set. */
export function resolveConfiguredSeason(reference = new Date()): number {
  const configured = process.env.API_FOOTBALL_SEASON?.trim();
  if (configured) {
    const season = Number(configured);
    if (Number.isFinite(season) && season > 0) {
      return Math.round(season);
    }
  }

  return resolveDefaultSeason(reference);
}
