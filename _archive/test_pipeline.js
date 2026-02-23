/**
 * AI 시나리오 작가 & 스토리보더 통합 파이프라인 (Part 1 ~ Part 6 적용)
 * 
 * 1. Writer Agent: 시나리오 작성 (전체 가이드라인 준수)
 * 2. Storyboarder Agent: 샷 단위로 쪼개고 AI 프롬프트 작성
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

dotenv.config();

// Initialize the Google Generative AI with your API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // You can switch to gemini-2.0-flash or pro if available

// 6개의 커리큘럼 문서를 모두 불러와 하나의 거대한 시스템 가이드라인으로 병합
const loadAllGuidelines = () => {
    let allRules = "";
    for (let i = 1; i <= 6; i++) {
        try {
            allRules += fs.readFileSync(`./curriculum_part${i}.md`, 'utf8') + "\n\n";
        } catch (e) {
            console.warn(`Warning: Could not load curriculum_part${i}.md`);
        }
    }
    return allRules;
};

const systemGuidelines = loadAllGuidelines();

// --- 1단계: 시나리오 작성 ---
async function writeScenario(scenarioRequest) {
    console.log("\n=======================================================");
    console.log("             [Phase 1] Writing Scenario                ");
    console.log("=======================================================\n");

    const systemInstruction = `당신은 현존하는 최고의 마스터 영화 감독이자 시나리오 작가입니다.\n\n[디렉팅 마스터 가이드라인 (Part 1 ~ 6)]\n다음 원칙들을 뼈 깊숙이 숙지하고, 모든 시나리오와 연출에 '반드시' 적용하십시오.\n\n${systemGuidelines}`;

    // Create a specific model instance with system instructions
    const writerModel = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
        systemInstruction: systemInstruction
    });

    const prompt = `[요청 상황]: ${scenarioRequest}\n\n(위의 [디렉팅 마스터 가이드라인]을 엄격히 준수하여, 긴장감 넘치고 영화적인 시나리오 씬(Scene) 하나를 한국어로 구체적이고 생생하게 작성하세요. 뻔한 클리셰는 피하십시오.)`;

    try {
        const response = await writerModel.generateContent(prompt);
        const scenario = response.response.text();
        console.log(scenario);
        return scenario;
    } catch (error) {
        console.error("Scenraio Generation Error:", error);
        return null;
    }
}

// --- 2단계: 스토리보드 (샷 노트) 작성 ---
async function createShotNotes(scenario) {
    console.log("\n=======================================================");
    console.log("          [Phase 2] Creating Shot Notes                ");
    console.log("=======================================================\n");

    const systemInstruction = `당신은 마스터 촬영 감독(Cinematographer)이자 전설적인 편집자(Editor)입니다.\n\n[디렉팅 마스터 가이드라인 (Part 1 ~ 6)]\n다음 원칙들을 철저히 숙지하십시오.\n\n${systemGuidelines}`;

    const storyboarderModel = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
        systemInstruction: systemInstruction
    });

    const prompt = `다음 [작성된 시나리오]를 바탕으로, 가장 극적이고 긴장감 넘치는 연출을 위해 샷 노트(Shot Notes)로 쪼개어 작성하세요.\n\n[작성된 시나리오]:\n${scenario}\n\n[요청사항]:\n1. 각 샷마다 렌즈 종류(mm), 카메라 무브먼트(Pan/Tilt/Push-in 등), 피사계 심도, 조명과 색채를 명시하세요.\n2. 월터 머치의 6원칙과 히치콕의 서스펜스(인서트 샷), 매치 컷을 적극 활용하세요.\n3. 각 샷의 마지막에는 영상 생성 AI를 위한 [AI Video Prompt (English)]를 구체적으로 작성하세요.`;

    try {
        const response = await storyboarderModel.generateContent(prompt);
        console.log(response.response.text());
        return response.response.text();
    } catch (error) {
        console.error("Shot Notes Generation Error:", error);
    }
}

// 스크립트 실행
async function runAutoPipeline() {
    const request = "어두운 골목 끝 작은 심야 식당. 10년 전 서로의 등에 칼을 꽂았던 두 조직원이 우연히 양옆 자리에 앉아 국수를 먹고 있다. 서로를 알아차린 직후의 숨 막히는 침묵과 이별.";

    console.log(`요청된 상황: "${request}"\nGenAI 모델 구동 중...`);
    const scenario = await writeScenario(request);

    if (scenario) {
        await createShotNotes(scenario);
    }
}

runAutoPipeline();
