# 스토리보드 출력 양식 (StoryboardWriter Output Manual)

> **[역할 지시문]** 이 문서는 참고 이론이 아닌 **샷 노트 답안지의 채점 기준표**입니다.
> 아래 필드 명세를 완벽히 준수하여 JSON을 작성하십시오.
> 각 씬(Scene)당 **최소 3개 이상의 샷(Shot)**을 반드시 설계하십시오.

---

## 필드 명세

### `scenes[].sceneNumber` (number)
- 기획안(Plan)의 `sceneNumber`와 반드시 일치해야 합니다.

---

### `shots[].shotId` (string)
- **형식:** `S{씬번호}-{샷번호}` (예: `S1-01`, `S2-03`)
- 씬 내에서 01부터 순차적으로 증가.

---

### `shots[].visualDescription` (string)
- **길이:** 2~4문장
- **필수 포함 요소:**
  1. 프레임 안에 **무엇이 보이는가** (피사체, 위치, 행동)
  2. 전경·중경·후경 중 최소 2개 레이어 언급
  3. 기획안의 `directorIntention`에서 파생된 시각적 의도
- **Good 예시:** `"전경에 초점 없이 흐른 물방울 맺힌 유리창. 중경에 테이블 맞은편에 앉아 손가락으로 탁자를 두드리는 형사. 후경 창밖으로 경광등 불빛이 적막하게 회전하고 있다."`
- **Bad 예시(금지):** `"형사가 앉아있다."` ← 레이어 없음, 디테일 없음

---

### `shots[].cameraDirecting` (string)
- **필수 포함 요소 (아래 5가지 모두 명시):**
  1. **렌즈 (mm 단위 필수):** `35mm`, `85mm`, `135mm` 등 구체적 수치
  2. **앵글:** `Eye-level`, `Low angle`, `High angle`, `Tatami shot`, `Bird's eye` 중 택일
  3. **심도:** `Shallow focus (f/1.8)`, `Deep focus (f/11)` 등 조리개값 포함
  4. **카메라 무브먼트:** `Static`, `Slow push-in`, `Handheld`, `Pan right`, `Steadicam` 등
  5. **조명 방식:** `Low key`, `Rembrandt lighting`, `Hard light`, `Volumetric`, `Split lighting` 등
- **Good 예시:** `"85mm telephoto, low angle, shallow focus f/2.0. 천천히 slow push-in. Low key Rembrandt lighting — 얼굴 오른쪽 절반을 그림자에 묻음."`
- **Bad 예시(금지):** `"클로즈업 샷"` / `"카메라가 이동한다"` ← 렌즈·조리개·조명 모두 누락

---

### `shots[].audioDialog` (string)
- 대사(큰따옴표), 효과음(SFX: ~), 배경음악(BGM: ~)을 구분하여 기술
- 대사·음향이 없는 샷도 반드시 **분위기 음향 1개 이상** 명시
- **Good 예시:** `"\"네가 한 짓 알고 있어.\" (SFX: 멀리서 사이렌 소리가 창문을 뚫고 들어온다. BGM: 낮고 불길한 첼로 드론음.)"`
- **Bad 예시(금지):** `"대사 없음"` / `"조용함"` ← 음향 정보 0
