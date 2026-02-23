# AI 조명 및 색채 시각화 가이드 (Lighting & Color Guidelines)

본 가이드는 시나리오를 바탕으로 **감정의 온도와 공간의 질서(빛과 색채, 깊이)**를 설계하여 영상화하기 위한 실무 지침입니다. 빛의 각도와 질감, 그리고 색상 대비를 활용하여 AI 비디오 샷 노트의 디테일을 높이십시오.

---

## 1. 빛의 질감과 그림자의 미학 (Chiaroscuro)
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
    *   **효과:** 정면 위에서 빛이 떨어져 코 밑에 나비 모양 그림자가 생깁니다. 대상을 갸름하고 가장 아름답게(신성하게) 부각합니다.
    *   **프롬프트 예시:** `Butterfly lighting, soft shadows under nose, glamorous look, goddess atmosphere`

## 2. 공간의 밀도: 빛의 무게감 (Texture of Light)
빛의 크기와 확산도에 따라 화면의 분위기와 사실감이 결정됩니다.

*   **[볼류메트릭 라이트 / Volumetric Lighting (신의 빛)]:** 
    *   **효과:** 공기 중의 먼지나 연무에 빛이 산란되는 '빛의 기둥'. 공간을 꽉 채우고 신비로움, 경외감, 압도감을 극대화합니다.
    *   **프롬프트 예시:** `Volumetric lighting, god rays, visible light shafts, subtle haze, dust particles in light`
*   **[하드 라이트 / Hard Light]:** 
    *   **효과:** 직사광선처럼 뚜렷하고 날카로운 그림자. 피부의 주름/결점을 모두 노출시키며 **잔혹한 진실, 폭력, 긴장감**을 보여줍니다.
    *   **프롬프트 예시:** `Hard shadows, harsh direct light, sharp texture details, realistic`
*   **[소프트 라이트 / Soft Light]:** 
    *   **효과:** 창문 커튼을 통과한 빛처럼 그림자 경계가 흐릿함. 대상을 미화하며 **환상, 몽환적 기억, 부드러움**을 묘사합니다.
    *   **프롬프트 예시:** `Soft diffused lighting, ethereal glow, dreamy atmosphere, low contrast`

## 3. 색채의 언어와 충돌 (Color Contrast)
피사체의 색상보다 **배경과의 색상 대비**가 장면의 텐션을 만듭니다.

*   **[보색 대비 / Complementary Contrast]:** 
    *   **효과:** 틸 앤 오렌지(Teal & Orange). 배경의 차가운 청록색(Teal)이 전경의 따뜻한 살구색(Orange)을 찌르며 시각적 액션과 갈등을 극대화합니다.
    *   **프롬프트 예시:** `Teal shadows, amber highlights, complementary contrast, blue vs orange`
*   **[한난 대비 / Cold-Warm Contrast]:** 
    *   **효과:** 에드워드 호퍼 룩. 차가운 세상(외부)과 따뜻한 고립(내부)의 온도차를 통해 현대인의 단절과 외로움을 시각화합니다.
    *   **프롬프트 예시:** `Cool exterior blue vs warm interior orange, cold-warm contrast, urban isolation, Edward Hopper mood`
*   **[명도 대비 / Light-Dark Contrast (느와르)]:** 
    *   **효과:** 색상을 배제하고 극단적인 밝기와 어둠의 형태로만 서사를 전달. 아슬아슬한 긴장감과 숨겨진 비밀.
    *   **프롬프트 예시:** `Light-dark contrast, silhouette, high contrast noir style, sharp edge lighting`

## 4. 시네마틱 컬러 그레이딩 (Cinematic Film Grading)
영화의 장르적 분위기를 완성하기 위해 구체적인 필름 스톡의 룩을 명령하십시오.

*   **[Kodak Portra 400]:** 따뜻한 피부톤, 크리미한 하이라이트. 인물의 감정 중심(로맨스, 회상).
*   **[Cinestill 800T]:** 차가운 텅스텐 베이스에 붉은 네온 번짐(Halation). 디스토피아, 감성 야경, 사이버펑크.
*   **[Bleach Bypass]:** 채도가 쫙 빠진 은색 톤. 하드코어한 거친 질감. 참혹한 전쟁, 재난물.
*   **[Technicolor]:** 채도가 비현실적으로 높고 원색(Red/Blue/Yellow)이 분리되어 튀어오름. 클래식 고전, 환상적인 뮤지컬.
