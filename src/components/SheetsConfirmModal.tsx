import {
  AlertCircle,
  Ban,
  CheckCircle2,
  FilePlus2,
  FileSpreadsheet,
  Loader2,
  Trash2,
  Undo2,
  X,
} from 'lucide-react';
import type {
  BlockedAuthorEntry,
  ClassmateSheetEntry,
  ConnectedSheetConfig,
  SheetJournalRowInput,
} from '../lib/googleSheets';

export type PendingSheetsAction =
  | {
      type: 'create';
      title: string;
    }
  | {
      type: 'append-test';
      targetSheet: ConnectedSheetConfig;
      row: SheetJournalRowInput;
    }
  | {
      type: 'append-current';
      targetSheet: ConnectedSheetConfig;
      row: SheetJournalRowInput;
      termCount: number;
    }
  | {
      type: 'append-saved';
      targetSheet: ConnectedSheetConfig;
      rows: SheetJournalRowInput[];
    }
  | {
      type: 'delete-row';
      targetSheet: ConnectedSheetConfig;
      entry: ClassmateSheetEntry;
    }
  | {
      type: 'delete-and-block';
      targetSheet: ConnectedSheetConfig;
      entry: ClassmateSheetEntry;
    }
  | {
      type: 'unblock-author';
      targetSheet: ConnectedSheetConfig;
      blocked: BlockedAuthorEntry;
    };

interface SheetsConfirmModalProps {
  action: PendingSheetsAction | null;
  isSubmitting: boolean;
  errorMessage: string | null;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

export function SheetsConfirmModal({
  action,
  isSubmitting,
  errorMessage,
  onConfirm,
  onCancel,
}: SheetsConfirmModalProps) {
  if (!action) return null;

  const isDanger = action.type === 'delete-row' || action.type === 'delete-and-block';
  const isCreate = action.type === 'create';

  let heading = 'Google Sheets 작업을 진행할까요?';
  let confirmLabel = '확인하고 진행';

  if (action.type === 'create') {
    heading = '새 Google Sheets 문서를 만들까요?';
    confirmLabel = '확인하고 새 시트 만들기';
  } else if (action.type === 'append-test') {
    heading = '연결 테스트 기록 1행을 시트에 보낼까요?';
    confirmLabel = '확인하고 테스트 1행 기록';
  } else if (action.type === 'append-current') {
    heading = '교사 Google Sheets에 탐구 일지를 제출할까요?';
    confirmLabel = '확인하고 시트에 제출';
  } else if (action.type === 'append-saved') {
    heading = `저장된 탐구 일지 ${action.rows.length}건을 Google Sheets에 기록할까요?`;
    confirmLabel = `확인하고 ${action.rows.length}건 기록하기`;
  } else if (action.type === 'delete-row') {
    heading = '선택한 탐구 일지를 시트에서 삭제할까요?';
    confirmLabel = '확인하고 시트에서 삭제';
  } else if (action.type === 'delete-and-block') {
    heading = '부적절한 글을 삭제하고 작성자를 차단할까요?';
    confirmLabel = '확인하고 삭제 및 차단';
  } else if (action.type === 'unblock-author') {
    heading = '선택한 작성자의 차단을 해제할까요?';
    confirmLabel = '확인하고 차단 해제';
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-[#241E19]/55 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={heading}
    >
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-[#DFD5C2] bg-[#FAF6EC] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-[#E2D8C5] bg-[#FDFBF6] px-5 py-4">
          <div className="flex items-center gap-2.5 min-w-0">
            {action.type === 'delete-and-block' ? (
              <Ban className="h-5 w-5 shrink-0 text-[#A93636]" aria-hidden="true" />
            ) : action.type === 'delete-row' ? (
              <Trash2 className="h-5 w-5 shrink-0 text-[#A93636]" aria-hidden="true" />
            ) : action.type === 'unblock-author' ? (
              <Undo2 className="h-5 w-5 shrink-0 text-[#264B75]" aria-hidden="true" />
            ) : isCreate ? (
              <FilePlus2 className="h-5 w-5 shrink-0 text-[#2E6B47]" aria-hidden="true" />
            ) : (
              <FileSpreadsheet className="h-5 w-5 shrink-0 text-[#2E6B47]" aria-hidden="true" />
            )}
            <h2 className="font-hanji-display text-base font-bold text-[#241E19] sm:text-lg">
              {heading}
            </h2>
          </div>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={onCancel}
            aria-label="확인 창 닫기"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#DFD5C2] bg-[#FAF6EC] text-[#4E443B] hover:bg-[#EFE8D8] disabled:opacity-45"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* Details Preview */}
        <div className="space-y-4 p-5">
          {action.type === 'create' && (
            <div className="rounded-xl border border-[#DDD2BC] bg-[#FDFBF6] p-4 text-sm leading-relaxed text-[#4E443B]">
              <dl className="space-y-2">
                <div className="flex justify-between gap-3">
                  <dt className="shrink-0 font-semibold text-[#6B5F52]">생성할 문서 제목</dt>
                  <dd className="text-right font-bold text-[#241E19]">
                    {action.title.trim() || '조선 타임머신 톡 — 우리 반 역사 탐구 일지'}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="shrink-0 font-semibold text-[#6B5F52]">기본 시트 탭 이름</dt>
                  <dd className="text-right font-semibold text-[#2E6B47]">역사 탐구 일지</dd>
                </div>
                <div className="border-t border-[#ECE4D4] pt-2">
                  <dt className="text-xs font-semibold text-[#6B5F52]">자동 생성되는 열 제목 (8개)</dt>
                  <dd className="mt-1 text-xs text-[#4E443B]">
                    기록 일시 · 학생 이름(학번) · 만난 임금님 · 재위 기간·주요 업적 · 질문 수 ·
                    정리한 역사 용어 · 오늘의 역사 한 줄 기록 · 조선왕조실록 출처
                  </dd>
                </div>
              </dl>
            </div>
          )}

          {action.type === 'append-test' && (
            <div className="space-y-3">
              <div className="rounded-xl border border-[#C7DEC9] bg-[#F2F8F3] p-4 text-sm text-[#244E35]">
                <p className="font-bold">대상 시트: {action.targetSheet.title}</p>
                <p className="mt-1 text-xs text-[#3B624A]">
                  선택한 탭 <strong>‘{action.targetSheet.sheetName}’</strong>이 비어 있으면 열 제목을
                  자동으로 만들고, 아래 테스트 기록 1행을 추가해 정상 작동을 확인합니다.
                </p>
              </div>
              <div className="rounded-xl border border-[#DDD2BC] bg-[#FDFBF6] p-4 text-xs leading-relaxed text-[#3C332B]">
                <p className="font-semibold text-[#6B5F52]">추가될 테스트 기록 미리보기</p>
                <p className="mt-1.5 rounded-lg bg-[#F5EFE2] p-2.5 text-sm text-[#241E19]">
                  {action.row.reflection}
                </p>
              </div>
            </div>
          )}

          {action.type === 'append-current' && (
            <div className="space-y-3">
              <div className="rounded-xl border border-[#C7DEC9] bg-[#F2F8F3] p-3.5 text-xs text-[#244E35]">
                <p className="font-semibold">
                  기록 대상: {action.targetSheet.title} (탭: {action.targetSheet.sheetName})
                </p>
                <p className="mt-0.5 text-[#3B624A]">
                  바르고 고운말로 작성한 아래 탐구 일지 1행이 시트에 제출됩니다.
                </p>
              </div>

              <div className="rounded-xl border border-[#DDD2BC] bg-[#FDFBF6] p-4 text-xs leading-relaxed text-[#3C332B]">
                <dl className="space-y-2">
                  <div className="flex justify-between gap-3">
                    <dt className="shrink-0 font-semibold text-[#6B5F52]">작성자 정보</dt>
                    <dd className="font-bold text-[#241E19] text-right">
                      {action.row.studentName || '미입력'}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="shrink-0 font-semibold text-[#6B5F52]">만난 임금님</dt>
                    <dd className="font-semibold text-[#241E19]">{action.row.kingTitle}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="shrink-0 font-semibold text-[#6B5F52]">질문 수 / 용어 수</dt>
                    <dd className="tabular-nums text-[#4E443B]">
                      질문 {action.row.questionCount}회 · 용어 {action.termCount}개
                    </dd>
                  </div>
                  <div className="border-t border-[#ECE4D4] pt-2">
                    <dt className="font-semibold text-[#6B5F52]">오늘의 역사 한 줄 기록</dt>
                    <dd className="mt-1 rounded-lg bg-[#F5EFE2] p-2.5 text-sm text-[#241E19]">
                      {action.row.reflection}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          )}

          {action.type === 'append-saved' && (
            <div className="space-y-3">
              <div className="rounded-xl border border-[#C7DEC9] bg-[#F2F8F3] p-3.5 text-xs text-[#244E35]">
                <p className="font-semibold">
                  기록 대상: {action.targetSheet.title} (탭: {action.targetSheet.sheetName})
                </p>
                <p className="mt-0.5 text-[#3B624A]">
                  총 {action.rows.length}건의 탐구 일지가 시트 맨 아래에 새 행으로 추가됩니다.
                </p>
              </div>

              <div className="max-h-44 overflow-y-auto rounded-xl border border-[#DDD2BC] bg-[#FDFBF6] p-3.5 text-xs">
                <ul className="divide-y divide-[#ECE4D4]">
                  {action.rows.map((row, idx) => (
                    <li key={`${row.kingTitle}-${idx}`} className="py-2 first:pt-0 last:pb-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-[#241E19]">{row.kingTitle}</span>
                        <span className="text-[11px] text-[#746759] tabular-nums">
                          {row.studentName || '미입력'} · 질문 {row.questionCount}회
                        </span>
                      </div>
                      <p className="mt-0.5 truncate text-[#544A40]">{row.reflection}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {(action.type === 'delete-row' || action.type === 'delete-and-block') && (
            <div className="space-y-3">
              <div className="rounded-xl border border-[#DFB4B4] bg-[#FDF2F2] p-3.5 text-xs leading-relaxed text-[#7D2424]">
                <p className="font-bold">
                  대상 시트: {action.targetSheet.title} ({action.targetSheet.sheetName} ·{' '}
                  {action.entry.rowNumber}행)
                </p>
                <p className="mt-1">
                  {action.type === 'delete-and-block'
                    ? '이 탐구 일지 행을 Google Sheets에서 영구 삭제하고, 해당 작성자를 시트의 [차단 목록] 탭에 등록해 추가 제출과 노출을 제한합니다.'
                    : '이 탐구 일지 행을 Google Sheets에서 영구 삭제합니다. 삭제 후에는 되돌릴 수 없습니다.'}
                </p>
              </div>

              <div className="rounded-xl border border-[#DDD2BC] bg-[#FDFBF6] p-4 text-xs">
                <p className="font-bold text-[#241E19]">
                  {action.entry.studentName} · {action.entry.kingTitle}
                </p>
                <p className="mt-1.5 rounded-lg bg-[#F5EFE2] p-2.5 text-sm text-[#2C241E]">
                  {action.entry.reflection}
                </p>
              </div>
            </div>
          )}

          {action.type === 'unblock-author' && (
            <div className="rounded-xl border border-[#C6D4E3] bg-[#EBF1F8] p-4 text-sm text-[#1D3B5E]">
              <p className="font-bold">차단 해제 대상: {action.blocked.authorLabel}</p>
              <p className="mt-1 text-xs leading-relaxed text-[#364B63]">
                Google Sheets <strong>[차단 목록]</strong> 탭에서 이 작성자를 제거하여 다시
                탐구 일지를 제출하고 게시할 수 있도록 허용합니다.
              </p>
            </div>
          )}

          {errorMessage && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-xl border border-[#DFB4B4] bg-[#FDF2F2] px-3.5 py-2.5 text-xs text-[#7D2424]"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-1">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onCancel}
              className="inline-flex min-h-[42px] items-center justify-center rounded-xl border border-[#D4C7AE] bg-[#FDFBF6] px-4 py-2 text-xs font-semibold text-[#4E443B] hover:bg-[#EFE8D8] disabled:opacity-45 sm:text-sm whitespace-nowrap"
            >
              취소
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => void onConfirm()}
              className={`inline-flex min-h-[42px] items-center justify-center gap-2 rounded-xl px-5 py-2 text-xs font-semibold text-white hover:opacity-92 disabled:opacity-60 sm:text-sm whitespace-nowrap ${
                isDanger ? 'bg-[#A93636]' : 'bg-[#2E6B47]'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  <span>Google Sheets 처리 중...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  <span>{confirmLabel}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
