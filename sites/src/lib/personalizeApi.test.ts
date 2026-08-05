import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fetchPersonalizedCopy, isValidTemplateCopy } from './personalizeApi';

const VALID_COPY = {
  headline: 'Hi',
  subheadline: 'Sub',
  aboutTitle: 'About',
  aboutBody: 'Body',
  services: [
    { title: 'Service 1', description: 'Desc 1' },
    { title: 'Service 2', description: 'Desc 2' },
  ],
  ctaLabel: 'Go',
  ctaSubtext: 'CTA sub',
  footerTagline: 'Tagline',
};

test('fetchPersonalizedCopy posts templateId, companyName, and blurb', async () => {
  let capturedUrl: string | undefined;
  let capturedBody: unknown;
  const fakeFetch = (async (url: string, init?: RequestInit) => {
    capturedUrl = url;
    capturedBody = JSON.parse(init!.body as string);
    return new Response(JSON.stringify({ copy: VALID_COPY }), { status: 200 });
  }) as typeof fetch;

  const result = await fetchPersonalizedCopy('dental', { companyName: 'Acme', blurb: 'We fix teeth.' }, fakeFetch);

  assert.equal(capturedUrl, '/api/sites-personalize');
  assert.deepEqual(capturedBody, { templateId: 'dental', companyName: 'Acme', blurb: 'We fix teeth.' });
  assert.deepEqual(result, VALID_COPY);
});

test('fetchPersonalizedCopy throws the server error message on failure', async () => {
  const fakeFetch = (async () => new Response(JSON.stringify({ error: 'blurb is required.' }), { status: 400 })) as typeof fetch;

  await assert.rejects(
    () => fetchPersonalizedCopy('dental', { companyName: 'Acme', blurb: '' }, fakeFetch),
    /blurb is required\./,
  );
});

test('fetchPersonalizedCopy falls back to a generic message when the error body is not JSON', async () => {
  const fakeFetch = (async () => new Response('Internal Server Error', { status: 500 })) as typeof fetch;

  await assert.rejects(
    () => fetchPersonalizedCopy('dental', { companyName: 'Acme', blurb: 'x' }, fakeFetch),
    /AI personalization temporarily unavailable\./,
  );
});

test('fetchPersonalizedCopy throws when the server returns a malformed copy shape (missing services)', async () => {
  const malformedCopy = {
    headline: 'Hi',
    subheadline: 'Sub',
    aboutTitle: 'About',
    aboutBody: 'Body',
    // services is missing entirely
    ctaLabel: 'Go',
    ctaSubtext: 'CTA sub',
    footerTagline: 'Tagline',
  };
  const fakeFetch = (async () => new Response(JSON.stringify({ copy: malformedCopy }), { status: 200 })) as typeof fetch;

  await assert.rejects(
    () => fetchPersonalizedCopy('dental', { companyName: 'Acme', blurb: 'We fix teeth.' }, fakeFetch),
    /AI personalization temporarily unavailable\./,
  );
});

test('isValidTemplateCopy accepts a well-formed copy object', () => {
  assert.equal(isValidTemplateCopy(VALID_COPY), true);
});

test('isValidTemplateCopy rejects services items missing a description', () => {
  const bad = { ...VALID_COPY, services: [{ title: 'Only a title' }] };
  assert.equal(isValidTemplateCopy(bad), false);
});

test('isValidTemplateCopy rejects non-object input', () => {
  assert.equal(isValidTemplateCopy(null), false);
  assert.equal(isValidTemplateCopy('a string'), false);
  assert.equal(isValidTemplateCopy(undefined), false);
});
