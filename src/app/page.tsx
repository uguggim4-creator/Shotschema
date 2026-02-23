"use client";

import { useState } from "react";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [scenario, setScenario] = useState("");
  const [shotNotes, setShotNotes] = useState("");
  const [activeTab, setActiveTab] = useState<"scenario" | "shotNotes">("scenario");
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    setError("");
    setScenario("");
    setShotNotes("");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate");

      setScenario(data.scenario);
      setShotNotes(data.shotNotes);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans p-6 pb-24">
      <main className="max-w-4xl mx-auto space-y-8">
        <header className="text-center py-12 space-y-4 mt-8">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-neutral-200 to-neutral-500 bg-clip-text text-transparent">
            시나리오 & 샷 노트 제너레이터
          </h1>
          <p className="text-neutral-400 max-w-2xl mx-auto">
            디렉팅 마스터 가이드라인과 Gemini 2.5 Flash를 활용하여 압도적인 서스펜스와 몽타주 기법이 적용된 시나리오와 샷 노트를 자동 생성합니다.
          </p>
        </header>

        <section className="bg-neutral-900/50 backdrop-blur-xl border border-neutral-800/80 rounded-2xl p-6 shadow-2xl">
          <div className="space-y-4">
            <label htmlFor="prompt" className="block text-sm font-medium text-neutral-400">
              상황 입력 (Synopsis)
            </label>
            <textarea
              id="prompt"
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="예: 어두운 골목 끝 작은 심야 식당. 10년 전 서로의 등에 칼을 꽂았던 두 조직원이 우연히 양옆 자리에 앉아 국수를 먹고 있다."
              className="w-full bg-neutral-950/80 border border-neutral-800 rounded-xl p-4 text-neutral-200 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all resize-none shadow-inner"
            />
            <button
              onClick={handleGenerate}
              disabled={loading || !prompt.trim()}
              className="w-full py-4 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-neutral-800 disabled:text-neutral-500 text-white font-semibold transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  영화적인 시나리오 렌더링 중...
                </>
              ) : (
                "시나리오 & 샷 노트 생성하기"
              )}
            </button>
          </div>
        </section>

        {error && (
          <div className="p-4 bg-red-900/30 border border-red-800/50 rounded-xl text-red-200 text-sm shadow-xl">
            {error}
          </div>
        )}

        {(scenario || shotNotes) && (
          <section className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex border-b border-neutral-800">
              <button
                onClick={() => setActiveTab("scenario")}
                className={`flex-1 py-4 text-sm font-medium transition-colors ${activeTab === "scenario" ? "bg-neutral-800 text-white" : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/50"
                  }`}
              >
                1. 시나리오 (Writer)
              </button>
              <button
                onClick={() => setActiveTab("shotNotes")}
                className={`flex-1 py-4 text-sm font-medium transition-colors ${activeTab === "shotNotes" ? "bg-neutral-800 text-white" : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/50"
                  }`}
              >
                2. 샷 노트 & 프롬프트 (Storyboarder)
              </button>
            </div>
            <div className="p-6 md:p-8">
              <div className="prose prose-invert prose-neutral max-w-none whitespace-pre-wrap">
                {activeTab === "scenario" ? scenario : shotNotes}
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
