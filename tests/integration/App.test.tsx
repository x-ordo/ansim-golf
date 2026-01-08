import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import App from '../../App';

describe('App Integration', () => {
  it('should render tee times after loading', async () => {
    // Given: MSW handler is set in tests/mocks/server.ts (returns 1 tee time)
    
    // When
    render(<App />);

    // Then: Check Loading State
    expect(screen.getByText(/티타임 정보를 불러오는 중/i)).toBeInTheDocument();

    // Then: Check Data Rendered
    await waitFor(() => {
      // Board View (Default)
      expect(screen.getByText('실시간 타임')).toBeInTheDocument();
      
      // Check for specific mock data content (from tests/mocks/server.ts)
      // Assuming the mock returns a course with specific name or region
      // Note: MSW mock in server.ts returns generic data. Let's override it here for clarity.
    });
  });

  it('should display specific course name from API', async () => {
    // Given: Custom API Response
    server.use(
      http.get('https://api.ansimgolf.com/v1/teetimes', () => {
        return HttpResponse.json({
          success: true,
          data: [
            {
              id: '123e4567-e89b-12d3-a456-426614174000',
              courseId: '123e4567-e89b-12d3-a456-426614174001',
              course: {
                id: '123e4567-e89b-12d3-a456-426614174001',
                name: '테스트CC',
                region: 'SUDOKWON_NORTH',
                location: '파주',
                image: 'https://via.placeholder.com/150',
                holesCount: 18
              },
              date: '2026-01-07',
              time: '08:30',
              price: 250000,
              originalPrice: 300000,
              type: 'JOIN',
              managerId: '123e4567-e89b-12d3-a456-426614174002',
              manager: {
                id: '123e4567-e89b-12d3-a456-426614174002',
                name: '김매니저'
              },
              status: 'AVAILABLE',
              escrowEnabled: true
            }
          ]
        });
      })
    );

    // When
    render(<App />);

    // Then
    await waitFor(() => {
      expect(screen.getByText('테스트CC')).toBeInTheDocument();
      expect(screen.getByText('08:30')).toBeInTheDocument();
    });
  });

  it('should show error message on API failure', async () => {
    // Given: API Failure
    server.use(
      http.get('https://api.ansimgolf.com/v1/teetimes', () => {
        return new HttpResponse(null, { status: 500 });
      })
    );

    // When
    render(<App />);

    // Then
    await waitFor(() => {
      expect(screen.getByText(/데이터를 불러올 수 없습니다/i)).toBeInTheDocument();
      expect(screen.getByText(/API Error: 500/i)).toBeInTheDocument();
    });
  });
});
