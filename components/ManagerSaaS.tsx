
import React from 'react';

const ManagerSaaS: React.FC = () => {
  return (
    <div className="flex-1 bg-slate-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-900">파트너 대시보드</h2>
            <p className="text-sm text-slate-500">지사 공돌이 매니저님, 환영합니다.</p>
          </div>
          <button className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-emerald-200 active:scale-95 transition-all">
            + 티타임 등록
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { label: '활성 티타임', count: '12', color: 'text-blue-600' },
            { label: '정산 예정', count: '₩1,240,000', color: 'text-emerald-600' },
            { label: '누적 완료', count: '4,682', color: 'text-slate-900' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <p className="text-xs font-bold text-slate-400 mb-2 uppercase">{stat.label}</p>
              <p className={`text-2xl font-black ${stat.color}`}>{stat.count}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center">
            <h3 className="font-bold text-slate-900">최근 등록 현황</h3>
            <button className="text-xs text-blue-600 font-bold">전체보기</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase">
                <tr>
                  <th className="px-6 py-4">골프장</th>
                  <th className="px-6 py-4">일시</th>
                  <th className="px-6 py-4">가격</th>
                  <th className="px-6 py-4">상태</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {[
                  { course: '파주CC', date: '01/07 09:51', price: '60,000', status: '노출중' },
                  { course: '남양주CC', date: '01/07 11:40', price: '40,000', status: '예약완료' },
                  { course: '클럽72', date: '01/08 10:22', price: '70,000', status: '정산대기' },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">{row.course}</td>
                    <td className="px-6 py-4 text-slate-500">{row.date}</td>
                    <td className="px-6 py-4 font-black text-emerald-600">₩{row.price}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${row.status === '노출중' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerSaaS;
