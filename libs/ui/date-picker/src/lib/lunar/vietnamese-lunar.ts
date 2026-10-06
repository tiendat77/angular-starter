/**
 * Solar → Vietnamese lunar (Âm lịch) conversion.
 *
 * Ported from https://github.com/tiendat77/vietnamese-lunar-calendar (`convertSolar2Lunar`), which
 * uses the astronomical algorithm of Hồ Ngọc Đức (https://www.informatik.uni-leipzig.de/~duc/amlich/).
 * Only the solar → lunar direction is needed by the date picker, so the holiday and stem-branch
 * tables of the original are left out.
 */

/** Vietnam is UTC+7, regardless of the browser's timezone. */
const VIETNAM_TIMEZONE = 7;

/** Mean length of a synodic month, in days. */
const SYNODIC_MONTH = 29.530588853;

/** Julian day of the reference new moon used by the algorithm (k = 0). */
const NEW_MOON_EPOCH = 2415021.076998695;

export interface LunarDate {
  /** Day of the lunar month (1–30). */
  day: number;
  /** Lunar month (1–12). */
  month: number;
  /** Lunar year. */
  year: number;
  /** Whether the month is a leap month (tháng nhuận). */
  isLeap: boolean;
}

const INT = Math.floor;
const DEG_TO_RAD = Math.PI / 180;

/** Julian day number of a Gregorian (or Julian, before 1582-10-15) calendar date. */
function jdFromDate(day: number, month: number, year: number): number {
  const a = INT((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;

  const jd =
    day + INT((153 * m + 2) / 5) + 365 * y + INT(y / 4) - INT(y / 100) + INT(y / 400) - 32045;
  return jd < 2299161 ? day + INT((153 * m + 2) / 5) + 365 * y + INT(y / 4) - 32083 : jd;
}

/** Julian day number (as a day count) of the k-th new moon after 1900-01-01, unrounded. */
function newMoon(k: number): number {
  const T = k / 1236.85;
  const T2 = T * T;
  const T3 = T2 * T;

  let Jd1 = 2415020.75933 + 29.53058868 * k + 0.0001178 * T2 - 0.000000155 * T3;
  Jd1 += 0.00033 * Math.sin((166.56 + 132.87 * T - 0.009173 * T2) * DEG_TO_RAD);

  const M = 359.2242 + 29.10535608 * k - 0.0000333 * T2 - 0.00000347 * T3;
  const Mpr = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 0.00001236 * T3;
  const F = 21.2964 + 390.67050646 * k - 0.0016528 * T2 - 0.00000239 * T3;

  const sin = (degrees: number) => Math.sin(DEG_TO_RAD * degrees);
  let C1 = (0.1734 - 0.000393 * T) * sin(M) + 0.0021 * sin(2 * M);
  C1 += -0.4068 * sin(Mpr) + 0.0161 * sin(2 * Mpr) - 0.0004 * sin(3 * Mpr);
  C1 += 0.0104 * sin(2 * F) - 0.0051 * sin(M + Mpr) - 0.0074 * sin(M - Mpr);
  C1 += 0.0004 * sin(2 * F + M) - 0.0004 * sin(2 * F - M) - 0.0006 * sin(2 * F + Mpr);
  C1 += 0.001 * sin(2 * F - Mpr) + 0.0005 * sin(2 * Mpr + M);

  const deltaT =
    T < -11
      ? 0.001 + 0.000839 * T + 0.0002261 * T2 - 0.00000845 * T3 - 0.000000081 * T * T3
      : -0.000278 + 0.000265 * T + 0.000262 * T2;

  return Jd1 + C1 - deltaT;
}

/** Day number of the k-th new moon at local midnight. */
function getNewMoon(k: number, timezone: number): number {
  return INT(newMoon(k) + 0.5 + timezone / 24);
}

/** Sun longitude (radians, 0–2π) at the given Julian day number. */
function sunLongitude(jdn: number): number {
  const T = (jdn - 2451545.0) / 36525;
  const T2 = T * T;
  const M = 357.5291 + 35999.0503 * T - 0.0001559 * T2 - 0.00000048 * T * T2;
  const L0 = 280.46645 + 36000.76983 * T + 0.0003032 * T2;

  let DL = (1.9146 - 0.004817 * T - 0.000014 * T2) * Math.sin(DEG_TO_RAD * M);
  DL +=
    (0.019993 - 0.000101 * T) * Math.sin(DEG_TO_RAD * 2 * M) +
    0.00029 * Math.sin(DEG_TO_RAD * 3 * M);

  const L = (L0 + DL) * DEG_TO_RAD;
  return L - Math.PI * 2 * INT(L / (Math.PI * 2));
}

/** Major solar term (0–11) at local midnight of the given day. */
function getSunLongitude(jdn: number, timezone: number): number {
  return INT((sunLongitude(jdn - 0.5 - timezone / 24) / Math.PI) * 6);
}

/** Day that starts lunar month 11 of the given year. */
function getLunarMonth11(year: number, timezone: number): number {
  const off = jdFromDate(31, 12, year) - 2415021;
  const k = INT(off / SYNODIC_MONTH);
  const nm = getNewMoon(k, timezone);
  return getSunLongitude(nm, timezone) >= 9 ? getNewMoon(k - 1, timezone) : nm;
}

/** Offset (in months after month 11 at `a11`) of the leap month. */
function getLeapMonthOffset(a11: number, timezone: number): number {
  const k = INT((a11 - NEW_MOON_EPOCH) / SYNODIC_MONTH + 0.5);
  let i = 1;
  let last: number;
  let arc = getSunLongitude(getNewMoon(k + i, timezone), timezone);

  do {
    i++;
    last = arc;
    arc = getSunLongitude(getNewMoon(k + i, timezone), timezone);
  } while (arc !== last && i < 14);

  return i - 1;
}

/**
 * Converts a solar (Gregorian) date to the Vietnamese lunar date.
 * @param day Day of month (1–31).
 * @param month Month (1–12, **not** zero-based).
 * @param year Full year.
 */
export function solarToLunar(day: number, month: number, year: number): LunarDate {
  const timezone = VIETNAM_TIMEZONE;
  const dayNumber = jdFromDate(day, month, year);
  const k = INT((dayNumber - NEW_MOON_EPOCH) / SYNODIC_MONTH);

  let monthStart = getNewMoon(k + 1, timezone);
  if (monthStart > dayNumber) {
    monthStart = getNewMoon(k, timezone);
  }

  let a11 = getLunarMonth11(year, timezone);
  let b11 = a11;
  let lunarYear: number;
  if (a11 >= monthStart) {
    lunarYear = year;
    a11 = getLunarMonth11(year - 1, timezone);
  } else {
    lunarYear = year + 1;
    b11 = getLunarMonth11(year + 1, timezone);
  }

  const lunarDay = dayNumber - monthStart + 1;
  const diff = INT((monthStart - a11) / 29);
  let isLeap = false;
  let lunarMonth = diff + 11;

  if (b11 - a11 > 365) {
    const leapMonthDiff = getLeapMonthOffset(a11, timezone);
    if (diff >= leapMonthDiff) {
      lunarMonth = diff + 10;
      isLeap = diff === leapMonthDiff;
    }
  }

  if (lunarMonth > 12) {
    lunarMonth -= 12;
  }

  if (lunarMonth >= 11 && diff < 4) {
    lunarYear -= 1;
  }

  return { day: lunarDay, month: lunarMonth, year: lunarYear, isLeap };
}

/**
 * Short label for a calendar cell: the day of the lunar month, or `day/month` on the first day of
 * a lunar month (e.g. `1/10`).
 */
export function formatLunarLabel(lunar: LunarDate): string {
  return lunar.day === 1 ? `${lunar.day}/${lunar.month}` : `${lunar.day}`;
}
