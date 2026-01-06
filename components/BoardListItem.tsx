
import React from 'react';
import { TeeTime } from '../types';

interface BoardListItemProps {
  teeTime: TeeTime;
}

const BoardListItem: React.FC<BoardListItemProps> = ({ teeTime }) => {
  return (
    <div className="bg-white border-b border-slate-50 p-3 flex justify-between items-center hover:bg-slate-50 active:bg-slate-100 transition-colors">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Small Thumbnail for Visual Recognition */}
        <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 border border-slate-100 shadow-sm">
          <img src={teeTime.course.image} alt="" className="w-full h-full object-cover" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-emerald-600 font-black text-sm">{teeTime.time}</span>
            <h3 className="font-bold text-slate-900 truncate text-sm">{teeTime.course.name}</h3>
            {teeTime.isEmergency && <span className="bg-red-500 text-white text-[8px] px-1 rounded-sm font-bold animate-pulse">긴급</span>}
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
            <span className="text-slate-600 font-bold">{teeTime.course.distanceKm ? `${teeTime.course.distanceKm}Km` : teeTime.course.location}</span>
            <span className="text-slate-200">|</span>
            <span>{teeTime.holes}홀</span>
            <span className="text-slate-200">|</span>
            <span className="truncate">{teeTime.manager.name} ({teeTime.manager.stats?.totalBookings || 0})</span>
          </div>
        </div>
      </div>
      
      <div className="text-right ml-3">
        <div className="text-emerald-600 font-black text-lg leading-none">
          {teeTime.price < 10000 ? teeTime.price : `${(teeTime.price / 10000).toLocaleString()}만`}
        </div>
        <button className="mt-1.5 px-3 py-1 bg-slate-900 text-white text-[9px] font-bold rounded-lg shadow-sm active:scale-95 transition-transform">
          문의
        </button>
      </div>
    </div>
  );
};

export default BoardListItem;
