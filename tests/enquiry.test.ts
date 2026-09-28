import test from 'node:test';
import assert from 'node:assert/strict';
import { buildMessage, whatsappUrl, createReference } from '../src/utils/whatsapp.ts';
import { parseItems } from '../src/stores/enquiry.ts';

test('message follows structured marketplace enquiry style and preserves notes and Unicode', () => {
  const message = buildMessage(
    {
      name: 'A & B',
      location: 'Bengaluru',
      productCondition: 'New',
      quantity: '2',
      quantityUnit: 'Piece',
      usageApplication: 'Installation',
      brand: 'Weintek',
      specification: '10.1 inch',
      machineModel: 'VMC / 40',
      details: 'Bore Ø100 ±0.01',
      attachmentNames: ['part drawing.pdf'],
    },
    [{ id: 'laser', title: 'Laser calibration', kind: 'service', note: 'Check X axis' }],
    'SHK-WEB-ABC123',
  );

  assert.match(message, /^Hi SHK Tech Services,/);
  assert.match(message, /Enquiry Details: \(/);
  assert.match(message, /Location: Bengaluru/);
  assert.match(message, /Product Condition: New/);
  assert.match(message, /Quantity: 2 Piece/);
  assert.match(message, /Usage \/ Application: Installation/);
  assert.match(message, /Brand \/ Preferred Make: Weintek/);
  assert.match(message, /Size \/ Model \/ Specification: 10\.1 inch/);
  assert.match(message, /Reference: SHK-WEB-ABC123/);
  assert.match(message, /1\. Laser calibration — Check X axis/);
  assert.match(message, /Bore Ø100 ±0\.01/);
  assert.doesNotMatch(message, /Email:|Company:|Phone \/ WhatsApp:/);
  assert.match(message, /I will attach these files/);
  assert.match(message, /Please reply to confirm these details\.$/);
  assert.equal(new URL(whatsappUrl(message)).searchParams.get('text'), message);
});

test('empty requirement does not produce empty marketplace labels', () => {
  const message = buildMessage({}, [], 'SHK-WEB-TEST');
  assert.doesNotMatch(
    message,
    /Location:|Product Condition:|Quantity:|Usage \/ Application:|Brand \/ Preferred Make:/,
  );
  assert.match(message, /Reference: SHK-WEB-TEST/);
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
