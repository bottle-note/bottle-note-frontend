import { readFileSync } from 'fs';
import { resolve } from 'path';

const semanticColors = readFileSync(
  resolve(process.cwd(), 'src/style/tokens/semantic-colors.css'),
  'utf8',
);

const lightTheme = semanticColors.split('.dark')[0];

describe('light semantic color tokens', () => {
  it.each([
    ['--color-fg-neutral', 'rgb(var(--palette-neutral-950))'],
    ['--color-fg-neutral-subtle', 'rgb(var(--palette-neutral-600))'],
    ['--color-fg-brand', 'rgb(var(--palette-coral-600))'],
    ['--color-fg-brand-primary', 'rgb(var(--palette-coral-400))'],
    ['--color-fg-brand-contrast', 'rgb(var(--palette-static-white))'],
    ['--color-fg-rating', 'rgb(var(--palette-coral-600))'],
    ['--color-bg-brand-solid', 'rgb(var(--palette-coral-600))'],
    ['--color-bg-brand-primary-solid', 'rgb(var(--palette-coral-400))'],
    ['--color-bg-brand-weak', 'rgb(var(--palette-coral-400) / 10%)'],
    ['--color-stroke-brand-solid', 'rgb(var(--palette-coral-600))'],
    ['--color-stroke-brand-contrast', 'rgb(var(--palette-static-white))'],
    ['--color-stroke-neutral-basement', 'rgb(var(--palette-neutral-200))'],
    ['--color-stroke-brand-primary-solid', 'rgb(var(--palette-coral-400))'],
  ])('keeps the legacy light-mode value for %s', (token, value) => {
    expect(lightTheme).toContain(`${token}: ${value};`);
  });
});
