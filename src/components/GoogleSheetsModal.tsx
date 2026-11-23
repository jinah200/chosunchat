import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  FilePlus2,
  FileSpreadsheet,
  FlaskConical,
  Link2,
  LogOut,
  RefreshCw,
  Share2,
  Table2,
  Unlink,
  Users,
  X,
} from 'lucide-react';
import type { User } from 'firebase/auth';
import {
  extractSheetGid,
  extractSpreadsheetId,
  fetchRecentSheetRows,
  inspectSpreadsheet,
  type ConnectedSheetConfig,
} from '../lib/googleSheets';
import { GoogleSignInButton } from './GoogleSignInButton';

interface GoogleSheetsModalProps {
  isOpen: boolean;
  user: User | null;
  accessToken: string | null;
  isSigningIn: boolean;
  authError: string | null;
  connectedSheet: ConnectedSheetConfig | null;
  pendingUrlSheetId: string | null;
  previewRefreshKey: number;
  testSuccessMessage: string | null;
  onClose: () => void;
  onSignIn: () => Promise<void>;
  onSignOut: () => Promise<void>;
  onConnectSheet: (config: ConnectedSheetConfig) => void;
  onChangeSheetTab: (tabName: string) => void;
  onDisconnectSheet: () => void;
  onRequestCreateSheet: (title: string) => void;
  onRequestTestWrite: () => void;
  onCopyShareLink: () => Promise<boolean>;
}

export function GoogleSheetsModal({
  isOpen,
  user,
  accessToken,
  isSigningIn,
  authError,
  connectedSheet,
  pendingUrlSheetId,
  previewRefreshKey,
  testSuccessMessage,
  onClose,
  onSignIn,
  onSignOut,
  onConnectSheet,
  onChangeSheetTab,
  onDisconnectSheet,
  onRequestCreateSheet,
  onRequestTestWrite,
  onCopyShareLink,
}: GoogleSheetsModalProps) {
  const [connectMode, setConnectMode] = useState<'existing' | 'create'>('existing');
  const [sheetUrlInput, setSheetUrlInput] = useState('');
  const [newSheetTitle, setNewSheetTitle] = useState('조선 타임머신 톡 — 우리 반 역사 탐구 일지');
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);
  const [connectSuccessTitle, setConnectSuccessTitle] = useState<string | null>(null);
  const [previewRows, setPreviewRows] = useState<string[][]>([]);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [shareCopied, setShareCopied] = useState(false);

  const isSignedIn = Boolean(user && accessToken);
  const isSheetConnected = Boolean(isSignedIn && connectedSheet);

  const parsedInputId = useMemo(
    () => extractSpreadsheetId(sheetUrlInput),
    [sheetUrlInput],
  );

  useEffect(() => {
    if (pendingUrlSheetId && !sheetUrlInput) {
      setSheetUrlInput(pendingUrlSheetId);
      setConnectMode('existing');
    }
  }, [pendingUrlSheetId, sheetUrlInput]);

  useEffect(() => {
    if (!isOpen || !accessToken || !connectedSheet) {
      setPreviewRows([]);
      setPreviewError(null);
      return;
    }

    let cancelled = false;
    setIsLoadingPreview(true);
    setPreviewError(null);

    fetchRecentSheetRows(accessToken, connectedSheet.spreadsheetId, connectedSheet.sheetName)
      .then((rows) => {
        if (!cancelled) {
          setPreviewRows(rows);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setPreviewError(
            err instanceof Error ? err.message : '시트 데이터를 불러오지 못했습니다.',
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoadingPreview(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, accessToken, connectedSheet, previewRefreshKey]);

  if (!isOpen) return null;

  const handleConnectExisting = async () => {
    if (!accessToken) return;
    const extractedId = extractSpreadsheetId(sheetUrlInput);
    const extractedGid = extractSheetGid(sheetUrlInput);

    if (!extractedId) {
      setConnectError(
        '올바른 Google Sheets 주소(URL) 또는 시트 ID를 붙여넣어 주세요. (예: 1mAco9...)',
      );
      return;
    }

    setIsConnecting(true);
    setConnectError(null);
    setConnectSuccessTitle(null);
    try {
      const metadata = await inspectSpreadsheet(accessToken, extractedId);
      const matchedTabByGid =
        extractedGid !== null
          ? metadata.tabs.find((t) => t.sheetId === extractedGid)?.title
          : undefined;

      onConnectSheet({
        spreadsheetId: metadata.spreadsheetId,
        title: metadata.title,
        sheetName: matchedTabByGid || metadata.tabs[0].title,
        spreadsheetUrl: metadata.spreadsheetUrl,
        tabs: metadata.tabs,
      });
      setConnectSuccessTitle(metadata.title);
      setSheetUrlInput('');
    } catch (err: unknown) {
      setConnectError(
        err instanceof Error ? err.message : '스프레드시트를 연결하지 못했습니다.',
      );
    } finally {
      setIsConnecting(false);
    }
  };

  const handleRefreshPreview = async () => {
    if (!accessToken || !connectedSheet) return;
    setIsLoadingPreview(true);
    setPreviewError(null);
    try {
      const rows = await fetchRecentSheetRows(
        accessToken,
        connectedSheet.spreadsheetId,
        connectedSheet.sheetName,
      );
      setPreviewRows(rows);
    } catch (err: unknown) {
      setPreviewError(
        err instanceof Error ? err.message : '시트 데이터를 새로고침하지 못했습니다.',
      );
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const handleCopyLink = async () => {
    const ok = await onCopyShareLink();
    if (ok) {
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2400);
    }
  };

  const headerRow = previewRows[0] ?? [];
  const dataRows = previewRows.slice(1).slice(-5).reverse();

  const currentStep = !isSignedIn ? 1 : !connectedSheet ? 2 : 3;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#241E19]/50 p-3 sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-label="교사별 내 Google Sheets 연결 설정"
    >
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-[#DFD5C2] bg-[#FAF6EC] shadow-2xl">
        {/* Top Modal Header */}
        <div className="flex items-center justify-between gap-4 border-b border-[#E2D8C5] bg-[#FDFBF6] px-6 py-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EAF4ED] text-[#2E6B47]">
              <FileSpreadsheet className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h2 className="font-hanji-display text-lg font-bold text-[#241E19] sm:text-xl">
                내 학급 Google Sheets 연결
              </h2>
              <p className="text-xs text-[#65594C] sm:text-[13px]">
                선생님마다 각자 본인의 시트를 연결해 우리 반 탐구 일지만 따로 모을 수 있어요.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="창 닫기"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#DFD5C2] bg-[#FAF6EC] text-[#4E443B] hover:bg-[#EFE8D8]"
          >
            <X className="h-4.5 w-4.5" aria-hidden="true" />
          </button>
        </div>

        {/* 3-Step Visual Progress Bar */}
        <div className="border-b border-[#E6DEC9] bg-[#F5EFE2] px-6 py-3">
          <ol className="grid grid-cols-3 gap-2 text-xs sm:text-[13px]">
            {[
              { step: 1, label: 'Google 로그인' },
              { step: 2, label: '내 시트 연결' },
              { step: 3, label: '테스트 · 학생 공유' },
            ].map((item) => {
              const isDone = currentStep > item.step || (item.step === 3 && isSheetConnected);
              const isActive = currentStep === item.step;
              return (
                <li
                  key={item.step}
                  className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 font-semibold ${
                    isDone
                      ? 'bg-[#E6F3EA] text-[#1F5434]'
                      : isActive
                        ? 'bg-[#FDFBF6] text-[#241E19] ring-1 ring-[#D4C7AE]'
                        : 'text-[#847768]'
                  }`}
                >
                  <span
                    className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold tabular-nums ${
                      isDone
                        ? 'bg-[#2E6B47] text-white'
                        : isActive
                          ? 'bg-[#264B75] text-white'
                          : 'bg-[#DFD5C2] text-[#6B5F52]'
                    }`}
                  >
                    {isDone ? <Check className="h-3 w-3" aria-hidden="true" /> : item.step}
                  </span>
                  <span className="truncate">{item.label}</span>
                </li>
              );
            })}
          </ol>
        </div>

        {/* Scrollable Content */}
        <div className="hanji-scroll flex-1 space-y-6 overflow-y-auto px-6 py-5">
          {/* STEP 1: Google Account Login */}
          <section className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-[15px] font-bold text-[#241E19]">
                1단계. 본인 Google 계정 로그인
              </h3>
              {isSignedIn && (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-[#225336]">
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  <span>로그인 완료</span>
                </span>
              )}
            </div>

            {!isSignedIn ? (
              <div className="hanji-card rounded-xl border border-[#DFD5C2] p-5">
                <p className="text-sm leading-relaxed text-[#453C34]">
                  먼저 <strong className="font-semibold text-[#241E19]">시트를 가진 선생님(또는 제출할 학생)의 Google 계정</strong>으로
                  로그인해 주세요. 로그인한 계정의 권한으로 내 시트에 안전하게 연결됩니다.
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <GoogleSignInButton
                    onClick={() => void onSignIn()}
                    disabled={isSigningIn}
                    label={isSigningIn ? '로그인 창 여는 중...' : 'Google 계정으로 로그인'}
                  />
                  {pendingUrlSheetId && (
                    <span className="text-xs font-medium text-[#264B75]">
                      로그인하면 공유받은 학급 시트가 자동으로 연결돼요.
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#C2DCC8] bg-[#EFF7F1] px-4 py-3.5">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-[#241E19] truncate">
                    {user?.displayName || 'Google 사용자'}
                  </p>
                  <p className="text-xs text-[#4A5F52] truncate">{user?.email}</p>
                </div>

                <button
                  type="button"
                  onClick={() => void onSignOut()}
                  className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-[#C7D5CB] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#3C332B] hover:bg-[#F7F3EA] whitespace-nowrap"
                >
                  <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>다른 계정으로 전환</span>
                </button>
              </div>
            )}

            {authError && (
              <div
                role="alert"
                className="flex items-start gap-2.5 rounded-xl border border-[#DFB4B4] bg-[#FDF2F2] p-4 text-sm leading-relaxed text-[#7D2424]"
              >
                <AlertCircle className="mt-0.5 h-4.5 w-4.5 shrink-0" aria-hidden="true" />
                <span>{authError}</span>
              </div>
            )}
          </section>

          {/* STEP 2 & 3: Connect Sheet OR Connected Dashboard */}
          {isSignedIn && (
            <section className="space-y-4 border-t border-[#E6DEC9] pt-5">
              {!connectedSheet ? (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-[15px] font-bold text-[#241E19]">
                      2단계. 연결할 내 Google Sheets 선택
                    </h3>

                    {/* Clean Segmented Choice */}
                    <div
                      role="tablist"
                      aria-label="시트 연결 방식"
                      className="inline-flex rounded-xl border border-[#DDD2BC] bg-[#EFE8DA] p-1"
                    >
                      <button
                        type="button"
                        role="tab"
                        aria-selected={connectMode === 'existing'}
                        onClick={() => setConnectMode('existing')}
                        className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors whitespace-nowrap ${
                          connectMode === 'existing'
                            ? 'bg-[#FDFBF6] text-[#241E19] shadow-xs'
                            : 'text-[#65594C] hover:text-[#241E19]'
                        }`}
                      >
                        내 기존 시트 연결
                      </button>
                      <button
                        type="button"
                        role="tab"
                        aria-selected={connectMode === 'create'}
                        onClick={() => setConnectMode('create')}
                        className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors whitespace-nowrap ${
                          connectMode === 'create'
                            ? 'bg-[#FDFBF6] text-[#241E19] shadow-xs'
                            : 'text-[#65594C] hover:text-[#241E19]'
                        }`}
                      >
                        새 학급 시트 만들기
                      </button>
                    </div>
                  </div>

                  {connectMode === 'existing' ? (
                    <div className="hanji-card space-y-4 rounded-xl border border-[#DFD5C2] p-5">
                      <div>
                        <div className="flex items-center gap-2 text-[15px] font-bold text-[#241E19]">
                          <Link2 className="h-4.5 w-4.5 text-[#264B75]" aria-hidden="true" />
                          <span>내 Google Sheets 주소(URL) 또는 시트 ID 붙여넣기</span>
                        </div>
                        <p className="mt-1.5 text-sm leading-relaxed text-[#544A40]">
                          선생님이 이미 만들어 두신 Google Sheets의 <strong>전체 주소</strong>나{' '}
                          <strong>시트 ID</strong>를 아래 칸에 붙여넣고{' '}
                          <strong className="text-[#264B75]">[내 시트 연결하기]</strong>를 누르면 바로 연결됩니다.
                        </p>
                      </div>

                      {/* Visual URL Anatomy Helper */}
                      <div className="rounded-lg border border-[#E6DEC9] bg-[#F6F1E6] px-3.5 py-2.5 text-xs text-[#544A40]">
                        <span className="font-semibold text-[#312922]">주소에서 시트 ID 위치: </span>
                        <span className="break-all font-mono text-[11px] text-[#786B5D]">
                          docs.google.com/spreadsheets/d/
                          <strong className="rounded bg-[#E6F3EA] px-1 py-0.5 text-[#1F5434]">
                            시트ID(44자리 영문·숫자)
                          </strong>
                          /edit
                        </span>
                      </div>

                      <div className="space-y-2.5">
                        <label
                          htmlFor="existing-sheet-url"
                          className="block text-xs font-bold text-[#3C332B]"
                        >
                          Google Sheets 주소 또는 시트 ID
                        </label>
                        <div className="flex flex-col gap-2.5 sm:flex-row">
                          <input
                            id="existing-sheet-url"
                            type="text"
                            value={sheetUrlInput}
                            onChange={(e) => {
                              setSheetUrlInput(e.target.value);
                              if (connectError) setConnectError(null);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && parsedInputId && !isConnecting) {
                                void handleConnectExisting();
                              }
                            }}
                            placeholder="https://docs.google.com/spreadsheets/d/... 또는 시트 ID 입력"
                            className="min-h-[46px] flex-1 rounded-xl border border-[#CFC2A8] bg-white px-3.5 text-sm text-[#241E19] placeholder:text-[#96897A] focus:border-[#264B75] focus:outline-none"
                          />
                          <button
                            type="button"
                            disabled={isConnecting || sheetUrlInput.trim().length === 0}
                            onClick={() => void handleConnectExisting()}
                            className="inline-flex min-h-[46px] shrink-0 items-center justify-center gap-1.5 rounded-xl bg-[#264B75] px-5 py-2.5 text-sm font-bold text-white hover:opacity-92 disabled:opacity-45 whitespace-nowrap"
                          >
                            <span>{isConnecting ? '시트 확인 중...' : '내 시트 연결하기'}</span>
                          </button>
                        </div>

                        {/* Live Recognition Feedback */}
                        {sheetUrlInput.trim().length > 0 && (
                          <div className="text-xs">
                            {parsedInputId ? (
                              <p className="flex items-center gap-1.5 font-semibold text-[#225336]">
                                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                                <span>
                                  시트 ID가 정상 인식되었어요:{' '}
                                  <code className="rounded bg-[#E6F3EA] px-1.5 py-0.5 font-mono text-[11px]">
                                    {parsedInputId}
                                  </code>
                                </span>
                              </p>
                            ) : (
                              <p className="text-[#8E4F1D]">
                                전체 시트 주소(https://docs.google.com/spreadsheets/d/...) 또는 20자 이상의 시트 ID를 입력해 주세요.
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      {connectError && (
                        <div
                          role="alert"
                          className="flex items-start gap-2.5 rounded-xl border border-[#DFB4B4] bg-[#FDF2F2] p-3.5 text-sm leading-relaxed text-[#7D2424]"
                        >
                          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                          <span>{connectError}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="hanji-card space-y-4 rounded-xl border border-[#DFD5C2] p-5">
                      <div>
                        <div className="flex items-center gap-2 text-[15px] font-bold text-[#241E19]">
                          <FilePlus2 className="h-4.5 w-4.5 text-[#2E6B47]" aria-hidden="true" />
                          <span>학급용 새 Google Sheets 자동으로 만들기</span>
                        </div>
                        <p className="mt-1.5 text-sm leading-relaxed text-[#544A40]">
                          아직 만들어 둔 시트가 없다면, 8개 열 제목(기록 일시, 학생 이름, 임금님,
                          정리한 용어, 한 줄 기록, 실록 출처)이 정리된 새 시트를 내 드라이브에 바로
                          생성합니다.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <label
                          htmlFor="new-sheet-title"
                          className="block text-xs font-bold text-[#3C332B]"
                        >
                          새 스프레드시트 제목
                        </label>
                        <div className="flex flex-col gap-2.5 sm:flex-row">
                          <input
                            id="new-sheet-title"
                            type="text"
                            value={newSheetTitle}
                            onChange={(e) => setNewSheetTitle(e.target.value)}
                            className="min-h-[46px] flex-1 rounded-xl border border-[#CFC2A8] bg-white px-3.5 text-sm text-[#241E19] focus:border-[#2E6B47] focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => onRequestCreateSheet(newSheetTitle)}
                            className="inline-flex min-h-[46px] shrink-0 items-center justify-center gap-1.5 rounded-xl bg-[#2E6B47] px-5 py-2.5 text-sm font-bold text-white hover:opacity-92 whitespace-nowrap"
                          >
                            <FilePlus2 className="h-4 w-4" aria-hidden="true" />
                            <span>새 시트 만들기</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                /* STEP 3: Connected Sheet Management & Test Dashboard */
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-[15px] font-bold text-[#241E19]">
                      2~3단계. 연결된 내 Google Sheets 확인 및 학생 공유
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        setConnectSuccessTitle(null);
                        onDisconnectSheet();
                      }}
                      className="inline-flex min-h-[34px] items-center gap-1 rounded-lg border border-[#DFD5C2] bg-[#FDFBF6] px-2.5 py-1 text-xs font-semibold text-[#5E5347] hover:bg-[#EFE8D8] whitespace-nowrap"
                    >
                      <Unlink className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>다른 시트로 변경</span>
                    </button>
                  </div>

                  {connectSuccessTitle && (
                    <div
                      role="status"
                      className="flex items-center gap-2 rounded-xl border border-[#BBD4C1] bg-[#EDF6EF] px-4 py-3 text-sm font-semibold text-[#1F5434]"
                    >
                      <CheckCircle2 className="h-4.5 w-4.5 shrink-0" aria-hidden="true" />
                      <span>‘{connectSuccessTitle}’ 시트가 정상적으로 연결되었습니다!</span>
                    </div>
                  )}

                  {testSuccessMessage && (
                    <div
                      role="status"
                      className="flex items-center gap-2 rounded-xl border border-[#BBD4C1] bg-[#EDF6EF] px-4 py-3 text-sm font-semibold text-[#1F5434]"
                    >
                      <CheckCircle2 className="h-4.5 w-4.5 shrink-0" aria-hidden="true" />
                      <span>{testSuccessMessage}</span>
                    </div>
                  )}

                  {/* Connected Sheet Details Card */}
                  <div className="hanji-card space-y-4 rounded-xl border border-[#C2DCC8] p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#2E6B47]">현재 연결된 스프레드시트</p>
                        <h4 className="mt-0.5 font-hanji-display text-lg font-bold text-[#241E19] truncate">
                          {connectedSheet.title}
                        </h4>
                        <p className="mt-0.5 font-mono text-[11px] text-[#7A6D5E] truncate">
                          ID: {connectedSheet.spreadsheetId}
                        </p>
                      </div>

                      <a
                        href={connectedSheet.spreadsheetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-[#BBD4C1] bg-[#EDF6EF] px-3.5 py-2 text-xs font-bold text-[#1F5434] hover:bg-[#DFEFE3] whitespace-nowrap"
                      >
                        <span>Google Sheets 열기</span>
                        <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                      </a>
                    </div>

                    {/* Tab Selector + 1-Click Write Verification Button */}
                    <div className="grid grid-cols-1 gap-3 border-t border-[#ECE4D4] pt-4 sm:grid-cols-2 sm:items-end">
                      <div>
                        <label
                          htmlFor="sheets-tab-select"
                          className="mb-1.5 block text-xs font-bold text-[#4E443B]"
                        >
                          기록할 시트 탭 선택
                        </label>
                        <select
                          id="sheets-tab-select"
                          value={connectedSheet.sheetName}
                          onChange={(e) => onChangeSheetTab(e.target.value)}
                          className="min-h-[42px] w-full rounded-xl border border-[#CFC2A8] bg-white px-3 text-sm font-medium text-[#241E19] focus:border-[#264B75] focus:outline-none"
                        >
                          {connectedSheet.tabs.map((tab) => (
                            <option key={tab.sheetId} value={tab.title}>
                              {tab.title}
                            </option>
                          ))}
                        </select>
                      </div>

                      <button
                        type="button"
                        onClick={onRequestTestWrite}
                        className="inline-flex min-h-[42px] items-center justify-center gap-1.5 rounded-xl bg-[#2E6B47] px-4 py-2 text-sm font-bold text-white hover:opacity-92 whitespace-nowrap"
                      >
                        <FlaskConical className="h-4 w-4 shrink-0" aria-hidden="true" />
                        <span>연결 테스트 (샘플 1행 기록)</span>
                      </button>
                    </div>

                    {/* Classroom Student Share Box */}
                    <div className="rounded-xl border border-[#D4DFEA] bg-[#EFF4FA] p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 text-sm font-bold text-[#1D3B5E]">
                            <Share2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                            <span>우리 반 학생들에게 연결 링크 공유하기</span>
                          </div>
                          <p className="mt-1 text-xs leading-relaxed text-[#384D66]">
                            먼저 Google Sheets 우측 상단 <strong>[공유]</strong>에서 학생들에게{' '}
                            <strong>편집자</strong> 권한을 열어 둔 뒤, 아래 링크를 학급 게시판에
                            올려 주세요.
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => void handleCopyLink()}
                          className="inline-flex min-h-[42px] shrink-0 items-center gap-1.5 rounded-xl bg-[#264B75] px-4 py-2 text-xs font-bold text-white hover:opacity-92 whitespace-nowrap sm:text-sm"
                        >
                          {shareCopied ? (
                            <>
                              <Check className="h-4 w-4" aria-hidden="true" />
                              <span>학생용 링크 복사됨!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4" aria-hidden="true" />
                              <span>학생용 연결 링크 복사</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Recent Sheet Rows Preview */}
                    <div className="border-t border-[#ECE4D4] pt-4">
                      <div className="mb-2.5 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-[#312922]">
                          <Table2 className="h-4 w-4 text-[#2E6B47]" aria-hidden="true" />
                          <span>
                            최근 시트 기록 미리보기 (총 {Math.max(previewRows.length - 1, 0)}건)
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => void handleRefreshPreview()}
                          disabled={isLoadingPreview}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[#264B75] hover:underline disabled:opacity-50"
                        >
                          <RefreshCw
                            className={`h-3.5 w-3.5 ${isLoadingPreview ? 'animate-spin' : ''}`}
                            aria-hidden="true"
                          />
                          <span>새로고침</span>
                        </button>
                      </div>

                      {previewError ? (
                        <div
                          role="alert"
                          className="rounded-lg border border-[#DFB4B4] bg-[#FDF2F2] p-3 text-xs leading-relaxed text-[#7D2424]"
                        >
                          {previewError}
                        </div>
                      ) : isLoadingPreview ? (
                        <p className="text-xs text-[#746759]">시트 기록을 불러오는 중이에요...</p>
                      ) : dataRows.length === 0 ? (
                        <p className="rounded-lg border border-dashed border-[#D7CBB4] bg-[#FAF6EC] px-4 py-3 text-xs leading-relaxed text-[#5E5347]">
                          아직 기록된 행이 없어요. 위{' '}
                          <strong className="text-[#2E6B47]">[연결 테스트 (샘플 1행 기록)]</strong>을
                          눌러 선생님 시트에 잘 써지는지 바로 확인해 보세요!
                        </p>
                      ) : (
                        <div className="overflow-x-auto rounded-lg border border-[#E6DEC9]">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-[#F3EDE0] text-[#4A4036]">
                              <tr>
                                <th className="px-3 py-2 font-bold whitespace-nowrap">
                                  {headerRow[1] || '학생'}
                                </th>
                                <th className="px-3 py-2 font-bold whitespace-nowrap">
                                  {headerRow[2] || '임금님'}
                                </th>
                                <th className="px-3 py-2 font-bold">
                                  {headerRow[6] || '오늘의 역사 한 줄 기록'}
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#EFE8DA] bg-white">
                              {dataRows.map((row, idx) => (
                                <tr key={idx}>
                                  <td className="px-3 py-2 font-semibold text-[#241E19] whitespace-nowrap">
                                    {row[1] || '-'}
                                  </td>
                                  <td className="px-3 py-2 text-[#4E443B] whitespace-nowrap">
                                    {row[2] || '-'}
                                  </td>
                                  <td className="max-w-[280px] truncate px-3 py-2 text-[#4E443B]">
                                    {row[6] || '-'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Teacher Independence & FAQ Notice */}
          <section className="rounded-xl border border-[#E4DCCB] bg-[#F5EFE2] p-4">
            <div className="flex items-start gap-2.5">
              <Users className="mt-0.5 h-4.5 w-4.5 shrink-0 text-[#8C561E]" aria-hidden="true" />
              <div className="space-y-1.5 text-xs leading-relaxed text-[#4E443B]">
                <p className="font-bold text-[#241E19]">
                  모든 선생님이 각자 자신의 Google Sheets를 연결할 수 있나요?
                </p>
                <p>
                  네! 이 웹앱은 특정 시트에 고정되어 있지 않습니다. 각 선생님께서 본인 Google 계정으로
                  로그인한 뒤 <strong>본인의 시트 URL/ID를 입력</strong>하거나{' '}
                  <strong>새 시트 만들기</strong>를 누르면 선생님만의 학급 시트가 개별 연결되며,
                  다른 학급 기록과 섞이지 않습니다.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
