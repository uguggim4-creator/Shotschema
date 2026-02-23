# AI 카메라 무브먼트 및 속도 제어 가이드 (Camera Movement & Speed Guidelines)

본 가이드는 AI 영상/샷 생성 시 정지된 구도를 넘어, **'이미지의 움직임(Movement)'과 '시간의 속도(Speed)'**를 제어하여 영상의 리듬과 감정을 연출하기 위한 실무 지침입니다.

---

## 1. 카메라의 문법 (Grammar of Camera)
물리적인 카메라의 움직임(Pan, Tilt, Roll)을 통해 관객의 시선과 심리를 직접적으로 통제합니다.

*   **[팬 / Pan (좌우 이동)]:** 
    *   **효과:** 제자리에서 고개를 좌우로 돌려 공간을 둘러보거나(파노라마), 두 대상 간의 관계를 연결할 때 사용합니다.
    *   **프롬프트 예시:** `Slow panning shot right, revealing a vast landscape`
*   **[틸트 / Tilt (상하 이동)]:** 
    *   **틸트 업 (Tilt Up):** 발에서 얼굴로, 뻗어 올라감. (희망, 거대함, 위압감) / `Tilt up camera movement, revealing scale, low angle`
    *   **틸트 다운 (Tilt Down):** 위에서 아래로. (실망감, 현실 직시, 무너짐) / `Tilt down camera movement`
*   **[롤 / Roll (축 회전)]:** 
    *   **효과:** 축을 중심으로 회전하여 세상의 지평선이 무너짐을 표현. (지진, 착란, 혼란, 공황)
    *   **프롬프트 예시:** `Camera roll, Dutch angle rotation, disorienting`

## 2. 무브먼트의 동기 (Motivation of Movement)
카메라가 1인치라도 움직이는 데에는 명확한 심리적 이유가 있어야 합니다.

*   **[푸시 인 / Push-In]:** 
    *   **효과:** 카메라가 인물의 얼굴로 천천히 다가감. 중요한 고백, 결정적 순간, 관객의 극단적 감정이입을 유도.
    *   **프롬프트 예시:** `Slow push-in camera movement towards the eyes, emotional intensity`
*   **[풀 아웃 / Pull-Out]:** 
    *   **효과:** 인물에게서 점점 멀어짐. 인물의 무력감, 고립감(Isolation), 상황의 종료, 여운.
    *   **프롬프트 예시:** `Slow pull-out camera movement, revealing the vast environment, sense of isolation`
*   **[리빌 샷 / The Reveal (진실의 폭로)]:** 
    *   **효과:** 전경의 장애물을 스치고 지나가며(Slide), 숨겨진 사실이나 거대한 풍경을 드러냄. 서스펜스의 해소와 시각적 쾌감.
    *   **프롬프트 예시:** `Sliding camera movement from behind a dark wall, revealing a massive structure`

## 3. 정서적 움직임의 질감 (Handheld vs Steadicam)
*   **[핸드헬드 / Handheld]:** 
    *   **효과:** 손으로 들고 찍어 호흡에 따라 미세하게 흔들림. 날 것의 현장감, 다큐멘터리 리얼리즘, 혼돈과 불안.
    *   **프롬프트 예시:** `Handheld camera movement, shaky footage, documentary style, chaos`
*   **[스테디캠 / Steadicam]:** 
    *   **효과:** 진동 없이 미끄러지듯 나아가는 우아한 궤적. 객관적 관찰, 몽환적 부유감, 신의 시선.
    *   **프롬프트 예시:** `Gimbal shot, perfectly stable, smooth gliding forward, dreamlike flow`

## 4. 렌즈와 속도의 물리학 (Lens & Physics)
액션의 속도감은 피사체의 진짜 속도가 아니라 **'렌즈의 왜곡력'**이 결정합니다.

*   **[광각 렌즈 / Wide Angle (16mm)]:** 
    *   **효과:** 원근감을 과대포장. 피사체가 다가올 때 튀어나올 듯한 엄청난 속도감 극대화. (추격씬, 액션)
    *   **프롬프트 예시:** `Shot on 16mm wide angle, race car speeding past, exaggerated perspective, high speed`
*   **[망원 렌즈 / Telephoto (200mm)]:** 
    *   **효과:** 공간을 바짝 압축. 아무리 열심히 달려도 배경이 바뀌지 않아 제자리걸음인 듯한 악몽, 피로, 벗어날 수 없는 굴레.
    *   **프롬프트 예시:** `Shot on 200mm telephoto lens, background compression, running in place, hopeless`

## 5. 시간의 변형과 조각 (Speed Ramping)
*   **[슬로우 모션 / Slow Motion]:** 찰나의 순간을 현미경처럼 확대하여 감정의 밀도를 높임.
    *   **프롬프트 예시:** `Extreme slow motion, frozen in time, phantom flex camera high speed`
*   **[불릿 타임 / Bullet Time]:** 시간은 정지했는데 카메라는 360도로 자유롭게 움직이는 전지전능한 시점.
    *   **프롬프트 예시:** `Bullet time effect, frozen explosion, camera tracking through particles`
*   **[리버스 모션 / Reverse Motion]:** 거꾸로 되감기는 시간. 후회, 꿈의 논리적 역설.
    *   **프롬프트 예시:** `Reverse motion, smoke flowing backwards, defying gravity, surreal`

---
**[주의 사항]** 
단순히 "Move"라고 지시하지 말고, 카메라의 문법인 **"Pan, Tilt, Slide, Tracking, Push-in, Pull-out"** 과 **렌즈의 mm 수**를 프레임 단위 명렁어에 구체적으로 명시하십시오.
