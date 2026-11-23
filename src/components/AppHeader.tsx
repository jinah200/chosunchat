import {
  ArrowLeft,
  BookMarked,
  BookOpen,
  Compass,
  FileSpreadsheet,
  ScrollText,
  Users,
} from 'lucide-react';
import type { JoseonKing } from '../data/kings';

interface AppHeaderProps {
  viewMode: 'gallery' | 'chat';
  activeKing: JoseonKing;
  termCount: number;
  savedJournalCount: number;
  isSheetConnected: boolean;
  connectedSheetTitle?: string;
  onReturnHome: () => void;
  onOpenTimelineChart: () => void;
  onOpenNoteDrawer: () => void;
  onOpenSavedJournals: () => void;
  onOpenSheetsModal: () => void;
  onOpenClassmateBoard: () => void;
}

export function AppHeader({
  viewMode,
  activeKing,
  termCount,
  savedJournalCount,
  isSheetConnected,
  connectedSheetTitle,
  onReturnHome,
  onOpenTimelineChart,
  onOpenNoteDrawer,
  onOpenSavedJournals,
  onOpenSheetsModal,
  onOpenClassmateBoard,
}: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-[#E1D7C4] bg-[#FAF6EC]/95 backdrop-blur-xs">
      <div className="mx-auto flex h-16 max-w-[1520px] items-center justify-between gap-3 px-4 sm:px-6">
        {/* Zone 1: Brand Lockup */}
        <div className="flex shrink-0 items-center gap-2.5">
          {viewMode === 'chat' && (
            <button
              type="button"
              onClick={onReturnHome}
              aria-label="전체 임금 목록으로 돌아가기"
              className="inline-flex min-h-[38px] items-center gap-1 rounded-lg border border-[#DBD0BA] bg-[#FDFBF6] px-2.5 py-1.5 text-xs font-semibold text-[#3C332B] transition-colors hover:border-[#C2B397] hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#264B75] whitespace-nowrap"
            >
              <ArrowLeft className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span className="hidden sm:inline">왕 목록</span>
            </button>
          )}

          <button
            type="button"
            onClick={onReturnHome}
            className="flex shrink-0 items-center gap-2.5 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#264B75]"
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
              aria-hidden="true"
              className="shrink-0"
            >
              <rect
                x="2"
                y="2"
                width="28"
                height="28"
                rx="6"
                fill="#A93636"
                stroke="#842424"
                strokeWidth="1.5"
              />
              <rect
                x="5.5"
                y="5.5"
                width="21"
                height="21"
                rx="3.5"
                stroke="#FAF6EC"
                strokeOpacity="0.65"
                strokeWidth="1"
              />
              <text
                x="16"
                y="21"
                textAnchor="middle"
                fill="#FAF6EC"
                fontSize="13"
                fontWeight="700"
                fontFamily="Gowun Batang, serif"
              >
                조선
              </text>
            </svg>
            <span className="font-hanji-display text-lg font-bold tracking-tight text-[#241E19] whitespace-nowrap sm:text-xl">
              조선 타임머신 톡
            </span>
          </button>
        </div>

        {/* Zone 2: Active King Era Indicator */}
        {viewMode === 'chat' ? (
          <div
            className="hidden min-w-0 items-center gap-2 rounded-lg border px-3.5 py-1.5 md:flex"
            style={{
              backgroundColor: activeKing.accentSoftBg,
              borderColor: activeKing.accentBorder,
              color: activeKing.accentText,
            }}
          >
            <span aria-hidden="true" className="text-base leading-none">
              {activeKing.emoji}
            </span>
            <span className="truncate text-sm font-semibold tabular-nums">
              {activeKing.fullTitle} ({activeKing.reignYears}) · {activeKing.headlineAchievement}
            </span>
          </div>
        ) : (
          <div className="hidden items-center gap-2 text-xs font-medium text-[#6B5F52] lg:flex whitespace-nowrap">
            <span>국사편찬위원회 『조선왕조실록』 기반 역사 탐구</span>
          </div>
        )}

        {/* Zone 3: Single-line Utility Actions */}
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          {viewMode === 'chat' && (
            <button
              type="button"
              onClick={onOpenTimelineChart}
              className="hidden min-h-[40px] items-center gap-1.5 rounded-lg border border-[#DBD0BA] bg-[#FDFBF6] px-3 py-2 text-xs font-semibold text-[#3C332B] transition-colors hover:border-[#C2B397] hover:bg-white whitespace-nowrap xl:inline-flex"
            >
              <ScrollText className="h-4 w-4 shrink-0 text-[#A93636]" aria-hidden="true" />
              <span>계보표</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenClassmateBoard}
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-[#C6D4E3] bg-[#EBF1F8] px-2.5 py-2 text-xs font-semibold text-[#1D3B5E] transition-colors duration-150 hover:bg-[#DFE9F4] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#264B75] whitespace-nowrap sm:px-3.5 sm:text-sm"
          >
            <Users className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="hidden sm:inline">친구들 일지</span>
            <span className="sm:hidden">친구</span>
          </button>

          <button
            type="button"
            onClick={onOpenSheetsModal}
            title={
              isSheetConnected && connectedSheetTitle
                ? `연결된 Google Sheets: ${connectedSheetTitle}`
                : '교사 Google Sheets 연결 설정'
            }
            className={`inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border px-2.5 py-2 text-xs font-semibold transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#264B75] whitespace-nowrap sm:px-3.5 sm:text-sm ${
              isSheetConnected
                ? 'border-[#B6D4BE] bg-[#EDF6EF] text-[#225336] hover:bg-[#E1EFE5]'
                : 'border-[#DBD0BA] bg-[#FDFBF6] text-[#3C332B] hover:border-[#C2B397] hover:bg-white'
            }`}
          >
            <FileSpreadsheet className="h-4 w-4 shrink-0 text-[#2E6B47]" aria-hidden="true" />
            <span className="hidden md:inline">
              {isSheetConnected ? '시트 연결됨' : '내 시트 연결'}
            </span>
            <span className="md:hidden">시트</span>
          </button>

          <button
            type="button"
            onClick={onOpenSavedJournals}
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-[#DBD0BA] bg-[#FDFBF6] px-2.5 py-2 text-xs font-semibold text-[#3C332B] transition-colors duration-150 hover:border-[#C2B397] hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#264B75] whitespace-nowrap sm:px-3.5 sm:text-sm"
          >
            <BookMarked className="h-4 w-4 shrink-0 text-[#8C561E]" aria-hidden="true" />
            <span className="hidden sm:inline">내 일지</span>
            <span className="tabular-nums text-[#746759]">({savedJournalCount})</span>
          </button>

          {viewMode === 'chat' && (
            <button
              type="button"
              onClick={onOpenNoteDrawer}
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold text-white transition-opacity duration-150 hover:opacity-92 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#264B75] whitespace-nowrap xl:hidden sm:px-3.5 sm:text-sm"
              style={{ backgroundColor: activeKing.accentHex }}
            >
              <BookOpen className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>탐구 노트</span>
              <span className="tabular-nums opacity-90">({termCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* Compact Era Strip for mobile chat view */}
      {viewMode === 'chat' && (
        <div
          className="flex items-center justify-center gap-1.5 border-t px-4 py-1.5 text-xs font-semibold md:hidden"
          style={{
            backgroundColor: activeKing.accentSoftBg,
            borderColor: activeKing.accentBorder,
            color: activeKing.accentText,
          }}
        >
          <Compass className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span className="truncate tabular-nums">
            {activeKing.fullTitle} {activeKing.emoji} · {activeKing.yearBadge}
          </span>
        </div>
      )}
    </header>
  );
}
