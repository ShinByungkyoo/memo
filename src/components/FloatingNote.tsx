import React, { useRef, useState, useEffect } from "react";
import { Note, NOTE_COLORS, NoteColor } from "../types";
import { 
  Pin, 
  Trash2, 
  Minimize2, 
  Maximize2, 
  Palette, 
  Tag, 
  Clock, 
  Copy, 
  Check,
  ChevronDown,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface FloatingNoteProps {
  key?: string;
  note: Note;
  onUpdate: (id: string, updates: Partial<Note>) => void;
  onDelete: (id: string) => void | Promise<void>;
  onFocus: (id: string) => void;
  maxZIndex: number;
}

export default function FloatingNote({
  note,
  onUpdate,
  onDelete,
  onFocus,
  maxZIndex,
}: FloatingNoteProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [localX, setLocalX] = useState(note.x);
  const [localY, setLocalY] = useState(note.y);
  const [localW, setLocalW] = useState(note.width);
  const [localH, setLocalH] = useState(note.height);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Tag input state
  const [showTagInput, setShowTagInput] = useState(false);
  const [newTagText, setNewTagText] = useState("");

  // Keep state synced with props when not active dragging/resizing
  useEffect(() => {
    if (!isDragging) {
      setLocalX(note.x);
      setLocalY(note.y);
    }
  }, [note.x, isDragging]);

  useEffect(() => {
    if (!isDragging) {
      setLocalY(note.y);
    }
  }, [note.y, isDragging]);

  useEffect(() => {
    if (!isResizing) {
      setLocalW(note.width);
      setLocalH(note.height);
    }
  }, [note.width, isResizing]);

  useEffect(() => {
    if (!isResizing) {
      setLocalH(note.height);
    }
  }, [note.height, isResizing]);

  // Find color configurations
  const colorTheme = NOTE_COLORS.find(c => c.name === note.color) || NOTE_COLORS[0];

  // Dragging event handler
  const handleDragStart = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (note.isPinned) return; // Prevent drag if pinned
    onFocus(note.id);
    setIsDragging(true);

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const startX = clientX;
    const startY = clientY;
    const origX = localX;
    const origY = localY;

    // Use window dimensions to prevent notes from going completely off screen
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    const handleMouseMove = (moveEvent: MouseEvent | TouchEvent) => {
      const currentClientX = 'touches' in moveEvent ? moveEvent.touches[0].clientX : moveEvent.clientX;
      const currentClientY = 'touches' in moveEvent ? moveEvent.touches[0].clientY : moveEvent.clientY;
      
      const dx = currentClientX - startX;
      const dy = currentClientY - startY;

      // Constrain inside bounds with small margin
      const nextX = Math.max(-100, Math.min(windowWidth - 100, origX + dx));
      const nextY = Math.max(60, Math.min(windowHeight - 80, origY + dy)); // 60px padding for topbar

      setLocalX(nextX);
      setLocalY(nextY);
    };

    const handleMouseUp = (upEvent: MouseEvent | TouchEvent) => {
      setIsDragging(false);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleMouseMove);
      window.removeEventListener("touchend", handleMouseUp);

      // Save final coords
      // Apply boundaries
      const currentClientX = 'touches' in upEvent ? (upEvent.changedTouches?.[0]?.clientX ?? startX) : upEvent.clientX;
      const currentClientY = 'touches' in upEvent ? (upEvent.changedTouches?.[0]?.clientY ?? startY) : upEvent.clientY;
      const dx = currentClientX - startX;
      const dy = currentClientY - startY;
      
      const finalX = Math.max(-100, Math.min(windowWidth - 100, origX + dx));
      const finalY = Math.max(60, Math.min(windowHeight - 80, origY + dy));

      onUpdate(note.id, { x: finalX, y: finalY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchmove", handleMouseMove);
    window.addEventListener("touchend", handleMouseUp);
  };

  // Resizing event handler
  const handleResizeStart = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.preventDefault();
    if (note.isPinned) return; // Prevent resize if pinned
    onFocus(note.id);
    setIsResizing(true);

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const startX = clientX;
    const startY = clientY;
    const origW = localW;
    const origH = localH;

    const handleMouseMove = (moveEvent: MouseEvent | TouchEvent) => {
      const currentClientX = 'touches' in moveEvent ? moveEvent.touches[0].clientX : moveEvent.clientX;
      const currentClientY = 'touches' in moveEvent ? moveEvent.touches[0].clientY : moveEvent.clientY;
      
      const dx = currentClientX - startX;
      const dy = currentClientY - startY;

      const nextW = Math.max(220, origW + dx);
      const nextH = Math.max(140, origH + dy);

      setLocalW(nextW);
      setLocalH(nextH);
    };

    const handleMouseUp = (upEvent: MouseEvent | TouchEvent) => {
      setIsResizing(false);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleMouseMove);
      window.removeEventListener("touchend", handleMouseUp);

      const currentClientX = 'touches' in upEvent ? (upEvent.changedTouches?.[0]?.clientX ?? startX) : upEvent.clientX;
      const currentClientY = 'touches' in upEvent ? (upEvent.changedTouches?.[0]?.clientY ?? startY) : upEvent.clientY;
      const dx = currentClientX - startX;
      const dy = currentClientY - startY;

      const finalW = Math.max(220, origW + dx);
      const finalH = Math.max(140, origH + dy);

      onUpdate(note.id, { width: finalW, height: finalH });
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchmove", handleMouseMove);
    window.addEventListener("touchend", handleMouseUp);
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(`${note.title}\n\n${note.content}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const addTag = (e: React.FormEvent) => {
    e.preventDefault();
    const tag = newTagText.trim();
    if (tag && !note.tags.includes(tag)) {
      const updatedTags = [...note.tags, tag];
      onUpdate(note.id, { tags: updatedTags });
      setNewTagText("");
    }
    setShowTagInput(false);
  };

  const removeTag = (tagToRemove: string) => {
    const updatedTags = note.tags.filter(t => t !== tagToRemove);
    onUpdate(note.id, { tags: updatedTags });
  };

  const formattedTime = () => {
    try {
      const d = new Date(note.updatedAt);
      return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    } catch {
      return '';
    }
  };

  return (
    <div
      id={`note-card-${note.id}`}
      ref={cardRef}
      onMouseDown={() => onFocus(note.id)}
      onTouchStart={() => onFocus(note.id)}
      style={{
        position: "absolute",
        left: `${localX}px`,
        top: `${localY}px`,
        width: `${localW}px`,
        height: note.isMinimized ? "auto" : `${localH}px`,
        zIndex: note.zIndex,
        backgroundColor: colorTheme.bg,
      }}
      className={`rounded-2xl shadow-xl flex flex-col border transition-all duration-200 overflow-hidden ${
        colorTheme.border
      } ${
        note.isPinned 
          ? "ring-2 ring-emerald-500/10 shadow-emerald-500/5 shadow-md" 
          : "hover:shadow-2xl focus-within:ring-2 focus-within:ring-emerald-500/25"
      } ${isDragging ? "cursor-grabbing select-none" : ""}`}
    >
      {/* Header bar (Drag Handle) */}
      <div
        id={`note-header-${note.id}`}
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
        className={`px-3 py-2 border-b flex items-center justify-between gap-2 cursor-grab ${
          colorTheme.handle
        } border-black/15 select-none shrink-0`}
        title={note.isPinned ? "고정된 상태입니다 (끌기 불가)" : "드래그하여 이동할 수 있습니다"}
      >
        {/* Grip and Title Panel */}
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <div className="flex flex-col gap-0.5 opacity-30 shrink-0">
            <div className="w-3 h-[2px] bg-current"></div>
            <div className="w-3 h-[2px] bg-current"></div>
            <div className="w-3 h-[2px] bg-current"></div>
          </div>
          
          <input
            id={`note-title-input-${note.id}`}
            type="text"
            value={note.title}
            onChange={(e) => onUpdate(note.id, { title: e.target.value })}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            placeholder="제목 없는 메모"
            className={`font-semibold bg-transparent border-none outline-none p-0 w-full text-xs sm:text-sm placeholder-current/30 focus:placeholder-current/15 truncate ${
              colorTheme.text
            }`}
          />
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-0.5 shrink-0" onMouseDown={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()}>
          {/* Pin state */}
          <button
            id={`note-pin-btn-${note.id}`}
            onClick={() => onUpdate(note.id, { isPinned: !note.isPinned })}
            title={note.isPinned ? "고정 해제" : "위치 고정"}
            className={`p-1 rounded-md transition-colors hover:bg-black/10 ${
              note.isPinned ? "text-red-600 font-bold" : "text-black/40 hover:text-black/80"
            }`}
          >
            <Pin className={`w-3.5 h-3.5 ${note.isPinned ? "fill-red-600 rotate-[45deg]" : ""}`} />
          </button>

          {/* Minimize toggle */}
          <button
            id={`note-minimize-btn-${note.id}`}
            onClick={() => onUpdate(note.id, { isMinimized: !note.isMinimized })}
            title={note.isMinimized ? "열기" : "접기"}
            className="p-1 rounded-md text-black/40 hover:text-black/80 hover:bg-black/10 transition-colors"
          >
            {note.isMinimized ? (
              <Maximize2 className="w-3.5 h-3.5" />
            ) : (
              <Minimize2 className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Trash */}
          <button
            id={`note-delete-btn-${note.id}`}
            onClick={() => onDelete(note.id)}
            title="메모 삭제"
            className="p-1 rounded-md text-black/40 hover:text-red-600 hover:bg-red-500/10 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Note Body (Text area and bottom controllers) */}
      <AnimatePresence initial={false}>
        {!note.isMinimized && (
          <motion.div
            id={`note-body-container-${note.id}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "100%", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex flex-col flex-1 min-h-0 overflow-hidden"
          >
            {/* TextArea editor */}
            <textarea
              id={`note-textarea-${note.id}`}
              value={note.content}
              onChange={(e) => onUpdate(note.id, { content: e.target.value })}
              placeholder="메모를 입력하세요..."
              className={`w-full flex-1 p-3 bg-transparent resize-none border-none outline-none font-sans text-xs sm:text-sm leading-relaxed overflow-y-auto ${
                colorTheme.text
              } placeholder-current/25 placeholder-shown:italic`}
            />

            {/* Render Tags */}
            {note.tags.length > 0 && (
              <div className="px-3 pb-1 flex flex-wrap gap-1 select-none shrink-0">
                {note.tags.map(tag => (
                  <span 
                    key={tag}
                    className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full bg-black/10 text-black/70 hover:bg-red-500/10 hover:text-red-600 transition-colors cursor-pointer group"
                    onClick={() => removeTag(tag)}
                    title="태그 삭제"
                  >
                    #{tag}
                    <X className="w-2.5 h-2.5 opacity-50 group-hover:opacity-100" />
                  </span>
                ))}
              </div>
            )}

            {/* Quick Utility Control footer */}
            <div className="px-3 py-1.5 bg-black/5 flex justify-between items-center text-[10px] select-none text-black/50 border-t border-black/5 shrink-0">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 inline-flex shrink-0">
                  <Clock className="w-2.5 h-2.5 shrink-0" />
                  {formattedTime()}
                </span>
                
                {/* Auto-save confirmation indicator */}
                <span className="text-[10px] text-emerald-600 font-medium opacity-80 shrink-0">저장됨</span>
              </div>

              {/* Utility actions */}
              <div className="flex items-center gap-1" onMouseDown={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()}>
                {/* Copy content */}
                <button
                  id={`note-copy-btn-${note.id}`}
                  onClick={handleCopyText}
                  title="클립보드에 전체 복사"
                  className="p-1 rounded text-black/40 hover:text-black/80 hover:bg-black/10 transition-all flex items-center"
                >
                  {copied ? (
                    <Check className="w-3 h-3 text-emerald-600 scale-105" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>

                {/* Add Tag toggler */}
                <div className="relative">
                  <button
                    id={`note-tag-toggle-btn-${note.id}`}
                    onClick={() => setShowTagInput(!showTagInput)}
                    title="태그 추가"
                    className={`p-1 rounded text-black/40 hover:text-black/80 hover:bg-black/10 transition-all ${
                      showTagInput ? "bg-black/10" : ""
                    }`}
                  >
                    <Tag className="w-3 h-3" />
                  </button>

                  <AnimatePresence>
                    {showTagInput && (
                      <form
                        onSubmit={addTag}
                        className="absolute bottom-6 right-0 bg-slate-900 border border-slate-700/60 p-1.5 rounded-lg shadow-xl flex gap-1 z-50 text-slate-100 text-xs origin-bottom-right"
                      >
                        <input
                          autoFocus
                          type="text"
                          value={newTagText}
                          onChange={(e) => setNewTagText(e.target.value)}
                          placeholder="태그 이름"
                          className="px-1.5 py-0.5 rounded border border-slate-700 bg-slate-950 text-slate-100 text-[11px] outline-none w-16"
                        />
                        <button
                          type="submit"
                          className="px-1.5 py-0.5 rounded bg-emerald-600 text-slate-150 hover:bg-emerald-500 font-medium text-[10px]"
                        >
                          추가
                        </button>
                      </form>
                    )}
                  </AnimatePresence>
                </div>

                {/* Color Selector */}
                <div className="relative">
                  <button
                    id={`note-color-picker-toggle-${note.id}`}
                    onClick={() => setShowColorPicker(!showColorPicker)}
                    title="색상 변경"
                    className={`p-1 rounded text-black/40 hover:text-black/80 hover:bg-black/10 transition-all ${
                      showColorPicker ? "bg-black/10 text-black/80" : ""
                    }`}
                  >
                    <Palette className="w-3 h-3" />
                  </button>

                  <AnimatePresence>
                    {showColorPicker && (
                      <div className="absolute bottom-6 right-0 bg-slate-900/95 backdrop-blur-md border border-slate-700/60 p-1.5 rounded-lg shadow-xl grid grid-cols-4 gap-1.5 z-50">
                        {NOTE_COLORS.map((c) => (
                          <button
                            key={c.name}
                            type="button"
                            onClick={() => {
                              onUpdate(note.id, { color: c.name });
                              setShowColorPicker(false);
                            }}
                            title={c.name}
                            style={{ backgroundColor: c.bg }}
                            className={`w-4 h-4 rounded-full border border-black/15 shadow-sm hover:scale-110 active:scale-95 transition-transform ${
                              note.color === c.name ? "ring-2 ring-blue-500" : ""
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
            
            {/* Mini Resize Corner Handle */}
            {!note.isPinned && (
              <div
                id={`note-resize-handler-${note.id}`}
                onMouseDown={handleResizeStart}
                onTouchStart={handleResizeStart}
                className="absolute bottom-0 right-0 w-3 h-3 cursor-se-resize flex items-end justify-end pointer-events-auto"
                title="메모 크기 조정"
              >
                {/* Visual angled lines indicating resizable corner */}
                <svg className="w-2.5 h-2.5 opacity-25" viewBox="0 0 10 10" fill="none" stroke="currentColor">
                  <path d="M10 0 L0 10" strokeWidth="1"/>
                  <path d="M10 4 L4 10" strokeWidth="1"/>
                </svg>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
