export const DIGITS = "0123456789ABCDEF";

export function validateDecimal(raw) {
  if (raw === "" || raw === null || raw === undefined) {
    return { valid: false, message: "Bitte gib eine Zahl ein." };
  }

  const value = Number(raw);
  if (!Number.isInteger(value)) {
    return { valid: false, message: "Bitte gib eine ganze Zahl ein." };
  }
  if (value < 0 || value > 1023) {
    return { valid: false, message: "Die Zahl muss zwischen 0 und 1023 liegen." };
  }
  return { valid: true, value };
}

export function validateBase(base) {
  const numericBase = Number(base);
  if (!Number.isInteger(numericBase) || numericBase < 2 || numericBase > 16) {
    throw new RangeError("Die Basis muss eine ganze Zahl zwischen 2 und 16 sein.");
  }
  return numericBase;
}

export function decompose(decimal, base) {
  const checked = validateDecimal(decimal);
  if (!checked.valid) throw new RangeError(checked.message);
  const numericBase = validateBase(base);
  const value = checked.value;

  if (value === 0) {
    return [{ power: 0, weight: 1, digit: 0, symbol: "0", capacity: numericBase - 1, contribution: 0 }];
  }

  const places = [];
  let remaining = value;
  let power = 0;
  while (remaining > 0) {
    const digit = remaining % numericBase;
    const weight = numericBase ** power;
    places.unshift({
      power,
      weight,
      digit,
      symbol: DIGITS[digit],
      capacity: (numericBase - 1) * weight,
      contribution: digit * weight,
    });
    remaining = Math.floor(remaining / numericBase);
    power += 1;
  }
  return places;
}

export function convert(decimal, base) {
  return decompose(decimal, base).map((place) => place.symbol).join("");
}

export function contributionSum(decimal, base) {
  return decompose(decimal, base).reduce((sum, place) => sum + place.contribution, 0);
}
