import React, { useState } from 'react';
import { TeeTime, MobileView, MobileTab } from '../../types';
import { useTeeTimes } from '../../src/hooks/useTeeTimes';
import MobileListView from './MobileListView';
import MobileDetailView from './MobileDetailView';
import MobileChatView from './MobileChatView';
import MobileProfileView from './MobileProfileView';
import MobileMyInfoView from './MobileMyInfoView';

const MobileViewContainer: React.FC = () => {
  const { data: teeTimes, loading, error } = useTeeTimes();
  const [activeTab, setActiveTab] = useState<MobileTab>('board');
  const [currentView, setCurrentView] = useState<MobileView>('list');
  const [selectedTeeTime, setSelectedTeeTime] = useState<TeeTime | null>(null);
  const [selectedManagerId, setSelectedManagerId] = useState<string | null>(null);

  const navigateToDetail = (teeTime: TeeTime) => {
    setSelectedTeeTime(teeTime);
    setCurrentView('detail');
  };

  const navigateToChat = (teeTime?: TeeTime) => {
    if (teeTime) setSelectedTeeTime(teeTime);
    setCurrentView('chat');
  };

  const navigateToProfile = (managerId: string) => {
    setSelectedManagerId(managerId);
    setCurrentView('profile');
  };

  const navigateToList = () => {
    setCurrentView('list');
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-100 border-t-[#1a73e8] rounded-full animate-spin"></div>
          <p className="text-sm font-bold text-slate-400">불러오는 중...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-6">
        <div className="text-center">
          <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500 text-lg font-bold">
            !
          </div>
          <h3 className="text-base font-black text-slate-900 mb-2">데이터를 불러올 수 없습니다</h3>
          <p className="text-sm text-slate-400 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  const renderHeader = () => {
    if (currentView === 'detail' || currentView === 'profile') {
      return (
        <header className="fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-200 flex items-center px-4 z-50">
          <button onClick={navigateToList} className="mr-4">
            <svg
              className="w-6 h-6 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <h1 className="text-lg font-bold">
            {currentView === 'profile' ? '매니저 정보' : '티타임 정보'}
          </h1>
        </header>
      );
    }

    return (
      <header className="fixed top-0 left-0 right-0 bg-white z-50">
        {/* Top Logo Bar */}
        <div className="h-12 flex items-center px-4 border-b border-gray-100">
          <h1
            className="text-xl font-black italic tracking-tight text-[#1a73e8] cursor-pointer"
            onClick={() => {
              setActiveTab('board');
              setCurrentView('list');
            }}
          >
            ANSIM GOLF
          </h1>
          <div className="ml-auto flex gap-4 text-xs font-bold text-gray-500">
            <button>로그인</button>
            <button>무료 시작하기</button>
          </div>
        </div>
        {/* GNB (Board / Pro / Partner) */}
        <div className="h-12 flex border-b border-gray-200 bg-white">
          <button
            onClick={() => {
              setActiveTab('board');
              setCurrentView('list');
            }}
            className={`flex-1 text-sm font-bold border-b-2 transition-colors ${
              activeTab === 'board'
                ? 'border-[#1a73e8] text-[#1a73e8]'
                : 'border-transparent text-gray-400'
            }`}
          >
            실시간 티타임
          </button>
          <button
            onClick={() => {
              setActiveTab('pro');
              setCurrentView('list');
            }}
            className={`flex-1 text-sm font-bold border-b-2 transition-colors ${
              activeTab === 'pro'
                ? 'border-[#1a73e8] text-[#1a73e8]'
                : 'border-transparent text-gray-400'
            }`}
          >
            안심 예약 (Pro)
          </button>
          <button
            onClick={() => setActiveTab('partner')}
            className={`flex-1 text-sm font-bold border-b-2 transition-colors ${
              activeTab === 'partner'
                ? 'border-[#1a73e8] text-[#1a73e8]'
                : 'border-transparent text-gray-400'
            }`}
          >
            파트너
          </button>
        </div>
      </header>
    );
  };

  const renderContent = () => {
    switch (currentView) {
      case 'list':
        return (
          <MobileListView
            teeTimes={teeTimes || []}
            activeTab={activeTab}
            onSelectTeeTime={navigateToDetail}
            onOpenChat={navigateToChat}
          />
        );
      case 'detail':
        return selectedTeeTime ? (
          <MobileDetailView
            teeTime={selectedTeeTime}
            onBack={navigateToList}
            onOpenChat={() => navigateToChat(selectedTeeTime)}
            onViewProfile={navigateToProfile}
          />
        ) : null;
      case 'chat':
        return <MobileChatView teeTime={selectedTeeTime} onBack={navigateToList} />;
      case 'profile':
        return (
          <MobileProfileView
            managerId={selectedManagerId}
            teeTimes={teeTimes || []}
            onSelectTeeTime={navigateToDetail}
            onBack={navigateToList}
          />
        );
      case 'myinfo':
        return <MobileMyInfoView />;
      default:
        return null;
    }
  };

  const NavItem = ({
    view,
    label,
    icon,
  }: {
    view: MobileView;
    label: string;
    icon: React.ReactNode;
  }) => {
    const isActive = currentView === view;
    return (
      <button
        onClick={() => {
          setCurrentView(view);
          if (view === 'list') setActiveTab('board');
        }}
        className={`flex-1 flex flex-col items-center justify-center gap-1 h-full ${
          isActive ? 'text-[#1a73e8]' : 'text-gray-400'
        }`}
      >
        <div className={`transition-transform ${isActive ? 'scale-110' : ''}`}>{icon}</div>
        <span className="text-[10px] font-black">{label}</span>
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 select-none max-w-md mx-auto relative shadow-2xl overflow-x-hidden border-x border-gray-100">
      {renderHeader()}

      <main className="min-h-screen bg-white">{renderContent()}</main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto h-16 bg-white border-t border-gray-100 flex items-center z-50">
        <NavItem
          view="list"
          label="홈"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
          }
        />
        <NavItem
          view="chat"
          label="채팅"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
          }
        />
        <NavItem
          view="myinfo"
          label="내정보"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          }
        />
      </nav>
    </div>
  );
};

export default MobileViewContainer;
