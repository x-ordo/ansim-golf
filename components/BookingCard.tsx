
import React from 'react';
import { TeeTime, BookingType } from '../types';

interface BookingCardProps {
  teeTime: TeeTime;
}

const BookingCard: React.FC<BookingCardProps> = ({ teeTime }) => {
  const getBadgeColor = (type: BookingType) => {
    switch (type) {
      case BookingType.TRANSFER: return 'bg-orange-100 text-orange-700';
      case BookingType.JOIN: return 'bg-blue-100 text-blue-700';
      case BookingType.SPECIAL: return 'bg-emerald-100 text-emerald-700';
      case BookingType.TOUR: return 'bg-purple-100 text-purple-700';
      case BookingType.FESTA: return 'bg-pink-100 text-pink-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getCaddyLabel = (type: string) => {
    switch(type) {
      case 'CADDY': return '캐디';
      case 'NO_CADDY': return '노캐디';
      case 'DRIVING_CADDY': return '드라이빙캐디';
      default: return '캐디';
    }
  };

  return (
    <div className="group bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-all duration-300">
      {/* Manager Info at Top (인간 매니저 중심) */}
      <div className="px-4 py-2.5 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-slate-200 overflow-hidden ring-1 ring-white">
            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${teeTime.manager.name}`} alt={teeTime.manager.name} />
          </div>
          <span className="text-[11px] font-bold text-slate-700">{teeTime.manager.name}</span>
          {teeTime.manager.isVerified && <span className="text-[9px] text-blue-500 bg-blue-50 px-1 rounded">인증</span>}
        </div>
        <div className="text-[10px] text-slate-400">
          완료 {teeTime.manager.stats?.totalBookings || 0}
        </div>
      </div>

      <div className="relative h-36">
        <img src={teeTime.course.image} alt={teeTime.course.name} className="w-full h-full object-cover" />
        <div className="absolute top-2 left-2 flex gap-1">
          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${getBadgeColor(teeTime.type)}`}>
            {teeTime.type}
          </span>
          {teeTime.escrowEnabled && (
            <span className="bg-white/90 backdrop-blur text-emerald-600 px-2 py-0.5 rounded text-[9px] font-bold flex items-center gap-0.5 shadow-sm">
              에스크로
            </span>
          )}
        </div>
        <div className="absolute bottom-2 right-2 bg-black/50 backdrop-blur px-2 py-0.5 rounded text-[9px] font-medium text-white">
          {teeTime.course.distanceKm ? `${teeTime.course.distanceKm}Km` : teeTime.course.location}
        </div>
      </div>

      <div className="p-4">
        <div className="flex justify-between items-end mb-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-0.5">{teeTime.course.name}</h3>
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <span className="font-bold text-blue-600">{teeTime.holes}홀</span>
              <span>{teeTime.time}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-slate-400 leading-none mb-1">1인 기준</div>
            <div className="text-lg font-black text-emerald-600 leading-none">₩{teeTime.price.toLocaleString()}</div>
          </div>
        </div>

        {/* 자유 영역 (특이사항 텍스트) */}
        <p className="text-[11px] text-slate-600 line-clamp-1 bg-slate-50 p-1.5 rounded border border-slate-100 mb-3">
          {teeTime.description}
        </p>

        <button className="w-full py-2 bg-slate-900 text-white text-[11px] font-bold rounded-lg hover:bg-emerald-600 transition-all active:scale-[0.98]">
          매니저와 대화하기
        </button>
      </div>
    </div>
  );
};

export default BookingCard;
