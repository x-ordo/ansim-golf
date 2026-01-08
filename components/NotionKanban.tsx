
import React from 'react';
import { KanbanTask } from '../types';

const KANBAN_DATA: KanbanTask[] = [
  { id: '1', title: 'REQ-B01 실시간 재고 동기화', description: 'GMS-SaaS-Board 통합 DB 설계 및 API 개발', status: 'IN_PROGRESS', priority: 'CRITICAL', assignee: '하성', category: 'FINTECH' },
  { id: '2', title: 'REQ-M01 AI 텍스트 파서', description: 'Gemini API 연동 비정형 텍스트 추출 엔진 정교화', status: 'TODO', priority: 'HIGH', assignee: 'AI', category: 'SAAS' },
  { id: '3', title: 'REQ-P01 에스크로 결제 위젯', description: '토스페이먼츠 SDK 연동 및 샌드박스 테스트', status: 'DONE', priority: 'CRITICAL', assignee: '하성', category: 'FINTECH' },
  { id: '4', title: 'REQ-G03 권한별 슬롯 배정', description: '회원 등급별 예약 가용 시간대 로직 구현', status: 'TODO', priority: 'MEDIUM', assignee: '미정', category: 'GMS' },
  { id: '5', title: 'UI/UX 디자인 고도화', description: '디자인 가이드라인에 따른 전반적 테마 튜닝', status: 'DONE', priority: 'HIGH', assignee: '하성', category: 'B2C' },
];

const COLUMNS = [
  { id: 'TODO', label: '할 일', color: 'bg-slate-100 text-slate-600' },
  { id: 'IN_PROGRESS', label: '진행 중', color: 'bg-blue-100 text-blue-600' },
  { id: 'REVIEW', label: '검토', color: 'bg-purple-100 text-purple-600' },
  { id: 'DONE', label: '완료', color: 'bg-emerald-100 text-emerald-600' },
];

const NotionKanban: React.FC = () => {
  return (
    <div className="flex-1 overflow-x-auto bg-white p-8">
      <div className="flex gap-6 min-w-max">
        {COLUMNS.map((col) => (
          <div key={col.id} className="w-72 flex flex-col gap-4">
            <div className="flex items-center justify-between px-2 mb-2">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[11px] font-black uppercase tracking-tight ${col.color}`}>
                  {col.label}
                </span>
                <span className="text-xs font-bold text-slate-300">
                  {KANBAN_DATA.filter(t => t.status === col.id).length}
                </span>
              </div>
              <button className="text-slate-300 hover:text-slate-600">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {KANBAN_DATA.filter(t => t.status === col.id).map((task) => (
                <div 
                  key={task.id} 
                  className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-slate-300 transition-all cursor-grab active:cursor-grabbing group"
                >
                  <div className="flex gap-1.5 mb-2">
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      task.category === 'FINTECH' ? 'bg-orange-50 text-orange-600' :
                      task.category === 'SAAS' ? 'bg-blue-50 text-blue-600' :
                      task.category === 'GMS' ? 'bg-purple-50 text-purple-600' : 'bg-emerald-50 text-emerald-600'
                    }`}>
                      {task.category}
                    </span>
                    {task.priority === 'CRITICAL' && (
                      <span className="text-[9px] font-bold bg-red-50 text-red-600 px-1.5 py-0.5 rounded italic">Critical</span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 mb-1 leading-snug group-hover:text-emerald-600 transition-colors">
                    {task.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mb-4 leading-normal font-medium">
                    {task.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 overflow-hidden">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${task.assignee}`} alt="" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-500">{task.assignee}</span>
                    </div>
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-slate-300">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" /></svg>
                    </button>
                  </div>
                </div>
              ))}
              <button className="w-full py-2 text-[11px] font-bold text-slate-300 hover:text-slate-500 hover:bg-slate-50 rounded-lg transition-all flex items-center justify-center gap-1">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                새로 만들기
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotionKanban;
