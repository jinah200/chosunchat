import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';
import { getKingById, type JoseonKing } from './src/data/kings.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

function getAiClient(): GoogleGenAI {
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

interface ChatTurn {
  role: 'user' | 'model';
  text: string;
}

interface ChatRequestBody {
  kingId?: string;
  figureId?: string;
  message?: string;
  history?: ChatTurn[];
  existingTerms?: string[];
}

interface ExtractedTerm {
  term: string;
  hanja?: string;
  category: string;
  definition: string;
}

interface SillokReference {
  volume: string;
  basis: string;
}

interface GroundingSource {
  title: string;
  url: string;
}

interface ModelChatPayload {
  reply?: string;
  sillokReference?: SillokReference;
  terms?: ExtractedTerm[];
  followUpQuestions?: string[];
}

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    reply: {
      type: Type.STRING,
      description:
        '조선 왕의 품격 있는 페르소나와 말투로 초등학생에게 답하는 자연스러운 한국어 답변. 조선왕조실록의 정확한 역사 사실과 주요 업적·사건을 중심으로 3~4문장 이내로 간결하고 생동감 있게 작성.',
    },
    sillokReference: {
      type: Type.OBJECT,
      description:
        '이번 답변의 역사적 근거가 되는 조선왕조실록 기록 안내. 정확한 권수나 날짜를 확신할 수 없을 때는 지어내지 말고 해당 실록명과 재위 시기·사건명만 정확히 기재.',
      properties: {
        volume: {
          type: Type.STRING,
          description: '예: 『세종실록』 (세종 25년·1443년 기록) 또는 『정조실록』 (수원 화성 축조 기록)',
        },
        basis: {
          type: Type.STRING,
          description: '실록에 전하는 핵심 역사적 사실 1문장 요약',
        },
      },
      required: ['volume', 'basis'],
    },
    terms: {
      type: Type.ARRAY,
      description:
        '방금 대화(학생의 질문과 왕의 답변)에 등장한 중요한 조선 시대 역사 용어·사건·제도 중 아직 노트에 없는 핵심 용어 0~2개.',
      items: {
        type: Type.OBJECT,
        properties: {
          term: {
            type: Type.STRING,
            description: '핵심 역사 용어 또는 사건명 (예: 6조 직계제, 경국대전, 탕평책, 수원 화성)',
          },
          hanja: {
            type: Type.STRING,
            description: '정확히 아는 경우에만 한자 표기',
          },
          category: {
            type: Type.STRING,
            description: '짧은 분류 (예: 정치 · 제도, 역사 · 사건, 경제 · 개혁, 문화 · 과학)',
          },
          definition: {
            type: Type.STRING,
            description: '초등학생이 쉽게 이해할 수 있는 정확하고 친절한 1~2문장 뜻풀이',
          },
        },
        required: ['term', 'category', 'definition'],
      },
    },
    followUpQuestions: {
      type: Type.ARRAY,
      description:
        '방금 나눈 대화에 이어서 이 임금님의 주요 업적이나 역사적 사건에 대해 초등학생이 궁금해할 만한 후속 질문 3개 (각 24자 이내).',
      items: {
        type: Type.STRING,
      },
    },
  },
  required: ['reply', 'sillokReference', 'terms', 'followUpQuestions'],
};

function sanitizeConversationContents(
  history: ChatTurn[],
  currentMessage: string,
): Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> {
  const cleaned: Array<{ role: 'user' | 'model'; text: string }> = [];

  for (const turn of history) {
    if (!turn || (turn.role !== 'user' && turn.role !== 'model')) continue;
    const text = typeof turn.text === 'string' ? turn.text.trim() : '';
    if (!text) continue;

    // Gemini conversation turns should begin with a 'user' turn.
    if (cleaned.length === 0 && turn.role === 'model') {
      continue;
    }

    const prev = cleaned[cleaned.length - 1];
    if (prev && prev.role === turn.role) {
      prev.text = `${prev.text}\n${text}`;
    } else {
      cleaned.push({ role: turn.role, text });
    }
  }

  // Ensure the final turn is the current user message without duplicating consecutive user roles
  const last = cleaned[cleaned.length - 1];
  if (last && last.role === 'user') {
    // Drop orphaned unanswered user turn from a prior failed attempt
    cleaned.pop();
  }

  cleaned.push({ role: 'user', text: currentMessage });

  return cleaned.map((turn) => ({
    role: turn.role,
    parts: [{ text: turn.text }],
  }));
}

function parseJsonSafely(rawText: string): ModelChatPayload | null {
  const trimmed = rawText.trim();
  if (!trimmed) return null;

  const candidates: string[] = [trimmed];

  // Strip ```json ... ``` fences if present
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch && fenceMatch[1]) {
    candidates.push(fenceMatch[1].trim());
  }

  // Extract outermost JSON object braces if surrounded by extra text
  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    candidates.push(trimmed.slice(firstBrace, lastBrace + 1));
  }

  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate) as ModelChatPayload;
      if (parsed && typeof parsed === 'object' && typeof parsed.reply === 'string') {
        return parsed;
      }
    } catch {
      // Try next candidate
    }
  }

  return null;
}

function buildSystemInstruction(king: JoseonKing, existingTerms: string[]): string {
  const eventList = king.keyEvents.map((e) => e.label).join(', ');
  const existingTermsText = existingTerms.length > 0 ? existingTerms.join(', ') : '없음';

  return `당신은 조선왕조 ${king.fullTitle}(휘: ${king.personalName}, 재위 ${king.reignYears} · ${king.reignDuration})입니다.
대표 업적 및 주요 사건: ${king.headlineAchievement} (${eventList})
공식 실록 문헌: 『${king.sillokTitle}』 (${king.sillokUrl})
학생에게 방금 건넨 첫인사: "${king.greeting}"

[『${king.sillokTitle}』 핵심 사료 사실]
${king.sillokFacts}

[역사적 정확성 및 조선왕조실록(sillok.history.go.kr) 근거 원칙]
1. 반드시 국사편찬위원회 『조선왕조실록』(https://sillok.history.go.kr/)의 공신력 있는 사료와 검증된 한국사 교과서 사실만을 근거로 답변하세요.
2. 사실이 아닌 전설·야사·드라마적 각색을 역사 사실처럼 말하지 말고, 혹시 불확실한 연도나 실록 권수·날짜는 절대 지어내지 마세요.
3. 특히 ${king.name}의 주요 업적(${eventList})과 역사적 사건의 원인·과정·결과를 초등학생이 이해하기 쉽게 풀어 설명하세요.
4. 단종·연산군·광해군·인조·순종 등 시련이나 갈등이 있었던 시기라도 사실을 왜곡하거나 미화하지 않고, 실록 기록에 근거해 차분하고 객관적이며 교육적인 시각으로 설명하세요.

[초등학생 대화 및 출력 규칙]
1. 대상은 초등학생(4~6학년)입니다. 따뜻하고 품격 있는 왕의 어조("~란다", "~라네", "~었지", "~하거라")를 유지하되 어려운 한자어는 쉽게 풀어서 말하세요.
2. 답변(reply)은 반드시 3~4문장 이내로 간결하고 생동감 있게 작성하세요. 마크다운 기호(**, *, # 등), 각주 번호([1]), 이모지를 넣지 말고 깨끗한 한국어 문장으로만 답하세요.
3. sillokReference에는 답변의 근거가 된 실록명(『${king.sillokTitle}』 등)과 정확한 역사적 배경 요약을 1문장으로 정리하세요.
4. terms에는 이번 대화에 등장한 초등 사회 교과서 핵심 역사 용어·사건 0~2개를 선정해 정리하세요. 이미 노트에 있는 용어(${existingTermsText})는 중복하지 마세요.
5. followUpQuestions에는 ${king.name}의 업적·사건과 이어지는 흥미로운 후속 질문 3개를 24자 이내로 제안하세요.`;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({
      ok: true,
      hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    });
  });

  app.post('/api/chat', async (req, res) => {
    try {
      const body = (req.body ?? {}) as ChatRequestBody;
      const requestedId =
        typeof body.kingId === 'string' && body.kingId.trim()
          ? body.kingId.trim()
          : typeof body.figureId === 'string'
            ? body.figureId.trim()
            : '';
      const message = typeof body.message === 'string' ? body.message.trim() : '';
      const history = Array.isArray(body.history) ? body.history.slice(-12) : [];
      const existingTerms = Array.isArray(body.existingTerms)
        ? body.existingTerms.filter((t): t is string => typeof t === 'string')
        : [];

      if (!requestedId || !message) {
        res.status(400).json({ error: '임금님 정보와 질문을 모두 입력해 주세요.' });
        return;
      }

      if (message.length > 500) {
        res.status(400).json({ error: '질문은 500자 이내로 입력해 주세요.' });
        return;
      }

      const king = getKingById(requestedId);
      if (!king) {
        res.status(404).json({ error: '선택한 조선 왕 정보를 찾을 수 없습니다.' });
        return;
      }

      if (!process.env.GEMINI_API_KEY) {
        res.status(503).json({
          error:
            'Gemini API 키가 설정되지 않았습니다. Settings > Secrets 패널에서 GEMINI_API_KEY를 확인해 주세요.',
        });
        return;
      }

      const ai = getAiClient();
      const systemInstruction = buildSystemInstruction(king, existingTerms);
      const contents = sanitizeConversationContents(history, message);

      const groundingSources: GroundingSource[] = [
        {
          title: `국사편찬위원회 『${king.sillokTitle}』 원문`,
          url: king.sillokUrl,
        },
        {
          title: '국사편찬위원회 조선왕조실록 누리집',
          url: 'https://sillok.history.go.kr/',
        },
      ];

      let parsed: ModelChatPayload | null = null;
      let lastError: unknown = null;

      // Single fast primary call on gemini-4-hydrogen; automatic fallback to gemini-3.1-flash-lite on 429/503
      const modelCandidates: Array<{ model: string; thinkingLevel: ThinkingLevel }> = [
        { model: 'gemini-4-hydrogen', thinkingLevel: ThinkingLevel.LOW },
        { model: 'gemini-3.1-flash-lite', thinkingLevel: ThinkingLevel.MINIMAL },
      ];

      for (const candidate of modelCandidates) {
        try {
          const response = await ai.models.generateContent({
            model: candidate.model,
            contents,
            config: {
              systemInstruction,
              responseMimeType: 'application/json',
              responseSchema: RESPONSE_SCHEMA,
              thinkingConfig: {
                thinkingLevel: candidate.thinkingLevel,
              },
            },
          });

          const candidateParsed = parseJsonSafely(response.text ?? '');
          if (candidateParsed && candidateParsed.reply && candidateParsed.reply.trim().length > 0) {
            parsed = candidateParsed;
            break;
          }
        } catch (err: unknown) {
          lastError = err;
          const status =
            typeof err === 'object' && err !== null && 'status' in err
              ? Number((err as { status?: number }).status)
              : 0;
          console.warn(
            `[api/chat] Model ${candidate.model} failed (status ${status}), trying fallback if available:`,
            err instanceof Error ? err.message : String(err),
          );
          // Do not fall through on auth errors (400/403)
          if (status === 400 || status === 403) {
            throw err;
          }
        }
      }

      if (!parsed || !parsed.reply || parsed.reply.trim().length === 0) {
        if (lastError) {
          throw lastError;
        }
        throw new Error('Failed to parse valid reply from Gemini');
      }

      const replyText = parsed.reply.trim();

      const sillokReference: SillokReference = {
        volume:
          parsed.sillokReference &&
          typeof parsed.sillokReference.volume === 'string' &&
          parsed.sillokReference.volume.trim().length > 0
            ? parsed.sillokReference.volume.trim()
            : `『${king.sillokTitle}』 (${king.reignYears})`,
        basis:
          parsed.sillokReference &&
          typeof parsed.sillokReference.basis === 'string' &&
          parsed.sillokReference.basis.trim().length > 0
            ? parsed.sillokReference.basis.trim()
            : `${king.fullTitle}의 ${king.headlineAchievement} 관련 실록 기록`,
      };

      const normalizedExisting = new Set(existingTerms.map((t) => t.replace(/\s+/g, '')));
      const cleanTerms = Array.isArray(parsed.terms)
        ? parsed.terms
            .filter(
              (item): item is ExtractedTerm =>
                Boolean(item) &&
                typeof item.term === 'string' &&
                item.term.trim().length > 0 &&
                typeof item.definition === 'string' &&
                item.definition.trim().length > 0 &&
                !normalizedExisting.has(item.term.replace(/\s+/g, '')),
            )
            .slice(0, 2)
            .map((item) => ({
              term: item.term.trim(),
              hanja: typeof item.hanja === 'string' ? item.hanja.trim() : undefined,
              category:
                typeof item.category === 'string' && item.category.trim().length > 0
                  ? item.category.trim()
                  : '역사 용어',
              definition: item.definition.trim(),
            }))
        : [];

      const followUpQuestions = Array.isArray(parsed.followUpQuestions)
        ? parsed.followUpQuestions
            .filter((q): q is string => typeof q === 'string' && q.trim().length > 0)
            .map((q) => q.trim())
            .slice(0, 3)
        : [];

      res.json({
        reply: replyText,
        sillokReference,
        sources: groundingSources,
        grounded: true,
        terms: cleanTerms,
        followUpQuestions,
      });
    } catch (err: unknown) {
      console.error('[api/chat] Gemini API error:', err);
      const status =
        typeof err === 'object' && err !== null && 'status' in err
          ? Number((err as { status?: number }).status)
          : 500;

      if (status === 400 || status === 403) {
        res.status(status).json({
          error:
            'API 키 인증에 문제가 있습니다. Settings > Secrets 패널에서 GEMINI_API_KEY를 확인해 주세요.',
        });
        return;
      }

      if (status === 429) {
        res.status(429).json({
          error: '지금 질문이 많이 몰려 잠시 기다려야 해요. 조금 뒤에 다시 물어봐 주세요.',
        });
        return;
      }

      res.status(500).json({
        error: '타임머신 통신이 잠시 끊어졌어요. 다시 시도 버튼을 눌러 주세요.',
      });
    }
  });

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Joseon Time-Machine Talk server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
