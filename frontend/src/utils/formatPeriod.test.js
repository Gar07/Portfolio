import assert from 'node:assert/strict';
import { formatPeriod } from './formatPeriod.js';

assert.equal(formatPeriod(0, 0), 'Sedang menempuh studi');
assert.equal(formatPeriod('0', '0'), 'Sedang menempuh studi');
assert.equal(formatPeriod(2024, 0), '2024 — Sekarang');
assert.equal(formatPeriod(2020, 2024), '2020 — 2024');
assert.equal(formatPeriod(0, 2024), 'Selesai 2024');
assert.equal(formatPeriod(0, 0, 'Periode belum dicantumkan'), 'Periode belum dicantumkan');
console.log('PASS: formatPeriod (6 cases)');
