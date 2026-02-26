import { streamText } from 'ai';
import { createAgents } from '@/lib/ai/agents/AgentFactory';
import { SceneRefineAgent } from '@/lib/ai/agents/SceneRefineAgent';
import { PipelineState, ContentCategory, ScenarioPlan } from '@/lib/ai/memory/state-manager';
import { getModel, ModelId } from '@/lib/ai/model-factory';

const ALLOWED_ORIGINS = [
    'https://www.ainspire.co.kr',
    'https://ainspire.co.kr',
    'https://shotschema-dmdu.vercel.app',
    'http://localhost:3000',
];

function corsHeaders(origin: string | null) {
    const allowed = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
    return {
        'Access-Control-Allow-Origin': allowed,
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };
}

// OPTIONS preflight
export async function OPTIONS(req: Request) {
    const origin = req.headers.get('origin');
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
}


export async function POST(req: Request) {
    const origin = req.headers.get('origin');
    const cors = corsHeaders(origin);
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
            return streamResult.toTextStreamResponse({ headers: cors });
        }
        else if (step === 'idea') {
            const streamResult = await idea.generateIdeaStream(body.prompt);
            return streamResult.toTextStreamResponse({ headers: cors });
        }
        else if (step === 'plot') {
            const streamResult = await idea.generatePlotStream(body.idea);
            return streamResult.toTextStreamResponse({ headers: cors });
        }
        else if (step === 'scenario') {
            const state: PipelineState = body.savedState;
            if (!state?.plot) {
                return Response.json({ error: '이전 단계 줄거리(Plot)가 없습니다.' }, { status: 400, headers: cors });
            }
            console.log('[scenario] state.plot:', state.plot?.substring(0, 50));
            const streamResult = await scenario.generatePlanStream(state);
            return streamResult.toTextStreamResponse({ headers: cors });
        }
        else if (step === 'storyboard') {
            const state: PipelineState = body.savedState;
            if (!state?.plan) {
                return Response.json({ error: '이전 단계 기획안(Plan)이 없습니다.' }, { status: 400, headers: cors });
            }
            const streamResult = await storyboard.generateStoryboardStream(state);
            return streamResult.toTextStreamResponse({ headers: cors });
        }
        else if (step === 'prompt') {
            const state: PipelineState = body.savedState;
            if (!state?.storyboard) {
                return Response.json({ error: '이전 단계 스토리보드(Storyboard)가 없습니다.' }, { status: 400, headers: cors });
            }
            const streamResult = await prompt.generatePromptsStream(state);
            return streamResult.toTextStreamResponse({ headers: cors });
        }
        else if (step === 'review') {
            const state: PipelineState = body.savedState;
            if (!state?.plan || !state?.storyboard) {
                return Response.json({ error: '기획안과 스토리보드가 모두 필요합니다.' }, { status: 400, headers: cors });
            }
            const reviewResult = await reviewer.reviewStoryboard(state);
            return Response.json(reviewResult, { headers: cors });
        }
        else if (step === 'refine_scene') {
            const { plan, targetSceneNumber, instruction } = body;
            if (!plan || targetSceneNumber === undefined || !instruction) {
                return Response.json({ error: 'plan, targetSceneNumber, instruction이 필요합니다.' }, { status: 400, headers: cors });
            }
            const refineAgent = new SceneRefineAgent(apiKey, model);
            const refinedScene = await refineAgent.refineScene(plan as ScenarioPlan, targetSceneNumber, instruction, category);
            return Response.json({ refinedScene }, { headers: cors });
        }
        else {
            return Response.json({ error: 'Invalid step' }, { status: 400, headers: cors });
        }

    } catch (error: any) {
        console.error('API Error:', error);
        return Response.json({ error: error.message || 'Something went wrong.' }, { status: 500, headers: cors });
    }
}
