import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TEMPLATE_IDS, PLACEHOLDER_COPY } from './copySchemas';

test('every template id has placeholder copy with exactly 4 services', () => {
  for (const id of TEMPLATE_IDS) {
    const copy = PLACEHOLDER_COPY[id];
    assert.ok(copy, `missing placeholder copy for ${id}`);
    assert.equal(copy.services.length, 4, `${id} must have exactly 4 services`);
  }
});

test('placeholder copy has no empty fields', () => {
  for (const id of TEMPLATE_IDS) {
    const copy = PLACEHOLDER_COPY[id];
    for (const [key, value] of Object.entries(copy)) {
      if (key === 'services') continue;
      assert.ok(typeof value === 'string' && value.trim().length > 0, `${id}.${key} must not be empty`);
    }
    for (const service of copy.services) {
      assert.ok(service.title.trim().length > 0, `${id} has an empty service title`);
      assert.ok(service.description.trim().length > 0, `${id} has an empty service description`);
    }
  }
});
