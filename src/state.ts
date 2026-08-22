import { readFileSync, writeFileSync, existsSync } from "node:fs";

const STATE_PATH = "data/state.json";

export type State = Record<string, string>; // username -> last seen tweet id

export function loadState(): State {
  if (!existsSync(STATE_PATH)) return {};
  return JSON.parse(readFileSync(STATE_PATH, "utf-8"));
}

export function saveState(state: State) {
  writeFileSync(STATE_PATH, JSON.stringify(state, null, 2) + "\n", "utf-8");
}

// ID твитов в X — снежинки (snowflake), они монотонно растут во времени,
// поэтому их можно сравнивать как большие числа (через BigInt, т.к. они
// превышают Number.MAX_SAFE_INTEGER).
export function isNewer(candidateId: string, lastSeenId: string | undefined): boolean {
  if (!lastSeenId) return true;
  return BigInt(candidateId) > BigInt(lastSeenId);
}
