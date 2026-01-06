
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-lg border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="bg-golfmon-gradient p-1.5 rounded-lg shadow-sm">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.954 11.954 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <span className="text-lg font-black text-slate-900 tracking-tight">안심<span className="text-emerald-600">골프</span></span>
          </div>

        <div className="flex items-center gap-3">
          <button className="text-sm font-semibold text-slate-700 px-4 py-2 hover:bg-slate-100 rounded-full transition-all">로그인</button>
          <button className="text-sm font-semibold bg-emerald-600 text-white px-5 py-2 rounded-full hover:bg-emerald-700 shadow-sm shadow-emerald-200 transition-all">무료 시작하기</button>
        </div>
      </div>
    </header>
  );
};

export default Header;
