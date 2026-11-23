import { useState } from 'react';
import { BookMarked, Check, Copy, Download, FileSpreadsheet, Trash2, X } from 'lucide-react';
import type { HistoricalTerm } from '../data/kings';
import type { ConnectedSheetConfig } from '../lib/googleSheets';

export interface SavedJournalEntry {
  id: string;
  figureId: string;
  figureName: string;
  yearBadge: string;
  savedAt: string;
  reflection: string;
  terms: HistoricalTerm[];
  questionCount: number;
}

interface SavedJournalsModalProps {
  isOpen: boolean;
  entries: SavedJournalEntry[];
  connectedSheet: ConnectedSheetConfig | null;
  isGoogleSignedIn: boolean;
  sheetExportSuccess: string | null;
  onClose: () => void;
  onOpenSheetsModal: () => void;
  onRequestExportSingle: (entry: SavedJournalEntry) => void;
  onRequestExportAll: (entries: SavedJournalEntry[]) => void;
  onDeleteEntry: (id: string) => void;
  onCopyEntry: (entry: SavedJournalEntry) => Promise<boolean>;
  onDownloadEntry: (entry: SavedJournalEntry) => void;
}

export function SavedJournalsModal({
  isOpen,
  entries,
  connectedSheet,
  isGoogleSignedIn,
  sheetExportSuccess,
  onClose,
  onOpenSheetsModal,
  onRequestExportSingle,
  onRequestExportAll,
  onDeleteEntry,
  onCopyEntry,
  onDownloadEntry,
}: SavedJournalsModalProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const isSheetReady = Boolean(isGoogleSignedIn && connectedSheet);

  const handleCopy = async (entry: SavedJournalEntry) => {
    const ok = await onCopyEntry(entry);
    if (ok) {
      setCopiedId(entry.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#241E19]/45 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="저장된 나의 역사 탐구 일지"
    >
      <div className="flex max-h-[84vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-[#DFD5C2] bg-[#FAF6EC] shadow-xl">
        <div className="flex items-center justify-between gap-4 border-b border-[#E2D8C5] bg-[#FDFBF6] px-6 py-4">
          <div className="flex items-center gap-2.5">
            <BookMarked className="h-5 w-5 text-[#8C561E]" aria-hidden="true" />
            <div>
              <h2 className="font-hanji-display text-lg font-bold text-[#241E19]">
                저장된 역사 탐구 일지
              </h2>
              <p className="text-xs text-[#6B5F52]">
                현재 브라우저에 저장된 기록이에요. 교사 Google Sheets로 한 번에 제출할 수도 있어요.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="창 닫기"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#DFD5C2] bg-[#FAF6EC] text-[#4E443B] hover:bg-[#EFE8D8]"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* Google Sheets Sync Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-[#E6DEC9] bg-[#F5EFE2] px-6 py-3">
          <div className="flex items-center gap-2 min-w-0 text-xs">
            <FileSpreadsheet className="h-4 w-4 shrink-0 text-[#2E6B47]" aria-hidden="true" />
            {isSheetReady ? (
              <span className="truncate font-medium text-[#225336]">
                연결된 시트: <strong>{connectedSheet?.title}</strong> ({connectedSheet?.sheetName})
              </span>
            ) : (
              <span className="text-[#5E5347]">
                교사 Google Sheets를 연결하면 일지를 학급 시트로 보낼 수 있어요.
              </span>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {isSheetReady && entries.length > 0 ? (
              <button
                type="button"
                onClick={() => onRequestExportAll(entries)}
                className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg bg-[#2E6B47] px-3 py-1.5 text-xs font-semibold text-white hover:opacity-92 whitespace-nowrap"
              >
                <FileSpreadsheet className="h-3.5 w-3.5" aria-hidden="true" />
                <span>전체 시트로 보내기 ({entries.length}건)</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenSheetsModal}
                className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-[#BBD4C1] bg-[#EDF6EF] px-3 py-1.5 text-xs font-semibold text-[#225336] hover:bg-[#E1EFE5] whitespace-nowrap"
              >
                <FileSpreadsheet className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Google Sheets 연결</span>
              </button>
            )}
          </div>
        </div>

        {sheetExportSuccess && (
          <div
            role="status"
            className="flex items-center gap-2 border-b border-[#C7DEC9] bg-[#EDF6EF] px-6 py-2.5 text-xs font-semibold text-[#225336]"
          >
            <Check className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{sheetExportSuccess}</span>
          </div>
        )}

        <div className="hanji-scroll flex-1 overflow-y-auto p-6">
          {entries.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#D7CBB4] bg-[#FDFBF6] px-6 py-12 text-center">
              <p className="font-hanji-display text-base font-bold text-[#3C332B]">
                아직 저장된 탐구 일지가 없어요
              </p>
              <p className="mt-2 text-sm text-[#6E6254]">
                조선 시대 임금님과 대화를 나눈 뒤, 오른쪽 탐구 노트의 &lsquo;오늘의 역사 한 줄 기록&rsquo;을 적어 저장해 보세요.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {entries.map((entry) => (
                <article
                  key={entry.id}
                  className="hanji-card rounded-xl border border-[#E3DAC8] p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-hanji-display text-base font-bold text-[#241E19]">
                          {entry.figureName}
                        </h3>
                        <span className="text-xs text-[#6B5F52]">
                          {entry.yearBadge}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-[#7E7162] tabular-nums">
                        {entry.savedAt}
                        <span className="mx-1.5" aria-hidden="true">
                          ·
                        </span>
                        질문 {entry.questionCount}회
                        <span className="mx-1.5" aria-hidden="true">
                          ·
                        </span>
                        정리한 용어 {entry.terms.length}개
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          isSheetReady ? onRequestExportSingle(entry) : onOpenSheetsModal()
                        }
                        className="inline-flex min-h-[36px] items-center gap-1 rounded-lg border border-[#BBD4C1] bg-[#EDF6EF] px-2.5 py-1.5 text-xs font-semibold text-[#225336] hover:bg-[#E1EFE5] whitespace-nowrap"
                      >
                        <FileSpreadsheet className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>시트 제출</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCopy(entry)}
                        className="inline-flex min-h-[36px] items-center gap-1 rounded-lg border border-[#DFD5C2] bg-[#FAF6EC] px-2.5 py-1.5 text-xs font-semibold text-[#3C332B] hover:bg-[#F0E9DA]"
                      >
                        {copiedId === entry.id ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-[#3A6B4F]" aria-hidden="true" />
                            <span>복사됨</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>복사</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => onDownloadEntry(entry)}
                        aria-label={`${entry.figureName} 일지 내려받기`}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#DFD5C2] bg-[#FAF6EC] text-[#3C332B] hover:bg-[#F0E9DA]"
                      >
                        <Download className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDeleteEntry(entry.id)}
                        aria-label={`${entry.figureName} 일지 삭제`}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#E5CECE] bg-[#FDF6F6] text-[#9A3232] hover:bg-[#F9E7E7]"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  </div>

                  <p className="mt-3 rounded-lg bg-[#F7F2E7] px-3.5 py-3 text-sm leading-relaxed text-[#2C241E]">
                    {entry.reflection}
                  </p>

                  {entry.terms.length > 0 && (
                    <div className="mt-3 text-xs leading-relaxed text-[#5E5347]">
                      <span className="font-semibold text-[#3C332B]">함께 배운 용어: </span>
                      {entry.terms.map((t) => t.term).join(', ')}
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
