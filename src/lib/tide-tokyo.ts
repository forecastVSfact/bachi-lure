import { Body, Observer, SearchRiseSet } from "astronomy-engine";
import tideFile from "@/data/tide-tokyo-2027.json";

/**
 * 東京の満潮・干潮(気象庁「潮位表」2027年)と、日の入りの計算。
 *
 * - 満潮・干潮: src/data/tide-tokyo-2027.json (気象庁の推算潮位から満潮・干潮だけを取り出したもの)
 *   [時刻(日本時間), 潮位cm(潮位表基準面から)] の組。
 * - 日の入り: astronomy-engine で東京の位置から計算(大気差を含む)
 */

/** [HH:MM, 潮位cm] */
export type TideEvent = [string, number];

export type TideDay = {
  /** YYYY-MM-DD(日本時間) */
  date: string;
  high: TideEvent[];
  low: TideEvent[];
};

type TideFile = {
  source: string;
  station: string;
  year: number;
  days: TideDay[];
};

const file = tideFile as unknown as TideFile;

export const TIDE_YEAR = file.year;
export const TIDE_STATION = file.station;

const TOKYO = new Observer(35.6528, 139.7594, 5);
const HOUR_MS = 60 * 60 * 1000;
const JST_OFFSET_MS = 9 * HOUR_MS;

/** 日の入り時刻(日本時間 HH:MM)。極夜などで無ければ null */
export function sunsetJst(iso: string): string | null {
  const [y, m, d] = iso.split("-").map(Number);
  // 日本時間のその日の0:00
  const start = new Date(Date.UTC(y, m - 1, d, -9, 0, 0));
  const t = SearchRiseSet(Body.Sun, TOKYO, -1, start, 1);
  if (!t) return null;
  const rounded = Math.round(t.date.getTime() / 60000) * 60000;
  return new Date(rounded + JST_OFFSET_MS).toISOString().slice(11, 16);
}

/** 月(1〜12)ごとの満潮・干潮 */
export function tideDaysOfMonth(month: number): TideDay[] {
  const prefix = `${file.year}-${String(month).padStart(2, "0")}-`;
  return file.days.filter((d) => d.date.startsWith(prefix));
}
