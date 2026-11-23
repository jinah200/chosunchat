import type { JoseonKing } from '../data/kings';

interface KingEmblemProps {
  king: JoseonKing;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE_MAP: Record<'sm' | 'md' | 'lg', { box: string; orderBadge: string }> = {
  sm: { box: 'h-11 w-11 rounded-xl', orderBadge: 'text-[9px] px-1' },
  md: { box: 'h-14 w-14 rounded-2xl', orderBadge: 'text-[10px] px-1.5' },
  lg: { box: 'h-16 w-16 rounded-2xl', orderBadge: 'text-[10px] px-1.5' },
};

const ROBE_COLORS: Record<JoseonKing['eraGroup'], { robe: string; collar: string; bg: string }> = {
  early: { robe: '#B33535', collar: '#FAF6EC', bg: '#FBECE9' },
  middle: { robe: '#1E6460', collar: '#FAF6EC', bg: '#E7F4F2' },
  late: { robe: '#284F7D', collar: '#FAF6EC', bg: '#E9F0F9' },
  empire: { robe: '#C48A1E', collar: '#FDF8EC', bg: '#FBF2DE' },
};

export function KingEmblem({ king, size = 'md', className = '' }: KingEmblemProps) {
  const styles = SIZE_MAP[size];
  const colors = ROBE_COLORS[king.eraGroup];

  const isYoung = king.portraitStyle === 'young';
  const isElder = king.portraitStyle === 'elder';
  const isFounder = king.portraitStyle === 'founder';
  const isWarrior = king.portraitStyle === 'warrior';
  const isEmperor = king.portraitStyle === 'emperor';

  // Subtle individual face & beard variations across the 27 monarchs
  const beardColor = isElder ? '#D8D4CC' : isFounder && king.order === 1 ? '#57534E' : '#2C241E';
  const skinColor = king.order % 3 === 0 ? '#F7D8BA' : '#FADFC4';
  const cheekColor = '#F1A69B';

  return (
    <div
      className={`${styles.box} ${className} relative flex shrink-0 items-center justify-center overflow-hidden border select-none shadow-xs`}
      style={{
        backgroundColor: colors.bg,
        borderColor: king.accentBorder,
      }}
      aria-label={`${king.fullTitle} 어진 캐릭터`}
    >
      <svg
        viewBox="0 0 64 64"
        fill="none"
        aria-hidden="true"
        className="h-full w-full"
      >
        {/* Subtle traditional Dancheong halo ring */}
        <circle cx="32" cy="34" r="26" fill="#FFFFFF" fillOpacity="0.58" />
        <circle
          cx="32"
          cy="34"
          r="25"
          stroke={king.accentHex}
          strokeOpacity="0.22"
          strokeWidth="1.2"
          strokeDasharray="3 2.5"
        />

        {/* Royal Gonryongpo / Hwangnyongpo Shoulders */}
        <path
          d="M10 64C11 51 19 45 32 45C45 45 53 51 54 64H10Z"
          fill={colors.robe}
        />
        {/* White Royal Inner Collar (동정) */}
        <path d="M24 46L32 54L40 46H36L32 50L28 46H24Z" fill={colors.collar} />
        {/* Golden Dragon Chest Medallion (흉배/보) */}
        <circle cx="32" cy="58" r="4.5" fill="#E8B949" />
        <circle cx="32" cy="58" r="2.7" stroke="#8C561E" strokeWidth="0.9" />

        {/* Neck */}
        <rect x="28" y="41" width="8" height="7" rx="3" fill="#EAC5A4" />

        {/* Ears */}
        <circle cx="19" cy="31" r="3.4" fill={skinColor} />
        <circle cx="45" cy="31" r="3.4" fill={skinColor} />

        {/* Ikseongwan (익선관) Wings behind head */}
        <path
          d="M17 17C12 16 10 19 11 23C12 25 16 25 19 23V17Z"
          fill={isEmperor ? '#2A231E' : '#26211D'}
        />
        <path
          d="M47 17C52 16 54 19 53 23C52 25 48 25 45 23V17Z"
          fill={isEmperor ? '#2A231E' : '#26211D'}
        />

        {/* Face Base */}
        <rect x="20" y="19" width="24" height="25" rx="11" fill={skinColor} />

        {/* Ikseongwan Crown Cap */}
        <path
          d="M19 23C19 15.5 23 11 32 11C41 11 45 15.5 45 23H19Z"
          fill="#26211D"
        />
        <path
          d="M23 16C23 11 26.5 8 32 8C37.5 8 41 11 41 16H23Z"
          fill="#352E28"
        />
        {/* Golden Imperial Emblem on Crown for 26대 고종 & 27대 순종 or Subtle Band */}
        {isEmperor ? (
          <>
            <rect x="20" y="21" width="24" height="2.4" rx="1" fill="#E8B949" />
            <circle cx="32" cy="14" r="2.4" fill="#F2C85B" />
          </>
        ) : (
          <path
            d="M21 22.5H43"
            stroke="#594F46"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        )}

        {/* Eyebrows */}
        {isFounder || isWarrior ? (
          <>
            <path d="M24 27.5L29 28.5" stroke="#2C241E" strokeWidth="1.7" strokeLinecap="round" />
            <path d="M40 27.5L35 28.5" stroke="#2C241E" strokeWidth="1.7" strokeLinecap="round" />
          </>
        ) : (
          <>
            <path
              d="M24.2 28C25.5 26.8 27.8 26.8 29 27.8"
              stroke={isElder ? '#8E8880' : '#3A2E25'}
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <path
              d="M39.8 28C38.5 26.8 36.2 26.8 35 27.8"
              stroke={isElder ? '#8E8880' : '#3A2E25'}
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </>
        )}

        {/* Friendly Expressive Eyes */}
        {isElder ? (
          <>
            <path d="M24.8 31.5C25.8 30.3 27.6 30.3 28.6 31.5" stroke="#241E19" strokeWidth="1.6" strokeLinecap="round" />
            <path d="M35.4 31.5C36.4 30.3 38.2 30.3 39.2 31.5" stroke="#241E19" strokeWidth="1.6" strokeLinecap="round" />
          </>
        ) : (
          <>
            <circle cx="26.8" cy="31.5" r="1.75" fill="#241E19" />
            <circle cx="37.2" cy="31.5" r="1.75" fill="#241E19" />
            <circle cx="27.3" cy="30.9" r="0.55" fill="#FFFFFF" />
            <circle cx="37.7" cy="30.9" r="0.55" fill="#FFFFFF" />
          </>
        )}

        {/* Warm Rosy Cheeks */}
        <ellipse cx="23.5" cy="34.8" rx="2.3" ry="1.3" fill={cheekColor} fillOpacity="0.45" />
        <ellipse cx="40.5" cy="34.8" rx="2.3" ry="1.3" fill={cheekColor} fillOpacity="0.45" />

        {/* Mouth & Facial Hair */}
        {isYoung ? (
          <path
            d="M29 37.5C30.4 39.1 33.6 39.1 35 37.5"
            stroke="#8B4B3E"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        ) : isElder ? (
          <>
            {/* Wise Elder Long Beard */}
            <path
              d="M25 37C25.5 43.5 28.5 48.5 32 49C35.5 48.5 38.5 43.5 39 37C36.5 38.5 27.5 38.5 25 37Z"
              fill={beardColor}
            />
            <path
              d="M26.5 36.2C29 35.2 35 35.2 37.5 36.2"
              stroke={beardColor}
              strokeWidth="2.1"
              strokeLinecap="round"
            />
            <path
              d="M29.8 38.2C31 39.2 33 39.2 34.2 38.2"
              stroke="#7A4B3E"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </>
        ) : isFounder ? (
          <>
            {/* Majestic Founder Beard */}
            <path
              d="M24.5 36.8C25.5 43 28.5 47.5 32 47.8C35.5 47.5 38.5 43 39.5 36.8C36.5 38.4 27.5 38.4 24.5 36.8Z"
              fill={beardColor}
            />
            <path
              d="M26 36C28.8 34.8 35.2 34.8 38 36"
              stroke={beardColor}
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            <path
              d="M30 38.2H34"
              stroke="#C98A7A"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </>
        ) : isEmperor ? (
          <>
            {/* Imperial Refined Mustache */}
            <path
              d="M27.2 36.6C29 35.5 30.8 35.8 32 36.4C33.2 35.8 35 35.5 36.8 36.6"
              stroke="#2C241E"
              strokeWidth="1.9"
              strokeLinecap="round"
            />
            <path
              d="M29.8 39C31 39.9 33 39.9 34.2 39"
              stroke="#8B4B3E"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
          </>
        ) : (
          <>
            {/* Scholar / Warrior Neat Royal Mustache & Goatee */}
            <path
              d="M27.5 36.4C29.5 35.4 34.5 35.4 36.5 36.4"
              stroke={beardColor}
              strokeWidth="1.7"
              strokeLinecap="round"
            />
            <path
              d="M29.4 40.4C30.4 44.5 33.6 44.5 34.6 40.4H29.4Z"
              fill={beardColor}
            />
            <path
              d="M29.5 38.3C30.8 39.4 33.2 39.4 34.5 38.3"
              stroke="#8B4B3E"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
          </>
        )}
      </svg>

      {/* Crisp Royal Order Corner Tag */}
      <span
        className={`${styles.orderBadge} absolute right-0.5 bottom-0.5 rounded-md font-bold leading-tight text-white tabular-nums shadow-xs`}
        style={{ backgroundColor: king.accentHex }}
      >
        {king.order}대
      </span>
    </div>
  );
}
