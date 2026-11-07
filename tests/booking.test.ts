import { test } from 'node:test';
import assert from 'node:assert/strict';
import { changeService, emptyBooking, validSelection, validateContacts } from '../src/lib/booking';
import type { Service } from '../src/types/content';
const service: Service = {
  id: 'haircut',
  title: 'Стрижка',
  shortDescription: '',
  durationMinutes: 60,
  price: 2200,
  masterIds: ['a'],
  category: 'Стрижки',
};
test('service change keeps a compatible master and clears time', () => {
  assert.deepEqual(changeService({ ...emptyBooking(), masterId: 'a', slotId: 'old' }, service), {
    ...emptyBooking(),
    serviceId: 'haircut',
    masterId: 'a',
  });
});
test('service change clears an incompatible master and time', () => {
  assert.deepEqual(changeService({ ...emptyBooking(), masterId: 'b', slotId: 'old' }, service), {
    ...emptyBooking(),
    serviceId: 'haircut',
  });
});
test('contacts reject empty, short, overlong and non-consented values', () => {
  assert.equal(Object.keys(validateContacts(emptyBooking())).length, 3);
  for (const length of [0, 1, 61])
    assert.ok(validateContacts({ ...emptyBooking(), name: 'а'.repeat(length) }).name);
  for (const length of [9, 16])
    assert.ok(validateContacts({ ...emptyBooking(), phone: '1'.repeat(length) }).phone);
  assert.ok(validateContacts({ ...emptyBooking(), comment: 'а'.repeat(501) }).comment);
});
test('contacts accept normalized phones and boundary lengths', () => {
  for (const length of [2, 60])
    assert.deepEqual(
      validateContacts({
        ...emptyBooking(),
        name: 'а'.repeat(length),
        phone: '+7 (999) 123-45-67',
        comment: 'а'.repeat(500),
        consent: true,
      }),
      {},
    );
  for (const length of [10, 15])
    assert.equal(
      validateContacts({ ...emptyBooking(), phone: '1'.repeat(length) }).phone,
      undefined,
    );
});
test('confirmation rejects unavailable, mismatched and absent selections', () => {
  const data = { ...emptyBooking(), serviceId: 'haircut' as const, masterId: 'a', slotId: 's' };
  const slot = { id: 's', masterId: 'a', date: '2026-11-07', time: '19:30', available: true };
  assert.equal(validSelection(data, [service], [slot]), true);
  assert.equal(validSelection(data, [service], [{ ...slot, available: false }]), false);
  assert.equal(validSelection(data, [service], [{ ...slot, masterId: 'b' }]), false);
  assert.equal(validSelection(data, [service], []), false);
  assert.equal(validSelection({ ...data, masterId: 'b' }, [service], [slot]), false);
});
