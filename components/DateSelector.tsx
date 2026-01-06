
import React from 'react';
import { DateCount } from '../types';

interface DateSelectorProps {
  dates: DateCount[];
  selectedDate: string;
  onDateSelect: (date: string) => void;
}

const DateSelector: React.FC<DateSelectorProps> = ({ dates, selectedDate, onDateSelect }) => {
  return (
    <div className="flex overflow-x-auto gap-2 pb-4 scrollbar-hide no-wrap px-4 -mx-4">
      {dates.map((item) => {
        const dateObj = new Date(item.date);
        const dayName = ['일', '월', '화', '수', '목', '금', '토'][dateObj.getDay()];
        const isSelected = selectedDate === item.date;
        const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;

        return (
          <button
            key={item.date}
            onClick={() => onDateSelect(item.date)}
            className={`flex-shrink-0 flex flex-col items-center justify-center w-14 h-20 rounded-2xl transition-all ${
              isSelected 
                ? 'bg-slate-900 text-white shadow-lg scale-105' 
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-100'
            }`}
          >
            <span className={`text-[10px] font-medium mb-1 ${!isSelected && isWeekend ? 'text-red-500' : ''}`}>
              {dayName}
            </span>
            <span className="text-sm font-bold mb-1">
              {dateObj.getDate()}
            </span>
            <span className={`text-[10px] font-bold ${isSelected ? 'text-emerald-400' : 'text-emerald-600'}`}>
              {item.count}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default DateSelector;
