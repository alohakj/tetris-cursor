# 테트리스 (교육용)

HTML, CSS, JavaScript만 사용하는 브라우저 테트리스 프로젝트입니다.  
빌드 도구와 외부 라이브러리 없이 바로 실행할 수 있습니다.

## 실행 방법

### 1. Live Server 사용 (권장)

VS Code / Cursor의 **Live Server** 확장을 설치한 뒤:

1. `src/index.html` 파일을 연다.
2. 편집기에서 우클릭 → **Open with Live Server**를 선택한다.
3. 브라우저에서 게임 보드와 상단 블록이 표시되면 성공이다.

> ES Modules(`type="module"`)를 사용하므로 `file://`로 직접 열면 일부 브라우저에서 동작하지 않을 수 있다. 로컬 서버 사용을 권장한다.

### 2. Python 내장 서버 사용

`src` 폴더에서 터미널을 열고 아래 명령을 실행한다.

```bash
# Python 3
cd src
python -m http.server 8000
```

브라우저에서 [http://localhost:8000](http://localhost:8000) 으로 접속한다.

### 3. Node.js npx 사용 (Node가 설치된 경우)

```bash
npx serve src
```

터미널에 표시되는 주소로 접속한다.

## 프로젝트 구조

```
tetris-cursor/
├── src/
│   ├── index.html   # 게임 화면 구조
│   ├── style.css    # 스타일
│   ├── board.js     # 보드 크기 상수, 빈 보드 생성
│   ├── pieces.js    # 테트로미노 정의, 블록 생성
│   ├── collision.js # 충돌 판정 (canMove)
│   ├── game.js      # 이동·회전·고정·줄 삭제
│   ├── input.js     # 키보드 입력 처리
│   ├── render.js    # 보드 합성·렌더링
│   └── script.js    # 게임 상태, 이벤트 연결
└── README.md        # 이 파일
```

## 현재 상태

- 게임 보드(10×20 CSS Grid), 점수, 시작/재시작 버튼, 조작법 안내 UI 완성
- I~L 테트로미노 정의 및 상단 블록 렌더링 구현
- `idle` / `playing` / `gameover` 게임 상태와 버튼 UI 동기화
- 자동 낙하, 충돌 판정, 블록 고정·재생성, 줄 삭제·점수
- 키보드 이동·회전·즉시 낙하, 게임 오버 오버레이

## 조작법

| 키 | 동작 |
|---|---|
| ← → | 좌우 이동 |
| ↑ | 블록 회전 |
| ↓ | 한 칸 내리기 |
| Space | 즉시 낙하 |
