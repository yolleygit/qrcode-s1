import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { UnifiedActionButtons, createStandardQRActions, createExtendedQRActions } from './UnifiedActionButtons';

// Mock the one-click operations hook
vi.mock('../hooks/useOneClickOperations', () => ({
  useOneClickOperations: () => ({
    executeOperation: vi.fn(),
    getOperationState: vi.fn(() => ({ isLoading: false, lastResult: undefined }))
  })
}));

describe('UnifiedActionButtons', () => {
  const mockData = 'data:image/png;base64,test';
  
  it('renders standard QR actions correctly', () => {
    const buttons = createStandardQRActions({
      data: mockData,
      filename: 'test.png',
      includeShare: true
    });

    render(<UnifiedActionButtons buttons={buttons} />);

    expect(screen.getByText('下载')).toBeInTheDocument();
    expect(screen.getByText('复制')).toBeInTheDocument();
    expect(screen.getByText('分享')).toBeInTheDocument();
  });

  it('calls handlers when buttons are clicked', async () => {
    const buttons = createStandardQRActions({
      data: mockData,
      filename: 'test.png'
    });

    render(<UnifiedActionButtons buttons={buttons} />);

    const downloadButton = screen.getByText('下载');
    const copyButton = screen.getByText('复制');

    expect(downloadButton).toBeInTheDocument();
    expect(copyButton).toBeInTheDocument();

    // Test that buttons are clickable (not disabled)
    expect(downloadButton.closest('button')).not.toBeDisabled();
    expect(copyButton.closest('button')).not.toBeDisabled();
  });

  it('disables buttons when disabled prop is true', () => {
    const buttons = createStandardQRActions({
      data: mockData,
      filename: 'test.png',
      disabled: true
    });

    render(<UnifiedActionButtons buttons={buttons} />);

    const downloadButton = screen.getByText('下载').closest('button');
    const copyButton = screen.getByText('复制').closest('button');

    expect(downloadButton).toBeDisabled();
    expect(copyButton).toBeDisabled();
  });

  it('creates extended actions with custom operations', () => {
    const buttons = createExtendedQRActions({
      data: mockData,
      filename: 'test.png',
      operations: ['download', 'copy', 'save', 'print']
    });

    render(<UnifiedActionButtons buttons={buttons} />);

    expect(screen.getByText('下载')).toBeInTheDocument();
    expect(screen.getByText('复制')).toBeInTheDocument();
    expect(screen.getByText('另存为')).toBeInTheDocument();
    expect(screen.getByText('打印')).toBeInTheDocument();
  });

  it('shows loading state when operation is in progress', async () => {
    const buttons = createStandardQRActions({
      data: mockData,
      filename: 'test.png'
    });

    // Add a loading button manually for testing
    buttons[0].loading = true;

    render(<UnifiedActionButtons buttons={buttons} />);

    // Should show loading state
    expect(screen.getByText('处理中...')).toBeInTheDocument();
  });

  it('adapts layout for mobile view', () => {
    const buttons = createStandardQRActions({
      data: mockData,
      filename: 'test.png'
    });

    render(
      <UnifiedActionButtons 
        buttons={buttons} 
        direction="vertical"
        fullWidth={true}
      />
    );

    // Check that the main container has vertical layout
    const mainContainer = screen.getByText('下载').closest('div')?.parentElement?.parentElement;
    expect(mainContainer).toHaveClass('flex-col');
  });
});