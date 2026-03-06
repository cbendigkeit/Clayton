import {
  formatCurrency,
  formatCurrencyCompact,
  parseCurrencyInput,
  formatDelta,
} from '../currency';

describe('formatCurrency', () => {
  it('formats a standard amount', () => {
    expect(formatCurrency(1234.5)).toBe('$1,234.50');
  });

  it('formats zero', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('formats negative amounts', () => {
    expect(formatCurrency(-50)).toBe('-$50.00');
  });

  it('formats small amounts with two decimal places', () => {
    expect(formatCurrency(5)).toBe('$5.00');
  });

  describe('compact option', () => {
    it('compacts amounts >= 1000', () => {
      expect(formatCurrency(2000, { compact: true })).toBe('$2k');
    });

    it('compacts with decimal when not a round thousand', () => {
      expect(formatCurrency(1500, { compact: true })).toBe('$1.5k');
    });

    it('does not compact amounts < 1000', () => {
      expect(formatCurrency(999, { compact: true })).toBe('$999.00');
    });

    it('compacts negative values >= 1000 in abs', () => {
      // negative sign ends up inside: $-2k (template string behavior)
      expect(formatCurrency(-2000, { compact: true })).toBe('$-2k');
    });
  });
});

describe('formatCurrencyCompact', () => {
  it('formats amounts >= 1M', () => {
    expect(formatCurrencyCompact(1_200_000)).toBe('$1.2M');
  });

  it('formats exactly 1M', () => {
    expect(formatCurrencyCompact(1_000_000)).toBe('$1.0M');
  });

  it('formats amounts >= 1k and < 1M', () => {
    expect(formatCurrencyCompact(65_000)).toBe('$65k');
  });

  it('formats amounts < 1k as full currency', () => {
    expect(formatCurrencyCompact(500)).toBe('$500.00');
  });

  it('handles negative amounts >= 1M in abs', () => {
    expect(formatCurrencyCompact(-2_000_000)).toBe('$-2.0M');
  });

  it('handles negative amounts >= 1k in abs', () => {
    expect(formatCurrencyCompact(-5_000)).toBe('$-5k');
  });
});

describe('parseCurrencyInput', () => {
  it('parses a dollar-sign prefixed string', () => {
    expect(parseCurrencyInput('$5.00')).toBe(5);
  });

  it('parses a plain number string', () => {
    expect(parseCurrencyInput('12.99')).toBe(12.99);
  });

  it('returns 0 for non-numeric input', () => {
    expect(parseCurrencyInput('abc')).toBe(0);
  });

  it('returns 0 for empty string', () => {
    expect(parseCurrencyInput('')).toBe(0);
  });

  it('strips commas', () => {
    expect(parseCurrencyInput('1,234.56')).toBe(1234.56);
  });

  it('rounds to 2 decimal places', () => {
    expect(parseCurrencyInput('3.14159')).toBe(3.14);
  });
});

describe('formatDelta', () => {
  it('prefixes positive amounts with +', () => {
    expect(formatDelta(12.5)).toBe('+$12.50');
  });

  it('does not double-prefix negative amounts', () => {
    expect(formatDelta(-3)).toBe('-$3.00');
  });

  it('formats zero with +', () => {
    expect(formatDelta(0)).toBe('+$0.00');
  });
});
