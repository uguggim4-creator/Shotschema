// shorts/ScenarioAgent.ts - 1-step + 포맷 제약 (60초 이내)
import { streamObject } from 'ai';
import { loadCategoryManuals, loadOutputManual } from '../../manual-loader';
import { getModel } from '../../model-factory';
import { PipelineState, ScenarioPlanSchema } from '../../memory/state-manager';

export class ScenarioAgent {
    readonly category = 'shorts' as const;
    constructor(
        private readonly apiKey: string,
        private readonly model: string = 'gemini-3-flash'
    ) { }

    async generatePlanStream(state: PipelineState) {
        console.log(`[ScenarioAgent:shorts] 기획안 생성 (모델: ${this.model})`);
        const coreModel = getModel(this.model, this.apiKey);

        const manuals = await loadCategoryManuals('shorts', 'scenario');
        const outputManual = await loadOutputManual('planner');

        // 숏폼: 1-step 직접 생성 + 포맷 제약 명시
        return streamObject({
            model: coreModel,
            schema: ScenarioPlanSchema,
            prompt: `당신은 [숏폼 시나리오 기획 에이전트]입니다. 카테고리: **SHORTS**

[숏폼 카테고리 전용 기획 작법]
${manuals}

아래 줄거리를 기반으로 숏폼 콘텐츠를 기획하세요.

⚠️ 포맷 제약:
- 전체 러닝타임: 60초 이내 (유튜브 쇼츠/틱톡 기준)
- 첫 1~3초: 반드시 강력한 훅(Hook)으로 시작
- 끝: 공유/저장을 유도하는 마무리 또는 루프 가능한 구조
- 장면은 최소화하고 템포는 빠르게

[확정된 줄거리(Plot)]
${state.plot}

[답안지 양식 (출력 매뉴얼)]
${outputManual}`,
        });
    }
}
