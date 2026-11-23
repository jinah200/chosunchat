export type SchoolLevel = '초등학교' | '중학교' | '고등학교';

export interface StudentProfile {
  schoolLevel: SchoolLevel;
  grade: number;
  classNumber: number;
  studentNumber: number;
  name: string;
}

export const SCHOOL_LEVELS: SchoolLevel[] = ['초등학교', '중학교', '고등학교'];

export function getGradesForSchoolLevel(level: SchoolLevel): number[] {
  return level === '초등학교' ? [1, 2, 3, 4, 5, 6] : [1, 2, 3];
}

export const CLASS_NUMBERS: number[] = Array.from({ length: 15 }, (_, idx) => idx + 1);
export const STUDENT_NUMBERS: number[] = Array.from({ length: 35 }, (_, idx) => idx + 1);

export const DEFAULT_STUDENT_PROFILE: StudentProfile = {
  schoolLevel: '초등학교',
  grade: 5,
  classNumber: 1,
  studentNumber: 1,
  name: '',
};

export function formatStudentProfileLabel(profile: StudentProfile): string {
  const base = `${profile.schoolLevel} ${profile.grade}학년 ${profile.classNumber}반 ${profile.studentNumber}번`;
  const trimmedName = profile.name.trim();
  return trimmedName ? `${base} ${trimmedName}` : base;
}

export function normalizeAuthorKey(label: string): string {
  return label.replace(/\s+/g, '').toLowerCase();
}

// Classroom polite Korean pre-check (profanity / insults / abusive language)
const INAPPROPRIATE_PATTERNS: RegExp[] = [
  /시\s*발|씨\s*발|씨\s*팔|시\s*팔|ㅅ\s*ㅂ|ㅆ\s*ㅂ/i,
  /병\s*신|ㅂ\s*ㅅ|빙\s*신/i,
  /개\s*새\s*끼|개\s*색\s*기|새\s*끼/i,
  /존\s*나|졸\s*라|ㅈ\s*ㄴ/i,
  /지\s*랄|ㅈ\s*ㄹ/i,
  /미\s*친\s*놈|미\s*친\s*년|미\s*쳤/i,
  /꺼\s*져|닥\s*쳐|뒤\s*져|죽\s*어\s*라|죽\s*여/i,
  /바\s*보\s*야|멍\s*청\s*이|찐\s*따|허\s*접|쓰\s*레\s*기/i,
  /느\s*금\s*마|니\s*애\s*미|애\s*미|애\s*비/i,
  /fuck|shit|bitch|asshole|idiot|stupid/i,
];

export interface PoliteCheckResult {
  isClean: boolean;
  reason?: string;
}

export function checkPoliteKorean(text: string): PoliteCheckResult {
  const trimmed = text.trim();
  if (!trimmed) {
    return { isClean: true };
  }

  for (const pattern of INAPPROPRIATE_PATTERNS) {
    if (pattern.test(trimmed)) {
      return {
        isClean: false,
        reason:
          '바르고 고운말을 사용해 주세요! 비속어나 상처를 주는 표현은 탐구 일지에 제출할 수 없어요.',
      };
    }
  }

  return { isClean: true };
}
