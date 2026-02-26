// ad/ScenarioAgent.ts - 1-step Direct (광고는 짧으므로 reflexion 불필요)
import { streamObject } from 'ai';
import { loadCategoryManuals, loadOutputManual } from '../../manual-loader';
import { getModel } from '../../model-factory';
import { PipelineState, ScenarioPlanSchema } from '../../memory/state-manager';

export class ScenarioAgent {
    readonly category = 'ad' as const;
    constructor(
        private readonly apiKey: string,
        private readonly model: string = 'gemini-3-flash'
    ) { }

    async generatePlanStream(state: PipelineState) {
        console.log(`[ScenarioAgent:ad] 기획안 생성 (모델: ${this.model})`);
        const coreModel = getModel(this.model, this.apiKey);

        // ① 확정된 파라미터 읽기 (추론 금지)
        const duration = state.adDuration ?? 30;
        const level = state.adLevel ?? 1;

        // ② 학습 자료 로드 — ad/scenario/ 폴더만 (이미지 프롬프트 가이드 제외)
        const manuals = await loadCategoryManuals('ad', 'scenario');
        const outputManual = await loadOutputManual('planner');

        return streamObject({
            model: coreModel,
            schema: ScenarioPlanSchema,
            prompt: `당신은 [광고 시나리오 기획 에이전트]입니다. 카테고리: **AD**

[운영 원칙 — 반드시 준수]
- 이 프롬프트의 가이드 내용을 출력에 설명하거나 언급하지 마라.
- 메타 분석("이 광고는 Level 1..."), 가이드 요약, 체크리스트 확인 문구를 절대 쓰지 마라.
- 오직 결과물(시나리오)만 출력한다.

[확정된 광고 파라미터 — 추론 금지, 그대로 적용]
- 광고 길이(adDuration): **${duration}초**
- 연출 수위(adLevel): **Level ${level}** (${level === 1 ? '사실적 공감 — 일상 배경, 자연광, 실제 인물' : level === 2 ? '은유/비유 — 시각적 메타포 허용' : '초현실 — 판타지/추상 비주얼'})

[Duration별 구조 — 강제 적용]
${duration === 15 ? `15초 광고: 3비트 구조
  - 비트1 (0~3초): Hook (즉각적 주의 집중)
  - 비트2 (3~11초): 제품+해결, Hero Shot 최소 2초 (완화 규칙)
  - 비트3 (11~15초): CTA + 로고
  - 씬 수: 최대 3씬` :
                    duration === 30 ? `30초 광고: 4비트 구조
  - 비트1 (0~3초): Hook
  - 비트2 (3~8초): 문제/공감
  - 비트3 (8~22초): 제품+해결, Hero Shot 최소 3초
  - 비트4 (22~30초): CTA + 로고
  - 씬 수: 3~5씬` :
                        `60초 광고: 5비트 구조
  - 비트1 (0~5초): Hook/공감
  - 비트2 (5~20초): 문제 심화
  - 비트3 (20~45초): 제품+해결, Hero Shot 3~5초
  - 비트4 (45~55초): 감정 클라이막스/결과
  - 비트5 (55~60초): CTA + 로고 + Tagline 자막
  - 씬 수: 5~8씬`}

[우선순위 — 충돌 시 이 순서]
1위: 광고 길이 제약 (${duration}초 절대 준수)
2위: CTA 필수 포함
3위: 제품/브랜드 노출 (Hero Shot 필수)
4위: Level ${level} 연출 수위 준수
5위: 감성/비유 연출 (Level 1이면 최소화)

[광고 기획 참고 자료]
${manuals}

[확정된 줄거리(Plot)]
${state.plot}

[답안지 양식 (출력 매뉴얼)]
${outputManual}`,
        });
    }
}
