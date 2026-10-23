import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculateDay, validSchedule } from '../timer.js';
const at = time => new Date(`2026-10-24T${time}:00`);
test('day boundaries and countdown', () => {
  assert.equal(calculateDay('12:00', '20:00', at('12:00')).percent, 99);
  assert.equal(calculateDay('12:00', '20:00', at('16:00')).percent, 50);
  assert.equal(calculateDay('12:00', '20:00', at('19:59')).percent, 1);
  assert.equal(calculateDay('12:00', '20:00', at('20:00')).percent, 0);
  assert.equal(calculateDay('12:00', '20:00', at('11:00')).before, true);
  const state = calculateDay('12:00', '20:00', at('12:01'));
  assert.equal(state.hours, 7); assert.equal(state.minutes, 59);
});
test('overnight shift crosses midnight', () => {
  const state = calculateDay('22:00', '06:00', at('02:00'));
  assert.equal(state.percent, 50); assert.equal(state.hours, 4); assert.equal(state.before, false);
  assert.equal(calculateDay('22:00', '06:00', at('21:00')).before, true);
});
test('invalid and equal time values rejected', () => {
  assert.equal(validSchedule('12:00', '20:00'), true);
  for (const [a,b] of [['12:00','12:00'], ['24:00','20:00'], ['x','12:00'], [null,'12:00']]) assert.equal(validSchedule(a,b), false);
});
