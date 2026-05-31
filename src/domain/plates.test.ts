import { platesPerSide, barbellPlates } from './plates';

describe('platesPerSide', () => {
  it('loads 100kg on a 20kg bar as 40 per side', () => {
    const { perSide, leftover } = platesPerSide(100, 20, [25, 20, 15, 10, 5, 2.5, 1.25]);
    expect(perSide).toEqual([25, 15]); // 40 per side
    expect(leftover).toBe(0);
  });

  it('returns no plates when target <= bar', () => {
    expect(platesPerSide(20, 20, [25, 20])).toEqual({ perSide: [], leftover: 0 });
  });

  it('reports an unrepresentable leftover', () => {
    // 61kg on 20kg bar => 20.5 per side; smallest plate 1.25 leaves 0.5*2 = 1
    const { leftover } = platesPerSide(61, 20, [25, 20, 15, 10, 5, 2.5, 1.25]);
    expect(leftover).toBeCloseTo(1, 5);
  });
});

describe('barbellPlates', () => {
  it('uses kg bar/plates for kg', () => {
    const r = barbellPlates(60, 'kg');
    expect(r.barWeight).toBe(20);
    expect(r.perSide).toEqual([20]); // 20 per side
  });
  it('uses lb bar/plates for lb', () => {
    const r = barbellPlates(61.235, 'lb'); // ~135 lb
    expect(r.barWeight).toBe(45);
    expect(r.perSide).toEqual([45]); // 45 per side -> 135 lb
  });
});
