// film/ScenarioAgent.ts - 3-step Reflexion + 장르 템플릿 (Full Pipeline)
import { streamObject, generateText } from 'ai';
import { loadFilmScenarioManual, loadGuidelines, loadOutputManual } from '../../manual-loader';
import { getModel } from '../../model-factory';
import { PipelineState, ScenarioPlanSchema } from '../../memory/state-manager';

export class ScenarioAgent {
    readonly category = 'film' as const;
    constructor(
        private readonly apiKey: string,
        private readonly model: string = 'gemini-3-flash'
    ) { }

    async generatePlanStream(state: PipelineState) {
        console.log(`[ScenarioAgent:film] 기획안 생성 (모델: ${this.model})`);
        const coreModel = getModel(this.model, this.apiKey);

        // film 전용: Save the Cat 15비트 + 장르 템플릿
        const plannerManual = await loadFilmScenarioManual(
            (state.originalUserInput ?? '') + ' ' + (state.plot ?? ''),
            this.apiKey
        );
        const backgroundTheories = await loadGuidelines(['film/scenario/film_writing_guide.md']);

        // Step 1. Draft
        console.log('[ScenarioAgent:film] Step 1: 초안(Draft) 작성 중...');
        const draftResult = await generateText({
            model: coreModel,
            prompt: `당신은 [시나리오 기획 에이전트]입니다. 카테고리: **FILM**

[연출/작법 배경 이론]
${backgroundTheories}

[FILM 카테고리 전용 기획 작법 (Save the Cat 15비트 + 장르 템플릿)]
${plannerManual}

위 지식을 바탕으로 아래 줄거리를 자유로운 시나리오 초안으로 작성하세요.
[확정된 줄거리(Plot)]
${state.plot}`,
        });
        const storyDraft = draftResult.text;

        // Step 2. Critique
        console.log('[ScenarioAgent:film] Step 2: 자가 채점(Critique) 중...');
        const critiqueResult = await generateText({
            model: coreModel,
            prompt: `당신은 냉철한 [시나리오 검수 및 채점관]입니다. 카테고리: **FILM**

[채점 기준표]
${backgroundTheories}
${plannerManual}

[시나리오 초안]
${storyDraft}

이 초안이 FILM 카테고리의 필수 요소(Save the Cat 15비트 등)를 지키는지 평가하고, 신랄하게 오답 노트를 작성하세요.`,
        });
        const critiqueFeedback = critiqueResult.text;

        // Step 3. Final JSON
        console.log('[ScenarioAgent:film] Step 3: 최종 기획안 JSON 스트리밍...');
        const outputManual = await loadOutputManual('planner');

        return streamObject({
            model: coreModel,
            schema: ScenarioPlanSchema,
            prompt: `당신은 [최종 기획 답안지 작성기]입니다. 카테고리: **FILM**

[시나리오 초안]
${storyDraft}

[오답 노트 (피드백 반영 필수!)]
${critiqueFeedback}

[답안지 양식 (출력 매뉴얼)]
${outputManual}`,
        });
    }
}
