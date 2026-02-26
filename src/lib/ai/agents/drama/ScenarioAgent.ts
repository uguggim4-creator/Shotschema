// drama/ScenarioAgent.ts - 3-step Reflexion (드라마 시리즈용)
import { streamObject, generateText } from 'ai';
import { loadCategoryManuals, loadGuidelines, loadOutputManual } from '../../manual-loader';
import { getModel } from '../../model-factory';
import { PipelineState, ScenarioPlanSchema } from '../../memory/state-manager';

export class ScenarioAgent {
    readonly category = 'drama' as const;
    constructor(
        private readonly apiKey: string,
        private readonly model: string = 'gemini-3-flash'
    ) { }

    async generatePlanStream(state: PipelineState) {
        console.log(`[ScenarioAgent:drama] 기획안 생성 (모델: ${this.model})`);
        const coreModel = getModel(this.model, this.apiKey);
        const manuals = await loadCategoryManuals('drama', 'scenario');
        const backgroundTheories = await loadGuidelines(['film/scenario/film_writing_guide.md']);
        const outputManual = await loadOutputManual('planner');

        const draftResult = await generateText({
            model: coreModel,
            prompt: `당신은 [드라마 시리즈 기획 에이전트]입니다. 카테고리: **DRAMA**
${manuals ? `\n[드라마 카테고리 전용 기획 작법]\n${manuals}` : ''}
[드라마 작법 배경 이론]\n${backgroundTheories}
[확정된 줄거리(Plot)]\n${state.plot}

에피소드 훅, 시즌 아크, 클리프행어를 고려하여 1화 기획안 초안을 작성하세요.`,
        });
        const storyDraft = draftResult.text;

        const critiqueResult = await generateText({
            model: coreModel,
            prompt: `당신은 [드라마 기획 채점관]입니다. 카테고리: **DRAMA**
다음 초안이 드라마 시리즈 1화로서의 필수 요소(에피소드 훅, 관계망 설정, 클리프행어)를 갖추는지 평가하고 오답 노트를 작성하세요.
[초안]\n${storyDraft}`,
        });

        return streamObject({
            model: coreModel,
            schema: ScenarioPlanSchema,
            prompt: `당신은 [최종 기획 답안지 작성기]입니다. 카테고리: **DRAMA**
[초안]\n${storyDraft}
[오답 노트]\n${critiqueResult.text}
[출력 양식]\n${outputManual}`,
        });
    }
}
