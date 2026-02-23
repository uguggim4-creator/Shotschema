/**
 * AI 시나리오 작가 & 스토리보더 통합 아키텍처 예시 (Pseudo-code)
 * 
 * 1. Writer Agent: 시나리오 작성 (Part 1 준수)
 * 2. Storyboarder Agent: 시나리오를 바탕으로 샷 노트(Shot Notes) 작성 (Part 2 준수)
 */

import { GoogleGenAI } from '@google/genai';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Part 1: 시나리오 작법 가이드
const getPart1Guidelines = () => fs.readFileSync('./curriculum_part1.md', 'utf8');

// Part 2: 샷 노트 및 스토리보드 가이드
const getPart2Guidelines = () => fs.readFileSync('./curriculum_part2.md', 'utf8');

// --- 1단계: 시나리오 작성 ---
async function writeScenario(scenarioRequest) {
    console.log("\n--- [Phase 1] Writing Scenario ---");
    const systemInstruction = `당신은 천재적인 시나리오 작가입니다.\n\n[작법 가이드]\n${getPart1Guidelines()}`;
    const prompt = `[상황]: ${scenarioRequest}\n(작법 가이드를 엄격히 준수하여 지문과 대사로 된 시나리오 씬 하나를 작성하세요.)`;

    // (실제 API 호출 생략, 목업으로 대체)
    return `[시나리오 초안]\n(어두운 골목. 비가 거세게 내린다. 남자가 담배를 입에 문다. 라이터 불꽃이 켜지며 그의 흉터를 잠시 비춘다.)\n남자: "너무 늦었군."`;
}

// --- 2단계: 스토리보드 (샷 노트) 작성 ---
async function createShotNotes(scenario) {
    console.log("\n--- [Phase 2] Creating Shot Notes (Storyboard) ---");
    const systemInstruction = `당신은 마스터 촬영 감독(Cinematographer)입니다.\n\n[촬영 및 샷 노트 가이드]\n${getPart2Guidelines()}`;
    const prompt = `다음 [시나리오]를 읽고, 촬영 감독의 관점에서 가장 극적인 연출을 위한 샷 노트(Shot Notes)로 쪼개어 작성하세요.\n\n[시나리오]:\n${scenario}\n\n[요청사항]:\n렌즈 종류(mm), 카메라 앵글, 피사계 심도(Focus)를 명시하고, AI 비디오 프롬프트를 영어로 꼭 작성하세요.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3.0-flash',
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
            }
        });
        console.log(response.text);
        return response.text;
    } catch (error) {
        console.error("Error calling Gemini:", error);
    }
}

// 통합 파이프라인 실행
async function runFullPipeline(request) {
    const scenario = await writeScenario(request);
    console.log(scenario);

    const shotNotes = await createShotNotes(scenario);
}

const req = "형사와 살인마가 비 내리는 어두운 골목길에서 처음 대치하는 장면.";
runFullPipeline(req);
