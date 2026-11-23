import { useMemo, useState } from 'react';
import {
  ArrowRight,
  ExternalLink,
  FileSpreadsheet,
  ScrollText,
  Search,
  ShieldCheck,
  Users,
  X,
} from 'lucide-react';
import { ERA_FILTERS, JOSEON_KINGS, type EraGroup, type JoseonKing } from '../data/kings';
import { KingEmblem } from './KingEmblem';

interface KingsGalleryHomeProps {
  isSheetConnected: boolean;
  connectedSheetTitle?: string;
  onSelectKing: (kingId: string) => void;
  onOpenTimelineChart: () => void;
  onOpenSheetsModal: () => void;
  onOpenClassmateBoard: () => void;
}

export function KingsGalleryHome({
  isSheetConnected,
  connectedSheetTitle,
  onSelectKing,
  onOpenTimelineChart,
  onOpenSheetsModal,
  onOpenClassmateBoard,
}: KingsGalleryHomeProps) {
  const [eraFilter, setEraFilter] = useState<'all' | EraGroup>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredKings = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return JOSEON_KINGS.filter((king) => {
      if (eraFilter !== 'all' && king.eraGroup !== eraFilter) {
        return false;
      }
      if (!q) return true;
      const haystack = [
        `${king.order}대`,
        king.name,
        king.fullTitle,
        king.personalName,
        king.headlineAchievement,
        king.sillokTitle,
        ...king.keyEvents.map((e) => e.label),
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [eraFilter, searchQuery]);

  return (
    <main className="hanji-scroll flex-1 overflow-y-auto">
      <div className="mx-auto max-w-[1440px] px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
        {/* Editorial Royal Chronicle Hero */}
        <section className="border-b border-[#E1D7C4] pb-7">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[#7A3535]">
                <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>국사편찬위원회 『조선왕조실록』 기반 역사 대화</span>
                <span aria-hidden="true" className="text-[#C4B7A0]">
                  ·
                </span>
                <span className="text-[#5E5347] tabular-nums">1392~1910 · 519년 27대 왕조</span>
              </div>

              <h1 className="mt-2.5 font-hanji-display text-2xl font-bold tracking-tight text-[#241E19] sm:text-3xl lg:text-[36px] lg:leading-[1.28]">
                조선왕조 500년, 역대 임금님과 직접 대화해 보세요
              </h1>

              <p className="mt-2.5 max-w-2xl text-[15px] leading-relaxed text-[#52483E]">
                1대 태조부터 27대 순종까지, 만나고 싶은 임금님을 고르면 그 시대로 시간 여행을 떠납니다.
                각 왕의 주요 업적과 역사적 사건을 <strong className="font-semibold text-[#2E2620]">『조선왕조실록』</strong>의
                신뢰로운 기록에 근거해 알기 쉽게 배워 보세요.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={onOpenClassmateBoard}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-[#C6D4E3] bg-[#EBF1F8] px-4 py-2.5 text-sm font-semibold text-[#1D3B5E] transition-colors hover:bg-[#DFE9F4] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#264B75] whitespace-nowrap"
              >
                <Users className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>친구들 탐구 일지</span>
              </button>

              <button
                type="button"
                onClick={onOpenSheetsModal}
                title={
                  isSheetConnected && connectedSheetTitle
                    ? `연결된 학급 시트: ${connectedSheetTitle}`
                    : '선생님 본인 Google Sheets 연결하기'
                }
                className={`inline-flex min-h-[44px] items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#264B75] whitespace-nowrap ${
                  isSheetConnected
                    ? 'border-[#2E6B47] bg-[#2E6B47] text-white hover:opacity-92'
                    : 'border-[#B6D4BE] bg-[#EDF6EF] text-[#1F5434] hover:bg-[#E0EFE4]'
                }`}
              >
                <FileSpreadsheet className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{isSheetConnected ? '학급 시트 연결됨' : '교사 시트 연결'}</span>
              </button>

              <button
                type="button"
                onClick={onOpenTimelineChart}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-[#D4C7AE] bg-[#FDFBF6] px-4 py-2.5 text-sm font-semibold text-[#2E2620] transition-colors hover:border-[#B8A586] hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#264B75] whitespace-nowrap"
              >
                <ScrollText className="h-4 w-4 shrink-0 text-[#A93636]" aria-hidden="true" />
                <span>500년 계보표</span>
              </button>

              <a
                href="https://sillok.history.go.kr/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-[#C6D4E3] bg-[#EBF1F8] px-4 py-2.5 text-sm font-semibold text-[#1D3B5E] transition-colors hover:bg-[#DFE9F4] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#264B75] whitespace-nowrap"
              >
                <span>조선왕조실록 누리집</span>
                <ExternalLink className="h-4 w-4 shrink-0" aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* Interactive Era Filter Tabs + Instant Search */}
          <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div
              role="group"
              aria-label="시대별 조선 왕 분류"
              className="flex flex-wrap items-center gap-1.5 rounded-xl border border-[#E2D8C5] bg-[#EFE8DA]/80 p-1.5"
            >
              {ERA_FILTERS.map((tab) => {
                const isActive = eraFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setEraFilter(tab.id)}
                    aria-pressed={isActive}
                    className={`inline-flex min-h-[38px] items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors duration-150 whitespace-nowrap sm:text-sm ${
                      isActive
                        ? 'bg-[#FDFBF6] text-[#241E19] shadow-xs'
                        : 'text-[#5F5448] hover:text-[#241E19]'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className="text-[11px] font-medium text-[#7C6F60] tabular-nums">
                      {tab.rangeLabel}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="relative w-full lg:w-80">
              <Search
                className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#7E7162]"
                aria-hidden="true"
              />
              <label htmlFor="king-search-input" className="sr-only">
                조선 왕 이름, 업적, 사건 검색
              </label>
              <input
                id="king-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="왕 이름·업적·사건 검색 (예: 훈민정음, 탕평책)"
                className="min-h-[44px] w-full rounded-xl border border-[#D7CBB4] bg-[#FDFBF6] py-2.5 pr-9 pl-10 text-sm text-[#241E19] placeholder:text-[#8E8172] focus:border-[#264B75] focus:bg-white focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="검색어 지우기"
                  className="absolute top-1/2 right-2.5 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-[#7C6F60] hover:bg-[#EFE8D8] hover:text-[#241E19]"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Results Count */}
        <div className="mt-5 mb-4 flex items-center justify-between text-xs text-[#6B5F52]">
          <span className="tabular-nums">
            총 <strong className="font-semibold text-[#241E19]">{filteredKings.length}명</strong>의
            임금님이 시간 여행을 기다리고 있어요.
          </span>
          <span className="hidden sm:inline">임금님 카드를 누르면 바로 대화방으로 이동해요.</span>
        </div>

        {/* 27 Joseon Kings Main Grid */}
        {filteredKings.length === 0 ? (
          <div className="hanji-card rounded-2xl border border-dashed border-[#D7CBB4] px-6 py-14 text-center">
            <p className="font-hanji-display text-lg font-bold text-[#3C332B]">
              검색하신 내용에 해당하는 임금님을 찾지 못했어요
            </p>
            <p className="mt-1.5 text-sm text-[#6B5F52]">
              다른 왕 이름이나 역사 사건(예: 세종, 임진왜란, 수원 화성, 대동법)으로 검색해 보세요.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setEraFilter('all');
              }}
              className="mt-4 inline-flex min-h-[42px] items-center rounded-xl bg-[#264B75] px-4 py-2 text-sm font-semibold text-white hover:opacity-92"
            >
              전체 27대 임금 보기
            </button>
          </div>
        ) : (
          <section
            aria-label="조선 역대 국왕 목록"
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {filteredKings.map((king) => (
              <KingCard key={king.id} king={king} onSelect={onSelectKing} />
            ))}
          </section>
        )}
      </div>
    </main>
  );
}

function KingCard({
  king,
  onSelect,
}: {
  king: JoseonKing;
  onSelect: (kingId: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(king.id)}
      className="group hanji-card flex flex-col justify-between rounded-2xl border border-[#E2D8C5] p-5 text-left transition-all duration-150 hover:-translate-y-0.5 hover:border-[#BBA98B] hover:bg-white hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#264B75]"
    >
      <div>
        {/* Top Row: Royal Seal Emblem + Name & Reign */}
        <div className="flex items-start gap-3.5">
          <KingEmblem king={king} size="md" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <h2 className="flex items-center gap-1.5 font-hanji-display text-lg font-bold text-[#241E19] truncate">
                <span className="truncate">
                  {king.order}. {king.name}
                </span>
                <span
                  title={king.emojiLabel}
                  className="shrink-0 text-lg leading-none"
                  role="img"
                  aria-label={king.emojiLabel}
                >
                  {king.emoji}
                </span>
              </h2>
              <span
                className="shrink-0 text-[11px] font-semibold whitespace-nowrap"
                style={{ color: king.accentText }}
              >
                {king.eraLabel}
              </span>
            </div>

            <div className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-xs text-[#6E6254] tabular-nums">
              <span className="font-medium text-[#4A4036]">{king.personalName}</span>
              <span aria-hidden="true">·</span>
              <span>{king.reignDuration}</span>
              <span aria-hidden="true">·</span>
              <span>{king.reignYears}</span>
            </div>
          </div>
        </div>

        {/* Core Achievement Headline */}
        <div className="mt-4 border-t border-[#EEE6D7] pt-3.5">
          <p className="text-[15px] font-bold leading-snug text-[#241E19]">
            {king.headlineAchievement}
          </p>
          <p className="mt-1.5 text-xs leading-relaxed text-[#5E5347]">
            {king.keyEvents.map((e) => e.label).join(' · ')}
          </p>
        </div>
      </div>

      {/* Footer: Sillok Source & Enter Cue */}
      <div className="mt-4 flex items-center justify-between border-t border-[#F0E9DC] pt-3 text-xs">
        <span className="font-medium text-[#75685A]">『{king.sillokTitle}』</span>
        <span
          className="inline-flex items-center gap-1 font-semibold transition-transform duration-150 group-hover:translate-x-0.5"
          style={{ color: king.accentHex }}
        >
          <span>대화하기</span>
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
      </div>
    </button>
  );
}
