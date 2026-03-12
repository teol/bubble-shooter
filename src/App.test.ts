import { render } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import App from './App.svelte';

describe('App', () => {
  it('renders correctly', () => {
    const { container } = render(App);
    expect(container).toBeTruthy();
  });
});
