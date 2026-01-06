
import React, { useState, useMemo } from 'react';
import Header from './components/Header';
import BookingCard from './components/BookingCard';
import AIChatDrawer from './components/AIChatDrawer';
import DateSelector from './components/DateSelector';
import MobileNav from './components/MobileNav';
import BoardListItem from './components/BoardListItem';
import { LoginDrawer, PolicyDrawer } from './components/LegalDrawers';
import ManagerSaaS from './components/ManagerSaaS';
import { MOCK_TEE_TIMES, REGIONS, MOCK_DATE_COUNTS } from './constants';
import { BookingType } from './types';

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<'BOARD' | 'PRO' | 'SAAS'>('BOARD');
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [policyContent, setPolicyContent] = useState<{ isOpen: boolean, title: string }>({ isOpen: false, title: '' });
  const [selectedRegion, setSelectedRegion] = useState('ALL');
  const [selectedDate, setSelectedDate] = useState('2026-01-07');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTeeTimes = useMemo(() => {
    return MOCK_TEE_TIMES.filter(item => {
      const regionMatch = selectedRegion === 'ALL' || item.course.region === selectedRegion;
      const dateMatch = item.date === selectedDate;
      const searchMatch = item.course.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         item.course.location.toLowerCase().includes(searchQuery.toLowerCase());
      return regionMatch && dateMatch && searchMatch;
    });
  }, [selectedRegion, selectedDate, searchQuery]);

  return (
    <div className="min-h-screen flex flex-col bg-[#f4f7fa] pb-24 md:pb-0 font-sans tracking-tight">
      <Header 
        viewMode={viewMode === 'SAAS' ? 'PRO' : viewMode} 
        onViewModeChange={(mode) => setViewMode(mode)} 
      />

      {viewMode === 'SAAS' ? (
        <ManagerSaaS />
      ) : (
        <>
          {/* Pull to Refresh Area (Visual Accent) */}
          <div className="h-0.5 w-full bg-golfmon-gradient opacity-30"></div>

          <main className="flex-1 max-w-7xl mx-auto w-full">
            {/* Sticky Sub-Header for Dates */}
            <div className="sticky top-14 z-30 bg-white/95 backdrop-blur-md px-4 py-4 border-b border-slate-200/60 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                    {viewMode === 'BOARD' ? '실시간 타임' : '안심 추천'}
                  </h2>
                  <div className="flex items-center gap-1.5 bg-red-50 px-2 py-0.5 rounded-full">
                    <span className="flex h-1.5 w-1.5 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
                    </span>
                    <span className="text-[9px] text-red-600 font-black">LIVE</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setIsLoginOpen(true)} className="text-[10px] font-bold text-slate-400 hover:text-emerald-600 transition-colors">로그인</button>
                  <span className="text-[10px] text-slate-400 font-bold bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                    전체 <span className="text-emerald-600">{filteredTeeTimes.length}개</span>
                  </span>
                </div>
              </div>
              <DateSelector 
                dates={MOCK_DATE_COUNTS} 
                selectedDate={selectedDate} 
                onDateSelect={setSelectedDate} 
              />
            </div>

            <div className="px-0 md:px-6 py-0 md:py-8">
              <div className="flex flex-col md:flex-row gap-10">
                {/* Sidebar / Filters (Optimized Typography) */}
                <aside className="hidden md:block w-72 space-y-10 py-2">
                  <div>
                    <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Region Filter</h2>
                    <div className="flex flex-col gap-1.5">
                      {REGIONS.map(region => (
                        <button
                          key={region.id}
                          onClick={() => setSelectedRegion(region.id)}
                          className={`text-left px-5 py-3 rounded-2xl text-[13px] font-bold transition-all ${
                            selectedRegion === region.id 
                            ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200 translate-x-1' 
                            : 'text-slate-500 hover:bg-white hover:text-slate-900'
                          }`}
                        >
                          {region.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-6 bg-slate-900 rounded-[32px] text-white shadow-2xl shadow-slate-200 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700"></div>
                    <h3 className="text-lg font-black mb-2 relative z-10">안심 패스 구독</h3>
                    <p className="text-[11px] text-slate-400 mb-6 leading-relaxed relative z-10">
                      황금시간대 티타임 10분 선공개 및<br/>매칭 위약금 면제 혜택을 누리세요.
                    </p>
                    <button className="w-full bg-emerald-500 text-white font-black text-[11px] py-3 rounded-xl shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 transition-all relative z-10">
                      무료 체험 시작하기
                    </button>
                  </div>
                </aside>

                {/* Main Content Area */}
                <section className="flex-1">
                  {viewMode === 'PRO' && (
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 px-4 md:px-0">
                      <div className="flex items-baseline gap-2">
                        <h2 className="text-2xl font-bold text-slate-900">오늘의 추천 티타임</h2>
                      </div>
                      <div className="relative w-full md:w-80">
                        <input 
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="골프장 이름으로 검색"
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 pl-11 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all shadow-sm"
                        />
                        <svg className="absolute left-4 top-3 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                    </div>
                  )}

                  {filteredTeeTimes.length > 0 ? (
                    <div className={viewMode === 'BOARD' ? "flex flex-col bg-white md:rounded-3xl md:overflow-hidden md:border md:border-slate-100 shadow-sm" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4 md:px-0"}>
                      {filteredTeeTimes.map(tee => (
                        viewMode === 'BOARD' 
                          ? <BoardListItem key={tee.id} teeTime={tee} />
                          : <BookingCard key={tee.id} teeTime={tee} />
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[40px] border border-slate-100 mx-4 md:mx-0 shadow-sm">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mb-1">검색 결과가 없습니다</h3>
                      <p className="text-slate-400 text-xs font-medium">다른 지역이나 날짜를 선택해 보세요.</p>
                    </div>
                  )}
                </section>
              </div>
            </div>
          </main>
        </>
      )}

      <AIChatDrawer />
      <MobileNav />
      <LoginDrawer isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      <PolicyDrawer 
        isOpen={policyContent.isOpen} 
        onClose={() => setPolicyContent({ ...policyContent, isOpen: false })} 
        title={policyContent.title} 
      />

      <footer className="bg-white border-t border-slate-200 py-16 mt-12 hidden md:block">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-12">
            <div className="max-w-xs">
              <div className="flex items-center gap-2 mb-6">
                <div className="bg-golfmon-gradient p-1.5 rounded-lg shadow-sm">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.954 11.954 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <span className="text-lg font-black text-slate-900 tracking-tight text-xl font-bold text-slate-900 tracking-tight">안심<span className="text-emerald-600">골프</span></span>
              </div>
              <p className="text-slate-500 text-[11px] leading-relaxed mb-4">
                (주)안심네트웍스 | 대표: 조태석 | 사업자등록번호: 488-85-02883<br />
                통신판매업신고: 제 2024-서울강남-1992호<br />
                주소: 서울특별시 강남구 테헤란로 456 안심타워 11층
              </p>
              <div className="flex gap-4">
                <span className="text-[10px] text-slate-400">© 2026 Ansim Golf.</span>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-12 text-xs font-bold">
              <div>
                <h4 className="text-slate-900 mb-6 uppercase tracking-widest text-[10px]">Service</h4>
                <ul className="space-y-3 text-slate-500 font-medium">
                  <li><button onClick={() => setViewMode('BOARD')} className="hover:text-emerald-600 transition-colors">실시간 부킹</button></li>
                  <li><button onClick={() => setViewMode('PRO')} className="hover:text-emerald-600 transition-colors">안심 조인</button></li>
                  <li><button onClick={() => setViewMode('SAAS')} className="hover:text-blue-600 text-[10px] bg-blue-50 px-2 py-1 rounded-lg">파트너 전용</button></li>
                </ul>
              </div>
              <div>
                <h4 className="text-slate-900 mb-6 uppercase tracking-widest text-[10px]">Support</h4>
                <ul className="space-y-3 text-slate-500 font-medium">
                  <li><a href="tel:02-2003-2005" className="hover:text-emerald-600 transition-colors">고객센터 02-2003-2005</a></li>
                  <li><a href="#" className="hover:text-emerald-600 transition-colors">카카오톡 1:1 상담</a></li>
                  <li><a href="#" className="hover:text-emerald-600 transition-colors">매니저 제휴 문의</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-slate-900 mb-6 uppercase tracking-widest text-[10px]">Legal</h4>
                <ul className="space-y-3 text-slate-500 font-medium">
                  <li><button onClick={() => setPolicyContent({ isOpen: true, title: '이용약관' })} className="hover:text-emerald-600 transition-colors">이용약관</button></li>
                  <li><button onClick={() => setPolicyContent({ isOpen: true, title: '개인정보처리방침' })} className="hover:text-emerald-600 transition-colors">개인정보처리방침</button></li>
                  <li><button onClick={() => setPolicyContent({ isOpen: true, title: '위약금 정책' })} className="hover:text-emerald-600 transition-colors">위약금 및 환불 정책</button></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex gap-8 items-center opacity-50 grayscale hover:opacity-100 hover:grayscale-0 transition-all">
              <img src="https://img.shields.io/badge/Escrow-Protected-emerald" alt="Escrow" />
              <img src="https://img.shields.io/badge/ISMS-Certified-blue" alt="ISMS" />
            </div>
            <div className="flex gap-6 text-[10px] font-bold text-slate-400">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                에스크로 구매안전 서비스 가입
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
