import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { buildBreadcrumbJsonLd } from "@/lib/json-ld";
import { createMetadata } from "@/lib/seo";
import { buildMonths, todayJst, type CalendarDay, type TideName } from "@/lib/tide-calendar";

// 「今日」の印と、表示する月が古くならないよう、1時間ごとに作り直す
export const revalidate = 3600;

export const metadata = createMetadata({
  title: "バチ抜けカレンダー｜月齢・潮回り（大潮・中潮・小潮）",
  description:
    "バチ抜けの釣行計画に使える、月ごとの月齢・潮回り(大潮・中潮・小潮・長潮・若潮)・新月/満月のカレンダー。今月から半年分を一覧できます。",
  path: "/calendar",
  keywords: ["バチ抜けカレンダー", "バチ抜け", "潮回り", "大潮", "月齢", "シーバス"]
});

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];
const MONTHS_TO_SHOW = 6;

const PHASE_ICON: Record<NonNullable<CalendarDay["phase"]>, string> = {
  新月: "🌑",
  上弦: "🌓",
  満月: "🌕",
  下弦: "🌗"
};

const TIDE_STYLE: Record<TideName, string> = {
  大潮: "bg-[rgba(29,158,117,0.22)] text-[var(--teal-light)]",
  中潮: "bg-[rgba(29,158,117,0.08)] text-[var(--paper)]",
  小潮: "text-[var(--muted)]",
  長潮: "text-[var(--muted)]",
  若潮: "text-[var(--muted)]"
};

function DayCell({ day, isToday }: { day: CalendarDay; isToday: boolean }) {
  return (
    <div
      className={`flex min-h-[3.6rem] flex-col rounded-sm border px-1 py-1 text-center ${
        isToday ? "border-[var(--amber)]" : "border-[var(--border)]"
      } ${TIDE_STYLE[day.tide]}`}
      title={`${day.iso} 月齢${day.moonAge.toFixed(1)} 旧暦${day.lunarDay}日 ${day.tide}${day.phase ? ` ${day.phase}` : ""}`}
    >
      <div className="flex items-start justify-between leading-none">
        <span className={`text-[12px] ${isToday ? "font-bold text-[var(--amber)]" : ""}`}>{day.day}</span>
        <span className="text-[11px]" aria-label={day.phase ?? undefined}>
          {day.phase ? PHASE_ICON[day.phase] : ""}
        </span>
      </div>
      <div className="mt-auto text-[11px] font-semibold leading-tight">{day.tide}</div>
      {day.bachi ? (
        <div className={`text-[9px] leading-tight text-[var(--amber)] ${day.bachi === "本命" ? "font-bold" : ""}`}>
          {day.bachi}
        </div>
      ) : null}
      <div className="text-[9px] leading-tight text-[var(--muted)]">月齢{day.moonAge.toFixed(1)}</div>
    </div>
  );
}

export default function CalendarPage() {
  const today = todayJst();
  const months = buildMonths(today.year, today.month, MONTHS_TO_SHOW);

  return (
    <div className="max-w-3xl">
      <JsonLd
        data={[
          buildBreadcrumbJsonLd([
            { name: "トップ", path: "/" },
            { name: "バチ抜けカレンダー", path: "/calendar" }
          ])
        ]}
      />
      <h1 className="serif-title mb-4 text-2xl font-bold md:text-3xl">バチ抜けカレンダー</h1>
      <p className="mb-3 text-[13px] leading-[1.9] text-[var(--paper)]">
        釣行の計画に使える、月ごとの月齢と潮回りのカレンダーです。今月から半年分を並べています。バチ抜けの条件として語られる「大潮前後」「新月・満月」の日が、ひと目で分かります。
      </p>
      <p className="mb-6 text-[13px] leading-[1.9] text-[var(--paper)]">
        ただし、潮回りだけで抜ける日が決まるわけではありません。見極め方は
        <Link href="/columns/bachi-judge" className="mx-1 text-[var(--teal)] hover:underline">
          バチ抜け発生条件の見極め方
        </Link>
        に書いています。
      </p>

      <div className="mb-8 rounded-sm border border-[var(--border)] px-3 py-2 text-[11px] leading-[1.8] text-[var(--muted)]">
        <p>
          <span className="mr-3 text-[var(--teal-light)]">■ 大潮</span>
          <span className="mr-3 text-[var(--paper)]">■ 中潮</span>
          <span className="mr-3">■ 小潮・長潮・若潮</span>
          <span>🌑新月 🌓上弦 🌕満月 🌗下弦 ／ 黄色の枠が今日</span>
        </p>
        <p className="mt-1">
          <span className="mr-3 font-bold text-[var(--amber)]">本命</span>
          <span className="mr-3 text-[var(--amber)]">候補</span>
          <span>管理人のバチ抜けの目安(大潮の最終日から中潮4日目までが候補、中潮2・3日目が本命)</span>
        </p>
      </div>

      <div className="space-y-10">
        {months.map((month) => {
          const lead = month.days[0].weekday;
          return (
            <section key={`${month.year}-${month.month}`} aria-label={`${month.year}年${month.month}月`}>
              <h2 className="section-title mb-3">
                {month.year}年{month.month}月
              </h2>
              <div className="grid grid-cols-7 gap-1">
                {WEEKDAYS.map((w) => (
                  <div key={w} className="pb-1 text-center text-[10px] text-[var(--muted)]">
                    {w}
                  </div>
                ))}
                {Array.from({ length: lead }).map((_, i) => (
                  <div key={`blank-${i}`} />
                ))}
                {month.days.map((day) => (
                  <DayCell key={day.iso} day={day} isToday={day.iso === today.iso} />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <section className="mt-10 space-y-2 text-[12px] leading-[1.9] text-[var(--muted)]">
        <h2 className="text-xs tracking-[0.1em]">このカレンダーについて</h2>
        <p>
          月齢は、新月の時刻から、その日の正午(日本時間)までの経過日数です。潮回りは、旧暦の日にもとづく目安の区分(大潮は旧暦の29〜2日と14〜17日ごろ、小潮は7〜9日と22〜24日ごろなど)で、海上保安庁が紹介している区分に従っています。
        </p>
        <p>
          「候補」「本命」の印は、釣果や実際のバチの発生とは関係なく、ルールだけで機械的に付けています。大潮の最終日から、そのあとの中潮の4日目までが候補、そのうち中潮の2日目と3日目が本命です。大潮の前の中潮には付けていません。旧暦の日では、候補が2・3・6日と17・18・21日、本命が4・5日と19・20日です。
        </p>
        <p>
          潮名の区分は、新聞や釣り雑誌、潮見表によって1〜2日ずれることがあります。このページには満潮・干潮の時刻や潮位は載せていません。2027年の1〜3月分は
          <Link href="/calendar/2027" className="mx-1 text-[var(--teal)] hover:underline">
            2027年バチ抜けカレンダー
          </Link>
          に東京の満潮・干潮と日の入りを載せています。釣行前には、気象庁や海上保安庁の潮位表などで、釣り場の時刻も確認してください。
        </p>
      </section>
    </div>
  );
}
