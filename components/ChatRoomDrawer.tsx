
import React, { useState, useEffect, useRef } from 'react';
import { TeeTime } from '../types';

interface ChatRoomDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  manager: { id: string; name: string };
  teeTime?: TeeTime;
  onEscrowRequest?: () => void;
}

const ChatRoomDrawer: React.FC<ChatRoomDrawerProps> = ({ isOpen, onClose, manager, teeTime, onEscrowRequest }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'manager', text: string, time: string, isEscrow?: boolean }[]>([]);
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      // 초기 메시지 시뮬레이션
      setMessages([
        { 
          role: 'manager', 
          text: `안녕하세요! ${teeTime?.course.name || ''} ${teeTime?.time || ''} 티타임 문의주셨나요?`, 
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
        }
      ]);
    }
  }, [isOpen, teeTime]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    
    const newMessage = {
      role: 'user' as const,
      text: inputText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, newMessage]);
    setInputText('');

    // 매니저 응답 시뮬레이션 (3회 이상 대화 시 에스크로 제안 로직)
    setTimeout(() => {
      if (messages.length === 1) {
        setMessages(prev => [...prev, {
          role: 'manager',
          text: "네, 예약 가능합니다. 입금 확인되면 바로 확정 도와드릴게요.",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      } else if (messages.length === 3) {
        setMessages(prev => [...prev, {
          role: 'manager',
          text: "불안하시면 저희 안심결제(에스크로) 서비스를 이용해보시겠어요? 노쇼 방지 보험도 자동으로 적용됩니다.",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isEscrow: true
        }]);
      }
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-end justify-center sm:items-center">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-lg bg-[#f0f2f5] h-[90vh] sm:h-[700px] sm:rounded-3xl flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom-full duration-300">
        {/* Chat Header */}
        <header className="bg-white px-4 py-3 border-b border-slate-200 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden ring-2 ring-emerald-500/20">
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${manager.name}`} alt={manager.name} />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <h3 className="text-sm font-bold text-slate-900">{manager.name} 매니저</h3>
                <span className="bg-emerald-50 text-emerald-600 text-[8px] px-1 rounded font-black uppercase">Active</span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">보통 5분 내 응답</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </header>

        {/* Messages Area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-emerald-600 text-white rounded-tr-none' 
                    : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'
                }`}>
                  {msg.text}
                  {msg.isEscrow && (
                    <button 
                      onClick={onEscrowRequest}
                      className="mt-3 w-full bg-emerald-50 text-emerald-700 py-2 rounded-xl font-black text-xs border border-emerald-100 flex items-center justify-center gap-1 hover:bg-emerald-100 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                      안심결제 링크 열기
                    </button>
                  )}
                </div>
                <span className="text-[9px] text-slate-400 mt-1 px-1 font-medium">{msg.time}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Input Area */}
        <footer className="bg-white p-4 border-t border-slate-200">
          <div className="flex gap-2 items-center">
            <button className="p-2 text-slate-400 hover:text-emerald-600 transition-colors">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            </button>
            <input 
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="매니저에게 메시지 보내기..."
              className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            />
            <button 
              onClick={handleSend}
              className={`p-2 rounded-xl transition-all ${inputText.trim() ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'bg-slate-100 text-slate-300'}`}
            >
              <svg className="w-6 h-6 rotate-90" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default ChatRoomDrawer;
