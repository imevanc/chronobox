import type { CustomFormat, DateComponents, DateInput } from "./types.d.ts";

import { ChronoBoxError } from "./errors";
import { isValidTimeUnit, truncateDate } from "./utils";
import { DateFormat, TimeUnit } from "./enums";

export class ChronoBox<TFormat extends DateFormat | CustomFormat = DateFormat> {
  private readonly date: Date;
  private readonly format: TFormat;

  constructor(date?: DateInput, format: TFormat = DateFormat.ISO as TFormat) {
    this.format = format;

    try {
      this.date = date ? new Date(date) : new Date();
      if (isNaN(this.date.getTime())) {
        throw new ChronoBoxError("Invalid date input");
      }
    } catch (error) {
      throw new ChronoBoxError(
        `Failed to parse date: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Add a specified amount of time units to the date
   * @param amount The number of units to add (can be negative to subtract)
   * @param unit The time unit to add (milliseconds, seconds, minutes, hours, days, weeks, months, years)
   * @returns A new ChronoBox instance with the updated date
   */
  add<T extends TimeUnit>(amount: number, unit: T): ChronoBox<TFormat> {
    const newDate = new Date(this.date);

    switch (unit) {
      case TimeUnit.MILLISECONDS:
        newDate.setMilliseconds(newDate.getMilliseconds() + amount);
        break;
      case TimeUnit.SECONDS:
        newDate.setSeconds(newDate.getSeconds() + amount);
        break;
      case TimeUnit.MINUTES:
        newDate.setMinutes(newDate.getMinutes() + amount);
        break;
      case TimeUnit.HOURS:
        newDate.setHours(newDate.getHours() + amount);
        break;
      case TimeUnit.DAYS:
        newDate.setDate(newDate.getDate() + amount);
        break;
      case TimeUnit.WEEKS:
        newDate.setDate(newDate.getDate() + amount * 7);
        break;
      case TimeUnit.MONTHS: {
        const dayOfMonth = newDate.getDate();
        newDate.setDate(1); // Temporarily set to the first of the month
        newDate.setMonth(newDate.getMonth() + amount);
        const maxDaysInNewMonth = new Date(
          newDate.getFullYear(),
          newDate.getMonth() + 1,
          0
        ).getDate();
        newDate.setDate(Math.min(dayOfMonth, maxDaysInNewMonth));
        break;
      }
      case TimeUnit.YEARS: {
        const dayOfMonth = newDate.getDate();
        newDate.setDate(1); // Temporarily set to the first of the month
        newDate.setFullYear(newDate.getFullYear() + amount);
        const maxDaysInNewMonth = new Date(
          newDate.getFullYear(),
          newDate.getMonth() + 1,
          0
        ).getDate();
        newDate.setDate(Math.min(dayOfMonth, maxDaysInNewMonth));
        break;
      }
      default:
        const _exhaustiveCheck: never = unit;
        throw new ChronoBoxError(`Unsupported time unit: ${unit}`);
    }

    return new ChronoBox<TFormat>(newDate, this.format);
  }

  /**
   * Subtract a specified amount of time units from the date
   * @param amount The number of units to subtract
   * @param unit The time unit to subtract (milliseconds, seconds, minutes, hours, days, weeks, months, years)
   * @returns A new ChronoBox instance with the updated date
   */
  subtract<T extends TimeUnit>(amount: number, unit: T): ChronoBox<TFormat> {
    return this.add(-amount, unit);
  }

  /**
   * Get the difference between two dates in the specified unit
   * @param other The date to compare with
   * @param unit The time unit to express the difference in (defaults to days)
   * @returns The difference between the dates in the specified unit
   */
  diff(other: DateInput, unit: TimeUnit = TimeUnit.DAYS): number {
    const otherDate = new Date(other);
    const diffMs = this.date.getTime() - otherDate.getTime();

    if (!isValidTimeUnit(unit)) {
      throw new ChronoBoxError(`Unsupported time unit: ${unit}`);
    }

    switch (unit) {
      case TimeUnit.MILLISECONDS:
        return diffMs;
      case TimeUnit.SECONDS:
        return diffMs / 1000;
      case TimeUnit.MINUTES:
        return diffMs / (1000 * 60);
      case TimeUnit.HOURS:
        return diffMs / (1000 * 60 * 60);
      case TimeUnit.DAYS:
        return diffMs / (1000 * 60 * 60 * 24);
      case TimeUnit.WEEKS:
        return diffMs / (1000 * 60 * 60 * 24 * 7);
      case TimeUnit.MONTHS:
        return (
          (this.date.getFullYear() - otherDate.getFullYear()) * 12 +
          (this.date.getMonth() - otherDate.getMonth())
        );
      case TimeUnit.YEARS:
        return this.date.getFullYear() - otherDate.getFullYear();
      default:
        const _exhaustiveCheck: never = unit;
        throw new ChronoBoxError(`Unsupported time unit: ${unit}`);
    }
  }

  /**
   * Get individual components of the date
   * @returns An object containing the year, month, day, hours, minutes, seconds, and milliseconds
   */
  getComponents(): DateComponents {
    return {
      year: this.date.getFullYear(),
      month: this.date.getMonth() + 1,
      day: this.date.getDate(),
      hours: this.date.getHours(),
      minutes: this.date.getMinutes(),
      seconds: this.date.getSeconds(),
      milliseconds: this.date.getMilliseconds(),
    };
  }

  /**
   * Format the date according to the format string
   * @returns A string representation of the date formatted according to the current format
   */
  formatDate(): string {
    const components = this.getComponents();
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    let result = this.format;

    return result
      .replace("YYYY", components.year.toString())
      .replace("MMMM", monthNames[components.month - 1])
      .replace("MM", components.month.toString().padStart(2, "0"))
      .replace("DD", components.day.toString().padStart(2, "0"));
  }

  /**
   * Check if the date is valid
   * @returns True if the date is valid, false otherwise
   */
  isValid(): boolean {
    return !isNaN(this.date.getTime());
  }

  /**
   * Get the underlying Date object
   * @returns A new Date object representing the current date
   */
  toDate(): Date {
    return new Date(this.date);
  }

  /**
   * Create a new ChronoBox with a different format
   * @param newFormat The new format to use for date formatting
   * @returns A new ChronoBox instance with the same date but different format
   */
  withFormat<NewFormat extends DateFormat | CustomFormat>(
    newFormat: NewFormat
  ): ChronoBox<NewFormat> {
    return new ChronoBox<NewFormat>(this.date, newFormat);
  }

  /**
   * Check if this date is after the specified date
   * @param other The date to compare against
   * @param granularity The time unit granularity for comparison (defaults to milliseconds for exact comparison)
   * @returns True if this date is after the specified date
   */
  isAfter(
    other: DateInput,
    granularity: TimeUnit = TimeUnit.MILLISECONDS
  ): boolean {
    const otherDate = new Date(other);

    if (granularity === TimeUnit.MILLISECONDS) {
      return this.date.getTime() > otherDate.getTime();
    }

    const thisDateTruncated = truncateDate(this.date, granularity).getTime();
    const otherDateTruncated = truncateDate(otherDate, granularity).getTime();

    return thisDateTruncated > otherDateTruncated;
  }

  /**
   * Check if this date is before the specified date
   * @param other The date to compare against
   * @param granularity The time unit granularity for comparison (defaults to milliseconds for exact comparison)
   * @returns True if this date is before the specified date
   */
  isBefore(
    other: DateInput,
    granularity: TimeUnit = TimeUnit.MILLISECONDS
  ): boolean {
    const otherDate = new Date(other);

    if (granularity === TimeUnit.MILLISECONDS) {
      return this.date.getTime() < otherDate.getTime();
    }

    const thisDateTruncated = truncateDate(this.date, granularity).getTime();
    const otherDateTruncated = truncateDate(otherDate, granularity).getTime();

    return thisDateTruncated < otherDateTruncated;
  }

  /**
   * Converts a date from one timezone to another
   * @param date The date to convert
   * @param fromTimezone The source timezone (e.g., 'America/New_York')
   * @param toTimezone The target timezone (e.g., 'Europe/London')
   * @returns A new Date object representing the same moment in the target timezone
   */
  convertTimezone(
    date: Date | ChronoBox,
    fromTimezone: string,
    toTimezone: string
  ): Date {
    const dateObj = date instanceof ChronoBox ? date.toDate() : date;

    const year = dateObj.getFullYear();
    const month = dateObj.getMonth();
    const day = dateObj.getDate();
    const hours = dateObj.getHours();
    const minutes = dateObj.getMinutes();
    const seconds = dateObj.getSeconds();
    const milliseconds = dateObj.getMilliseconds();

    const fromDateString = new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      timeZone: fromTimezone,
      hour12: false,
    }).format(
      new Date(year, month, day, hours, minutes, seconds, milliseconds)
    );

    const fromDate = new Date(fromDateString + " GMT");

    const timestamp = fromDate.getTime();

    const formatter = new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      timeZone: toTimezone,
      hour12: false,
    });

    const toDateString = formatter.format(new Date(timestamp));

    return new Date(toDateString + " GMT");
  }

  /**
   * Gets the timezone offset in minutes for a date in a specific timezone
   * @param date The date to get the offset for
   * @param timezone The timezone to get the offset for (e.g., 'America/New_York')
   * @returns The timezone offset in minutes (positive for timezones behind UTC, negative for timezones ahead of UTC)
   */
  getTimezoneOffsetMinutes(date: Date | ChronoBox, timezone: string): number {
    const dateObj = date instanceof ChronoBox ? date.toDate() : date;

    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: false,
    });

    const utcFormatter = new Intl.DateTimeFormat("en-US", {
      timeZone: "UTC",
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: false,
    });

    const zonedTime = new Date(formatter.format(dateObj) + " GMT");
    const utcTime = new Date(utcFormatter.format(dateObj) + " GMT");

    return (utcTime.getTime() - zonedTime.getTime()) / 60000;
  }

  /**
   * Helper function to find the exact hour of a DST transition using binary search
   * @param startDate The day before the transition
   * @param endDate The day of the transition
   * @param timezone The timezone to check
   * @returns The exact date and time of the transition
   */
  findExactTransitionHour(
    startDate: Date,
    endDate: Date,
    timezone: string
  ): Date {
    let start = startDate.getTime();
    let end = endDate.getTime();
    const startOffset = this.getTimezoneOffsetMinutes(
      new Date(start),
      timezone
    );

    while (end - start > 60000) {
      const mid = Math.floor((start + end) / 2);
      const midDate = new Date(mid);
      const midOffset = this.getTimezoneOffsetMinutes(midDate, timezone);

      if (midOffset === startOffset) {
        start = mid;
      } else {
        end = mid;
      }
    }

    return new Date(end);
  }

  /**
   * Checks if a date is in Daylight Saving Time (DST) for a specific timezone
   * @param date The date to check
   * @param timezone The timezone to check for DST (e.g., 'America/New_York')
   * @returns True if the date is in DST for the specified timezone, false otherwise
   */
  isInDST(date: Date | ChronoBox, timezone: string): boolean {
    const dateObj = date instanceof ChronoBox ? date.toDate() : date;

    const janDate = new Date(dateObj.getFullYear(), 0, 1);
    const janOffset = this.getTimezoneOffsetMinutes(janDate, timezone);

    const julyDate = new Date(dateObj.getFullYear(), 6, 1);
    const julyOffset = this.getTimezoneOffsetMinutes(julyDate, timezone);

    if (janOffset === julyOffset) {
      return false;
    }

    const dateOffset = this.getTimezoneOffsetMinutes(dateObj, timezone);

    return dateOffset === Math.max(janOffset, julyOffset);
  }

  /**
   * Finds the exact DST transition times for a given year in a specific timezone
   * @param year The year to find DST transitions for
   * @param timezone The timezone to check (e.g., 'America/New_York')
   * @returns An object with 'start' and 'end' properties containing the DST transition dates, or null if no DST
   */
  findDSTTransitions(
    year: number,
    timezone: string
  ): { start: Date | null; end: Date | null } {
    const startDate = new Date(Date.UTC(year, 0, 1));

    const result = {
      start: null as Date | null,
      end: null as Date | null,
    };

    const janOffset = this.getTimezoneOffsetMinutes(startDate, timezone);
    const julyOffset = this.getTimezoneOffsetMinutes(
      new Date(Date.UTC(year, 6, 1)),
      timezone
    );

    if (janOffset === julyOffset) {
      return result;
    }

    let previousOffset = janOffset;
    let foundTransitions = 0;

    for (let day = 2; day <= 366; day++) {
      const currentDate = new Date(Date.UTC(year, 0, day));

      if (currentDate.getUTCFullYear() > year) {
        break;
      }

      const currentOffset = this.getTimezoneOffsetMinutes(
        currentDate,
        timezone
      );

      if (currentOffset !== previousOffset) {
        const transitionDate = this.findExactTransitionHour(
          new Date(Date.UTC(year, 0, day - 1)),
          currentDate,
          timezone
        );

        if (!result.start) {
          result.start = transitionDate;
        } else if (!result.end) {
          result.end = transitionDate;
        }

        foundTransitions++;
        previousOffset = currentOffset;
      }
    }

    return result;
  }

  /**
   * Gets a human-readable string representing the time difference
   * between the current date and now
   * @param referenceDate Optional reference date to compare against (defaults to current time)
   * @returns A string representing the relative time (e.g., "5 minutes ago", "in 2 days")
   */
  fromNow(referenceDate?: DateInput): string {
    const now = referenceDate ? new Date(referenceDate) : new Date();
    const diffMs = now.getTime() - this.date.getTime();
    const isFuture = diffMs < 0;
    const absDiffMs = Math.abs(diffMs);

    // Time thresholds in milliseconds
    const SECOND = 1000;
    const MINUTE = 60 * SECOND;
    const HOUR = 60 * MINUTE;
    const DAY = 24 * HOUR;
    const WEEK = 7 * DAY;
    const MONTH = 30 * DAY;
    const YEAR = 365 * DAY;

    let value: number;
    let unit: string;

    if (absDiffMs < MINUTE) {
      value = Math.floor(absDiffMs / SECOND);
      unit = value === 1 ? "second" : "seconds";
    } else if (absDiffMs < HOUR) {
      value = Math.floor(absDiffMs / MINUTE);
      unit = value === 1 ? "minute" : "minutes";
    } else if (absDiffMs < DAY) {
      value = Math.floor(absDiffMs / HOUR);
      unit = value === 1 ? "hour" : "hours";
    } else if (absDiffMs < WEEK) {
      value = Math.floor(absDiffMs / DAY);
      unit = value === 1 ? "day" : "days";
    } else if (absDiffMs < MONTH) {
      value = Math.floor(absDiffMs / WEEK);
      unit = value === 1 ? "week" : "weeks";
    } else if (absDiffMs < YEAR) {
      // Calculate months more precisely using the diff method
      value = Math.abs(this.diff(now, TimeUnit.MONTHS));
      unit = value === 1 ? "month" : "months";
    } else {
      // Calculate years more precisely using the diff method
      value = Math.abs(this.diff(now, TimeUnit.YEARS));
      unit = value === 1 ? "year" : "years";
    }

    // For very small differences, show "just now"
    if (value === 0) {
      return "just now";
    }

    return isFuture ? `in ${value} ${unit}` : `${value} ${unit} ago`;
  }

  /**
   * Gets the start of a specified time unit for the current date
   * @param unit The time unit to get the start of (day, hour, minute, etc.)
   * @returns A new ChronoBox instance set to the start of the specified unit
   */
  startOf<T extends TimeUnit>(unit: T): ChronoBox<TFormat> {
    if (!isValidTimeUnit(unit)) {
      throw new ChronoBoxError(`Unsupported time unit: ${unit}`);
    }

    // Use the truncateDate utility for consistency with existing code
    const truncatedDate = truncateDate(this.date, unit);
    return new ChronoBox<TFormat>(truncatedDate, this.format);
  }

  /**
   * Gets the end of a specified time unit for the current date
   * @param unit The time unit to get the end of (day, hour, minute, etc.)
   * @returns A new ChronoBox instance set to the end of the specified unit
   */
  endOf<T extends TimeUnit>(unit: T): ChronoBox<TFormat> {
    if (!isValidTimeUnit(unit)) {
      throw new ChronoBoxError(`Unsupported time unit: ${unit}`);
    }

    const newDate = new Date(this.date);

    switch (unit) {
      case TimeUnit.MILLISECONDS:
        // Nothing to do for milliseconds
        break;
      case TimeUnit.SECONDS:
        newDate.setMilliseconds(999);
        break;
      case TimeUnit.MINUTES:
        newDate.setSeconds(59, 999);
        break;
      case TimeUnit.HOURS:
        newDate.setMinutes(59, 59, 999);
        break;
      case TimeUnit.DAYS:
        newDate.setHours(23, 59, 59, 999);
        break;
      case TimeUnit.WEEKS: {
        // First get to the start of the week using truncateDate
        const weekStart = truncateDate(newDate, TimeUnit.WEEKS);
        // Then add 6 days and set to end of that day
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);
        return new ChronoBox<TFormat>(weekEnd, this.format);
      }
      case TimeUnit.MONTHS: {
        // Set to the first day of the next month and subtract 1 millisecond
        const monthEnd = new Date(
          newDate.getFullYear(),
          newDate.getMonth() + 1,
          0,
          23,
          59,
          59,
          999
        );
        return new ChronoBox<TFormat>(monthEnd, this.format);
      }
      case TimeUnit.YEARS: {
        // Set to December 31st of the current year at 23:59:59.999
        const yearEnd = new Date(
          newDate.getFullYear(),
          11,
          31,
          23,
          59,
          59,
          999
        );
        return new ChronoBox<TFormat>(yearEnd, this.format);
      }
      default:
        const _exhaustiveCheck: never = unit;
        throw new ChronoBoxError(`Unsupported time unit: ${unit}`);
    }

    return new ChronoBox<TFormat>(newDate, this.format);
  }
}
