import { solarToLunar } from '../lunar/vietnamese-lunar';

/** Language of the holiday names. */
export type HolidayLanguage = 'vi' | 'en';

/**
 * - `public`: a public holiday (nghỉ lễ) of the Labour Code. The days off around Tết and the
 *   Quốc khánh, and any day in lieu (nghỉ bù), are decided by the government every year and are
 *   not part of this list.
 * - `traditional`: a traditional festival (lunar calendar).
 * - `observance`: a commemorative or international day, not a day off.
 */
export type HolidayKind = 'public' | 'traditional' | 'observance';

export interface VietnameseHoliday {
  kind: HolidayKind;
  name: Readonly<Record<HolidayLanguage, string>>;
}

interface HolidayDef extends VietnameseHoliday {
  day: number;
  month: number;
}

const def = (
  day: number,
  month: number,
  kind: HolidayKind,
  vi: string,
  en: string
): HolidayDef => ({ day, month, kind, name: { vi, en } });

/** Fixed dates of the Gregorian calendar (day, month). */
const SOLAR_HOLIDAYS: readonly HolidayDef[] = [
  def(1, 1, 'public', 'Tết Dương lịch', "New Year's Day"),
  def(
    3,
    2,
    'observance',
    'Ngày thành lập Đảng Cộng sản Việt Nam',
    'Founding of the Communist Party of Vietnam'
  ),
  def(14, 2, 'observance', 'Lễ tình nhân', "Valentine's Day"),
  def(27, 2, 'observance', 'Ngày Thầy thuốc Việt Nam', "Vietnamese Doctors' Day"),
  def(8, 3, 'observance', 'Ngày Quốc tế Phụ nữ', "International Women's Day"),
  def(
    26,
    3,
    'observance',
    'Ngày thành lập Đoàn TNCS Hồ Chí Minh',
    'Founding of the Ho Chi Minh Communist Youth Union'
  ),
  def(
    30,
    4,
    'public',
    'Ngày Giải phóng miền Nam, thống nhất đất nước',
    'Reunification Day (Liberation of the South)'
  ),
  def(1, 5, 'public', 'Ngày Quốc tế Lao động', 'International Labour Day'),
  def(7, 5, 'observance', 'Ngày Chiến thắng Điện Biên Phủ', 'Dien Bien Phu Victory Day'),
  def(19, 5, 'observance', 'Ngày sinh Chủ tịch Hồ Chí Minh', "President Ho Chi Minh's Birthday"),
  def(1, 6, 'observance', 'Ngày Quốc tế Thiếu nhi', "International Children's Day"),
  def(21, 6, 'observance', 'Ngày Báo chí Cách mạng Việt Nam', 'Vietnamese Revolutionary Press Day'),
  def(28, 6, 'observance', 'Ngày Gia đình Việt Nam', 'Vietnamese Family Day'),
  def(27, 7, 'observance', 'Ngày Thương binh Liệt sĩ', 'War Invalids and Martyrs Day'),
  def(19, 8, 'observance', 'Ngày Cách mạng Tháng Tám', 'August Revolution Day'),
  def(2, 9, 'public', 'Quốc khánh', 'National Day'),
  def(10, 10, 'observance', 'Ngày Giải phóng Thủ đô', 'Hanoi Liberation Day'),
  def(13, 10, 'observance', 'Ngày Doanh nhân Việt Nam', "Vietnamese Entrepreneurs' Day"),
  def(20, 10, 'observance', 'Ngày Phụ nữ Việt Nam', "Vietnamese Women's Day"),
  def(20, 11, 'observance', 'Ngày Nhà giáo Việt Nam', "Vietnamese Teachers' Day"),
  def(
    22,
    12,
    'observance',
    'Ngày thành lập Quân đội nhân dân Việt Nam',
    "Vietnam People's Army Day"
  ),
  def(24, 12, 'observance', 'Đêm Giáng sinh', 'Christmas Eve'),
  def(25, 12, 'observance', 'Lễ Giáng sinh', 'Christmas Day'),
];

/** Fixed dates of the lunar calendar (day, month); a leap month (tháng nhuận) has none of them. */
const LUNAR_HOLIDAYS: readonly HolidayDef[] = [
  def(1, 1, 'public', 'Mùng 1 Tết Nguyên đán', 'Lunar New Year (Tết), day 1'),
  def(2, 1, 'public', 'Mùng 2 Tết Nguyên đán', 'Lunar New Year (Tết), day 2'),
  def(3, 1, 'public', 'Mùng 3 Tết Nguyên đán', 'Lunar New Year (Tết), day 3'),
  def(15, 1, 'traditional', 'Rằm tháng Giêng (Tết Nguyên tiêu)', 'Lantern Festival'),
  def(3, 3, 'traditional', 'Tết Hàn thực', 'Cold Food Festival'),
  def(10, 3, 'public', 'Giỗ Tổ Hùng Vương', "Hung Kings' Commemoration Day"),
  def(15, 4, 'traditional', 'Lễ Phật đản', "Buddha's Birthday (Vesak)"),
  def(5, 5, 'traditional', 'Tết Đoan ngọ', 'Mid-year Festival (Double Fifth)'),
  def(15, 7, 'traditional', 'Lễ Vu Lan', 'Vu Lan Festival (Ghost Festival)'),
  def(15, 8, 'traditional', 'Tết Trung thu', 'Mid-Autumn Festival'),
  def(23, 12, 'traditional', 'Ông Công, Ông Táo', 'Kitchen Gods Day'),
];

/** The last day of the lunar year, the evening of Tết. */
const LUNAR_NEW_YEARS_EVE: VietnameseHoliday = {
  kind: 'public',
  name: { vi: 'Giao thừa', en: "Lunar New Year's Eve" },
};

const key = (month: number, day: number): number => month * 100 + day;

const index = (defs: readonly HolidayDef[]): ReadonlyMap<number, readonly HolidayDef[]> => {
  const map = new Map<number, HolidayDef[]>();
  for (const holiday of defs) {
    const list = map.get(key(holiday.month, holiday.day)) ?? [];
    list.push(holiday);
    map.set(key(holiday.month, holiday.day), list);
  }
  return map;
};

const SOLAR_INDEX = index(SOLAR_HOLIDAYS);
const LUNAR_INDEX = index(LUNAR_HOLIDAYS);

/**
 * The holidays and commemorations of a day of the Gregorian calendar (`month` is 1–12), from a
 * static list: fixed solar dates, and fixed lunar dates through `solarToLunar`. It does not know the
 * days off the government adds every year (Tết, Quốc khánh, days in lieu).
 */
export function getVietnameseHolidays(
  day: number,
  month: number,
  year: number
): readonly VietnameseHoliday[] {
  const holidays: VietnameseHoliday[] = [...(SOLAR_INDEX.get(key(month, day)) ?? [])];

  const lunar = solarToLunar(day, month, year);
  if (!lunar.isLeap) {
    holidays.push(...(LUNAR_INDEX.get(key(lunar.month, lunar.day)) ?? []));
  }

  // Giao thừa is the last day of lunar month 12 (the 29th or the 30th): the day before the 1st
  if (lunar.month === 12 && lunar.day >= 29 && !lunar.isLeap) {
    const next = new Date(year, month - 1, day + 1);
    const nextLunar = solarToLunar(next.getDate(), next.getMonth() + 1, next.getFullYear());
    if (nextLunar.month === 1 && nextLunar.day === 1) {
      holidays.unshift(LUNAR_NEW_YEARS_EVE);
    }
  }

  return holidays;
}

/** The names of a day's holidays, in one line (`null` when there is none). */
export function vietnameseHolidayText(
  day: number,
  month: number,
  year: number,
  language: HolidayLanguage
): string | null {
  const holidays = getVietnameseHolidays(day, month, year);
  return holidays.length ? holidays.map((holiday) => holiday.name[language]).join(' · ') : null;
}
