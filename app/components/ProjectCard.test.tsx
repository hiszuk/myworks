import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ProjecttCard } from './ProjectCard';
import { Project } from '~/types/project';

vi.mock('@remix-run/react', async () => {
  const original = await vi.importActual('@remix-run/react');
  return {
    ...original,
    useLocation: () => ({ key: 'testkey' }),
  };
});

const mockProject: Project = {
  id: '1',
  userId: 'user1',
  title: 'Test Project',
  summary: 'A test project summary.',
  tags: 'React,TypeScript',
  repository: 'http://github.com/test/test-project',
  url: 'http://test-project.com',
  img: 'test-image.png',
  launchDate: '2024-01-01',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

describe('ProjecttCard', () => {
  it('renders project details correctly', () => {
    render(<ProjecttCard project={mockProject} />);
    expect(screen.getByText('Test Project')).toBeInTheDocument();
    expect(screen.getByText('2024-01-01')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /See Live/i })).toHaveAttribute('href', 'http://test-project.com');
    expect(screen.getByRole('link', { name: /Source/i })).toHaveAttribute('href', 'http://github.com/test/test-project');
    const image = screen.getByAltText('Latest Project');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', '/images/test-image.png?testkey');
  });

  it('renders without optional fields', () => {
    const partialProject = { ...mockProject, url: undefined, repository: undefined, img: undefined, launchDate: undefined, title: undefined };
    render(<ProjecttCard project={partialProject} />);
    expect(screen.getByText('NO NAME')).toBeInTheDocument();
    expect(screen.getByText('NO DATE')).toBeInTheDocument();
    expect(screen.queryByText('See Live')).not.toBeInTheDocument();
    expect(screen.queryByText('Source')).not.toBeInTheDocument();
    const image = screen.getByAltText('Latest Project');
    expect(image).toHaveAttribute('src', '/images/no-image');
  });
});