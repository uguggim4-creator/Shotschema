# 프롬프트 출력 양식 (PromptGenerator Output Manual)

> **[역할 지시문]** 이 문서는 참고 이론이 아닌 **프롬프트 답안지의 채점 기준표**입니다.
> 스토리보드의 **모든 `shotId`에 대한 프롬프트를 빠짐없이** 작성하십시오. (shotId 누락 금지)

---

## 필드 명세

### `prompts[].shotId` (string)
- 스토리보드의 `shotId`와 **1:1 정확히** 일치해야 합니다. (예: `S1-01`)

---

### `prompts[].imagePrompt` (string)
- **언어:** 영문 전용 (한국어 절대 금지)
- **길이:** 최소 60단어 이상
- **어순 (반드시 이 순서로):**
  1. `Medium & Shot Type` — 예: `Cinematic film still, extreme close-up`
  2. `Subject & Action` — 예: `A weary detective lighting a cigarette, hand trembling slightly`
  3. `Environment & Context` — 예: `in a rain-soaked interrogation room, harsh fluorescent backlight`
  4. `Lighting & Color` — 예: `Rembrandt lighting, teal-orange contrast, deep chiaroscuro shadows`
  5. `Camera Specs` — 예: `Shot on Arri Alexa Mini, 85mm lens, f/2.0 shallow depth of field`
  6. `Style & Mood` — **반드시 기획안(Plan)의 `moodAndTone` 영문 키워드를 그대로 후행 태그로 삽입**
- **필수 규칙:**
  - 스토리보드 `cameraDirecting`의 렌즈(mm)·조명 정보를 반드시 이어받아 포함
  - `moodAndTone`의 영문 키워드는 마지막 Style & Mood 위치에 그대로 복사·삽입
- **Good 예시:** `"Cinematic film still, 85mm telephoto lens, low-angle close-up. A weathered detective's face half-submerged in shadow, one eye catching a sliver of cold neon light from the window. In a grimy interrogation room with rain streaking the glass. Rembrandt lighting, teal and orange contrast, chiaroscuro. Shot on Arri Alexa, f/2.0 shallow focus, background blurred. Cold noir, desaturated blue-grey, oppressive tension, gritty realism, Cinestill 800T."`
- **Bad 예시(금지):** `"A detective in a dark room."` ← 어순 없음, 렌즈 없음, moodAndTone 없음

---

### `prompts[].videoMotionPrompt` (string, optional)
- 비디오 생성 시에만 작성. 정지 이미지 전용 샷은 생략 가능.
- **필수 포함 요소:**
  1. **카메라 무브먼트 동사** — 예: `Slow push-in toward subject's eyes`
  2. **피사체 동작** — 예: `Subject slowly raises head, revealing expression`
  3. **속도감** — 예: `Smooth Steadicam, 24fps cinematic` / `Extreme slow motion, phantom flex`
- **Good 예시:** `"Camera slowly pushes in toward the detective's left eye. Subject remains perfectly still, only jaw muscles tightening. Smooth Steadicam movement, cinematic 24fps. Teal-tinted ambient light from off-screen neon sign flickers once."`

---

### `prompts[].negativePrompt` (string, optional)
- **목적:** 이미지 품질을 저해할 요소를 제외하는 부정 프롬프트
- **언어:** 영문, 쉼표로 구분
- **기본 포함 항목 (항상 넣을 것):**
  `blurry, low resolution, overexposed, underexposed, watermark, text overlay, logo, amateur photography`
- **씬 특성에 따라 추가:**
  - 실사 씬: `cartoon, anime, illustration, CGI`
  - 인물 씬: `extra limbs, deformed face, bad anatomy, disfigured, duplicate`
  - 광고 씬: `cluttered background, distorted product, off-brand colors`
  - 숏폼(9:16): `horizontal framing, letterbox, black bars`
- **Good 예시:** `"blurry, low resolution, overexposed, watermark, text overlay, extra limbs, deformed face, cartoon, amateur photography"`
- **Bad 예시(금지):** 한국어로 작성하거나 비워두는 것

