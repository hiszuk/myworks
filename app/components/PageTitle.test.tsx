import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PageTitle } from './PageTitle';

describe('PageTitle', () => {
  it('renders the title and description', () => {
    render(<PageTitle title="Test Title" description="Test Description" />);
    expect(screen.getByRole('heading', { name: 'Test Title' })).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });
});
