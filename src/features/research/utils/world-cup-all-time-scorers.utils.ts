import type { FootballResearchPlayer } from "@/features/research/types/football-research.types";

/** API-Football league id for the FIFA World Cup. */
export const FIFA_WORLD_CUP_LEAGUE_ID = 1;

/** Curated all-time FIFA World Cup goal scorers (fixed rank order). */
const ALL_TIME_FIFA_WORLD_CUP_TOP_SCORERS: Array<{ name: string; goals: number; nationality: string }> =
  [
    { name: "Miroslav Klose", goals: 16, nationality: "Germany" },
    { name: "Ronaldo Nazário", goals: 15, nationality: "Brazil" },
    { name: "Gerd Müller", goals: 14, nationality: "Germany" },
    { name: "Just Fontaine", goals: 13, nationality: "France" },
    { name: "Lionel Messi", goals: 13, nationality: "Argentina" },
  ];

export function getAllTimeWorldCupTopScorers(limit: number): FootballResearchPlayer[] {
  return ALL_TIME_FIFA_WORLD_CUP_TOP_SCORERS.slice(0, Math.max(1, limit)).map((entry, index) => ({
    id: index + 1,
    name: entry.name,
    nationality: entry.nationality,
    league: "FIFA World Cup",
    goals: entry.goals,
    assists: null,
  }));
}
