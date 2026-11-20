import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { buildBreadcrumbJsonLd } from "@/lib/json-ld";
import { createMetadata } from "@/lib/seo";
import { buildMonth, todayJst, type CalendarDay, type TideName } from "@/lib/tide-calendar";
import { sunsetJst, tideDaysOfMonth, TIDE_STATION, TIDE_YEAR, type TideEvent } from "@/lib/tide-tokyo";

// 「今日」の印が古くならないよう、1時間ごとに作り直す
export const revalidate = 3600;

export const metadata = createMetadata({
  title: "2027年バチ抜けカレンダー（1〜3月）｜東京の潮見表（満潮・干潮・日の入り・潮回り）",
  description:
    "2027年1〜3月の東京の潮見表。毎日の満潮・干潮の時刻と潮位、日の入り、大潮・中潮・小潮、新月・満月を月ごとに一覧できます。バチ抜けの釣行計画に。",
  path: "/calendar/2027",
  keywords: ["バチ抜けカレンダー", "2027", "潮見表", "東京湾", "大潮", "バチ抜け", "シーバス"]
});

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];
// バチ抜けシーズン(1〜3月)だけを載せる。データ(src/data)は12月分まである
const MONTHS = [1, 2, 3];

const PHASE_ICON: Record<NonNullable<CalendarDay["phase"]>, string> = {
  新月: "🌑",
  上弦: "🌓",
  満月: "🌕",
  下弦: "🌗"
};

const TIDE_TEXT: Record<TideName, string> = {
  大潮: "text-[var(--paper)] font-semibold",
  中潮: "text-[var(--paper)] font-semibold",
  小潮: "text-[var(--muted)]",
  長潮: "text-[var(--muted)]",
  若潮: "text-[var(--muted)]"
};

const BACHI_ROW: Record<string, string> = {
  本命: "border-l-4 border-l-[var(--amber)] bg-[rgba(239,159,39,0.28)]",
  候補: "border-l-4 border-l-[rgba(239,159,39,0.6)] bg-[rgba(239,159,39,0.10)]",
  なし: "border-l-4 border-l-transparent"
};

function weekdayClass(weekday: number): string {
  if (weekday === 0 || weekday === 6) return "text-[var(--amber)]";
  return "text-[var(--paper)]";
}

function Events({ events }: { events: TideEvent[] }) {
  if (events.length === 0) return <span className="text-[var(--muted)]">—</span>;
  return (
    <>
      {events.map(([time, cm]) => (
        <div key={time} className="whitespace-nowrap leading-[1.5]">
          {time}
          <span className="ml-1 text-[10px] text-[var(--muted)]">{cm}</span>
        </div>
      ))}
    </>
  );
}

function MonthTable({ month, todayIso }: { month: number; todayIso: string }) {
  const calendar = buildMonth(TIDE_YEAR, month);
  const tides = tideDaysOfMonth(month);

  return (
    <section id={`m${month}`} aria-label={`${TIDE_YEAR}年${month}月`} className="scroll-mt-20">
      <h2 className="section-title mb-3">
        {TIDE_YEAR}年{month}月
      </h2>
      <table className="w-full table-fixed border-collapse text-[12px]">
        <thead>
          <tr className="border-b border-[var(--border)] text-[10px] text-[var(--muted)]">
            <th className="w-[14%] py-1 text-left font-normal">日</th>
            <th className="w-[24%] py-1 text-left font-normal">潮回り</th>
            <th className="w-[24%] py-1 text-left font-normal">満潮</th>
            <th className="w-[24%] py-1 text-left font-normal">干潮</th>
            <th className="w-[14%] py-1 text-left font-normal">日の入り</th>
          </tr>
        </thead>
        <tbody>
          {calendar.days.map((day) => {
            const tide = tides.find((t) => t.date === day.iso);
            const isToday = day.iso === todayIso;
            return (
              <tr
                key={day.iso}
                className={`border-b border-[var(--border)] align-top ${
                  isToday ? "outline outline-1 -outline-offset-1 outline-[var(--amber)]" : ""
                } ${BACHI_ROW[day.bachi ?? "なし"]}`}
              >
                <td className={`py-1 pl-1 ${weekdayClass(day.weekday)}`}>
                  <span className="text-[13px]">{day.day}</span>
                  <span className="ml-0.5 text-[10px]">{WEEKDAYS[day.weekday]}</span>
                  {day.phase ? (
                    <span className="ml-0.5 text-[10px]" aria-label={day.phase} title={day.phase}>
                      {PHASE_ICON[day.phase]}
                    </span>
                  ) : null}
                </td>
                <td className="py-1">
                  <div className={`text-[12px] ${TIDE_TEXT[day.tide]}`}>{day.tide}</div>
                  {day.tideDayNo || day.beforeSpring || day.bachi ? (
                    <div className="text-[10px] leading-tight text-[var(--muted)]">
                      {day.tideDayNo ? `${day.tideDayNo}日目` : day.beforeSpring ? "大潮前" : ""}
                      {day.bachi ? (
                        <span
                          className={`ml-1 text-[11px] text-[var(--amber)] ${day.bachi === "本命" ? "font-bold" : ""}`}
                        >
                          {day.bachi}
                        </span>
                      ) : null}
                    </div>
                  ) : null}
                </td>
                <td className="py-1 text-[var(--paper)]">
                  <Events events={tide?.high ?? []} />
                </td>
                <td className="py-1 text-[var(--paper)]">
                  <Events events={tide?.low ?? []} />
                </td>
                <td className="py-1 text-[var(--paper)]">{sunsetJst(day.iso) ?? "—"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}

export default function Calendar2027Page() {
  const today = todayJst();

  return (
    <div className="max-w-3xl">
      <JsonLd
        data={[
          buildBreadcrumbJsonLd([
            { name: "トップ", path: "/" },
            { name: "バチ抜けカレンダー", path: "/calendar" },
            { name: "2027年", path: "/calendar/2027" }
          ])
        ]}
      />
      <h1 className="serif-title mb-4 text-2xl font-bold md:text-3xl">2027年バチ抜けカレンダー</h1>
      <p className="mb-3 text-[13px] leading-[1.9] text-[var(--paper)]">
        2027年1月から3月まで、{TIDE_STATION}の潮見表です。毎日の満潮・干潮の時刻と潮位、日の入り、潮回り（大潮・中潮・小潮）を月ごとに並べています。バチ抜けの釣行計画に使ってください。
      </p>
      <p className="mb-6 text-[13px] leading-[1.9] text-[var(--paper)]">
        月齢つきの月間カレンダーは
        <Link href="/calendar" className="mx-1 text-[var(--teal)] hover:underline">
          バチ抜けカレンダー
        </Link>
        にあります。バチが抜ける日の見極め方は
        <Link href="/columns/bachi-judge" className="mx-1 text-[var(--teal)] hover:underline">
          バチ抜け発生条件の見極め方
        </Link>
        に書いています。
      </p>

      <nav aria-label="月の移動" className="mb-6 flex flex-wrap gap-2">
        {MONTHS.map((m) => (
          <a
            key={m}
            href={`#m${m}`}
            className="rounded border border-[var(--border)] px-3 py-1 text-[12px] text-[var(--paper)] hover:border-[var(--teal)] hover:text-[var(--teal)]"
          >
            {m}月
          </a>
        ))}
      </nav>

      <div className="mb-8 rounded-sm border border-[var(--border)] px-3 py-2 text-[11px] leading-[1.8] text-[var(--muted)]">
        <p>
          <span>🌑新月 🌓上弦 🌕満月 🌗下弦 ／ 時刻は日本時間 ／ 満潮・干潮の小さい数字は潮位(cm)</span>
        </p>
        <p className="mt-1">
          <span className="mr-3 rounded-sm bg-[rgba(239,159,39,0.28)] px-1.5 font-bold text-[var(--amber)]">本命</span>
          <span className="mr-3 rounded-sm bg-[rgba(239,159,39,0.10)] px-1.5 text-[var(--amber)]">候補</span>
          <span>管理人のバチ抜けの目安 ／ 黄色の枠が今日</span>
        </p>
      </div>

      <div className="mb-8 rounded-sm border border-[var(--border)] px-3 py-3 text-[12px] leading-[1.9] text-[var(--paper)]">
        <p className="mb-1 text-[13px] font-semibold">バチ抜けの目安の見方</p>
        <p>
          「候補」「本命」は、釣果や実際のバチの発生とは関係なく、次のルールだけで機械的に付けています。
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>大潮の最終日から、大潮のあとの中潮の4日目まで：候補</li>
          <li>そのうち、大潮のあとの中潮の2日目と3日目：本命</li>
          <li>大潮の前の中潮(表では「大潮前」)：印なし</li>
        </ul>
        <p className="mt-2 text-[var(--muted)]">
          旧暦の日で言うと、候補は2・3・6日と17・18・21日、本命は4・5日と19・20日です(大潮は29〜2日と14〜17日、そのあとの中潮は3〜6日と18〜21日)。
        </p>
        <p className="mt-1 text-[var(--muted)]">
          潮回りだけで抜ける日が決まるわけではありません。水温や風、雨なども合わせて見てください。
        </p>
      </div>

      <div className="space-y-10">
        {MONTHS.map((m) => (
          <MonthTable key={m} month={m} todayIso={today.iso} />
        ))}
      </div>

      <section className="mt-10 space-y-2 text-[12px] leading-[1.9] text-[var(--muted)]">
        <h2 className="text-xs tracking-[0.1em]">この潮見表について</h2>
        <p>
          満潮・干潮の時刻と潮位は、
          <a
            href="https://www.data.jma.go.jp/gmd/kaiyou/db/tide/suisan/"
            target="_blank"
            rel="noopener noreferrer"
            className="mx-1 text-[var(--teal)] hover:underline"
          >
            気象庁「潮位表」
          </a>
          の{TIDE_STATION}の2027年の推算値(天文潮位)から、満潮・干潮だけを取り出して加工したものです。潮位は潮位表基準面からの高さ(cm)です。
        </p>
        <p>
          推算値なので、気圧や風、天候による実際の潮位とは異なります。また、{TIDE_STATION}の値なので、釣り場によって満潮・干潮の時刻や潮位は変わります。釣行前に、釣り場に近い地点の潮位表で確認してください。
        </p>
        <p>
          潮回りの「○日目」は、同じ潮名が続く日を数えたものです。大潮の前の中潮は2日間で、日数ではなく「大潮前」と表示しています。
        </p>
        <p>
          日の入りは東京の位置から、月齢・潮回りは新月の時刻から、当サイトで計算しています。潮名の区分は、新聞や釣り雑誌、潮見表によって1〜2日ずれることがあります。
        </p>
      </section>
    </div>
  );
}
