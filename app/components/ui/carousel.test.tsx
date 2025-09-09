import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from './carousel';

describe('Carousel', () => {
  it('renders a carousel with items', () => {
    render(
      <Carousel>
        <CarouselContent>
          <CarouselItem>Item 1</CarouselItem>
          <CarouselItem>Item 2</CarouselItem>
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    );
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Previous slide/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Next slide/i })).toBeInTheDocument();
  });
});