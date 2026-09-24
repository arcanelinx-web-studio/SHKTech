import test from 'node:test';
import assert from 'node:assert/strict';
import { buildMessage, whatsappUrl, createReference } from '../src/utils/whatsapp.ts';
import { parseItems } from '../src/stores/enquiry.ts';
test('message omits empty fields and preserves machine, item notes and Unicode', () => {
  const message = buildMessage(
    {
      name: 'A & B',
      machineModel: 'VMC / 40',
      details: 'Bore Ø100 ±0.01',
      attachmentNames: ['part drawing.pdf'],
    },
    [{ id: 'laser', title: 'Laser calibration', kind: 'service', note: 'Check X axis' }],
    'SHK-WEB-ABC123',
  );
  assert.match(message, /REF: SHK-WEB-ABC123/);
  assert.match(message, /1\. Laser calibration — Check X axis/);
  assert.match(message, /Bore Ø100 ±0.01/);
  assert.doesNotMatch(message, /Email:|Company:|Phone:/);
  assert.match(message, /I will attach these files/);
  assert.equal(new URL(whatsappUrl(message)).searchParams.get('text'), message);
});
test('empty requirement does not produce empty headings', () => {
  const message = buildMessage({}, [], 'SHK-WEB-TEST');
  assert.doesNotMatch(message, /MACHINE|SELECTED ITEMS|CONTACT\n|REQUIREMENT\n/);
});
test('saved list rejects invalid JSON, invalid shapes and duplicate ids', () => {
  assert.deepEqual(parseItems('{'), []);
  assert.deepEqual(parseItems('{}'), []);
  assert.deepEqual(parseItems('[null,{"id":4}]'), []);
  const item = { id: 'test', title: 'A', kind: 'category' };
  const result = parseItems(JSON.stringify([item, item, { ...item, id: 'b', kind: 'wrong' }]));
  assert.equal(result.length, 1);
  assert.equal(result[0]?.title, 'A');
});
test('reference is suitably formatted and generated independently', () => {
  const refs = new Set(Array.from({ length: 100 }, createReference));
  assert.equal(refs.size, 100);
  for (const ref of refs) assert.match(ref, /^SHK-WEB-[A-Z0-9]{8}$/);
});
