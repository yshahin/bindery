
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Home from './Home';
import { BrowserRouter } from 'react-router-dom';

// Mock the data module to avoid file system dependency in unit test?
// Or just let it run as integration test.
// Let's rely on integration for now as it's simpler given the environment.

describe('Home Page', () => {
  it('renders key sections', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    expect(screen.getByText(/The Art of/i)).toBeTruthy();
    expect(screen.getByText(/Latest Article/i)).toBeTruthy();
    // Featured video might not show if no videos are found, but we expect at least one
    // We can't guarantee "Featured Video" text is there if there are no videos, 
    // but based on my grep earlier, there are videos.
  });
});
