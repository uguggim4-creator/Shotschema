import { loadDynamicPlannerManual } from './src/lib/ai/manual-loader';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
    console.log("Testing Dynamic Manual Loader...");
    const apiKey = process.env.GEMINI_API_KEY || '';
    if (!apiKey) {
        console.error("No API KEY");
        return;
    }

    const result = await loadDynamicPlannerManual("우주에서 벌어지는 외계인과의 생존 사투, 주인공은 평범한 수리공", apiKey);

    console.log("=== RESULT LENGTH ===");
    console.log(result.length);
    console.log("=== RESULT PREVIEW ===");
    console.log(result.substring(0, 300));
    console.log("... (skipping middle) ...");
    console.log(result.substring(result.length - 300));
}

test();
