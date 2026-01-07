
import React, { useEffect, useState } from 'react';
import { TeeTime } from '../types';

interface PaymentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  teeTime: TeeTime;
  onSuccess: (paymentKey: string) => void;
}

declare global {
  interface Window {
    TossPayments?: any;
  }
}

const PaymentDrawer: React.FC<PaymentDrawerProps> = ({ isOpen, onClose, teeTime, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    try {
      // 토스페이먼츠 테스트 클라이언트 키 (샌드박스용)
      const clientKey = "test_ck_D5bZzMqlcwBa29GWZGRyrzYpW4xl";
      const tossPayments = window.TossPayments(clientKey);
      
      const payment = tossPayments.payment({
        customerKey: "CUSTOMER_GUEST_" + Math.random().toString(36).substring(7),
      });

      // 결제 위젯 호출 (테스트 환경)
      await payment.requestPayment({
        method: "CARD",
        amount: {
          currency: "KRW",
          value: teeTime.price,
        },
        orderId: `ORDER_${Date.now()}`,
        orderName: `${teeTime.course.name} ${teeTime.time} 티타임 에스크로 예약`,
        successUrl: window.location.origin + "/payment/success",
        failUrl: window.location.origin + "/payment/fail",
        card: {
          useEscrow: true,
          flowMode: "DEFAULT",
          useCardPoint: false,
          useAppCardOnly: false,
        },
      });
      
      // 실제 리다이렉트가 일어나므로 이 이후 코드는 실행되지 않음
    } catch (error) {
      console.error("Payment Error:", error);
      alert("결제 준비 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-center sm:items-center">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-lg bg-white rounded-t-[40px] sm:rounded-[32px] p-8 shadow-2xl animate-in slide-in-from-bottom-full duration-300">
        <div className="w-12 h-1.5 bg-slate-100 rounded-full mx-auto mb-8"></div>
        
        <div className="flex items-center gap-3 mb-6 bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
          <div className="bg-emerald-500 p-2 rounded-xl text-white shadow-sm">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
          </div>
          <div>
            <h4 className="text-sm font-black text-emerald-900 leading-none mb-1">에스크로 안심 결제</h4>
            <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Toss Payments Protected</p>
          </div>
        </div>

        <div className="space-y-6 mb-10">
          <div className="flex justify-between items-start border-b border-slate-50 pb-4">
            <div>
              <h3 className="text-xl font-black text-slate-900">{teeTime.course.name}</h3>
              <p className="text-sm text-slate-500 font-medium">{teeTime.date} • {teeTime.time}</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-slate-400">결제 금액</span>
              <p className="text-2xl font-black text-emerald-600 leading-none">₩{teeTime.price.toLocaleString()}</p>
            </div>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl space-y-2">
            <div className="flex justify-between text-[11px] font-bold text-slate-500">
              <span>보증 대상</span>
              <span>그린피 100%</span>
            </div>
            <div className="flex justify-between text-[11px] font-bold text-slate-500">
              <span>환불 정책</span>
              <span className="text-emerald-600">{teeTime.refundPolicy}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={onClose}
            className="py-4 bg-slate-100 text-slate-500 font-black rounded-2xl hover:bg-slate-200 transition-all active:scale-95"
          >
            취소
          </button>
          <button 
            onClick={handlePayment}
            disabled={loading}
            className="py-4 bg-slate-900 text-white font-black rounded-2xl shadow-xl shadow-slate-200 hover:bg-emerald-600 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : "결제하기"}
          </button>
        </div>
        <p className="mt-6 text-center text-[10px] text-slate-400 font-medium">
          테스트 환경이므로 실제 대금은 결제되지 않습니다.
        </p>
      </div>
    </div>
  );
};

export default PaymentDrawer;
