import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the public SGA home page', () => {
  render(<App />);
  const heading = screen.getByRole('heading', { name: /senai/i });
  expect(heading).toBeInTheDocument();
});
