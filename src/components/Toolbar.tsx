import { useState } from "react";
import { 
  Plus, 
  Sparkle, 
  Database, 
  HelpCircle, 
  Search, 
  Grid3X3, 
  Layout, 
  PinOff, 
  RotateCcw,
  Tag, 
  DatabaseZap,
  Trash2,
  CalendarDays
} from "lucide-react";

interface ToolbarProps {
  onAddNote: () => void;
  onAutoArrange: () => void;
  onUnpinAll: () => void;
  searchTerm: string;
  onSearchChange: (val: string) => void;
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
  allTags: string[];
  isDbConnected: boolean;
  onOpenGuide: () => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  onClearAll: () => void;
  notesCount: number;
}

export default function Toolbar({
  onAddNote,
  onAutoArrange,
  onUnpinAll,
  searchTerm,
  onSearchChange,
  selectedTag,
  onSelectTag,
  allTags,
  isDbConnected,
  onOpenGuide,
  showGrid,
  onToggleGrid,
  onClearAll,
  notesCount,
}: ToolbarProps) {
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-[#121212]/95 backdrop-blur-md border-b border-slate-800/40 flex items-center justify-between px-4 sm:px-6 z-[1000] select-none shadow-lg">
      {/* Brand Logo & Connection Status */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-1.5 font-sans">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <span className="font-extrabold text-slate-950 text-base leading-none tracking-tighter">A</span>
          </div>
          <span className="font-bold text-slate-100 hidden sm:inline tracking-widest text-xs uppercase text-slate-200">AirNote Master</span>
        </div>

        {/* Database Sync Status Pill */}
        <button
          id="status-pill-btn"
          onClick={onOpenGuide}
          className={`px-2.5 py-1 rounded-md text-[10px] sm:text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 border ${
            isDbConnected
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
              : "bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20"
          }`}
          title={isDbConnected ? "Supabase 연동 완료! 변경사항이 실시간 동기화됩니다." : "클라우드 미연동 (현재 로컬 브라우저 저장 상태). 클릭하여 가이드를 확인하세요."}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${isDbConnected ? "bg-emerald-400 animate-pulse" : "bg-amber-400 animate-pulse"}`}></span>
          <span className="hidden xs:inline">
            {isDbConnected ? "LIVE_SYNC 상태" : "로컬 오프라인 모드"}
          </span>
          <HelpCircle className="w-3" />
        </button>
      </div>

      {/* Floating Toolbar Items */}
      <div className="flex items-center gap-2 max-w-lg flex-1 mx-2 sm:mx-6 min-w-0">
        {/* Responsive Search Input */}
        <div className="relative w-full max-w-xs md:max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
          <input
            id="global-search-input"
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="제목, 내용 또는 #태그 검색..."
            className="w-full h-8 pl-8 pr-3 rounded-lg text-xs bg-[#0a0a0a] border border-slate-800 text-slate-200 placeholder-slate-600 outline-none focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20 transition-all truncate"
          />
        </div>

        {/* Active Tag Pills selector */}
        {allTags.length > 0 && (
          <div className="hidden lg:flex items-center gap-1 max-w-[200px] overflow-x-auto no-scrollbar py-1">
            <button
              id="tag-filter-all"
              onClick={() => onSelectTag(null)}
              className={`text-[10px] px-2 py-0.5 rounded-full transition-all shrink-0 ${
                selectedTag === null
                  ? "bg-slate-800 text-slate-250 font-semibold border border-slate-700"
                  : "text-slate-400 hover:text-slate-250"
              }`}
            >
              전체
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                id={`tag-filter-${tag}`}
                onClick={() => onSelectTag(selectedTag === tag ? null : tag)}
                className={`text-[10px] px-2 py-0.5 rounded-full transition-all shrink-0 ${
                  selectedTag === tag
                    ? "bg-emerald-500/10 text-emerald-450 border border-emerald-500/20 font-semibold"
                    : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Primary Workspace Action buttons */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Toggle Grid Background */}
        <button
          id="toggle-grid-btn"
          onClick={onToggleGrid}
          title={showGrid ? "배경 격자 숨기기" : "배경 격자 켜기"}
          className={`h-8 w-8 rounded-lg flex items-center justify-center border transition-all active:scale-95 ${
            showGrid
              ? "bg-[#0d0d0d] border-slate-750 text-emerald-450 shadow-sm"
              : "bg-transparent border-slate-800 text-slate-500 hover:text-slate-300 hover:bg-slate-900"
          }`}
        >
          <Grid3X3 className="w-3.5 h-3.5" />
        </button>

        {/* Unpin All Buttons */}
        <button
          id="unpin-all-btn"
          onClick={onUnpinAll}
          title="모든 고정 해제"
          className="h-8 w-8 rounded-lg flex items-center justify-center border border-slate-800 text-slate-550 hover:text-slate-200 hover:bg-slate-900 transition-all active:scale-95"
        >
          <PinOff className="w-3.5 h-3.5" />
        </button>

        {/* Auto Arrange Tiler */}
        <button
          id="auto-arrange-btn"
          onClick={onAutoArrange}
          title="화면 정돈 (바둑판식 네트 정렬)"
          className="h-8 px-2.5 sm:px-3 text-xs rounded-lg flex items-center gap-1.5 border border-slate-800 text-slate-400 hover:text-slate-100 hover:bg-slate-900 transition-all active:scale-95 cursor-pointer"
        >
          <Layout className="w-3.5 h-3.5 text-emerald-500" />
          <span className="hidden md:inline font-medium">화면 정돈</span>
        </button>

        {/* Create Note Trigger */}
        <button
          id="add-note-toolbar-btn"
          onClick={onAddNote}
          title="새 플로팅 메모 추가"
          className="h-8 px-3 text-xs bg-emerald-600 hover:bg-emerald-500 active:scale-95 font-semibold rounded-lg flex items-center gap-1 text-white transition-all shadow-lg shadow-emerald-500/10 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>새 메모</span>
        </button>

        {/* Clean Workspace Confirm or Trigger */}
        <div className="relative">
          {!showClearConfirm ? (
            <button
              id="clear-workspace-btn"
              onClick={() => setShowClearConfirm(true)}
              title="메모 전체 영구삭제"
              className="h-8 w-8 rounded-lg flex items-center justify-center border border-transparent text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-all active:scale-95 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          ) : (
            <div className="absolute right-0 top-0 h-8 flex gap-1 items-center bg-slate-900 border border-slate-700 px-2 rounded-lg z-50 shadow-xl animate-fade-in text-xs font-semibold select-none">
              <span className="text-red-400 whitespace-nowrap">모두 삭제?</span>
              <button
                id="clear-confirm-yes"
                onClick={() => {
                  onClearAll();
                  setShowClearConfirm(false);
                }}
                className="px-1.5 py-0.5 rounded bg-red-600 text-slate-100 hover:bg-red-500"
              >
                예
              </button>
              <button
                id="clear-confirm-no"
                onClick={() => setShowClearConfirm(false)}
                className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 hover:bg-slate-700"
              >
                아니오
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
