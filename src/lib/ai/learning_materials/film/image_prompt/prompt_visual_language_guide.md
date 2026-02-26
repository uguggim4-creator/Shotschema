# 이미지/영상 프롬프트 시각 언어 가이드

본 문서는 스토리보드 샷 노트를 AI 이미지/영상 생성 프롬프트로 변환할 때 필요한 **조명, 색채, 구도 키워드** 학습 자료입니다.

---

## PART A. 빛의 질감과 그림자의 미학 (Chiaroscuro)
단순한 '밝기(Brightness)' 조절을 넘어, **그림자(Darkness)를 추가하여 질감과 깊이**를 만듭니다.

*   **[어둠의 통제 / Negative Fill]:**
    *   **효과:** 무조건 밝은 조명(예: Flat lighting)을 피하고, 짙은 그림자 속에서 제한적인 빛(귀한 빛)만을 허용하여 인물과 공간의 깊이감을 생성합니다.
    *   **프롬프트 예시:** `Deep shadows, low key lighting, negative fill, chiaroscuro, protected shadow details`
*   **[렘브란트 라이팅 / Rembrandt Lighting]:**
    *   **효과:** 측면 45도 위에서 떨어지는 빛. 어두운 뺨에 '역삼각형 빛'을 만들어 인물의 고뇌, 이중성, 인간적인 결을 표현하는 정통 드라마 룩입니다.
    *   **프롬프트 예시:** `Rembrandt lighting, triangle of light on cheek, high contrast, moody atmosphere`
*   **[스플릿 라이팅 / Split Lighting]:**
    *   **효과:** 90도 측면에서 빛을 쏘아 얼굴 절반을 완전히 어둠에 묻습니다. 인물의 악의, 이중인격, 흑막을 암시할 때 씁니다.
    *   **프롬프트 예시:** `Split lighting, half face in total darkness, menacing expression, mystery`
*   **[버터플라이 라이팅 / Butterfly Lighting]:**
    *   **효과:** 정면 위에서 빛이 떨어져 코 밑에 나비 모양 그림자가 생깁니다. 대상을 가장 아름답게(신성하게) 부각합니다.
    *   **프롬프트 예시:** `Butterfly lighting, soft shadows under nose, glamorous look, goddess atmosphere`

## PART B. 공간의 밀도: 빛의 무게감 (Texture of Light)
빛의 크기와 확산도에 따라 화면의 분위기와 사실감이 결정됩니다.

*   **[볼류메트릭 라이트 / Volumetric Lighting (신의 빛)]:**
    *   **효과:** 공기 중의 먼지나 연무에 빛이 산란되는 '빛의 기둥'. 신비로움, 경외감, 압도감을 극대화합니다.
    *   **프롬프트 예시:** `Volumetric lighting, god rays, visible light shafts, subtle haze, dust particles in light`
*   **[하드 라이트 / Hard Light]:**
    *   **효과:** 직사광선처럼 뚜렷하고 날카로운 그림자. 피부의 주름/결점을 모두 노출시키며 **잔혹한 진실, 폭력, 긴장감**을 보여줍니다.
    *   **프롬프트 예시:** `Hard shadows, harsh direct light, sharp texture details, realistic`
*   **[소프트 라이트 / Soft Light]:**
    *   **효과:** 창문 커튼을 통과한 빛처럼 그림자 경계가 흐릿함. 대상을 미화하며 **환상, 몽환적 기억, 부드러움**을 묘사합니다.
    *   **프롬프트 예시:** `Soft diffused lighting, ethereal glow, dreamy atmosphere, low contrast`

---

## PART C. 색채의 언어와 충돌 (Color Contrast)
피사체의 색상보다 **배경과의 색상 대비**가 장면의 텐션을 만듭니다.

*   **[보색 대비 / Complementary Contrast]:**
    *   **효과:** 틸 앤 오렌지(Teal & Orange). 배경의 차가운 청록색이 전경의 따뜻한 살구색을 찌르며 시각적 액션과 갈등을 극대화합니다.
    *   **프롬프트 예시:** `Teal shadows, amber highlights, complementary contrast, blue vs orange`
*   **[한난 대비 / Cold-Warm Contrast]:**
    *   **효과:** 에드워드 호퍼 룩. 차가운 세상(외부)과 따뜻한 고립(내부)의 온도차를 통해 현대인의 단절과 외로움을 시각화합니다.
    *   **프롬프트 예시:** `Cool exterior blue vs warm interior orange, cold-warm contrast, urban isolation, Edward Hopper mood`
*   **[명도 대비 / Light-Dark Contrast (느와르)]:**
    *   **효과:** 색상을 배제하고 극단적인 밝기와 어둠의 형태로만 서사를 전달. 아슬아슬한 긴장감과 숨겨진 비밀.
    *   **프롬프트 예시:** `Light-dark contrast, silhouette, high contrast noir style, sharp edge lighting`

## PART D. 시네마틱 컬러 그레이딩 (Cinematic Film Grading)
영화의 장르적 분위기를 완성하기 위해 구체적인 필름 스톡의 룩을 명령하십시오.

| 필름 스톡 | 느낌 | 사용 상황 |
|---|---|---|
| **Kodak Portra 400** | 따뜻한 피부톤, 크리미한 하이라이트 | 로맨스, 회상, 인물 감정 중심 |
| **Cinestill 800T** | 차가운 텅스텐 베이스에 붉은 네온 번짐(Halation) | 디스토피아, 감성 야경, 사이버펑크 |
| **Bleach Bypass** | 채도가 쫙 빠진 은색 톤, 거친 질감 | 참혹한 전쟁, 재난물, 하드코어 |
| **Technicolor** | 채도가 비현실적으로 높고 원색(Red/Blue/Yellow) 분리 | 클래식 고전, 환상적인 뮤지컬 |

---

## PART E. 렌즈와 속도의 물리학 (프롬프트용)
*   **[광각 렌즈 / Wide Angle (16mm)]:** 원근감을 과대포장. 추격씬과 액션에서 엄청난 속도감을 극대화.
    *   `Shot on 16mm wide angle, race car speeding past, exaggerated perspective, high speed`
*   **[망원 렌즈 / Telephoto (200mm)]:** 공간을 바짝 압축. 아무리 달려도 목적지에 닿지 못하는 악몽같은 피로감.
    *   `Shot on 200mm telephoto lens, background compression, running in place, hopeless`

---

**[이미지 프롬프트 작성 최종 체크리스트]**
- [ ] 프롬프트가 **Medium → Subject → Environment → Lighting → Camera Spec → Style** 순서를 따르는가?
- [ ] 단순히 "어둡게"가 아니라 조명 방식(Rembrandt, Split, Butterfly 등)을 명시했는가?
- [ ] 색채 대비(Teal & Orange, Cold-Warm, 느와르)를 의도적으로 설계했는가?
- [ ] 필름 스톡 키워드(Kodak Portra, Cinestill 800T 등)로 장르 무드를 완성했는가?
- [ ] 스토리보드의 '푼크툼(디테일 사물)'이 프롬프트 내에 가중치와 함께 반영되었는가?
