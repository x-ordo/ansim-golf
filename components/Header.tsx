
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-emerald-600 p-1.5 rounded-lg shadow-sm shadow-emerald-200">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <span className="text-xl font-bold text-slate-900 tracking-tight">안심<span className="text-emerald-600">골프</span></span>
        </div>
        
        <nav className="hidden md:flex items-center gap-8">
          <a href="#" className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors">실시간 부킹</a>
          <a href="#" className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors">조인광장</a>
          <a href="#" className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors">해외투어</a>
          <a href="#" className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors">안심매니저</a>
        </nav>

        <div className="flex items-center gap-3">
          <button className="text-sm font-semibold text-slate-700 px-4 py-2 hover:bg-slate-100 rounded-full transition-all">로그인</button>
          <button className="text-sm font-semibold bg-emerald-600 text-white px-5 py-2 rounded-full hover:bg-emerald-700 shadow-sm shadow-emerald-200 transition-all">무료 시작하기</button>
        </div>
      </div>
    </header>
  );
};

export default Header;
