import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { User } from 'firebase/auth';
import { AppHeader } from './components/AppHeader';
import {
  ChatStage,
  type ChatMessage,
  type GroundingSource,
  type SillokReference,
} from './components/ChatStage';
import { ClassmateJournalsModal } from './components/ClassmateJournalsModal';
import { ExplorationNotePanel } from './components/ExplorationNotePanel';
import { GoogleSheetsModal } from './components/GoogleSheetsModal';
import { KingQuickSidebar } from './components/KingQuickSidebar';
import { KingsGalleryHome } from './components/KingsGalleryHome';
import { SavedJournalsModal, type SavedJournalEntry } from './components/SavedJournalsModal';
import {
  SheetsConfirmModal,
  type PendingSheetsAction,
} from './components/SheetsConfirmModal';
import {
  SubmissionSuccessModal,
  type SubmissionSuccessInfo,
} from './components/SubmissionSuccessModal';
import { TimelineChartModal } from './components/TimelineChartModal';
import {
  JOSEON_KINGS,
  getKingById,
  type HistoricalTerm,
  type JoseonKing,
} from './data/kings';
import {
  clearCachedAccessToken,
  initGoogleAuth,
  signInWithGoogleSheets,
  signOutGoogle,
} from './lib/googleAuth';
import {
  addBlockedAuthorToSheet,
  appendJournalsToSheet,
  BLOCKLIST_TAB_NAME,
  buildConnectionTestRow,
  createTeacherSpreadsheet,
  deleteSheetRow,
  extractSpreadsheetId,
  fetchClassmateBoardData,
  inspectSpreadsheet,
  type BlockedAuthorEntry,
  type ClassmateSheetEntry,
  type ConnectedSheetConfig,
  type SheetJournalRowInput,
} from './lib/googleSheets';
import {
  DEFAULT_STUDENT_PROFILE,
  formatStudentProfileLabel,
  normalizeAuthorKey,
  SCHOOL_LEVELS,
  type SchoolLevel,
  type StudentProfile,
} from './lib/politeGuard';

const JOURNALS_STORAGE_KEY = 'joseon_timemachine_journals_v2';
const SHEET_CONFIG_STORAGE_KEY = 'joseon_timemachine_sheet_config_v1';
const STUDENT_PROFILE_STORAGE_KEY = 'joseon_timemachine_student_profile_v1';
const REQUEST_TIMEOUT_MS = 28000;

interface ApiChatResponse {
  reply?: string;
  sillokReference?: SillokReference;
  sources?: GroundingSource[];
  grounded?: boolean;
  terms?: HistoricalTerm[];
  followUpQuestions?: string[];
  error?: string;
}

function formatCurrentTime(): string {
  return new Intl.DateTimeFormat('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(new Date());
}

function formatJournalDate(): string {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date());
}

function createInitialMessages(king: JoseonKing): ChatMessage[] {
  return [
    {
      id: `greeting-${king.id}-${Date.now()}`,
      role: 'model',
      text: king.greeting,
      timestamp: formatCurrentTime(),
      isGreeting: true,
      sillokReference: {
        volume: `『${king.sillokTitle}』 (${king.reignYears})`,
        basis: `대표 업적·사건: ${king.headlineAchievement}`,
      },
      sources: [
        {
          title: `국사편찬위원회 『${king.sillokTitle}』 원문`,
          url: king.sillokUrl,
        },
      ],
    },
  ];
}

function buildJournalPlainText(params: {
  figureName: string;
  yearBadge: string;
  dateLabel: string;
  terms: HistoricalTerm[];
  reflection: string;
  questionCount: number;
}): string {
  const termLines =
    params.terms.length > 0
      ? params.terms
          .map(
            (t, idx) =>
              `${idx + 1}. ${t.term}${t.hanja ? ` (${t.hanja})` : ''} — ${t.definition}`,
          )
          .join('\n')
      : '(아직 정리된 용어가 없습니다.)';

  return [
    `[조선 타임머신 톡 — 조선왕조실록 역사 탐구 일지]`,
    `기록 일시: ${params.dateLabel}`,
    `만난 임금님: ${params.figureName} (${params.yearBadge})`,
    `나눈 질문 수: ${params.questionCount}회`,
    '',
    `[핵심 역사 용어]`,
    termLines,
    '',
    `[오늘의 역사 한 줄 기록]`,
    params.reflection.trim() || '(작성한 한 줄 기록이 아직 없습니다.)',
    '',
    `※ 참고 사료: 국사편찬위원회 조선왕조실록 (https://sillok.history.go.kr/)`,
  ].join('\n');
}

async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fallback below when clipboard permission is restricted in iframe
  }

  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}

function downloadTextFile(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function loadSavedJournals(): SavedJournalEntry[] {
  try {
    const raw =
      window.localStorage.getItem(JOURNALS_STORAGE_KEY) ||
      window.localStorage.getItem('joseon_timemachine_journals_v1');
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as SavedJournalEntry[]) : [];
  } catch {
    return [];
  }
}

function loadSavedSheetConfig(): ConnectedSheetConfig | null {
  try {
    const raw = window.localStorage.getItem(SHEET_CONFIG_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ConnectedSheetConfig>;
    if (
      typeof parsed.spreadsheetId === 'string' &&
      typeof parsed.title === 'string' &&
      typeof parsed.sheetName === 'string' &&
      typeof parsed.spreadsheetUrl === 'string' &&
      Array.isArray(parsed.tabs)
    ) {
      return parsed as ConnectedSheetConfig;
    }
    return null;
  } catch {
    return null;
  }
}

function loadSavedStudentProfile(): StudentProfile {
  try {
    const raw = window.localStorage.getItem(STUDENT_PROFILE_STORAGE_KEY);
    if (!raw) return DEFAULT_STUDENT_PROFILE;
    const parsed = JSON.parse(raw) as Partial<StudentProfile>;
    const schoolLevel: SchoolLevel =
      parsed.schoolLevel && SCHOOL_LEVELS.includes(parsed.schoolLevel)
        ? parsed.schoolLevel
        : DEFAULT_STUDENT_PROFILE.schoolLevel;
    return {
      schoolLevel,
      grade:
        typeof parsed.grade === 'number' && parsed.grade >= 1 && parsed.grade <= 6
          ? parsed.grade
          : DEFAULT_STUDENT_PROFILE.grade,
      classNumber:
        typeof parsed.classNumber === 'number' &&
        parsed.classNumber >= 1 &&
        parsed.classNumber <= 15
          ? parsed.classNumber
          : DEFAULT_STUDENT_PROFILE.classNumber,
      studentNumber:
        typeof parsed.studentNumber === 'number' &&
        parsed.studentNumber >= 1 &&
        parsed.studentNumber <= 35
          ? parsed.studentNumber
          : DEFAULT_STUDENT_PROFILE.studentNumber,
      name: typeof parsed.name === 'string' ? parsed.name : '',
    };
  } catch {
    return DEFAULT_STUDENT_PROFILE;
  }
}

function formatTermsForSheet(termList: HistoricalTerm[]): string {
  if (termList.length === 0) return '없음';
  return termList
    .map((t) => `${t.term}${t.hanja ? `(${t.hanja})` : ''}: ${t.definition}`)
    .join(' / ');
}

function parseInitialSheetParams(): { sheetId: string | null; sheetTab: string | null } {
  try {
    const params = new URLSearchParams(window.location.search);
    const rawId = params.get('sheetId');
    const sheetId = rawId ? extractSpreadsheetId(rawId) : null;
    const sheetTab = params.get('sheetTab');
    return { sheetId, sheetTab };
  } catch {
    return { sheetId: null, sheetTab: null };
  }
}

export default function App() {
  const defaultKing = JOSEON_KINGS[3] ?? JOSEON_KINGS[0]; // Default reference: King Sejong
  const initialSheetParams = useMemo(() => parseInitialSheetParams(), []);

  const [viewMode, setViewMode] = useState<'gallery' | 'chat'>('gallery');
  const [activeKingId, setActiveKingId] = useState<string>(defaultKing.id);
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    createInitialMessages(defaultKing),
  );
  const [terms, setTerms] = useState<HistoricalTerm[]>([defaultKing.initialTerm]);
  const [recommendedQuestions, setRecommendedQuestions] = useState<string[]>(
    defaultKing.suggestedQuestions,
  );
  const [isShowingFollowUps, setIsShowingFollowUps] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastFailedPrompt, setLastFailedPrompt] = useState<string | null>(null);

  const [highlightedTerm, setHighlightedTerm] = useState<string | null>(null);
  const [studentProfile, setStudentProfile] = useState<StudentProfile>(() =>
    loadSavedStudentProfile(),
  );
  const [reflectionText, setReflectionText] = useState('');
  const [isNoteDrawerOpen, setIsNoteDrawerOpen] = useState(false);
  const [isSavedModalOpen, setIsSavedModalOpen] = useState(false);
  const [isTimelineChartOpen, setIsTimelineChartOpen] = useState(false);
  const [savedJournals, setSavedJournals] = useState<SavedJournalEntry[]>(() =>
    loadSavedJournals(),
  );

  // Google Auth & Teacher Google Sheets state (accessToken is strictly in-memory only)
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(null);
  const [isSigningInGoogle, setIsSigningInGoogle] = useState(false);
  const [googleAuthError, setGoogleAuthError] = useState<string | null>(null);
  const [isSheetsModalOpen, setIsSheetsModalOpen] = useState<boolean>(
    () => Boolean(initialSheetParams.sheetId),
  );
  const [connectedSheet, setConnectedSheet] = useState<ConnectedSheetConfig | null>(() =>
    loadSavedSheetConfig(),
  );
  const [pendingUrlSheetId, setPendingUrlSheetId] = useState<string | null>(
    initialSheetParams.sheetId,
  );
  const [pendingUrlSheetTab] = useState<string | null>(initialSheetParams.sheetTab);
  const [pendingSheetsAction, setPendingSheetsAction] =
    useState<PendingSheetsAction | null>(null);
  const [isSubmittingSheets, setIsSubmittingSheets] = useState(false);
  const [sheetsConfirmError, setSheetsConfirmError] = useState<string | null>(null);
  const [sheetSubmitSuccess, setSheetSubmitSuccess] = useState<string | null>(null);
  const [sheetExportSuccess, setSheetExportSuccess] = useState<string | null>(null);
  const [sheetTestSuccess, setSheetTestSuccess] = useState<string | null>(null);
  const [previewRefreshKey, setPreviewRefreshKey] = useState(0);

  // Submission success popup + Classmate shared journals board + Teacher moderation state
  const [submissionPopupInfo, setSubmissionPopupInfo] =
    useState<SubmissionSuccessInfo | null>(null);
  const [isClassmateModalOpen, setIsClassmateModalOpen] = useState(false);
  const [classmateEntries, setClassmateEntries] = useState<ClassmateSheetEntry[]>([]);
  const [blockedAuthors, setBlockedAuthors] = useState<BlockedAuthorEntry[]>([]);
  const [isLoadingClassmates, setIsLoadingClassmates] = useState(false);
  const [classmateError, setClassmateError] = useState<string | null>(null);
  const [moderationNotice, setModerationNotice] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);
  const isLoadingRef = useRef(false);
  const messagesRef = useRef<ChatMessage[]>(messages);
  const termsRef = useRef<HistoricalTerm[]>(terms);
  const highlightTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    termsRef.current = terms;
  }, [terms]);

  const activeKing = useMemo(
    () => getKingById(activeKingId) ?? defaultKing,
    [activeKingId, defaultKing],
  );

  useEffect(() => {
    try {
      window.localStorage.setItem(JOURNALS_STORAGE_KEY, JSON.stringify(savedJournals));
    } catch {
      // Ignore storage quota errors gracefully
    }
  }, [savedJournals]);

  useEffect(() => {
    try {
      if (connectedSheet) {
        window.localStorage.setItem(SHEET_CONFIG_STORAGE_KEY, JSON.stringify(connectedSheet));
      } else {
        window.localStorage.removeItem(SHEET_CONFIG_STORAGE_KEY);
      }
    } catch {
      // Ignore storage quota errors gracefully
    }
  }, [connectedSheet]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STUDENT_PROFILE_STORAGE_KEY, JSON.stringify(studentProfile));
    } catch {
      // Ignore storage quota errors gracefully
    }
  }, [studentProfile]);

  useEffect(() => {
    const unsubscribe = initGoogleAuth(
      (user, token) => {
        setGoogleUser(user);
        setGoogleAccessToken(token);
      },
      () => {
        setGoogleUser(null);
        setGoogleAccessToken(null);
      },
    );
    return unsubscribe;
  }, []);

  // Auto-connect teacher's shared spreadsheet when ?sheetId=... is present and user signs in
  useEffect(() => {
    if (!pendingUrlSheetId || !googleAccessToken) return;
    let cancelled = false;

    inspectSpreadsheet(googleAccessToken, pendingUrlSheetId)
      .then((metadata) => {
        if (cancelled) return;
        const matchedTab = pendingUrlSheetTab
          ? metadata.tabs.find((t) => t.title === pendingUrlSheetTab)?.title
          : undefined;
        setConnectedSheet({
          spreadsheetId: metadata.spreadsheetId,
          title: metadata.title,
          sheetName: matchedTab || metadata.tabs[0].title,
          spreadsheetUrl: metadata.spreadsheetUrl,
          tabs: metadata.tabs,
        });
        setPendingUrlSheetId(null);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setGoogleAuthError(
          err instanceof Error
            ? err.message
            : '공유된 교사 Google Sheets에 접근하지 못했습니다.',
        );
      });

    return () => {
      cancelled = true;
    };
  }, [googleAccessToken, pendingUrlSheetId, pendingUrlSheetTab]);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
      if (highlightTimeoutRef.current !== null) {
        window.clearTimeout(highlightTimeoutRef.current);
      }
    };
  }, []);

  const flashTermHighlight = useCallback((termName: string) => {
    setHighlightedTerm(termName);
    if (highlightTimeoutRef.current !== null) {
      window.clearTimeout(highlightTimeoutRef.current);
    }
    highlightTimeoutRef.current = window.setTimeout(() => {
      setHighlightedTerm(null);
    }, 3200);
  }, []);

  const resetForKing = useCallback((king: JoseonKing) => {
    requestIdRef.current += 1;
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    isLoadingRef.current = false;
    setIsLoading(false);
    setErrorMessage(null);
    setLastFailedPrompt(null);

    const initial = createInitialMessages(king);
    messagesRef.current = initial;
    setMessages(initial);

    const initialTerms = [king.initialTerm];
    termsRef.current = initialTerms;
    setTerms(initialTerms);

    setRecommendedQuestions(king.suggestedQuestions);
    setIsShowingFollowUps(false);
    setReflectionText('');
    setHighlightedTerm(null);
  }, []);

  const handleSelectKingFromGallery = useCallback(
    (kingId: string) => {
      const nextKing = getKingById(kingId);
      if (!nextKing) return;
      setActiveKingId(nextKing.id);
      resetForKing(nextKing);
      setViewMode('chat');
    },
    [resetForKing],
  );

  const handleSwitchKingInChat = useCallback(
    (kingId: string) => {
      if (kingId === activeKingId) return;
      const nextKing = getKingById(kingId);
      if (!nextKing) return;
      setActiveKingId(nextKing.id);
      resetForKing(nextKing);
    },
    [activeKingId, resetForKing],
  );

  const handleReturnHome = useCallback(() => {
    requestIdRef.current += 1;
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    isLoadingRef.current = false;
    setIsLoading(false);
    setIsNoteDrawerOpen(false);
    setViewMode('gallery');
  }, []);

  const handleResetConversation = useCallback(() => {
    resetForKing(activeKing);
  }, [activeKing, resetForKing]);

  const sendToKing = useCallback(
    async (text: string, isRetry = false) => {
      const trimmed = text.trim();
      if (!trimmed || isLoadingRef.current) return;

      const currentRequestId = ++requestIdRef.current;
      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      let timedOut = false;
      const timeoutHandle = window.setTimeout(() => {
        timedOut = true;
        controller.abort();
      }, REQUEST_TIMEOUT_MS);

      isLoadingRef.current = true;
      setIsLoading(true);
      setErrorMessage(null);
      setLastFailedPrompt(null);

      // Exclude initial greeting from history so Gemini receives strict user-first turns
      const historyPayload = messagesRef.current
        .filter((m) => !m.isGreeting)
        .map((m) => ({ role: m.role, text: m.text }));

      if (!isRetry) {
        const userMsg: ChatMessage = {
          id: `user-${Date.now()}-${currentRequestId}`,
          role: 'user',
          text: trimmed,
          timestamp: formatCurrentTime(),
        };
        setMessages((prev) => [...prev, userMsg]);
      }

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            kingId: activeKing.id,
            message: trimmed,
            history: historyPayload,
            existingTerms: termsRef.current.map((t) => t.term),
          }),
        });

        const rawBody = await res.text();
        let data: ApiChatResponse = {};
        if (rawBody) {
          try {
            data = JSON.parse(rawBody) as ApiChatResponse;
          } catch {
            throw new Error(
              '서버 응답을 읽는 중 문제가 생겼어요. 잠시 후 다시 시도해 주세요.',
            );
          }
        }

        if (!res.ok) {
          throw new Error(
            data.error || '타임머신 연결에 문제가 생겼어요. 잠시 후 다시 시도해 주세요.',
          );
        }

        const replyText = data.reply?.trim();
        if (!replyText) {
          throw new Error('답변을 받아오지 못했어요. 다시 한 번 질문해 주세요.');
        }

        if (requestIdRef.current !== currentRequestId) {
          return;
        }

        const modelMsg: ChatMessage = {
          id: `model-${Date.now()}-${currentRequestId}`,
          role: 'model',
          text: replyText,
          timestamp: formatCurrentTime(),
          sillokReference: data.sillokReference,
          sources: Array.isArray(data.sources) ? data.sources : undefined,
          grounded: Boolean(data.grounded),
        };
        setMessages((prev) => [...prev, modelMsg]);

        if (Array.isArray(data.terms) && data.terms.length > 0) {
          setTerms((prev) => {
            const seen = new Set(prev.map((item) => item.term.replace(/\s+/g, '')));
            const additions = data.terms!.filter(
              (item) => !seen.has(item.term.replace(/\s+/g, '')),
            );
            if (additions.length === 0) return prev;
            flashTermHighlight(additions[0].term);
            return [...prev, ...additions];
          });
        }

        if (Array.isArray(data.followUpQuestions) && data.followUpQuestions.length === 3) {
          setRecommendedQuestions(data.followUpQuestions);
          setIsShowingFollowUps(true);
        }
      } catch (err: unknown) {
        if (requestIdRef.current !== currentRequestId) {
          return;
        }
        if (timedOut) {
          setErrorMessage(
            '실록 기록을 찾는 데 시간이 조금 길어졌어요. 다시 시도 버튼을 눌러 주세요.',
          );
          setLastFailedPrompt(trimmed);
          return;
        }
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        const message =
          err instanceof Error
            ? err.message
            : '타임머신 연결이 잠시 불안정해요. 다시 시도해 주세요.';
        setErrorMessage(message);
        setLastFailedPrompt(trimmed);
      } finally {
        window.clearTimeout(timeoutHandle);
        if (requestIdRef.current === currentRequestId) {
          isLoadingRef.current = false;
          setIsLoading(false);
        }
      }
    },
    [activeKing.id, flashTermHighlight],
  );

  const handleRetryLast = useCallback(() => {
    if (!lastFailedPrompt) return;
    void sendToKing(lastFailedPrompt, true);
  }, [lastFailedPrompt, sendToKing]);

  const handleSelectTermFromChat = useCallback(
    (termName: string) => {
      flashTermHighlight(termName);
      setIsNoteDrawerOpen(true);
    },
    [flashTermHighlight],
  );

  const studentQuestionCount = useMemo(
    () => messages.filter((m) => m.role === 'user').length,
    [messages],
  );

  const handleCopyCurrentJournal = useCallback(async () => {
    const plainText = buildJournalPlainText({
      figureName: activeKing.fullTitle,
      yearBadge: `${activeKing.reignYears} · ${activeKing.headlineAchievement}`,
      dateLabel: formatJournalDate(),
      terms,
      reflection: reflectionText,
      questionCount: studentQuestionCount,
    });
    return copyTextToClipboard(plainText);
  }, [activeKing, reflectionText, studentQuestionCount, terms]);

  const handleSaveCurrentJournal = useCallback(() => {
    const trimmed = reflectionText.trim();
    if (!trimmed) return false;

    const newEntry: SavedJournalEntry = {
      id: `journal-${Date.now()}`,
      figureId: activeKing.id,
      figureName: activeKing.fullTitle,
      yearBadge: `${activeKing.reignYears} · ${activeKing.headlineAchievement}`,
      savedAt: formatJournalDate(),
      reflection: trimmed,
      terms: [...terms],
      questionCount: studentQuestionCount,
    };

    setSavedJournals((prev) => [newEntry, ...prev]);
    return true;
  }, [activeKing, reflectionText, studentQuestionCount, terms]);

  const handleDownloadCurrentJournal = useCallback(() => {
    const plainText = buildJournalPlainText({
      figureName: activeKing.fullTitle,
      yearBadge: `${activeKing.reignYears} · ${activeKing.headlineAchievement}`,
      dateLabel: formatJournalDate(),
      terms,
      reflection: reflectionText,
      questionCount: studentQuestionCount,
    });
    const safeName = activeKing.name.replace(/\s+/g, '_');
    downloadTextFile(`조선타임머신톡_${activeKing.order}대_${safeName}_탐구일지.txt`, plainText);
  }, [activeKing, reflectionText, studentQuestionCount, terms]);

  const handleCopySavedEntry = useCallback(async (entry: SavedJournalEntry) => {
    const plainText = buildJournalPlainText({
      figureName: entry.figureName,
      yearBadge: entry.yearBadge,
      dateLabel: entry.savedAt,
      terms: entry.terms,
      reflection: entry.reflection,
      questionCount: entry.questionCount,
    });
    return copyTextToClipboard(plainText);
  }, []);

  const handleDownloadSavedEntry = useCallback((entry: SavedJournalEntry) => {
    const plainText = buildJournalPlainText({
      figureName: entry.figureName,
      yearBadge: entry.yearBadge,
      dateLabel: entry.savedAt,
      terms: entry.terms,
      reflection: entry.reflection,
      questionCount: entry.questionCount,
    });
    const safeName = entry.figureName.replace(/\s+/g, '_');
    downloadTextFile(`조선타임머신톡_${safeName}_탐구일지.txt`, plainText);
  }, []);

  const handleDeleteSavedEntry = useCallback((id: string) => {
    setSavedJournals((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const handleSignInGoogle = useCallback(async () => {
    setIsSigningInGoogle(true);
    setGoogleAuthError(null);
    try {
      const { user, accessToken } = await signInWithGoogleSheets();
      setGoogleUser(user);
      setGoogleAccessToken(accessToken);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Google 로그인에 실패했습니다. 팝업 차단을 해제한 뒤 다시 시도해 주세요.';
      setGoogleAuthError(msg);
    } finally {
      setIsSigningInGoogle(false);
    }
  }, []);

  const handleSignOutGoogle = useCallback(async () => {
    setGoogleAuthError(null);
    await signOutGoogle();
    setGoogleUser(null);
    setGoogleAccessToken(null);
  }, []);

  const handleChangeSheetTab = useCallback((tabName: string) => {
    setConnectedSheet((prev) => (prev ? { ...prev, sheetName: tabName } : prev));
  }, []);

  const handleCopyClassroomShareLink = useCallback(async () => {
    if (!connectedSheet) return false;
    const url = new URL(window.location.href);
    url.searchParams.set('sheetId', connectedSheet.spreadsheetId);
    url.searchParams.set('sheetTab', connectedSheet.sheetName);
    return copyTextToClipboard(url.toString());
  }, [connectedSheet]);

  const formattedStudentLabel = useMemo(
    () => formatStudentProfileLabel(studentProfile),
    [studentProfile],
  );

  const isCurrentStudentBlocked = useMemo(() => {
    if (blockedAuthors.length === 0) return false;
    const currentKey = normalizeAuthorKey(formattedStudentLabel);
    const currentBaseKey = normalizeAuthorKey(
      `${studentProfile.schoolLevel}${studentProfile.grade}학년${studentProfile.classNumber}반${studentProfile.studentNumber}번`,
    );
    return blockedAuthors.some((b) => {
      const blockedKey = normalizeAuthorKey(b.authorLabel);
      return blockedKey === currentKey || blockedKey.startsWith(currentBaseKey);
    });
  }, [blockedAuthors, formattedStudentLabel, studentProfile]);

  const refreshClassmateBoard = useCallback(async () => {
    if (!googleAccessToken || !connectedSheet) return;
    setIsLoadingClassmates(true);
    setClassmateError(null);
    try {
      const { entries, blockedAuthors: loadedBlocked } = await fetchClassmateBoardData(
        googleAccessToken,
        connectedSheet.spreadsheetId,
        connectedSheet.sheetName,
        connectedSheet.tabs,
      );
      setClassmateEntries(entries);
      setBlockedAuthors(loadedBlocked);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : '친구들 탐구 일지를 불러오지 못했습니다.';
      if (msg.includes('인증이 만료')) {
        clearCachedAccessToken();
        setGoogleAccessToken(null);
      }
      setClassmateError(msg);
    } finally {
      setIsLoadingClassmates(false);
    }
  }, [connectedSheet, googleAccessToken]);

  useEffect(() => {
    if (!googleAccessToken || !connectedSheet) {
      setClassmateEntries([]);
      setBlockedAuthors([]);
      return;
    }
    void refreshClassmateBoard();
  }, [googleAccessToken, connectedSheet, previewRefreshKey, refreshClassmateBoard]);

  const handleOpenClassmateBoard = useCallback(() => {
    setIsClassmateModalOpen(true);
    if (googleAccessToken && connectedSheet) {
      void refreshClassmateBoard();
    }
  }, [connectedSheet, googleAccessToken, refreshClassmateBoard]);

  const handleRequestCreateSheet = useCallback((title: string) => {
    setSheetsConfirmError(null);
    setPendingSheetsAction({
      type: 'create',
      title: title.trim() || '조선 타임머신 톡 — 우리 반 역사 탐구 일지',
    });
  }, []);

  const handleRequestTestWrite = useCallback(() => {
    if (!connectedSheet || !googleAccessToken) return;
    setSheetsConfirmError(null);
    setSheetTestSuccess(null);
    setPendingSheetsAction({
      type: 'append-test',
      targetSheet: connectedSheet,
      row: buildConnectionTestRow(
        formatJournalDate(),
        googleUser?.displayName || formattedStudentLabel || '교사 연결 테스트',
      ),
    });
  }, [connectedSheet, formattedStudentLabel, googleAccessToken, googleUser?.displayName]);

  const handleRequestSubmitCurrentToSheet = useCallback(() => {
    if (!connectedSheet || !googleAccessToken) {
      setIsSheetsModalOpen(true);
      return;
    }
    const trimmedReflection = reflectionText.trim();
    if (!trimmedReflection) return;

    const row: SheetJournalRowInput = {
      savedAt: formatJournalDate(),
      studentName: formattedStudentLabel,
      kingTitle: activeKing.fullTitle,
      eraAndAchievement: `${activeKing.reignYears} · ${activeKing.headlineAchievement}`,
      questionCount: studentQuestionCount,
      termsSummary: formatTermsForSheet(terms),
      reflection: trimmedReflection,
      sillokUrl: activeKing.sillokUrl,
    };

    setSheetsConfirmError(null);
    setPendingSheetsAction({
      type: 'append-current',
      targetSheet: connectedSheet,
      row,
      termCount: terms.length,
    });
  }, [
    activeKing,
    connectedSheet,
    formattedStudentLabel,
    googleAccessToken,
    reflectionText,
    studentQuestionCount,
    terms,
  ]);

  const mapSavedEntryToSheetRow = useCallback(
    (entry: SavedJournalEntry): SheetJournalRowInput => {
      const matchedKing = getKingById(entry.figureId);
      return {
        savedAt: entry.savedAt,
        studentName: formattedStudentLabel,
        kingTitle: entry.figureName,
        eraAndAchievement: entry.yearBadge,
        questionCount: entry.questionCount,
        termsSummary: formatTermsForSheet(entry.terms),
        reflection: entry.reflection,
        sillokUrl: matchedKing?.sillokUrl || 'https://sillok.history.go.kr/',
      };
    },
    [formattedStudentLabel],
  );

  const handleRequestExportSingleToSheet = useCallback(
    (entry: SavedJournalEntry) => {
      if (!connectedSheet || !googleAccessToken) {
        setIsSheetsModalOpen(true);
        return;
      }
      setSheetsConfirmError(null);
      setPendingSheetsAction({
        type: 'append-saved',
        targetSheet: connectedSheet,
        rows: [mapSavedEntryToSheetRow(entry)],
      });
    },
    [connectedSheet, googleAccessToken, mapSavedEntryToSheetRow],
  );

  const handleRequestExportAllToSheet = useCallback(
    (entries: SavedJournalEntry[]) => {
      if (!connectedSheet || !googleAccessToken) {
        setIsSheetsModalOpen(true);
        return;
      }
      if (entries.length === 0) return;
      setSheetsConfirmError(null);
      setPendingSheetsAction({
        type: 'append-saved',
        targetSheet: connectedSheet,
        rows: entries.map(mapSavedEntryToSheetRow),
      });
    },
    [connectedSheet, googleAccessToken, mapSavedEntryToSheetRow],
  );

  const handleRequestDeleteClassmateEntry = useCallback(
    (entry: ClassmateSheetEntry) => {
      if (!connectedSheet) return;
      setSheetsConfirmError(null);
      setPendingSheetsAction({
        type: 'delete-row',
        targetSheet: connectedSheet,
        entry,
      });
    },
    [connectedSheet],
  );

  const handleRequestDeleteAndBlockClassmate = useCallback(
    (entry: ClassmateSheetEntry) => {
      if (!connectedSheet) return;
      setSheetsConfirmError(null);
      setPendingSheetsAction({
        type: 'delete-and-block',
        targetSheet: connectedSheet,
        entry,
      });
    },
    [connectedSheet],
  );

  const handleRequestUnblockAuthor = useCallback(
    (blocked: BlockedAuthorEntry) => {
      if (!connectedSheet) return;
      setSheetsConfirmError(null);
      setPendingSheetsAction({
        type: 'unblock-author',
        targetSheet: connectedSheet,
        blocked,
      });
    },
    [connectedSheet],
  );

  const handleConfirmSheetsAction = useCallback(async () => {
    if (!pendingSheetsAction) return;
    if (!googleAccessToken) {
      setSheetsConfirmError('Google 로그인이 필요합니다. 먼저 로그인해 주세요.');
      return;
    }

    setIsSubmittingSheets(true);
    setSheetsConfirmError(null);

    try {
      if (pendingSheetsAction.type === 'create') {
        const created = await createTeacherSpreadsheet(
          googleAccessToken,
          pendingSheetsAction.title,
        );
        setConnectedSheet(created);
        setPendingSheetsAction(null);
        setPreviewRefreshKey((prev) => prev + 1);
      } else if (pendingSheetsAction.type === 'append-test') {
        await appendJournalsToSheet(
          googleAccessToken,
          pendingSheetsAction.targetSheet.spreadsheetId,
          pendingSheetsAction.targetSheet.sheetName,
          [pendingSheetsAction.row],
        );
        setPendingSheetsAction(null);
        setPreviewRefreshKey((prev) => prev + 1);
        setSheetTestSuccess(
          `연결 테스트 성공! ‘${pendingSheetsAction.targetSheet.title}’ (${pendingSheetsAction.targetSheet.sheetName}) 시트에 테스트 기록 1행이 정상 기록되었습니다.`,
        );
        window.setTimeout(() => setSheetTestSuccess(null), 6000);
      } else if (pendingSheetsAction.type === 'append-current') {
        await appendJournalsToSheet(
          googleAccessToken,
          pendingSheetsAction.targetSheet.spreadsheetId,
          pendingSheetsAction.targetSheet.sheetName,
          [pendingSheetsAction.row],
        );
        const submittedRow = pendingSheetsAction.row;
        const target = pendingSheetsAction.targetSheet;
        setPendingSheetsAction(null);
        setPreviewRefreshKey((prev) => prev + 1);
        setSheetSubmitSuccess(`‘${target.title}’ 시트에 제출 완료했어요!`);
        window.setTimeout(() => setSheetSubmitSuccess(null), 4000);
        setSubmissionPopupInfo({
          studentLabel: submittedRow.studentName,
          kingTitle: submittedRow.kingTitle,
          reflectionPreview: submittedRow.reflection,
          sheetTitle: target.title,
          sheetTabName: target.sheetName,
          sheetUrl: target.spreadsheetUrl,
          count: 1,
          submittedAt: submittedRow.savedAt,
        });
      } else if (pendingSheetsAction.type === 'append-saved') {
        const { updatedRows } = await appendJournalsToSheet(
          googleAccessToken,
          pendingSheetsAction.targetSheet.spreadsheetId,
          pendingSheetsAction.targetSheet.sheetName,
          pendingSheetsAction.rows,
        );
        const firstRow = pendingSheetsAction.rows[0];
        const target = pendingSheetsAction.targetSheet;
        setPendingSheetsAction(null);
        setPreviewRefreshKey((prev) => prev + 1);
        setSheetExportSuccess(
          `총 ${updatedRows}건의 탐구 일지를 ‘${target.title}’ 시트에 기록했어요!`,
        );
        window.setTimeout(() => setSheetExportSuccess(null), 4500);
        setSubmissionPopupInfo({
          studentLabel: firstRow?.studentName || formattedStudentLabel,
          kingTitle:
            updatedRows > 1
              ? `${firstRow?.kingTitle || '역사 탐구 일지'} 외 ${updatedRows - 1}건`
              : firstRow?.kingTitle || '역사 탐구 일지',
          reflectionPreview: firstRow?.reflection || '',
          sheetTitle: target.title,
          sheetTabName: target.sheetName,
          sheetUrl: target.spreadsheetUrl,
          count: updatedRows,
          submittedAt: formatJournalDate(),
        });
      } else if (pendingSheetsAction.type === 'delete-row') {
        const targetTab = pendingSheetsAction.targetSheet.tabs.find(
          (t) => t.title === pendingSheetsAction.targetSheet.sheetName,
        );
        if (!targetTab) {
          throw new Error('삭제할 시트 탭 정보를 찾지 못했습니다.');
        }
        await deleteSheetRow(
          googleAccessToken,
          pendingSheetsAction.targetSheet.spreadsheetId,
          targetTab.sheetId,
          pendingSheetsAction.entry.rowNumber,
        );
        setPendingSheetsAction(null);
        setPreviewRefreshKey((prev) => prev + 1);
        setModerationNotice(
          `선택한 탐구 일지(${pendingSheetsAction.entry.studentName})를 Google Sheets에서 삭제했습니다.`,
        );
        window.setTimeout(() => setModerationNotice(null), 4500);
      } else if (pendingSheetsAction.type === 'delete-and-block') {
        const targetTab = pendingSheetsAction.targetSheet.tabs.find(
          (t) => t.title === pendingSheetsAction.targetSheet.sheetName,
        );
        if (!targetTab) {
          throw new Error('삭제할 시트 탭 정보를 찾지 못했습니다.');
        }
        await deleteSheetRow(
          googleAccessToken,
          pendingSheetsAction.targetSheet.spreadsheetId,
          targetTab.sheetId,
          pendingSheetsAction.entry.rowNumber,
        );
        const updatedTabs = await addBlockedAuthorToSheet(
          googleAccessToken,
          pendingSheetsAction.targetSheet.spreadsheetId,
          pendingSheetsAction.targetSheet.tabs,
          pendingSheetsAction.entry.studentName,
          formatJournalDate(),
          '바르고 고운말 미준수 (교사 차단)',
        );
        setConnectedSheet((prev) => (prev ? { ...prev, tabs: updatedTabs } : prev));
        setPendingSheetsAction(null);
        setPreviewRefreshKey((prev) => prev + 1);
        setModerationNotice(
          `‘${pendingSheetsAction.entry.studentName}’의 글을 삭제하고 작성자를 차단 목록에 등록했습니다.`,
        );
        window.setTimeout(() => setModerationNotice(null), 5000);
      } else if (pendingSheetsAction.type === 'unblock-author') {
        const blockTab = pendingSheetsAction.targetSheet.tabs.find(
          (t) => t.title === BLOCKLIST_TAB_NAME,
        );
        if (!blockTab) {
          throw new Error('차단 목록 시트 탭을 찾지 못했습니다.');
        }
        await deleteSheetRow(
          googleAccessToken,
          pendingSheetsAction.targetSheet.spreadsheetId,
          blockTab.sheetId,
          pendingSheetsAction.blocked.rowNumber,
        );
        setPendingSheetsAction(null);
        setPreviewRefreshKey((prev) => prev + 1);
        setModerationNotice(
          `‘${pendingSheetsAction.blocked.authorLabel}’ 작성자의 차단을 해제했습니다.`,
        );
        window.setTimeout(() => setModerationNotice(null), 4500);
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Google Sheets 작업 중 오류가 발생했습니다.';
      if (msg.includes('인증이 만료')) {
        clearCachedAccessToken();
        setGoogleAccessToken(null);
      }
      setSheetsConfirmError(msg);
    } finally {
      setIsSubmittingSheets(false);
    }
  }, [formattedStudentLabel, googleAccessToken, pendingSheetsAction]);

  const isGoogleSignedIn = Boolean(googleUser && googleAccessToken);
  const isSheetConnected = Boolean(isGoogleSignedIn && connectedSheet);

  return (
    <div className="hanji-surface flex h-dvh flex-col overflow-hidden text-[#241E19]">
      <AppHeader
        viewMode={viewMode}
        activeKing={activeKing}
        termCount={terms.length}
        savedJournalCount={savedJournals.length}
        isSheetConnected={isSheetConnected}
        connectedSheetTitle={connectedSheet?.title}
        onReturnHome={handleReturnHome}
        onOpenTimelineChart={() => setIsTimelineChartOpen(true)}
        onOpenNoteDrawer={() => setIsNoteDrawerOpen(true)}
        onOpenSavedJournals={() => setIsSavedModalOpen(true)}
        onOpenSheetsModal={() => setIsSheetsModalOpen(true)}
        onOpenClassmateBoard={handleOpenClassmateBoard}
      />

      {viewMode === 'gallery' ? (
        <KingsGalleryHome
          isSheetConnected={isSheetConnected}
          connectedSheetTitle={connectedSheet?.title}
          onSelectKing={handleSelectKingFromGallery}
          onOpenTimelineChart={() => setIsTimelineChartOpen(true)}
          onOpenSheetsModal={() => setIsSheetsModalOpen(true)}
          onOpenClassmateBoard={handleOpenClassmateBoard}
        />
      ) : (
        <main className="mx-auto flex min-h-0 w-full max-w-[1520px] flex-1 flex-col lg:flex-row">
          <KingQuickSidebar
            activeKingId={activeKing.id}
            onSelectKing={handleSwitchKingInChat}
            onReturnHome={handleReturnHome}
          />

          <ChatStage
            king={activeKing}
            messages={messages}
            terms={terms}
            recommendedQuestions={recommendedQuestions}
            isShowingFollowUps={isShowingFollowUps}
            isLoading={isLoading}
            errorMessage={errorMessage}
            onSendMessage={(q) => void sendToKing(q, false)}
            onRetryLast={handleRetryLast}
            onResetConversation={handleResetConversation}
            onRestoreDefaultQuestions={() => {
              setRecommendedQuestions(activeKing.suggestedQuestions);
              setIsShowingFollowUps(false);
            }}
            onSelectTerm={handleSelectTermFromChat}
          />

          <ExplorationNotePanel
            king={activeKing}
            terms={terms}
            highlightedTerm={highlightedTerm}
            studentProfile={studentProfile}
            onChangeStudentProfile={setStudentProfile}
            isCurrentStudentBlocked={isCurrentStudentBlocked}
            reflectionText={reflectionText}
            onChangeReflection={setReflectionText}
            onCopyJournal={handleCopyCurrentJournal}
            onSaveJournal={handleSaveCurrentJournal}
            onDownloadJournal={handleDownloadCurrentJournal}
            connectedSheet={connectedSheet}
            isGoogleSignedIn={isGoogleSignedIn}
            sheetSubmitSuccess={sheetSubmitSuccess}
            onOpenSheetsModal={() => setIsSheetsModalOpen(true)}
            onOpenClassmateBoard={handleOpenClassmateBoard}
            onRequestSubmitToSheet={handleRequestSubmitCurrentToSheet}
            isDrawerOpen={isNoteDrawerOpen}
            onCloseDrawer={() => setIsNoteDrawerOpen(false)}
          />
        </main>
      )}

      <TimelineChartModal
        isOpen={isTimelineChartOpen}
        onClose={() => setIsTimelineChartOpen(false)}
      />

      <SavedJournalsModal
        isOpen={isSavedModalOpen}
        entries={savedJournals}
        connectedSheet={connectedSheet}
        isGoogleSignedIn={isGoogleSignedIn}
        sheetExportSuccess={sheetExportSuccess}
        onClose={() => setIsSavedModalOpen(false)}
        onOpenSheetsModal={() => setIsSheetsModalOpen(true)}
        onRequestExportSingle={handleRequestExportSingleToSheet}
        onRequestExportAll={handleRequestExportAllToSheet}
        onDeleteEntry={handleDeleteSavedEntry}
        onCopyEntry={handleCopySavedEntry}
        onDownloadEntry={handleDownloadSavedEntry}
      />

      <ClassmateJournalsModal
        isOpen={isClassmateModalOpen}
        isGoogleSignedIn={isGoogleSignedIn}
        connectedSheet={connectedSheet}
        entries={classmateEntries}
        blockedAuthors={blockedAuthors}
        isLoading={isLoadingClassmates}
        errorMessage={classmateError}
        moderationNotice={moderationNotice}
        onClose={() => setIsClassmateModalOpen(false)}
        onRefresh={refreshClassmateBoard}
        onOpenSheetsModal={() => setIsSheetsModalOpen(true)}
        onRequestDeleteEntry={handleRequestDeleteClassmateEntry}
        onRequestDeleteAndBlock={handleRequestDeleteAndBlockClassmate}
        onRequestUnblockAuthor={handleRequestUnblockAuthor}
      />

      <GoogleSheetsModal
        isOpen={isSheetsModalOpen}
        user={googleUser}
        accessToken={googleAccessToken}
        isSigningIn={isSigningInGoogle}
        authError={googleAuthError}
        connectedSheet={connectedSheet}
        pendingUrlSheetId={pendingUrlSheetId}
        previewRefreshKey={previewRefreshKey}
        testSuccessMessage={sheetTestSuccess}
        onClose={() => setIsSheetsModalOpen(false)}
        onSignIn={handleSignInGoogle}
        onSignOut={handleSignOutGoogle}
        onConnectSheet={setConnectedSheet}
        onChangeSheetTab={handleChangeSheetTab}
        onDisconnectSheet={() => {
          setConnectedSheet(null);
          setSheetTestSuccess(null);
        }}
        onRequestCreateSheet={handleRequestCreateSheet}
        onRequestTestWrite={handleRequestTestWrite}
        onCopyShareLink={handleCopyClassroomShareLink}
      />

      <SheetsConfirmModal
        action={pendingSheetsAction}
        isSubmitting={isSubmittingSheets}
        errorMessage={sheetsConfirmError}
        onConfirm={handleConfirmSheetsAction}
        onCancel={() => {
          if (!isSubmittingSheets) {
            setPendingSheetsAction(null);
            setSheetsConfirmError(null);
          }
        }}
      />

      <SubmissionSuccessModal
        info={submissionPopupInfo}
        onClose={() => setSubmissionPopupInfo(null)}
        onOpenClassmateBoard={handleOpenClassmateBoard}
      />
    </div>
  );
}
