import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from './select';

describe('Select', () => {
  it('renders a select component', () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="1">Option 1</SelectItem>
        </SelectContent>
      </Select>
    );
    expect(screen.getByText('Select an option')).toBeInTheDocument();
  });
});