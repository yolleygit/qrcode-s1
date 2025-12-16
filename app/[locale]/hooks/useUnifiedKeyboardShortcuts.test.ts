import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useUnifiedKeyboardShortcuts, createQRPageShortcuts } from './useUnifiedKeyboardShortcuts';

describe('useUnifiedKeyboardShortcuts', () => {
  let mockHandlers: any;

  beforeEach(() => {
    mockHandlers = {
      onDownload: vi.fn(),
      onCopy: vi.fn(),
      onShare: vi.fn(),
      onClear: vi.fn(),
      onShowHelp: vi.fn(),
      onGoHome: vi.fn()
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('creates QR page shortcuts correctly', () => {
    const shortcuts = createQRPageShortcuts(mockHandlers);

    expect(shortcuts.download).toBe(mockHandlers.onDownload);
    expect(shortcuts.copy).toBe(mockHandlers.onCopy);
    expect(shortcuts.share).toBe(mockHandlers.onShare);
    expect(shortcuts.clear).toBe(mockHandlers.onClear);
    expect(shortcuts.showHelp).toBe(mockHandlers.onShowHelp);
    expect(shortcuts.goHome).toBe(mockHandlers.onGoHome);
  });

  it('returns available shortcuts list', () => {
    const shortcuts = createQRPageShortcuts(mockHandlers);
    
    const { result } = renderHook(() => 
      useUnifiedKeyboardShortcuts(shortcuts)
    );

    expect(result.current.availableShortcuts).toHaveLength(6);
    expect(result.current.availableShortcuts[0].description).toContain('Ctrl+S');
    expect(result.current.availableShortcuts[1].description).toContain('Ctrl+Shift+C');
  });

  it('handles keyboard events correctly', () => {
    const shortcuts = createQRPageShortcuts(mockHandlers);
    
    renderHook(() => useUnifiedKeyboardShortcuts(shortcuts));

    // Simulate Ctrl+S (download)
    const downloadEvent = new KeyboardEvent('keydown', {
      key: 's',
      ctrlKey: true
    });
    document.dispatchEvent(downloadEvent);

    expect(mockHandlers.onDownload).toHaveBeenCalledTimes(1);
  });

  it('prevents shortcuts in input elements except allowed ones', () => {
    const shortcuts = createQRPageShortcuts(mockHandlers);
    
    renderHook(() => useUnifiedKeyboardShortcuts(shortcuts));

    // Create a mock input element
    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();

    // Simulate Ctrl+S in input (should be blocked)
    const downloadEvent = new KeyboardEvent('keydown', {
      key: 's',
      ctrlKey: true
    });
    Object.defineProperty(downloadEvent, 'target', { value: input });
    document.dispatchEvent(downloadEvent);

    expect(mockHandlers.onDownload).not.toHaveBeenCalled();

    // Simulate Shift+? in input (should be allowed)
    const helpEvent = new KeyboardEvent('keydown', {
      key: '?',
      shiftKey: true
    });
    Object.defineProperty(helpEvent, 'target', { value: input });
    document.dispatchEvent(helpEvent);

    expect(mockHandlers.onShowHelp).toHaveBeenCalledTimes(1);

    document.body.removeChild(input);
  });

  it('handles custom shortcuts', () => {
    const customHandler = vi.fn();
    const shortcuts = {
      ...createQRPageShortcuts(mockHandlers),
      custom: [{
        key: 'x',
        ctrlKey: true,
        callback: customHandler,
        description: 'Ctrl+X: Custom action'
      }]
    };
    
    renderHook(() => useUnifiedKeyboardShortcuts(shortcuts));

    // Simulate Ctrl+X
    const customEvent = new KeyboardEvent('keydown', {
      key: 'x',
      ctrlKey: true
    });
    document.dispatchEvent(customEvent);

    expect(customHandler).toHaveBeenCalledTimes(1);
  });

  it('can be disabled', () => {
    const shortcuts = createQRPageShortcuts(mockHandlers);
    
    renderHook(() => useUnifiedKeyboardShortcuts(shortcuts, false));

    // Simulate Ctrl+S (should not trigger when disabled)
    const downloadEvent = new KeyboardEvent('keydown', {
      key: 's',
      ctrlKey: true
    });
    document.dispatchEvent(downloadEvent);

    expect(mockHandlers.onDownload).not.toHaveBeenCalled();
  });
});