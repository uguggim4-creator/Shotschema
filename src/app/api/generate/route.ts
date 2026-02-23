import { GoogleGenerativeAI } from '@google/generative-ai';
import * as fs from 'fs';
import * as path from 'path';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const loadAllGuidelines = () => {
    let allRules = "";
    const guidelinesPath = path.join(process.cwd(), 'src', 'lib', 'guidelines');
    for (let i = 1; i <= 6; i++) {
        try {
            allRules += fs.readFileSync(path.join(guidelinesPath, `curriculum_part${i}.md`), 'utf8') + "\n\n";
        } catch (e) {
            console.warn(`Warning: Could not load curriculum_part${i}.md`);
        }
    }
    return allRules;
};

export async function POST(req: Request) {
    try {
        const { prompt } = await req.json();

        if (!prompt) {
            return Response.json({ error: 'Prompt is required' }, { status: 400 });
        }

        const systemGuidelines = loadAllGuidelines();

        // Phase 1
        const writerInstruction = `당신은 현존하는 최고의 마스터 영화 감독이자 시나리오 작가입니다.\n\n[디렉팅 마스터 가이드라인 (Part 1 ~ 6)]\n다음 원칙들을 뼈 깊숙이 숙지하고, 모든 시나리오와 연출에 '반드시' 적용하십시오.\n\n${systemGuidelines}`;

        const writerModel = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            systemInstruction: writerInstruction
        });

        const scenarioPrompt = `[요청 상황]: ${prompt}\n\n(위의 [디렉팅 마스터 가이드라인]을 엄격히 준수하여, 긴장감 넘치고 영화적인 시나리오 씬(Scene) 하나를 한국어로 구체적이고 생생하게 작성하세요. 뻔한 클리셰는 피하십시오.)`;

        const scenarioResponse = await writerModel.generateContent(scenarioPrompt);
        const scenario = scenarioResponse.response.text();

        // Phase 2
        const storyboarderInstruction = `당신은 마스터 촬영 감독(Cinematographer)이자 전설적인 편집자(Editor)입니다.\n\n[디렉팅 마스터 가이드라인 (Part 1 ~ 6)]\n다음 원칙들을 철저히 숙지하십시오.\n\n${systemGuidelines}`;

        const storyboarderModel = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            systemInstruction: storyboarderInstruction
        });

        const shotNotesPrompt = `다음 [작성된 시나리오]를 바탕으로, 가장 극적이고 긴장감 넘치는 연출을 위해 샷 노트(Shot Notes)로 쪼개어 작성하세요.\n\n[작성된 시나리오]:\n${scenario}\n\n[요청사항]:\n1. 각 샷마다 렌즈 종류(mm), 카메라 무브먼트(Pan/Tilt/Push-in 등), 피사계 심도, 조명과 색채를 명시하세요.\n2. 월터 머치의 6원칙과 히치콕의 서스펜스(인서트 샷), 매치 컷을 적극 활용하세요.\n3. 각 샷의 마지막에는 영상 생성 AI를 위한 [AI Video Prompt (English)]를 구체적으로 작성하세요.`;

        const shotNotesResponse = await storyboarderModel.generateContent(shotNotesPrompt);
        const shotNotes = shotNotesResponse.response.text();

        return Response.json({ scenario, shotNotes });

    } catch (error: any) {
        console.error("API Error:", error);
        return Response.json({ error: error.message || 'Something went wrong.' }, { status: 500 });
    }
}
