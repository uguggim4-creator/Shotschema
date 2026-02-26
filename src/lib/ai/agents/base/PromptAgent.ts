import { streamObject } from 'ai';
import { z } from 'zod';
import { loadManual, loadCategoryManuals, loadGuidelines, loadOutputManual } from '../../manual-loader';
import { getModel } from '../../model-factory';
import { PipelineState } from '../../memory/state-manager';
import { ContentCategory } from '../../memory/state-manager';

export const PromptListSchema = z.object({
    prompts: z.array(z.object({
        shotId: z.string(),
        imagePrompt: z.string().describe('4-Layer 구조의 영문 이미지 생성 프롬프트. 카테고리별 --ar 비율로 마무리'),
        videoMotionPrompt: z.string().optional().describe('카메라 움직임 + 인물 동작 + 분위기 강화 영문 기술'),
        negativePrompt: z.string().optional().describe('이미지 품질을 저해하는 요소 제외 목록 (영문, 쉼표 구분)'),
    }))
});

/** 카테고리별 기본 화면 비율 */
const CATEGORY_ASPECT_RATIO: Record<ContentCategory, string> = {
    film: '--ar 2.39:1',   // 시네마스코프 와이드스크린
    ad: '--ar 16:9',     // TV/유튜브 광고
    shorts: '--ar 9:16',     // 세로형 숏폼
    drama: '--ar 16:9',     // TV 드라마
    animation: '--ar 16:9',     // 애니메이션 (극장용은 개별 조정)
};

/** 카테고리별 Layer 1 트리거 키워드 */
const CATEGORY_TRIGGER: Record<ContentCategory, string> = {
    film: 'Cinematic photography',
    ad: 'Commercial advertisement photography',
    shorts: 'Short-form video frame, vertical format',
    drama: 'Film still from a TV drama series',
    animation: 'Animated scene',
};

export abstract class BasePromptAgent {
    protected abstract readonly category: ContentCategory;
    constructor(
        protected readonly apiKey: string,
        protected readonly model: string = 'gemini-3-flash'
    ) { }

    async generatePromptsStream(state: PipelineState) {
        if (!state.storyboard) throw new Error(`[PromptAgent:${this.category}] 스토리보드가 없습니다.`);
        console.log(`[PromptAgent:${this.category}] 프롬프트 생성 (모델: ${this.model})`);
        const coreModel = getModel(this.model, this.apiKey);

        const promptManual = await loadManual('prompt');
        const categoryExtra = await loadCategoryManuals(this.category, 'prompt');
        const backgroundTheories = await loadGuidelines(['film/image_prompt/prompt_visual_language_guide.md']);
        const combinedManual = promptManual + (categoryExtra || '');
        const outputManual = await loadOutputManual('prompt');
        const overallMoodAndTone = state.plan?.moodAndTone || 'Cinematic and realistic lighting';
        const storyboardContext = JSON.stringify(state.storyboard, null, 2);
        const aspectRatio = CATEGORY_ASPECT_RATIO[this.category];
        const trigger = CATEGORY_TRIGGER[this.category];

        return streamObject({
            model: coreModel,
            schema: PromptListSchema,
            prompt: `당신은 [프롬프트 제너레이터 에이전트]입니다. 카테고리: **${this.category.toUpperCase()}**

[이미지 프롬프트 엔진 매뉴얼 (VATQ Process + 4-Layer Rule)]
${combinedManual}

[편집/몽타주 배경 지식]
${backgroundTheories}

[카테고리 전용 설정]
- Layer 1 트리거 키워드: "${trigger}"  ← 모든 imagePrompt는 반드시 이 키워드로 시작
- 화면 비율: ${aspectRatio}  ← 모든 imagePrompt 끝에 반드시 이 파라미터를 붙일 것

[작품 전체 무드 및 톤 (필수 반영)]
"${overallMoodAndTone}"
모든 imagePrompt 후반부(Layer 4)에 위 무드 앤 톤을 영문으로 번역하여 일관되게 포함시킬 것.

[스토리보드 샷 리스트]
${storyboardContext}

[답변 양식 (출력 매뉴얼)]
${outputManual}

[추가 출력 지시]
- negativePrompt: 각 씬의 품질을 저해할 요소를 영문으로 나열. 기본값으로 "blurry, low resolution, overexposed, watermark, text overlay, amateur" 포함. 씬 특성에 따라 추가 (예: 실사씬에서 "cartoon, anime", 인물씬에서 "extra limbs, deformed face")`,
        });
    }
}
