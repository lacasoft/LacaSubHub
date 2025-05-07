/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Transform } from 'class-transformer';

export function FormatDate() {
  return Transform(({ value }) => {
    if (value === null || value === undefined) {
      return null;
    }

    let date: Date;

    if (value instanceof Date) {
      date = value;
    } else if (typeof value === 'string') {
      const mexicanDateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
      if (mexicanDateRegex.test(value)) {
        const [, day, month, year] = value.match(mexicanDateRegex) as string[];
        date = new Date(`${year}-${month}-${day}T00:00:00Z`);
      } else {
        date = new Date(value);
        if (!isValidDate(date)) {
          const isoString = value.replace(' ', 'T') + 'Z';
          date = new Date(isoString);
        }
      }
    } else {
      try {
        date = new Date(value);
      } catch {
        return null;
      }
    }

    return isValidDate(date) ? formatToMexicanDate(date) : null;
  });
}

const isValidDate = (date: Date): boolean => {
  return !isNaN(date.getTime());
};

const formatToMexicanDate = (date: Date): string => {
  return date.toLocaleDateString('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};
