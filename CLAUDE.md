# wants24.com 작업 규칙

## 사이트 정보
- 원츠 브랜드마케팅 회사 사이트, GitHub Pages 정적 사이트
- 대표 주소: https://www.wants24.com/ (항상 https + www)

## 사이트 구조
- 페이지 (모두 루트)
  - `index.html` 메인 · `about.html` 회사 소개 · `services.html` 서비스 7개 · `faq.html` 자주 묻는 질문 · `contact.html` 상담 신청(Web3Forms)
  - `privacy.html` 개인정보처리방침 (sitemap 제외) · `portfolio.html` 준비 중 (메뉴 숨김 · noindex · sitemap 제외)
  - `404.html` 없는 주소 안내 (외부 CSS·JS 없이 한 파일)
  - `Wants/` · `We-do/` · `config/` 옛 주소 → 새 페이지 이동용
- `css/style.css` 전 페이지 공통 스타일 하나
- `js/main.js` 공통 동작 (메뉴, 스크롤 등장, 포트폴리오 모달, 블로그·인스타그램 목록 채우기, FAQ 펼침, 상담 폼 전송)
- `js/scroll.js` 메인 포트폴리오 목록 커서 이미지 등 스크롤 연출 · `js/about.js` ABOUT 연출 · `js/services.js` SERVICES 탭 문구(SERVICE_DATA)와 연출
- `js/analytics.js` GA4 (측정 ID `GA_ID` 한 곳에서 관리, 전화·이메일 클릭 및 generate_lead 이벤트)
- `data/blog.json` · `data/instagram.json` GitHub Actions(`.github/workflows/`)가 `scripts/*.mjs` 로 자동 갱신 → 직접 수정하지 않음
- `robots.txt` · `sitemap.xml` · `llms.txt` 검색엔진·AI용 파일 · `_config.yml` 사이트에 올리지 않을 파일 지정 (CLAUDE.md 등)

## SEO 규칙 (2026-10-29 작업 내용 유지)
- 모든 페이지 h1은 정확히 1개. 제목 모양은 태그를 바꾸지 말고 CSS로만 변경
- <head>의 title, description, canonical, og·twitter 태그, theme-color, analytics.js는
  요청이 없으면 건드리지 말 것
- 화면의 회사 정보(주소, 전화번호, 영업시간), 서비스 이름·설명, FAQ 질문·답변이 바뀌면
  해당 페이지 JSON-LD도 같은 내용으로 맞출 것
- 새 이미지에는 alt 작성 (장식용은 alt="")
- 전화번호는 tel:, 이메일은 mailto: 링크 유지 (GA 클릭 추적용)
- 새 페이지 추가 시 sitemap.xml, llms.txt에 추가하고 title·description·canonical 따로 작성
- 내부 링크는 index.html 대신 / 사용
- JSON-LD에 별점·리뷰(aggregateRating, review)는 넣지 말 것

## GA4 / 개인정보처리방침
- js/analytics.js의 측정 ID는 아직 자리표시자. 개인정보처리방침 개정 공지 후 7일이 지나야 실제 ID 입력 가능
- _drafts/ 폴더는 저장소에 올리지 않음

## 작업 방식
- 수정 전에 무엇을 어떻게 바꿀지 먼저 정리해서 보여주기
- PC와 모바일 둘 다 확인
- 끝나면 JSON-LD 문법 검사, 페이지별 h1 개수 확인 결과 알려주기
- 커밋·푸시는 내가 확인한 뒤에

## 기존 개발 지침 (이전 CLAUDE.md 내용 유지)
- 모든 답변 및 설명은 한국어로 작성하고, 변경 사항은 명확하고 이해하기 쉽게 정리합니다.
- **기존 구조 보존**: 기존 파일/폴더 삭제 및 임의 변경 금지. 기존 디렉터리 구조와 기술 스택을 최우선으로 존중합니다.
- **코드 컨벤션 유지**: 기존 코드베이스의 변수명 규칙, 인덴트, 파일 분리 방식 등 스타일 가이드를 그대로 따릅니다.
- **최소 범위 변경**: 요청받은 기능 추가/수정에 필요한 최소한의 파일만 영향받도록 작업합니다.
- **영향도 사전 안내**: 규모가 크거나 의존성이 복잡한 코드를 수정하기 전, 영향받는 파일 목록과 수정 계획을 먼저 설명합니다.
- 기존 패키지 의존성을 훼손하는 명령어(`npm update` 전범위 실행, 임의 패키지 삭제 등)는 실행하지 않습니다.
- 개발 서버 확인 시 기존 프로세스를 강제 종료하거나 환경을 해치지 않도록 주의합니다.
