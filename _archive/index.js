import { GoogleGenAI } from '@google/genai';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

dotenv.config();

// Initialize the Gemini API client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Load the curriculum rules to use as system instructions
const loadRules = () => {
    try {
        return fs.readFileSync('./curriculum_part1.md', 'utf8');
    } catch (error) {
        console.error("Error loading curriculum rules:", error);
        return "You are an expert scenario writer."; // Fallback
    }
};

const rules = loadRules();

// Helper function to call the Gemini API
async function callGemini(prompt, systemInstruction = rules) {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3.0-flash', // Using gemini-3.0 as requested
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
            }
        });
        return response.text;
    } catch (error) {
        console.error("Error calling Gemini:", error);
        throw error;
    }
}

// 1. Writer Agent: Creates the initial draft
async function writeDraft(scenarioRequest) {
    console.log("--- 1. [Writer] Drafting Initial Script ---");
    const prompt = `작가의 관점에서 다음 상황에 대한 시나리오 초안을 작성하세요.\n\n[상황]: ${scenarioRequest}\n\n(반드시 제공된 시스템 원칙(시간의 묘사, 공간 배치, 보이지 않는 소리, 푼크툼)을 지키며, 생생하고 디테일한 영화적 지문과 대사로 작성하세요.)`;
    const draft = await callGemini(prompt);
    console.log(draft + "\n\n");
    return draft;
}

// 2. Reviewer Agent: Critiques the draft based on the rules
async function reviewDraft(draft) {
    console.log("--- 2. [Reviewer] Critiquing the Script ---");
    const prompt = `당신은 까다롭고 천재적인 영화 감독입니다. 다음 [시나리오 초안]을 읽고, 당신의 [디렉팅 원칙(시스템 인스트럭션)]을 기준으로 하나하나 대조하며 날카롭게 평가하세요.\n\n[시나리오 초안]:\n${draft}\n\n[평가 항목]:\n1. 시간의 압박감이 지문에 잘 느껴지는가?\n2. 공간과 프레임이 인물의 심리를 압박하고 있는가?\n3. 화면 밖의 소리나 공기감이 상상력을 자극하는가?\n4. 뻔한 상징이 아닌 '푼크툼(가장 날카롭게 찌르는 개인적 디테일)'이 묘사되었는가?\n\n개선해야 할 구체적인 피드백을 작성하세요.`;
    const feedback = await callGemini(prompt);
    console.log(feedback + "\n\n");
    return feedback;
}

// 3. Reviser Agent: Rewrites the draft based on the review
async function reviseDraft(draft, feedback) {
    console.log("--- 3. [Reviser] Writing Final Polish Script ---");
    const prompt = `다음 [시나리오 초안]을 감독의 [피드백]을 완벽하게 반영하여 재작성(수정)하세요. 지문은 더욱 세밀하게, 텐션은 더 높게 끌어올려야 합니다.\n\n[시나리오 초안]:\n${draft}\n\n[감독의 피드백]:\n${feedback}\n\n(최종본만 출력하세요)`;
    const finalScript = await callGemini(prompt);
    console.log(finalScript + "\n\n");
    return finalScript;
}

// Main Workflow function
async function runScenarioWorkflow(scenarioRequest) {
    try {
        const draft = await writeDraft(scenarioRequest);
        const feedback = await reviewDraft(draft);
        const finalScript = await reviseDraft(draft, feedback);
        
        console.log("=== Workflow Completed Successfully ===");
        // You can save the output to files here if needed
        fs.writeFileSync('./latest_draft.md', draft);
        fs.writeFileSync('./latest_feedback.md', feedback);
        fs.writeFileSync('./latest_final_script.md', finalScript);

    } catch (error) {
         console.error("Workflow failed:", error);
    }
}

// --- Execute Workflow ---
// Example usage: You can replace this string with whatever prompt the user wants.
const userPrompt = "두 남녀가 10년 만에 우연히 비를 피해 들어온 낡은 카페에서 마주치는 장면. 여자는 곧 결혼을 앞두고 있고, 남자는 여전히 그녀를 잊지 못했다.";
runScenarioWorkflow(userPrompt);
