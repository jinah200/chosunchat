import { useMemo, useState } from 'react';
import { LayoutGrid, Search, X } from 'lucide-react';
import { JOSEON_KINGS, type JoseonKing } from '../data/kings';
import { KingEmblem } from './KingEmblem';

interface KingQuickSidebarProps {
  activeKingId: string;
  onSelectKing: (kingId: string) => void;
  onReturnHome: () => void;
}

export function KingQuickSidebar({
  activeKingId,
  onSelectKing,
  onReturnHome,
}: KingQuickSidebarProps) {
  const [query, setQuery] = useState('');

  const filteredKings = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return JOSEON_KINGS;
    return JOSEON_KINGS.filter((king) => {
      const text = `${king.order}대 ${king.name} ${king.personalName} ${king.headlineAchievement}`.toLowerCase();
      return text.includes(q);
    });
  }, [query]);

  return (
    <>
      {/* Tablet & Mobile Compact Horizontal Strip */}
      <nav
        aria-label="조선 역대 왕 빠른 선택"
        className="border-b border-[#E1D7C4] bg-[#FAF6EC]/90 px-4 py-2.5 lg:hidden"
      >
        <div className="hanji-scroll flex items-center gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={onReturnHome}
            className="flex min-h-[42px] shrink-0 items-center gap-1.5 rounded-xl border border-[#D4C7AE] bg-[#FDFBF6] px-3 py-2 text-xs font-semibold text-[#3C332B] hover:bg-white whitespace-nowrap"
          >
            <LayoutGrid className="h-3.5 w-3.5 text-[#A93636]" aria-hidden="true" />
            <span>전체 27대</span>
          </button>

          {JOSEON_KINGS.map((king) => {
            const isActive = king.id === activeKingId;
            return (
              <button
                key={king.id}
                type="button"
                onClick={() => onSelectKing(king.id)}
                aria-pressed={isActive}
                className="flex min-h-[42px] shrink-0 items-center gap-2 rounded-xl border px-3 py-1.5 text-left transition-colors whitespace-nowrap"
                style={{
                  backgroundColor: isActive ? '#FDFBF6' : '#F4EEE1',
                  borderColor: isActive ? king.accentHex : '#DFD5C2',
                }}
              >
                <span
                  className="text-xs font-bold tabular-nums"
                  style={{ color: isActive ? king.accentHex : '#746759' }}
                >
                  {king.order}대
                </span>
                <span className="text-sm font-bold text-[#241E19]">
                  {king.name} <span aria-hidden="true">{king.emoji}</span>
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Desktop Left Royal Lineage Switcher */}
      <aside
        aria-label="조선 역대 왕 27명 선택"
        className="hidden w-[288px] shrink-0 flex-col border-r border-[#E1D7C4] bg-[#F8F3E8]/95 lg:flex xl:w-[304px]"
      >
        <div className="border-b border-[#E6DEC9] p-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-hanji-display text-base font-bold text-[#241E19]">
              조선 역대 왕 (1~27대)
            </h2>
            <button
              type="button"
              onClick={onReturnHome}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#264B75] hover:underline whitespace-nowrap"
            >
              <LayoutGrid className="h-3.5 w-3.5" aria-hidden="true" />
              <span>전체 보기</span>
            </button>
          </div>

          <div className="relative mt-3">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-[#827566]"
              aria-hidden="true"
            />
            <label htmlFor="sidebar-king-search" className="sr-only">
              왕 이름 또는 업적 검색
            </label>
            <input
              id="sidebar-king-search"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="왕 이름·업적 빠른 검색..."
              className="min-h-[38px] w-full rounded-lg border border-[#D7CBB4] bg-[#FDFBF6] py-1.5 pr-8 pl-8.5 text-xs text-[#241E19] placeholder:text-[#918373] focus:border-[#264B75] focus:bg-white focus:outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="검색어 지우기"
                className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-0.5 text-[#7C6F60] hover:text-[#241E19]"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>

        <div className="hanji-scroll flex-1 space-y-2 overflow-y-auto p-3.5">
          {filteredKings.map((king) => (
            <SidebarKingItem
              key={king.id}
              king={king}
              isActive={king.id === activeKingId}
              onSelect={onSelectKing}
            />
          ))}
        </div>
      </aside>
    </>
  );
}

function SidebarKingItem({
  king,
  isActive,
  onSelect,
}: {
  king: JoseonKing;
  isActive: boolean;
  onSelect: (kingId: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(king.id)}
      aria-pressed={isActive}
      className="flex w-full items-start gap-3 rounded-xl border p-2.5 text-left transition-all duration-150 hover:bg-[#FDFBF6] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#264B75]"
      style={{
        backgroundColor: isActive ? '#FDFBF6' : '#FAF6EC',
        borderColor: isActive ? king.accentHex : '#E3DAC8',
        boxShadow: isActive ? '0 2px 8px rgba(42, 33, 24, 0.07)' : 'none',
      }}
    >
      <KingEmblem king={king} size="sm" className="mt-0.5" />

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-1.5">
          <span className="flex items-center gap-1 text-sm font-bold text-[#241E19] truncate">
            <span className="truncate">
              {king.order}. {king.name}
            </span>
            <span aria-hidden="true" title={king.emojiLabel} className="shrink-0 text-sm">
              {king.emoji}
            </span>
          </span>
          <span className="shrink-0 text-[11px] text-[#7A6D5E] tabular-nums">
            {king.reignYears}
          </span>
        </div>
        <p className="mt-0.5 truncate text-xs text-[#544A40]">{king.headlineAchievement}</p>
      </div>
    </button>
  );
}
