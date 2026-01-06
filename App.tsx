
import React, { useState, useMemo } from 'react';
import Header from './components/Header';
import BookingCard from './components/BookingCard';
import AIChatDrawer from './components/AIChatDrawer';
import { MOCK_TEE_TIMES, REGIONS } from './constants';

const App: React.FC = () => {
  const [selectedRegion, setSelectedRegion] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTeeTimes = useMemo(() => {
    return MOCK_TEE_TIMES.filter(item => {
      const regionMatch = selectedRegion === 'ALL' || item.course.region === selectedRegion;
      const searchMatch = item.course.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         item.course.location.toLowerCase().includes(searchQuery.toLowerCase());
      return regionMatch && searchMatch;
    });
  }, [selectedRegion, searchQuery]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        {/* Banner Section */}
        <section className="relative rounded-3xl overflow-hidden mb-12 bg-slate-900 h-[350px] flex flex-col justify-center px-8 md:px-16">
          <img 
            src="https://images.unsplash.com/photo-1535131749006-b7f58c99034b?q=80&w=1600&auto=format&fit=crop" 
            alt="Hero" 
            className="absolute inset-0 w-full h-full object-cover opacity-40"
          />
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-emerald-600/20 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold mb-4 border border-emerald-400/30">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              에스크로 안심 결제 정식 제휴
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
              신뢰를 부킹하다<br />
              <span className="text-emerald-500">안심골프</span> 에스크로
            </h1>
            <p className="text-slate-200 text-lg mb-8 opacity-90">
              불법 크롤링 없는 정식 파트너십 재고. 먹튀 걱정 없는 선결제 시스템.<br />
              공정위 표준약관을 준수하는 가장 투명한 골프 플랫폼입니다.
            </p>
            <div className="flex gap-4">
              <button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-full transition-all shadow-lg shadow-emerald-500/20">
                안심 티타임 찾기
              </button>
              <button className="bg-white/10 backdrop-blur hover:bg-white/20 text-white font-bold py-3 px-8 rounded-full border border-white/30 transition-all">
                파트너 SaaS 도구 체험
              </button>
            </div>
          </div>
        </section>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar / Filters */}
          <aside className="w-full md:w-64 space-y-8">
            <div>
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">지역 필터</h2>
              <div className="flex flex-col gap-2">
                {REGIONS.map(region => (
                  <button
                    key={region.id}
                    onClick={() => setSelectedRegion(region.id)}
                    className={`text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      selectedRegion === region.id 
                      ? 'bg-emerald-50 text-emerald-700 shadow-sm' 
                      : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {region.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-5 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl text-white shadow-xl shadow-emerald-100">
              <h3 className="font-bold mb-2">안심 패스 구독</h3>
              <p className="text-xs opacity-80 mb-4 leading-relaxed">
                황금시간대 티타임 10분 선공개 및 매칭 위약금 면제 혜택을 누리세요.
              </p>
              <button className="w-full bg-white text-emerald-700 font-bold text-xs py-2 rounded-lg shadow-sm hover:scale-105 transition-all">
                무료 체험 시작하기
              </button>
            </div>

            <div className="border-t border-slate-200 pt-8">
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">안심골프 보증 시스템</h2>
              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-3">
                  <div className="bg-emerald-50 p-2 rounded-lg">
                    <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.954 11.954 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">선결제 에스크로 보호</h4>
                    <p className="text-[10px] text-slate-500 leading-tight">라운드 체크인 시까지 대금이 안전하게 보관됩니다.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-slate-50 p-2 rounded-lg">
                    <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">빌링키 기반 노쇼 관리</h4>
                    <p className="text-[10px] text-slate-500 leading-tight">약관 위반 노쇼 발생 시 자동 위약금이 청구됩니다.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-emerald-50 p-2 rounded-lg">
                    <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">공정위 환불 규정 준수</h4>
                    <p className="text-[10px] text-slate-500 leading-tight">4일 전 100% 자동 환불을 시스템으로 보장합니다.</p>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <section className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div className="flex items-baseline gap-2">
                <h2 className="text-2xl font-bold text-slate-900">오늘의 추천 티타임</h2>
                <span className="text-sm font-medium text-slate-400">실시간 안심 매물 {filteredTeeTimes.length}개</span>
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

            {filteredTeeTimes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTeeTimes.map(tee => (
                  <BookingCard key={tee.id} teeTime={tee} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                <div className="bg-slate-50 p-4 rounded-full mb-4">
                  <svg className="w-12 h-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">검색 결과가 없습니다</h3>
                <p className="text-slate-500 text-sm">다른 지역이나 검색어로 다시 시도해 보세요.</p>
              </div>
            )}
          </section>
        </div>
      </main>

      <AIChatDrawer />

      <footer className="bg-white border-t border-slate-200 py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-8">
            <div className="max-w-xs">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-emerald-600 p-1.5 rounded-lg">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </div>
                <span className="text-lg font-bold text-slate-900 tracking-tight">안심<span className="text-emerald-600">골프</span></span>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed">
                (주)안심골프네트웍스 | 대표: 이안심 | 사업자등록번호: 220-88-12345<br />
                통신판매업신고: 2024-서울강남-0001호<br />
                주소: 서울특별시 강남구 테헤란로 456 안심타워 11층
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 text-sm">
              <div>
                <h4 className="font-bold text-slate-900 mb-4">서비스</h4>
                <ul className="space-y-2 text-slate-500">
                  <li><a href="#" className="hover:text-emerald-600">실시간 부킹</a></li>
                  <li><a href="#" className="hover:text-emerald-600">조인 매칭</a></li>
                  <li><a href="#" className="hover:text-emerald-600">에스크로 정산</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-slate-900 mb-4">고객지원</h4>
                <ul className="space-y-2 text-slate-500">
                  <li><a href="#" className="hover:text-emerald-600">안심 가이드</a></li>
                  <li><a href="#" className="hover:text-emerald-600">자주 묻는 질문</a></li>
                  <li><a href="#" className="hover:text-emerald-600">1:1 채팅 문의</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-slate-900 mb-4">정책</h4>
                <ul className="space-y-2 text-slate-500">
                  <li><a href="#" className="hover:text-emerald-600">이용약관</a></li>
                  <li><a href="#" className="hover:text-emerald-600 font-bold">개인정보처리방침</a></li>
                  <li><a href="#" className="hover:text-emerald-600">취소/환불 규정</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-400">
            <p>© 2024 Ansim Golf. All rights reserved.</p>
            <div className="flex gap-6">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                에스크로 구매안전 서비스 가입
              </span>
              <span>ISMS 개인정보보호 인증</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
