import { createOpenAI } from '@ai-sdk/openai';
import type { LanguageModel } from 'ai';

/** 지원 모델 목록 */
export const SUPPORTED_MODELS = [
    { id: 'gemini-3-flash', label: 'Gemini 3 Flash', provider: 'Google' },
    { id: 'claude-sonnet-4-6', label: 'Claude 4.6 Sonnet', provider: 'Anthropic' },
] as const;

export type ModelId = typeof SUPPORTED_MODELS[number]['id'];

/**
 * cometapi의 OpenAI Chat Completions 엔드포인트 (/v1/chat/completions)를 통해
 * Gemini와 Claude 모두 스트리밍 방식으로 호출합니다.
 *
 * NOTE: cometapi의 Anthropic 네이티브 엔드포인트는 streaming 미지원으로 보임.
 *       OpenAI-compatible 엔드포인트는 두 모델 모두 streaming 지원.
 */
export function getModel(modelId: ModelId | string, apiKey: string): LanguageModel {
    const openai = createOpenAI({
        apiKey,
        baseURL: 'https://api.cometapi.com/v1',
    });
    // .chat() 명시 → Responses API(/v1/responses) 대신 Chat Completions(/v1/chat/completions) 사용
    return openai.chat(modelId);
}
