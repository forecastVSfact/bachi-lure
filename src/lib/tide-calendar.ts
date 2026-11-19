import { SearchMoonQuarter } from "astronomy-engine";

/**
 * バチ抜けカレンダー用の、月齢・旧暦日・潮回り(潮名)の計算。
 *
 * - 月齢: 朔(新月)の時刻から、その日の正午(日本時間)までの経過日数(気象庁の定義)
 * - 旧暦日: 朔を含む日本時間の日を1日として数えた日数
 * - 潮名: 海上保安庁が紹介している、旧暦日による目安の区分
 *   大潮 29・30・1・2 / 14〜17、中潮 3〜6・12・13・18〜21・27・28、
 *   小潮 7〜9・22〜24、長潮 10・25、若潮 11・26
 *   (潮名の区分は新聞や釣り雑誌によって数日ずれることがあるので、あくまで目安)
 */

export type TideName = "大潮" | "中潮" | "小潮" | "長潮" | "若潮";

export type CalendarDay = {
  /** 日付(日本時間) YYYY-MM-DD */
  iso: string;
  day: number;
  /** 0=日 〜 6=土 */
  weekday: number;
  /** 旧暦日(朔の日=1) */
  lunarDay: number;
  /** 月齢(その日の正午) */
  moonAge: number;
  tide: TideName;
  /** その日に新月・上弦・満月・下弦になるとき */
  phase: "新月" | "上弦" | "満月" | "下弦" | null;
};

export type CalendarMonth = {
  year: number;
  /** 1〜12 */
  month: number;
  days: CalendarDay[];
};

const JST_OFFSET_MS = 9 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

/** 日本時間の暦日(その日の0:00 JSTを、UTCの午前0時に置き換えた値)にする */
function jstDayNumber(date: Date): number {
  return Math.floor((date.getTime() + JST_OFFSET_MS) / DAY_MS);
}

function dayNumberToIso(dayNumber: number): string {
  return new Date(dayNumber * DAY_MS).toISOString().slice(0, 10);
}

export function tideNameFromLunarDay(lunarDay: number): TideName {
  if (lunarDay >= 29 || lunarDay <= 2) return "大潮";
  if (lunarDay >= 14 && lunarDay <= 17) return "大潮";
  if (lunarDay >= 7 && lunarDay <= 9) return "小潮";
  if (lunarDay >= 22 && lunarDay <= 24) return "小潮";
  if (lunarDay === 10 || lunarDay === 25) return "長潮";
  if (lunarDay === 11 || lunarDay === 26) return "若潮";
  return "中潮"; // 3〜6, 12・13, 18〜21, 27・28
}

/** quarter: 0=新月, 1=上弦, 2=満月, 3=下弦 */
type PhaseEvent = { time: Date; quarter: number };

/** 指定期間をまたぐ月相(新月・上弦・満月・下弦)の一覧 */
function listPhases(from: Date, to: Date): PhaseEvent[] {
  const events: PhaseEvent[] = [];
  let q = SearchMoonQuarter(from);
  while (q.time.date.getTime() <= to.getTime()) {
    events.push({ time: q.time.date, quarter: q.quarter });
    q = SearchMoonQuarter(new Date(q.time.date.getTime() + DAY_MS));
  }
  return events;
}

const PHASE_LABEL: Record<number, CalendarDay["phase"]> = {
  0: "新月",
  1: "上弦",
  2: "満月",
  3: "下弦"
};

/** 指定した月(日本時間)のカレンダーを作る */
export function buildMonth(year: number, month: number): CalendarMonth {
  const firstDay = Math.floor(Date.UTC(year, month - 1, 1) / DAY_MS);
  const nextFirstDay = Math.floor(Date.UTC(year, month, 1) / DAY_MS);

  // 月初より前の朔を拾うため、前後に余裕を持って探す
  const from = new Date((firstDay - 45) * DAY_MS);
  const to = new Date((nextFirstDay + 2) * DAY_MS);
  const phases = listPhases(from, to);
  const newMoons = phases.filter((p) => p.quarter === 0).map((p) => p.time);

  const days: CalendarDay[] = [];
  for (let dn = firstDay; dn < nextFirstDay; dn++) {
    // 日本時間の正午 = UTCの前日21:00 + 12h → dn日のUTC 03:00
    const noon = new Date(dn * DAY_MS + 3 * 60 * 60 * 1000);

    // 正午までで一番新しい朔
    let latest = newMoons[0];
    for (const nm of newMoons) {
      if (nm.getTime() <= noon.getTime()) latest = nm;
    }
    // 旧暦日は「朔を含む日本時間の日」を1日として数える。
    // 朔が正午より後でも、その日が1日(月齢は前の朔から数える)
    let anchor = latest;
    for (const nm of newMoons) {
      if (jstDayNumber(nm) <= dn) anchor = nm;
    }
    const lunarDay = dn - jstDayNumber(anchor) + 1;
    const moonAge = (noon.getTime() - latest.getTime()) / DAY_MS;

    const phaseEvent = phases.find((p) => jstDayNumber(p.time) === dn);
    const date = new Date(dn * DAY_MS);

    days.push({
      iso: dayNumberToIso(dn),
      day: date.getUTCDate(),
      weekday: date.getUTCDay(),
      lunarDay,
      moonAge: Math.round(moonAge * 10) / 10,
      tide: tideNameFromLunarDay(lunarDay),
      phase: phaseEvent ? PHASE_LABEL[phaseEvent.quarter] : null
    });
  }

  return { year, month, days };
}

/** 今日(日本時間)の年月日 */
export function todayJst(now: Date = new Date()): { year: number; month: number; iso: string } {
  const jst = new Date(now.getTime() + JST_OFFSET_MS);
  return {
    year: jst.getUTCFullYear(),
    month: jst.getUTCMonth() + 1,
    iso: jst.toISOString().slice(0, 10)
  };
}

/** 開始月からcount か月分 */
export function buildMonths(startYear: number, startMonth: number, count: number): CalendarMonth[] {
  const months: CalendarMonth[] = [];
  let y = startYear;
  let m = startMonth;
  for (let i = 0; i < count; i++) {
    months.push(buildMonth(y, m));
    m += 1;
    if (m > 12) {
      m = 1;
      y += 1;
    }
  }
  return months;
}
