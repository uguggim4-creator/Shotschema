import { z } from 'zod';

// ==========================================
// 1. 시나리오 기획 에이전트 (ScenarioPlanner) 출력 스키마
// ==========================================
export const ScenePlanSchema = z.object({
    sceneNumber: z.number().describe('씬 번호'),
    location: z.string().describe('장소 (예: 좁고 어두운 골목길)'),
    time: z.string().describe('시간대 (예: 늦은 밤, 비)'),
    description: z.string().describe('해당 씬에서 일어나는 핵심 사건'),
    directorIntention: z.string().describe('기획 의도 (시간 압박, 공간 권력, 서스펜스 등 매뉴얼 적용 포인트)'),
});

export const ScenarioPlanSchema = z.object({
    logline: z.string().describe('전체 서사를 요약하는 1~2줄의 로그라인'),
    moodAndTone: z.string().describe('작품 전체를 관통하는 감정적 온도와 시각적 톤 (예: 차갑고 건조한 느와르)'),
    scenes: z.array(ScenePlanSchema).describe('기획된 씬(Scene)들의 배열'),
});

export type ScenarioPlan = z.infer<typeof ScenarioPlanSchema>;

// ==========================================
// 2. 스토리보드 작가 에이전트 (StoryboardWriter) 출력 스키마
// ==========================================
export const ShotNodeSchema = z.object({
    shotId: z.string().describe('샷 고유 ID (예: S01-01)'),
    visualDescription: z.string().describe('화면에 보이는 피사체의 행동 및 시각적 묘사'),
    cameraDirecting: z.string().describe('렌즈, 앵글, 조명, 구도, 심도, 카메라 무브먼트 지시 사항'),
    audioDialog: z.string().describe('대사, 효과음(SFX), 배경음악(BGM) 지시 사항'),
});

export const StoryboardSceneSchema = z.object({
    sceneNumber: z.number(),
    shots: z.array(ShotNodeSchema).describe('해당 씬을 구성하는 구체적인 샷들의 모음'),
});

export const StoryboardSchema = z.object({
    scenes: z.array(StoryboardSceneSchema),
});

export type Storyboard = z.infer<typeof StoryboardSchema>;

// ==========================================
// 3. 콘텐츠 카테고리 정의
// ==========================================
export const ContentCategorySchema = z.enum(['film', 'ad', 'shorts', 'drama', 'animation']);
export type ContentCategory = z.infer<typeof ContentCategorySchema>;

export const CATEGORY_LABELS: Record<ContentCategory, string> = {
    film: '🎬 영화/드라마',
    ad: '📺 광고',
    shorts: '📱 숏폼',
    drama: '📺 드라마 시리즈',
    animation: '🎨 애니메이션',
};

// ==========================================
// 4. 작업 기억 객체 (Memory State) 스키마
// 파이프라인(기획 -> 스토리보드 -> 프롬프트) 전체를 관통하며 상태를 유지하는 객체
// ==========================================
export const PipelineStateSchema = z.object({
    category: ContentCategorySchema.default('film').describe('콘텐츠 카테고리 (film | ad | shorts | drama | animation)'),
    originalUserInput: z.string().describe('유저가 처음에 요청한 원본 프롬프트(장르/분위기)'),
    activeManuals: z.array(z.string()).describe('현재 활성화되어 참고 중인 매뉴얼 타입들'),
    idea: z.string().optional().describe('1단계: 선택된 아이디어 제안'),
    plot: z.string().optional().describe('2단계: 선택된 시나리오 줄거리'),
    plan: ScenarioPlanSchema.optional().describe('3단계: ScenarioPlanner가 생성한 상세 기획안'),
    storyboard: StoryboardSchema.optional().describe('4단계: StoryboardWriter가 생성한 세부 샷 리스트'),
    promptData: z.any().optional().describe('5단계: PromptGenerator가 생성한 프롬프트 데이터'),
    // 광고 카테고리 전용 확정 파라미터
    adDuration: z.union([z.literal(15), z.literal(30), z.literal(60)]).optional().describe('광고 길이(초): 15 | 30 | 60'),
    adLevel: z.union([z.literal(1), z.literal(2), z.literal(3)]).optional().describe('광고 연출 수위 Level: 1=사실적 공감, 2=은유/비유, 3=초현실'),
    // 향후 품질 검수(Reviewer)의 피드백(Checklist)도 이 State에 추가됩니다.
    revisionFeedback: z.string().optional().describe('품질 검수자(Reviewer)가 남긴 수정 요청사항'),
});

export type PipelineState = z.infer<typeof PipelineStateSchema>;

/**
 * 초기 상태 객체를 생성하는 팩토리 함수
 */
export function createInitialState(
    userInput: string,
    manuals: string[],
    category: ContentCategory = 'film'
): PipelineState {
    return {
        category,
        originalUserInput: userInput,
        activeManuals: manuals,
        adDuration: 30,  // 광고 기본값: 30초
        adLevel: 1,      // 광고 기본값: Level 1 (사실적 공감)
    };
}
