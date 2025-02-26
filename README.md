# ChronoBox

ChronoBox is a lightweight, versatile, and easy-to-use TypeScript library for handling date manipulation and formatting. It provides a powerful API for adding, subtracting, comparing, and formatting dates.

## 🚀 Features

- Add and subtract time units (e.g., days, weeks, months, years) with ease
- Calculate differences between dates in various time units
- Retrieve individual components of a date
- Format dates using custom formats
- Built-in validation for date inputs
- Fully written in TypeScript with strong type safety

## 📦 Installation

```bash
npm install chronobox
```

## 📖 API Reference
### ChronoBox
The ChronoBox class provides a convenient and powerful API for date manipulation, formatting, and validation.

### Constructor
```typescript
new ChronoBox<TFormat extends DateFormat | CustomFormat = DateFormat>(date?: DateInput, format?: TFormat)
```
- date (optional): The date to initialize the ChronoBox instance. If not provided, the current date and time will be used.
- format (optional): The format for the date output. Defaults to DateFormat.ISO.

### Methods
```typescript
add<T extends TimeUnit>(amount: number, unit: T): ChronoBox<TFormat>
```
Adds a specified amount of time to the current date.

- amount: The amount of time to add.
- unit: The unit of time to add (e.g., TimeUnit.DAYS, TimeUnit.MONTHS, etc.).
- returns: A new ChronoBox instance with the updated date.
---
```typescript
subtract<T extends TimeUnit>(amount: number, unit: T): ChronoBox<TFormat>
```
Subtracts a specified amount of time from the current date.

- amount: The amount of time to subtract.
- unit: The unit of time to subtract.
- returns: A new ChronoBox instance with the updated date.
---
```typescript
diff(other: DateInput, unit: TimeUnit = TimeUnit.DAYS): number
```
Calculates the difference between the current date and another date in the specified time unit.

- other: The other date to compare with.
- unit: The unit of time for the difference (e.g., TimeUnit.DAYS, TimeUnit.MONTHS, etc.).
- returns: The difference in the specified time unit.
---
```typescript
getComponents(): DateComponents
```
Returns the individual components (year, month, day, hours, minutes, seconds, milliseconds) of the date.

- returns: An object with the above structure.

---

```typescript
formatDate(): string
```
Formats the current date according to the specified format.

- returns: A string representation of the date based on the format.
---
```typescript
isValid(): boolean
```
Checks whether the current date is valid.

- returns: true if the date is valid, otherwise false.
---
```typescript
toDate(): Date
```
Returns the underlying Date object from the ChronoBox instance.

- returns: A Date object representing the current date.

---
```typescript
withFormat<NewFormat extends DateFormat | CustomFormat>(newFormat: NewFormat): ChronoBox<NewFormat>
```

Creates a new ChronoBox instance with a different format.

- newFormat: The new format for the date.
- returns: A new ChronoBox instance with the updated format.

---
```typescript
isAfter(other: DateInput, granularity: TimeUnit = TimeUnit.MILLISECONDS): boolean
```

Checks if this date is after the specified date.
- other: The date to compare against.
- granularity: The time unit granularity for comparison (defaults to milliseconds for exact comparison).
- returns: true if this date is after the specified date.


---
```typescript
isBefore(other: DateInput, granularity: TimeUnit = TimeUnit.MILLISECONDS): boolean
```

Checks if this date is before the specified date.
- other: The date to compare against.
- granularity: The time unit granularity for comparison (defaults to milliseconds for exact comparison).
- returns: true if this date is before the specified date.

---
```typescript
convertTimezone(date: Date | ChronoBox, fromTimezone: string, toTimezone: string): Date
```

Converts a date from one timezone to another
- date: The date to convert.
- fromTimezone: The source timezone (e.g., 'America/New_York').
- toTimezone: The target timezone (e.g., 'Europe/London').
- returns: A new Date object representing the same moment in the target timezone.

---
```typescript
getTimezoneOffsetMinutes(date: Date | ChronoBox, timezone: string): number
```

Gets the timezone offset in minutes for a date in a specific timezone.
- date: The date to get the offset for.
- timezone: The timezone to get the offset for (e.g., 'America/New_York').
- returns: The timezone offset in minutes (positive for timezones behind UTC, negative for timezones ahead of UTC).

---
```typescript
isInDST(date: Date | ChronoBox, timezone: string): boolean
```

Checks if a date is in Daylight Saving Time (DST) for a specific timezone.
- date: The date to check.
- timezone: The timezone to check for DST (e.g., 'America/New_York').
- returns: true if the date is in DST for the specified timezone, false otherwise.

---
```typescript
findDSTTransitions(year: number, timezone: string): { start: Date | null; end: Date | null }
```

Finds the exact DST transition times for a given year in a specific timezone.
- year: The year to find DST transitions for.
- timezone: The timezone to check (e.g., 'America/New_York').
- returns: An object with start and end properties containing the DST transition dates, or null if no DST.

## 📝 Contributing
Contributions are welcome! Please follow these steps:


1. Fork this repository.
2. Create a feature branch: git checkout -b feat/feature-name.
3. Commit your changes: git commit -m "feat: add feature-name".
4. Push to your branch: git push origin feat/feature-name.
5. Open a pull request.

## 📄 License
ChronoBox is open-source software, licensed under the MIT License.

## ❤️ Support
If you find ChronoBox helpful, please give it a ⭐️ on GitHub and share it with your fellow developers!