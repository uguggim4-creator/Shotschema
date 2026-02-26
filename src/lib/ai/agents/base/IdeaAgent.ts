import { streamText, StreamTextResult } from 'ai';
import { getModel } from '../../model-factory';
import { loadCategoryManuals } from '../../manual-loader';
import { ContentCategory } from '../../memory/state-manager';

/** 카테고리별 콘텐츠 형식 지시어 */
export const categoryIdeaContext: Record<ContentCategory, string> = {
    film: '단편/장편 영화 또는 드라마 형식으로',
    ad: '15초~60초 분량의 상업 광고 형식으로, Hook(3초) → 문제/공감 → 제품 해결상 → CTA(행동 유도) 구조로',
    shorts: '60초 이내 유튜브/틱톡 숏폼 형식으로, 첫 3초 훅과 체류시간 극대화를 중심으로',
    drama: '드라마 시리즈 1화 형식으로, 에피소드 훅과 시즌 아크를 고려하여',
    animation: '애니메이션 형식으로, 비주얼 표현력과 캐릭터 디자인 잠재성을 중심으로',
};

export abstract class BaseIdeaAgent {
    protected abstract readonly category: ContentCategory;
    constructor(
        protected readonly apiKey: string,
        protected readonly model: string = 'gemini-3-flash'
    ) { }

    async generateIdeaStream(prompt: string): Promise<StreamTextResult<Record<string, never>, string>> {
        console.log(`[IdeaAgent:${this.category}] 아이디어 생성 (모델: ${this.model})`);
        const coreModel = getModel(this.model, this.apiKey);
        const ctx = categoryIdeaContext[this.category];
        const manuals = await loadCategoryManuals(this.category, 'idea');

        return streamText({
            model: coreModel,
            prompt: `당신은 영상 기획자입니다. 다음 요청을 바탕으로 **${ctx}** 아이디어를 1개 제안해주세요.
${manuals ? `\n--- [참고용 배경 지식] ---\n${manuals}\n--- [참고용 배경 지식 끝] ---` : ''}
[요청]: ${prompt}

반드시 아래 JSON 형식으로만 응답하세요. 다른 설명이나 마크다운(\`\`\`json 등)은 절대 쓰지 마세요:
{"director_notes": "(기획 의도 3단계 서술)", "title": "(임시 가제)", "logline": "(핵심 장면/감정을 담은 1~2줄)", "selling_point": "(경쟁 광고와 다른 단 한 가지 이유)"}`,
        });
    }

    async generatePlotStream(idea: string): Promise<StreamTextResult<Record<string, never>, string>> {
        console.log(`[IdeaAgent:${this.category}] 줄거리 생성 (모델: ${this.model})`);
        const coreModel = getModel(this.model, this.apiKey);
        const ctx = categoryIdeaContext[this.category];
        const manuals = await loadCategoryManuals(this.category, 'plot');

        return streamText({
            model: coreModel,
            prompt: `당신은 시나리오 작가입니다. 다음 아이디어를 바탕으로 **${ctx}** 줄거리(Plot)를 1개 제시해주세요.
${manuals ? `\n--- [참고용 배경 지식] ---\n${manuals}\n--- [참고용 배경 지식 끝] ---` : ''}
[선택된 아이디어]: ${idea}`,
        });
    }
}
