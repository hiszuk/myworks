import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DatePicker } from './daypicker';
import { FieldMetadata } from '@conform-to/react';

vi.mock('@conform-to/react', () => ({
  useInputControl: (meta: FieldMetadata<string>) => ({
    value: meta.defaultValue,
    change: vi.fn(),
  }),
}));

describe('DatePicker', () => {
  it('renders with default value', () => {
    const meta: FieldMetadata<string> = {
      name: 'date',
      defaultValue: '2024-09-09',
    } as FieldMetadata<string>;
    render(<DatePicker meta={meta} defaultValue="2024-09-09" />);
    expect(screen.getByText('2024-09-09')).toBeInTheDocument();
  });
});