# AI 편집 및 몽타주 가이드 (Editing & Montage Guidelines)

본 가이드는 AI로 생성한 개별 샷(Shot)들을 이어 붙여 **제3의 의미와 서스펜스**를 만들어내기 위한 편집 및 몽타주 기획 지침입니다. 샷과 샷의 연결 고리를 프롬프트 단계부터 설계하십시오.

---

## 1. 히치콕의 서스펜스: 폭탄 이론 (The Bomb Theory)
관객에게만 정보를 제공함으로써 긴장감을 극대화합니다.

*   **[인서트 샷 / Insert Shot]:** 
    *   **효과:** 무심하게 흘러가는 상황(A) 과 상황(B) 사이에 '위험을 알리는 사물'을 클로즈업으로 삽입하여 깜짝 놀람(Surprise)이 아닌 조이는 긴장감(Suspense)을 만듭니다.
    *   **프롬프트 예시:** `Macro shot, alien creature hiding inside air vent, dripping saliva, cinematic horror` (이후 아무것도 모르는 주인공 샷과 교차)

## 2. 지적 몽타주: 충돌의 미학 (Intellectual Montage)
에이젠슈타인의 이론. 서로 이질적인 두 샷을 충돌시켜 새로운 관념(은유)을 창조합니다.

*   **[은유적 몽타주 / Metaphorical Cut]:**
    *   **효과:** 인물의 직접적인 행동(분노)을 보여주는 대신, 자연 현상이나 사물의 파괴를 교차 편집하여 감정의 규모를 시각화합니다.
    *   **프롬프트 예시:** (화난 인물 샷 다음에) `Volcano eruption, lava exploding, destruction, extreme power, visual metaphor for anger`

## 3. 매치 컷 (The Match Cut)
서로 다른 시공간을 시각적, 청각적 유사성으로 부드럽게(혹은 철학적으로) 연결합니다.

*   **[그래픽 매치 / Graphic Match]:** 
    *   **효과:** 피사체의 모양(Shape)과 구도가 유사성을 가짐. (형태의 전이)
    *   **프롬프트 기획:** Shot A(원의 형태: `Extreme close-up of human eye`) -> Shot B(원의 형태: `Full moon in the night sky, center framed`)
*   **[액션 매치 / Action Match]:** 
    *   **효과:** 피사체가 움직이는 속도와 방향(Vector)을 연결.
    *   **프롬프트 기획:** Shot A(`Samurai swinging a katana sword from left to right`) -> Shot B(`Modern baseball batter swinging a bat from left to right`)
*   **[컬러 매치 / Color Match]:** 
    *   **효과:** 특정 지배적인 색상(Dominant Color)으로 씬을 넘김.
    *   **프롬프트 기획:** Shot A(`A single red balloon floating`) -> Shot B(`Traffic light turning red in dark rainy street`)

## 4. 월터 머치의 편집 6원칙 (Rule of Six) & AI 이슈
편집 시 어떤 디테일을 살리고 버릴지 결정하는 우선순위입니다. AI 영상 특유의 오류(손가락 뭉개짐 등)에 집착하기보다 감정에 집중하십시오.

1.  **감정 (Emotion - 51%):** 초점이나 디테일이 망가져도, 샷의 감정적 진정성이 압도적이라면 채택합니다.
    *   *AI 프롬프트:* `Extreme close-up on teary eyes, intense sorrow, emotional authenticity, raw feeling`
2.  **스토리 (Story - 23%):** 샷이 서사를 전진시키는가? 단순한 풍경 묘사보다 '사건'을 기획하십시오.
    *   *AI 프롬프트:* `A hand passing a secret note to another hand, narrative keyframe`
3.  **리듬 (Rhythm - 10%):** 내부 움직임의 속도로 편집의 박자감을 만듭니다.
4.  **시선 유지 (Eye-trace - 7%):** 관객의 눈이 머무는 곳을 유도합니다. (왼쪽에 피사체가 있었다면 다음 컷의 요소도 동선 고려)
5.  **2차원 평면 / 180도 법칙 (2D Plane - 5%):**
    *   **AI 주의점 (Jump Cut 방지):** AI는 이전 컷의 위치를 기억하지 못하므로, 대화 씬에서 `View from left side`, `Over the shoulder shot` 등으로 카메라 위치를 명확히 고정해야 합니다. (혹은 편집 툴에서 좌우 반전 사용)
6.  **3차원 공간 (3D Space - 4%):** 지리적 연결성. 감정이 끊기지 않으면 공간이 약간 튀어도 무방합니다. (AI의 한계를 포용하는 룰)

---
**[편집 및 프롬프트 기획 체크리스트]**
- [ ] 중요한 사건 전에 관객만 아는 정보(인서트 샷)를 주어 서스펜스를 만들었는가?
- [ ] 직설적인 감정 표현 대신, 상징적인 장면(자연물, 사물)을 충돌시켜 은유를 만들었는가?
- [ ] 씬과 씬이 넘어갈 때, 시점 이동(180도 법칙)이나 형태의 유사성(Match Cut)을 고려하여 프롬프트를 구성했는가?
- [ ] AI 영상의 세부적 결함보다, 그 샷이 주는 '감정(Emotion)'이 기준을 충족하는가?
