import { generateObject } from 'ai';
import { loadManual } from '../manual-loader';
import { getModel } from '../model-factory';
import { PipelineState } from '../memory/state-manager';
import { z } from 'zod';

export const ReviewResultSchema = z.object({
    isPass: z.boolean().describe('매뉴얼 기준을 충족하여 합격했는지 여부'),
    score: z.number().describe('100점 만점 기준 품질 점수'),
    feedback: z.string().describe('불합격 시 스토리보드 작가가 수정해야 할 구체적인 위치와 피드백'),
});

export class ReviewAgent {
    constructor(
        private readonly apiKey: string,
        private readonly model: string = 'gemini-3-flash'
    ) { }

    async reviewStoryboard(state: PipelineState): Promise<z.infer<typeof ReviewResultSchema>> {
        console.log('[ReviewAgent] 스토리보드 품질 자동 검사를 시작합니다...');

        if (!state.storyboard || !state.plan) {
            throw new Error('[ReviewAgent] 기획안이나 스토리보드가 누락되었습니다.');
        }

        const coreModel = getModel(this.model, this.apiKey);
        const writerManual = await loadManual('writer');

        const context = JSON.stringify({
            userIntention: state.originalUserInput,
            planLogline: state.plan.logline,
            storyboard: state.storyboard,
        }, null, 2);

        const reviewPrompt = `
당신은 [스토리보드 검수 품질 에이전트(QualityReviewer)]입니다.
아래의 [초기 기획안 및 스토리보드 결과물]이 [스토리보드 매뉴얼]의 지시사항을 완벽하게 따랐는지 엄격하게 심사하십시오.

[초기 기획안 및 스토리보드 결과물]
${context}

[평가 기준 매뉴얼]
${writerManual}

[평가 지시사항]
1. 평범하거나 평면적인 연출('단순한 풀샷', '평범한 앵글')이 남발되었다면 불합격(isPass: false) 처리하십시오.
2. 렌즈(mm)나 앵글(High/Low) 등 구체적인 전문 용어가 비어있는 샷이 있다면 피드백에 지적하십시오.
    `;

        const result = await generateObject({
            model: coreModel,
            schema: ReviewResultSchema,
            prompt: reviewPrompt,
        });

        console.log(`[ReviewAgent] 검수 완료. 합격 여부: ${result.object.isPass}, 점수: ${result.object.score}`);
        return result.object;
    }
}
