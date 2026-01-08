import React from 'react';
import { TeeTime, BookingType } from '../types';

interface BookingCardProps {
  teeTime: TeeTime;
}

const BookingCard: React.FC<BookingCardProps> = ({ teeTime }) => {
  const getBadgeColor = (type: BookingType) => {
    switch (type) {
      case BookingType.TRANSFER: return 'bg-orange-500 text-white';
      case BookingType.JOIN: return 'bg-blue-500 text-white';
      case BookingType.SPECIAL: return 'bg-emerald-500 text-white';
      case BookingType.TOUR: return 'bg-purple-500 text-white';
      case BookingType.FESTA: return 'bg-pink-500 text-white';
      default: return 'bg-slate-500 text-white';
    }
  };

  return (
    <div className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 border border-slate-100">
      <div className="relative h-64 overflow-hidden">
        <img 
          src={teeTime.course.image} 
          alt={teeTime.course.name} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        
        <div className="absolute top-6 left-6 flex gap-2">
          <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg ${getBadgeColor(teeTime.type)}`}>
            {teeTime.type}
          </span>
          {teeTime.escrowEnabled && (
            <span className="bg-white/20 backdrop-blur-md text-white border border-white/30 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
              <svg className="w-3.5 h-3.5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
              안심결제
            </span>
          )}
        </div>

        <div className="absolute bottom-6 left-6 text-white">
          <div className="flex items-center gap-2 mb-2 opacity-90">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            <span className="text-sm font-medium">{teeTime.course.distanceKm ? `${teeTime.course.distanceKm}Km` : teeTime.course.location}</span>
          </div>
          <h3 className="text-2xl font-black leading-tight drop-shadow-md">{teeTime.course.name}</h3>
        </div>
      </div>

      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-slate-500">
              <span className="text-xs font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md uppercase tracking-tighter">18 Holes</span>
              <span className="text-base font-bold text-slate-900">{teeTime.time}</span>
            </div>
            <p className="text-sm text-slate-400 font-medium">{teeTime.date}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-slate-400 mb-1">1인 그린피</p>
            <p className="text-3xl font-black text-emerald-600">₩{teeTime.price.toLocaleString()}</p>
          </div>
        </div>

        <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100 group-hover:bg-emerald-50 group-hover:border-emerald-100 transition-colors duration-500">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white overflow-hidden shadow-sm ring-2 ring-white">
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${teeTime.manager.name}`} alt={teeTime.manager.name} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-slate-800">{teeTime.manager.name}</span>
                <svg className="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" /></svg>
              </div>
              <div className="text-xs text-slate-400 font-medium">
                누적완료 <span className="text-emerald-600 font-bold">{teeTime.manager.stats?.totalBookings.toLocaleString()}</span>건
              </div>
            </div>
          </div>
          <button className="bg-slate-900 text-white text-sm font-bold px-6 py-3 rounded-xl hover:bg-emerald-600 transition-all shadow-lg active:scale-95">
            상세보기
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingCard;