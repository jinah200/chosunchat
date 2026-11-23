import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent, type ReactNode } from 'react';
import {
  AlertCircle,
  BookOpenCheck,
  ExternalLink,
  RotateCcw,
  Send,
  Sparkles,
} from 'lucide-react';
import type { HistoricalTerm, JoseonKing } from '../data/kings';
import { KingEmblem } from './KingEmblem';

export interface SillokReference {
  volume: string;
  basis: string;
}

export interface GroundingSource {
  title: string;
  url: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  isGreeting?: boolean;
  sillokReference?: SillokReference;
  sources?: GroundingSource[];
  grounded?: boolean;
}

interface ChatStageProps {
  king: JoseonKing;
  messages: ChatMessage[];
  terms: HistoricalTerm[];
  recommendedQuestions: string[];
  isShowingFollowUps: boolean;
  isLoading: boolean;
  errorMessage: string | null;
  onSendMessage: (text: string) => void;
  onRetryLast: () => void;
  onResetConversation: () => void;
  onRestoreDefaultQuestions: () => void;
  onSelectTerm: (termName: string) => void;
}

function renderMessageWithTermLinks(
  text: string,
  terms: HistoricalTerm[],
  accentText: string,
  accentSoftBg: string,
  onSelectTerm: (termName: string) => void,
): ReactNode {
  if (terms.length === 0) return text;

  const sortedTerms = [...terms]
    .map((t) => t.term.trim())
    .filter((t) => t.length >= 2)
    .sort((a, b) => b.length - a.length);

  if (sortedTerms.length === 0) return text;

  const escaped = sortedTerms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const regex = new RegExp(`(${escaped.join('|')})`, 'g');
  const parts = text.split(regex);

  return parts.map((part, idx) => {
    const matched = sortedTerms.find((term) => term === part);
    if (!matched) {
      return <span key={idx}>{part}</span>;
    }
    return (
      <button
        key={idx}
        type="button"
        onClick={() => onSelectTerm(matched)}
        title={`'${matched}' 뜻풀이 보기`}
        className="mx-0.5 inline rounded px-1 py-0.5 font-semibold underline decoration-dotted underline-offset-4 transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#264B75]"
        style={{
          backgroundColor: accentSoftBg,
          color: accentText,
        }}
      >
        {part}
      </button>
    );
  });
}

export function ChatStage({
  king,
  messages,
  terms,
  recommendedQuestions,
  isShowingFollowUps,
  isLoading,
  errorMessage,
  onSendMessage,
  onRetryLast,
  onResetConversation,
  onRestoreDefaultQuestions,
  onSelectTerm,
}: ChatStageProps) {
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isLoading, errorMessage]);

  useEffect(() => {
    setInput('');
  }, [king.id]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    setInput('');
    onSendMessage(trimmed);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing) return;
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const trimmed = input.trim();
      if (!trimmed || isLoading) return;
      setInput('');
      onSendMessage(trimmed);
    }
  };

  const handleQuickAsk = (question: string) => {
    if (isLoading) return;
    onSendMessage(question);
    inputRef.current?.focus();
  };

  return (
    <section
      aria-label={`${king.fullTitle}과의 실록 대화`}
      className="flex min-h-0 flex-1 flex-col bg-transparent"
    >
      {/* Active King Stage Bar + Major Achievements Quick Prompts */}
      <div className="border-b border-[#E4DCCB] bg-[#FDFBF6]/95 px-4 py-3.5 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3.5">
            <KingEmblem king={king} size="lg" />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                <h1 className="flex items-center gap-1.5 font-hanji-display text-lg font-bold text-[#241E19] truncate sm:text-xl">
                  <span>{king.fullTitle}</span>
                  <span
                    title={king.emojiLabel}
                    role="img"
                    aria-label={king.emojiLabel}
                    className="text-xl leading-none"
                  >
                    {king.emoji}
                  </span>
                </h1>
                <span className="text-xs font-medium text-[#6B5F52] tabular-nums whitespace-nowrap">
                  {king.personalName} · {king.reignDuration} ({king.reignYears})
                </span>
              </div>
              <p className="mt-0.5 truncate text-xs text-[#544A40] sm:text-[13px]">
                대표 업적·사건: <strong className="font-semibold text-[#2E2620]">{king.headlineAchievement}</strong>
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <a
              href={king.sillokUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden min-h-[38px] items-center gap-1.5 rounded-lg border border-[#C6D4E3] bg-[#EBF1F8] px-3 py-1.5 text-xs font-semibold text-[#1D3B5E] transition-colors hover:bg-[#DFE9F4] whitespace-nowrap sm:inline-flex"
            >
              <span>『{king.sillokTitle}』 원문</span>
              <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            </a>

            <button
              type="button"
              onClick={onResetConversation}
              disabled={isLoading || messages.length <= 1}
              className="inline-flex min-h-[38px] shrink-0 items-center gap-1.5 rounded-lg border border-[#DFD5C2] bg-[#FAF6EC] px-3 py-1.5 text-xs font-semibold text-[#4E443B] transition-colors duration-150 hover:border-[#C5B79C] hover:bg-[#F3ECDD] disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#264B75] whitespace-nowrap"
            >
              <RotateCcw className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>처음부터</span>
            </button>
          </div>
        </div>

        {/* Clickable Major Achievements / Events Bar */}
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-[#EFE8DA] pt-2.5">
          <span className="text-xs font-semibold text-[#6E6254] whitespace-nowrap">
            주요 업적·사건 바로 묻기:
          </span>
          {king.keyEvents.map((evt) => (
            <button
              key={evt.label}
              type="button"
              disabled={isLoading}
              onClick={() => handleQuickAsk(evt.prompt)}
              className="inline-flex min-h-[34px] items-center rounded-lg border px-2.5 py-1 text-xs font-semibold transition-colors duration-150 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#264B75] whitespace-nowrap"
              style={{
                backgroundColor: king.accentSoftBg,
                borderColor: king.accentBorder,
                color: king.accentText,
              }}
            >
              {evt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Area */}
      <div className="hanji-scroll flex-1 overflow-y-auto px-4 py-6 sm:px-7">
        <div className="mx-auto max-w-3xl space-y-5">
          {messages.map((msg) => {
            const isModel = msg.role === 'model';
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${isModel ? 'justify-start' : 'justify-end'}`}
              >
                {isModel && <KingEmblem king={king} size="sm" className="mt-1" />}

                <div
                  className={`flex max-w-[88%] flex-col sm:max-w-[80%] ${
                    isModel ? 'items-start' : 'items-end'
                  }`}
                >
                  <div className="mb-1 flex items-center gap-2 px-1 text-xs text-[#6E6254]">
                    <span className="font-semibold text-[#3C332B]">
                      {isModel ? `${king.fullTitle} ${king.emoji}` : '나 (시간 여행자)'}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">{msg.timestamp}</span>
                  </div>

                  {isModel ? (
                    <div className="hanji-card w-full rounded-2xl rounded-tl-sm border border-[#E3DAC8] px-4 py-3.5 text-[15px] leading-[1.72] text-[#241E19] sm:px-5 sm:text-[16px]">
                      <div>
                        {renderMessageWithTermLinks(
                          msg.text,
                          terms,
                          king.accentText,
                          king.accentSoftBg,
                          onSelectTerm,
                        )}
                      </div>

                      {/* Sillok Grounding Evidence Footnote */}
                      {msg.sillokReference && (
                        <div className="mt-3.5 border-t border-[#ECE4D4] pt-2.5 text-xs text-[#5B5044]">
                          <div className="flex items-start gap-1.5">
                            <BookOpenCheck
                              className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#264B75]"
                              aria-hidden="true"
                            />
                            <div className="min-w-0 flex-1">
                              <span className="font-semibold text-[#1D3B5E]">
                                실록 근거: {msg.sillokReference.volume}
                              </span>
                              <span className="mx-1.5 text-[#B4A692]" aria-hidden="true">
                                ·
                              </span>
                              <span>{msg.sillokReference.basis}</span>
                            </div>
                          </div>

                          {msg.sources && msg.sources.length > 0 && (
                            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 pl-5">
                              {msg.sources.map((src) => (
                                <a
                                  key={src.url}
                                  href={src.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 font-medium text-[#264B75] underline decoration-[#264B75]/40 underline-offset-2 hover:text-[#163252]"
                                >
                                  <span className="max-w-[230px] truncate">{src.title}</span>
                                  <ExternalLink className="h-3 w-3 shrink-0" aria-hidden="true" />
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div
                      className="rounded-2xl rounded-tr-sm px-4 py-3 text-[15px] leading-[1.65] text-white sm:px-5 sm:text-[16px]"
                      style={{ backgroundColor: king.accentHex }}
                    >
                      {msg.text}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-start justify-start gap-3" role="status" aria-live="polite">
              <KingEmblem king={king} size="sm" className="mt-1" />
              <div className="flex flex-col items-start">
                <span className="mb-1 px-1 text-xs font-semibold text-[#3C332B]">
                  {king.fullTitle}
                </span>
                <div className="hanji-card flex items-center gap-3 rounded-2xl rounded-tl-sm border border-[#E3DAC8] px-4 py-3.5 text-sm text-[#5C5145]">
                  <span className="flex items-center gap-1" aria-hidden="true">
                    <span
                      className="h-2 w-2 animate-bounce rounded-full"
                      style={{ backgroundColor: king.accentHex, animationDelay: '0ms' }}
                    />
                    <span
                      className="h-2 w-2 animate-bounce rounded-full"
                      style={{ backgroundColor: king.accentHex, animationDelay: '150ms' }}
                    />
                    <span
                      className="h-2 w-2 animate-bounce rounded-full"
                      style={{ backgroundColor: king.accentHex, animationDelay: '300ms' }}
                    />
                  </span>
                  <span>
                    『{king.sillokTitle}』 기록을 살펴보며 {king.honorificName}께서 답장을 적고 계세요...
                  </span>
                </div>
              </div>
            </div>
          )}

          {errorMessage && (
            <div
              role="alert"
              className="mx-auto flex max-w-xl items-start justify-between gap-3 rounded-xl border border-[#DFB4B4] bg-[#FDF2F2] px-4 py-3 text-sm text-[#7D2424]"
            >
              <div className="flex items-start gap-2.5">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{errorMessage}</span>
              </div>
              <button
                type="button"
                onClick={onRetryLast}
                className="shrink-0 rounded-md border border-[#D49B9B] bg-white px-2.5 py-1 text-xs font-semibold text-[#7D2424] hover:bg-[#FAF0F0] whitespace-nowrap"
              >
                다시 시도
              </button>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Bottom Interaction Dock: 3 Recommended Question Chips + Input Bar */}
      <div className="border-t border-[#E2D8C5] bg-[#FAF6EC]/95 px-4 pt-3 pb-4 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <div className="mb-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#5E5347]">
                <Sparkles
                  className="h-3.5 w-3.5 shrink-0"
                  style={{ color: king.accentHex }}
                  aria-hidden="true"
                />
                <span>
                  {isShowingFollowUps
                    ? '실록 이야기 이어서 물어보기'
                    : '추천 질문 — 누르면 임금님께 바로 질문해요'}
                </span>
              </div>

              {isShowingFollowUps && (
                <button
                  type="button"
                  onClick={onRestoreDefaultQuestions}
                  className="text-xs font-medium text-[#6B5F52] underline underline-offset-2 hover:text-[#241E19] whitespace-nowrap"
                >
                  기본 질문 보기
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {recommendedQuestions.slice(0, 3).map((question) => (
                <button
                  key={question}
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleQuickAsk(question)}
                  className="flex min-h-[44px] items-center justify-center rounded-xl border border-[#DDD2BC] bg-[#FDFBF6] px-3 py-2 text-center text-[13px] font-medium leading-snug text-[#2E2721] transition-all duration-150 hover:-translate-y-0.5 hover:border-[#B8A88C] hover:bg-white disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#264B75]"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex items-center gap-2.5">
            <label htmlFor="chat-question-input" className="sr-only">
              {king.honorificName}께 보낼 질문 입력
            </label>
            <input
              ref={inputRef}
              id="chat-question-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              maxLength={500}
              placeholder={`${king.honorificName}의 업적이나 사건에 대해 궁금한 점을 물어보세요...`}
              className="min-h-[48px] flex-1 rounded-xl border border-[#D7CBB4] bg-[#FDFBF6] px-4 py-3 text-[15px] text-[#241E19] placeholder:text-[#8C7F70] transition-colors focus:border-[#264B75] focus:bg-white focus:outline-none disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={isLoading || input.trim().length === 0}
              className="inline-flex min-h-[48px] shrink-0 items-center justify-center gap-1.5 rounded-xl px-5 py-3 text-[15px] font-semibold text-white transition-opacity duration-150 hover:opacity-92 disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#264B75] whitespace-nowrap"
              style={{ backgroundColor: king.accentHex }}
            >
              <Send className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>전송</span>
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
