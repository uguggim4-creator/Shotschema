/**
 * AgentFactory: 카테고리별 에이전트를 선택하여 반환합니다.
 * 새 카테고리 추가 시 이 파일만 수정하면 됩니다.
 */
import { ContentCategory } from '../memory/state-manager';
import { ReviewAgent } from './ReviewAgent';

// IdeaAgent
import { IdeaAgent as FilmIdeaAgent } from './film/IdeaAgent';
import { IdeaAgent as AdIdeaAgent } from './ad/IdeaAgent';
import { IdeaAgent as ShortsIdeaAgent } from './shorts/IdeaAgent';
import { IdeaAgent as DramaIdeaAgent } from './drama/IdeaAgent';
import { IdeaAgent as AnimationIdeaAgent } from './animation/IdeaAgent';

// ScenarioAgent
import { ScenarioAgent as FilmScenarioAgent } from './film/ScenarioAgent';
import { ScenarioAgent as AdScenarioAgent } from './ad/ScenarioAgent';
import { ScenarioAgent as ShortsScenarioAgent } from './shorts/ScenarioAgent';
import { ScenarioAgent as DramaScenarioAgent } from './drama/ScenarioAgent';
import { ScenarioAgent as AnimationScenarioAgent } from './animation/ScenarioAgent';

// StoryboardAgent
import { StoryboardAgent as FilmStoryboardAgent } from './film/StoryboardAgent';
import { StoryboardAgent as AdStoryboardAgent } from './ad/StoryboardAgent';
import { StoryboardAgent as ShortsStoryboardAgent } from './shorts/StoryboardAgent';
import { StoryboardAgent as DramaStoryboardAgent } from './drama/StoryboardAgent';
import { StoryboardAgent as AnimationStoryboardAgent } from './animation/StoryboardAgent';

// PromptAgent
import { PromptAgent as FilmPromptAgent } from './film/PromptAgent';
import { PromptAgent as AdPromptAgent } from './ad/PromptAgent';
import { PromptAgent as ShortsPromptAgent } from './shorts/PromptAgent';
import { PromptAgent as DramaPromptAgent } from './drama/PromptAgent';
import { PromptAgent as AnimationPromptAgent } from './animation/PromptAgent';

export function createAgents(category: ContentCategory, apiKey: string, model: string) {
    const reviewer = new ReviewAgent(apiKey, model);

    switch (category) {
        case 'ad':
            return {
                idea: new AdIdeaAgent(apiKey, model),
                scenario: new AdScenarioAgent(apiKey, model),
                storyboard: new AdStoryboardAgent(apiKey, model),
                prompt: new AdPromptAgent(apiKey, model),
                reviewer,
            };
        case 'shorts':
            return {
                idea: new ShortsIdeaAgent(apiKey, model),
                scenario: new ShortsScenarioAgent(apiKey, model),
                storyboard: new ShortsStoryboardAgent(apiKey, model),
                prompt: new ShortsPromptAgent(apiKey, model),
                reviewer,
            };
        case 'drama':
            return {
                idea: new DramaIdeaAgent(apiKey, model),
                scenario: new DramaScenarioAgent(apiKey, model),
                storyboard: new DramaStoryboardAgent(apiKey, model),
                prompt: new DramaPromptAgent(apiKey, model),
                reviewer,
            };
        case 'animation':
            return {
                idea: new AnimationIdeaAgent(apiKey, model),
                scenario: new AnimationScenarioAgent(apiKey, model),
                storyboard: new AnimationStoryboardAgent(apiKey, model),
                prompt: new AnimationPromptAgent(apiKey, model),
                reviewer,
            };
        case 'film':
        default:
            return {
                idea: new FilmIdeaAgent(apiKey, model),
                scenario: new FilmScenarioAgent(apiKey, model),
                storyboard: new FilmStoryboardAgent(apiKey, model),
                prompt: new FilmPromptAgent(apiKey, model),
                reviewer,
            };
    }
}
