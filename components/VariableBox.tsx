
import React from 'react';

interface VariableBoxProps {
  name: string;
  value: number | null;
  address: string;
  color: string;
  isGhost?: boolean; // For animation trails or placeholders
  customClass?: string;
  emptyLabel?: string;
}

export const VariableBox: React.FC<VariableBoxProps> = ({ 
  name, 
  value, 
  address, 
  color, 
  isGhost = false,
  customClass = '',
  emptyLabel = 'Empty'
}) => {
  return (
    <div 
      className={`
        relative flex flex-col items-center justify-center 
        w-24 h-28 rounded-lg border-2 transition-all duration-500
        ${isGhost ? 'opacity-30 border-dashed' : 'opacity-100 shadow-lg'}
        ${customClass}
      `}
      style={{ 
        borderColor: color,
        backgroundColor: isGhost ? 'transparent' : `${color}20` // 20 hex = low opacity
      }}
    >
      {/* Variable Name Tag */}
      <div 
        className="absolute -top-3 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-slate-800 border transition-colors duration-300"
        style={{ color: color, borderColor: color }}
      >
        {name}
      </div>

      {/* Value */}
      <div 
        className={`font-mono font-bold transition-all duration-300 ${
          value !== null ? 'text-3xl text-white' : 'text-sm text-slate-500 uppercase tracking-widest'
        }`}
      >
        {value !== null ? value : emptyLabel}
      </div>

      {/* Memory Address */}
      <div className="absolute bottom-2 text-[10px] font-mono text-slate-400">
        {address}
      </div>
    </div>
  );
};
