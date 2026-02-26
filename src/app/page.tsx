"use client";

import { useState } from "react";
import { PipelineState, ContentCategory, CATEGORY_LABELS } from "@/lib/ai/memory/state-manager";
import { SUPPORTED_MODELS, ModelId } from "@/lib/ai/model-factory";

// 선택 가능한 카테고리 (UI에 표시할 데이터)
const SELECTABLE_CATEGORIES: { key: ContentCategory; label: string; available: boolean }[] = [
  { key: 'film', label: '🎬 영화', available: true },
  { key: 'ad', label: '📺 광고', available: true },
  { key: 'shorts', label: '📱 숏폼', available: true },
  { key: 'drama', label: '🎭 드라마 시리즈', available: true },
  { key: 'animation', label: '🎨 애니메이션', available: true },
];

export default function Home() {
  const [synopsis, setSynopsis] = useState("");
  const [category, setCategory] = useState<ContentCategory>('film');
  const [selectedModel, setSelectedModel] = useState<ModelId>('gemini-3-flash');

  // 1. 아이디어 제안
  const [ideas, setIdeas] = useState<any[]>([]);
  const [selectedIdeaIdx, setSelectedIdeaIdx] = useState<number | null>(null);

  // 2. 줄거리: 아이디어 인덱스별로 저장 (Record<ideaIdx, plots[]>)
  const [plotsByIdea, setPlotsByIdea] = useState<Record<number, string[]>>({});
  const [selectedPlotIdx, setSelectedPlotIdx] = useState<number | null>(null);

  // 3. 시나리오: "ideaIdx_plotIdx" 키별로 저장
  const [scenariosByPlot, setScenariosByPlot] = useState<Record<string, any[]>>({});
  const [selectedScenarioIdx, setSelectedScenarioIdx] = useState<number | null>(null);

  // 4. 스토리보드: "ideaIdx_plotIdx_scenarioIdx" 키별로 저장
  const [storyboardsByScenario, setStoryboardsByScenario] = useState<Record<string, any[]>>({});
  const [selectedStoryboardIdx, setSelectedStoryboardIdx] = useState<number | null>(null);

  // 5. 프롬프트: "ideaIdx_plotIdx_scenarioIdx_storyboardIdx" 키별로 저장
  const [promptsByStoryboard, setPromptsByStoryboard] = useState<Record<string, any[]>>({});

  // 씬 카드 편집/AI수정 state
  const [editingSceneKey, setEditingSceneKey] = useState<string | null>(null);  // "scenarioIdx_sceneNumber"
  const [editingSceneData, setEditingSceneData] = useState<any>(null);
  const [refineTarget, setRefineTarget] = useState<{ scenarioIdx: number; sceneNumber: number } | null>(null);
  const [refineInstruction, setRefineInstruction] = useState('');
  const [isRefining, setIsRefining] = useState(false);

  // 광고 카테고리 전용 파라미터
  const [adDuration, setAdDuration] = useState<15 | 30 | 60>(30);
  const [adLevel, setAdLevel] = useState<1 | 2 | 3>(1);


  // 키 생성 헬퍼
  const plotKey = selectedIdeaIdx !== null ? `${selectedIdeaIdx}` : '';
  const scenKey = selectedIdeaIdx !== null && selectedPlotIdx !== null ? `${selectedIdeaIdx}_${selectedPlotIdx}` : '';
  const sbKey = scenKey && selectedScenarioIdx !== null ? `${scenKey}_${selectedScenarioIdx}` : '';
  const promptKey = sbKey && selectedStoryboardIdx !== null ? `${sbKey}_${selectedStoryboardIdx}` : '';

  // 현재 선택된 부모에 해당하는 자식 목록 (derived)
  const plots = selectedIdeaIdx !== null ? (plotsByIdea[selectedIdeaIdx] ?? []) : [];
  const scenarios = scenKey ? (scenariosByPlot[scenKey] ?? []) : [];
  const storyboards = sbKey ? (storyboardsByScenario[sbKey] ?? []) : [];
  const prompts = promptKey ? (promptsByStoryboard[promptKey] ?? []) : [];

  const [pipelineState, setPipelineState] = useState<Partial<PipelineState>>({});
  const [reviewResult, setReviewResult] = useState<{ isPass: boolean; score: number; feedback: string } | null>(null);
  const [isReviewing, setIsReviewing] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string | null>(null);
  const [error, setError] = useState("");

  const triggerReview = async (state: any) => {
    setIsReviewing(true);
    setReviewResult(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step: "review", savedState: state }),
      });
      if (!res.ok) throw new Error("Review request failed");
      const data = await res.json();
      setReviewResult(data);
    } catch (err: any) {
      console.error("[Review] 검수 요청 실패:", err.message);
    } finally {
      setIsReviewing(false);
    }
  };

  const generateIdea = async () => {
    setLoadingStep("idea");
    setError("");
    const newIdx = ideas.length;
    setIdeas((prev) => [...prev, ""]);
    setSelectedIdeaIdx(null); // 새로운 생성 시 선택 해제

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step: "idea", prompt: synopsis, category, model: selectedModel }),
      });

      if (!res.ok) throw new Error("Failed to generate idea");
      if (!res.body) throw new Error("ReadableStream not supported");

      setPipelineState({ originalUserInput: synopsis, activeManuals: [], category });

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let done = false;
      let streamedText = "";

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          streamedText += decoder.decode(value, { stream: true });
          setIdeas((prev) => {
            const arr = [...prev];
            arr[newIdx] = streamedText; // We store the raw JSON string
            return arr;
          });
        }
      }

      try {
        const parsedIdea = JSON.parse(streamedText);
        setIdeas((prev) => {
          const arr = [...prev];
          arr[newIdx] = parsedIdea;
          return arr;
        });
      } catch {
        // 직접 파싱 실패 시 JSON 블록만 추출하여 재시도
        const jsonMatch = streamedText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            const parsedIdea = JSON.parse(jsonMatch[0]);
            setIdeas((prev) => {
              const arr = [...prev];
              arr[newIdx] = parsedIdea;
              return arr;
            });
          } catch (e) {
            console.warn("Idea JSON parse failed (regex fallback도 실패)", e);
          }
        } else {
          console.warn("Idea JSON parse failed: JSON 블록을 찾지 못함");
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingStep(null);
    }
  };

  const generatePlot = async () => {
    if (selectedIdeaIdx === null) return;
    setLoadingStep("plot");
    setError("");
    const ideaData = ideas[selectedIdeaIdx];
    const ideaText = typeof ideaData === 'string' ? ideaData : JSON.stringify(ideaData, null, 2);
    const iIdx = selectedIdeaIdx;
    const newIdx = (plotsByIdea[iIdx] ?? []).length;
    setPlotsByIdea(prev => ({ ...prev, [iIdx]: [...(prev[iIdx] ?? []), ""] }));
    setPipelineState(prev => ({ ...prev, idea: ideaText }));

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step: "plot", idea: ideaText, category: pipelineState.category ?? category, model: selectedModel }),
      });
      if (!res.ok) throw new Error("Failed to generate plot");
      if (!res.body) throw new Error("ReadableStream not supported");
      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let done = false; let streamedText = "";
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          streamedText += decoder.decode(value, { stream: true });
          setPlotsByIdea(prev => {
            const arr = [...(prev[iIdx] ?? [])];
            arr[newIdx] = streamedText;
            return { ...prev, [iIdx]: arr };
          });
        }
      }
    } catch (err: any) { setError(err.message); } finally { setLoadingStep(null); }
  };

  const generateScenario = async () => {
    if (selectedIdeaIdx === null || selectedPlotIdx === null) return;
    setLoadingStep("scenario");
    setError("");
    const plotText = plots[selectedPlotIdx];
    const key = `${selectedIdeaIdx}_${selectedPlotIdx}`;
    const newIdx = (scenariosByPlot[key] ?? []).length;
    setScenariosByPlot(prev => ({ ...prev, [key]: [...(prev[key] ?? []), ""] }));
    const newState = { ...pipelineState, plot: plotText, activeManuals: ['planner'], adDuration, adLevel };
    setPipelineState(newState);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step: "scenario", savedState: newState, model: selectedModel }),
      });
      if (!res.ok) throw new Error("Failed to generate scenario");
      if (!res.body) throw new Error("ReadableStream not supported");
      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let done = false; let streamedText = "";
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          streamedText += decoder.decode(value, { stream: true });
          setScenariosByPlot(prev => {
            const arr = [...(prev[key] ?? [])];
            arr[newIdx] = streamedText;
            return { ...prev, [key]: arr };
          });
        }
      }
      try {
        const plan = JSON.parse(streamedText);
        setScenariosByPlot(prev => {
          const arr = [...(prev[key] ?? [])];
          arr[newIdx] = plan;
          return { ...prev, [key]: arr };
        });
      } catch { console.warn("시나리오 JSON 파싱 대기중/실패"); }
    } catch (err: any) { setError(err.message); } finally { setLoadingStep(null); }
  };

  const generateStoryboard = async () => {
    if (selectedIdeaIdx === null || selectedPlotIdx === null || selectedScenarioIdx === null) return;
    setLoadingStep("storyboard");
    setError("");
    const scenarioData = scenarios[selectedScenarioIdx];
    const key = `${selectedIdeaIdx}_${selectedPlotIdx}_${selectedScenarioIdx}`;
    const newIdx = (storyboardsByScenario[key] ?? []).length;
    setStoryboardsByScenario(prev => ({ ...prev, [key]: [...(prev[key] ?? []), ""] }));
    const newState = {
      ...pipelineState,
      plan: typeof scenarioData === 'string' ? JSON.parse(scenarioData) : scenarioData,
      activeManuals: [...(pipelineState.activeManuals || []), 'writer']
    };
    setPipelineState(newState);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step: "storyboard", savedState: newState, model: selectedModel }),
      });
      if (!res.ok) throw new Error("Failed to generate storyboard");
      if (!res.body) throw new Error("ReadableStream not supported");
      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let done = false; let streamedText = "";
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          streamedText += decoder.decode(value, { stream: true });
          setStoryboardsByScenario(prev => {
            const arr = [...(prev[key] ?? [])];
            arr[newIdx] = streamedText;
            return { ...prev, [key]: arr };
          });
        }
      }
      try {
        const parsedSb = JSON.parse(streamedText);
        setStoryboardsByScenario(prev => {
          const arr = [...(prev[key] ?? [])];
          arr[newIdx] = parsedSb;
          return { ...prev, [key]: arr };
        });
        const finalState = { ...newState, storyboard: parsedSb };
        setPipelineState(finalState);
        await triggerReview(finalState);
      } catch { console.warn("스토리보드 JSON 파싱 실패"); }
    } catch (err: any) { setError(err.message); } finally { setLoadingStep(null); }
  };

  const generatePrompts = async () => {
    if (selectedIdeaIdx === null || selectedPlotIdx === null || selectedScenarioIdx === null || selectedStoryboardIdx === null) return;
    setLoadingStep("prompt");
    setError("");
    const sbData = storyboards[selectedStoryboardIdx];
    const key = `${selectedIdeaIdx}_${selectedPlotIdx}_${selectedScenarioIdx}_${selectedStoryboardIdx}`;
    const newIdx = (promptsByStoryboard[key] ?? []).length;
    setPromptsByStoryboard(prev => ({ ...prev, [key]: [...(prev[key] ?? []), ""] }));
    const newState = {
      ...pipelineState,
      storyboard: typeof sbData === 'string' ? JSON.parse(sbData) : sbData,
      activeManuals: [...(pipelineState.activeManuals || []), 'prompt']
    };
    setPipelineState(newState);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step: "prompt", savedState: newState, model: selectedModel }),
      });
      if (!res.ok) throw new Error("Failed to generate prompts");
      if (!res.body) throw new Error("ReadableStream not supported");
      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let done = false; let streamedText = "";
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          streamedText += decoder.decode(value, { stream: true });
          setPromptsByStoryboard(prev => {
            const arr = [...(prev[key] ?? [])];
            arr[newIdx] = streamedText;
            return { ...prev, [key]: arr };
          });
        }
      }
      try {
        const parsedP = JSON.parse(streamedText);
        setPromptsByStoryboard(prev => {
          const arr = [...(prev[key] ?? [])];
          arr[newIdx] = parsedP;
          return { ...prev, [key]: arr };
        });
        setPipelineState(prev => ({ ...prev, promptData: parsedP }));
      } catch { }
    } catch (err: any) { setError(err.message); } finally { setLoadingStep(null); }
  };

  const resetAll = () => {
    setSynopsis("");
    setIdeas([]);
    setSelectedIdeaIdx(null);
    setPlotsByIdea({});
    setSelectedPlotIdx(null);
    setScenariosByPlot({});
    setSelectedScenarioIdx(null);
    setStoryboardsByScenario({});
    setSelectedStoryboardIdx(null);
    setPromptsByStoryboard({});
    setPipelineState({});
    setReviewResult(null);
    setError("");
    setEditingSceneKey(null);
    setEditingSceneData(null);
    setRefineTarget(null);
    setRefineInstruction('');
  };

  /** AI 씬 수정 요청 */
  const handleRefineScene = async (scenarioIdx: number, sceneNumber: number) => {
    if (!refineInstruction.trim()) return;
    const key = scenKey;
    const scenarioData = scenariosByPlot[key]?.[scenarioIdx];
    if (!scenarioData) return;
    const plan = typeof scenarioData === 'string' ? JSON.parse(scenarioData) : scenarioData;

    setIsRefining(true);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step: 'refine_scene',
          category,
          model: selectedModel,
          plan,
          targetSceneNumber: sceneNumber,
          instruction: refineInstruction,
        }),
      });
      if (!res.ok) throw new Error('씬 수정 실패');
      const { refinedScene } = await res.json();

      // 수정된 씬으로 교체
      setScenariosByPlot(prev => {
        const arr = [...(prev[key] ?? [])];
        const planCopy = JSON.parse(JSON.stringify(arr[scenarioIdx]));
        planCopy.scenes = planCopy.scenes.map((s: any) =>
          s.sceneNumber === sceneNumber ? refinedScene : s
        );
        arr[scenarioIdx] = planCopy;
        return { ...prev, [key]: arr };
      });
      setRefineTarget(null);
      setRefineInstruction('');
    } catch (err: any) { setError(err.message); }
    finally { setIsRefining(false); }
  };

  /** 씬 직접 편집 저장 */
  const handleSaveEditScene = (scenarioIdx: number) => {
    if (!editingSceneData) return;
    const key = scenKey;
    setScenariosByPlot(prev => {
      const arr = [...(prev[key] ?? [])];
      const planCopy = JSON.parse(JSON.stringify(arr[scenarioIdx]));
      planCopy.scenes = planCopy.scenes.map((s: any) =>
        s.sceneNumber === editingSceneData.sceneNumber ? editingSceneData : s
      );
      arr[scenarioIdx] = planCopy;
      return { ...prev, [key]: arr };
    });
    setEditingSceneKey(null);
    setEditingSceneData(null);
  };


  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans p-6 pb-24">
      <main className="max-w-7xl mx-auto space-y-12">
        <header className="text-center py-12 space-y-4">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-neutral-200 to-neutral-500 bg-clip-text text-transparent">
            ShotSchema 5-Step
          </h1>
          <p className="text-neutral-400 max-w-2xl mx-auto leading-relaxed">
            아이디어 ➟ 줄거리 ➟ 시나리오 ➟ 스토리보드 ➟ 프롬프트
          </p>

          {/* 파이프라인 진행 스테퍼 */}
          {ideas.length > 0 && (
            <div className="flex items-center justify-center gap-1 mt-4 flex-wrap">
              {[
                { label: '아이디어', done: selectedIdeaIdx !== null, active: loadingStep === 'idea' },
                { label: '줄거리', done: selectedPlotIdx !== null, active: loadingStep === 'plot' },
                { label: '시나리오', done: selectedScenarioIdx !== null, active: loadingStep === 'scenario' },
                { label: '스토리보드', done: selectedStoryboardIdx !== null, active: loadingStep === 'storyboard' },
                { label: '프롬프트', done: prompts.length > 0, active: loadingStep === 'prompt' },
              ].map((step, i, arr) => (
                <div key={step.label} className="flex items-center gap-1">
                  <div
                    className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold transition-all ${step.active
                      ? 'bg-blue-600 text-white animate-pulse'
                      : step.done
                        ? 'bg-neutral-700 text-neutral-200'
                        : 'bg-neutral-900 text-neutral-600 border border-neutral-800'
                      }`}
                  >
                    {step.active && <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping inline-block" />}
                    {step.done && !step.active && <span>✓</span>}
                    {step.label}
                  </div>
                  {i < arr.length - 1 && <span className="text-neutral-700 text-xs">›</span>}
                </div>
              ))}
            </div>
          )}
        </header>

        {error && (
          <div className="p-4 bg-red-900/30 border border-red-800/50 rounded-xl text-red-200 text-sm shadow-xl animate-pulse">
            {error}
          </div>
        )}

        {/* Input Area */}
        <section className="bg-neutral-900/50 backdrop-blur-xl border border-neutral-800/80 rounded-2xl p-6 shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">1단계: 분위기 및 장르 입력</h2>
            {ideas.length > 0 && (
              <button onClick={resetAll} className="px-3 py-1 text-xs bg-neutral-800 hover:bg-neutral-700 rounded-md">
                처음부터 다시
              </button>
            )}
          </div>

          {/* 카테고리 선택 */}
          <div className="mb-5">
            <p className="text-xs text-neutral-500 mb-2 font-medium uppercase tracking-wider">콘텐츠 형식 선택</p>
            <div className="flex flex-wrap gap-2">
              {SELECTABLE_CATEGORIES.map(({ key, label, available }) => (
                <button
                  key={key}
                  onClick={() => available && setCategory(key)}
                  disabled={!available || loadingStep !== null}
                  title={!available ? '준비 중' : undefined}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all border
                    ${!available
                      ? 'opacity-30 cursor-not-allowed border-neutral-800 text-neutral-600'
                      : category === key
                        ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/30'
                        : 'bg-neutral-800/80 border-neutral-700 text-neutral-300 hover:border-blue-500/60 hover:text-white'
                    }`}
                >
                  {label}{!available && ' (준비 중)'}
                </button>
              ))}
            </div>
          </div>

          {/* AI 모델 선택 */}
          <div className="mb-5">
            <p className="text-xs text-neutral-500 mb-2 font-medium uppercase tracking-wider">AI 모델 선택</p>
            <div className="flex gap-2">
              {SUPPORTED_MODELS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSelectedModel(m.id)}
                  disabled={loadingStep !== null}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all border ${selectedModel === m.id
                    ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/30'
                    : 'bg-neutral-800/80 border-neutral-700 text-neutral-300 hover:border-blue-500/60 hover:text-white'
                    }`}
                >
                  <span>{m.provider === 'Google' ? '🔍' : '🧠'}</span>
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <p className="text-sm text-neutral-400 mb-4">어떤 영상이 필요한지 분위기, 장르, 혹은 단순한 단어를 입력하세요.</p>
          <textarea
            rows={2}
            value={synopsis}
            onChange={(e) => setSynopsis(e.target.value)}
            disabled={loadingStep !== null}
            placeholder="예: 이번엔 좀 웃긴게 필요해, 혹은 사이버펑크 느와르 감성"
            className="w-full bg-neutral-950/80 border border-neutral-800 rounded-xl p-4 text-neutral-200 focus:ring-2 focus:ring-blue-500/50 outline-none mb-4 resize-none transition-all disabled:opacity-50"
          />
          <button
            onClick={generateIdea}
            disabled={loadingStep !== null || !synopsis.trim()}
            className="w-full px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold transition-all shadow-lg"
          >
            {loadingStep === 'idea' ? '아이디어 탐색 중...' : ideas.length > 0 ? '다른 내용으로 아이디어 추가 생성' : '아이디어 생성하기'}
          </button>
        </section>

        {/* 1. Idea Section */}
        {ideas.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 font-bold text-sm">1</span>
              <h2 className="text-xl font-bold text-blue-100">
                아이디어 제안
                {loadingStep === 'idea' && <span className="ml-2 text-xs font-normal text-blue-400 animate-pulse">● 생성 중...</span>}
              </h2>
              <button
                onClick={generateIdea}
                disabled={loadingStep !== null}
                className="ml-auto px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-sm disabled:opacity-50"
              >
                ➕ 추가 제안 생성
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ideas.map((idea, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    if (loadingStep !== null || idx === selectedIdeaIdx) return;
                    setSelectedIdeaIdx(idx);
                    // 선택만 초기화 (데이터는 아이디어별로 독립 보존)
                    setSelectedPlotIdx(null);
                    setSelectedScenarioIdx(null);
                    setSelectedStoryboardIdx(null);
                    setReviewResult(null);
                  }}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${selectedIdeaIdx === idx
                    ? 'bg-blue-900/30 border-blue-500 shadow-blue-900/20'
                    : 'bg-neutral-900/50 border-neutral-700 hover:border-blue-500/50'
                    }`}
                >
                  {typeof idea === 'string' ? (
                    loadingStep === 'idea' && idx === ideas.length - 1 ? (
                      // 스트리밍 스켈레턴
                      <div className="space-y-3 animate-pulse">
                        <div className="h-4 bg-neutral-700/60 rounded-lg w-2/3" />
                        <div className="h-3 bg-neutral-700/40 rounded w-full" />
                        <div className="h-3 bg-neutral-700/40 rounded w-5/6" />
                        <div className="h-3 bg-neutral-700/40 rounded w-4/6" />
                        <div className="h-8 bg-blue-900/30 rounded-lg w-full mt-4" />
                      </div>
                    ) : (
                      <p className="text-sm text-neutral-300 leading-relaxed whitespace-pre-wrap">{idea}</p>
                    )
                  ) : (
                    <div className="space-y-3">
                      {idea.title && <h3 className="font-bold text-lg text-white">[{idea.title}]</h3>}
                      {idea.logline && <p className="text-sm text-neutral-300 font-semibold leading-relaxed">🎬 {idea.logline}</p>}
                      {idea.selling_point && <p className="text-sm text-neutral-400 leading-relaxed">✨ {idea.selling_point}</p>}
                      {idea.director_notes && (
                        <div className="mt-4 p-3 bg-blue-950/40 rounded-lg border border-blue-900/50">
                          <p className="text-xs text-blue-300 font-semibold mb-1">💡 에이전트 생각의 사슬 (CoT)</p>
                          <p className="text-xs text-neutral-400 italic">{idea.director_notes}</p>
                        </div>
                      )}
                    </div>
                  )}
                  {selectedIdeaIdx === idx && <div className="mt-3 text-blue-400 text-xs font-bold">✓ 선택됨</div>}
                </div>
              ))}
            </div>
            {selectedIdeaIdx !== null && plots.length === 0 && (
              <button
                onClick={generatePlot}
                disabled={loadingStep !== null}
                className="w-full px-8 py-3 mt-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold transition-all shadow-lg"
              >
                {loadingStep === "plot" ? "줄거리 생성 중..." : "이 아이디어로 줄거리 생성하기 →"}
              </button>
            )}
          </section>
        )}

        {/* 2. Plot Section */}
        {plots.length > 0 && (
          <section className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-600 font-bold text-sm">2</span>
              <h2 className="text-xl font-bold text-indigo-100">
                시나리오 줄거리 제안
                {loadingStep === 'plot' && <span className="ml-2 text-xs font-normal text-indigo-400 animate-pulse">● 생성 중...</span>}
              </h2>
              <button
                onClick={generatePlot}
                disabled={loadingStep !== null}
                className="ml-auto px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-sm disabled:opacity-50"
              >
                ➕ 추가 제안 생성
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {plots.map((plot, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    if (loadingStep !== null || idx === selectedPlotIdx) return;
                    setSelectedPlotIdx(idx);
                    // 하위 선택만 초기화 (데이터 보존)
                    setSelectedScenarioIdx(null);
                    setSelectedStoryboardIdx(null);
                    setReviewResult(null);
                  }}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${selectedPlotIdx === idx
                    ? 'bg-indigo-900/30 border-indigo-500 shadow-indigo-900/20'
                    : 'bg-neutral-900/50 border-neutral-700 hover:border-indigo-500/50'
                    }`}
                >
                  <p className="text-sm text-neutral-300 leading-relaxed whitespace-pre-wrap">
                    {loadingStep === 'plot' && idx === plots.length - 1 && typeof plot === 'string' && plot.length < 50
                      ? '' /* 스켈레턴으로 대체 */
                      : plot}
                  </p>
                  {loadingStep === 'plot' && idx === plots.length - 1 && typeof plot === 'string' && plot.length < 50 && (
                    <div className="space-y-2 animate-pulse">
                      <div className="h-3 bg-neutral-700/60 rounded w-full" />
                      <div className="h-3 bg-neutral-700/40 rounded w-5/6" />
                      <div className="h-3 bg-neutral-700/40 rounded w-4/6" />
                      <div className="h-3 bg-neutral-700/40 rounded w-full" />
                      <div className="h-3 bg-neutral-700/40 rounded w-3/4" />
                    </div>
                  )}
                  {selectedPlotIdx === idx && <div className="mt-3 text-indigo-400 text-xs font-bold">✓ 선택됨</div>}
                </div>
              ))}
            </div>
            {selectedPlotIdx !== null && scenarios.length === 0 && (
              <div className="space-y-3 mt-4">
                {/* 광고 파라미터 선택기 — ad 카테고리에만 표시 */}
                {category === 'ad' && (
                  <div className="p-5 rounded-2xl border border-indigo-700/50 bg-gradient-to-b from-indigo-950/40 to-neutral-950/40 space-y-5">
                    <div className="flex items-center gap-2">
                      <span className="text-base">📺</span>
                      <p className="text-sm font-bold text-indigo-200 tracking-tight">광고 파라미터 설정</p>
                      <span className="text-[10px] text-indigo-400/60 ml-auto">AI 시나리오 구조에 직접 반영됩니다</span>
                    </div>

                    {/* Duration */}
                    <div className="space-y-3">
                      <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">⏱ 광고 길이</label>
                      <div className="flex flex-col md:flex-row gap-3 w-full">
                        {([
                          { val: 15 as const, desc: '3비트 구조' },
                          { val: 30 as const, desc: '4비트 구조' },
                          { val: 60 as const, desc: '5비트 구조' },
                        ]).map(({ val, desc }) => (
                          <button
                            key={val}
                            onClick={() => setAdDuration(val)}
                            className={`flex-1 py-4 rounded-xl border text-center transition-all ${adDuration === val
                              ? 'border-indigo-500 bg-indigo-900/70 shadow-lg shadow-indigo-900/30'
                              : 'border-neutral-700 bg-neutral-900/50 hover:border-indigo-700/60'
                              }`}
                          >
                            <p className={`text-lg font-bold ${adDuration === val ? 'text-indigo-200' : 'text-neutral-400'}`}>{val}초</p>
                            <p className={`text-xs mt-1 ${adDuration === val ? 'text-indigo-400' : 'text-neutral-500'}`}>{desc}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Level */}
                    <div className="space-y-3">
                      <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">🎬 연출 수위</label>
                      <div className="flex flex-col md:flex-row gap-3 w-full">
                        {([
                          { val: 1 as const, label: 'Level 1', desc: '사실적 공감', sub: '일상 배경·자연광' },
                          { val: 2 as const, label: 'Level 2', desc: '은유/비유', sub: '시각적 메타포' },
                          { val: 3 as const, label: 'Level 3', desc: '초현실', sub: '판타지·추상 비주얼' },
                        ]).map(({ val, label, desc, sub }) => (
                          <button
                            key={val}
                            onClick={() => setAdLevel(val)}
                            className={`flex-1 py-4 rounded-xl border text-center transition-all ${adLevel === val
                              ? 'border-indigo-500 bg-indigo-900/70 shadow-lg shadow-indigo-900/30'
                              : 'border-neutral-700 bg-neutral-900/50 hover:border-indigo-700/60'
                              }`}
                          >
                            <p className={`text-sm font-bold ${adLevel === val ? 'text-indigo-200' : 'text-neutral-400'}`}>{label}</p>
                            <p className={`text-xs mt-1 font-medium ${adLevel === val ? 'text-indigo-300' : 'text-neutral-500'}`}>{desc}</p>
                            <p className={`text-[10px] mt-0.5 ${adLevel === val ? 'text-indigo-400/70' : 'text-neutral-600'}`}>{sub}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <button
                  onClick={generateScenario}
                  disabled={loadingStep !== null}
                  className="w-full px-8 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold transition-all shadow-lg"
                >
                  {loadingStep === "scenario" ? "상세 시나리오 기획 중..." : "이 줄거리로 상세 시나리오 기획하기 →"}
                </button>
              </div>
            )}

          </section>
        )}

        {/* 3. Scenario Section */}
        {scenarios.length > 0 && (
          <section className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-600 font-bold text-sm">3</span>
              <h2 className="text-xl font-bold text-purple-100">
                상세 시나리오 기획
                {loadingStep === 'scenario' && <span className="ml-2 text-xs font-normal text-purple-400 animate-pulse">● 생성 중...</span>}
              </h2>
              <button
                onClick={generateScenario}
                disabled={loadingStep !== null}
                className="ml-auto px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-sm disabled:opacity-50"
              >
                ➕ 추가 제안 생성
              </button>
            </div>
            <div className="space-y-6">
              {scenarios.map((scenario, idx) => {
                const data = typeof scenario === 'string' ? (() => { try { return JSON.parse(scenario); } catch { return null; } })() : scenario;
                const isSelected = selectedScenarioIdx === idx;
                const scenes: any[] = data?.scenes ?? [];

                return (
                  <div key={idx} className={`rounded-2xl border transition-all ${isSelected ? 'border-purple-500 bg-purple-950/20' : 'border-neutral-700 bg-neutral-900/50'}`}>
                    {/* 버전 헤더 */}
                    <div
                      className="flex items-center justify-between p-4 cursor-pointer"
                      onClick={() => {
                        if (loadingStep !== null || idx === selectedScenarioIdx) return;
                        setSelectedScenarioIdx(idx);
                        setSelectedStoryboardIdx(null);
                        setReviewResult(null);
                      }}
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-purple-400 uppercase tracking-widest">버전 {idx + 1}</span>
                          {isSelected && <span className="text-xs text-purple-300 bg-purple-900/50 px-2 py-0.5 rounded-full">✓ 선택됨</span>}
                        </div>
                        {data?.logline && <p className="text-sm text-neutral-200 font-medium leading-snug">{data.logline}</p>}
                        {data?.moodAndTone && <p className="text-xs text-purple-300/70 italic">{data.moodAndTone}</p>}
                      </div>
                      {!isSelected && <span className="text-neutral-500 text-sm ml-4">클릭하여 선택</span>}
                    </div>

                    {/* 씬 카드 목록 */}
                    <div className="px-4 pb-4 space-y-3">
                      {scenes.map((scene: any) => {
                        const eKey = `${idx}_${scene.sceneNumber}`;
                        const isEditing = editingSceneKey === eKey;
                        const isRefineOpen = refineTarget?.scenarioIdx === idx && refineTarget?.sceneNumber === scene.sceneNumber;

                        return (
                          <div key={scene.sceneNumber} className="relative p-6 rounded-2xl border border-neutral-800 bg-[#0a0a0a] flex flex-col space-y-4">
                            {/* 씬 헤더 및 버튼 영역 */}
                            <div className="flex items-start justify-between">
                              <div className="space-y-1 pr-4">
                                <h3 className="font-bold text-lg text-white">
                                  <span className="text-purple-400 mr-2">[Scene {scene.sceneNumber}]</span>
                                  {scene.location}
                                </h3>
                                <p className="text-sm text-neutral-400">🕒 {scene.time}</p>
                              </div>
                              <div className="flex gap-2 shrink-0">
                                <button
                                  onClick={(e) => { e.stopPropagation(); if (isEditing) { handleSaveEditScene(idx); } else { setEditingSceneKey(eKey); setEditingSceneData({ ...scene }); } }}
                                  className={`text-xs px-3 py-1.5 rounded border transition font-medium ${isEditing ? 'border-green-500 text-green-400 hover:bg-green-900/30' : 'border-neutral-600 text-neutral-400 hover:text-white'}`}
                                >
                                  {isEditing ? '💾 저장' : '✏️ 편집'}
                                </button>
                                {isEditing && (
                                  <button onClick={() => { setEditingSceneKey(null); setEditingSceneData(null); }} className="text-xs px-3 py-1.5 rounded border border-neutral-600 text-neutral-500 hover:text-white">취소</button>
                                )}
                                <button
                                  onClick={(e) => { e.stopPropagation(); setRefineTarget(isRefineOpen ? null : { scenarioIdx: idx, sceneNumber: scene.sceneNumber }); setRefineInstruction(''); }}
                                  className={`text-xs px-3 py-1.5 rounded border transition font-medium ${isRefineOpen ? 'border-indigo-500 text-indigo-300 bg-indigo-900/30' : 'border-neutral-600 text-neutral-400 hover:text-indigo-300 hover:border-indigo-500/50'}`}
                                >
                                  🤖 AI 수정
                                </button>
                              </div>
                            </div>

                            {/* 씬 편집/내용 영역 */}
                            <div className="pl-1">
                              {isEditing ? (
                                <div className="space-y-3 mt-2">
                                  {(['location', 'time', 'description', 'directorIntention'] as const).map(field => (
                                    <div key={field}>
                                      <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1 block">
                                        {field === 'location' ? '📍 장소' : field === 'time' ? '🕐 시간대' : field === 'description' ? '📝 씬 설명' : '💡 감독 의도'}
                                      </label>
                                      <textarea
                                        value={editingSceneData?.[field] ?? ''}
                                        onChange={e => setEditingSceneData((prev: any) => ({ ...prev, [field]: e.target.value }))}
                                        rows={field === 'description' || field === 'directorIntention' ? 4 : 1}
                                        className="w-full bg-[#111] border border-neutral-700 rounded-lg px-3 py-2 text-sm text-neutral-200 resize-y focus:outline-none focus:border-purple-500"
                                      />
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="space-y-4">
                                  <p className="text-sm text-neutral-300 font-medium leading-relaxed">
                                    🎬 {scene.description}
                                  </p>
                                  {scene.directorIntention && (
                                    <div className="mt-2 p-3 bg-purple-950/20 rounded-lg border border-purple-900/40">
                                      <p className="text-xs text-purple-400 font-semibold mb-1">💡 감독 의도 (Director's Intention)</p>
                                      <p className="text-sm text-neutral-400 italic leading-relaxed">{scene.directorIntention}</p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>


                            {/* AI 수정 요청 패널 */}
                            {isRefineOpen && (
                              <div className="mt-2 p-3 rounded-lg bg-indigo-950/40 border border-indigo-700/50 space-y-2">
                                <p className="text-xs text-indigo-300 font-semibold">🤖 AI에게 수정 지시사항을 입력하세요</p>
                                <p className="text-[10px] text-indigo-400/70">전체 이야기 맥락을 유지하면서 이 씬만 수정합니다</p>
                                <textarea
                                  value={refineInstruction}
                                  onChange={e => setRefineInstruction(e.target.value)}
                                  placeholder="예: 이 씬에서 주인공의 감정을 더 파국적으로 묘사해줘. 빗속에서 무너지는 장면을 추가해줘."
                                  rows={3}
                                  className="w-full bg-neutral-900 border border-indigo-700/50 rounded px-3 py-2 text-xs text-neutral-200 resize-none focus:outline-none focus:border-indigo-500 placeholder-neutral-600"
                                />
                                <button
                                  onClick={() => handleRefineScene(idx, scene.sceneNumber)}
                                  disabled={isRefining || !refineInstruction.trim()}
                                  className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-xs font-semibold text-white transition"
                                >
                                  {isRefining ? '🔄 수정 중...' : '🤖 AI로 씬 수정하기'}
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {/* 로딩 중 스켈레톤 */}
                      {loadingStep === 'scenario' && idx === scenarios.length - 1 && scenes.length === 0 && (
                        <div className="space-y-2 p-3 animate-pulse">
                          <div className="h-3 bg-neutral-700/60 rounded w-1/3" />
                          <div className="h-3 bg-neutral-700/40 rounded w-full" />
                          <div className="h-3 bg-neutral-700/40 rounded w-5/6" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            {selectedScenarioIdx !== null && (
              <button
                onClick={generateStoryboard}
                disabled={loadingStep !== null}
                className="w-full px-8 py-3 mt-4 rounded-xl bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-semibold transition-all shadow-lg"
              >
                {loadingStep === "storyboard" ? "스토리보드 작성 중..." : "이 시나리오로 스토리보드 작성하기 →"}
              </button>
            )}
          </section>
        )}


        {/* 4. Storyboard Section */}
        {storyboards.length > 0 && (
          <section className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-green-600 font-bold text-sm">4</span>
              <h2 className="text-xl font-bold text-green-100">
                스토리보드 샷 리스트
                {loadingStep === 'storyboard' && <span className="ml-2 text-xs font-normal text-green-400 animate-pulse">● 생성 중...</span>}
              </h2>
              <button
                onClick={generateStoryboard}
                disabled={loadingStep !== null}
                className="ml-auto px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-sm disabled:opacity-50"
              >
                {loadingStep === 'storyboard' ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    생성 중...
                  </span>
                ) : (
                  '➕ 추가 제안 생성'
                )}
              </button>
            </div>

            {isReviewing && (
              <div className="mb-4 p-4 bg-yellow-900/20 border border-yellow-700/40 rounded-xl text-yellow-300 text-sm animate-pulse">
                검수 에이전트: 스토리보드 품질 검수(QualityReviewer) 실행 중...
              </div>
            )}
            {reviewResult && selectedStoryboardIdx !== null && (
              <div className={`mb-4 p-4 rounded-xl border text-sm space-y-2 ${reviewResult.isPass
                ? 'bg-green-900/20 border-green-700/40 text-green-200'
                : 'bg-red-900/20 border-red-700/40 text-red-200'
                }`}>
                <div className="flex items-center gap-3 font-semibold">
                  <span>{reviewResult.isPass ? '✅ 품질 검증 합격' : '❌ 보완 필요'}</span>
                  <span className="ml-auto font-mono">{reviewResult.score}점 / 100</span>
                </div>
                <p className="text-xs leading-relaxed opacity-80">{reviewResult.feedback}</p>
              </div>
            )}

            <div className="space-y-6">
              {storyboards.map((sb, idx) => {
                const data = typeof sb === 'string' ? (() => { try { return JSON.parse(sb); } catch { return null; } })() : sb;
                const isSelected = selectedStoryboardIdx === idx;
                const scenes: any[] = data?.scenes ?? [];
                const totalShots = scenes.reduce((acc: number, sc: any) => acc + (sc.shots?.length ?? 0), 0);

                return (
                  <div key={idx} className={`rounded-2xl border transition-all ${isSelected ? 'border-green-500 bg-green-950/20' : 'border-neutral-700 bg-neutral-900/50'}`}>
                    {/* 버전 헤더 */}
                    <div
                      className="flex items-center justify-between p-4 cursor-pointer"
                      onClick={() => { if (loadingStep !== null || idx === selectedStoryboardIdx) return; setSelectedStoryboardIdx(idx); }}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-green-400 uppercase tracking-widest">버전 {idx + 1}</span>
                        <span className="text-xs text-neutral-500">{scenes.length}씬 / {totalShots}샷</span>
                        {isSelected && <span className="text-xs text-green-300 bg-green-900/50 px-2 py-0.5 rounded-full">✓ 선택됨</span>}
                      </div>
                      {!isSelected && <span className="text-neutral-500 text-sm">클릭하여 선택</span>}
                    </div>

                    {/* 씬별 카드 */}
                    <div className="px-4 pb-4 space-y-4">
                      {scenes.map((scene: any) => (
                        <div key={scene.sceneNumber} className="rounded-xl border border-neutral-700 bg-neutral-800/40 overflow-hidden">
                          {/* 씬 헤더 */}
                          <div className="flex items-center gap-2 px-3 py-2 bg-green-950/40 border-b border-green-900/40">
                            <span className="text-xs font-bold text-green-400 bg-green-900/50 px-2 py-0.5 rounded">Scene {scene.sceneNumber}</span>
                            <span className="text-xs text-neutral-500">{scene.shots?.length ?? 0} shots</span>
                          </div>

                          {/* 샷 카드 목록 */}
                          <div className="p-3 space-y-3">
                            {(scene.shots ?? []).map((shot: any) => (
                              <div key={shot.shotId} className="rounded-lg border border-neutral-700/60 bg-neutral-900/60 overflow-hidden">
                                {/* 샷 헤더 */}
                                <div className="flex items-center justify-between px-3 py-1.5 bg-neutral-800/80 border-b border-neutral-700/50">
                                  <span className="text-xs font-mono font-bold text-green-300">{shot.shotId}</span>
                                </div>
                                {/* 샷 내용 */}
                                <div className="p-3 space-y-2">
                                  {/* 비주얼 묘사 */}
                                  <div>
                                    <span className="text-[10px] text-neutral-500 uppercase tracking-wider">🖼 Visual</span>
                                    <p className="mt-0.5 text-xs text-neutral-200 leading-relaxed">{shot.visualDescription}</p>
                                  </div>
                                  {/* 카메라 지시 */}
                                  <div>
                                    <span className="text-[10px] text-sky-500 uppercase tracking-wider">🎥 Camera</span>
                                    <p className="mt-0.5 text-xs text-sky-300/80 leading-relaxed">{shot.cameraDirecting}</p>
                                  </div>
                                  {/* 오디오/대사 */}
                                  {shot.audioDialog && (
                                    <div>
                                      <span className="text-[10px] text-amber-500 uppercase tracking-wider">🔊 Audio / Dialog</span>
                                      <p className="mt-0.5 text-xs text-amber-200/70 leading-relaxed">{shot.audioDialog}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}

                            {/* 로딩: 샷이 없을 때 스켈레톤 */}
                            {loadingStep === 'storyboard' && idx === storyboards.length - 1 && (scene.shots ?? []).length === 0 && (
                              <div className="space-y-2 animate-pulse p-2">
                                <div className="h-3 bg-neutral-700/60 rounded w-2/3" />
                                <div className="h-3 bg-neutral-700/40 rounded w-full" />
                                <div className="h-3 bg-neutral-700/40 rounded w-5/6" />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}

                      {/* 씬이 아직 없을 때 스켈레톤 */}
                      {loadingStep === 'storyboard' && idx === storyboards.length - 1 && scenes.length === 0 && (
                        <div className="space-y-2 p-2 animate-pulse">
                          <div className="h-3 bg-neutral-700/60 rounded w-1/3" />
                          <div className="h-3 bg-neutral-700/40 rounded w-full" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {selectedStoryboardIdx !== null && prompts.length === 0 && (
              <button
                onClick={generatePrompts}
                disabled={loadingStep !== null || isReviewing}
                className="w-full px-8 py-3 mt-4 rounded-xl bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-semibold transition-all shadow-lg"
              >
                {loadingStep === "prompt" ? "프롬프트 변환 중..." : "이 스토리보드로 이미지/비디오 프롬프트 생성하기 →"}
              </button>
            )}
          </section>
        )}

        {/* 5. Prompts Section */}
        {prompts.length > 0 && (
          <section className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-600 font-bold text-sm">5</span>
              <h2 className="text-xl font-bold text-orange-100">최종 프롬프트</h2>
              <button
                onClick={generatePrompts}
                disabled={loadingStep !== null}
                className="ml-auto px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-sm disabled:opacity-50"
              >
                ➕ 추가 제안 생성
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {prompts.map((p, idx) => {
                const data = typeof p === 'string' ? (() => { try { return JSON.parse(p); } catch { return p; } })() : p;
                const isObj = data && typeof data === 'object' && !Array.isArray(data);
                return (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border bg-orange-900/10 border-orange-500/50 space-y-3"
                  >
                    {isObj ? (
                      <>
                        {/* Shot ID */}
                        {data.shotId && (
                          <p className="text-xs font-bold text-orange-400 uppercase tracking-widest">{data.shotId}</p>
                        )}

                        {/* Image Prompt */}
                        {data.imagePrompt && (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-orange-300 font-semibold uppercase tracking-wider">🖼 Image Prompt</span>
                              <button
                                onClick={() => navigator.clipboard.writeText(data.imagePrompt)}
                                className="text-[10px] text-neutral-400 hover:text-white px-2 py-0.5 rounded border border-neutral-600 hover:border-neutral-400 transition"
                              >복사</button>
                            </div>
                            <p className="text-xs text-neutral-200 font-mono whitespace-pre-wrap bg-black/30 rounded p-2">{data.imagePrompt}</p>
                          </div>
                        )}

                        {/* Video Motion Prompt */}
                        {data.videoMotionPrompt && (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-sky-300 font-semibold uppercase tracking-wider">🎬 Video Motion</span>
                              <button
                                onClick={() => navigator.clipboard.writeText(data.videoMotionPrompt)}
                                className="text-[10px] text-neutral-400 hover:text-white px-2 py-0.5 rounded border border-neutral-600 hover:border-neutral-400 transition"
                              >복사</button>
                            </div>
                            <p className="text-xs text-neutral-300 font-mono whitespace-pre-wrap bg-black/30 rounded p-2">{data.videoMotionPrompt}</p>
                          </div>
                        )}

                        {/* Negative Prompt */}
                        {data.negativePrompt && (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-red-400 font-semibold uppercase tracking-wider">⛔ Negative</span>
                              <button
                                onClick={() => navigator.clipboard.writeText(data.negativePrompt)}
                                className="text-[10px] text-neutral-400 hover:text-white px-2 py-0.5 rounded border border-neutral-600 hover:border-neutral-400 transition"
                              >복사</button>
                            </div>
                            <p className="text-xs text-red-300/70 font-mono whitespace-pre-wrap bg-black/30 rounded p-2">{data.negativePrompt}</p>
                          </div>
                        )}
                      </>
                    ) : (
                      <pre className="text-xs text-neutral-300 whitespace-pre-wrap font-mono">
                        {typeof data === 'string' ? data : JSON.stringify(data, null, 2)}
                      </pre>
                    )}
                  </div>
                );
              })}

            </div>
          </section>
        )}
      </main>
    </div >
  );
}
