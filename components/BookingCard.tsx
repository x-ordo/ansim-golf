
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
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const discount = Math.round(((teeTime.originalPrice - teeTime.price) / teeTime.originalPrice) * 100);

  return (
    <div className="group bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-xl hover:border-emerald-200 transition-all duration-300">
      <div className="relative h-48">
        <img src={teeTime.course.image} alt={teeTime.course.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute top-3 left-3 flex gap-2">
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getBadgeColor(teeTime.type)}`}>
            {teeTime.type}
          </span>
          {discount > 0 && (
            <span className="bg-red-500 text-white px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              {discount}% OFF
            </span>
          )}
        </div>
        <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full border border-white/20 shadow-sm">
          <span className="text-xs font-semibold text-slate-700">{teeTime.course.location}</span>
        </div>
      </div>

      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">{teeTime.course.name}</h3>
            <div className="flex items-center gap-1.5 text-sm text-slate-500">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {teeTime.date} <span className="text-slate-300">•</span> {teeTime.time}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-400 line-through">₩{teeTime.originalPrice.toLocaleString()}</div>
            <div className="text-xl font-black text-emerald-600">₩{teeTime.price.toLocaleString()}</div>
          </div>
        </div>

        <p className="text-sm text-slate-600 line-clamp-2 mb-4 h-10">
          {teeTime.description}
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden">
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${teeTime.manager.name}`} alt={teeTime.manager.name} />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-slate-700">{teeTime.manager.name}</span>
                {teeTime.manager.isVerified && (
                  <svg className="w-3 h-3 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                  </svg>
                )}
              </div>
              <div className="flex items-center gap-1 text-[10px] text-slate-400">
                <span>⭐ {teeTime.manager.rating}</span>
                <span>({teeTime.manager.reviewCount})</span>
              </div>
            </div>
          </div>
          <button className="bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors">
            예약하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingCard;
