import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from '../../App';

describe('App Integration', () => {
  it('should render tee times after loading', async () => {
    // When
    render(<App />);

    // Then: Check Loading State
    expect(screen.getByText(/티타임 정보를 불러오는 중/i)).toBeInTheDocument();

    // Then: Check Data Rendered (Mock 데이터 기반)
    await waitFor(
      () => {
        // Board View (Default)
        expect(screen.getByText('실시간 타임')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it('should display header and navigation', async () => {
    // When
    render(<App />);

    // Then: 헤더와 네비게이션이 표시되어야 함
    await waitFor(() => {
      expect(screen.getAllByText('안심').length).toBeGreaterThan(0);
      expect(screen.getAllByText('실시간').length).toBeGreaterThan(0);
    });
  });

  it('should complete loading state', async () => {
    // When
    render(<App />);

    // Then: 로딩이 완료되면 로딩 텍스트가 사라짐
    await waitFor(
      () => {
        expect(screen.queryByText(/티타임 정보를 불러오는 중/i)).not.toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });
});
