/**
 * AutomationDashboard - 자동화 현황 대시보드
 * 시니어 친화 UI/UX 설계:
 * - 큰 글씨 (기본 18px, 중요 정보 24px+)
 * - 높은 대비 (진한 텍스트, 밝은 배경)
 * - 큰 버튼 (최소 48px 터치 영역)
 * - 명확한 아이콘과 라벨
 * - 충분한 여백
 */

import React from 'react';

// 자동화 상태 타입
type AutomationStatus = 'active' | 'paused' | 'error';

interface AutomationModule {
  id: string;
  name: string;
  description: string;
  status: AutomationStatus;
  lastRun?: string;
  nextRun?: string;
  stats: {
    label: string;
    value: string;
  };
}

interface RecentActivity {
  id: string;
  type: 'reminder' | 'dumping' | 'noshow' | 'settlement';
  message: string;
  time: string;
  status: 'success' | 'pending' | 'failed';
}

const AutomationDashboard: React.FC = () => {
  // 자동화 모듈 상태 (실제로는 API에서 가져옴)
  const modules: AutomationModule[] = [
    {
      id: 'reminder',
      name: '라운드 리마인더',
      description: '예약 고객에게 D-1, D-0 알림 자동 발송',
      status: 'active',
      lastRun: '오늘 09:00',
      nextRun: '오늘 10:00',
      stats: { label: '오늘 발송', value: '12건' },
    },
    {
      id: 'dumping',
      name: '덤핑 가격 조정',
      description: '빈 타임 자동 할인 (6시간 전 30%, 12시간 전 20%)',
      status: 'active',
      lastRun: '09:15',
      nextRun: '09:30',
      stats: { label: '오늘 조정', value: '5건' },
    },
    {
      id: 'noshow',
      name: '노쇼 자동 체크',
      description: '티타임 30분 후 미체크인 자동 감지',
      status: 'active',
      lastRun: '09:00',
      nextRun: '09:30',
      stats: { label: '이번 주', value: '2건' },
    },
    {
      id: 'settlement',
      name: '정산 리포트',
      description: '매일 06:00 자동 정산 (T+1)',
      status: 'active',
      lastRun: '오늘 06:00',
      nextRun: '내일 06:00',
      stats: { label: '이번 달', value: '₩2,450만' },
    },
  ];

  // 최근 활동 (실제로는 API에서 가져옴)
  const recentActivities: RecentActivity[] = [
    {
      id: '1',
      type: 'reminder',
      message: '파주CC 내일 라운드 리마인더 발송 완료',
      time: '5분 전',
      status: 'success',
    },
    {
      id: '2',
      type: 'dumping',
      message: '남양주CC 07:32 → 152,000원으로 조정',
      time: '12분 전',
      status: 'success',
    },
    {
      id: '3',
      type: 'noshow',
      message: '클럽72 노쇼 의심 - 매니저 확인 필요',
      time: '1시간 전',
      status: 'pending',
    },
    {
      id: '4',
      type: 'settlement',
      message: '1/9 일간 정산 완료 (₩87만원)',
      time: '3시간 전',
      status: 'success',
    },
  ];

  // 상태에 따른 색상
  const getStatusColor = (status: AutomationStatus) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  const getStatusText = (status: AutomationStatus) => {
    switch (status) {
      case 'active':
        return '정상 작동 중';
      case 'paused':
        return '일시 정지';
      case 'error':
        return '오류 발생';
    }
  };

  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'reminder':
        return (
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
        );
      case 'dumping':
        return (
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      case 'noshow':
        return (
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        );
      case 'settlement':
        return (
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        );
    }
  };

  const getActivityStatusColor = (status: RecentActivity['status']) => {
    switch (status) {
      case 'success':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'failed':
        return 'bg-red-500';
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-24">
      {/* 헤더 - 시니어 친화: 큰 글씨, 명확한 제목 */}
      <div className="bg-white border-b-2 border-slate-200 px-6 py-6">
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 mb-2">자동화 현황</h1>
        <p className="text-lg text-slate-600">
          모든 자동화 기능이 <span className="text-green-600 font-bold">정상 작동</span> 중입니다
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* 전체 요약 카드 - 시니어 친화: 큰 숫자, 높은 대비 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <SummaryCard icon="bell" label="오늘 알림" value="12" unit="건" color="blue" />
          <SummaryCard icon="price" label="가격 조정" value="5" unit="건" color="green" />
          <SummaryCard icon="warning" label="노쇼 감지" value="0" unit="건" color="orange" />
          <SummaryCard icon="money" label="이번 달 정산" value="2,450" unit="만원" color="purple" />
        </div>

        {/* 자동화 모듈 목록 - 시니어 친화: 큰 카드, 명확한 상태 */}
        <h2 className="text-xl font-black text-slate-900 mb-5 flex items-center gap-3">
          <span className="bg-slate-900 text-white w-8 h-8 rounded-lg flex items-center justify-center text-base">
            4
          </span>
          자동화 기능
        </h2>

        <div className="space-y-4 mb-10">
          {modules.map((module) => (
            <div
              key={module.id}
              className="bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-sm"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-black text-slate-900">{module.name}</h3>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-bold border-2 ${getStatusColor(module.status)}`}
                    >
                      {getStatusText(module.status)}
                    </span>
                  </div>
                  <p className="text-base text-slate-600 mb-3">{module.description}</p>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <span className="text-slate-500">
                      마지막 실행:{' '}
                      <span className="font-bold text-slate-700">{module.lastRun}</span>
                    </span>
                    <span className="text-slate-500">
                      다음 실행: <span className="font-bold text-slate-700">{module.nextRun}</span>
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center bg-slate-50 rounded-xl px-6 py-3 border border-slate-200">
                    <p className="text-sm text-slate-500 mb-1">{module.stats.label}</p>
                    <p className="text-2xl font-black text-slate-900">{module.stats.value}</p>
                  </div>
                  <button
                    className="w-14 h-14 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center transition-colors"
                    aria-label="설정"
                  >
                    <svg
                      className="w-7 h-7 text-slate-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 최근 활동 - 시니어 친화: 큰 아이콘, 명확한 시간 표시 */}
        <h2 className="text-xl font-black text-slate-900 mb-5">최근 활동</h2>

        <div className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden">
          {recentActivities.map((activity, index) => (
            <div
              key={activity.id}
              className={`flex items-center gap-4 p-5 ${
                index !== recentActivities.length - 1 ? 'border-b-2 border-slate-100' : ''
              }`}
            >
              {/* 상태 표시 점 */}
              <div className={`w-3 h-3 rounded-full ${getActivityStatusColor(activity.status)}`} />

              {/* 아이콘 */}
              <div className="text-slate-400">{getActivityIcon(activity.type)}</div>

              {/* 내용 */}
              <div className="flex-1">
                <p className="text-lg text-slate-900 font-medium">{activity.message}</p>
              </div>

              {/* 시간 */}
              <div className="text-base text-slate-500 font-medium whitespace-nowrap">
                {activity.time}
              </div>
            </div>
          ))}
        </div>

        {/* 전체 보기 버튼 - 시니어 친화: 큰 버튼 */}
        <button className="w-full mt-6 bg-white border-2 border-slate-300 text-slate-700 py-4 rounded-xl text-lg font-bold hover:bg-slate-50 transition-colors">
          전체 활동 내역 보기
        </button>
      </div>
    </div>
  );
};

// 요약 카드 컴포넌트 - 시니어 친화: 큰 숫자, 명확한 라벨
interface SummaryCardProps {
  icon: 'bell' | 'price' | 'warning' | 'money';
  label: string;
  value: string;
  unit: string;
  color: 'blue' | 'green' | 'orange' | 'purple';
}

const SummaryCard: React.FC<SummaryCardProps> = ({ icon, label, value, unit, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    orange: 'bg-orange-50 border-orange-200 text-orange-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
  };

  const iconClasses = {
    blue: 'text-blue-500',
    green: 'text-green-500',
    orange: 'text-orange-500',
    purple: 'text-purple-500',
  };

  const getIcon = () => {
    switch (icon) {
      case 'bell':
        return (
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
        );
      case 'price':
        return (
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
            />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        );
      case 'money':
        return (
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
    }
  };

  return (
    <div className={`rounded-2xl border-2 p-5 ${colorClasses[color]}`}>
      <div className={`mb-3 ${iconClasses[color]}`}>{getIcon()}</div>
      <p className="text-sm font-bold opacity-80 mb-1">{label}</p>
      <p className="text-3xl font-black">
        {value}
        <span className="text-lg font-bold ml-1">{unit}</span>
      </p>
    </div>
  );
};

export default AutomationDashboard;
