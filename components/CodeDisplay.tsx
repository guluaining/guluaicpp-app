
import React, { useState } from 'react';
import { TOKEN_EXPLANATIONS } from '../problemData';
import { Language } from '../types';

interface CodeDisplayProps {
  code: string;
  activeLineIndex: number;
  language: Language;
  isInteractive?: boolean;
}

export const CodeDisplay: React.FC<CodeDisplayProps> = ({ code, activeLineIndex, language, isInteractive = false }) => {
  const lines = code.split('\n');
  const [activeToken, setActiveToken] = useState<{key: string, x: number, y: number} | null>(null);

  // Simple tokenizer regex to capture keywords, symbols, and identifiers
  const tokenize = (line: string) => {
    // Split by spaces, but keep delimiters like (){};<>=, and handle // comments
    const tokens: { text: string, type: 'code' | 'comment' | 'whitespace' }[] = [];
    
    // If line is a comment
    if (line.trim().startsWith('//')) {
        return [{ text: line, type: 'comment' }];
    }

    // Check for end of line comments
    const commentSplit = line.split('//');
    const codePart = commentSplit[0];
    const commentPart = commentSplit.length > 1 ? '//' + commentSplit.slice(1).join('//') : '';

    // Tokenize the code part
    const regex = /([a-zA-Z_]\w*|[{}();<>=]|#include)/g;
    let match;
    let lastIndex = 0;

    while ((match = regex.exec(codePart)) !== null) {
      if (match.index > lastIndex) {
        tokens.push({ text: codePart.slice(lastIndex, match.index), type: 'whitespace' });
      }
      tokens.push({ text: match[0], type: 'code' });
      lastIndex = regex.lastIndex;
    }
    if (lastIndex < codePart.length) {
      tokens.push({ text: codePart.slice(lastIndex), type: 'whitespace' });
    }

    if (commentPart) {
        tokens.push({ text: commentPart, type: 'comment' });
    }

    return tokens;
  };

  const handleTokenClick = (e: React.MouseEvent, tokenText: string) => {
      if (!isInteractive) return;
      e.stopPropagation();
      
      // Normalize token for lookup
      let lookup = tokenText;
      if (tokenText.startsWith('//')) lookup = '//';
      
      if (TOKEN_EXPLANATIONS[lookup]) {
          // Calculate position relative to viewport or container
          const rect = (e.target as HTMLElement).getBoundingClientRect();
          setActiveToken({
              key: lookup,
              x: rect.left,
              y: rect.bottom + 5
          });
      }
  };

  // Close popup when clicking anywhere else
  React.useEffect(() => {
      const close = () => setActiveToken(null);
      window.addEventListener('click', close);
      return () => window.removeEventListener('click', close);
  }, []);

  return (
    <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden shadow-inner relative">
      <div className="flex items-center px-4 py-2 bg-slate-900 border-b border-slate-800 justify-between">
        <div className="flex items-center">
            <div className="flex space-x-2 mr-4">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <span className="text-xs text-slate-400 font-mono">main.cpp</span>
        </div>
        {isInteractive && <span className="text-[10px] bg-blue-900/50 text-blue-300 px-2 py-0.5 rounded">{language === 'cn' ? '点击代码查看解释' : 'Click code for info'}</span>}
      </div>
      <div className="p-4 overflow-x-auto">
        <pre className="font-mono text-sm leading-relaxed">
          {lines.map((line, index) => {
            // Simple heuristic: activeLineIndex is often relative to logic, not full code. 
            // If not interactive (snippet mode), we use the passed index.
            // If interactive (full mode), we don't highlight specific lines as strict because logic is spread.
            // For this demo, we'll just use the index if it matches within range.
            const isActive = !isInteractive && index === activeLineIndex;
            
            return (
              <div 
                key={index} 
                className={`
                  flex items-start transition-colors duration-200 rounded px-2 -mx-2
                  ${isActive ? 'bg-blue-500/20 border-l-2 border-blue-500' : 'border-l-2 border-transparent hover:bg-slate-900'}
                `}
              >
                <span className="w-6 text-slate-600 text-right mr-4 select-none mt-[1px]">{index + 1}</span>
                <span className={`${isActive ? 'text-blue-200 font-semibold' : 'text-slate-300'}`}>
                  {tokenize(line).map((token, tIdx) => {
                      const canInteract = isInteractive && (TOKEN_EXPLANATIONS[token.text] || token.text.startsWith('//'));
                      return (
                        <span 
                            key={tIdx}
                            onClick={(e) => canInteract ? handleTokenClick(e, token.text) : undefined}
                            className={`
                                ${token.type === 'comment' ? 'text-slate-500 italic' : ''}
                                ${canInteract ? 'cursor-pointer hover:text-yellow-300 hover:underline decoration-dotted' : ''}
                            `}
                        >
                            {token.text}
                        </span>
                      )
                  })}
                </span>
              </div>
            );
          })}
        </pre>
      </div>

      {/* Popup Tooltip */}
      {activeToken && TOKEN_EXPLANATIONS[activeToken.key] && (
          <div 
            className="fixed z-50 bg-slate-800 border border-slate-600 p-3 rounded-lg shadow-2xl max-w-xs text-sm animate-in fade-in zoom-in-95 duration-100"
            style={{ top: activeToken.y, left: activeToken.x }}
            onClick={(e) => e.stopPropagation()}
          >
              <h4 className="font-bold text-blue-400 mb-1">{TOKEN_EXPLANATIONS[activeToken.key].title[language]}</h4>
              <p className="text-slate-200">{TOKEN_EXPLANATIONS[activeToken.key].desc[language]}</p>
              <div className="absolute -top-2 left-4 w-3 h-3 bg-slate-800 border-t border-l border-slate-600 transform rotate-45"></div>
          </div>
      )}
    </div>
  );
};
