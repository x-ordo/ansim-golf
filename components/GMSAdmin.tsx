import React, { useState } from 'react';
import NotionKanban from './NotionKanban';

const GMSAdmin: React.FC = () => {
  const [activeMenu, setActiveTab] = useState<'DASHBOARD' | 'COURSE' | 'MEMBERS' | 'BOOKINGS' | 'TASKS'>('DASHBOARD');

  // Mock Stats
  const stats = {
    occupancyRate: 82.5,
    revenue: 12400000,
    cancelledCount: 3,
    dumpingSales: 2700000
  };

  return (
    <div className="flex h-screen bg-slate-900 text-white overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 p-6 flex flex-col justify-between hidden md:flex">
        <nav className="space-y-2">
          <div className="px-4 mb-8">
            <h1 className="text-xl font-black text-white tracking-tighter">ANSIM <span className="text-emerald-500">GMS</span></h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Partner Admin v1.0</p>
          </div>

          {[
            { id: 'DASHBOARD', label: '운영 요약', icon: '📊' },
            { id: 'COURSE', label: '코스 관리', icon: '⛳' },
            { id: 'MEMBERS', label: '회원 관리', icon: '👥' },
            { id: 'BOOKINGS', label: '예약/덤핑', icon: '🕒' },
            { id: 'TASKS', label: '업무 보드', icon: '✅' },
          ].map((menu) => (
            <button
              key={menu.id}
              onClick={() => setActiveTab(menu.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                activeMenu === menu.id ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <span>{menu.icon}</span>
              {menu.label}
            </button>
          ))}
        </nav>

        <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700">
          <p className="text-[10px] font-black text-slate-500 mb-2 uppercase">System Status</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            <span className="text-xs font-bold text-slate-300">서버 정상 작동 중</span>
          </div>
        </div>
      </aside>

      {/* Main Dashboard Area */}
      <main className="flex-1 overflow-y-auto p-6 md:p-10 bg-slate-50">
        {activeMenu === 'DASHBOARD' && (
          <div className="max-w-5xl mx-auto space-y-10">
            <header>
              <h1 className="text-3xl font-black text-slate-900 mb-2">운영 실시간 리포트</h1>
              <p className="text-slate-500">안심골프 파트너스 골프장의 주요 지표를 분석합니다.</p>
            </header>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: '평균 예약률', value: `${stats.occupancyRate}%`, sub: '+2.1% 대비', color: 'text-blue-600' },
                { label: '당일 예상 매출', value: `₩${(stats.revenue/10000).toLocaleString()}만`, sub: '정산 예정', color: 'text-emerald-600' },
                { label: '덤핑 활성화', value: `${stats.cancelledCount}건`, sub: '즉시 수익화 중', color: 'text-orange-500' },
                { label: '덤핑 누적 매출', value: `₩${(stats.dumpingSales/10000).toLocaleString()}만`, sub: '손실 방어액', color: 'text-purple-600' },
              ].map((card) => (
                <div key={card.label} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
                  <p className="text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">{card.label}</p>
                  <p className={`text-2xl font-black ${card.color} mb-1`}>{card.value}</p>
                  <p className="text-[10px] text-slate-400 font-bold">{card.sub}</p>
                </div>
              ))}
            </div>

            {/* Real-time Liquidation (Dumping) Logic UI */}
            <div className="bg-slate-900 rounded-[40px] p-8 text-white relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full -mr-32 -mt-32"></div>
              <div className="relative z-10">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="text-xl font-black mb-1">실시간 덤핑 제어 엔진</h3>
                    <p className="text-slate-400 text-sm font-medium">잔여 및 취소 타임을 즉시 특가로 전환합니다.</p>
                  </div>
                  <div className="flex items-center gap-2 bg-emerald-500/20 px-4 py-2 rounded-full border border-emerald-500/30">
                    <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">Auto-Mode Active</span>
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    { course: '파주CC', time: '14:20', original: '21만', dump: '12만', reason: '직전 취소' },
                    { course: '남양주CC', time: '16:05', original: '18만', dump: '9만', reason: '잔여 타임' },
                  ].map((item, i) => (
                    <div key={i} className="bg-white/5 border border-white/10 p-5 rounded-2xl flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center font-black text-sm">D</div>
                        <div>
                          <p className="font-bold text-sm">{item.course} • {item.time}</p>
                          <p className="text-[10px] text-slate-500 font-medium">사유: {item.reason}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-slate-500 line-through">₩{item.original}</p>
                        <p className="text-emerald-400 font-black text-lg">₩{item.dump}</p>
                      </div>
                      <button className="bg-emerald-500 text-slate-900 px-4 py-2 rounded-lg text-[10px] font-black shadow-lg">중단</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeMenu === 'TASKS' && <NotionKanban />}

        {/* Other menus placeholders */}
        {activeMenu !== 'DASHBOARD' && activeMenu !== 'TASKS' && (
          <div className="flex flex-col items-center justify-center h-full text-slate-300">
            <span className="text-6xl mb-4">🏗️</span>
            <p className="text-sm font-bold uppercase tracking-widest">모듈 개발 중</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default GMSAdmin;