// Unit tests for the lead-grading rubric in index.html.
// The function is extracted from the page source so the test always exercises
// the exact code that ships. Run: node test/grade.test.mjs
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const html = readFileSync(join(dirname(fileURLToPath(import.meta.url)), '..', 'index.html'), 'utf8');
const m = /function computeGrade\(heating, propertyType, timeline\) \{[\s\S]*?\n  \}/.exec(html);
if (!m) { console.error('FAIL: computeGrade not found in index.html'); process.exit(1); }
const computeGrade = new Function('return ' + m[0])();

const cases = [
  // [heating, property, timeline, expected, label]
  ['gas', 'detached', 'within-3-months', 'A', 'urgent fossil premium is the top grade'],
  ['gas', 'terraced', 'within-3-months', 'B', 'REGRESSION: urgent fossil terraced must not fall below medium leads'],
  ['gas', 'terraced', '3-6-months', 'B', 'medium fossil terraced holds B'],
  ['oil', 'semi-detached', '6-12-months', 'B', 'slow fossil premium still B'],
  ['electric', 'detached', 'within-3-months', 'B', 'urgent electric outranks timeline-only C'],
  ['electric', 'terraced', '3-6-months', 'C', 'non-urgent electric is C'],
];

let failed = 0;
for (const [heating, property, timeline, expected, label] of cases) {
  const got = computeGrade(heating, property, timeline);
  const ok = got === expected;
  if (!ok) failed++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${heating}+${property}+${timeline} -> ${got} (want ${expected})  ${label}`);
}
// Invariant: for the same profile, an urgent lead never grades below a slower one.
const rank = { A: 3, B: 2, C: 1 };
for (const heating of ['gas', 'oil', 'lpg', 'electric']) {
  for (const property of ['detached', 'semi-detached', 'terraced', 'bungalow']) {
    for (const slower of ['3-6-months', '6-12-months']) {
      const u = computeGrade(heating, property, 'within-3-months');
      const s = computeGrade(heating, property, slower);
      if (rank[u] < rank[s]) {
        failed++;
        console.log(`FAIL  invariant: ${heating}+${property} urgent(${u}) < ${slower}(${s})`);
      }
    }
  }
}
console.log(failed ? `\n${failed} failure(s)` : '\nAll grading tests pass (6 cases + urgency invariant sweep)');
process.exit(failed ? 1 : 0);
