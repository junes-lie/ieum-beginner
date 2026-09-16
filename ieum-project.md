# 이음 모바일 웹 MVP 통합 명세 v1.0

> 문서 상태: 구현 전 확정 기획·화면 명세  
> 작성일: 2026-09-17  
> 기준 화면: 430px 모바일 웹  
> 구현: HTML, CSS, JavaScript  
> 배포: 제외

## 0. 문서 목적과 우선순위

이 문서는 `ieum-student.md`와 `ieum-design-rull.md`를 실제 모바일 MVP로 옮기기 위한 단일 제품 명세다. 서비스 범위, 12화면, 실제 문구, 상태, 데이터, 이미지와 QA를 이 문서만으로 구현할 수 있어야 한다.

우선순위:

1. 사용자 확정 기획과 변경 금지 항목
2. 접근성·발성 안전·실제 모바일 동작
3. 이 프로젝트 문서의 화면별 결정
4. 이음 디자인 규정
5. 원본 Beginner 문서의 구조와 상세도

## 1. 기준 문서에서 유지·변형한 내용

| 원본 기준 | 유지 | 이음에서의 변형 |
|---|---|---|
| 430px 앱 셸 | 최대 폭·여백·Safe Area | 종이와 카세트 물성의 라이트 앱 |
| 홈 | 핵심 정보와 다음 행동 | 음역 측정이 첫 기능 |
| 찾기 | 검색·필터·비교 | 음역에 맞는 곡 탐색 |
| 상세 | 조건·근거·행동 | 곡·파트·키 적합도 |
| 안전 안내 | 단계 진행 전 주의 | 발성 준비와 중단 기준 |
| 피드 | 여러 대상 탐색 | 얼굴 없는 열린 파트 |
| 게시글 상세 | 깊은 판단 정보 | 음역·음색·완주 궁합 |
| 저장 | 진행 항목 관리 | 카세트 프로젝트룸 |
| 마이 | 개인 정보와 기록 | 보이스 리포트 |
| Font Awesome | 기능 아이콘 통일 | 음악·측정·프로젝트 아이콘 |
| 상태 UI | Loading/Empty/Error/Toast/Modal | 측정·녹음·제출·믹싱 상태 |

## 2. 서비스 정의와 핵심 메시지

### 서비스명

가칭 `이음`.

### 한 줄 정의

직접 부른 목소리에서 음역과 음색을 찾고, 곡·파트별 적합도를 바탕으로 얼굴 공개 없이 비동기 합창을 완성하는 모바일 보컬 협업 서비스.

### 핵심 메시지

앱 안에서 내 목소리를 먼저 확인하고, 사람보다 곡과 파트를 기준으로 협업을 시작한다.

### 제품 원칙

1. 첫 행동은 프로필 작성이 아니라 음역 측정이다.
2. 최저·최고음보다 오래 유지되는 안정 구간을 더 중요하게 다룬다.
3. 열린 파트는 사람 얼굴이 아니라 곡·파트·키·마감으로 비교한다.
4. 참여 뒤 녹음 제출과 완주까지 관리한다.
5. 카세트와 J카드는 실제 상태를 반영한다.
6. 기능처럼 보이는 요소는 실제 이동·상태 변경·데모 안내로 반응한다.

## 3. 핵심 사용자·문제·제공 가치

### 핵심 사용자

정확한 음역을 아직 모르며, 얼굴 공개와 인기 경쟁 없이 소규모 비동기 합창을 완성하고 싶은 20–30대 취미 보컬.

### 문제와 제품 행동

| 문제 | 제품 행동 | 기대 효과 |
|---|---|---|
| 내 음역을 모름 | 단계형 발성과 안정 구간 분석 | 추천 근거 확보 |
| 곡의 어느 파트가 맞는지 모름 | 파트 요구 음역과 내 구간 비교 | 무리한 선택 감소 |
| 얼굴·인기 평가가 부담됨 | 음색 이미지와 완주 기록 | 참여 부담 감소 |
| 참여 뒤 프로젝트가 멈춤 | 목표일·트랙·카세트 상태 | 다음 행동 명확화 |
| 믹싱 방법을 모름 | AI/전문가 분기 | 결과물 완주 |

## 4. MVP 범위와 제외 범위

### 포함

- 12개 논리 화면
- 음역 측정 데모와 보이스 리포트
- 곡 검색·필터·파트 비교
- 열린 파트 스와이프와 키보드 대체
- 참여 조건 동의
- 녹음 데모·미리듣기·제출
- 작동하는 카세트 진행 상태
- AI 믹싱과 전문가 의뢰 분기
- localStorage 저장
- Modal, Toast, Empty, Loading, Error, Success
- 신규 WebP 이미지 정확히 10장

### 제외

- 실제 운영용 음고 분석과 추천 알고리즘
- 서버 계정, 실제 업로드, 실시간 채팅
- 실제 결제와 전문가 계약
- 영상 촬영의 실제 구현
- 공개 팔로워·좋아요·인기 순위
- 전문 오디오 편집

## 5. 정보구조와 하단 내비게이션

### 5.1 하단 탭

| 탭 | 경로 | 역할 |
|---|---|---|
| 홈 | `#/home` | 측정과 추천의 시작 |
| 곡 | `#/songs` | 곡·키·편성 탐색 |
| 프로젝트 | `#/project` | 녹음과 완주 진행 |
| 내 목소리 | `#/voice-report` | 최근 측정 결과 |

- 상세 흐름에서는 BottomNavigation을 숨기고 StickyActionBar를 사용한다.
- 모든 화면은 브라우저 history를 보존한다.

### 5.2 전체 화면

| # | 화면 | 경로 | 하단 UI |
|---:|---|---|---|
| 01 | 홈 | `#/home` | BottomNavigation |
| 02 | 음역 측정 안내 | `#/range-guide` | StickyActionBar |
| 03 | 실시간 음역 측정 | `#/range-test` | StickyActionBar |
| 04 | 보이스 리포트 | `#/voice-report` | BottomNavigation |
| 05 | 곡 탐색 | `#/songs` | BottomNavigation |
| 06 | 곡·파트 상세 | `#/song/:id` | StickyActionBar |
| 07 | 열린 파트 탐색 | `#/open-parts` | BottomNavigation |
| 08 | 보컬 궁합 상세 | `#/compatibility/:id` | StickyActionBar |
| 09 | 참여 조건 확인 | `#/join/:id` | StickyActionBar |
| 10 | 카세트 프로젝트룸 | `#/project` | BottomNavigation |
| 11 | 녹음·제출 | `#/record/:trackId` | StickyActionBar |
| 12 | 믹싱·완성 | `#/mix/:projectId` | StickyActionBar 또는 완료 후 BottomNavigation |

## 6. 핵심 사용자 흐름

### Flow A — 처음 내 목소리 확인

```text
홈 미측정 상태
→ 측정 안내
→ 마이크 확인
→ 낮은 구간
→ 중간 구간
→ 높은 구간
→ 분석
→ 보이스 리포트
→ 맞는 곡 보기
```

이탈 보완: 권한 거부와 감지 실패에서 데모 입력으로 계속할 수 있다.

### Flow B — 곡과 열린 파트 선택

```text
곡 탐색
→ 곡 상세
→ 파트 선택
→ 열린 파트
→ 오른쪽으로 다음 / 아래로 상세
→ 궁합 상세
→ 참여 조건
→ 프로젝트 생성
```

이탈 보완: 조건 동의 전에는 참여 버튼이 비활성이고 이유가 보인다.

### Flow C — 녹음에서 완성까지

```text
프로젝트룸 0%
→ 내 트랙 녹음
→ 미리듣기
→ 제출
→ 왼쪽 릴 50%
→ 다음 파트 도착 데모
→ 오른쪽 릴 100%
→ 믹싱 선택
→ AI 완성 또는 전문가 요청서
→ 완성 카세트
```

## 7. 화면별 상세 명세

### 7.1 화면 01 — 홈

**목적**: 사용자가 음역을 아직 모르는 상태에서 첫 행동을 바로 이해하고, 측정 뒤에는 곡과 진행 프로젝트로 이어지게 한다.  
**진입**: 앱 최초 실행, 홈 탭, 완료 화면의 새 곡 찾기.  
**섹션 순서**: AppHeader → RangeFeature → 맞는 곡 Rail → 열린 파트 Preview → 편성 탐색 → 진행 프로젝트 → 최근 완성 → BottomNavigation.

**실제 문구**

- 미측정 H1: `아직 재지 않은 구간이 있어요`
- 설명: `낮은 음부터 높은 음까지 직접 불러 보고, 오래 유지되는 구간을 찾아요.`
- Primary: `음역 측정 준비하기`
- 측정 완료 H1: `C3–C5에서 가장 안정적이에요`
- 곡 섹션: `원키에서 오래 부를 수 있는 곡`
- 프로젝트 섹션: `이어서 녹음할 파트`

**표시 정보**: 측정 상태, 전체/안정 구간, 추천 곡 3개, 열린 파트 2개, 진행 프로젝트와 다음 행동, 최근 완성 1개.  
**컴포넌트**: RangeFeature, SongHeroCard, OpenPartPreview, ArrangementImageCard, ProjectStrip, CompleteStrip.  
**Primary CTA**: 음역 측정 준비하기 / 내 음역에 맞는 곡 보기.  
**Secondary CTA**: 프로젝트 이어가기, 완성본 듣기.  
**행동과 다음 화면**: 측정 → 02, 곡 → 05·06, 열린 파트 → 07, 프로젝트 → 10.  
**저장 데이터**: 마지막 방문, 측정 상태, 최근 본 곡.

**상태**

- 기본: 미측정 RangeFeature.
- Loading: 추천 곡 구조와 같은 Skeleton.
- Empty: 측정 전 추천 대신 `측정 뒤 곡을 추천해 드려요`.
- Error: 저장 데이터 복구 후 `최근 상태를 불러오지 못해 기본 화면을 열었어요` Toast.
- 완료: 측정 결과와 다음 녹음 상태 표시.

**이미지 계약**: I01 음역 오브젝트 16:10, I02–I04 곡·편성 이미지, I09 프로젝트, I10 완성 결과. 각 카드 선택 시 연결된 화면으로 이동한다.

### 7.2 화면 02 — 음역 측정 안내

**목적**: 마이크 환경과 발성 안전을 안내하고 사용자가 음 이름을 몰라도 측정할 수 있음을 설명한다.  
**진입**: 홈 RangeFeature, 보이스 리포트의 다시 측정.  
**섹션 순서**: DetailHeader → 목적 → I01 이미지 → 3단계 안내 → 마이크·소음·중단 기준 → 권한 상태 → StickyActionBar.

**문구**

- H1: `세 구간을 따라 부르면 음역을 찾을 수 있어요`
- 설명: `정확한 음 이름을 입력하지 않아도 됩니다. 편한 소리에서 시작해 안내를 따라가세요.`
- 안전: `목에 힘이 들어가면 바로 멈춰도 괜찮아요.`
- CTA: `마이크 확인하고 낮은 구간부터 부르기`

**컴포넌트**: StepList, SafetyNotice, PermissionPanel.  
**Primary CTA**: 마이크 확인 후 03.  
**Secondary CTA**: 데모 측정으로 보기.  
**데이터**: 마이크 권한, 데모 모드 여부.

**상태**: 기본, 권한 요청, 권한 거부, 마이크 없음, 준비 완료. 권한 거부에서는 브라우저 설정 안내와 데모 진행을 제공한다.

### 7.3 화면 03 — 실시간 음역 측정

**목적**: 낮은·중간·높은 구간을 실제 발성 순서로 측정한다.  
**진입**: 02 CTA.  
**섹션 순서**: DetailHeader → 단계·제목 → LivePitchMeter → 입력 레벨 → PitchRail → 도움말 → StickyActionBar.

**문구와 단계**

1. `편한 소리에서 조금씩 내려가세요`
2. `가장 편한 음을 길게 유지해 보세요`
3. `힘을 주지 않고 가능한 지점까지만 올라가세요`

CTA는 `다음 구간 측정하기`, 마지막은 `측정 결과 분석하기`다.

**컴포넌트**: LivePitchMeter, LevelMeter, PitchRail, StepIndicator.  
**행동**: 단계 진행, 실패 재시도, 중단 후 저장하지 않기.  
**다음 화면**: 분석 완료 후 04.  
**데이터**: currentStep, detectedPitch, minNote, maxNote, stableSamples.

**상태**

- 기본: 대기.
- Listening: 현재 음과 레벨 갱신.
- Error: `소리가 잡히지 않아요. 마이크를 한 뼘 가까이 두고 다시 불러보세요.`
- Loading: `안정적으로 유지된 구간을 찾고 있어요.`
- Success: 단계 체크 후 다음 버튼 활성.

### 7.4 화면 04 — 보이스 리포트

**목적**: 전체 음역, 안정 구간과 녹음에서 드러난 음색을 곡 추천 근거로 제공한다.  
**진입**: 03 분석 완료, 내 목소리 탭.  
**섹션 순서**: AppHeader → 결과 제목 → PitchRail → 범위 Summary → I05 음색 표본 → 특징 → 참고 파트 → 다시 측정 → BottomNavigation.

**문구**

- H1: `C3–C5에서 가장 안정적이에요`
- 설명: `가장 낮고 높은 한 음보다 오래 유지한 구간을 곡 추천에 더 많이 반영합니다.`
- 음색: `녹음에서 선명한 중음과 짧은 잔향이 들렸어요.`
- CTA: `이 구간에 맞는 곡 보기`

**정보**: 전체 A2–E5, 안정 C3–C5, 중심 G3–A4, 음색 관찰 3개, 측정일.  
**컴포넌트**: RangeSummary, TimbreSpecimen, VoiceTraitList.  
**상태**: 결과 있음, 결과 없음, 이전 결과 불러오기 오류, 재측정 완료.  
**데이터**: voiceProfile, measurementHistory.  
**다음**: 05.

### 7.5 화면 05 — 곡 탐색

**목적**: 내 안정 구간에 맞는 곡을 원키·키 조정·편성으로 탐색한다.  
**진입**: 홈, 보이스 리포트, 곡 탭.  
**섹션 순서**: AppHeader → 결과 근거 → 검색 → FilterChip Rail → 결과 수·정렬 → SongListRow → Empty/Error → BottomNavigation.

**문구**

- H1: `내 음역에 맞는 곡`
- 설명: `원키에서 편한 곡과 키를 조금 바꾸면 맞는 곡을 나누어 보여드려요.`
- 필터: 전체, 원키, -1키, 듀엣, 4파트, 아카펠라.
- Empty: `이 조건에 맞는 곡이 아직 없어요. 키 범위를 넓혀 다시 찾아보세요.`
- Empty CTA: `모든 키와 편성 보기`

**컴포넌트**: SearchField, FilterChip, SortMenu, SongListRow.  
**행동**: 검색, 필터, 정렬, 24초 데모 재생, 상세 이동.  
**데이터**: query, filters, sort, selectedSong.  
**다음**: 06.

**이미지 계약**: I02–I04를 곡별 썸네일로 사용하며 각각 듀엣·4파트·아카펠라 편성을 시각화한다.

### 7.6 화면 06 — 곡·파트 상세

**목적**: 곡의 요구 음역, 키와 파트별 적합도를 비교한 뒤 열린 자리를 보게 한다.  
**진입**: 05 곡 선택, 홈 곡 카드.  
**섹션 순서**: DetailHeader → I02/03/04 Hero → 곡 데모 → 내 구간과 곡 구간 → 파트 목록 → 키 제안 → StickyActionBar.

**문구**

- H1 예시: `파도가 남긴 것`
- 설명: `원키에서는 알토 응답이 안정 구간 안에 들어옵니다.`
- 안내: `파트 이름보다 실제 구간을 먼저 확인하세요.`
- CTA: `알토 응답의 열린 자리 보기`

**정보**: 곡명, 편성, 원키, 길이, 파트별 요구 음역, 중첩률, 키 변경 효과.  
**컴포넌트**: SongHero, AudioPlayer, ComparePitchRail, PartOptionRow.  
**행동**: 데모 재생, 파트 선택, 키 선택.  
**상태**: 기본, 오디오 오류, 파트 없음, 선택 완료.  
**데이터**: selectedSong, selectedPart, selectedKey.  
**다음**: 07.

### 7.7 화면 07 — 열린 파트 탐색

**목적**: 얼굴 없이 곡·파트·음역·목표일과 음색 샘플을 빠르게 비교한다.  
**진입**: 06 CTA, 홈 Preview.  
**섹션 순서**: AppHeader → 목적 설명 → OpenPartCard → 제스처 안내 → 버튼 대체 → BottomNavigation.

**문구**

- H1: `열린 파트`
- 설명: `사람보다 곡과 필요한 구간을 먼저 비교해요.`
- 제스처: `오른쪽으로 밀면 다음 파트`, `아래로 밀면 상세`.
- 버튼: `다음 파트`, `궁합 자세히 보기`.

**정보**: 곡, 파트, 필요 음역, 키, 목표일, 현재 트랙 수, 음색 참고, 최근 완주.  
**컴포넌트**: OpenPartCard, AudioPlayer, GestureHint.  
**행동**: 오른쪽/ArrowRight/버튼으로 다음, 아래/ArrowDown/버튼으로 상세.  
**상태**: 기본, 마지막 후보, 후보 없음, 오디오 오류.  
**데이터**: openPartIndex, previewPlayback.  
**다음**: 08.

**이미지 계약**: I06–I08은 서로 다른 음색을 얼굴 없이 표현하며 4:3으로 카드 상단에 사용한다.

### 7.8 화면 08 — 보컬 궁합 상세

**목적**: 단일 점수보다 음역 중첩, 음색 분리도와 완주 근거를 설명한다.  
**진입**: 07 아래 제스처·상세 버튼.  
**섹션 순서**: DetailHeader → 곡·파트 → 범위 비교 → I05와 후보 이미지 비교 → 두 음성 재생 → 프로젝트 기록 → StickyActionBar.

**문구**

- H1: `알토 응답과 내 목소리`
- 설명: `점수보다 어떤 구간이 겹치고, 두 트랙이 어떻게 나뉘어 들리는지 확인하세요.`
- 키 제안: `후렴 한 구간만 -1키로 낮추면 안정적이에요.`
- CTA: `일정과 공개 범위 확인하기`

**정보**: 안정 구간, 파트 구간, 중첩률, 키 제안, 음색 비교, 최근 완주, 평균 응답, 공개 범위.  
**상태**: 기본, 내 샘플 없음, 오디오 실패, 비교 완료.  
**데이터**: selectedOpenPart, compatibilityEvidence.  
**다음**: 09.

### 7.9 화면 09 — 참여 조건 확인

**목적**: 일정, 녹음 형식, 공개와 연락 범위를 동의 전에 확인한다.  
**진입**: 08 CTA.  
**섹션 순서**: DetailHeader → 곡·파트 요약 → I09 기록 이미지 → 조건 표 → 안전 안내 → Checkbox → StickyActionBar.

**문구**

- H1: `녹음 전에 조건을 확인해요`
- 설명: `참여 뒤 바뀌면 곤란한 일정과 공개 범위를 먼저 확인합니다.`
- 안내: `사적인 연락처를 공유하지 않아도 됩니다.`
- Checkbox: `목표일과 공개 범위를 확인했습니다.`
- CTA: `이 조건으로 프로젝트에 참여하기`

**정보**: 선택 파트, 목표일, 오디오 형식, 공개 범위, 연락 범위, 나가기·신고.  
**컴포넌트**: ConditionTable, Checkbox, SafetyNotice.  
**상태**: 미동의, 동의, 참여 처리 중, 참여 오류, 참여 완료.  
**데이터**: conditionsAccepted, joinedProject.  
**다음**: 10.

### 7.10 화면 10 — 카세트 프로젝트룸

**목적**: 녹음 제출과 다음 파트 도착을 카세트·J카드 상태로 보여주고 다음 행동을 제시한다.  
**진입**: 참여 완료, 프로젝트 탭, 홈 진행 프로젝트.  
**섹션 순서**: AppHeader → 곡·편성 → CassetteProgress → JCard → TrackStatusList → 다음 행동 → 프로젝트 조건 → BottomNavigation.

**문구와 CTA**

- 0%: `아직 올라온 트랙이 없어요` / `알토 응답 녹음하기`
- 50%: `첫 트랙이 왼쪽 릴에 감겼어요` / `다음 파트 도착 상태 보기`
- 100%: `모든 트랙이 카세트 안에 들어왔어요` / `믹싱 방식 고르기`

**컴포넌트**: CassetteProgress, JCard, TrackStatusRow, ProjectSafetyMenu.  
**행동**: 녹음 진입, 트랙 재생, 다음 파트 도착 데모, 프로젝트 나가기 Modal.  
**데이터**: projectProgress, tracks, submittedAt, reelAnimation.  
**상태**: 0/25/50/75/100, Loading, 트랙 오류, 프로젝트 완료.  
**다음**: 11 또는 12.

**카세트 계약**: 0% 외부 테이프 최대, 첫 제출 후 왼쪽 릴, 다음 제출 후 오른쪽 릴, 100% 외부 테이프 0. 두 제출 기록은 다른 손글씨다.

### 7.11 화면 11 — 녹음·제출

**목적**: 가이드 트랙을 듣고 자신의 파트를 녹음·미리듣기·재녹음·제출한다.  
**진입**: 10 녹음 CTA.  
**섹션 순서**: DetailHeader → 곡·파트 → 가이드 재생 → Recorder → 입력 레벨 → 미리듣기 → 제출 행동 → 안전 안내 → StickyActionBar.

**문구**

- H1: `2절 알토 응답을 녹음해요`
- 설명: `첫 마디 전 두 박자의 가이드를 듣고 시작합니다.`
- 버튼: `가이드 트랙 듣기`, `녹음 시작`, `녹음 멈추기`, `처음부터 다시 녹음`, `이 트랙 제출하기`.

**컴포넌트**: GuidePlayer, Recorder, LevelMeter, TakePreview.  
**상태**: 권한 요청, 권한 거부, 준비, 카운트인, 녹음 중, 입력 없음, 미리듣기, 제출 중, 제출 오류, 완료.  
**데이터**: recordingState, duration, takeUrl(demo), submittedTrack.  
**완료 피드백**: `알토 응답 트랙을 제출했고 왼쪽 릴에 기록했어요.`  
**다음**: 10의 50% 상태.

### 7.12 화면 12 — 믹싱·완성

**목적**: 모든 트랙이 준비된 뒤 AI와 전문가 경로를 비교하고 완성 결과를 보관한다.  
**진입**: 10의 100% CTA.  
**섹션 순서**: DetailHeader → 완료된 CassetteProgress → MixChoice → 선택 근거 → 실행 CTA → 처리 상태 → I10 완성 결과 → 관련 곡 → 하단 UI.

**문구**

- 선택 H1: `완성 방식을 골라요`
- AI: `약 10분 안에 볼륨과 좌우 위치를 정리한 초안을 만들어요.`
- 전문가: `원하는 질감과 수정 범위를 적고 견적을 확인해요.`
- AI CTA: `AI 믹스 데모 만들기`
- 전문가 CTA: `의뢰 전 요청서 확인하기`
- 완료 H1: `두 트랙이 한 파일로 정리됐어요`
- 완료 CTA: `완성 믹스 듣기`

**컴포넌트**: CassetteProgress, MixMeterPanel, ExpertRequestPanel, ProgressState, CompleteCollage.  
**상태**: 미선택, AI 선택, 전문가 선택, 처리 중, 처리 오류, 요청서 확인, 완성.  
**데이터**: mixingMode, mixStatus, mixResult.  
**다음**: 홈, 새 곡 탐색, 프로젝트 보관.

## 8. 디자인 시스템 연결

- 앱 셸과 여백은 `ieum-design-rull.md` 2장.
- 색상은 3장 세 유채색만 사용한다.
- 타이포는 4장, 손글씨는 J카드로 제한한다.
- 내비게이션은 7장.
- 측정·곡·카세트·녹음은 9–12장 계약을 따른다.
- 카드뉴스는 13장, 이미지와 Overlay는 14장.

## 9. 컴포넌트 계약

```text
Navigation/AppHeader
Navigation/DetailHeader
Navigation/BottomNav
Navigation/StickyActionBar
Button/Primary
Button/Secondary
Button/Record
Button/Icon
Chip/Filter
Badge/Status
Voice/RangeFeature
Voice/PitchRail
Voice/LivePitchMeter
Voice/TimbreSpecimen
Song/HeroCard
Song/ListRow
Song/PartOptionRow
OpenPart/Card
Project/CassetteProgress
Project/JCard
Project/TrackStatusRow
Record/Recorder
Mix/Choice
State/Empty
State/Loading
State/Error
Overlay/ConfirmationModal
Feedback/Toast
```

## 10. 이미지 생성 계획 — 정확히 10장

| # | 파일명 | 화면 | 역할 | 장면·피사체 | 비율 |
|---:|---|---|---|---|---|
| 1 | `01-range-calibration.webp` | 홈·02 | 음역 탐색 Hero | 종이 음계와 투명 테이프 조각, 작은 청록 측정점 | 16:10 |
| 2 | `02-song-duet-ribbon.webp` | 홈·05·06 | 듀엣 곡 | 두 개의 분리된 자기테이프 리본이 한 방향으로 겹침 | 16:10 |
| 3 | `03-song-choir-layers.webp` | 홈·05·06 | 4파트 합창 | 네 층의 종이·섬유 파형 | 16:10 |
| 4 | `04-song-acapella-knot.webp` | 홈·05·06 | 아카펠라 | 반주 없이 연결된 네 개의 자기테이프 매듭 | 16:10 |
| 5 | `05-timbre-clear-grain.webp` | 04·08 | 내 음색 | 청록 미세 입자와 짧은 잔향의 추상 표본 | 4:3 |
| 6 | `06-timbre-low-oxide.webp` | 07·08 | 낮은 응답 후보 | 낮고 두꺼운 산화색 섬유 파형 | 4:3 |
| 7 | `07-timbre-air-silver.webp` | 07·08 | 가벼운 화음 후보 | 얇은 은색 리본과 넓은 공백 | 4:3 |
| 8 | `08-timbre-warm-paper.webp` | 07·08 | 중간 화음 후보 | 따뜻한 회색 종이 결의 겹 파형 | 4:3 |
| 9 | `09-project-cassette-workbench.webp` | 홈·09·10 | 프로젝트 물성 | 투명 카세트, 빈 J카드, 밖으로 늘어진 테이프 | 16:10 |
| 10 | `10-complete-cassette-collage.webp` | 홈·12 | 완성 결과 | 테이프가 감긴 카세트와 두 음색 표본의 편집 콜라주 | 16:10 |

공통 제약: 얼굴·인물·무대·하트·로고·읽을 수 있는 글자·외부 URL 금지. 각 이미지는 서로 다른 목적이며 모두 실제 화면에 사용한다.

## 11. 실제 콘텐츠와 샘플 데이터

### 곡

```text
id, title, arrangement, originalKey, duration, image,
parts[], range, fitType, preview, openPartCount
```

샘플:

- 파도가 남긴 것 / 듀엣 / C / 알토 응답 A3–E4 / -1키 권장
- 겹친 계절 / 4파트 / G / 소프라노·알토·테너·베이스
- 숨의 매듭 / 아카펠라 / D / 리드·베이스·퍼커션·화음

### 열린 파트

```text
id, songId, part, requiredRange, suggestedKey, deadline,
currentTracks, totalTracks, timbreLabel, timbreImage,
sampleAudio, completionHistory, visibility
```

### 프로젝트와 트랙

```text
project: id, songId, arrangement, progress, deadline, visibility, mixStatus
track: id, projectId, part, range, status, submittedAt, creditStyle, audio
```

## 12. 로컬 상태 구조

```text
ieum.version
ieum.measurement
ieum.voiceProfile
ieum.songFilters
ieum.selectedSong
ieum.selectedPart
ieum.openPartIndex
ieum.conditionsAccepted
ieum.project
ieum.recording
ieum.mix
```

- JSON 오류 시 안전한 기본값으로 복구하고 안내 Toast를 표시한다.
- 상태 변경 직후 UI와 localStorage를 동기화한다.
- `다시 체험하기`는 확인 Modal 뒤 데모 상태만 초기화한다.

## 13. 인터랙션 규칙

- 이동은 링크 또는 history 기반 라우터, 상태 변경은 button.
- 오른쪽 스와이프 임계값 64px, 수직 이동보다 클 때만 다음 카드.
- 아래 스와이프 임계값 64px, 수평 이동보다 클 때만 상세.
- ArrowRight와 ArrowDown을 동일하게 제공한다.
- 오디오 재생 실패는 버튼 근처에서 원인과 데모 안내를 표시한다.
- 트랙 제출과 믹싱은 중복 실행을 막는다.
- 카세트 애니메이션은 데이터가 먼저 저장된 뒤 실행한다.

## 14. 상태와 피드백

모든 화면은 필요한 범위에서 Default, Loading, Empty, Error, Success를 제공한다. 주요 비동기 결과는 Toast와 `aria-live`에 동시에 알린다. 프로젝트 나가기와 데모 초기화는 ConfirmationModal을 사용한다.

## 15. 접근성과 안전

- 화면당 H1 하나, 순차적 제목 구조.
- 44×44px 터치 영역과 2px Focus Ring.
- 200% 확대에서도 측정·탐색·녹음·제출 가능.
- 스와이프 전용 행동 금지.
- 이미지 대체 텍스트와 장식 이미지 빈 alt 구분.
- 발성 중 통증·힘이 느껴지면 중단하도록 안내.
- 얼굴·성별·성부를 고정 판단하지 않는다.
- 참여 전 공개·연락 범위와 나가기·신고 경로를 안내한다.

## 16. 구현 구조

```text
ieum-rebuild/
├─ ieum-student.md
├─ ieum-design-rull.md
├─ ieum-project.md
├─ index.html
├─ css/style.css
├─ js/data.js
├─ js/state.js
├─ js/components.js
├─ js/app.js
├─ assets/fonts/
├─ assets/fontawesome/
├─ assets/images/        # 신규 WebP 10장
└─ qa/
```

## 17. 구현 원칙

- 모바일 우선, 430px 앱 셸.
- 의미 있는 HTML 구조.
- CSS 토큰과 재사용 컴포넌트.
- 실제 12화면 이동과 브라우저 뒤로 가기.
- 죽은 버튼 0.
- 로컬 이미지와 로컬 Font Awesome.
- 화면을 소개용 랜딩페이지로 축소하지 않는다.
- 실제 서버가 필요한 기능은 정직한 데모 상태로 처리한다.

## 18. 금지 규칙

- 음역 측정보다 사람 탐색을 먼저 배치
- 얼굴 프로필과 관계 매칭 카피
- 하트·X·매치 애니메이션
- 궁서체·붓글씨
- 정적 카세트 진행 이미지
- 기존 이미지 재사용 또는 외부 URL
- 텍스트 카드 반복
- 동작 없는 CTA
- 선택하지 않은 파스텔과 네온
- 12화면 통합·삭제

## 19. QA 체크리스트

### 문서 대조

- 세 프로젝트 문서의 용어·색상·화면 수가 일치한다.
- 화면 대응표의 UX 역할이 구현된다.
- 이미지 계획의 10장이 모두 존재하고 사용된다.

### 화면·기능

- 360·390·430px, 431px 이상 중앙 셸.
- 12화면 모두 H1·다음 행동·뒤로 가기 정상.
- Flow A/B/C를 처음부터 끝까지 완료.
- 0/50/100과 25% 확장 카세트 상태.
- Empty/Loading/Error/Success/Toast/Modal.
- 새로고침 후 핵심 상태 유지.
- 콘솔 오류, 깨진 이미지, 수평 넘침, 죽은 버튼 0.

### 접근성

- 키보드만으로 Flow A/B/C 완료.
- 포커스, 44px, 대체 텍스트, Live Region.
- 200% 확대, reduced motion.

### 반복

최소 3회 `문서 대조 → 전체 흐름 → 문제 기록 → 수정 → 회귀`를 수행하고 각 회차의 발견·수정·결과를 `qa/`에 남긴다.

## 20. MVP 완료 정의

다음을 모두 만족할 때만 완료다.

1. `ieum-student.md`, `ieum-design-rull.md`, `ieum-project.md`가 존재한다.
2. 세 문서가 원본 Beginner 규칙과 사용자 확정 내용을 모두 반영한다.
3. 12개 화면이 구현되고 축소되지 않는다.
4. 측정 → 곡 → 열린 파트 → 참여 → 녹음 → 카세트 → 믹싱 흐름을 완주한다.
5. 신규 이미지 정확히 10장이 로컬 WebP로 존재하고 모두 사용된다.
6. Font Awesome과 두 손글씨의 역할이 지켜진다.
7. 360·390·430px에서 최소 3회 회귀 검사를 통과한다.
8. 깨진 이미지, 콘솔 오류, 죽은 버튼, 수평 넘침과 미해결 문제가 0이다.
9. 화면별 QA 이미지와 기록이 있다.
10. 배포는 수행하지 않는다.

### 변경 이력

| 버전 | 날짜 | 변경 내용 |
|---|---|---|
| 1.0 | 2026-09-17 | 확정된 학생 기획, 12화면, B 색상과 신규 이미지 계획으로 작성 |

