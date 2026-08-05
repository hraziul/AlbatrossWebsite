import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  loadBusinessInfo,
  saveBusinessInfo,
  clearBusinessInfo,
  validateBusinessInfo,
  COMPANY_NAME_MAX,
  BLURB_MAX,
} from './businessStorage';

class FakeStorage {
  private store = new Map<string, string>();
  getItem(key: string) {
    return this.store.has(key) ? this.store.get(key)! : null;
  }
  setItem(key: string, value: string) {
    this.store.set(key, value);
  }
  removeItem(key: string) {
    this.store.delete(key);
  }
}

function withFakeStorage(fn: () => void) {
  const previous = (globalThis as any).localStorage;
  (globalThis as any).localStorage = new FakeStorage();
  try {
    fn();
  } finally {
    (globalThis as any).localStorage = previous;
  }
}

test('validateBusinessInfo requires a company name', () => {
  const error = validateBusinessInfo({ companyName: '', blurb: 'We do things.' });
  assert.equal(error, 'Company name is required.');
});

test('validateBusinessInfo rejects an oversized company name', () => {
  const error = validateBusinessInfo({ companyName: 'x'.repeat(COMPANY_NAME_MAX + 1), blurb: 'We do things.' });
  assert.match(error!, /80 characters or fewer/);
});

test('validateBusinessInfo rejects an oversized blurb', () => {
  const error = validateBusinessInfo({ companyName: 'Acme', blurb: 'x'.repeat(BLURB_MAX + 1) });
  assert.match(error!, /280 characters or fewer/);
});

test('validateBusinessInfo accepts a well-formed value', () => {
  const error = validateBusinessInfo({ companyName: 'Acme', blurb: 'We do things.' });
  assert.equal(error, null);
});

test('saveBusinessInfo then loadBusinessInfo round-trips', () => {
  withFakeStorage(() => {
    saveBusinessInfo({ companyName: 'Acme', blurb: 'We do things.' });
    assert.deepEqual(loadBusinessInfo(), { companyName: 'Acme', blurb: 'We do things.' });
  });
});

test('loadBusinessInfo returns null when nothing is stored', () => {
  withFakeStorage(() => {
    assert.equal(loadBusinessInfo(), null);
  });
});

test('loadBusinessInfo returns null for corrupted JSON', () => {
  withFakeStorage(() => {
    localStorage.setItem('albatross-sites-business', 'not json');
    assert.equal(loadBusinessInfo(), null);
  });
});

test('clearBusinessInfo removes the stored value', () => {
  withFakeStorage(() => {
    saveBusinessInfo({ companyName: 'Acme', blurb: 'We do things.' });
    clearBusinessInfo();
    assert.equal(loadBusinessInfo(), null);
  });
});
