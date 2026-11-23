import { CheckCircle2, ExternalLink, Users, X } from 'lucide-react';
import { findKingByTitle } from '../data/kings';
import { KingEmblem } from './KingEmblem';

export interface SubmissionSuccessInfo {
  studentLabel: string;
  kingTitle: string;
  reflectionPreview: string;
  sheetTitle: string;
  sheetTabName: string;
  sheetUrl: string;
  count: number;
  submittedAt: string;
}

interface SubmissionSuccessModalProps {
  info: SubmissionSuccessInfo | null;
  onClose: () => void;
  onOpenClassmateBoard: () => void;
}

export function SubmissionSuccessModal({
  info,
  onClose,
  onOpenClassmateBoard,
}: SubmissionSuccessModalProps) {
  if (!info) return null;

  const matchedKing = findKingByTitle(info.kingTitle);

  return (
    <div
      className="fixed inset-0 z-[65] flex items-center justify-center bg-[#241E19]/55 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="탐구 일지 제출 완료 안내"
    >
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-[#C2DCC8] bg-[#FAF6EC] shadow-2xl">
        {/* Top Celebratory Header */}
        <div className="relative bg-[#EDF6EF] px-6 pt-6 pb-5 text-center border-b border-[#D0E4D5]">
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="absolute top-3.5 right-3.5 inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#C6DEC9] bg-white/80 text-[#3B5E47] hover:bg-white"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#2E6B47] text-white shadow-sm">
            <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
          </div>

          <h2 className="mt-3 font-hanji-display text-xl font-bold text-[#1D4B30]">
            탐구 일지가 잘 제출되었어요!
          </h2>
          <p className="mt-1 text-xs font-medium text-[#366349]">
            {info.count > 1
              ? `총 ${info.count}건의 탐구 일지가 선생님 Google Sheets에 안전하게 기록되었어요.`
              : '선생님 Google Sheets에 소중한 역사 탐구 기록이 안전하게 저장되었어요.'}
          </p>
        </div>

        {/* Submission Receipt Summary */}
        <div className="space-y-4 p-5">
          <div className="hanji-card rounded-xl border border-[#DFD5C2] p-4 space-y-3">
            {matchedKing && (
              <div className="flex items-center gap-3 border-b border-[#EFE8DA] pb-3">
                <KingEmblem king={matchedKing} size="sm" />
                <div className="min-w-0">
                  <p className="font-hanji-display text-sm font-bold text-[#241E19] truncate">
                    {matchedKing.fullTitle}{' '}
                    <span aria-hidden="true">{matchedKing.emoji}</span>
                  </p>
                  <p className="text-xs text-[#6B5F52] truncate">{info.studentLabel}</p>
                </div>
              </div>
            )}

            <dl className="space-y-1.5 text-xs">
              {!matchedKing && (
                <div className="flex justify-between gap-2">
                  <dt className="font-semibold text-[#6B5F52]">작성자</dt>
                  <dd className="font-bold text-[#241E19] text-right">{info.studentLabel}</dd>
                </div>
              )}
              <div className="flex justify-between gap-2">
                <dt className="font-semibold text-[#6B5F52]">제출한 시트</dt>
                <dd className="font-semibold text-[#225336] text-right truncate max-w-[220px]">
                  {info.sheetTitle} ({info.sheetTabName})
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="font-semibold text-[#6B5F52]">제출 시각</dt>
                <dd className="text-[#4E443B] tabular-nums">{info.submittedAt}</dd>
              </div>
            </dl>

            {info.reflectionPreview && (
              <div className="rounded-lg bg-[#F5EFE2] px-3 py-2.5 text-xs leading-relaxed text-[#2C241E]">
                “{info.reflectionPreview}”
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenClassmateBoard();
              }}
              className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-[#264B75] px-4 py-2.5 text-sm font-bold text-white hover:opacity-92"
            >
              <Users className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>친구들 탐구 일지 함께 보기</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <a
                href={info.sheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[40px] items-center justify-center gap-1 rounded-xl border border-[#C2DCC8] bg-[#EDF6EF] px-3 py-2 text-xs font-semibold text-[#1F5434] hover:bg-[#E1F0E5] whitespace-nowrap"
              >
                <span>시트에서 확인</span>
                <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              </a>

              <button
                type="button"
                onClick={onClose}
                className="inline-flex min-h-[40px] items-center justify-center rounded-xl border border-[#D4C7AE] bg-[#FDFBF6] px-3 py-2 text-xs font-bold text-[#3C332B] hover:bg-[#EFE8D8]"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
