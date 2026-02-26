import { generateObject } from 'ai';
import { z } from 'zod';
import { getModel } from '../model-factory';
import { ScenePlanSchema, ScenarioPlan } from '../memory/state-manager';
import { ContentCategory } from '../memory/state-manager';

/**
 * SceneRefineAgent: 전체 기획안 컨텍스트를 유지하면서 특정 씬만 수정합니다.
 * 일관성 보장 전략: 전체 씬 목록 + 앞뒤 씬 + 로그라인/무드를 모두 제공.
 */
export class SceneRefineAgent {
    constructor(
        private readonly apiKey: string,
        private readonly model: string = 'gemini-3-flash'
    ) { }

    async refineScene(
        plan: ScenarioPlan,
        targetSceneNumber: number,
        instruction: string,
        category: ContentCategory = 'film'
    ): Promise<z.infer<typeof ScenePlanSchema>> {
        console.log(`[SceneRefineAgent] 씬 ${targetSceneNumber} 수정 요청 (카테고리: ${category})`);
        const coreModel = getModel(this.model, this.apiKey);

        const targetScene = plan.scenes.find(s => s.sceneNumber === targetSceneNumber);
        if (!targetScene) throw new Error(`[SceneRefineAgent] 씬 ${targetSceneNumber}을 찾을 수 없습니다.`);

        const prevScene = plan.scenes.find(s => s.sceneNumber === targetSceneNumber - 1);
        const nextScene = plan.scenes.find(s => s.sceneNumber === targetSceneNumber + 1);

        // 전체 씬 흐름 요약 (앞뒤 맥락용)
        const sceneSummary = plan.scenes.map(s =>
            `[Scene ${s.sceneNumber}] ${s.location} / ${s.time} — ${s.description.slice(0, 60)}…`
        ).join('\n');

        const prompt = `당신은 시나리오 씬 수정 에이전트입니다. 카테고리: **${category.toUpperCase()}**

## [전체 이야기 컨텍스트] — 이 범위를 절대 벗어나지 마세요
- **로그라인**: ${plan.logline}
- **전체 무드/톤**: ${plan.moodAndTone}
- **전체 씬 흐름**:
${sceneSummary}

## [수정 대상 씬: Scene ${targetSceneNumber}]
- location: ${targetScene.location}
- time: ${targetScene.time}
- description: ${targetScene.description}
- directorIntention: ${targetScene.directorIntention}

${prevScene ? `## [직전 씬: Scene ${prevScene.sceneNumber}]
description: ${prevScene.description}` : ''}

${nextScene ? `## [직후 씬: Scene ${nextScene.sceneNumber}]
description: ${nextScene.description}` : ''}

## [수정 지시사항]
${instruction}

## [제약 조건]
1. 수정 후에도 전체 무드/톤(${plan.moodAndTone})에서 벗어나지 마세요
2. ${prevScene ? `직전 씬(Scene ${prevScene.sceneNumber})의 감정선과 자연스럽게 연결되어야 합니다` : '첫 씬이므로 오프닝 훅으로서 강력하게'}
3. ${nextScene ? `직후 씬(Scene ${nextScene.sceneNumber})으로 자연스럽게 이어지도록` : '마지막 씬이므로 전체 이야기의 결말을 향해'}
4. 다른 씬의 캐릭터 설정, 장소, 시간대와 충돌하지 마세요
5. sceneNumber는 ${targetSceneNumber}으로 고정합니다

위 제약을 지키면서 수정 지시사항을 반영한 새로운 씬을 작성하세요.`;

        const result = await generateObject({
            model: coreModel,
            schema: ScenePlanSchema,
            prompt,
        });

        console.log(`[SceneRefineAgent] 씬 ${targetSceneNumber} 수정 완료`);
        return result.object;
    }
}
