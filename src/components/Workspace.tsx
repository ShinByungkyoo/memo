import { useState, useEffect, useRef } from "react";
import { Note, NOTE_COLORS } from "../types";
import { supabase, isSupabaseConfigured, dbToNote, noteToDb } from "../lib/supabase";
import FloatingNote from "./FloatingNote";
import Toolbar from "./Toolbar";
import SupabaseGuideModal from "./SupabaseGuideModal";
import { Info, AlertCircle, RefreshCw, Layers } from "lucide-react";

export default function Workspace() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [showGrid, setShowGrid] = useState(true);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [supabaseLoading, setSupabaseLoading] = useState(false);
  const [dbConnected, setDbConnected] = useState(false);
  
  // Keep track of timeouts for debouncing database writes per note id
  const debounceTimeoutsRef = useRef<{ [id: string]: NodeJS.Timeout }>({});

  // Dynamic max Z-index
  const maxZIndex = notes.length > 0 ? Math.max(...notes.map((n) => n.zIndex ?? 1)) : 10;

  // Initialize DB status on load
  const isDbConfigured = isSupabaseConfigured();

  // Load initial notes (either Supabase or LocalStorage)
  useEffect(() => {
    async function loadNotes() {
      setIsLoading(true);
      
      if (isDbConfigured && supabase) {
        setSupabaseLoading(true);
        try {
          const { data, error } = await supabase
            .from("notes")
            .select("*")
            .order("created_at", { ascending: true });

          if (error) {
            console.error("Supabase 로딩 오류:", error.message);
            loadFromLocalStorage();
          } else if (data && data.length > 0) {
            setNotes(data.map(dbToNote));
            setDbConnected(true);
          } else {
            // Configured but empty database
            setNotes([]);
            setDbConnected(true);
          }
        } catch (err) {
          console.error("데이터베이스 로드 중 무한 에러 발생", err);
          loadFromLocalStorage();
        } finally {
          setSupabaseLoading(false);
          setIsLoading(false);
        }
      } else {
        loadFromLocalStorage();
        setIsLoading(false);
      }
    }

    loadNotes();
  }, [isDbConfigured]);

  const loadFromLocalStorage = () => {
    try {
      const stored = localStorage.getItem("airnote-workspace-data");
      if (stored) {
        setNotes(JSON.parse(stored));
      } else {
        // Pre-populate with beautiful welcome notes
        const defaultNotes: Note[] = [
          {
            id: "welcome-1",
            title: "📌 환영합니다! 에어노트 필기구",
            content: "이 공간은 넓은 플로팅 작업실(Desktop Board)입니다.\n\n✔️ 마우스로 제목이 있는 헤더를 누르고 자유롭게 끌어서 이동하세요.\n✔️ 메모 우측 하단 모서리를 잡아당겨 아름답게 크기를 조절할 수 있습니다.\n✔️ 상단 메뉴의 [화면 정돈] 버튼을 클릭해 일렬로 단정하게 정리해 보세요!",
            color: "Obsidian Noir",
            x: 80,
            y: 100,
            width: 290,
            height: 240,
            isPinned: false,
            isMinimized: false,
            zIndex: 10,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            tags: ["공지", "사용법"],
          },
          {
            id: "welcome-2",
            title: "☁️ Supabase 연동 클라우드 저장",
            content: "실제 클라우드 서버에 메모 데이터를 안전하게 저장하고 휴대폰이나 타 브라우저에서도 사용하고 싶다면?\n\n1. 상단의 [로컬 오프라인 모드] 버튼을 클릭합니다.\n2. 나타난 가이드에 따라 SQL 쿼리를 붙여넣어 Supabase 테이블을 만듭니다.\n3. 우측 Secrets에 Supabase 접속 URL 및 API Key를 대입하면 연동 끝!",
            color: "Emerald Jade",
            x: 410,
            y: 120,
            width: 310,
            height: 250,
            isPinned: false,
            isMinimized: false,
            zIndex: 11,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            tags: ["Supabase", "동기화"],
          },
          {
            id: "welcome-3",
            title: "💡 간편 팁",
            content: "• 메모 헤더 우측의 📌 버튼을 누르면 그 자리에 고정되어 원치 않은 우발적 터치/드래그를 차단합니다.\n• 🎨 아이콘으로 메모 카드마다 무드를 자유롭게 바꾸어 보세요.\n• 🏷️ 하단 태그 기능으로 카테고리를 체계화하세요.",
            color: "Amber Glow",
            x: 180,
            y: 380,
            width: 280,
            height: 220,
            isPinned: false,
            isMinimized: false,
            zIndex: 12,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            tags: ["팁"],
          }
        ];
        setNotes(defaultNotes);
        saveAndSync(defaultNotes);
      }
    } catch (e) {
      console.error("Local storage 로딩 실패", e);
    }
  };

  // Helper to save notes both locally (instant 60fps) and cloud (debounced async)
  const saveAndSync = (updatedNotes: Note[]) => {
    // 1. Instant local persistence to avoid data loss
    try {
      localStorage.setItem("airnote-workspace-data", JSON.stringify(updatedNotes));
    } catch (e) {
      console.error("Local storage 백업 저장 실패", e);
    }
  };

  // Core update function
  const updateNote = (id: string, updates: Partial<Note>) => {
    let rawUpdatedNotes: Note[] = [];
    
    setNotes((prevNotes) => {
      rawUpdatedNotes = prevNotes.map((note) => {
        if (note.id === id) {
          const finished = {
            ...note,
            ...updates,
            updatedAt: new Date().toISOString(),
          };
          
          // Trigger debounced cloud synchronization if active database is set up
          if (isDbConfigured && supabase) {
            triggerCloudSyncDebounced(finished);
          }
          
          return finished;
        }
        return note;
      });

      // Save locally
      saveAndSync(rawUpdatedNotes);
      return rawUpdatedNotes;
    });
  };

  // Debounced cloud synchronizer (800ms) to prevent Supabase API limits hammer on every character
  const triggerCloudSyncDebounced = (note: Note) => {
    // Clear previous pending update for this specific note
    if (debounceTimeoutsRef.current[note.id]) {
      clearTimeout(debounceTimeoutsRef.current[note.id]);
    }

    // Set new timeout
    debounceTimeoutsRef.current[note.id] = setTimeout(async () => {
      if (!supabase) return;
      
      const dbPayload = noteToDb(note);
      try {
        const { error } = await supabase
          .from("notes")
          .upsert(dbPayload, { onConflict: "id" });

        if (error) {
          console.error(`SupaDB Sync Failed [ID: ${note.id}]:`, error.message);
        }
      } catch (err) {
        console.error("Database update network exception", err);
      }
    }, 800);
  };

  // Create a new note
  const addNote = async () => {
    const randomColor = NOTE_COLORS[Math.floor(Math.random() * (NOTE_COLORS.length - 2))].name;
    const scrollY = window.scrollY;
    
    // Spread position offset a bit to prevent absolute overlap
    const offset = (notes.length % 5) * 25;
    
    // Dynamic new note skeleton
    const newNote: Note = {
      id: crypto.randomUUID(),
      title: "",
      content: "",
      color: randomColor,
      x: 120 + offset,
      y: 140 + offset,
      width: 280,
      height: 220,
      isPinned: false,
      isMinimized: false,
      zIndex: maxZIndex + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: [],
    };

    const updatedNotes = [...notes, newNote];
    setNotes(updatedNotes);
    saveAndSync(updatedNotes);

    // Write to Supabase instantly for new item creation
    if (isDbConfigured && supabase) {
      try {
        const { error } = await supabase
          .from("notes")
          .insert([noteToDb(newNote)]);
        if (error) console.error("메모 추가 Supabase 동기화 오류:", error.message);
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Delete a note
  const deleteNote = async (id: string) => {
    const updatedNotes = notes.filter((n) => n.id !== id);
    setNotes(updatedNotes);
    saveAndSync(updatedNotes);

    // Remove any queued sync save timeouts
    if (debounceTimeoutsRef.current[id]) {
      clearTimeout(debounceTimeoutsRef.current[id]);
      delete debounceTimeoutsRef.current[id];
    }

    if (isDbConfigured && supabase) {
      try {
        const { error } = await supabase
          .from("notes")
          .delete()
          .eq("id", id);
        if (error) console.error("메모 삭제 Supabase 동기화 오류:", error.message);
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Focus high overlapping Z-Indexing order
  const handleFocus = (id: string) => {
    const focusedNote = notes.find((n) => n.id === id);
    if (focusedNote && focusedNote.zIndex < maxZIndex) {
      updateNote(id, { zIndex: maxZIndex + 1 });
    }
  };

  // Auto-Arrange: arranges notes in a clean grid
  const handleAutoArrange = () => {
    if (notes.length === 0) return;

    // Get current dimensions
    const windowWidth = typeof window !== "undefined" ? window.innerWidth : 1200;
    const defaultNoteWidth = 280;
    const defaultNoteHeight = 220;
    const gap = 24;
    const startX = 40;
    const startY = 80;

    const availableWidth = windowWidth - startX * 2;
    const cols = Math.max(1, Math.floor(availableWidth / (defaultNoteWidth + gap)));

    const arrangedNotes = notes.map((note, index) => {
      // If a note is minimized, we assume height might be smaller, but align using default bounds
      const colIndex = index % cols;
      const rowIndex = Math.floor(index / cols);

      const targetX = startX + colIndex * (defaultNoteWidth + gap);
      const targetY = startY + rowIndex * (defaultNoteHeight + gap);

      const updated = {
        ...note,
        x: targetX,
        y: targetY,
        width: defaultNoteWidth,
        height: defaultNoteHeight,
        updatedAt: new Date().toISOString(),
      };

      if (isDbConfigured && supabase) {
        triggerCloudSyncDebounced(updated);
      }

      return updated;
    });

    setNotes(arrangedNotes);
    saveAndSync(arrangedNotes);
  };

  // Unpin all notes
  const handleUnpinAll = () => {
    const updatedNotes = notes.map((note) => {
      if (note.isPinned) {
        const updated = { ...note, isPinned: false, updatedAt: new Date().toISOString() };
        if (isDbConfigured && supabase) {
          triggerCloudSyncDebounced(updated);
        }
        return updated;
      }
      return note;
    });
    setNotes(updatedNotes);
    saveAndSync(updatedNotes);
  };

  // Erase all notes
  const handleClearAll = async () => {
    setNotes([]);
    saveAndSync([]);

    // Clear all pending sync timeouts
    Object.values(debounceTimeoutsRef.current).forEach(clearTimeout);
    debounceTimeoutsRef.current = {};

    if (isDbConfigured && supabase) {
      try {
        const { error } = await supabase
          .from("notes")
          .delete()
          .neq("title", "thisKeyMatchesNoNotesSoItDeletesEverything_SafeToSayWeDeleteAll");
        if (error) console.error("전체 삭제 Supabase 동기화 오류:", error.message);
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Extract all unique tags
  const allTags: string[] = Array.from(
    new Set(notes.flatMap((n) => n.tags || []))
  ).filter((t: any): t is string => typeof t === "string" && t.trim() !== "");

  // Filter notes based on local search term and selected category tag
  const filteredNotes = notes.filter((note) => {
    const rawSearch = searchTerm.toLowerCase().trim();
    
    // Tag Filter
    if (selectedTag && !note.tags.includes(selectedTag)) {
      return false;
    }

    if (!rawSearch) return true;

    // Search query matches title, content or explicit #tag query
    if (rawSearch.startsWith("#")) {
      const tagSearch = rawSearch.slice(1);
      return note.tags.some((t) => t.toLowerCase().includes(tagSearch));
    }

    return (
      note.title.toLowerCase().includes(rawSearch) ||
      note.content.toLowerCase().includes(rawSearch) ||
      note.tags.some((t) => t.toLowerCase().includes(rawSearch))
    );
  });

  return (
    <main className="min-h-screen bg-[#050505] text-slate-100 flex flex-col relative overflow-hidden select-none">
      {/* Desktop Background Ambient Glowing Lights */}
      <div className="absolute top-[-100px] left-[-100px] w-[450px] h-[450px] bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-100px] right-[-100px] w-[550px] h-[550px] bg-slate-800/15 rounded-full blur-[160px] pointer-events-none z-0"></div>

      {/* Background Dots Grid Decoration (True PC Desktop Workspace aesthetics) */}
      {showGrid && (
        <div 
          id="workspace-dots-background"
          className="absolute inset-0 pointer-events-none opacity-25 z-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_100%,transparent_100%)] mt-14"
        />
      )}

      {/* Top Application Header bar */}
      <Toolbar
        onAddNote={addNote}
        onAutoArrange={handleAutoArrange}
        onUnpinAll={handleUnpinAll}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedTag={selectedTag}
        onSelectTag={setSelectedTag}
        allTags={allTags}
        isDbConnected={dbConnected}
        onOpenGuide={() => setIsGuideOpen(true)}
        showGrid={showGrid}
        onToggleGrid={() => setShowGrid(!showGrid)}
        onClearAll={handleClearAll}
        notesCount={notes.length}
      />

      {/* Main Draggable Workspace Canvas */}
      <div 
        id="desktop-board-canvas"
        className="flex-1 w-full relative overflow-auto p-6 md:p-12 min-h-[calc(100vh-56px)] pt-20 pb-24 z-10"
      >
        {isLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-900/80 backdrop-blur-xs z-50">
            <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
            <p className="text-sm font-medium text-slate-400">데이터를 가져오는 중...</p>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex flex-col items-center justify-center text-center p-6 text-slate-500 select-none pointer-events-none max-w-sm mx-auto gap-4">
            <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center border border-slate-700/30">
              <Layers className="w-7 h-7 text-slate-650" />
            </div>
            <div>
              <p className="font-semibold text-sm text-slate-400 mb-1">
                {searchTerm || selectedTag ? "검색 필터에 일치하는 메모가 없습니다" : "보드가 비어 있습니다"}
              </p>
              <p className="text-xs text-slate-500 leading-normal">
                {searchTerm || selectedTag ? "검색어나 카테고리 필터를 변경해 보세요." : "상단의 '+ 새 메모'를 클릭하여 나만의 플로팅 메모를 생성하세요."}
              </p>
            </div>
            {!searchTerm && !selectedTag && (
              <button
                id="empty-add-note-btn"
                onClick={addNote}
                className="mt-2 text-xs font-semibold px-4 py-2 rounded-xl bg-slate-800 text-amber-400 border border-slate-700 hover:bg-slate-750 transition-all pointer-events-auto cursor-pointer"
              >
                첫 메모 생성하기
              </button>
            )}
          </div>
        ) : (
          /* Render floating notepad windows */
          filteredNotes.map((note) => (
            <FloatingNote
              key={note.id}
              note={note}
              onUpdate={updateNote}
              onDelete={deleteNote}
              onFocus={handleFocus}
              maxZIndex={maxZIndex}
            />
          ))
        )}
      </div>

      {/* Floating dynamic stats counter at the bottom-right corner of Desktop */}
      <footer className="fixed bottom-4 right-4 bg-slate-950/80 backdrop-blur-md rounded-full px-4 py-1.5 border border-slate-800/80 flex items-center gap-3 text-[10px] sm:text-xs text-slate-400 font-mono z-40 select-none shadow-xl shadow-black/20">
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          메모: <strong className="text-slate-100">{notes.length}개</strong>
        </span>
        {allTags.length > 0 && (
          <span className="hidden sm:inline border-l border-slate-800 pl-3">
            태그: <strong className="text-slate-100">{allTags.length}개</strong>
          </span>
        )}
        <span className="border-l border-slate-800 pl-3">
          연동: <strong className={dbConnected ? "text-emerald-400 font-semibold" : "text-amber-400 font-semibold"}>
            {dbConnected ? "SQL Cloud" : "Offline"}
          </strong>
        </span>
      </footer>

      {/* Connection and SQL Manual Import Guide sheet */}
      <SupabaseGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </main>
  );
}
