// .cjs (not .js) on purpose: package.json declares "type": "module", so a
// plain .js config here would be loaded as ESM by Jest's config loader,
// which is more trouble than it's worth for a one-off config file. .cjs
// always loads as CommonJS regardless of that setting.
/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  // Type-checks and transpiles .ts test files on the fly (no separate build
  // step needed to run tests).
  preset: 'ts-jest',
  // customRules.test.ts uses `document`, which only exists with a DOM-like
  // environment — Jest's default ("node") has no `document` at all.
  testEnvironment: 'jsdom',
  testMatch: ['**/src/**/*.test.ts'],
};
