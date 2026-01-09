import React from 'react';
import { TeeTime } from '../../types';

interface MobileDetailViewProps {
  teeTime: TeeTime;
  onBack: () => void;
  onOpenChat: () => void;
  onViewProfile: (managerId: string) => void;
}

const MobileDetailView: React.FC<MobileDetailViewProps> = ({
  teeTime,
  onOpenChat,
  onViewProfile,
}) => {
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const date = new Date(teeTime.date);
  const dayName = days[date.getDay()];
  const displayDate = `${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;

  const inclusions = [];
  if (teeTime.holes === 18) inclusions.push('18홀');
  if (teeTime.escrowEnabled) inclusions.push('에스크로');

  return (
    <div className="pt-14 pb-20">
      <div className="p-5 bg-white border-b border-gray-100">
        <div className="text-xs font-bold text-blue-600 mb-1">
          {teeTime.course.region} * {teeTime.type === 'JOIN' ? '조인 전용' : '팀 전체'}
        </div>
        <div className="text-3xl font-black text-gray-900 leading-none mb-2">
          {displayDate}({dayName}) {teeTime.time}
        </div>
        <h2 className="text-xl font-bold text-gray-700">{teeTime.course.name}</h2>
      </div>

      <div className="px-5 py-4 bg-white space-y-4">
        <div className="flex justify-between items-center py-1">
          <span className="text-gray-500 text-sm font-bold">라운딩 비용</span>
          <span className="text-xl font-black text-red-500">
            1인 {teeTime.price.toLocaleString()}원
          </span>
        </div>
        {teeTime.originalPrice && teeTime.originalPrice > teeTime.price && (
          <div className="flex justify-between items-center py-1">
            <span className="text-gray-500 text-sm font-bold">정상가</span>
            <span className="text-sm font-bold text-gray-400 line-through">
              {teeTime.originalPrice.toLocaleString()}원
            </span>
          </div>
        )}
        <div className="flex justify-between items-center py-1">
          <span className="text-gray-500 text-sm font-bold">포함사항</span>
          <span className="text-sm font-bold text-gray-700">{inclusions.join(', ') || '기본'}</span>
        </div>
        {teeTime.refundPolicy && (
          <div className="flex justify-between items-center py-1">
            <span className="text-gray-500 text-sm font-bold">환불정책</span>
            <span className="text-sm font-bold text-gray-700">{teeTime.refundPolicy}</span>
          </div>
        )}
      </div>

      <div className="px-5 py-3">
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm">
          <div className="text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">
            MANAGER'S NOTE
          </div>
          <p className="text-sm text-gray-700 leading-relaxed font-medium">
            {teeTime.isEmergency
              ? '급매물입니다! 빠른 예약 바랍니다.'
              : '좋은 티타임입니다. 문의 주세요.'}
          </p>
        </div>
      </div>

      {teeTime.manager && (
        <div
          className="mt-2 px-5 py-4 flex items-center border-t border-gray-100 bg-white active:bg-gray-50 cursor-pointer"
          onClick={() => onViewProfile(teeTime.manager!.id)}
        >
          <div className="w-12 h-12 bg-gray-100 rounded-full mr-4 flex items-center justify-center text-gray-400 text-lg font-bold border border-gray-200">
            {teeTime.manager.name[0]}
          </div>
          <div>
            <div className="font-black text-sm text-gray-800">{teeTime.manager.name} 매니저</div>
            <div className="text-xs text-gray-400 font-bold">
              {teeTime.manager.rank} * 누적 {teeTime.manager.stats?.totalBookings || 0}건
            </div>
          </div>
          <svg
            className="ml-auto w-5 h-5 text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      )}

      <div className="fixed bottom-16 left-0 right-0 max-w-md mx-auto p-4 bg-white border-t border-gray-100 flex gap-3">
        <button className="flex-1 h-12 bg-gray-100 text-gray-700 font-black rounded-xl text-sm border border-gray-200">
          전화 연결
        </button>
        {teeTime.escrowEnabled ? (
          <button
            className="flex-[1.5] h-12 bg-[#1a73e8] text-white font-black rounded-xl text-sm shadow-lg shadow-blue-100"
            onClick={onOpenChat}
          >
            에스크로 안심예약
          </button>
        ) : (
          <button
            className="flex-[1.5] h-12 bg-gray-800 text-white font-black rounded-xl text-sm"
            onClick={onOpenChat}
          >
            실시간 문의하기
          </button>
        )}
      </div>
    </div>
  );
};

export default MobileDetailView;
