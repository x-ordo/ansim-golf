import React from 'react';

const MobileMyInfoView: React.FC = () => {
  return (
    <div className="pt-24 text-center px-10 bg-white min-h-screen">
      <div className="w-20 h-20 bg-gray-50 rounded-full mx-auto mb-6 flex items-center justify-center text-gray-300 border border-gray-100">
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      </div>
      <h2 className="text-xl font-black text-gray-800">내 정보</h2>
      <p className="text-xs text-gray-400 mt-2 font-bold leading-relaxed">
        라운딩 내역 및 채팅 기록을 확인하려면
        <br />
        로그인이 필요합니다.
      </p>
      <button className="mt-10 w-full py-4 bg-[#1a73e8] text-white font-black rounded-2xl shadow-xl shadow-blue-100 active:scale-[0.98] transition-transform">
        로그인 / 회원가입
      </button>
      <div className="mt-8 grid grid-cols-2 gap-3">
        <div className="bg-gray-50 p-4 rounded-xl text-left border border-gray-100">
          <div className="text-[10px] font-black text-gray-400 mb-1">나의 예약</div>
          <div className="text-sm font-black">0건</div>
        </div>
        <div className="bg-gray-50 p-4 rounded-xl text-left border border-gray-100">
          <div className="text-[10px] font-black text-gray-400 mb-1">관심 매니저</div>
          <div className="text-sm font-black">0명</div>
        </div>
      </div>
    </div>
  );
};

export default MobileMyInfoView;
