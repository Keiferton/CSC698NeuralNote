import { render, screen } from '@testing-library/react';
import App from './App';

test('renders NeuralNote login form', () => {
  render(<App />);
  const headerElement = screen.getByText(/NeuralNote/i);
  expect(headerElement).toBeInTheDocument();
});

test('shows login form initially', () => {
  render(<App />);
  const usernameInput = screen.getByPlaceholderText(/Enter your username/i);
  expect(usernameInput).toBeInTheDocument();
});
