import { describe, expect, it } from 'vitest';
import { solarToLunar } from '../lunar/vietnamese-lunar';
import { getVietnameseHolidays, vietnameseHolidayText } from './vietnamese-holidays';

const names = (day: number, month: number, year: number, language: 'vi' | 'en' = 'en'): string[] =>
  getVietnameseHolidays(day, month, year).map((holiday) => holiday.name[language]);

describe('Vietnamese holidays', () => {
  it('knows the fixed solar holidays, in both languages', () => {
    expect(names(2, 9, 2026)).toEqual(['National Day']);
    expect(names(2, 9, 2026, 'vi')).toEqual(['Quốc khánh']);
    expect(names(30, 4, 2026, 'vi')[0]).toContain('Giải phóng miền Nam');
    expect(names(1, 5, 2026)).toEqual(['International Labour Day']);
    expect(names(1, 1, 2026)).toEqual(["New Year's Day"]);
  });

  it('marks the public holidays and tells them from the commemorations', () => {
    expect(getVietnameseHolidays(2, 9, 2026)[0].kind).toBe('public');
    expect(getVietnameseHolidays(8, 3, 2026)[0].kind).toBe('observance');
  });

  it('knows Tết, from the lunar calendar', () => {
    // Tết Bính Ngọ: 17 February 2026
    expect(solarToLunar(17, 2, 2026)).toMatchObject({ day: 1, month: 1, isLeap: false });
    expect(names(16, 2, 2026)).toEqual(["Lunar New Year's Eve"]);
    expect(names(16, 2, 2026, 'vi')).toEqual(['Giao thừa']);
    expect(names(17, 2, 2026, 'vi')).toEqual(['Mùng 1 Tết Nguyên đán']);
    expect(names(18, 2, 2026)).toEqual(['Lunar New Year (Tết), day 2']);
    expect(names(19, 2, 2026)).toEqual(['Lunar New Year (Tết), day 3']);
    expect(names(20, 2, 2026)).toEqual([]);
  });

  it('knows the other lunar holidays', () => {
    expect(names(3, 3, 2026)).toEqual(['Lantern Festival']); // Rằm tháng Giêng
    expect(names(26, 4, 2026, 'vi')).toEqual(['Giỗ Tổ Hùng Vương']); // 10/3 âm
    expect(names(25, 9, 2026)).toEqual(['Mid-Autumn Festival']); // 15/8 âm
  });

  it('puts Giao thừa on the last day of the lunar year whether it has 29 or 30 days', () => {
    for (const year of [2024, 2025, 2026, 2027, 2028]) {
      const eves = [];
      for (let day = 0; day < 366; day++) {
        const date = new Date(year, 0, 1 + day);
        if (date.getFullYear() !== year) break;
        const found = names(date.getDate(), date.getMonth() + 1, year, 'vi').includes('Giao thừa');
        if (found) {
          eves.push(date);
        }
      }
      expect(eves).toHaveLength(1);
      const next = new Date(eves[0].getFullYear(), eves[0].getMonth(), eves[0].getDate() + 1);
      expect(solarToLunar(next.getDate(), next.getMonth() + 1, next.getFullYear())).toMatchObject({
        day: 1,
        month: 1,
      });
    }
  });

  it('does not repeat a lunar holiday in a leap month', () => {
    // 2020 has a leap 4th month: its 15th is not another Phật đản
    let leapFifteenth: Date | null = null;
    for (let day = 0; day < 366; day++) {
      const date = new Date(2020, 0, 1 + day);
      const lunar = solarToLunar(date.getDate(), date.getMonth() + 1, date.getFullYear());
      if (lunar.isLeap && lunar.month === 4 && lunar.day === 15) {
        leapFifteenth = date;
      }
    }
    expect(leapFifteenth).not.toBeNull();
    expect(
      names(leapFifteenth!.getDate(), leapFifteenth!.getMonth() + 1, 2020, 'vi')
    ).not.toContain('Lễ Phật đản');
  });

  it('returns nothing for an ordinary day, and null text', () => {
    expect(getVietnameseHolidays(11, 6, 2026)).toEqual([]);
    expect(vietnameseHolidayText(11, 6, 2026, 'en')).toBeNull();
  });

  it('joins the names of a day with several holidays', () => {
    let joined: string | null = null;
    for (let year = 2020; year <= 2040 && !joined; year++) {
      for (let day = 0; day < 366 && !joined; day++) {
        const date = new Date(year, 0, 1 + day);
        if (getVietnameseHolidays(date.getDate(), date.getMonth() + 1, year).length > 1) {
          joined = vietnameseHolidayText(date.getDate(), date.getMonth() + 1, year, 'en');
        }
      }
    }
    expect(joined).toContain(' · ');
  });

  it('every holiday has a name in both languages', () => {
    for (let month = 1; month <= 12; month++) {
      for (let day = 1; day <= 28; day++) {
        for (const holiday of getVietnameseHolidays(day, month, 2026)) {
          expect(holiday.name.vi.length).toBeGreaterThan(0);
          expect(holiday.name.en.length).toBeGreaterThan(0);
        }
      }
    }
  });
});
