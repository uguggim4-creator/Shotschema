import { streamText } from 'ai';
import { createAgents } from '@/lib/ai/agents/AgentFactory';
import { SceneRefineAgent } from '@/lib/ai/agents/SceneRefineAgent';
import { PipelineState, ContentCategory, ScenarioPlan } from '@/lib/ai/memory/state-manager';
import { getModel, ModelId } from '@/lib/ai/model-factory';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { step } = body;
        const apiKey = process.env.COMET_API_KEY || '';

        const category: ContentCategory =
            (body.savedState?.category as ContentCategory) ||
            (body.category as ContentCategory) ||
            'film';

        const model: ModelId = body.model || 'gemini-3-flash';

        // AgentFactory: 카테고리에 맞는 에이전트 세트 생성
        const { idea, scenario, storyboard, prompt, reviewer } = createAgents(category, apiKey, model);

        if (step === 'baseline') {
            const streamResult = await streamText({
                model: getModel(model, apiKey),
                prompt: `당신은 작가입니다. 다음 아이디어를 바탕으로 짧은 영상 대본을 작성해주세요.\n\n[아이디어]: ${body.prompt}`,
            });
            return streamResult.toTextStreamResponse();
        }
        else if (step === 'idea') {
            const streamResult = await idea.generateIdeaStream(body.prompt);
            return streamResult.toTextStreamResponse();
        }
        else if (step === 'plot') {
            const streamResult = await idea.generatePlotStream(body.idea);
            return streamResult.toTextStreamResponse();
        }
        else if (step === 'scenario') {
            const state: PipelineState = body.savedState;
            if (!state?.plot) {
                return Response.json({ error: '이전 단계 줄거리(Plot)가 없습니다.' }, { status: 400 });
            }
            console.log('[scenario] state.plot:', state.plot?.substring(0, 50));
            const streamResult = await scenario.generatePlanStream(state);
            return streamResult.toTextStreamResponse();
        }
        else if (step === 'storyboard') {
            const state: PipelineState = body.savedState;
            if (!state?.plan) {
                return Response.json({ error: '이전 단계 기획안(Plan)이 없습니다.' }, { status: 400 });
            }
            const streamResult = await storyboard.generateStoryboardStream(state);
            return streamResult.toTextStreamResponse();
        }
        else if (step === 'prompt') {
            const state: PipelineState = body.savedState;
            if (!state?.storyboard) {
                return Response.json({ error: '이전 단계 스토리보드(Storyboard)가 없습니다.' }, { status: 400 });
            }
            const streamResult = await prompt.generatePromptsStream(state);
            return streamResult.toTextStreamResponse();
        }
        else if (step === 'review') {
            const state: PipelineState = body.savedState;
            if (!state?.plan || !state?.storyboard) {
                return Response.json({ error: '기획안과 스토리보드가 모두 필요합니다.' }, { status: 400 });
            }
            const reviewResult = await reviewer.reviewStoryboard(state);
            return Response.json(reviewResult);
        }
        else if (step === 'refine_scene') {
            const { plan, targetSceneNumber, instruction } = body;
            if (!plan || targetSceneNumber === undefined || !instruction) {
                return Response.json({ error: 'plan, targetSceneNumber, instruction이 필요합니다.' }, { status: 400 });
            }
            const refineAgent = new SceneRefineAgent(apiKey, model);
            const refinedScene = await refineAgent.refineScene(plan as ScenarioPlan, targetSceneNumber, instruction, category);
            return Response.json({ refinedScene });
        }
        else {
            return Response.json({ error: 'Invalid step' }, { status: 400 });
        }

    } catch (error: any) {
        console.error('API Error:', error);
        return Response.json({ error: error.message || 'Something went wrong.' }, { status: 500 });
    }
}
