
import React from 'react';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginDrawer: React.FC<DrawerProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white">
      <div className="w-full max-w-md p-8 flex flex-col h-full">
        <div className="flex justify-end mb-12">
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="bg-golfmon-gradient p-4 rounded-3xl mb-6 shadow-xl shadow-emerald-500/20">
            <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.954 11.954 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">안심골프 시작하기</h2>
          <p className="text-slate-500 text-sm mb-12">신뢰할 수 있는 매니저와 안전한 부킹</p>
          
          <div className="w-full space-y-3">
            <button className="w-full py-4 bg-[#FEE500] text-slate-900 font-bold rounded-2xl flex items-center justify-center gap-3 active:scale-[0.98] transition-all">
              <span className="text-lg">💬</span> 카카오로 3초 로그인
            </button>
            <button className="w-full py-4 bg-[#03C75A] text-white font-bold rounded-2xl flex items-center justify-center gap-3 active:scale-[0.98] transition-all">
              <span className="text-lg">N</span> 네이버로 시작하기
            </button>
            <button className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl active:scale-[0.98] transition-all">
              Apple로 로그인
            </button>
          </div>
        </div>
        <div className="py-8 text-center">
          <p className="text-[10px] text-slate-400">로그인 시 이용약관 및 개인정보처리방침에 동의하게 됩니다.</p>
        </div>
      </div>
    </div>
  );
};

export const PolicyDrawer: React.FC<DrawerProps & { title: string }> = ({ isOpen, onClose, title }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[110] flex items-end justify-center">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-2xl bg-white rounded-t-3xl p-6 h-[80vh] flex flex-col shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          <button onClick={onClose} className="p-2 text-slate-400">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto text-sm text-slate-600 leading-relaxed space-y-4 pr-2">
          <p className="font-bold text-slate-900">제 1조 (목적)</p>
          <p>본 약관은 안심골프(이하 "회사")가 운영하는 서비스를 이용함에 있어 회사와 이용자의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.</p>
          <p className="font-bold text-slate-900">제 2조 (서비스의 내용)</p>
          <p>1. 골프장 티타임 예약 및 양도/조인 중개<br/>2. 에스크로 결제 대금 보호 시스템 운영<br/>3. 매니저 관리 SaaS 도구 제공</p>
          {/* ... (Detailed policy text) */}
        </div>
      </div>
    </div>
  );
};
