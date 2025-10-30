import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { InstallPrompt } from '../components/InstallPrompt';

describe('InstallPrompt', () => {
  let deferredPrompt: {
    preventDefault: () => void;
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: string }>;
  };

  beforeEach(() => {
    // Mock the beforeinstallprompt event
    deferredPrompt = {
      preventDefault: vi.fn(),
      prompt: vi.fn().mockResolvedValue(undefined),
      userChoice: Promise.resolve({ outcome: 'accepted' }),
    };
  });

  it('should render without crashing', () => {
    render(<InstallPrompt />);
    // The component should render but the snackbar won't be visible initially
    expect(document.body).toBeInTheDocument();
  });

  it('should show install prompt when beforeinstallprompt event is fired', async () => {
    render(<InstallPrompt />);

    // Simulate the beforeinstallprompt event
    const event = new Event('beforeinstallprompt');
    Object.assign(event, deferredPrompt);
    window.dispatchEvent(event);

    // Wait for the prompt to appear (with 1 second delay in the component)
    await waitFor(() => {
      expect(screen.getByText(/Install this app for quick access and better performance!/i)).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('should hide install prompt when close button is clicked', async () => {
    render(<InstallPrompt />);

    // Simulate the beforeinstallprompt event
    const event = new Event('beforeinstallprompt');
    Object.assign(event, deferredPrompt);
    window.dispatchEvent(event);

    // Wait for the prompt to appear
    await waitFor(() => {
      expect(screen.getByText(/Install this app for quick access and better performance!/i)).toBeInTheDocument();
    }, { timeout: 2000 });

    // Click the close button
    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    // Wait for the prompt to disappear
    await waitFor(() => {
      expect(screen.queryByText(/Install this app for quick access and better performance!/i)).not.toBeInTheDocument();
    });
  });

  it('should call prompt when install button is clicked', async () => {
    render(<InstallPrompt />);

    // Simulate the beforeinstallprompt event
    const event = new Event('beforeinstallprompt');
    Object.assign(event, deferredPrompt);
    window.dispatchEvent(event);

    // Wait for the prompt to appear
    await waitFor(() => {
      expect(screen.getByText(/Install this app for quick access and better performance!/i)).toBeInTheDocument();
    }, { timeout: 2000 });

    // Click the install button
    const installButton = screen.getByRole('button', { name: /install/i });
    fireEvent.click(installButton);

    // Verify that prompt was called
    await waitFor(() => {
      expect(deferredPrompt.prompt).toHaveBeenCalled();
    });
  });
});
