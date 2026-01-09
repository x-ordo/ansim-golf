import React from 'react';
import { TeeTime } from '../../types';

interface MobileProfileViewProps {
  managerId: string | null;
  teeTimes: TeeTime[];
  onSelectTeeTime: (teeTime: TeeTime) => void;
  onBack: () => void;
}

const MobileProfileView: React.FC<MobileProfileViewProps> = ({
  managerId,
  teeTimes,
  onSelectTeeTime,
}) => {
  const managerTeeTimes = teeTimes.filter(
    (t) => t.managerId === managerId || t.manager?.id === managerId
  );
  const manager = managerTeeTimes[0]?.manager;

  if (!manager) {
    return (
      <div className="pt-14 pb-20 flex items-center justify-center min-h-screen">
        <p className="text-gray-400 font-bold">매니저 정보를 찾을 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="pt-14 pb-20">
      <div className="p-10 text-center bg-white border-b border-gray-100">
        <div className="w-24 h-24 bg-gray-50 rounded-full mx-auto mb-4 flex items-center justify-center text-gray-300 text-3xl font-bold border border-gray-100 shadow-sm">
          {manager.name[0]}
        </div>
        <h2 className="text-2xl font-black text-gray-800">{manager.name}</h2>
        <div className="flex items-center justify-center gap-3 mt-2">
          <span className="text-xs text-gray-400 font-bold">{manager.rank}</span>
          <span className="text-xs text-[#1a73e8] font-black">
            거래 {manager.stats?.totalBookings || 0}건 성공
          </span>
        </div>
      </div>

      <div className="p-4 bg-gray-50 min-h-screen">
        <h3 className="text-xs font-black text-gray-400 mb-4 px-2 tracking-widest uppercase">
          CURRENT TEE-TIMES
        </h3>
        <div className="space-y-2">
          {managerTeeTimes.length > 0 ? (
            managerTeeTimes.map((item) => {
              const date = new Date(item.date);
              const displayDate = `${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;

              return (
                <div
                  key={item.id}
                  className="p-4 bg-white border border-gray-100 rounded-xl flex justify-between items-center shadow-sm active:scale-[0.98] transition-transform cursor-pointer"
                  onClick={() => onSelectTeeTime(item)}
                >
                  <div>
                    <div className="text-[10px] font-black text-[#1a73e8] mb-0.5">
                      {displayDate} {item.time}
                    </div>
                    <div className="text-sm font-bold text-gray-800">{item.course.name}</div>
                  </div>
                  <div className="text-sm font-black text-red-500">
                    {item.price.toLocaleString()}원
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-10 text-center text-gray-400 text-sm font-bold">
              등록된 티타임이 없습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileProfileView;
