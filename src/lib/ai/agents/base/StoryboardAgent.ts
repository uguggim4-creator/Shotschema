import { streamObject, generateText } from 'ai';
import { loadManual, loadCategoryManuals, loadGuidelines, loadOutputManual } from '../../manual-loader';
import { getModel } from '../../model-factory';
import { PipelineState, StoryboardSchema } from '../../memory/state-manager';
import { ContentCategory } from '../../memory/state-manager';

export abstract class BaseStoryboardAgent {
    protected abstract readonly category: ContentCategory;
    constructor(
        protected readonly apiKey: string,
        protected readonly model: string = 'gemini-3-flash'
    ) { }

    async generateStoryboardStream(state: PipelineState) {
        if (!state.plan) throw new Error(`[StoryboardAgent:${this.category}] 기획안(Plan)이 없습니다.`);
        console.log(`[StoryboardAgent:${this.category}] 스토리보드 생성 (모델: ${this.model})`);
        const coreModel = getModel(this.model, this.apiKey);

        const writerManual = await loadManual('writer');
        const categoryExtra = await loadCategoryManuals(this.category, 'storyboard');
        const backgroundTheories = await loadGuidelines(['film/storyboard/storyboard_visual_guide.md']);
        const combinedManual = writerManual + (categoryExtra || '');
        const planContext = JSON.stringify(state.plan, null, 2);

        // Step 1. Draft
        console.log(`[StoryboardAgent:${this.category}] Step 1: 초안(Draft) 작성 중...`);
        const draftResult = await generateText({
            model: coreModel,
            prompt: `당신은 [스토리보드 작가 에이전트]입니다. 카테고리: **${this.category.toUpperCase()}**

[카메라 연출 배경 지식]
${backgroundTheories}

[스토리보드 작성 매뉴얼]
${combinedManual}

위 지식을 바탕으로, 아래 [기획안]을 구체적인 샷 단위로 쪼개어 자유로운 텍스트 형태로 스케치하십시오.
[기획안(Plan)]
${planContext}

[외부 피드백 (있다면 반영)]
${state.revisionFeedback ? `유의사항: ${state.revisionFeedback}` : '특별한 피드백 없음.'}`,
        });
        const storyboardDraft = draftResult.text;

        // Step 2. Critique
        console.log(`[StoryboardAgent:${this.category}] Step 2: 자가 채점(Critique) 중...`);
        const critiqueResult = await generateText({
            model: coreModel,
            prompt: `당신은 냉철한 [스토리보드 연출 감독 및 채점관]입니다.
카테고리: **${this.category.toUpperCase()}**

[학습 이론 (채점 기준표)]
${backgroundTheories}
${combinedManual}

[스토리보드 초안]
${storyboardDraft}

위 초안이 이 카테고리(${this.category})의 필수 요소를 지키는지 평가하고, 아쉬운 점을 신랄하게 비판하는 오답 노트를 작성하세요.`,
        });
        const critiqueFeedback = critiqueResult.text;

        // Step 3. Final Stream
        console.log(`[StoryboardAgent:${this.category}] Step 3: 최종 스토리보드 JSON 스트리밍...`);
        const outputManual = await loadOutputManual('writer');

        return streamObject({
            model: coreModel,
            schema: StoryboardSchema,
            prompt: `당신은 [최종 스토리보드 답안지 작성기]입니다. 카테고리: **${this.category.toUpperCase()}**

[스토리보드 초안]
${storyboardDraft}

[오답 노트 (피드백 반영 필수!)]
${critiqueFeedback}

[답안지 양식 (출력 매뉴얼)]
${outputManual}`,
        });
    }
}
