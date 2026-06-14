import { useState } from "react";
import { SCHEMA_SQL } from "../lib/supabase";
import { Copy, Check, ExternalLink, Database, Key, HelpCircle } from "lucide-react";

interface SupabaseGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SupabaseGuideModal({ isOpen, onClose }: SupabaseGuideModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(SCHEMA_SQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-[9999] animate-fade-in">
      <div 
        id="supabase-guide-card"
        className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-950 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">Supabase 연동 가이드</h2>
              <p className="text-xs text-slate-400 mt-0.5">클라우드 데이터베이스에 실시간으로 실메모를 연동하세요</p>
            </div>
          </div>
          <button 
            id="close-guide-btn"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition-colors w-8 h-8 rounded-full hover:bg-slate-800 flex items-center justify-center font-medium"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-300 leading-relaxed">
          {/* Step 1 */}
          <section className="space-y-2">
            <h3 className="text-emerald-400 font-semibold flex items-center gap-2">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs border border-emerald-500/20">1</span>
              Supabase 프로젝트 만들기
            </h3>
            <p className="pl-7 text-slate-400 text-xs sm:text-sm">
              <a 
                href="https://supabase.com" 
                target="_blank" 
                rel="noreferrer" 
                className="text-emerald-400 hover:underline inline-flex items-center gap-1 font-medium"
              >
                Supabase 홈페이지 <ExternalLink className="w-3.5 h-3.5" />
              </a>
              에 접속하여 로그인한 뒤, 새로운 프로젝트를 생성합니다.
            </p>
          </section>

          {/* Step 2 */}
          <section className="space-y-3">
            <h3 className="text-emerald-400 font-semibold flex items-center gap-2">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs border border-emerald-500/20">2</span>
              SQL Editor에서 테이블 및 보안 생성 (필수)
            </h3>
            <p className="pl-7 text-slate-400 text-xs sm:text-sm">
              Supabase 대시보드의 <strong className="text-slate-200 font-medium">SQL Editor</strong>에 들어가 아래 쿼리를 붙여 넣고 실행(<kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-xs border border-slate-700">Run</kbd>)하십시오.
            </p>
            
            <div className="pl-7">
              <div className="relative rounded-xl border border-slate-700 bg-slate-950 overflow-hidden text-slate-300">
                <div className="flex justify-between items-center px-4 py-2 bg-slate-900 border-b border-slate-800">
                  <span className="text-xs font-mono text-slate-400">create_notes_table.sql</span>
                  <button
                    id="copy-sql-btn"
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 transition-colors py-1 px-2.5 rounded bg-slate-800 border border-slate-700 hover:border-emerald-500/30"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400 animate-scale" />
                        <span>복사 완료!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-emerald-400" />
                        <span>SQL 복사하기</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-4 text-xs font-mono overflow-x-auto max-h-48 text-slate-400 leading-normal scrollbar-thin">
                  {SCHEMA_SQL}
                </pre>
              </div>
            </div>
          </section>

          {/* Step 3 */}
          <section className="space-y-2">
            <h3 className="text-emerald-400 font-semibold flex items-center gap-2">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs border border-emerald-500/20">3</span>
              환경 변수 추가하기
            </h3>
            <p className="pl-7 text-slate-400 text-xs sm:text-sm">
              AI Studio 빌드 화면 우측 또는 상단의 Settings 아이콘이나 <strong className="text-slate-200">Secrets</strong> 패널에서 아래 두 값을 본인의 Supabase 상세 값으로 교체 등록해 주세요.
            </p>
            <div className="pl-7 space-y-2 mt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800 gap-2">
                <div>
                  <span className="text-xs font-mono text-pink-500 font-semibold">VITE_SUPABASE_URL</span>
                  <p className="text-xs text-slate-400">프로젝트 API URL (Project Settings &gt; API)</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <Key className="w-3.5 h-3.5" /> Client Secret
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800 gap-2">
                <div>
                  <span className="text-xs font-mono text-pink-500 font-semibold">VITE_SUPABASE_ANON_KEY</span>
                  <p className="text-xs text-slate-400">프로젝트 Anon Key (Project Settings &gt; API &gt; anon public)</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <Key className="w-3.5 h-3.5" /> Client Key
                </div>
              </div>
            </div>
          </section>

          {/* Note */}
          <div className="p-4 rounded-xl bg-sky-950/20 border border-sky-900/30 text-xs text-sky-300 flex gap-2.5 items-start">
            <HelpCircle className="w-4 h-4 mt-0.5 shrink-0 text-sky-400" />
            <div>
              <strong className="block font-semibold text-sky-200 mb-0.5">💡 로컬 자동 오프라인 백업</strong>
              Supabase에 연결되기 전에는 브라우저 내부 <strong className="text-sky-100">LocalStorage</strong>에 완벽히 오프라인으로 자동 백업됩니다! 편하게 안심하시고 메모를 작성해 보세요. 두 연동 값 설정 시 곧바로 실시간 연동이 적용됩니다.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-800 bg-slate-950 flex justify-end">
          <button
            id="guide-close-confirm-btn"
            onClick={onClose}
            className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-slate-950 font-semibold rounded-xl text-xs sm:text-sm tracking-wide transition-all shadow-md cursor-pointer hover:shadow-emerald-500/10 shadow-emerald-500/5 hover:translate-y-[-1px]"
          >
            이해했습니다, 시작하기
          </button>
        </div>
      </div>
    </div>
  );
}
