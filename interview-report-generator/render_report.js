#!/usr/bin/env node
/**
 * 자인스쿨 면접 준비 보고서 docx 렌더러
 * 입력: report_content.json (LLM이 생성하는 구조화 콘텐츠)
 * 출력: {회사명}_{이름}님_면접준비보고서.docx
 *
 * 스타일 규칙:
 * - A4, 상하 1200 / 좌우 1440 마진, 맑은 고딕 전체
 * - 파란색 계열만 사용 (메인 #0C2D5A / 서브 #1A5276 / 배경 #D6EAF8 / 포인트 #2471A3 / 연한배경 #EBF5FB / 텍스트 #2C3E50)
 * - PageBreak는 커버→본문 1회만, 가로줄 금지, 연속 spacer 금지
 */
const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  WidthType, ShadingType, AlignmentType, PageBreak, BorderStyle, VerticalAlign,
} = require("docx");

const C = {
  main: "0C2D5A",
  sub: "1A5276",
  bg: "D6EAF8",
  point: "2471A3",
  light: "EBF5FB",
  text: "2C3E50",
  white: "FFFFFF",
  border: "B8D4E8",
};

const FONT = { ascii: "Malgun Gothic", eastAsia: "맑은 고딕", hAnsi: "Malgun Gothic" };
const PAGE_W = 11906, PAGE_H = 16838, MARGIN_TB = 1200, MARGIN_LR = 1440;
const CONTENT_W = PAGE_W - MARGIN_LR * 2; // 9026 DXA

const contentPath = process.argv[2] || path.join(__dirname, "report_content.json");
const data = JSON.parse(fs.readFileSync(contentPath, "utf-8"));

// ---------- helpers ----------
const run = (text, opts = {}) =>
  new TextRun({ text, font: FONT, size: opts.size ?? 20, color: opts.color ?? C.text, bold: opts.bold ?? false, ...opts.extra });

const para = (text, opts = {}) =>
  new Paragraph({
    alignment: opts.align,
    spacing: { before: opts.before ?? 0, after: opts.after ?? 120, line: opts.line ?? 300 },
    children: Array.isArray(text) ? text : [run(text, opts)],
  });

const spacer = (before = 40, after = 40) =>
  new Paragraph({ spacing: { before, after }, children: [] });

const h1 = (text) =>
  new Paragraph({
    spacing: { before: 200, after: 120 },
    children: [run(text, { size: 28, color: C.main, bold: true })],
  });

const h2 = (text) =>
  new Paragraph({
    spacing: { before: 160, after: 100 },
    children: [run(text, { size: 23, color: C.sub, bold: true })],
  });

const body = (text) => para(text, { size: 20, after: 140, line: 320 });

const bullet = (text) =>
  new Paragraph({
    numbering: { reference: "dot-list", level: 0 },
    spacing: { after: 80, line: 300 },
    children: [run(text, { size: 20 })],
  });

const CELL_MARGIN = { top: 50, bottom: 50, left: 100, right: 100 };
const cellBorders = {
  top: { style: BorderStyle.SINGLE, size: 4, color: C.border },
  bottom: { style: BorderStyle.SINGLE, size: 4, color: C.border },
  left: { style: BorderStyle.SINGLE, size: 4, color: C.border },
  right: { style: BorderStyle.SINGLE, size: 4, color: C.border },
};

function cell(text, { width, fill, color, bold, align, size } = {}) {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    shading: fill ? { type: ShadingType.CLEAR, fill } : undefined,
    margins: CELL_MARGIN,
    borders: cellBorders,
    verticalAlign: VerticalAlign.CENTER,
    children: [
      new Paragraph({
        alignment: align,
        spacing: { before: 20, after: 20, line: 280 },
        children: [run(text, { size: size ?? 19, color: color ?? C.text, bold: bold ?? false })],
      }),
    ],
  });
}

function headerCell(text, width, fill = C.main) {
  return cell(text, { width, fill, color: C.white, bold: true, align: AlignmentType.CENTER });
}

function simpleTable(columns, rows, widths, opts = {}) {
  const headerFill = opts.headerFill ?? C.main;
  return new Table({
    width: { size: CONTENT_W, type: WidthType.DXA },
    columnWidths: widths,
    rows: [
      new TableRow({ tableHeader: true, children: columns.map((c, i) => headerCell(c, widths[i], headerFill)) }),
      ...rows.map(
        (r) =>
          new TableRow({
            children: r.map((v, i) => {
              // O/△/X 매칭 컬럼 컬러 코딩 (파란 농담)
              if (opts.matchCol === i) {
                const fill = v === "O" ? C.bg : C.light;
                const color = v === "O" ? C.main : v === "△" ? C.sub : C.point;
                return cell(v, { width: widths[i], fill, color, bold: true, align: AlignmentType.CENTER });
              }
              return cell(v, { width: widths[i] });
            }),
          })
      ),
    ],
  });
}

/** 강점/보강 블록: 제목 헤더 행 + [라벨|내용] 행들 */
function blockTable(title, entries, headerFill) {
  const LABEL_W = 1700, VALUE_W = CONTENT_W - LABEL_W;
  return new Table({
    width: { size: CONTENT_W, type: WidthType.DXA },
    columnWidths: [LABEL_W, VALUE_W],
    rows: [
      new TableRow({
        children: [
          new TableCell({
            columnSpan: 2,
            width: { size: CONTENT_W, type: WidthType.DXA },
            shading: { type: ShadingType.CLEAR, fill: headerFill },
            margins: CELL_MARGIN,
            borders: cellBorders,
            children: [
              new Paragraph({
                spacing: { before: 30, after: 30 },
                children: [run(title, { size: 21, color: C.white, bold: true })],
              }),
            ],
          }),
        ],
      }),
      ...entries.map(
        ([label, value]) =>
          new TableRow({
            children: [
              cell(label, { width: LABEL_W, fill: C.light, color: C.main, bold: true, align: AlignmentType.CENTER }),
              cell(value, { width: VALUE_W }),
            ],
          })
      ),
    ],
  });
}

// ---------- document assembly ----------
const children = [];

// 커버 페이지 (spacer 상단 1개 / 하단 1개만)
children.push(new Paragraph({ spacing: { before: 3400, after: 0 }, children: [] }));
children.push(
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 240 },
    children: [run(`${data.meta.student_name}님 면접 준비 보고서`, { size: 52, color: C.main, bold: true })],
  })
);
children.push(
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 160 },
    children: [run(`${data.meta.company}  |  ${data.meta.job}  |  ${data.meta.student_name}`, { size: 22, color: C.text })],
  })
);
children.push(
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 100 },
    children: [run(data.meta.report_date, { size: 20, color: C.point })],
  })
);
children.push(
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 2600, after: 0 },
    children: [run("자인스쿨 면접 컨설팅", { size: 24, color: C.sub, bold: true })],
  })
);
// 커버 → 본문: 유일하게 허용된 PageBreak
children.push(new Paragraph({ children: [new PageBreak()] }));

// 기본 정보
children.push(h1("기본 정보"));
children.push(
  new Table({
    width: { size: CONTENT_W, type: WidthType.DXA },
    columnWidths: [1700, CONTENT_W - 1700],
    rows: data.basic_info.map(
      ([k, v]) =>
        new TableRow({
          children: [
            cell(k, { width: 1700, fill: C.bg, color: C.main, bold: true, align: AlignmentType.CENTER }),
            cell(v, { width: CONTENT_W - 1700 }),
          ],
        })
    ),
  })
);
children.push(spacer());

// STEP 0
children.push(h1(data.step0.title));
data.step0.paragraphs.forEach((p, idx) => {
  children.push(body(p));
  // 역량 매핑 bullet은 지정된 문단(“연결하면 다음과 같습니다.”) 뒤에 삽입
  if (p.endsWith("연결하면 다음과 같습니다.")) {
    data.step0.capability_map.forEach((c) => children.push(bullet(c)));
  }
});

// STEP 1
children.push(h1("STEP 1. 교차분석"));
children.push(h2("1-1. JD 핵심역량 매칭 분석"));
children.push(
  simpleTable(
    data.step1.jd_matching.columns,
    data.step1.jd_matching.rows,
    [2500, 5626, 900],
    { matchCol: 2 }
  )
);
children.push(para([
  run("O: 충분한 근거 확인   ", { size: 17, color: C.main, bold: true }),
  run("△: 보강 필요   ", { size: 17, color: C.sub, bold: true }),
  run("X: 새로 준비 필요 (입사 후 학습 영역)", { size: 17, color: C.point, bold: true }),
], { before: 60, after: 60 }));

children.push(h2("1-2. 서류 간 체크 포인트"));
children.push(simpleTable(data.step1.cross_check.columns, data.step1.cross_check.rows, [2400, 6626], { headerFill: C.sub }));
children.push(spacer());

// STEP 2
children.push(h1("STEP 2. 면접 강조 포인트 — 핵심 강점 5가지"));
children.push(body(data.step2.intro));
data.step2.strengths.forEach((s, i) => {
  children.push(
    blockTable(s.title, [
      ["근거 경험", s.evidence],
      ["추천 답변", s.answer],
      ["활용 추천", s.usage],
    ], C.main)
  );
  children.push(spacer());
});

// STEP 3
children.push(h1("STEP 3. 보강 포인트 — 미리 준비하면 든든한 5가지"));
children.push(body(data.step3.intro));
data.step3.items.forEach((s) => {
  children.push(
    blockTable(s.title, [
      ["예상 질문", s.question],
      ["답변 방향", s.direction],
      ["추천 답변", s.answer],
      ["준비 팁", s.tip],
    ], C.sub)
  );
  children.push(spacer());
});

// STEP 4
children.push(h1("STEP 4. 면접 전 체크리스트"));
children.push(h2("4-1. 면접 전 꼭 챙겨볼 5가지"));
children.push(simpleTable(data.step4.checklist.columns, data.step4.checklist.rows, [700, 2400, 5926], { headerFill: C.main }));
children.push(spacer());
children.push(h2("4-2. 직무 기초 개념 (가볍게 훑어두기)"));
children.push(simpleTable(data.step4.concepts.columns, data.step4.concepts.rows, [700, 2400, 5926], { headerFill: C.sub }));
children.push(spacer(120, 0));

// 권리 안내 문구
data.footer.forEach((line) =>
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 40 },
      children: [run(line, { size: 15, color: C.text })],
    })
  )
);

const doc = new Document({
  numbering: {
    config: [
      {
        reference: "dot-list",
        levels: [
          {
            level: 0,
            format: "bullet",
            text: "•",
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 360, hanging: 240 } } },
          },
        ],
      },
    ],
  },
  styles: {
    default: {
      document: { run: { font: FONT, size: 20, color: C.text } },
    },
  },
  sections: [
    {
      properties: {
        page: {
          size: { width: PAGE_W, height: PAGE_H },
          margin: { top: MARGIN_TB, bottom: MARGIN_TB, left: MARGIN_LR, right: MARGIN_LR },
        },
      },
      children,
    },
  ],
});

const outName = data.meta.filename || `${data.meta.company}_${data.meta.student_name}님_면접준비보고서.docx`;
const outPath = path.join(path.dirname(contentPath), outName);
Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync(outPath, buf);
  console.log("written:", outPath, buf.length, "bytes");
});
