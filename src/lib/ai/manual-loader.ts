import fs from 'fs';
import path from 'path';
import { ContentCategory } from '@/lib/ai/memory/state-manager';

// 기본 매뉴얼 타입 정의
export type ManualType = 'planner' | 'writer' | 'prompt';

// 새 경로: learning_materials/{category}/{step}/
const BASE_DIR = path.join(process.cwd(), 'src', 'lib', 'ai', 'learning_materials');

// step → 새 폴더명 매핑
const stepToDir: Record<string, string> = {
  idea: 'idea',
  plot: 'idea',
  scenario: 'scenario',
  storyboard: 'storyboard',
  prompt: 'image_prompt',
};

/**
 * 카테고리 + 단계에 맞는 학습 자료를 읽습니다.
 * 경로: learning_materials/{category}/{step_dir}/*.md (templates/ 서브폴더 제외)
 */
export async function loadCategoryManuals(category: ContentCategory, step: string): Promise<string> {
  const dir = stepToDir[step] ?? 'idea';
  const dirPath = path.join(BASE_DIR, category, dir);

  try {
    const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
    // templates/ 서브폴더는 제외 (film genres는 별도로 처리)
    const mdFiles = entries
      .filter(e => e.isFile() && e.name.endsWith('.md'))
      .map(e => e.name);

    if (mdFiles.length === 0) return '';

    let content = `\n\n[${category.toUpperCase()} ${dir.toUpperCase()} 전용 가이드]\n`;
    for (const file of mdFiles) {
      const text = await fs.promises.readFile(path.join(dirPath, file), 'utf-8');
      content += `\n--- ${file} ---\n${text}\n`;
    }
    return content;
  } catch {
    //console.warn(`[ManualLoader] 카테고리 매뉴얼 없음: ${category}/${dir}`);
    return '';
  }
}

// ==========================================
// 출력 양식 (공통 - _output/ 폴더)
// ==========================================

const outputFiles: Record<ManualType, string> = {
  planner: '_output/scenario_output.md',
  writer: '_output/storyboard_output.md',
  prompt: '_output/image_prompt_output.md',
};

/**
 * 최종 JSON 출력 양식(Output Manual)을 읽습니다.
 */
export async function loadOutputManual(type: ManualType): Promise<string> {
  const filePath = path.join(BASE_DIR, outputFiles[type]);
  try {
    return await fs.promises.readFile(filePath, 'utf-8');
  } catch (error: any) {
    console.error(`Failed to load output manual: ${type}`, error);
    throw new Error(`출력 양식 로드 실패: ${type} (경로: ${filePath})`);
  }
}

// ==========================================
// 하위 호환 - loadManual (film 기본값)
// ==========================================

const legacyManualFiles: Record<ManualType, string> = {
  planner: 'film/scenario/film_scenario_manual.md',
  writer: 'film/storyboard/storyboard_writer_manual.md',
  prompt: 'film/image_prompt/prompt_generator_manual.md',
};

/**
 * 단계별 주 매뉴얼 파일 로드 (기본값: film).
 * ScenarioAgent는 이 대신 loadCategoryManuals를 사용하는 방향으로 마이그레이션 중.
 */
export async function loadManual(type: ManualType): Promise<string> {
  const filePath = path.join(BASE_DIR, legacyManualFiles[type]);
  try {
    return await fs.promises.readFile(filePath, 'utf-8');
  } catch (error: any) {
    console.error(`Failed to load manual: ${type}`, error);
    throw new Error(`매뉴얼 로드 실패: ${type} (경로: ${filePath})`);
  }
}

// ==========================================
// 배경 이론 로드 (guidelines)
// ==========================================

/**
 * 특정 파일들을 배경 지식으로 로드 (절대 경로: learning_materials/ 기준)
 */
export async function loadGuidelines(files: string[]): Promise<string> {
  let content = '';
  for (const file of files) {
    try {
      const text = await fs.promises.readFile(path.join(BASE_DIR, file), 'utf-8');
      content += `\n\n[Background Theory: ${file}]\n${text}\n`;
    } catch {
      console.warn(`[ManualLoader] Failed to load guideline: ${file}`);
    }
  }
  return content;
}

// ==========================================
// 장르 템플릿 (film 전용)
// ==========================================

const genreKeywords = [
  'mystery', 'rite_of_passage', 'institutional', 'superhero',
  'dude_with_a_problem', 'fool_triumphant', 'buddy_love',
  'magic_lamp', 'golden_fleece', 'monster_in_the_house',
];

/**
 * film 카테고리 전용: 사용자 입력 기반 장르 분류 후 맞춤 템플릿을 시나리오 매뉴얼에 추가합니다.
 * 다른 카테고리에서는 호출하지 마십시오.
 */
export async function loadFilmScenarioManual(userInput: string, apiKey: string): Promise<string> {
  // 1. 기본 film 시나리오 매뉴얼 로드
  let manual = '';
  try {
    manual += await fs.promises.readFile(path.join(BASE_DIR, 'film/scenario/film_scenario_manual.md'), 'utf-8');
    manual += '\n\n---------------------------------\n\n';
  } catch (e) {
    console.warn('[ManualLoader] film_scenario_manual.md 로드 실패', e);
  }

  // 2. LLM으로 장르 분류
  try {
    const res = await fetch('https://api.cometapi.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'gemini-3-flash',
        messages: [{
          role: 'user', content:
            `다음 이야기 시놉시스에 가장 어울리는 장르 키워드 1개만 답하세요. 다른 설명은 절대 쓰지 마세요.\n[키워드 목록]: ${genreKeywords.join(' / ')}\n[입력]: ${userInput}`
        }],
        max_tokens: 20,
      }),
    });
    const json = await res.json();
    const keyword = (json.choices?.[0]?.message?.content ?? '').trim().toLowerCase();
    console.log(`[ManualLoader] 장르 분류 결과: ${keyword}`);

    if (genreKeywords.includes(keyword)) {
      const templatePath = path.join(BASE_DIR, `film/scenario/templates/genre_${keyword}.md`);
      try {
        const tmpl = await fs.promises.readFile(templatePath, 'utf-8');
        manual += `\n\n[선택된 장르 템플릿: ${keyword}]\n\n${tmpl}`;
      } catch {
        console.warn(`[ManualLoader] 장르 템플릿 없음: ${keyword}`);
      }
    }
  } catch (err) {
    console.error('[ManualLoader] 장르 분류 에러:', err);
  }

  return manual;
}

/** 하위 호환 alias */
export const loadDynamicPlannerManual = loadFilmScenarioManual;

/** 필요 매뉴얼 타입 추론 (하위 호환) */
export function determineRequiredManuals(userInput: string): ManualType[] {
  const manuals: Set<ManualType> = new Set();
  const lower = userInput.toLowerCase();
  if (lower.match(/(기획|시나리오|플롯|스토리|주제|로그라인|아이디어)/)) manuals.add('planner');
  if (lower.match(/(스토리보드|씬|프레임|앵글|렌즈|조명|연출|구도|카메라)/)) manuals.add('writer');
  if (lower.match(/(프롬프트|이미지|미드저니|Sora|나노바나나|생성)/)) manuals.add('prompt');
  if (manuals.size === 0) manuals.add('planner');
  return Array.from(manuals);
}
