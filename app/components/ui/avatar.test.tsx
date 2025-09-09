import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Avatar, AvatarImage, AvatarFallback } from './avatar';

describe('Avatar', () => {
  it('renders with fallback when image fails to load', () => {
    render(
      <Avatar>
        <AvatarImage src="/invalid-path" alt="test avatar" />
        <AvatarFallback>AV</AvatarFallback>
      </Avatar>
    );
    expect(screen.getByText('AV')).toBeInTheDocument();
    expect(screen.queryByAltText('test avatar')).toBeNull();
  });
});