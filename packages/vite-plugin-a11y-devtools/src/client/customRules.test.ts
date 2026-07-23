// Runs the real axe-core engine against jsdom (via jest-environment-jsdom),
// not a browser — fine here, since these checks only inspect DOM structure
// and attributes, not layout/rendering (unlike axe-core's built-in rules
// like color-contrast, which do need a real browser to measure anything).
import axe from 'axe-core';
import { customChecks, customRules } from './customRules';

beforeAll(() => {
  axe.configure({ checks: customChecks, rules: customRules });
});

function setBody(html: string) {
  document.body.innerHTML = html;
}

describe('sas-disabled-attribute', () => {
  test('flags native disabled attribute', async () => {
    setBody('<button disabled>Save</button>');
    const results = await axe.run(document.body, { runOnly: ['sas-disabled-attribute'] });
    expect(results.violations.some((v) => v.id === 'sas-disabled-attribute')).toBe(true);
  });

  test('does not flag aria-disabled', async () => {
    setBody('<button aria-disabled="true">Save</button>');
    const results = await axe.run(document.body, { runOnly: ['sas-disabled-attribute'] });
    expect(results.violations.some((v) => v.id === 'sas-disabled-attribute')).toBe(false);
  });
});

describe('sas-clickable-div', () => {
  test('flags clickable div with no role/tabindex', async () => {
    setBody('<div class="clickable">Click me</div>');
    const results = await axe.run(document.body, { runOnly: ['sas-clickable-div'] });
    expect(results.violations.some((v) => v.id === 'sas-clickable-div')).toBe(true);
  });

  test('does not flag clickable div with role and tabindex', async () => {
    setBody('<div class="clickable" role="button" tabindex="0">Click me</div>');
    const results = await axe.run(document.body, { runOnly: ['sas-clickable-div'] });
    expect(results.violations.some((v) => v.id === 'sas-clickable-div')).toBe(false);
  });

  test('does not flag a div that is not marked clickable', async () => {
    setBody('<div>Just some text</div>');
    const results = await axe.run(document.body, { runOnly: ['sas-clickable-div'] });
    expect(results.violations.some((v) => v.id === 'sas-clickable-div')).toBe(false);
  });
});

describe('sas-icon-only-button-name', () => {
  test('flags icon-only button with no accessible name', async () => {
    setBody('<button><svg width="16" height="16"></svg></button>');
    const results = await axe.run(document.body, { runOnly: ['sas-icon-only-button-name'] });
    expect(results.violations.some((v) => v.id === 'sas-icon-only-button-name')).toBe(true);
  });

  test('does not flag icon-only button with aria-label', async () => {
    setBody('<button aria-label="Save"><svg width="16" height="16"></svg></button>');
    const results = await axe.run(document.body, { runOnly: ['sas-icon-only-button-name'] });
    expect(results.violations.some((v) => v.id === 'sas-icon-only-button-name')).toBe(false);
  });
});

describe('sas-placeholder-as-label', () => {
  test('flags input with only a placeholder', async () => {
    setBody('<input type="email" placeholder="Email address" />');
    const results = await axe.run(document.body, { runOnly: ['sas-placeholder-as-label'] });
    expect(results.violations.some((v) => v.id === 'sas-placeholder-as-label')).toBe(true);
  });

  test('does not flag input with a real label', async () => {
    setBody(
      '<label for="email">Email</label><input id="email" type="email" placeholder="e.g. jane@example.com" />'
    );
    const results = await axe.run(document.body, { runOnly: ['sas-placeholder-as-label'] });
    expect(results.violations.some((v) => v.id === 'sas-placeholder-as-label')).toBe(false);
  });

  test('does not flag input with aria-label', async () => {
    setBody('<input type="email" aria-label="Email" placeholder="e.g. jane@example.com" />');
    const results = await axe.run(document.body, { runOnly: ['sas-placeholder-as-label'] });
    expect(results.violations.some((v) => v.id === 'sas-placeholder-as-label')).toBe(false);
  });
});

describe('sas-positive-tabindex', () => {
  test('flags positive tabindex', async () => {
    setBody('<button tabindex="2">Second</button>');
    const results = await axe.run(document.body, { runOnly: ['sas-positive-tabindex'] });
    expect(results.violations.some((v) => v.id === 'sas-positive-tabindex')).toBe(true);
  });

  test('does not flag tabindex 0', async () => {
    setBody('<button tabindex="0">Ok</button>');
    const results = await axe.run(document.body, { runOnly: ['sas-positive-tabindex'] });
    expect(results.violations.some((v) => v.id === 'sas-positive-tabindex')).toBe(false);
  });

  test('does not flag missing tabindex', async () => {
    setBody('<button>Ok</button>');
    const results = await axe.run(document.body, { runOnly: ['sas-positive-tabindex'] });
    expect(results.violations.some((v) => v.id === 'sas-positive-tabindex')).toBe(false);
  });
});
