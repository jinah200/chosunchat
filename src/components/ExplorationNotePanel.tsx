import { useEffect, useRef, useState } from 'react';
import {
  Ban,
  BookOpen,
  Check,
  Copy,
  Download,
  ExternalLink,
  FileSpreadsheet,
  HeartHandshake,
  Save,
  ShieldCheck,
  UserRound,
  Users,
  X,
} from 'lucide-react';
import type { HistoricalTerm, JoseonKing } from '../data/kings';
import type { ConnectedSheetConfig } from '../lib/googleSheets';
import {
  checkPoliteKorean,
  CLASS_NUMBERS,
  formatStudentProfileLabel,
  getGradesForSchoolLevel,
  SCHOOL_LEVELS,
  STUDENT_NUMBERS,
  type SchoolLevel,
  type StudentProfile,
} from '../lib/politeGuard';

interface ExplorationNotePanelProps {
  king: JoseonKing;
  terms: HistoricalTerm[];
  highlightedTerm: string | null;
  studentProfile: StudentProfile;
  onChangeStudentProfile: (next: StudentProfile) => void;
  isCurrentStudentBlocked: boolean;
  reflectionText: string;
  onChangeReflection: (value: string) => void;
  onCopyJournal: () => Promise<boolean>;
  onSaveJournal: () => boolean;
  onDownloadJournal: () => void;
  connectedSheet: ConnectedSheetConfig | null;
  isGoogleSignedIn: boolean;
  sheetSubmitSuccess: string | null;
  onOpenSheetsModal: () => void;
  onOpenClassmateBoard: () => void;
  onRequestSubmitToSheet: () => void;
  isDrawerOpen: boolean;
  onCloseDrawer: () => void;
}

export function ExplorationNotePanel({
  king,
  terms,
  highlightedTerm,
  studentProfile,
  onChangeStudentProfile,
  isCurrentStudentBlocked,
  reflectionText,
  onChangeReflection,
  onCopyJournal,
  onSaveJournal,
  onDownloadJournal,
  connectedSheet,
  isGoogleSignedIn,
  sheetSubmitSuccess,
  onOpenSheetsModal,
  onOpenClassmateBoard,
  onRequestSubmitToSheet,
  isDrawerOpen,
  onCloseDrawer,
}: ExplorationNotePanelProps) {
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState(false);
  const [validationWarning, setValidationWarning] = useState<string | null>(null);
  const termRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (!highlightedTerm) return;
    const node = termRefs.current[highlightedTerm];
    if (node) {
      node.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [highlightedTerm]);

  const gradeOptions = getGradesForSchoolLevel(studentProfile.schoolLevel);
  const formattedStudentPreview = formatStudentProfileLabel(studentProfile);

  const handleSchoolLevelChange = (nextLevel: SchoolLevel) => {
    const allowedGrades = getGradesForSchoolLevel(nextLevel);
    const nextGrade = allowedGrades.includes(studentProfile.grade)
      ? studentProfile.grade
      : allowedGrades[0];
    onChangeStudentProfile({
      ...studentProfile,
      schoolLevel: nextLevel,
      grade: nextGrade,
    });
  };

  const validateBeforeAction = (): boolean => {
    if (reflectionText.trim().length === 0) {
      setValidationWarning('저장하거나 제출하기 전에 배운 내용을 한 줄 이상 적어 주세요.');
      return false;
    }
    const nameCheck = checkPoliteKorean(studentProfile.name);
    if (!nameCheck.isClean) {
      setValidationWarning(nameCheck.reason || '이름 칸에도 바르고 고운말을 사용해 주세요.');
      return false;
    }
    const textCheck = checkPoliteKorean(reflectionText);
    if (!textCheck.isClean) {
      setValidationWarning(textCheck.reason || '바르고 고운말을 사용해 주세요.');
      return false;
    }
    setValidationWarning(null);
    return true;
  };

  const handleCopy = async () => {
    const ok = await onCopyJournal();
    if (ok) {
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2200);
    }
  };

  const handleSave = () => {
    if (!validateBeforeAction()) return;
    const saved = onSaveJournal();
    if (saved) {
      setSaveFeedback(true);
      setTimeout(() => setSaveFeedback(false), 2400);
    }
  };

  const handleSheetSubmitClick = () => {
    if (!isGoogleSignedIn || !connectedSheet) {
      onOpenSheetsModal();
      return;
    }
    if (isCurrentStudentBlocked) {
      setValidationWarning(
        '바르고 고운말 미준수로 인해 선생님께서 작성을 제한했어요. 선생님께 문의해 주세요.',
      );
      return;
    }
    if (!validateBeforeAction()) return;
    onRequestSubmitToSheet();
  };

  const isReadyToSubmitSheet = Boolean(isGoogleSignedIn && connectedSheet);

  const panelBody = (
    <div className="flex h-full flex-col bg-[#F8F3E8]">
      {/* Panel Header */}
      <div className="flex items-center justify-between gap-3 border-b border-[#E4DCCB] px-5 py-4">
        <div className="flex min-w-0 items-center gap-2">
          <BookOpen
            className="h-4.5 w-4.5 shrink-0"
            style={{ color: king.accentHex }}
            aria-hidden="true"
          />
          <h2 className="font-hanji-display text-base font-bold text-[#241E19] truncate">
            역사 탐구 노트
          </h2>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <span className="text-xs font-medium text-[#6B5F52] tabular-nums whitespace-nowrap">
            용어 {terms.length}개
          </span>
          <button
            type="button"
            onClick={onCloseDrawer}
            aria-label="탐구 노트 닫기"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#DFD5C2] bg-[#FDFBF6] text-[#4E443B] hover:bg-[#F3ECDD] xl:hidden"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Section 1: Sillok Verification Reference + Auto-Collected Terms */}
      <div className="hanji-scroll flex-1 overflow-y-auto px-5 py-4">
        <div className="mb-4 rounded-xl border border-[#C8D5E4] bg-[#EEF3F9] p-3.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#1D3B5E]">
            <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>조선왕조실록 사료 검증</span>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-[#364B63]">
            이 대화는 국사편찬위원회 『{king.sillokTitle}』 기록을 바탕으로 답변해요.
          </p>
          <a
            href={king.sillokUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#1D3B5E] underline underline-offset-2 hover:text-[#112640]"
          >
            <span>『{king.sillokTitle}』 원문 보러 가기</span>
            <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          </a>
        </div>

        <div className="mb-3 flex items-baseline justify-between gap-2">
          <h3 className="text-sm font-bold text-[#312922]">핵심 역사 용어 사전</h3>
          <span className="text-xs text-[#746759]">대화 속 용어 자동 정리</span>
        </div>

        {terms.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#D7CBB4] bg-[#FDFBF6]/70 px-4 py-6 text-center text-xs leading-relaxed text-[#6E6254]">
            대화를 나누면 중요한 역사 용어와 사건 뜻풀이가 이곳에 자동으로 정리돼요.
          </div>
        ) : (
          <div className="space-y-3">
            {terms.map((item) => {
              const isHighlighted = highlightedTerm === item.term;
              return (
                <div
                  key={item.term}
                  ref={(el) => {
                    termRefs.current[item.term] = el;
                  }}
                  className="hanji-card rounded-xl border p-3.5 transition-all duration-200"
                  style={{
                    borderColor: isHighlighted ? king.accentHex : '#E3DAC8',
                    backgroundColor: isHighlighted ? king.accentSoftBg : '#FDFBF6',
                  }}
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5">
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-hanji-display text-[15px] font-bold text-[#241E19]">
                        {item.term}
                      </span>
                      {item.hanja && (
                        <span className="text-xs text-[#7C6F60]">{item.hanja}</span>
                      )}
                    </div>
                    <span
                      className="text-[11px] font-semibold"
                      style={{ color: king.accentText }}
                    >
                      {item.category}
                    </span>
                  </div>
                  <p className="mt-1.5 text-[13px] leading-[1.6] text-[#453C34]">
                    {item.definition}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Section 2: Student Dropdown Profile + Polite Language Pledge + Submission */}
      <div className="border-t border-[#E2D8C5] bg-[#FAF6EC] px-4 py-3.5 sm:px-5">
        {/* Easy Student Selector Dropdowns (School Level, Grade, Class, Number) */}
        <div className="mb-2.5 rounded-xl border border-[#DFD5C2] bg-[#FDFBF6] p-2.5">
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#4E443B]">
              <UserRound className="h-3.5 w-3.5 text-[#264B75]" aria-hidden="true" />
              <span>제출할 학생 정보 선택</span>
            </span>
            <span className="truncate text-[11px] font-semibold text-[#264B75]">
              {formattedStudentPreview}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
            <select
              aria-label="학교급 선택"
              value={studentProfile.schoolLevel}
              onChange={(e) => handleSchoolLevelChange(e.target.value as SchoolLevel)}
              className="min-h-[34px] rounded-lg border border-[#D4C7AE] bg-white px-1.5 text-xs font-semibold text-[#241E19] focus:border-[#264B75] focus:outline-none"
            >
              {SCHOOL_LEVELS.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>

            <select
              aria-label="학년 선택"
              value={studentProfile.grade}
              onChange={(e) =>
                onChangeStudentProfile({
                  ...studentProfile,
                  grade: Number(e.target.value),
                })
              }
              className="min-h-[34px] rounded-lg border border-[#D4C7AE] bg-white px-1.5 text-xs font-semibold text-[#241E19] focus:border-[#264B75] focus:outline-none tabular-nums"
            >
              {gradeOptions.map((g) => (
                <option key={g} value={g}>
                  {g}학년
                </option>
              ))}
            </select>

            <select
              aria-label="반 선택"
              value={studentProfile.classNumber}
              onChange={(e) =>
                onChangeStudentProfile({
                  ...studentProfile,
                  classNumber: Number(e.target.value),
                })
              }
              className="min-h-[34px] rounded-lg border border-[#D4C7AE] bg-white px-1.5 text-xs font-semibold text-[#241E19] focus:border-[#264B75] focus:outline-none tabular-nums"
            >
              {CLASS_NUMBERS.map((c) => (
                <option key={c} value={c}>
                  {c}반
                </option>
              ))}
            </select>

            <select
              aria-label="번호 선택"
              value={studentProfile.studentNumber}
              onChange={(e) =>
                onChangeStudentProfile({
                  ...studentProfile,
                  studentNumber: Number(e.target.value),
                })
              }
              className="min-h-[34px] rounded-lg border border-[#D4C7AE] bg-white px-1.5 text-xs font-semibold text-[#241E19] focus:border-[#264B75] focus:outline-none tabular-nums"
            >
              {STUDENT_NUMBERS.map((n) => (
                <option key={n} value={n}>
                  {n}번
                </option>
              ))}
            </select>
          </div>

          <input
            id="student-name-input"
            type="text"
            maxLength={15}
            value={studentProfile.name}
            onChange={(e) => {
              onChangeStudentProfile({ ...studentProfile, name: e.target.value });
              if (validationWarning) setValidationWarning(null);
            }}
            placeholder="이름 (선택 입력, 예: 김민수)"
            className="mt-1.5 min-h-[32px] w-full rounded-lg border border-[#E4DCCB] bg-[#FAF6EC] px-2.5 text-xs text-[#241E19] placeholder:text-[#96897A] focus:border-[#264B75] focus:bg-white focus:outline-none"
          />
        </div>

        {/* Polite Korean Language Pledge */}
        <div className="mb-2 flex items-start gap-1.5 rounded-lg border border-[#E6D6B3] bg-[#FBF4E4] px-2.5 py-1.5 text-[11px] leading-snug text-[#614618]">
          <HeartHandshake className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#A86B1A]" aria-hidden="true" />
          <span>
            <strong className="font-bold">바르고 고운말</strong>만 적어 주세요. 부적절한 글은
            선생님이 삭제 및 차단할 수 있어요.
          </span>
        </div>

        <div className="mb-1 flex items-center justify-between gap-2">
          <label
            htmlFor="history-reflection-input"
            className="text-sm font-bold text-[#241E19]"
          >
            오늘의 역사 한 줄 기록
          </label>
          <span className="text-xs text-[#746759] tabular-nums">
            {reflectionText.length} / 200자
          </span>
        </div>

        <textarea
          id="history-reflection-input"
          rows={3}
          maxLength={200}
          value={reflectionText}
          onChange={(e) => {
            onChangeReflection(e.target.value);
            if (validationWarning) setValidationWarning(null);
          }}
          placeholder={`예: ${king.name} ${king.emoji} 때의 ${king.headlineAchievement}에 대해 실록 기록으로 잘 알게 되었어요.`}
          className="w-full resize-none rounded-xl border border-[#D7CBB4] bg-[#FDFBF6] p-2.5 text-sm leading-relaxed text-[#241E19] placeholder:text-[#96897A] focus:border-[#264B75] focus:bg-white focus:outline-none"
        />

        {isCurrentStudentBlocked && (
          <div
            role="alert"
            className="mt-1.5 flex items-start gap-1.5 rounded-lg border border-[#DFB4B4] bg-[#FDF2F2] px-2.5 py-2 text-xs font-semibold text-[#8E2828]"
          >
            <Ban className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>선생님께서 이 학번의 시트 제출을 제한했어요. 선생님께 문의해 주세요.</span>
          </div>
        )}

        {validationWarning && (
          <p className="mt-1.5 text-xs font-semibold text-[#A93636]" role="alert">
            {validationWarning}
          </p>
        )}

        {/* Primary Google Sheets Submit Button */}
        <button
          type="button"
          disabled={isCurrentStudentBlocked}
          onClick={handleSheetSubmitClick}
          className={`mt-2.5 inline-flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#264B75] disabled:cursor-not-allowed disabled:opacity-45 sm:text-sm ${
            isReadyToSubmitSheet
              ? 'border-[#2E6B47] bg-[#2E6B47] text-white hover:opacity-92'
              : 'border-[#BBD4C1] bg-[#EDF6EF] text-[#225336] hover:bg-[#E1EFE5]'
          }`}
        >
          <FileSpreadsheet className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="truncate">
            {isReadyToSubmitSheet
              ? `Google Sheets에 제출 (${connectedSheet?.sheetName})`
              : '교사 Google Sheets 연결 · 제출하기'}
          </span>
        </button>

        {sheetSubmitSuccess && (
          <p
            role="status"
            className="mt-1.5 flex items-center gap-1 text-xs font-semibold text-[#225336]"
          >
            <Check className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>{sheetSubmitSuccess}</span>
          </p>
        )}

        <div className="mt-2 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex min-h-[38px] items-center justify-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold text-white transition-opacity duration-150 hover:opacity-92 whitespace-nowrap"
            style={{ backgroundColor: king.accentHex }}
          >
            {saveFeedback ? (
              <>
                <Check className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>브라우저 저장됨</span>
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>내 일지 저장</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex min-h-[38px] items-center justify-center gap-1.5 rounded-xl border border-[#D5C8B0] bg-[#FDFBF6] px-3 py-1.5 text-xs font-semibold text-[#312922] transition-colors duration-150 hover:border-[#BCA98C] hover:bg-white whitespace-nowrap"
          >
            {copyFeedback ? (
              <>
                <Check className="h-3.5 w-3.5 shrink-0 text-[#3A6B4F]" aria-hidden="true" />
                <span className="text-[#2A523B]">복사 완료</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 shrink-0 text-[#65594C]" aria-hidden="true" />
                <span>일지 복사</span>
              </>
            )}
          </button>
        </div>

        <div className="mt-1.5 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onDownloadJournal}
            className="inline-flex min-h-[32px] items-center gap-1 rounded-lg px-2 text-xs font-medium text-[#5E5347] hover:bg-[#EFE8D8] hover:text-[#241E19]"
          >
            <Download className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>.txt 저장</span>
          </button>

          <button
            type="button"
            onClick={onOpenClassmateBoard}
            className="inline-flex min-h-[32px] items-center gap-1 rounded-lg px-2 text-xs font-semibold text-[#264B75] hover:bg-[#EBF1F8]"
          >
            <Users className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>친구들 일지 보기</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside
        aria-label="역사 탐구 노트"
        className="hidden w-[348px] shrink-0 border-l border-[#E1D7C4] xl:block 2xl:w-[376px]"
      >
        {panelBody}
      </aside>

      {isDrawerOpen && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-[#241E19]/40 xl:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="역사 탐구 노트"
        >
          <button
            type="button"
            aria-label="배경 눌러 닫기"
            onClick={onCloseDrawer}
            className="flex-1 cursor-default"
          />
          <div className="h-full w-full max-w-[390px] border-l border-[#DFD5C2] shadow-xl">
            {panelBody}
          </div>
        </div>
      )}
    </>
  );
}
