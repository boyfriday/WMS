import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import Navbar from './Navbar';
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('../store/authStore', () => ({
  useAuthStore: vi.fn(),
}));

describe('Navbar', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders sign in and register links when not authenticated', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      user: null,
      logout: vi.fn(),
    } as any);

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    expect(screen.getByText('Sign In')).toBeInTheDocument();
    expect(screen.getByText('Create Account')).toBeInTheDocument();
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
  });

  it('renders Dashboard, Products, and Categories for Warehouse role', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      user: { fullName: 'Warehouse User', role: 'Warehouse' },
      logout: vi.fn(),
    } as any);

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Products')).toBeInTheDocument();
    expect(screen.getByText('Categories')).toBeInTheDocument();
    expect(screen.queryByText('Orders')).not.toBeInTheDocument();
    expect(screen.queryByText('Customers')).not.toBeInTheDocument();
    expect(screen.queryByText('Admin')).not.toBeInTheDocument();
  });

  it('renders Orders and Customers for Operator role', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      user: { fullName: 'Operator User', role: 'Operator' },
      logout: vi.fn(),
    } as any);

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Products')).toBeInTheDocument();
    expect(screen.getByText('Categories')).toBeInTheDocument();
    expect(screen.getByText('Orders')).toBeInTheDocument();
    expect(screen.getByText('Customers')).toBeInTheDocument();
    expect(screen.queryByText('Admin')).not.toBeInTheDocument();
  });

  it('renders Admin page link for Admin role', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      user: { fullName: 'Admin User', role: 'Admin' },
      logout: vi.fn(),
    } as any);

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Orders')).toBeInTheDocument();
    expect(screen.getByText('Customers')).toBeInTheDocument();
    expect(screen.getAllByText('Admin')[0]).toBeInTheDocument();
  });
});
