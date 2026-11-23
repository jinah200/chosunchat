import { useMemo, useState } from 'react';
import {
  AlertCircle,
  Ban,
  CheckCircle2,
  ExternalLink,
  FileSpreadsheet,
  HeartHandshake,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Undo2,
  Users,
  X,
} from 'lucide-react';
import { findKingByTitle, JOSEON_KINGS } from '../data/kings';
import type {
  BlockedAuthorEntry,
  ClassmateSheetEntry,
  ConnectedSheetConfig,
} from '../lib/googleSheets';
import { normalizeAuthorKey, SCHOOL_LEVELS } from '../lib/politeGuard';
import { KingEmblem } from './KingEmblem';

interface ClassmateJournalsModalProps {
  isOpen: boolean;
  isGoogleSignedIn: boolean;
  connectedSheet: ConnectedSheetConfig | null;
  entries: ClassmateSheetEntry[];
  blockedAuthors: BlockedAuthorEntry[];
  isLoading: boolean;
  errorMessage: string | null;
  moderationNotice: string | null;
  onClose: () => void;
  onRefresh: () => Promise<void>;
  onOpenSheetsModal: () => void;
  onRequestDeleteEntry: (entry: ClassmateSheetEntry) => void;
  onRequestDeleteAndBlock: (entry: ClassmateSheetEntry) => void;
  onRequestUnblockAuthor: (blocked: BlockedAuthorEntry) => void;
}

export function ClassmateJournalsModal({
  isOpen,
  isGoogleSignedIn,
  connectedSheet,
  entries,
  blockedAuthors,
  isLoading,
  errorMessage,
  moderationNotice,
  onClose,
  onRefresh,
  onOpenSheetsModal,
  onRequestDeleteEntry,
  onRequestDeleteAndBlock,
  onRequestUnblockAuthor,
}: ClassmateJournalsModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [schoolFilter, setSchoolFilter] = useState<string>('all');
  const [kingFilter, setKingFilter] = useState<string>('all');
  const [isTeacherMode, setIsTeacherMode] = useState(false);

  const blockedKeySet = useMemo(
    () => new Set(blockedAuthors.map((b) => normalizeAuthorKey(b.authorLabel))),
    [blockedAuthors],
  );

  const visibleEntries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return entries.filter((entry) => {
      const isBlockedAuthor = blockedKeySet.has(normalizeAuthorKey(entry.studentName));
      // Hide blocked authors' entries from students; show with badge in teacher mode
      if (!isTeacherMode && isBlockedAuthor) {
        return false;
      }
      if (schoolFilter !== 'all' && !entry.studentName.includes(schoolFilter)) {
        return false;
      }
      if (kingFilter !== 'all' && !entry.kingTitle.includes(kingFilter)) {
        return false;
      }
      if (!q) return true;
      const haystack = `${entry.studentName} ${entry.kingTitle} ${entry.reflection} ${entry.termsSummary}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [entries, blockedKeySet, isTeacherMode, schoolFilter, kingFilter, searchQuery]);

  if (!isOpen) return null;

  const isSheetReady = Boolean(isGoogleSignedIn && connectedSheet);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#241E19]/50 p-3 sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-label="우리 반 친구들 역사 탐구 일지"
    >
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-[#DFD5C2] bg-[#FAF6EC] shadow-2xl">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E2D8C5] bg-[#FDFBF6] px-6 py-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EBF1F8] text-[#264B75]">
              <Users className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h2 className="font-hanji-display text-lg font-bold text-[#241E19] sm:text-xl">
                친구들 역사 탐구 일지 나누기
              </h2>
              <p className="text-xs text-[#65594C] sm:text-[13px] truncate">
                {isSheetReady
                  ? `연결된 학급 시트: ${connectedSheet?.title} (${connectedSheet?.sheetName})`
                  : '학급 Google Sheets를 연결하면 친구들이 남긴 탐구 일지를 함께 볼 수 있어요.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isSheetReady && (
              <>
                <button
                  type="button"
                  onClick={() => setIsTeacherMode((prev) => !prev)}
                  aria-pressed={isTeacherMode}
                  className={`inline-flex min-h-[38px] items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-colors whitespace-nowrap ${
                    isTeacherMode
                      ? 'border-[#A93636] bg-[#A93636] text-white'
                      : 'border-[#DFD5C2] bg-[#FAF6EC] text-[#4E443B] hover:bg-[#EFE8D8]'
                  }`}
                >
                  <ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{isTeacherMode ? '교사 관리 중' : '교사 관리 모드'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => void onRefresh()}
                  disabled={isLoading}
                  className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl border border-[#DFD5C2] bg-[#FDFBF6] px-3 py-1.5 text-xs font-semibold text-[#264B75] hover:bg-[#F3F6FA] disabled:opacity-50 whitespace-nowrap"
                >
                  <RefreshCw
                    className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`}
                    aria-hidden="true"
                  />
                  <span>새로고침</span>
                </button>
              </>
            )}

            <button
              type="button"
              onClick={onClose}
              aria-label="창 닫기"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#DFD5C2] bg-[#FAF6EC] text-[#4E443B] hover:bg-[#EFE8D8]"
            >
              <X className="h-4.5 w-4.5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Polite Korean Classroom Pledge Banner */}
        <div className="border-b border-[#E5D7B8] bg-[#FBF4E4] px-6 py-3">
          <div className="flex items-start gap-2.5 text-xs leading-relaxed text-[#5C4318] sm:text-[13px]">
            <HeartHandshake className="mt-0.5 h-4.5 w-4.5 shrink-0 text-[#A86B1A]" aria-hidden="true" />
            <div>
              <strong className="font-bold text-[#3D2B0D]">바르고 고운말 약속:</strong>{' '}
              친구들과 선생님이 함께 읽는 소중한 역사 게시판이에요. 배운 내용을 정중하고 따뜻한
              말로 나누어 주세요. 올바르지 않은 표현이나 장난 글은{' '}
              <strong className="font-semibold text-[#8E2828]">선생님이 시트에서 삭제하고 작성자를 차단</strong>할 수 있어요.
            </div>
          </div>
        </div>

        {moderationNotice && (
          <div
            role="status"
            className="flex items-center gap-2 border-b border-[#C7DEC9] bg-[#EDF6EF] px-6 py-2.5 text-xs font-semibold text-[#1F5434]"
          >
            <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{moderationNotice}</span>
          </div>
        )}

        {/* Main Content */}
        {!isSheetReady ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 py-14 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EDF6EF] text-[#2E6B47]">
              <FileSpreadsheet className="h-7 w-7" aria-hidden="true" />
            </div>
            <h3 className="mt-4 font-hanji-display text-lg font-bold text-[#241E19]">
              먼저 학급 Google Sheets를 연결해 주세요
            </h3>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-[#5E5347]">
              선생님 또는 학급의 Google Sheets를 연결하면 우리 반 친구들이 제출한 조선 시대 탐구
              일지를 실시간으로 함께 읽어볼 수 있어요.
            </p>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenSheetsModal();
              }}
              className="mt-5 inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[#2E6B47] px-5 py-2.5 text-sm font-bold text-white hover:opacity-92"
            >
              <FileSpreadsheet className="h-4 w-4" aria-hidden="true" />
              <span>Google Sheets 연결하러 가기</span>
            </button>
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col">
            {/* Search & Filter Toolbar */}
            <div className="flex flex-wrap items-center gap-2.5 border-b border-[#E6DEC9] bg-[#F5EFE2] px-6 py-3">
              <div className="relative min-w-[200px] flex-1">
                <Search
                  className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#7E7162]"
                  aria-hidden="true"
                />
                <label htmlFor="classmate-search" className="sr-only">
                  친구 일지 검색
                </label>
                <input
                  id="classmate-search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="학생 정보, 임금님, 내용 검색..."
                  className="min-h-[38px] w-full rounded-lg border border-[#D4C7AE] bg-white py-1.5 pr-3 pl-9 text-xs text-[#241E19] placeholder:text-[#96897A] focus:border-[#264B75] focus:outline-none sm:text-sm"
                />
              </div>

              <select
                aria-label="학교급 필터"
                value={schoolFilter}
                onChange={(e) => setSchoolFilter(e.target.value)}
                className="min-h-[38px] rounded-lg border border-[#D4C7AE] bg-white px-2.5 text-xs font-semibold text-[#241E19] focus:border-[#264B75] focus:outline-none"
              >
                <option value="all">전체 학교급</option>
                {SCHOOL_LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>

              <select
                aria-label="임금님 필터"
                value={kingFilter}
                onChange={(e) => setKingFilter(e.target.value)}
                className="min-h-[38px] rounded-lg border border-[#D4C7AE] bg-white px-2.5 text-xs font-semibold text-[#241E19] focus:border-[#264B75] focus:outline-none"
              >
                <option value="all">전체 임금님 (1~27대)</option>
                {JOSEON_KINGS.map((king) => (
                  <option key={king.id} value={king.name}>
                    {king.order}대 {king.name} {king.emoji}
                  </option>
                ))}
              </select>

              <span className="text-xs font-semibold text-[#65594C] tabular-nums whitespace-nowrap">
                총 {visibleEntries.length}건
              </span>
            </div>

            {/* Teacher Moderation Panel: Blocked Authors Management */}
            {isTeacherMode && (
              <div className="border-b border-[#E7CECE] bg-[#FDF5F5] px-6 py-3.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#8E2828]">
                    <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>
                      교사 관리 모드 활성화됨 — 부적절한 글을 Google Sheets에서 직접 삭제하거나
                      작성자를 차단할 수 있습니다.
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-[#7A3535] tabular-nums">
                    차단된 작성자 {blockedAuthors.length}명
                  </span>
                </div>

                {blockedAuthors.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {blockedAuthors.map((blocked) => (
                      <div
                        key={`${blocked.rowNumber}-${blocked.authorLabel}`}
                        className="inline-flex items-center gap-2 rounded-lg border border-[#E2BABA] bg-white px-2.5 py-1 text-xs text-[#6B2323]"
                      >
                        <Ban className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        <span className="font-semibold">{blocked.authorLabel}</span>
                        <button
                          type="button"
                          onClick={() => onRequestUnblockAuthor(blocked)}
                          className="inline-flex items-center gap-0.5 rounded bg-[#F5EFE2] px-1.5 py-0.5 text-[11px] font-bold text-[#3C332B] hover:bg-[#E7DEC9]"
                        >
                          <Undo2 className="h-3 w-3" aria-hidden="true" />
                          <span>차단 해제</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Feed List */}
            <div className="hanji-scroll flex-1 overflow-y-auto p-6">
              {errorMessage ? (
                <div
                  role="alert"
                  className="flex items-start gap-2.5 rounded-xl border border-[#DFB4B4] bg-[#FDF2F2] p-4 text-sm text-[#7D2424]"
                >
                  <AlertCircle className="mt-0.5 h-4.5 w-4.5 shrink-0" aria-hidden="true" />
                  <span>{errorMessage}</span>
                </div>
              ) : isLoading ? (
                <div className="py-16 text-center text-sm text-[#6B5F52]">
                  학급 Google Sheets에서 친구들의 탐구 일지를 불러오는 중이에요...
                </div>
              ) : visibleEntries.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#D7CBB4] bg-[#FDFBF6] px-6 py-12 text-center">
                  <p className="font-hanji-display text-base font-bold text-[#3C332B]">
                    아직 표시할 친구들 탐구 일지가 없어요
                  </p>
                  <p className="mt-1.5 text-sm text-[#6E6254]">
                    임금님과 대화한 뒤 탐구 일지를 Google Sheets에 제출하면 이곳에 함께 모여요!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {visibleEntries.map((entry) => {
                    const matchedKing = findKingByTitle(entry.kingTitle);
                    const isAuthorBlocked = blockedKeySet.has(
                      normalizeAuthorKey(entry.studentName),
                    );
                    return (
                      <article
                        key={`${entry.rowNumber}-${entry.savedAt}-${entry.studentName}`}
                        className={`hanji-card flex flex-col justify-between rounded-xl border p-4 ${
                          isAuthorBlocked
                            ? 'border-[#DFB4B4] bg-[#FFF8F8]'
                            : 'border-[#E3DAC8] bg-[#FDFBF6]'
                        }`}
                      >
                        <div>
                          {/* Card Top: King Face Portrait + Emoji + Student Info */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3 min-w-0">
                              {matchedKing && <KingEmblem king={matchedKing} size="sm" />}
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <h3 className="font-hanji-display text-[15px] font-bold text-[#241E19]">
                                    {entry.kingTitle}{' '}
                                    {matchedKing && (
                                      <span aria-hidden="true">{matchedKing.emoji}</span>
                                    )}
                                  </h3>
                                  {isAuthorBlocked && (
                                    <span className="rounded bg-[#A93636] px-1.5 py-0.5 text-[10px] font-bold text-white">
                                      차단됨
                                    </span>
                                  )}
                                </div>
                                <p className="mt-0.5 text-xs font-semibold text-[#264B75] truncate">
                                  {entry.studentName}
                                </p>
                                <p className="text-[11px] text-[#7E7162] tabular-nums">
                                  {entry.savedAt}
                                  {entry.questionCount ? ` · 질문 ${entry.questionCount}` : ''}
                                </p>
                              </div>
                            </div>

                            {entry.sillokUrl && entry.sillokUrl.startsWith('https://') && (
                              <a
                                href={entry.sillokUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="조선왕조실록 출처 열기"
                                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#D4DFEA] bg-[#EFF4FA] text-[#1D3B5E] hover:bg-[#E1EBF6]"
                              >
                                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                              </a>
                            )}
                          </div>

                          {/* Student Reflection */}
                          <p className="mt-3 rounded-lg bg-[#F5EFE2] px-3.5 py-3 text-sm leading-relaxed text-[#241E19]">
                            {entry.reflection || '(한 줄 기록 없음)'}
                          </p>

                          {/* Learned Terms */}
                          {entry.termsSummary && entry.termsSummary !== '없음' && (
                            <p className="mt-2.5 line-clamp-2 text-xs leading-relaxed text-[#5E5347]">
                              <span className="font-semibold text-[#3C332B]">정리한 용어: </span>
                              {entry.termsSummary}
                            </p>
                          )}
                        </div>

                        {/* Teacher Moderation Action Row */}
                        {isTeacherMode && (
                          <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 border-t border-[#ECE4D4] pt-3">
                            <span className="text-[11px] font-medium text-[#7A6D5E] tabular-nums">
                              시트 {entry.rowNumber}행
                            </span>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => onRequestDeleteEntry(entry)}
                                className="inline-flex min-h-[32px] items-center gap-1 rounded-lg border border-[#E5CECE] bg-[#FDF6F6] px-2.5 py-1 text-xs font-semibold text-[#9A3232] hover:bg-[#F9E7E7] whitespace-nowrap"
                              >
                                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                                <span>행 삭제</span>
                              </button>

                              {!isAuthorBlocked && (
                                <button
                                  type="button"
                                  onClick={() => onRequestDeleteAndBlock(entry)}
                                  className="inline-flex min-h-[32px] items-center gap-1 rounded-lg bg-[#9A3232] px-2.5 py-1 text-xs font-bold text-white hover:opacity-92 whitespace-nowrap"
                                >
                                  <Ban className="h-3.5 w-3.5" aria-hidden="true" />
                                  <span>삭제 및 차단</span>
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
