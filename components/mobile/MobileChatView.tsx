import React from 'react';
import { TeeTime } from '../../types';

interface MobileChatViewProps {
  teeTime: TeeTime | null;
  onBack: () => void;
}

const MobileChatView: React.FC<MobileChatViewProps> = ({ teeTime }) => {
  return (
    <div className="pt-14 pb-16 flex flex-col h-screen bg-gray-50">
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        {teeTime?.manager && (
          <>
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 font-bold">
              {teeTime.manager.name[0]}
            </div>
            <div>
              <div className="font-bold text-sm text-gray-800">{teeTime.manager.name} 매니저</div>
              <div className="text-xs text-gray-400">{teeTime.course?.name}</div>
            </div>
          </>
        )}
      </div>

      {/* Chat Messages */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        <div className="bg-white p-3 rounded-xl border border-blue-50 shadow-sm mb-4">
          <p className="text-[11px] text-blue-600 font-black mb-1 flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            안심 예약 안내
          </p>
          <p className="text-[11px] text-gray-500 leading-relaxed font-bold">
            본 채팅은 사고 예방을 위해 자동 기록됩니다. 매니저가 안심결제를 제안하면 에스크로를 통해
            안전하게 거래하실 수 있습니다.
          </p>
        </div>

        <div className="flex items-start gap-2">
          <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0" />
          <div className="bg-white p-3 rounded-2xl rounded-tl-none text-sm text-gray-800 shadow-sm font-medium">
            반갑습니다. {teeTime?.course?.name} 티타임 예약 문의 주셨나요?
          </div>
        </div>

        <div className="flex justify-end">
          <div className="bg-[#1a73e8] text-white p-3 rounded-2xl rounded-br-none text-sm shadow-md font-medium max-w-[80%]">
            네, 안심예약으로 진행하고 싶습니다. 어떻게 하면 되나요?
          </div>
        </div>

        {teeTime?.escrowEnabled && (
          <div className="flex items-start gap-2">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0" />
            <div className="bg-white p-3 rounded-2xl rounded-tl-none text-sm text-gray-800 shadow-sm font-medium border-l-4 border-blue-400">
              안심결제(Pro) 전환이 가능합니다. 매니저가 결제 요청을 보내면 알림이 울립니다.
            </div>
          </div>
        )}
      </div>

      {/* Chat Input */}
      <div className="p-3 border-t border-gray-200 bg-white flex items-center gap-2">
        <button className="text-gray-400">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
        </button>
        <input
          type="text"
          placeholder="메시지 입력..."
          className="flex-1 bg-gray-50 rounded-full px-4 py-2.5 text-sm focus:outline-none border border-gray-100 font-medium"
        />
        <button className="text-[#1a73e8] font-black px-2">전송</button>
      </div>
    </div>
  );
};

export default MobileChatView;
