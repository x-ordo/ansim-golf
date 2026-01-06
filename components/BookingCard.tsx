
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
    <div className="group bg-white border border-slate-100 rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-emerald-500/10 hover:border-emerald-200 transition-all duration-500">
      <div className="relative h-44">
        <img src={teeTime.course.image} alt={teeTime.course.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <div className="flex gap-2">
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${getBadgeColor(teeTime.type)}`}>
              {teeTime.type}
            </span>
            <span className="bg-white/90 backdrop-blur-md text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black flex items-center gap-1 shadow-sm">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
              ESCROW
            </span>
          </div>
        </div>
        
        {teeTime.isEmergency && (
          <div className="absolute top-4 right-4 animate-bounce">
            <span className="bg-red-500 text-white px-2 py-1 rounded-lg text-[10px] font-black shadow-lg">긴급</span>
          </div>
        )}

        <div className="absolute bottom-4 right-4 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 shadow-lg flex items-center gap-1">
          <svg className="w-3 h-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
          <span className="text-[10px] font-black text-white">{teeTime.course.distanceKm ? `${teeTime.course.distanceKm}Km` : teeTime.course.location}</span>
        </div>
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-1">{teeTime.course.name}</h3>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">{teeTime.holes}홀</span>
              <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {teeTime.time}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-slate-400 line-through">₩{teeTime.originalPrice.toLocaleString()}</div>
            <div className="text-lg font-black text-emerald-600 leading-none">₩{teeTime.price.toLocaleString()}</div>
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          <span className="text-[10px] font-semibold text-slate-500 bg-slate-50 px-2 py-1 rounded-md">{getCaddyLabel(teeTime.caddyType)}</span>
          <span className="text-[10px] font-semibold text-slate-500 bg-slate-50 px-2 py-1 rounded-md">등록: {teeTime.createdAt}</span>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-slate-200 overflow-hidden ring-2 ring-white">
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${teeTime.manager.name}`} alt={teeTime.manager.name} />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-bold text-slate-700">{teeTime.manager.name}</span>
                {teeTime.manager.isVerified && (
                  <svg className="w-2.5 h-2.5 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                  </svg>
                )}
              </div>
              <div className="flex items-center gap-1 text-[9px] text-slate-400">
                <span className="text-emerald-600 font-bold">완료 {teeTime.manager.stats?.totalBookings || 0}건</span>
                <span>⭐ {teeTime.manager.rating}</span>
              </div>
            </div>
          </div>
          <button className="bg-slate-900 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg hover:bg-emerald-600 transition-all active:scale-95 shadow-sm">
            상세보기
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingCard;
