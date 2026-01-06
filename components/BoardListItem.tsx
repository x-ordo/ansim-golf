
import React from 'react';
import { TeeTime } from '../types';

interface BoardListItemProps {
  teeTime: TeeTime;
}

const BoardListItem: React.FC<BoardListItemProps> = ({ teeTime }) => {
  return (
    <div className="bg-white border-b border-slate-100 p-4 flex justify-between items-center hover:bg-slate-50 active:bg-slate-100 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-emerald-600 font-black text-sm">{teeTime.time}</span>
          <h3 className="font-bold text-slate-900 truncate text-sm">{teeTime.course.name}</h3>
          {teeTime.isEmergency && <span className="bg-red-500 text-white text-[8px] px-1 rounded-sm font-bold">긴급</span>}
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-500">
          <span className="font-medium">{teeTime.course.location}</span>
          <span className="text-slate-300">|</span>
          <span>{teeTime.holes}홀</span>
          <span className="text-slate-300">|</span>
          <span className="truncate">{teeTime.manager.name} ({teeTime.manager.stats?.totalBookings || 0})</span>
        </div>
      </div>
      <div className="text-right ml-4">
        <div className="text-emerald-600 font-black text-base">
          {teeTime.price < 10000 ? teeTime.price : `${(teeTime.price / 10000).toLocaleString()}만`}
        </div>
        <button className="mt-1 px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-md">
          문의
        </button>
      </div>
    </div>
  );
};

export default BoardListItem;
