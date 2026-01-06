
import React from 'react';

interface ShareDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
}

const ShareDrawer: React.FC<ShareDrawerProps> = ({ isOpen, onClose, title }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl animate-in slide-in-from-bottom-full duration-300">
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6 sm:hidden"></div>
        <h3 className="text-lg font-bold text-slate-900 mb-6">티타임 공유하기</h3>
        
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { name: '카카오톡', color: 'bg-[#FEE500]', icon: '💬' },
            { name: '복사하기', color: 'bg-slate-100', icon: '🔗' },
            { name: '메시지', color: 'bg-emerald-500', icon: '✉️' },
            { name: '밴드', color: 'bg-[#00C73C]', icon: ' BAND' },
          ].map((item) => (
            <button key={item.name} className="flex flex-col items-center gap-2">
              <div className={`w-14 h-14 ${item.color} rounded-2xl flex items-center justify-center text-2xl shadow-sm`}>
                {item.icon}
              </div>
              <span className="text-xs font-medium text-slate-600">{item.name}</span>
            </button>
          ))}
        </div>

        <button 
          onClick={onClose}
          className="w-full py-4 bg-slate-100 text-slate-900 font-bold rounded-xl hover:bg-slate-200 transition-colors"
        >
          닫기
        </button>
      </div>
    </div>
  );
};

export default ShareDrawer;
