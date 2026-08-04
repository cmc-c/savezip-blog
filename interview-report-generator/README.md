# 자인스쿨 면접 준비 보고서 자동 생성 — 프로토타입

기존 면접 예상질문 자동화 파이프라인(`interview-question-generator-agent`)에 붙일
**면접 준비 보고서(docx) 생성 단계**의 독립 프로토타입.

기존 파이프라인은 일절 수정하지 않고, 보고서 산출물 품질을 먼저 검증하기 위한 코드입니다.

## 구조

```
[콘텐츠 생성 - LLM]  →  report_content.json  →  [render_report.js]  →  {회사명}_{이름}님_면접준비보고서.docx
```

- **콘텐츠 생성**: 지원서(이력서/자소서/포폴) + JD + 웹 기업조사를 입력으로 LLM이
  `report_content.json` 구조를 채움. 무명 기업은 산업군 분류 후 산업 일반론 + 트렌드 기반으로 대체.
- **렌더링**: `render_report.js`가 JSON을 받아 자인스쿨 스타일 docx 생성 (npm `docx` 사용).

## 보고서 구성

1. 커버 (이름 / 회사|직무 / 자인스쿨 면접 컨설팅) — 유일한 PageBreak
2. 기본 정보 표
3. **STEP 0. 기업·직무 이해** — 채용의 실체를 해설하는 내러티브 + 역량 매핑
4. STEP 1. 교차분석 (JD 매칭 O/△/X, 자소서 보완 포인트, 서류 간 체크 포인트)
5. STEP 2. 면접 강조 포인트 — 핵심 강점 5가지 (근거 경험 / 추천 답변 40초 두괄식 / 활용 추천)
6. STEP 3. 보강 포인트 5가지 (예상 질문 / 답변 방향 / 추천 답변 / 준비 팁)
7. STEP 4. 면접 전 체크리스트 + 직무 기초 개념
8. 권리 안내 문구

면접 예상질문 20개 리스트는 docx에 포함하지 않고 별도 텍스트로 출력 (모드 B).

## 스타일 규칙

- A4, 상하 1200 / 좌우 1440 DXA 마진, 맑은 고딕 전체
- 파란색 계열만 사용: 메인 `#0C2D5A` / 서브 `#1A5276` / 배경 `#D6EAF8` / 포인트 `#2471A3` / 연한배경 `#EBF5FB` / 텍스트 `#2C3E50`
- 표: `WidthType.DXA`, `ShadingType.CLEAR`, 셀 마진 50/50/100/100
- PageBreak는 커버→본문 1회만, 가로줄 금지, 연속 spacer 금지
- 톤앤매너: "약점"→"보강 포인트", "면접관"→"평가자", 준비 팁은 낮은 난이도("~해 두세요")

## 실행

```bash
npm install docx
node render_report.js report_content.json
```

`report_content.json`은 멘티 개인정보를 포함하므로 저장소에 커밋하지 않습니다.
스키마는 `content_schema.md` 참조.

## 향후 통합 계획 (검증 후)

1. `interview-question-generator-agent`의 `process_student_files()` 뒤에 보고서 생성 단계 추가
2. 기업조사: Anthropic API web search 도구 / DART (jasoseo_class_prep 패턴 재활용)
3. 산출물을 Google Docs로 변환 업로드 → 운영자 우선 공유 → Discord 승인 후 멘티 전달
4. Discord 알림에 질문 시트 링크 + 보고서 링크 함께 표기
