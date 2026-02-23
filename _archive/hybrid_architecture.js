/**
 * 시나리오 작가 개인화를 위한 RAG + Memory 요약 하이브리드 아키텍처 예시 (Pseudo-code)
 * 
 * 1. 시스템 프롬프트: 공통 노션 가이드라인 (시간, 공간, 푼크툼 등)
 * 2. Memory 요약: 유저의 '프로필' (자주 쓰는 톤, 대사 길이 등)
 * 3. RAG: 유저가 썼던 '과거 시나리오 데이터' 중 이번 상황과 가장 유사한 레퍼런스
 */

import { GoogleGenAI } from '@google/genai';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// 1. 공통 작법 가이드라인 (System Instruction)
const getCommonGuidelines = () => {
    return fs.readFileSync('./curriculum_part1.md', 'utf8');
};

// 2. Memory 요약 (User Profile - DB에서 가져온다고 가정)
const getUserMemorySummary = (userId) => {
    // 실제로는 DB 조회: SELECT writing_style_summary FROM users WHERE id = userId
    return `
[유저 개인화 메모리 요약]
- 선호 장르: 현대 로맨스, 약간의 우울감
- 대사 톤: 길게 설명하기보다 단답형으로 툭툭 던지는 대사 선호
- 지문 특징: 인물의 표정보다 날씨(비, 흐림, 역광 등)를 통해 감정을 묘사하는 것을 즐김
- 금지 사항: 오열하거나 소리 지르는 감정 과잉 묘사는 극도로 혐오함
`;
};

// 3. RAG (과거 레퍼런스 검색 - Vector DB에서 가져온다고 가정)
const getRagSimilarScenes = (scenarioRequest) => {
    // 실제로는 Pinecone, ChromaDB 같은 Vector DB에 쿼리를 날려서 유사도(Cosine Similarity)가 높은 과거 대본을 2~3개 가져옴
    return `
[유저가 과거에 작성했던 유사한 씬 레퍼런스(RAG)]
- 레퍼런스 1 (카페 씬): "커피잔 테두리를 만지작거리던 남자가 헛기침을 한다. 창밖으로는 소나기가 유리를 거칠게 치고 있다. (남자: '비가... 많이 오네.')"
- 레퍼런스 2 (재회 씬): "우산이 없는 여자는 정류장 처마 끝에 서서 구두 코만 내려다보고 있다. 옆에 다가온 이의 젖은 운동화를 보고도 고개를 들지 않는다."
`;
};

// 메인 프롬프트 조립 및 생성
async function generatePersonalizedScenario(userId, scenarioRequest) {
    console.log("--- 하이브리드 구조 생성 시작 (System + Memory + RAG) ---");

    const commonGuideline = getCommonGuidelines();
    const memorySummary = getUserMemorySummary(userId);
    const ragData = getRagSimilarScenes(scenarioRequest);

    const systemInstruction = `
당신은 최고의 영화 감독이자 시나리오 작가입니다. 
다음 [공통 작법 가이드]를 기본기로 탑재한 상태에서, [유저 개인화 메모리]와 [과거 레퍼런스]를 완벽하게 흉내 내어 시나리오를 작성하십시오.

[공통 작법 가이드]
${commonGuideline}

${memorySummary}

${ragData}
    `;

    const prompt = `작가의 관점과 개인화된 스타일을 똑같이 적용하여, 다음 상황에 대한 씬(Scene)을 작성하세요.\n\n[이번에 써야 할 상황]: ${scenarioRequest}`;

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

// 실행 예시
const testRequest = "늦은 밤, 불 꺼진 사무실에서 두 남녀가 야근을 하다가 우연히 손이 닿는 장면.";
generatePersonalizedScenario("user_123", testRequest);
