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

/** 管理人の目安によるバチ抜けの印 */
export type BachiRank = "本命" | "候補";

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
  /**
   * 同じ潮名が続くうちの何日目か(大潮・小潮、大潮のあとの中潮)。
   * 長潮・若潮と、大潮の前の中潮は null
   */
  tideDayNo: number | null;
  /** 大潮の前の中潮(旧暦12・13日、27・28日)なら true */
  beforeSpring: boolean;
  /** バチ抜けの印(管理人の目安)。印のない日は null */
  bachi: BachiRank | null;
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

/**
 * バチ抜けの印(管理人の目安)。大潮の最終日から、その後の中潮4日目までを「候補」、
 * 中潮2日目と3日目を「本命」とする。大潮の前の中潮(旧暦12・13・27・28日)には印を付けない。
 *
 * 旧暦日で見ると、大潮の最終日は2日・17日、そのあとの中潮は3〜6日・18〜21日。
 *   候補: 2・3・6日 / 17・18・21日   本命: 4・5日 / 19・20日
 */
export function bachiRankFromLunarDay(lunarDay: number): BachiRank | null {
  if (lunarDay === 4 || lunarDay === 5 || lunarDay === 19 || lunarDay === 20) return "本命";
  if (lunarDay === 2 || lunarDay === 3 || lunarDay === 6) return "候補";
  if (lunarDay === 17 || lunarDay === 18 || lunarDay === 21) return "候補";
  return null;
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

  // 旧暦日は「朔を含む日本時間の日」を1日として数える
  const lunarDayOf = (dn: number): number => {
    let anchor = newMoons[0];
    for (const nm of newMoons) {
      if (jstDayNumber(nm) <= dn) anchor = nm;
    }
    return dn - jstDayNumber(anchor) + 1;
  };

  const days: CalendarDay[] = [];
  for (let dn = firstDay; dn < nextFirstDay; dn++) {
    // 日本時間の正午 = UTCの前日21:00 + 12h → dn日のUTC 03:00
    const noon = new Date(dn * DAY_MS + 3 * 60 * 60 * 1000);

    // 正午までで一番新しい朔
    let latest = newMoons[0];
    for (const nm of newMoons) {
      if (nm.getTime() <= noon.getTime()) latest = nm;
    }
    // 朔が正午より後でも、その日が旧暦1日(月齢は前の朔から数える)
    const lunarDay = lunarDayOf(dn);
    const tide = tideNameFromLunarDay(lunarDay);

    // 同じ潮名が続く何日目か。続きの日を数え、前の日の潮名で大潮の前後を見分ける
    let run = 1;
    while (tideNameFromLunarDay(lunarDayOf(dn - run)) === tide) run++;
    const prevTide = tideNameFromLunarDay(lunarDayOf(dn - run));
    const beforeSpring = tide === "中潮" && prevTide !== "大潮";
    const tideDayNo = tide === "長潮" || tide === "若潮" || beforeSpring ? null : run;
    const moonAge = (noon.getTime() - latest.getTime()) / DAY_MS;

    const phaseEvent = phases.find((p) => jstDayNumber(p.time) === dn);
    const date = new Date(dn * DAY_MS);

    days.push({
      iso: dayNumberToIso(dn),
      day: date.getUTCDate(),
      weekday: date.getUTCDay(),
      lunarDay,
      moonAge: Math.round(moonAge * 10) / 10,
      tide,
      tideDayNo,
      beforeSpring,
      bachi: bachiRankFromLunarDay(lunarDay),
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
