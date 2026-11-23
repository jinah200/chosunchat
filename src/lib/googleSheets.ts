export interface SheetTabInfo {
  sheetId: number;
  title: string;
}

export interface SpreadsheetMetadata {
  spreadsheetId: string;
  title: string;
  spreadsheetUrl: string;
  tabs: SheetTabInfo[];
}

export interface SheetJournalRowInput {
  savedAt: string;
  studentName: string;
  kingTitle: string;
  eraAndAchievement: string;
  questionCount: number;
  termsSummary: string;
  reflection: string;
  sillokUrl: string;
}

export interface ConnectedSheetConfig {
  spreadsheetId: string;
  title: string;
  sheetName: string;
  spreadsheetUrl: string;
  tabs: SheetTabInfo[];
}

const SHEETS_API_BASE = 'https://sheets.googleapis.com/v4/spreadsheets';

export const JOURNAL_HEADER_ROW = [
  '기록 일시',
  '학생 이름(모둠)',
  '만난 임금님',
  '재위 기간 · 주요 업적',
  '질문 수',
  '정리한 역사 용어',
  '오늘의 역사 한 줄 기록',
  '조선왕조실록 출처',
];

export function extractSpreadsheetId(input: string): string | null {
  const cleaned = input
    .trim()
    .replace(/^[<"'`「『(\s]+|[>"'`」』)\s]+$/g, '')
    .trim();
  if (!cleaned) return null;

  const urlMatch = cleaned.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (urlMatch && urlMatch[1]) {
    return urlMatch[1];
  }

  // Raw spreadsheet ID fallback (standard Google Sheets IDs are ~44 chars)
  if (/^[a-zA-Z0-9-_]{20,80}$/.test(cleaned)) {
    return cleaned;
  }

  return null;
}

export function extractSheetGid(input: string): number | null {
  const match = input.match(/[?#&]gid=(\d+)/);
  if (!match || !match[1]) return null;
  const parsed = Number.parseInt(match[1], 10);
  return Number.isNaN(parsed) ? null : parsed;
}

export function buildConnectionTestRow(
  savedAt: string,
  teacherOrStudentName: string,
): SheetJournalRowInput {
  return {
    savedAt,
    studentName: teacherOrStudentName.trim() || '교사 연결 테스트',
    kingTitle: '4대 세종 (연결 테스트)',
    eraAndAchievement: '1418~1450 · 훈민정음 창제',
    questionCount: 1,
    termsSummary: '훈민정음(訓民正音): 백성을 가르치는 바른 소리라는 뜻의 우리 글자',
    reflection: '[연결 테스트] 조선 타임머신 톡과 Google Sheets가 정상적으로 연결되었습니다.',
    sillokUrl: 'https://sillok.history.go.kr/id/kda',
  };
}

async function parseGoogleApiError(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as {
      error?: { message?: string; status?: string; code?: number };
    };
    const status = res.status;
    if (status === 401) {
      return 'Google 로그인 인증이 만료되었습니다. 로그아웃 후 다시 로그인해 주세요.';
    }
    if (status === 403) {
      return '이 Google Sheets에 접근할 권한이 없습니다. ① 현재 로그인한 Google 계정이 시트 소유자이거나 편집자인지, ② 시트 우측 상단 [공유]에서 편집자 권한이 열려 있는지 확인해 주세요.';
    }
    if (status === 404) {
      return '입력하신 Google Sheets 문서를 찾을 수 없습니다. 주소(URL)나 시트 ID가 정확한지 다시 확인해 주세요.';
    }
    return body.error?.message || `Google Sheets 요청 중 오류가 발생했습니다 (코드 ${status}).`;
  } catch {
    return `Google Sheets 요청 중 오류가 발생했습니다 (코드 ${res.status}).`;
  }
}

function quoteSheetTabName(sheetName: string): string {
  const escaped = sheetName.replace(/'/g, "''");
  return `'${escaped}'`;
}

export async function inspectSpreadsheet(
  accessToken: string,
  spreadsheetId: string,
): Promise<SpreadsheetMetadata> {
  const fields = encodeURIComponent(
    'spreadsheetId,spreadsheetUrl,properties.title,sheets.properties(sheetId,title)',
  );
  const res = await fetch(`${SHEETS_API_BASE}/${encodeURIComponent(spreadsheetId)}?fields=${fields}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    throw new Error(await parseGoogleApiError(res));
  }

  const data = (await res.json()) as {
    spreadsheetId: string;
    spreadsheetUrl?: string;
    properties?: { title?: string };
    sheets?: Array<{ properties?: { sheetId?: number; title?: string } }>;
  };

  const tabs: SheetTabInfo[] = (data.sheets ?? [])
    .map((s) => ({
      sheetId: s.properties?.sheetId ?? 0,
      title: s.properties?.title ?? '',
    }))
    .filter((t) => t.title.length > 0);

  if (tabs.length === 0) {
    throw new Error('스프레드시트에 사용 가능한 시트 탭이 없습니다.');
  }

  return {
    spreadsheetId: data.spreadsheetId,
    title: data.properties?.title || '제목 없는 스프레드시트',
    spreadsheetUrl:
      data.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${data.spreadsheetId}/edit`,
    tabs,
  };
}

export async function createTeacherSpreadsheet(
  accessToken: string,
  spreadsheetTitle: string,
): Promise<ConnectedSheetConfig> {
  const defaultTabTitle = '역사 탐구 일지';
  const createRes = await fetch(SHEETS_API_BASE, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title: spreadsheetTitle.trim() || '조선 타임머신 톡 — 학급 역사 탐구 일지',
        locale: 'ko_KR',
      },
      sheets: [
        {
          properties: {
            title: defaultTabTitle,
            gridProperties: {
              frozenRowCount: 1,
            },
          },
        },
      ],
    }),
  });

  if (!createRes.ok) {
    throw new Error(await parseGoogleApiError(createRes));
  }

  const created = (await createRes.json()) as {
    spreadsheetId: string;
    spreadsheetUrl?: string;
    properties?: { title?: string };
    sheets?: Array<{ properties?: { sheetId?: number; title?: string } }>;
  };

  const tabs: SheetTabInfo[] = (created.sheets ?? []).map((s) => ({
    sheetId: s.properties?.sheetId ?? 0,
    title: s.properties?.title ?? defaultTabTitle,
  }));
  const firstTab = tabs[0]?.title || defaultTabTitle;

  // Populate initial header row cleanly
  const range = encodeURIComponent(`${quoteSheetTabName(firstTab)}!A1:H1`);
  const headerRes = await fetch(
    `${SHEETS_API_BASE}/${encodeURIComponent(created.spreadsheetId)}/values/${range}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [JOURNAL_HEADER_ROW],
      }),
    },
  );

  if (!headerRes.ok) {
    throw new Error(await parseGoogleApiError(headerRes));
  }

  return {
    spreadsheetId: created.spreadsheetId,
    title: created.properties?.title || spreadsheetTitle,
    sheetName: firstTab,
    spreadsheetUrl:
      created.spreadsheetUrl ||
      `https://docs.google.com/spreadsheets/d/${created.spreadsheetId}/edit`,
    tabs,
  };
}

export async function fetchRecentSheetRows(
  accessToken: string,
  spreadsheetId: string,
  sheetName: string,
): Promise<string[][]> {
  const range = encodeURIComponent(`${quoteSheetTabName(sheetName)}!A1:H50`);
  const res = await fetch(
    `${SHEETS_API_BASE}/${encodeURIComponent(spreadsheetId)}/values/${range}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  if (!res.ok) {
    throw new Error(await parseGoogleApiError(res));
  }

  const data = (await res.json()) as { values?: string[][] };
  return Array.isArray(data.values) ? data.values : [];
}

export async function appendJournalsToSheet(
  accessToken: string,
  spreadsheetId: string,
  sheetName: string,
  rows: SheetJournalRowInput[],
): Promise<{ updatedRows: number }> {
  if (rows.length === 0) {
    return { updatedRows: 0 };
  }

  // Check if A1:H1 is empty so we can add headers automatically for blank teacher sheets
  const existingHeaderCheckRange = encodeURIComponent(`${quoteSheetTabName(sheetName)}!A1:H1`);
  const checkRes = await fetch(
    `${SHEETS_API_BASE}/${encodeURIComponent(spreadsheetId)}/values/${existingHeaderCheckRange}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  if (!checkRes.ok) {
    throw new Error(await parseGoogleApiError(checkRes));
  }

  const checkData = (await checkRes.json()) as { values?: string[][] };
  const isSheetEmpty = !checkData.values || checkData.values.length === 0;

  const formattedRows = rows.map((row) => [
    row.savedAt,
    row.studentName || '미입력',
    row.kingTitle,
    row.eraAndAchievement,
    `${row.questionCount}회`,
    row.termsSummary,
    row.reflection,
    row.sillokUrl,
  ]);

  const valuesToAppend = isSheetEmpty ? [JOURNAL_HEADER_ROW, ...formattedRows] : formattedRows;
  const appendRange = encodeURIComponent(`${quoteSheetTabName(sheetName)}!A1:H1`);

  const appendRes = await fetch(
    `${SHEETS_API_BASE}/${encodeURIComponent(spreadsheetId)}/values/${appendRange}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: valuesToAppend,
      }),
    },
  );

  if (!appendRes.ok) {
    throw new Error(await parseGoogleApiError(appendRes));
  }

  return { updatedRows: rows.length };
}

export const BLOCKLIST_TAB_NAME = '차단 목록';

export interface ClassmateSheetEntry {
  rowNumber: number; // 1-based row number in Google Sheets
  savedAt: string;
  studentName: string;
  kingTitle: string;
  eraAndAchievement: string;
  questionCount: string;
  termsSummary: string;
  reflection: string;
  sillokUrl: string;
}

export interface BlockedAuthorEntry {
  rowNumber: number; // 1-based row number in '차단 목록' tab
  authorLabel: string;
  blockedAt: string;
  reason: string;
}

export async function fetchClassmateBoardData(
  accessToken: string,
  spreadsheetId: string,
  sheetName: string,
  tabs: SheetTabInfo[],
): Promise<{
  entries: ClassmateSheetEntry[];
  blockedAuthors: BlockedAuthorEntry[];
}> {
  const mainRange = encodeURIComponent(`${quoteSheetTabName(sheetName)}!A1:H500`);
  const mainRes = await fetch(
    `${SHEETS_API_BASE}/${encodeURIComponent(spreadsheetId)}/values/${mainRange}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  if (!mainRes.ok) {
    throw new Error(await parseGoogleApiError(mainRes));
  }

  const mainData = (await mainRes.json()) as { values?: string[][] };
  const rawRows = Array.isArray(mainData.values) ? mainData.values : [];

  const entries: ClassmateSheetEntry[] = [];
  rawRows.forEach((row, idx) => {
    const rowNumber = idx + 1;
    // Skip header row (row 1 if it matches header labels)
    if (
      rowNumber === 1 &&
      ((row[0] || '').includes('기록 일시') || (row[1] || '').includes('학생'))
    ) {
      return;
    }
    const reflection = (row[6] || '').trim();
    const kingTitle = (row[2] || '').trim();
    if (!reflection && !kingTitle) {
      return;
    }
    entries.push({
      rowNumber,
      savedAt: (row[0] || '').trim(),
      studentName: (row[1] || '익명 학생').trim(),
      kingTitle: kingTitle || '조선 국왕',
      eraAndAchievement: (row[3] || '').trim(),
      questionCount: (row[4] || '').trim(),
      termsSummary: (row[5] || '').trim(),
      reflection,
      sillokUrl: (row[7] || 'https://sillok.history.go.kr/').trim(),
    });
  });

  // Load teacher blocklist tab if it exists in the spreadsheet
  let blockedAuthors: BlockedAuthorEntry[] = [];
  const hasBlockTab = tabs.some((t) => t.title === BLOCKLIST_TAB_NAME);
  if (hasBlockTab) {
    const blockRange = encodeURIComponent(`${quoteSheetTabName(BLOCKLIST_TAB_NAME)}!A1:C300`);
    const blockRes = await fetch(
      `${SHEETS_API_BASE}/${encodeURIComponent(spreadsheetId)}/values/${blockRange}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    if (blockRes.ok) {
      const blockData = (await blockRes.json()) as { values?: string[][] };
      const bRows = Array.isArray(blockData.values) ? blockData.values : [];
      blockedAuthors = bRows
        .map((r, i) => ({
          rowNumber: i + 1,
          authorLabel: (r[0] || '').trim(),
          blockedAt: (r[1] || '').trim(),
          reason: (r[2] || '').trim(),
        }))
        .filter(
          (item) =>
            item.authorLabel.length > 0 &&
            !(item.rowNumber === 1 && item.authorLabel.includes('차단')),
        );
    }
  }

  // Return newest entries first for friendly classroom viewing
  return {
    entries: entries.reverse(),
    blockedAuthors,
  };
}

export async function deleteSheetRow(
  accessToken: string,
  spreadsheetId: string,
  sheetTabId: number,
  rowNumber: number,
): Promise<void> {
  const res = await fetch(
    `${SHEETS_API_BASE}/${encodeURIComponent(spreadsheetId)}:batchUpdate`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId: sheetTabId,
                dimension: 'ROWS',
                startIndex: rowNumber - 1,
                endIndex: rowNumber,
              },
            },
          },
        ],
      }),
    },
  );

  if (!res.ok) {
    throw new Error(await parseGoogleApiError(res));
  }
}

export async function addBlockedAuthorToSheet(
  accessToken: string,
  spreadsheetId: string,
  existingTabs: SheetTabInfo[],
  authorLabel: string,
  blockedAt: string,
  reason: string,
): Promise<SheetTabInfo[]> {
  let updatedTabs = [...existingTabs];
  const hasBlockTab = updatedTabs.some((t) => t.title === BLOCKLIST_TAB_NAME);

  if (!hasBlockTab) {
    const createTabRes = await fetch(
      `${SHEETS_API_BASE}/${encodeURIComponent(spreadsheetId)}:batchUpdate`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [
            {
              addSheet: {
                properties: {
                  title: BLOCKLIST_TAB_NAME,
                  gridProperties: { frozenRowCount: 1 },
                },
              },
            },
          ],
        }),
      },
    );

    if (!createTabRes.ok) {
      throw new Error(await parseGoogleApiError(createTabRes));
    }

    const createData = (await createTabRes.json()) as {
      replies?: Array<{ addSheet?: { properties?: { sheetId?: number; title?: string } } }>;
    };
    const newTabId = createData.replies?.[0]?.addSheet?.properties?.sheetId ?? 0;
    updatedTabs = [...updatedTabs, { sheetId: newTabId, title: BLOCKLIST_TAB_NAME }];

    const headerRange = encodeURIComponent(`${quoteSheetTabName(BLOCKLIST_TAB_NAME)}!A1:C1`);
    await fetch(
      `${SHEETS_API_BASE}/${encodeURIComponent(spreadsheetId)}/values/${headerRange}?valueInputOption=USER_ENTERED`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: [['차단된 작성자', '차단 일시', '사유']],
        }),
      },
    );
  }

  const appendRange = encodeURIComponent(`${quoteSheetTabName(BLOCKLIST_TAB_NAME)}!A1:C1`);
  const appendRes = await fetch(
    `${SHEETS_API_BASE}/${encodeURIComponent(spreadsheetId)}/values/${appendRange}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [[authorLabel, blockedAt, reason]],
      }),
    },
  );

  if (!appendRes.ok) {
    throw new Error(await parseGoogleApiError(appendRes));
  }

  return updatedTabs;
}
