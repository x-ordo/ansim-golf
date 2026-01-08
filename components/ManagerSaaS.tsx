import React from 'react';
import { parseBookingText } from '../src/services/managerService';

const ManagerSaaS: React.FC = () => {
  const [pasteContent, setPasteContent] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [notification, setNotification] = React.useState<{ show: boolean, msg: string }>({ show: false, msg: '' });

  // [핵심 기능] AI 텍스트 파싱 로직 적용
  const handleParse = async () => {
    if (!pasteContent || isLoading) return;
    
    setIsLoading(true);
    try {
      const result = await parseBookingText(pasteContent);
      
      setNotification({
        show: true,
        msg: `[추출 완료] ${result.parsedCount}개의 티타임이 감지되었습니다.`
      });
      setPasteContent('');
    } catch (error: any) {
      setNotification({
        show: true,
        msg: `❌ 오류: ${error.message}`
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
      msg: `💬 [알림톡 발송] ${course} 예약 확정 및 위약 규정이 고객님께 전송되었습니다.`
    });
    setTimeout(() => setNotification({ show: false, msg: '' }), 3000);
  };

  return (
    <div className="flex-1 bg-slate-50 pb-20 md:pb-8 relative overflow-hidden">
      {/* Toast Notification */}
      {notification.show && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[200] w-[90%] max-w-md bg-slate-900 text-white p-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <div className="bg-emerald-500 p-1 rounded-full text-white">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
          </div>
          <span className="text-xs font-bold">{notification.msg}</span>
        </div>
      )}

      <div className="max-w-6xl mx-auto p-4 md:p-8">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-2xl font-black text-slate-900">파트너 대시보드</h2>
              <span className="bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">PRO PLAN</span>
            </div>
            <p className="text-sm text-slate-500">지사 공돌이 매니저님, 오늘 SaaS로 <span className="text-emerald-600 font-bold">2.4시간</span>을 아꼈습니다.</p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <button className="flex-1 bg-white border border-slate-200 text-slate-700 px-6 py-2.5 rounded-xl font-bold text-sm shadow-sm">정산 리포트</button>
            <button className="flex-1 bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-emerald-200">+ 개별 등록</button>
          </div>
        </header>

        <section className="bg-white p-6 rounded-[32px] border border-emerald-100 shadow-xl shadow-emerald-500/5 mb-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-emerald-50 p-2 rounded-lg text-emerald-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <h3 className="font-bold text-slate-900 text-lg">AI 인벤토리 퀵 업로드</h3>
          </div>
          <p className="text-xs text-slate-400 mb-4 font-medium">카톡이나 엑셀의 텍스트를 그대로 복사해서 붙여넣으세요. 날짜와 시간이 자동 추출됩니다.</p>
          <div className="relative">
            <textarea 
              value={pasteContent}
              onChange={(e) => setPasteContent(e.target.value)}
              placeholder="예: 8/15 파주CC 07:32 19만 조인1 / 델피노 36홀 패키지..."
              className="w-full h-32 bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            />
            <button 
              onClick={handleParse}
              className="absolute bottom-4 right-4 bg-slate-900 text-white px-4 py-2 rounded-lg text-[10px] font-bold shadow-lg active:scale-95 transition-all"
            >
              텍스트 파싱 및 등록
            </button>
          </div>
        </section>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: '활성 매물', count: '12', sub: '노출 중' },
            { label: '입금 대기', count: '3', sub: '미확인 건' },
            { label: '빌링키 확보', count: '15', sub: '노쇼 방어' },
            { label: '정산 예정', count: '₩124만', sub: 'T+1 정산' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
              <p className="text-[10px] font-black text-slate-400 mb-1 uppercase tracking-tighter">{stat.label}</p>
              <p className="text-xl font-black text-slate-900 mb-1">{stat.count}</p>
              <p className="text-[9px] text-emerald-600 font-bold">{stat.sub}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-white sticky top-0 z-10">
            <h3 className="font-bold text-slate-900">실시간 인벤토리 관리</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">골프장 / 일시</th>
                  <th className="px-6 py-4 text-center">노쇼보험</th>
                  <th className="px-6 py-4">입금상태</th>
                  <th className="px-6 py-4">액션</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {[
                  { course: '파주CC', date: '01/07 09:51', billing: true, status: 'CONFIRMED' },
                  { course: '남양주CC', date: '01/07 11:40', billing: true, status: 'DEPOSIT_PENDING' },
                  { course: '클럽72', date: '01/08 10:22', billing: false, status: 'AVAILABLE' },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{row.course}</div>
                      <div className="text-[10px] text-slate-400 font-medium">{row.date}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {row.billing ? (
                        <span className="inline-flex items-center gap-1 text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-full">
                          <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                          보험확보
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-300 font-medium italic">미가입</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className={`text-[10px] font-black ${row.status === 'CONFIRMED' ? 'text-emerald-600' : row.status === 'DEPOSIT_PENDING' ? 'text-orange-500' : 'text-slate-300'}`}>
                        {row.status === 'CONFIRMED' ? '입금확정' : row.status === 'DEPOSIT_PENDING' ? '입금대기' : '판매중'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {row.status === 'DEPOSIT_PENDING' && (
                          <button 
                            onClick={() => sendAlimTalk(row.course)}
                            className="px-3 py-1 bg-emerald-600 text-white text-[10px] font-black rounded-lg shadow-sm active:scale-95 transition-all"
                          >
                            입금확인 및 알림톡
                          </button>
                        )}
                        {row.status === 'CONFIRMED' && (
                          <button className="px-3 py-1 bg-red-50 text-red-600 text-[10px] font-black rounded-lg border border-red-100 active:scale-95 transition-all">노쇼신고</button>
                        )}
                        <button className="p-1.5 text-slate-300 hover:text-slate-600">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
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
    </div>
  );
};

export default ManagerSaaS;