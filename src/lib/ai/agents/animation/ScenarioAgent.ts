// animation/ScenarioAgent.ts - 3-step Reflexion (캐릭터/세계관 중심)
import { streamObject, generateText } from 'ai';
import { loadCategoryManuals, loadGuidelines, loadOutputManual } from '../../manual-loader';
import { getModel } from '../../model-factory';
import { PipelineState, ScenarioPlanSchema } from '../../memory/state-manager';

export class ScenarioAgent {
    readonly category = 'animation' as const;
    constructor(
        private readonly apiKey: string,
        private readonly model: string = 'gemini-3-flash'
    ) { }

    async generatePlanStream(state: PipelineState) {
        console.log(`[ScenarioAgent:animation] 기획안 생성 (모델: ${this.model})`);
        const coreModel = getModel(this.model, this.apiKey);
        const manuals = await loadCategoryManuals('animation', 'scenario');
        const outputManual = await loadOutputManual('planner');

        const draftResult = await generateText({
            model: coreModel,
            prompt: `당신은 [애니메이션 기획 에이전트]입니다. 카테고리: **ANIMATION**
${manuals ? `\n[애니메이션 카테고리 전용 기획 작법]\n${manuals}` : ''}
[확정된 줄거리(Plot)]\n${state.plot}

캐릭터 원형 설계, 세계관 일관성, 비주얼 메타포를 우선시하여 초안을 작성하세요.`,
        });
        const storyDraft = draftResult.text;

        const critiqueResult = await generateText({
            model: coreModel,
            prompt: `당신은 [애니메이션 기획 채점관]입니다. 카테고리: **ANIMATION**
다음 초안이 캐릭터 매력, 세계관 논리, 비주얼 상상력을 갖추는지 평가하고 오답 노트를 작성하세요.
[초안]\n${storyDraft}`,
        });

        return streamObject({
            model: coreModel,
            schema: ScenarioPlanSchema,
            prompt: `당신은 [최종 기획 답안지 작성기]입니다. 카테고리: **ANIMATION**
[초안]\n${storyDraft}
[오답 노트]\n${critiqueResult.text}
[출력 양식]\n${outputManual}`,
        });
    }
}
