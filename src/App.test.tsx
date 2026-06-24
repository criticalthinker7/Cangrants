import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, expect, it, test } from 'vitest';
import App from './App';
import { GRANTS } from './data/grants';

const originalGrantDeadlines = GRANTS.map((grant) => ({
  id: grant.id,
  close: grant.close,
}));

const restoreGrantDeadlines = () => {
  originalGrantDeadlines.forEach(({ id, close }) => {
    const grant = GRANTS.find((candidate) => candidate.id === id);
    if (grant) grant.close = close;
  });
};

const signIn = async () => {
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
  restoreGrantDeadlines();
});

afterEach(() => {
  restoreGrantDeadlines();
});

test('shows BetterHalf Labs contact links from the Contact tab', async () => {
  const user = await signIn();

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

it('shows the Contact navigation item after signing in', async () => {
  await signIn();
  expect(screen.getByRole('button', { name: /contact/i })).toBeVisible();
});

it('shows a current dataset label on the Discover page', async () => {
  await signIn();
  expect(screen.getByText(/Updated 2026/i)).toBeInTheDocument();
});

it('shows closed deadline records as Closed', async () => {
  const grant = GRANTS.find(
    (candidate) => candidate.name === 'Sundance Feature Film Program',
  );
  expect(grant).toBeDefined();
  grant!.close = 'Closed';

  const user = await signIn();
  await user.type(
    screen.getByPlaceholderText(/Search grants/i),
    'Sundance Feature Film Program',
  );

  expect(screen.getByText('Closed')).toBeInTheDocument();
});

it('points artists to the funder site when a deadline is not parseable', async () => {
  const grant = GRANTS.find(
    (candidate) => candidate.name === 'Sundance Feature Film Program',
  );
  expect(grant).toBeDefined();
  grant!.close = 'Next intake pending';

  const user = await signIn();
  await user.type(
    screen.getByPlaceholderText(/Search grants/i),
    'Sundance Feature Film Program',
  );

  expect(screen.getByText('Check funder site')).toBeInTheDocument();
});

it('excludes explicitly closed grants from the urgent deadline filter', async () => {
  const grant = GRANTS.find(
    (candidate) => candidate.name === 'Sundance Feature Film Program',
  );
  expect(grant).toBeDefined();
  grant!.close = 'Closed';

  const user = await signIn();
  await user.type(
    screen.getByPlaceholderText(/Search grants/i),
    'Sundance Feature Film Program',
  );
  await user.selectOptions(screen.getByDisplayValue('Deadline: All'), 'urgent');

  expect(screen.queryByText('Sundance Feature Film Program')).not.toBeInTheDocument();
  expect(screen.getByText(/Showing 0 of 48 grants/i)).toBeInTheDocument();
});
