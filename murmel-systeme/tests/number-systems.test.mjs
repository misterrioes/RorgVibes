import assert from "node:assert/strict";
import test from "node:test";
import { contributionSum, convert, decompose, validateDecimal } from "../dist/number-systems.js";
import { marbleLayout } from "../dist/layout.js";

test("converts the tutorial examples", () => {
  assert.equal(convert(25, 2), "11001");
  assert.equal(convert(125, 8), "175");
  assert.equal(convert(54, 15), "39");
  assert.equal(convert(1023, 16), "3FF");
});

test("represents zero with an empty units container", () => {
  assert.deepEqual(decompose(0, 2), [
    { power: 0, weight: 1, digit: 0, symbol: "0", capacity: 1, contribution: 0 },
  ]);
});

test("every contribution fits and sums to the decimal value for every supported base", () => {
  for (let base = 2; base <= 16; base += 1) {
    for (const decimal of [0, 1, 25, 54, 125, 511, 1023]) {
      const places = decompose(decimal, base);
      assert.ok(places.every((place) => place.contribution <= place.capacity));
      assert.equal(contributionSum(decimal, base), decimal);
    }
  }
});

test("validates the input range and integers", () => {
  assert.equal(validateDecimal(0).valid, true);
  assert.equal(validateDecimal(1023).valid, true);
  assert.equal(validateDecimal(-1).valid, false);
  assert.equal(validateDecimal(1024).valid, false);
  assert.equal(validateDecimal(2.5).valid, false);
  assert.equal(validateDecimal("").valid, false);
});

test("scales marbles with their vessel while fitting every supported base", () => {
  for (let base = 2; base <= 16; base += 1) {
    const unitLayout = marbleLayout(1, base);
    const higherLayout = marbleLayout(base, base);
    const occupiedWidth = unitLayout.marble * unitLayout.columns
      + unitLayout.gap * (unitLayout.columns - 1);

    assert.ok(higherLayout.marble > unitLayout.marble);
    assert.ok(occupiedWidth <= unitLayout.vessel * 0.8);
    assert.ok(unitLayout.marble >= 7);
  }
});

test("doubles marble and vessel area from binary place 32 to 64", () => {
  const place32 = marbleLayout(32, 2);
  const place64 = marbleLayout(64, 2);
  const vesselAreaRatio = (place64.vessel / place32.vessel) ** 2;
  const marbleAreaRatio = (place64.marble / place32.marble) ** 2;

  assert.ok(Math.abs(vesselAreaRatio - 2) < 0.01);
  assert.ok(Math.abs(marbleAreaRatio - 2) < 0.01);
  assert.ok(Math.abs(
    place32.marble / place32.vessel - place64.marble / place64.vessel,
  ) < 0.001);
});
