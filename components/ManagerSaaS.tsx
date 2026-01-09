/**
 * ManagerSaaS - 파트너 대시보드
 * 시니어 친화 UI/UX 개선:
 * - 큰 글씨와 버튼
 * - 높은 대비
 * - 명확한 탭 네비게이션
 */

import React from 'react';
import { parseBookingText } from '../src/services/managerService';
import AutomationDashboard from './AutomationDashboard';

type TabType = 'inventory' | 'automation';

const ManagerSaaS: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState<TabType>('inventory');
  const [pasteContent, setPasteContent] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [notification, setNotification] = React.useState<{ show: boolean; msg: string }>({
    show: false,
    msg: '',
  });

  // [핵심 기능] AI 텍스트 파싱 로직 적용
  const handleParse = async () => {
    if (!pasteContent || isLoading) return;

    setIsLoading(true);
    try {
      const result = await parseBookingText(pasteContent);

      setNotification({
        show: true,
        msg: `[추출 완료] ${result.parsedCount}개의 티타임이 감지되었습니다.`,
      });
      setPasteContent('');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
      setNotification({
        show: true,
        msg: `오류: ${errorMessage}`,
      });
    } finally {
      setIsLoading(false);
      setTimeout(() => setNotification({ show: false, msg: '' }), 3000);
    }
  };

  // [핵심 기능] 알림톡 발송 시뮬레이션
  const sendAlimTalk = (course: string) => {
    setNotification({
      show: true,
      msg: `[알림톡 발송] ${course} 예약 확정 및 위약 규정이 고객님께 전송되었습니다.`,
    });
    setTimeout(() => setNotification({ show: false, msg: '' }), 3000);
  };

  return (
    <div className="flex-1 bg-slate-50 pb-20 md:pb-8 relative overflow-hidden">
      {/* Toast Notification - 시니어 친화: 큰 글씨, 높은 대비 */}
      {notification.show && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[200] w-[90%] max-w-lg bg-slate-900 text-white p-5 rounded-2xl shadow-2xl flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
          <div className="bg-emerald-500 p-2 rounded-full text-white flex-shrink-0">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <span className="text-base font-bold">{notification.msg}</span>
        </div>
      )}

      {/* 탭 네비게이션 - 시니어 친화: 큰 버튼, 명확한 활성 상태 */}
      <div className="bg-white border-b-2 border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-2 py-3">
            <TabButton
              active={activeTab === 'inventory'}
              onClick={() => setActiveTab('inventory')}
              icon={
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              }
              label="인벤토리 관리"
            />
            <TabButton
              active={activeTab === 'automation'}
              onClick={() => setActiveTab('automation')}
              icon={
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
              }
              label="자동화 현황"
              badge="4"
            />
          </div>
        </div>
      </div>

      {/* 탭 내용 */}
      {activeTab === 'automation' ? (
        <AutomationDashboard />
      ) : (
        <div className="max-w-6xl mx-auto p-4 md:p-8">
          {/* 헤더 - 시니어 친화: 큰 글씨 */}
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl md:text-3xl font-black text-slate-900">파트너 대시보드</h2>
                <span className="bg-emerald-600 text-white text-sm font-black px-3 py-1 rounded-full shadow-sm">
                  PRO
                </span>
              </div>
              <p className="text-base md:text-lg text-slate-600">
                지사 공돌이 매니저님, 오늘 SaaS로{' '}
                <span className="text-emerald-600 font-bold">2.4시간</span>을 아꼈습니다.
              </p>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <button className="flex-1 md:flex-none bg-white border-2 border-slate-300 text-slate-700 px-6 py-3 rounded-xl font-bold text-base shadow-sm hover:bg-slate-50 transition-colors">
                정산 리포트
              </button>
              <button className="flex-1 md:flex-none bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold text-base shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-colors">
                + 개별 등록
              </button>
            </div>
          </header>

          {/* AI 업로드 섹션 - 시니어 친화: 큰 입력창, 명확한 버튼 */}
          <section className="bg-white p-6 md:p-8 rounded-3xl border-2 border-emerald-200 shadow-xl shadow-emerald-500/5 mb-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-emerald-100 p-3 rounded-xl text-emerald-600">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="font-black text-slate-900 text-xl">AI 인벤토리 퀵 업로드</h3>
            </div>
            <p className="text-base text-slate-600 mb-5">
              카톡이나 엑셀의 텍스트를 그대로 복사해서 붙여넣으세요. 날짜와 시간이 자동 추출됩니다.
            </p>
            <div className="relative">
              <textarea
                value={pasteContent}
                onChange={(e) => setPasteContent(e.target.value)}
                placeholder="예: 8/15 파주CC 07:32 19만 조인1 / 델피노 36홀 패키지..."
                className="w-full h-40 bg-slate-50 border-2 border-slate-200 rounded-2xl p-5 text-base focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
              />
              <button
                onClick={handleParse}
                disabled={isLoading}
                className="absolute bottom-5 right-5 bg-slate-900 text-white px-6 py-3 rounded-xl text-base font-bold shadow-lg active:scale-95 transition-all hover:bg-slate-800 disabled:opacity-50"
              >
                {isLoading ? '처리 중...' : '텍스트 파싱 및 등록'}
              </button>
            </div>
          </section>

          {/* 통계 카드 - 시니어 친화: 큰 숫자, 명확한 라벨 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {[
              { label: '활성 매물', count: '12', sub: '노출 중', color: 'blue' },
              { label: '입금 대기', count: '3', sub: '미확인 건', color: 'orange' },
              { label: '빌링키 확보', count: '15', sub: '노쇼 방어', color: 'green' },
              { label: '정산 예정', count: '₩124만', sub: 'T+1 정산', color: 'purple' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-white p-5 md:p-6 rounded-2xl border-2 border-slate-200 shadow-sm"
              >
                <p className="text-sm font-black text-slate-500 mb-2 uppercase tracking-tight">
                  {stat.label}
                </p>
                <p className="text-2xl md:text-3xl font-black text-slate-900 mb-1">{stat.count}</p>
                <p className="text-sm text-emerald-600 font-bold">{stat.sub}</p>
              </div>
            ))}
          </div>

          {/* 인벤토리 테이블 - 시니어 친화: 큰 행, 명확한 버튼 */}
          <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b-2 border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
              <h3 className="font-black text-slate-900 text-xl">실시간 인벤토리 관리</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 text-sm font-black uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-5">골프장 / 일시</th>
                    <th className="px-6 py-5 text-center">노쇼보험</th>
                    <th className="px-6 py-5">입금상태</th>
                    <th className="px-6 py-5">액션</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-slate-100">
                  {[
                    { course: '파주CC', date: '01/07 09:51', billing: true, status: 'CONFIRMED' },
                    {
                      course: '남양주CC',
                      date: '01/07 11:40',
                      billing: true,
                      status: 'DEPOSIT_PENDING',
                    },
                    { course: '클럽72', date: '01/08 10:22', billing: false, status: 'AVAILABLE' },
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-5">
                        <div className="font-bold text-lg text-slate-900">{row.course}</div>
                        <div className="text-base text-slate-500 font-medium">{row.date}</div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        {row.billing ? (
                          <span className="inline-flex items-center gap-2 text-sm text-blue-700 font-bold bg-blue-100 px-4 py-2 rounded-full">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            보험확보
                          </span>
                        ) : (
                          <span className="text-base text-slate-400 font-medium">미가입</span>
                        )}
                      </td>
                      <td className="px-6 py-5">
                        <div
                          className={`text-base font-black ${
                            row.status === 'CONFIRMED'
                              ? 'text-emerald-600'
                              : row.status === 'DEPOSIT_PENDING'
                                ? 'text-orange-500'
                                : 'text-slate-400'
                          }`}
                        >
                          {row.status === 'CONFIRMED'
                            ? '입금확정'
                            : row.status === 'DEPOSIT_PENDING'
                              ? '입금대기'
                              : '판매중'}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex gap-3">
                          {row.status === 'DEPOSIT_PENDING' && (
                            <button
                              onClick={() => sendAlimTalk(row.course)}
                              className="px-5 py-3 bg-emerald-600 text-white text-base font-bold rounded-xl shadow-sm active:scale-95 transition-all hover:bg-emerald-700"
                            >
                              입금확인 및 알림톡
                            </button>
                          )}
                          {row.status === 'CONFIRMED' && (
                            <button className="px-5 py-3 bg-red-50 text-red-600 text-base font-bold rounded-xl border-2 border-red-200 active:scale-95 transition-all hover:bg-red-100">
                              노쇼신고
                            </button>
                          )}
                          <button className="p-3 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                            <svg
                              className="w-6 h-6"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                              />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 탭 버튼 컴포넌트 - 시니어 친화: 큰 터치 영역, 명확한 상태
interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  badge?: string;
}

const TabButton: React.FC<TabButtonProps> = ({ active, onClick, icon, label, badge }) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 px-5 py-3 rounded-xl font-bold text-base transition-all ${
        active
          ? 'bg-slate-900 text-white shadow-lg'
          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
      }`}
    >
      {icon}
      <span>{label}</span>
      {badge && (
        <span
          className={`px-2 py-0.5 rounded-full text-sm font-black ${
            active ? 'bg-emerald-500 text-white' : 'bg-emerald-100 text-emerald-700'
          }`}
        >
          {badge}
        </span>
      )}
    </button>
  );
};

export default ManagerSaaS;
