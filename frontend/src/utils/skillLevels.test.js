import assert from 'node:assert/strict';
import { SKILL_LEVELS, getSkillLevel } from './skillLevels.js';

for (const level of SKILL_LEVELS) {
  assert.equal(getSkillLevel(level.value.toLowerCase()).value, level.value);
  assert.ok(level.label && level.description);
}
assert.equal(getSkillLevel('  Advanced  ').label, 'Mahir');
for (const value of ['', null, undefined, 'Professional']) {
  assert.equal(getSkillLevel(value).label, 'Belum dinilai');
  assert.equal(getSkillLevel(value).value, '');
}
console.log('PASS: definisi level, nilai lama, dan level yang belum ditentukan');
