import React, { useState, useMemo } from 'react';
import { TeeTime, MobileTab } from '../../types';

interface MobileListViewProps {
  teeTimes: TeeTime[];
  activeTab: MobileTab;
  onSelectTeeTime: (teeTime: TeeTime) => void;
  onOpenChat: (teeTime: TeeTime) => void;
}

const REGIONS = ['전체', '경기 북부', '경기 남부', '강원', '충청', '제주'];

const MobileListView: React.FC<MobileListViewProps> = ({
  teeTimes,
  activeTab,
  onSelectTeeTime,
  onOpenChat,
}) => {
  const [filterRegion, setFilterRegion] = useState<string>('전체');
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  // Generate dates for next 7 days
  const dates = useMemo(() => {
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const result = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      result.push({
        date: date.toISOString().split('T')[0],
        display: `${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`,
        day: days[date.getDay()],
      });
    }
    return result;
  }, []);

  const filteredData = useMemo(() => {
    let data = teeTimes.filter((t) => t.date === selectedDate);
    if (activeTab === 'pro') data = data.filter((t) => t.escrowEnabled);
    if (filterRegion !== '전체') data = data.filter((t) => t.course.region === filterRegion);
    return data;
  }, [teeTimes, activeTab, selectedDate, filterRegion]);

  return (
    <div className="pt-24 pb-20">
      {/* Date Selection Bar */}
      <div className="bg-white border-b border-gray-100 flex overflow-x-auto no-scrollbar py-2 px-1 gap-1">
        {dates.map((d) => (
          <button
            key={d.date}
            onClick={() => setSelectedDate(d.date)}
            className={`flex flex-col items-center min-w-[50px] py-1 rounded-md transition-all ${
              selectedDate === d.date ? 'bg-[#1a73e8] text-white' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <span className="text-[10px] font-bold uppercase">{d.day}</span>
            <span className="text-xs font-black">{d.display.split('.')[1]}</span>
          </button>
        ))}
      </div>

      {/* Region/Filter Bar */}
      <div className="bg-gray-50 border-b border-gray-200 px-3 py-2 flex items-center justify-between">
        <div className="flex gap-2">
          <select
            value={filterRegion}
            onChange={(e) => setFilterRegion(e.target.value)}
            className="bg-white border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none font-bold text-gray-700"
          >
            {REGIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <button className="bg-white border border-gray-300 rounded px-2 py-1 text-xs font-bold text-gray-700">
            전체
          </button>
          <button className="bg-white border border-gray-300 rounded px-2 py-1 text-xs font-bold text-gray-700">
            조인
          </button>
        </div>
        <div className="text-[10px] text-gray-400 font-bold">총 {filteredData.length}건</div>
      </div>

      {/* List - High Density Style */}
      <div className="divide-y divide-gray-100 bg-white">
        {filteredData.length > 0 ? (
          filteredData.map((item) => (
            <div
              key={item.id}
              className="p-3 active:bg-blue-50 cursor-pointer flex justify-between items-center transition-colors"
              onClick={() => onSelectTeeTime(item)}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-black text-[#1a73e8] tabular-nums">
                    {item.time}
                  </span>
                  <span className="text-sm font-black text-gray-800 truncate">
                    {item.course.name}
                  </span>
                  {item.escrowEnabled && (
                    <span className="bg-blue-50 text-[#1a73e8] text-[9px] font-black px-1 py-0.5 rounded border border-blue-100">
                      PRO
                    </span>
                  )}
                  {item.isEmergency && (
                    <span className="bg-red-50 text-red-500 text-[9px] font-black px-1 py-0.5 rounded border border-red-100">
                      급매
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="text-red-500 font-bold">
                    1인 {item.price.toLocaleString()}원
                  </span>
                  <span className="text-gray-300">|</span>
                  <span>{item.type === 'JOIN' ? '조인가능' : '팀예약'}</span>
                  <span className="text-gray-300">|</span>
                  <span>
                    {item.manager?.name}({item.manager?.stats?.totalBookings || 0})
                  </span>
                </div>
              </div>
              <button
                className="bg-gray-100 hover:bg-gray-200 text-gray-600 text-[11px] font-black px-4 py-2 rounded-md transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenChat(item);
                }}
              >
                문의
              </button>
            </div>
          ))
        ) : (
          <div className="py-20 text-center text-gray-400 font-bold text-sm">
            등록된 티타임이 없습니다.
          </div>
        )}
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .tabular-nums { font-variant-numeric: tabular-nums; }
      `}</style>
    </div>
  );
};

export default MobileListView;
