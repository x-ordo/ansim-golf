import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('https://api.ansimgolf.com/v1/teetimes', () => {
    return HttpResponse.json({
      success: true,
      data: [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          courseId: '123e4567-e89b-12d3-a456-426614174001',
          course: {
            id: '123e4567-e89b-12d3-a456-426614174001',
            name: '파주CC',
            region: 'SUDOKWON_NORTH',
            location: '파주',
            image: 'https://via.placeholder.com/150'
          },
          date: '2026-05-15',
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
          escrowEnabled: true,
          refundPolicy: '3일 전 100% 환불'
        }
      ]
    });
  }),
  
  http.post('https://api.ansimgolf.com/v1/chat', async () => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return HttpResponse.json({
      role: 'model',
      text: '추천 티타임을 찾았습니다.',
      recommendedIds: ['123e4567-e89b-12d3-a456-426614174000']
    });
  }),
  
  // Local dev proxy handling (if test env uses relative path)
  http.post('/api/chat', async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return HttpResponse.json({
      role: 'model',
      text: '추천 티타임을 찾았습니다.',
      recommendedIds: ['123e4567-e89b-12d3-a456-426614174000']
    });
  })
];

export const server = setupServer(...handlers);