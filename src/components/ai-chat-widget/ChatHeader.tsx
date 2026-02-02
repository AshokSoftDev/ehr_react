import React from 'react';
import { X, Minus, Maximize2, Minimize2, GripVertical, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatHeaderProps {
  isFullscreen: boolean;
  onMinimize: () => void;
  onToggleFullscreen: () => void;
  onClose: () => void;
  onMouseDown: (e: React.MouseEvent) => void;
  isDragging: boolean;
}

export function ChatHeader({
  isFullscreen,
  onMinimize,
  onToggleFullscreen,
  onClose,
  onMouseDown,
  isDragging,
}: ChatHeaderProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between px-4 py-3',
        'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500',
        'text-white rounded-t-xl',
        !isFullscreen && 'cursor-move',
        isDragging && 'cursor-grabbing'
      )}
      onMouseDown={!isFullscreen ? onMouseDown : undefined}
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-purple-600"></div>
        </div>
        <div>
          <h3 className="font-semibold text-base">AI Assistant</h3>
          <p className="text-xs text-white/70">Always here to help</p>
        </div>
        {!isFullscreen && (
          <GripVertical className="w-4 h-4 text-white/50 ml-2" />
        )}
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={onMinimize}
          className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          title="Minimize"
        >
          <Minus className="w-4 h-4" />
        </button>
        <button
          onClick={onToggleFullscreen}
          className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
        >
          {isFullscreen ? (
            <Minimize2 className="w-4 h-4" />
          ) : (
            <Maximize2 className="w-4 h-4" />
          )}
        </button>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
