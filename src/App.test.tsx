import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, expect, test } from 'vitest';
import App from './App';

const signInDemoUser = async () => {
  const user = userEvent.setup();

  render(<App />);

  await user.click(screen.getByRole('button', { name: /^sign in$/i }));
  await user.type(
    screen.getByPlaceholderText('your@email.com'),
    'demo@betterhalffilms.com',
  );
  const passwordInput = document.querySelector<HTMLInputElement>(
    'input[type="password"]',
  );
  expect(passwordInput).toBeInTheDocument();
  await user.type(passwordInput!, 'demo123');
  await user.click(screen.getByRole('button', { name: /^sign in/i }));

  expect(
    await screen.findByRole('heading', { name: /grant discovery/i }),
  ).toBeInTheDocument();

  return user;
};

beforeEach(() => {
  localStorage.clear();
});

test('shows BetterHalf Labs contact links from the Contact tab', async () => {
  const user = await signInDemoUser();

  await user.click(screen.getByRole('button', { name: /^contact$/i }));

  expect(screen.getByText('Company: BetterHalf Labs')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /Instagram/i })).toHaveAttribute(
    'href',
    'https://www.instagram.com/betterhalflabs/',
  );
  expect(screen.getByRole('link', { name: /Linked In/i })).toHaveAttribute(
    'href',
    'https://www.linkedin.com/company/canadianartgrants',
  );
  expect(screen.getByRole('link', { name: /X \/ Twitter/i })).toHaveAttribute(
    'href',
    'https://x.com/CdnArtGrants',
  );
});
