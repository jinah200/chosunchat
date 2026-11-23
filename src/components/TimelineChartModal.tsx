import { ExternalLink, ScrollText, X } from 'lucide-react';

interface TimelineChartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TimelineChartModal({ isOpen, onClose }: TimelineChartModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#241E19]/55 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="조선왕조 500년 역사 한눈에 보기"
    >
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-[#DFD5C2] bg-[#FAF6EC] shadow-2xl">
        <div className="flex items-center justify-between gap-4 border-b border-[#E2D8C5] bg-[#FDFBF6] px-5 py-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <ScrollText className="h-5 w-5 shrink-0 text-[#A93636]" aria-hidden="true" />
            <div className="min-w-0">
              <h2 className="font-hanji-display text-lg font-bold text-[#241E19] truncate">
                조선왕조 500년 역사 한눈에
              </h2>
              <p className="text-xs text-[#6B5F52] truncate">
                1대 태조부터 27대 순종까지의 재위 기간과 대표 사건 계보표
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="계보표 창 닫기"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#DFD5C2] bg-[#FAF6EC] text-[#4E443B] hover:bg-[#EFE8D8]"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="hanji-scroll flex-1 overflow-y-auto bg-[#F3EDE0] p-4 sm:p-6">
          <div className="mx-auto max-w-xl overflow-hidden rounded-xl border border-[#DED4BF] bg-[#FDFBF6] shadow-sm">
            <img
              src="/assets/aistudio/image_d88e68ef.png"
              alt="조선왕조 500년 역사 한눈에 - 1대 태조부터 27대 순종까지의 주요 업적과 사건표"
              referrerPolicy="no-referrer"
              className="h-auto w-full object-contain"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E2D8C5] bg-[#FDFBF6] px-5 py-3.5">
          <span className="text-xs text-[#6B5F52]">
            출처 검증 기준: 국사편찬위원회 『조선왕조실록』
          </span>
          <a
            href="https://sillok.history.go.kr/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#264B75] hover:underline"
          >
            <span>sillok.history.go.kr 바로가기</span>
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        </div>
      </div>
    </div>
  );
}
