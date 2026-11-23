export type EraGroup = 'early' | 'middle' | 'late' | 'empire';

export interface HistoricalTerm {
  term: string;
  hanja?: string;
  definition: string;
  category: string;
}

export interface KeyEventTopic {
  label: string;
  prompt: string;
}

export type KingPortraitStyle =
  | 'founder'
  | 'scholar'
  | 'young'
  | 'warrior'
  | 'elder'
  | 'emperor';

export interface JoseonKing {
  order: number;
  id: string;
  name: string;
  fullTitle: string;
  honorificName: string;
  personalName: string;
  reignDuration: string;
  reignYears: string;
  eraGroup: EraGroup;
  eraLabel: string;
  sealChar: string;
  emoji: string;
  emojiLabel: string;
  portraitStyle: KingPortraitStyle;
  sillokTitle: string;
  sillokCode: string;
  sillokUrl: string;
  yearBadge: string;
  headlineAchievement: string;
  keyEvents: KeyEventTopic[];
  sillokFacts: string;
  greeting: string;
  initialTerm: HistoricalTerm;
  suggestedQuestions: string[];
  accentHex: string;
  accentSoftBg: string;
  accentBorder: string;
  accentText: string;
}

interface EraPalette {
  eraLabel: string;
  accentHex: string;
  accentSoftBg: string;
  accentBorder: string;
  accentText: string;
}

const ERA_PALETTES: Record<EraGroup, EraPalette> = {
  early: {
    eraLabel: '조선 전기',
    accentHex: '#A93636',
    accentSoftBg: '#F9ECEB',
    accentBorder: '#E5BEBC',
    accentText: '#8E2828',
  },
  middle: {
    eraLabel: '조선 중기',
    accentHex: '#1D5B59',
    accentSoftBg: '#E9F4F3',
    accentBorder: '#B7D7D5',
    accentText: '#154745',
  },
  late: {
    eraLabel: '조선 후기',
    accentHex: '#264B75',
    accentSoftBg: '#EBF1F8',
    accentBorder: '#BCCDE0',
    accentText: '#1D3B5E',
  },
  empire: {
    eraLabel: '개항 · 대한제국',
    accentHex: '#8C561E',
    accentSoftBg: '#F9F1E6',
    accentBorder: '#DFC19D',
    accentText: '#724414',
  },
};

interface KingSeed {
  order: number;
  id: string;
  name: string;
  fullTitle: string;
  honorificName: string;
  personalName: string;
  reignDuration: string;
  reignYears: string;
  eraGroup: EraGroup;
  sealChar: string;
  sillokTitle: string;
  sillokCode: string;
  yearBadge: string;
  headlineAchievement: string;
  keyEvents: KeyEventTopic[];
  sillokFacts: string;
  greeting: string;
  initialTerm: HistoricalTerm;
  suggestedQuestions: string[];
}

const KING_SEEDS: KingSeed[] = [
  {
    order: 1,
    id: 'taejo',
    name: '태조',
    fullTitle: '제1대 태조',
    honorificName: '태조 임금님',
    personalName: '이성계',
    reignDuration: '재위 6년',
    reignYears: '1392~1398',
    eraGroup: 'early',
    sealChar: '太',
    sillokTitle: '태조실록',
    sillokCode: 'kaa',
    yearBadge: '1394년 · 한양 천도와 조선 건국',
    headlineAchievement: '조선 건국, 한양 천도',
    keyEvents: [
      { label: '조선 건국', prompt: '고려를 뒤로하고 새로운 나라 조선을 세우신 까닭은 무엇인가요?' },
      { label: '한양 천도', prompt: '수도를 개경에서 한양으로 옮기신 이유가 궁금해요!' },
      { label: '경복궁 창건', prompt: '경복궁과 한양 도성은 어떻게 지으셨나요?' },
    ],
    sillokFacts:
      '1392년 7월 17일 개경 수창궁에서 즉위하여 조선을 건국(국호 조선 제정 1393년). 정도전 등과 함께 성리학을 나라의 이념으로 삼고, 1394년 수도를 한양으로 천도하였으며 경복궁·종묘·사직단과 한양 도성을 축조함. 위화도 회군(1388)과 과전법 실시로 새 왕조의 토대를 마련함.',
    greeting:
      '어서 오너라, 먼 미래에서 찾아온 어린 벗이여! 나는 새 나라 조선을 세운 제1대 임금 태조 이성계란다. 지금 막 한양으로 도읍을 옮기고 경복궁을 세우며 나라의 기틀을 다지고 있으니, 조선 건국과 한양 천도에 대해 무엇이든 물어보거라.',
    initialTerm: {
      term: '한양 천도',
      hanja: '漢陽 遷都',
      category: '건국 · 도읍',
      definition:
        '태조 이성계가 1394년 조선의 수도를 개경에서 오늘날의 서울인 한양으로 옮긴 일이에요. 한강과 산으로 둘러싸여 나라를 다스리기 좋은 곳이었답니다.',
    },
    suggestedQuestions: [
      '왜 수도를 한양으로 옮기셨나요?',
      '나라 이름을 조선이라고 지은 이유는 무엇인가요?',
      '정도전 선생과는 어떤 나라를 만들고 싶으셨나요?',
    ],
  },
  {
    order: 2,
    id: 'jeongjong',
    name: '정종',
    fullTitle: '제2대 정종',
    honorificName: '정종 임금님',
    personalName: '이방과',
    reignDuration: '재위 2년',
    reignYears: '1398~1400',
    eraGroup: 'early',
    sealChar: '定',
    sillokTitle: '정종실록',
    sillokCode: 'kba',
    yearBadge: '1399년 · 개성 환도와 왕실 안정',
    headlineAchievement: '개성 환도 후 한양 재천도 기반',
    keyEvents: [
      { label: '개성 환도', prompt: '수도를 잠시 개성으로 다시 옮기신 이유가 무엇인가요?' },
      { label: '왕자의 난 수습', prompt: '형제들 사이의 갈등인 왕자의 난 때 어떤 마음이셨나요?' },
      { label: '사병 혁파', prompt: '개인 군대인 사병을 없애려 하신 이유는 무엇인가요?' },
    ],
    sillokFacts:
      '태조의 둘째 아들 이방과. 제1차 왕자의 난(1398) 이후 즉위하여 어수선한 민심을 달래고 1399년 도읍을 개경(개성)으로 환도함. 집현전의 전신 기구를 두고, 사병 혁파를 추진하였으며 제2차 왕자의 난 이후 동생 이방원(태종)에게 왕위를 물려주어 왕실의 혼란을 수습함.',
    greeting:
      '반갑구나, 미래에서 온 손님이여! 나는 조선 제2대 임금 정종 이방과란다. 왕실이 어지러웠던 시기에 도읍을 개성으로 옮겨 나라를 다독이고 백성들이 평안해지기를 바랐지. 나의 짧은 재위 기간에 일어난 일이 궁금하다면 편하게 물어보거라.',
    initialTerm: {
      term: '개성 환도',
      hanja: '開城 還都',
      category: '정치 · 도읍',
      definition:
        '정종이 제1차 왕자의 난 이후 불안해진 민심을 달래기 위해 1399년 수도를 한양에서 옛 도읍인 개성으로 잠시 되돌린 일이에요.',
    },
    suggestedQuestions: [
      '왜 수도를 개성으로 다시 옮기셨나요?',
      '동생 태종에게 왕위를 물려주신 이유가 궁금해요.',
      '재위 기간 중 가장 중요하게 생각한 일은 무엇인가요?',
    ],
  },
  {
    order: 3,
    id: 'taejong',
    name: '태종',
    fullTitle: '제3대 태종',
    honorificName: '태종 임금님',
    personalName: '이방원',
    reignDuration: '재위 18년',
    reignYears: '1400~1418',
    eraGroup: 'early',
    sealChar: '太',
    sillokTitle: '태종실록',
    sillokCode: 'kca',
    yearBadge: '1414년 · 6조 직계제와 왕권 강화',
    headlineAchievement: '6조 직계제 실시, 왕권 강화',
    keyEvents: [
      { label: '6조 직계제', prompt: '6조 직계제는 어떤 제도이고 왜 시행하셨나요?' },
      { label: '호패법', prompt: '조선 시대 신분증 같은 호패법은 왜 만드셨나요?' },
      { label: '신문고 설치', prompt: '백성이 북을 쳐서 억울함을 알리는 신문고는 어떻게 운영되었나요?' },
    ],
    sillokFacts:
      '1400년 즉위 후 1405년 한양으로 재천도(창덕궁 건립). 사병을 완전히 혁파하여 군사권을 왕에게 집중하고, 의정부를 거치지 않고 6조가 왕에게 직접 보고하는 6조 직계제를 실시함. 백성의 억울함을 듣는 신문고(1401)와 인구 파악용 호패법(1413)을 시행하고, 계미자 주조 및 혼일강리역대국도지도 제작을 지원하며 세종의 태평성대 기반을 다짐.',
    greeting:
      '잘 왔구나, 미래에서 찾아온 어린 손님이여! 나는 조선 제3대 임금 태종 이방원이라네. 흔들리던 나라의 기틀을 바로잡고자 6조 직계제를 실시하고 한양으로 다시 도읍을 정했지. 왕권을 강화하고 백성의 목소리를 듣기 위해 만든 제도들이 궁금하다면 물어보거라.',
    initialTerm: {
      term: '6조 직계제',
      hanja: '六曹 直啓制',
      category: '정치 · 제도',
      definition:
        '나라의 여섯 부서(이·호·예·병·형·공조)가 의정부를 거치지 않고 임금에게 직접 업무를 보고하고 명령을 받도록 한 제도로, 왕권을 강하게 만들었어요.',
    },
    suggestedQuestions: [
      '6조 직계제를 실시하신 이유는 무엇인가요?',
      '신문고는 어떤 백성들이 칠 수 있었나요?',
      '아드님 세종대왕에게 왕위를 물려주신 이유가 궁금해요.',
    ],
  },
  {
    order: 4,
    id: 'sejong',
    name: '세종',
    fullTitle: '제4대 세종대왕',
    honorificName: '세종대왕님',
    personalName: '이도',
    reignDuration: '재위 32년',
    reignYears: '1418~1450',
    eraGroup: 'early',
    sealChar: '世',
    sillokTitle: '세종실록',
    sillokCode: 'kda',
    yearBadge: '1446년 · 훈민정음 반포 직후',
    headlineAchievement: '훈민정음 창제',
    keyEvents: [
      { label: '훈민정음 창제', prompt: '백성을 위해 훈민정음을 만드신 과정이 궁금해요!' },
      { label: '과학 발명품', prompt: '자격루, 측우기, 앙부일구 같은 발명품은 왜 만드셨나요?' },
      { label: '4군 6진 개척', prompt: '북쪽 국경에 4군 6진을 개척하신 이야기를 들려주세요.' },
    ],
    sillokFacts:
      '1418년 즉위하여 집현전을 설치하고 학문을 장려함. 1443년(세종 25년) 12월 훈민정음 28자를 창제하고 1446년 반포함. 장영실·이천 등과 자격루·앙부일구·혼천의·측우기를 제작하고, 『농사직설』·『칠정산』을 편찬함. 최윤덕·김종서를 보내 압록강·두만강 유역에 4군 6진을 개척하여 오늘날 한반도 국경의 기틀을 세움.',
    greeting:
      '어서 오너라, 먼 미래에서 온 어린 벗이여! 나는 조선 제4대 임금 세종 이도란다. 지금은 1446년, 백성들이 누구나 쉽게 읽고 쓸 수 있도록 만든 새 글자 훈민정음을 세상에 널리 알린 참이지. 한글과 과학, 백성을 위한 정치가 궁금하다면 무엇이든 물어보거라.',
    initialTerm: {
      term: '훈민정음',
      hanja: '訓民正音',
      category: '문자 · 문화',
      definition:
        '‘백성을 가르치는 바른 소리’라는 뜻으로, 세종대왕이 1443년 창제하고 1446년 반포한 우리 글자 한글의 옛 이름이에요.',
    },
    suggestedQuestions: [
      '왜 새로운 글자 훈민정음을 만드셨나요?',
      '집현전에서는 학자들이 어떤 일을 했나요?',
      '측우기와 자격루는 백성들에게 어떤 도움이 되었나요?',
    ],
  },
  {
    order: 5,
    id: 'munjong',
    name: '문종',
    fullTitle: '제5대 문종',
    honorificName: '문종 임금님',
    personalName: '이향',
    reignDuration: '재위 2년',
    reignYears: '1450~1452',
    eraGroup: 'early',
    sealChar: '文',
    sillokTitle: '문종실록',
    sillokCode: 'kea',
    yearBadge: '1451년 · 화차 개발과 군사·과학 정비',
    headlineAchievement: '군사·과학 정책 정비',
    keyEvents: [
      { label: '화차(신기전) 개발', prompt: '여러 발의 화살을 쏘는 화차는 어떻게 만드셨나요?' },
      { label: '측우기 연구', prompt: '세자 시절 측우기 발명에도 참여하셨다면서요?' },
      { label: '고려사 편찬', prompt: '『고려사』와 『동국병감』 같은 책을 편찬하신 이유가 궁금해요.' },
    ],
    sillokFacts:
      '세종대왕의 맏아들 이향. 세자 시절 약 8년간 대리청정을 하며 아버지를 도왔고 측우기 제작에도 깊이 관여함. 즉위 후 5위 군제를 정비하고, 화살 100발을 동시에 발사하는 신기전 화차(문종 화차)를 개발함. 『고려사』, 『고려사절요』, 병서 『동국병감』 등을 편찬하며 군사와 학문을 조화롭게 발전시켰으나 재위 2년 만에 병으로 승하함.',
    greeting:
      '반갑구나, 미래에서 찾아온 벗이여! 나는 세종대왕의 뜻을 이어받은 조선 제5대 임금 문종 이향이라네. 세자 시절부터 익힌 과학과 병법으로 화차를 개발하고 나라의 군사 제도를 단단히 정비하고 있었지. 조선의 과학과 국방 이야기가 궁금하다면 물어보거라.',
    initialTerm: {
      term: '화차',
      hanja: '火車',
      category: '군사 · 과학',
      definition:
        '문종 때 크게 개량한 조선의 수레형 화포 무기로, 수레에 신기전 화살 100발을 실어 한꺼번에 발사해 나라를 지키는 데 큰 힘을 발휘했어요.',
    },
    suggestedQuestions: [
      '문종 임금님이 만드신 화차는 어떤 무기인가요?',
      '세자 시절 세종대왕님을 어떻게 도와드렸나요?',
      '짧은 재위 기간 동안 가장 힘쓰신 정책은 무엇인가요?',
    ],
  },
  {
    order: 6,
    id: 'danjong',
    name: '단종',
    fullTitle: '제6대 단종',
    honorificName: '단종 임금님',
    personalName: '이홍위',
    reignDuration: '재위 3년',
    reignYears: '1452~1455',
    eraGroup: 'early',
    sealChar: '端',
    sillokTitle: '단종실록',
    sillokCode: 'kfa',
    yearBadge: '1453년 · 어린 임금의 시련과 계유정난',
    headlineAchievement: '어린 나이 즉위, 세조에게 왕위 찬탈',
    keyEvents: [
      { label: '열두 살 즉위', prompt: '열두 살 어린 나이에 임금이 되셨을 때 어떠셨나요?' },
      { label: '계유정난', prompt: '숙부 수양대군이 일으킨 계유정난은 어떤 사건이었나요?' },
      { label: '사육신의 충절', prompt: '단종 임금님을 지키려 했던 사육신 이야기를 들려주세요.' },
    ],
    sillokFacts:
      '문종의 외아들 이홍위로 1452년 12세의 어린 나이에 즉위함. 황보인·김종서 등 원로 대신들이 보좌했으나 1453년 숙부 수양대군이 계유정난을 일으켜 정권을 장악함. 1455년 왕위를 넘겨주고 상왕이 되었으며, 성삼문 등 사육신의 단종 복위 운동 이후 노산군으로 강봉되어 영월 청령포로 유배됨. 훗날 숙종 때 단종으로 복위됨.',
    greeting:
      '안녕, 먼 미래에서 찾아와 준 친구여. 나는 열두 살 어린 나이에 조선의 제6대 임금이 된 단종 이홍위야. 할아버지 세종대왕님과 아버지 문종 임금님의 뜻을 잇고 싶었지만, 숙부와의 갈등 속에 큰 시련을 겪었단다. 그때의 역사 이야기가 궁금하다면 차분히 들려줄게.',
    initialTerm: {
      term: '계유정난',
      hanja: '癸酉靖難',
      category: '역사 · 정변',
      definition:
        '1453년 단종의 숙부인 수양대군(훗날 세조)이 김종서 등 어린 단종을 보좌하던 대신들을 제거하고 정권을 장악한 사건이에요.',
    },
    suggestedQuestions: [
      '계유정난은 왜 일어나게 되었나요?',
      '사육신은 어떤 분들이었나요?',
      '강원도 영월 청령포에서는 어떻게 지내셨나요?',
    ],
  },
  {
    order: 7,
    id: 'sejo',
    name: '세조',
    fullTitle: '제7대 세조',
    honorificName: '세조 임금님',
    personalName: '이유',
    reignDuration: '재위 13년',
    reignYears: '1455~1468',
    eraGroup: 'early',
    sealChar: '世',
    sillokTitle: '세조실록',
    sillokCode: 'kga',
    yearBadge: '1460년 · 경국대전 편찬 착수와 왕권 강화',
    headlineAchievement: '경국대전 편찬 착수',
    keyEvents: [
      { label: '경국대전 편찬 착수', prompt: '조선의 기본 법전인 경국대전을 왜 만들기 시작하셨나요?' },
      { label: '직전법 실시', prompt: '현직 관리에게만 땅을 주는 직전법은 어떤 제도인가요?' },
      { label: '6조 직계제 부활', prompt: '집현전을 없애고 6조 직계제를 다시 시행하신 이유가 궁금해요.' },
    ],
    sillokFacts:
      '세종대왕의 둘째 아들 수양대군(이유). 계유정난 이후 1455년 즉위함. 6조 직계제를 부활시키고 집현전을 폐지해 강력한 왕권을 확립함. 조선 통치의 기본 법전인 『경국대전』 편찬에 착수하여 호전·형전을 먼저 완성했고, 현직 관리에게만 수조권을 지급하는 직전법을 실시함. 원각사를 세우고 간경도감을 두어 불경을 한글로 번역·간행함.',
    greeting:
      '어서 오너라, 미래의 손님이여! 나는 조선 제7대 임금 세조 이유라네. 나라의 기강을 바로 세우고자 6조 직계제를 다시 시행하고, 조선의 뼈대가 될 법전 『경국대전』 편찬을 시작했지. 내가 펼친 법과 제도에 대해 궁금한 점을 물어보거라.',
    initialTerm: {
      term: '경국대전',
      hanja: '經國大典',
      category: '법률 · 제도',
      definition:
        '세조 때 만들기 시작해 성종 때 완성한 조선 시대의 가장 중요한 기본 법전으로, 정치·경제·사회 모든 분야의 법이 담겨 있어요.',
    },
    suggestedQuestions: [
      '경국대전은 어떤 내용을 담은 법전인가요?',
      '직전법을 실시하신 까닭이 궁금해요.',
      '간경도감에서는 한글로 어떤 책을 만들었나요?',
    ],
  },
  {
    order: 8,
    id: 'yejong',
    name: '예종',
    fullTitle: '제8대 예종',
    honorificName: '예종 임금님',
    personalName: '이황',
    reignDuration: '재위 1년',
    reignYears: '1468~1469',
    eraGroup: 'early',
    sealChar: '睿',
    sillokTitle: '예종실록',
    sillokCode: 'kha',
    yearBadge: '1468년 · 남이의 옥과 경국대전 마무리',
    headlineAchievement: '남이의 옥(역모 사건)',
    keyEvents: [
      { label: '남이의 옥', prompt: '남이 장군과 관련된 남이의 옥은 어떤 사건이었나요?' },
      { label: '경국대전 완성 추진', prompt: '아버지 세조의 경국대전 편찬을 어떻게 이어가셨나요?' },
      { label: '국조보감·실록 정비', prompt: '재위 1년 동안 어떤 나라 일을 챙기셨나요?' },
    ],
    sillokFacts:
      '세조의 둘째 아들 이황. 1468년 19세에 즉위하여 약 1년 2개월 재위함. 즉위 초 유자광의 고변으로 공신 남이·강순 등이 처형된 ‘남이의 옥’ 사건이 발생해 공신 세력 간의 권력 다툼이 드러남. 아버지 세조 때 시작된 『경국대전』 편찬을 마무리 단계까지 완성했고, 둔전 설치와 어량 개방 등 민생 정책을 추진함.',
    greeting:
      '반갑구나, 먼 미래에서 온 학생이여! 나는 조선 제8대 임금 예종 이황이라네. 짧은 1년 남짓의 재위 기간이었지만 아버지께서 시작하신 『경국대전』 편찬을 마무리하려 애썼고, 즉위 직후 남이의 옥 같은 큰 사건을 겪었지. 궁금한 점이 있다면 물어보거라.',
    initialTerm: {
      term: '남이의 옥',
      hanja: '南怡의 獄',
      category: '역사 · 사건',
      definition:
        '예종 즉위 직후인 1468년, 공신이었던 남이 장군이 역모를 꾸몄다는 고변으로 처형되면서 훈구 세력 내부의 갈등이 드러난 사건이에요.',
    },
    suggestedQuestions: [
      '남이의 옥 사건은 왜 일어나게 되었나요?',
      '짧은 재위 기간 동안 경국대전은 어디까지 완성하셨나요?',
      '즉위 당시 나이가 어렸을 때 정치는 어떻게 하셨나요?',
    ],
  },
  {
    order: 9,
    id: 'seongjong',
    name: '성종',
    fullTitle: '제9대 성종',
    honorificName: '성종 임금님',
    personalName: '이혈',
    reignDuration: '재위 25년',
    reignYears: '1469~1494',
    eraGroup: 'early',
    sealChar: '成',
    sillokTitle: '성종실록',
    sillokCode: 'kia',
    yearBadge: '1485년 · 경국대전 반포와 문화 융성',
    headlineAchievement: '경국대전 완성',
    keyEvents: [
      { label: '경국대전 완성', prompt: '드디어 완성하신 경국대전이 조선에 어떤 의미가 있나요?' },
      { label: '홍문관 설치', prompt: '집현전을 잇는 홍문관에서는 어떤 일을 했나요?' },
      { label: '사림 등용', prompt: '김종직 같은 사림 학자들을 관직에 등용하신 이유가 궁금해요.' },
    ],
    sillokFacts:
      '1469년 즉위하여 25년간 태평성대를 이끌며 조선 전기의 문물과 제도를 완성함. 1485년 조선의 기본 법전인 『경국대전』을 최종 완성·반포함. 집현전의 뒤를 잇는 홍문관을 설치해 사헌부·사간원과 함께 3사 언론 체제를 확립하고, 훈구 세력을 견제하기 위해 김종직 등 사림 세력을 적극 등용함. 『동국통감』, 『동국여지승람』, 『악학궤범』 등 수많은 문화유산 서적을 편찬함.',
    greeting:
      '어서 오너라, 먼 미래의 반가운 벗이여! 나는 조선의 법과 문화를 완성한 제9대 임금 성종 이혈이라네. 마침내 조선의 기본 법전인 『경국대전』을 완성해 반포하고, 홍문관을 두어 학문과 언론을 꽃피웠지. 조선 전기의 빛나는 제도와 문화에 대해 무엇이든 물어보거라.',
    initialTerm: {
      term: '홍문관',
      hanja: '弘文館',
      category: '제도 · 기관',
      definition:
        '성종이 집현전의 역할을 이어받아 설치한 기관으로, 궁궐의 책을 관리하고 임금의 학문 공부(경연)와 바른 정치를 돕는 일을 했어요.',
    },
    suggestedQuestions: [
      '경국대전이 완성되면서 나라는 어떻게 달라졌나요?',
      '사림 세력을 조정에 등용하신 까닭은 무엇인가요?',
      '『악학궤범』이나 『동국여지승람』은 어떤 책인가요?',
    ],
  },
  {
    order: 10,
    id: 'yeonsangun',
    name: '연산군',
    fullTitle: '제10대 연산군',
    honorificName: '연산군',
    personalName: '이융',
    reignDuration: '재위 12년',
    reignYears: '1494~1506',
    eraGroup: 'middle',
    sealChar: '燕',
    sillokTitle: '연산군일기',
    sillokCode: 'kja',
    yearBadge: '1504년 · 무오·갑자사화와 정치 갈등',
    headlineAchievement: '무오·갑자사화',
    keyEvents: [
      { label: '무오사화', prompt: '무오사화는 어떤 글 때문에 시작된 사건인가요?' },
      { label: '갑자사화', prompt: '어머니 폐비 윤씨와 관련된 갑자사화는 어떻게 일어났나요?' },
      { label: '중종반정', prompt: '결국 신하들이 중종반정을 일으킨 까닭은 무엇인가요?' },
    ],
    sillokFacts:
      '성종의 맏아들 이융. 1498년 김일손의 사초에 실린 김종직의 「조의제문」을 문제 삼아 사림을 대거 처벌한 무오사화를 일으켰고, 1504년 생모 폐비 윤씨의 사사 사건에 연루된 신하들을 숙청한 갑자사화를 일으킴. 언관 기구인 사간원과 홍문관, 경연을 없애고 한글 사용을 탄압하는 등 폭정을 이어가다 1506년 중종반정으로 폐위되어 실록 대신 『연산군일기』로 기록됨.',
    greeting:
      '먼 훗날에서 온 학생이구나. 나는 조선의 제10대 임금이었으나 중종반정으로 물러난 연산군 이융이라네. 무오사화와 갑자사화로 수많은 신하와 갈등을 빚고 백성을 힘들게 했던 내 시절의 기록은 『연산군일기』에 남아 있지. 역사에서 어떤 교훈을 얻을 수 있는지 함께 이야기해 보겠느냐.',
    initialTerm: {
      term: '사화',
      hanja: '士禍',
      category: '역사 · 사건',
      definition:
        '선비(사림)들이 정치적 다툼 속에서 큰 화를 입고 쫓겨나거나 처벌받은 사건을 말해요. 연산군 때 무오사화와 갑자사화가 일어났답니다.',
    },
    suggestedQuestions: [
      '무오사화와 갑자사화는 왜 일어났나요?',
      '실록이 아니라 왜 『연산군일기』라고 부르나요?',
      '연산군 시대의 역사가 우리에게 주는 교훈은 무엇일까요?',
    ],
  },
  {
    order: 11,
    id: 'jungjong',
    name: '중종',
    fullTitle: '제11대 중종',
    honorificName: '중종 임금님',
    personalName: '이역',
    reignDuration: '재위 39년',
    reignYears: '1506~1544',
    eraGroup: 'middle',
    sealChar: '中',
    sillokTitle: '중종실록',
    sillokCode: 'kka',
    yearBadge: '1519년 · 조광조의 개혁과 기묘사화',
    headlineAchievement: '조광조 개혁과 기묘사화',
    keyEvents: [
      { label: '조광조의 개혁', prompt: '조광조 선생과 함께 어떤 개혁 정치를 펼치려 하셨나요?' },
      { label: '현량과 실시', prompt: '추천으로 인재를 뽑는 현량과는 어떤 제도였나요?' },
      { label: '기묘사화', prompt: '개혁을 추진하다 왜 기묘사화가 일어나게 되었나요?' },
    ],
    sillokFacts:
      '1506년 중종반정으로 즉위하여 39년간 재위함. 연산군 때 폐지된 홍문관과 경연을 부활시키고, 훈구 공신을 견제하기 위해 조광조 등 신진 사림을 등용함. 조광조는 현량과 실시, 소격서 폐지, 향약 보급, 위훈 삭제 등 급진적 도학 정치를 추진했으나 훈구파의 반발과 왕의 부담이 겹쳐 1519년 기묘사화로 사림이 큰 화를 입음. 백운동 서원(소수서원 전신)이 세워지며 서원 문화가 싹틈.',
    greeting:
      '어서 오너라, 미래의 벗이여! 나는 중종반정 이후 무너진 나라의 질서를 되살리고자 했던 제11대 임금 중종 이역이라네. 젊은 사림 조광조를 등용해 바른 정치를 꿈꾸기도 했으나, 훈구 대신들과의 갈등 속에 기묘사화라는 아픈 사건도 겪었지. 그 시절의 개혁과 갈등이 궁금하다면 물어보거라.',
    initialTerm: {
      term: '기묘사화',
      hanja: '己卯士禍',
      category: '역사 · 사건',
      definition:
        '1519년 중종 때 조광조를 중심으로 한 사림 세력이 급진적인 개혁을 추진하다 훈구파의 반발로 쫓겨나고 처벌받은 사건이에요.',
    },
    suggestedQuestions: [
      '조광조 선생은 어떤 개혁을 주장했나요?',
      '기묘사화는 왜 일어나게 되었나요?',
      '중종반정 이후 가장 먼저 바로잡은 일은 무엇인가요?',
    ],
  },
  {
    order: 12,
    id: 'injong',
    name: '인종',
    fullTitle: '제12대 인종',
    honorificName: '인종 임금님',
    personalName: '이호',
    reignDuration: '재위 1년',
    reignYears: '1544~1545',
    eraGroup: 'middle',
    sealChar: '仁',
    sillokTitle: '인종실록',
    sillokCode: 'kla',
    yearBadge: '1545년 · 어진 정치와 짧은 8개월 재위',
    headlineAchievement: '단명 재위(8개월), 사림 복권',
    keyEvents: [
      { label: '8개월의 짧은 재위', prompt: '재위 기간이 8개월로 가장 짧으셨는데 어떤 임금이 되고 싶으셨나요?' },
      { label: '조광조 신원·현량과 복구', prompt: '기묘사화로 억울하게 벌받은 조광조 선생의 명예를 왜 회복시켜 주셨나요?' },
      { label: '효심과 어진 성품', prompt: '실록에 기록된 인종 임금님의 효심 이야기가 궁금해요.' },
    ],
    sillokFacts:
      '중종의 맏아들 이호. 1544년 11월 즉위해 1545년 7월 승하하여 조선 왕 중 가장 짧은 약 8개월간 재위함. 세자 시절부터 학문이 깊고 효성이 지극해 백성과 사림의 큰 기대를 받았음. 짧은 재위 중에도 기묘사화로 억울하게 희생된 조광조 등 사림의 관직을 복권하고 현량과를 되살려 도덕적 정치를 펼치려 힘씀.',
    greeting:
      '반갑구나, 먼 미래에서 찾아와 준 벗이여. 나는 조선에서 가장 짧은 8개월 동안 임금 자리에 있었던 제12대 인종 이호란다. 비록 몸이 약해 오래 다스리지는 못했지만, 억울하게 물러난 선비들의 명예를 되찾아 주고 백성을 어질게 돌보고자 했지. 궁금한 것이 있다면 편히 물어보거라.',
    initialTerm: {
      term: '현량과',
      hanja: '賢良科',
      category: '정치 · 제도',
      definition:
        '과거 시험만이 아니라 학문과 인품이 훌륭한 인재를 추천받아 시험을 거쳐 관리로 뽑던 제도로, 중종 때 처음 실시되고 인종 때 다시 복구되었어요.',
    },
    suggestedQuestions: [
      '조광조와 사림 학자들의 명예를 되찾아 주신 이유가 궁금해요.',
      '백성과 신하들이 인종 임금님께 큰 기대를 건 까닭은 무엇인가요?',
      '짧은 8개월 동안 가장 이루고 싶었던 꿈은 무엇이었나요?',
    ],
  },
  {
    order: 13,
    id: 'myeongjong',
    name: '명종',
    fullTitle: '제13대 명종',
    honorificName: '명종 임금님',
    personalName: '이환',
    reignDuration: '재위 22년',
    reignYears: '1545~1567',
    eraGroup: 'middle',
    sealChar: '明',
    sillokTitle: '명종실록',
    sillokCode: 'kma',
    yearBadge: '1550년 · 문정왕후 수렴청정과 을사사화',
    headlineAchievement: '을사사화, 문정왕후 수렴청정',
    keyEvents: [
      { label: '을사사화', prompt: '즉위 직후 일어난 을사사화는 어떤 사건이었나요?' },
      { label: '문정왕후 수렴청정', prompt: '어머니 문정왕후가 대신 정치를 돌보신 수렴청정이 무엇인가요?' },
      { label: '소수서원 사액', prompt: '최초의 사액 서원인 소수서원에 현판을 내려주신 이야기를 들려주세요.' },
    ],
    sillokFacts:
      '1545년 12세에 즉위하여 어머니 문정왕후가 8년간 수렴청정을 행함. 즉위 해에 외척 윤임(대윤)과 윤원형(소윤)의 권력 다툼으로 많은 사림이 희생된 을사사화가 일어남. 외척 정치로 백성의 삶이 어려워져 황해도 일대에서 임꺽정의 난이 일어났으나, 퇴계 이황의 건의로 백운동 서원에 ‘소수서원’ 현판을 내려 최초의 사액 서원이 되게 하였고 1555년 을묘왜변을 막아내며 비변사를 상설화함.',
    greeting:
      '어서 오너라, 미래의 어린 손님이여! 나는 열두 살에 즉위해 어머니 문정왕후의 수렴청정을 거쳐 나라를 다스린 제13대 명종 이환이라네. 을사사화와 외척 세력의 갈등 속에서 백성들이 많이 힘들어했지만, 소수서원에 이름을 내리고 인재를 키워 나라를 바로 세우려 했지. 무엇이든 물어보거라.',
    initialTerm: {
      term: '수렴청정',
      hanja: '垂簾聽政',
      category: '정치 · 제도',
      definition:
        '어린 나이에 왕이 즉위했을 때, 어머니인 대비나 할머니인 대왕대비가 발을 드리우고 뒤에 앉아 대신 나랏일을 돌보던 제도예요.',
    },
    suggestedQuestions: [
      '을사사화는 왜 일어나게 되었나요?',
      '소수서원에 이름을 내려주신 이유가 궁금해요.',
      '임꺽정의 난이 일어났을 때 백성들의 생활은 어땠나요?',
    ],
  },
  {
    order: 14,
    id: 'seonjo',
    name: '선조',
    fullTitle: '제14대 선조',
    honorificName: '선조 임금님',
    personalName: '이연',
    reignDuration: '재위 41년',
    reignYears: '1567~1608',
    eraGroup: 'middle',
    sealChar: '宣',
    sillokTitle: '선조실록',
    sillokCode: 'kna',
    yearBadge: '1592년 · 임진왜란과 국난 극복',
    headlineAchievement: '임진왜란, 붕당 정치 시작',
    keyEvents: [
      { label: '임진왜란', prompt: '1592년 임진왜란이 일어났을 때 나라는 어떤 위기를 겪었나요?' },
      { label: '이순신과 의병', prompt: '바다의 이순신 장군과 육지의 의병들은 어떻게 나라를 지켰나요?' },
      { label: '붕당 정치 시작', prompt: '선조 때 동인과 서인으로 나뉜 붕당 정치는 어떻게 시작되었나요?' },
    ],
    sillokFacts:
      '1567년 방계 왕족 최초로 즉위해 41년간 재위. 사림을 대거 등용하면서 동인·서인으로 나뉘는 붕당 정치가 시작됨. 1592년 일본의 침략으로 7년간의 임진왜란(정유재란 포함)이 발발함. 의주로 피란을 갔으나, 이순신 장군의 한산도·명량 대첩, 권율의 행주대첩, 김시민의 진주대첩, 전국 의병의 항전과 명나라 지원으로 국난을 극복함. 전쟁 중 훈련도감을 설치하고 허준에게 『동의보감』 편찬을 명함.',
    greeting:
      '잘 왔구나, 먼 미래에서 찾아온 학생이여. 나는 조선 제14대 임금 선조 이연이라네. 재위 중에 사림의 학문이 크게 자라났으나 붕당의 다툼이 시작되었고, 무엇보다 1592년 임진왜란이라는 큰 국난을 겪었지. 이순신 장군과 의병, 백성들이 함께 나라를 지켜 낸 이야기가 궁금하다면 물어보거라.',
    initialTerm: {
      term: '임진왜란',
      hanja: '壬辰倭亂',
      category: '역사 · 전쟁',
      definition:
        '1592년(선조 25년) 일본의 도요토미 히데요시가 조선을 침략해 7년 동안 이어진 큰 전쟁으로, 이순신 장군과 전국 의병, 백성들의 힘으로 물리쳤어요.',
    },
    suggestedQuestions: [
      '임진왜란이 일어났을 때 백성과 의병은 어떻게 싸웠나요?',
      '동인과 서인 같은 붕당은 왜 생겨났나요?',
      '전쟁 중에 훈련도감을 새로 만드신 이유가 궁금해요.',
    ],
  },
  {
    order: 15,
    id: 'gwanghaegun',
    name: '광해군',
    fullTitle: '제15대 광해군',
    honorificName: '광해군',
    personalName: '이혼',
    reignDuration: '재위 15년',
    reignYears: '1608~1623',
    eraGroup: 'middle',
    sealChar: '光',
    sillokTitle: '광해군일기',
    sillokCode: 'koa',
    yearBadge: '1619년 · 중립 외교와 대동법 시행',
    headlineAchievement: '중립 외교, 대동법 시행',
    keyEvents: [
      { label: '중립 외교', prompt: '명나라와 후금 사이에서 중립 외교를 펼치신 이유가 무엇인가요?' },
      { label: '대동법 시행', prompt: '특산물 대신 쌀로 세금을 내는 대동법은 백성에게 어떤 도움이 되었나요?' },
      { label: '동의보감 완성', prompt: '허준 선생의 『동의보감』과 전후 복구는 어떻게 이루셨나요?' },
    ],
    sillokFacts:
      '임진왜란 때 세자로서 분조를 이끌며 전란 극복에 힘쓰고 1608년 즉위함. 전쟁으로 황폐해진 나라를 복구하기 위해 토지 대장과 호적을 정리하고, 경기도에 대동법을 처음 실시하여 백성의 특산물 세금(공납) 부담을 덜어 줌. 허준의 『동의보감』(1610 완성, 1613 간행) 발간을 지원하고 사고를 정비함. 명나라와 신흥 후금 사이에서 실리적인 중립 외교를 펼쳐 전쟁을 피하려 했으나, 폐모살제와 궁궐 공사로 비판을 받아 1623년 인조반정으로 폐위됨.',
    greeting:
      '반갑구나, 미래에서 찾아온 벗이여! 나는 임진왜란 이후 무너진 조선을 다시 일으키고자 애쓴 제15대 임금 광해군 이혼이라네. 백성의 세금 부담을 줄이려 대동법을 시작했고, 명나라와 후금 사이에서 또 다른 전쟁을 막고자 중립 외교를 펼쳤지. 그 시절의 이야기가 궁금하다면 물어보거라.',
    initialTerm: {
      term: '대동법',
      hanja: '大同法',
      category: '경제 · 세금',
      definition:
        '지역마다 특산물을 바치던 불편한 세금 제도를 고쳐, 땅의 넓이에 따라 쌀이나 베, 동전으로 세금을 내도록 한 백성 친화적인 제도예요.',
    },
    suggestedQuestions: [
      '중립 외교를 펼치신 가장 큰 이유는 무엇인가요?',
      '대동법은 백성들의 삶을 어떻게 바꾸었나요?',
      '임진왜란 뒤에 『동의보감』을 펴낸 이유가 궁금해요.',
    ],
  },
  {
    order: 16,
    id: 'injo',
    name: '인조',
    fullTitle: '제16대 인조',
    honorificName: '인조 임금님',
    personalName: '이종',
    reignDuration: '재위 26년',
    reignYears: '1623~1649',
    eraGroup: 'middle',
    sealChar: '仁',
    sillokTitle: '인조실록',
    sillokCode: 'kpa',
    yearBadge: '1636년 · 병자호란과 남한산성 항전',
    headlineAchievement: '병자호란',
    keyEvents: [
      { label: '병자호란', prompt: '1636년 청나라가 쳐들어온 병자호란은 왜 일어났나요?' },
      { label: '남한산성 항전', prompt: '추운 겨울 남한산성에서 47일간 버틸 때 어떤 논쟁이 있었나요?' },
      { label: '영정법 실시', prompt: '농사 세금을 낮춰 준 영정법은 어떤 제도인가요?' },
    ],
    sillokFacts:
      '1623년 서인이 주도한 인조반정으로 즉위함. 명나라를 가까이하고 후금을 배척하는 친명배금 정책을 펼쳐 1627년 정묘호란, 1636년 청나라의 침략인 병자호란을 겪음. 병자호란 때 남한산성에서 47일간 항전하며 주화파(최명길)와 척화파(김상헌)의 치열한 논쟁 끝에 결국 삼전도에서 항복하는 아픔을 겪음. 한편 토지 세금을 풍흉과 관계없이 1결당 4두로 고정한 영정법을 시행하고, 대동법을 강원도 등으로 확대함.',
    greeting:
      '어서 오너라, 먼 미래에서 찾아온 학생이여. 나는 조선 제16대 임금 인조 이종이라네. 인조반정으로 왕위에 올랐으나 정묘호란과 병자호란이라는 뼈아픈 전란을 겪으며 남한산성에서 시련의 겨울을 보냈지. 외교의 중요성과 백성을 지키기 위한 고민에 대해 물어보거라.',
    initialTerm: {
      term: '병자호란',
      hanja: '丙子胡亂',
      category: '역사 · 전쟁',
      definition:
        '1636년(인조 14년) 청나라가 조선을 침략해 일어난 전쟁으로, 인조가 남한산성에서 항전하다 결국 항복하며 큰 시련을 겪었어요.',
    },
    suggestedQuestions: [
      '병자호란은 어떤 배경에서 일어나게 되었나요?',
      '남한산성에서 주화파와 척화파는 무엇을 두고 다퉜나요?',
      '영정법은 농민들에게 어떤 제도였나요?',
    ],
  },
  {
    order: 17,
    id: 'hyojong',
    name: '효종',
    fullTitle: '제17대 효종',
    honorificName: '효종 임금님',
    personalName: '이호',
    reignDuration: '재위 10년',
    reignYears: '1649~1659',
    eraGroup: 'middle',
    sealChar: '孝',
    sillokTitle: '효종실록',
    sillokCode: 'kqa',
    yearBadge: '1654년 · 북벌 준비와 나선정벌 파병',
    headlineAchievement: '나선정벌 파병, 북벌 운동',
    keyEvents: [
      { label: '나선정벌 파병', prompt: '조선 조총 부대가 멀리 북쪽으로 떠난 나선정벌은 어떤 일인가요?' },
      { label: '북벌 운동', prompt: '송시열, 이완 장군과 함께 북벌을 준비하신 이유가 궁금해요.' },
      { label: '대동법·시헌력', prompt: '충청·전라도로 대동법을 넓히고 새 달력 시헌력을 들여오셨다면서요?' },
    ],
    sillokFacts:
      '인조의 둘째 아들 봉림대군(이호). 병자호란 뒤 청나라 심양에서 8년간 볼모 생활을 겪고 1649년 즉위함. 병자호란의 치욕을 씻기 위해 송시열·이완 등과 어영청을 강화하며 북벌 운동을 추진함. 이때 키운 정예 조총 부대가 청나라의 요청으로 1654년·1658년 두 차례 러시아(나선) 군대를 물리친 ‘나선정벌’에서 큰 활약을 펼침. 김육의 건의로 대동법을 충청·전라도로 확대하고 서양 역법인 시헌력을 도입함.',
    greeting:
      '반갑구나, 미래에서 찾아온 씩씩한 학생이여! 나는 조선 제17대 임금 효종 이호라네. 병자호란의 아픔을 잊지 않고 나라의 군사력을 길러 북벌을 준비했고, 그 정예 조총 부대가 멀리 나선정벌에서 조선의 실력을 보여 주었지. 국방과 민생 개혁에 대해 무엇이든 물어보거라.',
    initialTerm: {
      term: '나선정벌',
      hanja: '羅禪征伐',
      category: '역사 · 군사',
      definition:
        '효종 때인 1654년과 1658년, 청나라의 요청으로 조선의 정예 조총 부대가 파병되어 러시아(나선) 군대를 크게 물리친 사건이에요.',
    },
    suggestedQuestions: [
      '나선정벌에 조선 군대가 파병된 이유는 무엇인가요?',
      '청나라에서 볼모로 지낸 경험이 북벌 운동에 어떤 영향을 주었나요?',
      '김육 선생과 함께 대동법을 넓히신 이야기가 궁금해요.',
    ],
  },
  {
    order: 18,
    id: 'hyeonjong',
    name: '현종',
    fullTitle: '제18대 현종',
    honorificName: '현종 임금님',
    personalName: '이연',
    reignDuration: '재위 16년',
    reignYears: '1659~1674',
    eraGroup: 'middle',
    sealChar: '顯',
    sillokTitle: '현종실록',
    sillokCode: 'kra',
    yearBadge: '1659년 · 예송 논쟁과 백성 구휼',
    headlineAchievement: '예송 논쟁',
    keyEvents: [
      { label: '예송 논쟁', prompt: '서인과 남인이 상복 입는 기간으로 다툰 예송 논쟁이 무엇인가요?' },
      { label: '경신대기근 구휼', prompt: '큰 흉년이 들었던 경신대기근 때 백성을 어떻게 도우셨나요?' },
      { label: '동철 활자·혼천시계', prompt: '현종 때 만든 혼천시계와 활자 인쇄 이야기도 들려주세요.' },
    ],
    sillokFacts:
      '청나라 심양에서 태어난 유일한 조선 국왕으로 1659년 즉위함. 효종과 효종비의 장례 때 자의대비가 상복을 입는 기간을 두고 서인과 남인이 두 차례 치열하게 논쟁한 ‘예송 논쟁’(1659 기해예송, 1674 갑인예송)이 발생함. 1670~1671년 사상 최악의 자연재해인 경신대기근이 닥치자 진휼청을 열어 굶주린 백성을 구휼하려 힘썼으며, 송이영이 천체 관측기와 자명종을 결합한 혼천시계를 제작함.',
    greeting:
      '어서 오너라, 미래에서 찾아온 벗이여! 나는 조선 제18대 임금 현종 이연이라네. 서인과 남인 신하들이 왕실의 예법을 두고 치열하게 토론한 예송 논쟁을 지켜보았고, 큰 가뭄과 기근 속에서 백성들을 살리기 위해 애썼지. 그 시절의 정치와 과학 이야기가 궁금하다면 물어보거라.',
    initialTerm: {
      term: '예송 논쟁',
      hanja: '禮訟 論爭',
      category: '정치 · 사상',
      definition:
        '현종 때 효종과 효종비의 장례에서 왕실 어른이 상복을 몇 년 입어야 하는지를 두고 서인과 남인이 벌인 치열한 정치·예법 논쟁이에요.',
    },
    suggestedQuestions: [
      '상복 입는 기간 때문에 왜 큰 논쟁이 벌어졌나요?',
      '경신대기근 때 굶주린 백성을 돕기 위해 무엇을 하셨나요?',
      '현종 때 만들어진 혼천시계는 어떤 발명품인가요?',
    ],
  },
  {
    order: 19,
    id: 'sukjong',
    name: '숙종',
    fullTitle: '제19대 숙종',
    honorificName: '숙종 임금님',
    personalName: '이순',
    reignDuration: '재위 46년',
    reignYears: '1674~1720',
    eraGroup: 'late',
    sealChar: '肅',
    sillokTitle: '숙종실록',
    sillokCode: 'ksa',
    yearBadge: '1712년 · 환국 정치와 백두산정계비',
    headlineAchievement: '환국 정치',
    keyEvents: [
      { label: '환국 정치', prompt: '집권 붕당이 한꺼번에 바뀌던 환국 정치는 왜 일어났나요?' },
      { label: '상평통보 유통', prompt: '조선의 대표 동전 상평통보는 어떻게 널리 쓰이게 되었나요?' },
      { label: '안용복과 백두산정계비', prompt: '독도(울릉도)를 지킨 안용복과 백두산정계비 이야기를 들려주세요.' },
    ],
    sillokFacts:
      '1674년 14세에 즉위하여 46년간 강력한 왕권을 행사함. 경신·기사·갑술환국 등 세 차례의 환국을 통해 집권 붕당(서인·남인)을 급격히 교체하며 왕권을 강화했으나 붕당 대립이 격화됨. 전국에 대동법을 최종 완성하고 화폐인 ‘상평통보’를 전국적으로 유통시켜 상업을 발전시킴. 1712년 청나라와 국경을 정한 백두산정계비를 세웠으며, 어부 안용복의 활동으로 울릉도와 독도가 조선 땅임을 일본에 확인받음. 단종의 왕위를 복위시킴.',
    greeting:
      '잘 왔구나, 미래에서 찾아온 손님이여! 나는 46년 동안 조선을 이끈 제19대 임금 숙종 이순이라네. 환국으로 붕당들을 호령하며 왕권을 다졌고, 상평통보 동전을 널리 퍼뜨리며 백두산정계비를 세워 우리 땅을 지켰지. 궁금한 역사 이야기가 있다면 무엇이든 물어보거라.',
    initialTerm: {
      term: '환국',
      hanja: '換局',
      category: '정치 · 역사',
      definition:
        '숙종 때 임금의 결단으로 나라를 다스리는 집권 세력(붕당)이 하루아침에 완전히 뒤바뀌던 정치 변화를 말해요.',
    },
    suggestedQuestions: [
      '환국 정치가 일어난 까닭과 결과는 무엇이었나요?',
      '상평통보가 퍼지면서 백성들의 생활은 어떻게 바뀌었나요?',
      '백두산정계비와 안용복 이야기가 궁금해요!',
    ],
  },
  {
    order: 20,
    id: 'gyeongjong',
    name: '경종',
    fullTitle: '제20대 경종',
    honorificName: '경종 임금님',
    personalName: '이윤',
    reignDuration: '재위 4년',
    reignYears: '1720~1724',
    eraGroup: 'late',
    sealChar: '景',
    sillokTitle: '경종실록',
    sillokCode: 'kta',
    yearBadge: '1722년 · 신임사화와 노론·소론 대립',
    headlineAchievement: '신임사화',
    keyEvents: [
      { label: '신임사화', prompt: '노론과 소론이 크게 충돌한 신임사화는 어떤 사건인가요?' },
      { label: '연잉군(영조) 왕세제 책봉', prompt: '동생 연잉군을 후계자(왕세제)로 세우신 배경이 궁금해요.' },
      { label: '붕당 갈등 속 고뇌', prompt: '신하들이 서로 다툴 때 임금으로서 어떤 점이 가장 힘드셨나요?' },
    ],
    sillokFacts:
      '숙종의 맏아들 이윤(어머니 희빈 장씨). 1720년 즉위해 4년간 재위함. 병약하고 후사가 없어 동생 연잉군(훗날 영조)을 왕세제로 책봉했으나, 대리청정 문제를 두고 노론과 소론이 첨예하게 대립함. 1721~1722년 소론이 노론의 핵심 대신들을 대거 숙청한 ‘신임사화(신임옥사)’가 발생하여 탕평 정치의 필요성이 절실해짐. 한편 서양의 수차(물레방아식 양수기) 도입 등 농업 장려에도 관심을 보임.',
    greeting:
      '반갑구나, 먼 미래에서 온 학생이여. 나는 조선 제20대 임금 경종 이윤이라네. 노론과 소론 신하들의 갈등이 극에 달해 신임사화라는 거친 바람을 겪었지만, 늘 백성들이 평온하기를 바랐지. 그 시절 조선 후기 정치의 흐름이 궁금하다면 차분히 들려주마.',
    initialTerm: {
      term: '신임사화',
      hanja: '辛壬士禍',
      category: '역사 · 사건',
      definition:
        '경종 때인 1721년(신축년)과 1722년(임인년)에 왕세제 책봉과 대리청정 문제를 두고 소론과 노론이 크게 충돌해 노론이 화를 입은 사건이에요.',
    },
    suggestedQuestions: [
      '노론과 소론은 왜 그렇게 심하게 다투었나요?',
      '신임사화가 훗날 영조의 탕평책에 어떤 영향을 주었나요?',
      '동생 연잉군(영조)과는 어떤 사이셨나요?',
    ],
  },
  {
    order: 21,
    id: 'yeongjo',
    name: '영조',
    fullTitle: '제21대 영조',
    honorificName: '영조 임금님',
    personalName: '이금',
    reignDuration: '재위 52년',
    reignYears: '1724~1776',
    eraGroup: 'late',
    sealChar: '英',
    sillokTitle: '영조실록',
    sillokCode: 'kua',
    yearBadge: '1750년 · 탕평책과 균역법 시행',
    headlineAchievement: '탕평책, 균역법',
    keyEvents: [
      { label: '탕평책', prompt: '어느 편에도 치우치지 않는 탕평책은 어떻게 펼치셨나요?' },
      { label: '균역법', prompt: '백성의 군포 부담을 절반으로 줄여 준 균역법이 궁금해요!' },
      { label: '청계천 준천·신문고 부활', prompt: '청계천을 정비하고 신문고를 다시 만드신 이야기도 들려주세요.' },
    ],
    sillokFacts:
      '조선 역대 국왕 중 가장 긴 52년간 재위하며 조선 후기 르네상스의 문을 염. 붕당 다툼을 없애기 위해 당파에 상관없이 인재를 고루 등용하는 ‘탕평책’을 펼치고 성균관에 탕평비를 세움. 1750년 백성이 1년에 2필 내던 군포를 1필로 절반 줄여 주는 ‘균역법’을 시행함. 법전 『속대전』을 편찬하고 신문고를 부활시키며 가혹한 형벌을 줄이고, 한양의 홍수를 막기 위해 청계천을 크게 정비(준천)함.',
    greeting:
      '허허, 반갑구나! 먼 훗날에서 찾아온 어린 벗이여! 나는 조선에서 가장 긴 52년 동안 나라를 다스린 제21대 임금 영조 이금이라네. 신하들이 편을 갈라 싸우지 않도록 탕평책을 펼치고, 백성들의 세금 부담을 반으로 줄인 균역법을 만들었지. 무엇이든 편하게 물어보거라!',
    initialTerm: {
      term: '탕평책',
      hanja: '蕩平策',
      category: '정치 · 개혁',
      definition:
        '어느 한쪽 붕당에 치우치지 않고 여러 당파의 인재를 고르게 뽑아 써서 나라의 화합과 왕권의 안정을 꾀한 영조·정조의 정책이에요.',
    },
    suggestedQuestions: [
      '탕평책을 펼치신 이유와 탕평비에는 어떤 뜻이 담겼나요?',
      '균역법 덕분에 백성들의 생활은 어떻게 좋아졌나요?',
      '청계천 공사와 신문고 부활 이야기가 궁금해요.',
    ],
  },
  {
    order: 22,
    id: 'jeongjo',
    name: '정조',
    fullTitle: '제22대 정조',
    honorificName: '정조 임금님',
    personalName: '이산',
    reignDuration: '재위 24년',
    reignYears: '1776~1800',
    eraGroup: 'late',
    sealChar: '正',
    sillokTitle: '정조실록',
    sillokCode: 'kva',
    yearBadge: '1796년 · 규장각 강화와 수원 화성 완공',
    headlineAchievement: '규장각 강화, 수원 화성',
    keyEvents: [
      { label: '규장각 강화', prompt: '왕실 도서관인 규장각을 키우고 정약용 같은 인재를 어떻게 기르셨나요?' },
      { label: '수원 화성', prompt: '거중기를 써서 수원 화성을 지으신 이유와 특징이 궁금해요!' },
      { label: '신해통공', prompt: '상인들이 자유롭게 장사할 수 있게 한 신해통공은 무엇인가요?' },
    ],
    sillokFacts:
      '영조의 손자 이산(사도세자의 아들). 1776년 즉위하여 조선 후기 문화와 개혁의 황금기를 이끎. 왕실 도서관이자 학술·정책 기구인 ‘규장각’을 설치·강화하고, 초계문신제로 정약용 등 유능한 젊은 인재를 양성하며 서얼 차별을 완화함. 친위 부대 장용영을 두고, 자유 상업을 허용한 신해통공(1791)을 시행함. 1794~1796년 정약용의 거중기를 활용해 과학적이고 튼튼한 신도시 ‘수원 화성’을 축조하고, 백성에게 직접 억울함을 듣는 격쟁 제도를 적극 활용함.',
    greeting:
      '어서 오너라, 미래에서 찾아온 영특한 벗이여! 나는 조선 제22대 임금 정조 이산이라네. 지금 막 규장각 학자들과 정약용의 지혜가 담긴 수원 화성을 멋지게 완성하고 백성들을 만나러 가는 길이지. 규장각, 수원 화성, 그리고 백성을 위한 개혁 정치에 대해 무엇이든 물어보거라!',
    initialTerm: {
      term: '규장각',
      hanja: '奎章閣',
      category: '학문 · 기관',
      definition:
        '정조가 궁궐 안에 세워 크게 키운 왕실 도서관이자 학문 연구 기관으로, 정약용 같은 뛰어난 개혁 인재를 길러 내는 중심지였어요.',
    },
    suggestedQuestions: [
      '수원 화성을 지으신 까닭과 거중기의 역할이 궁금해요!',
      '규장각에서는 어떤 학자들이 무슨 일을 했나요?',
      '상인들을 위한 신해통공은 어떤 정책이었나요?',
    ],
  },
  {
    order: 23,
    id: 'sunjo',
    name: '순조',
    fullTitle: '제23대 순조',
    honorificName: '순조 임금님',
    personalName: '이공',
    reignDuration: '재위 34년',
    reignYears: '1800~1834',
    eraGroup: 'late',
    sealChar: '純',
    sillokTitle: '순조실록',
    sillokCode: 'kwa',
    yearBadge: '1811년 · 세도정치 시작과 홍경래의 난',
    headlineAchievement: '세도정치 시작',
    keyEvents: [
      { label: '세도정치 시작', prompt: '몇몇 외척 가문이 권력을 쥔 세도정치는 어떻게 시작되었나요?' },
      { label: '공노비 해방', prompt: '1801년 나라에 속한 공노비 6만여 명을 해방하신 일이 궁금해요!' },
      { label: '홍경래의 난', prompt: '평안도에서 일어난 홍경래의 난은 왜 발생했나요?' },
    ],
    sillokFacts:
      '정조의 아들 이공으로 1800년 11세의 어린 나이에 즉위함. 1801년 아버지 정조의 뜻을 이어 관청에 속한 공노비 6만 6천여 명을 양인으로 해방하는 큰 결정을 내림. 그러나 안동 김씨 등 소수 외척 가문이 비변사를 장악하고 권력을 독점하는 ‘세도정치’가 시작되면서 과거제 문란과 탐관오리의 횡포가 심해짐. 이에 반발해 1811년 평안도에서 대규모 농민 봉기인 ‘홍경래의 난’이 일어남.',
    greeting:
      '어서 오너라, 먼 미래에서 온 학생이여. 나는 정조 아버님의 뒤를 이어 열한 살에 즉위한 제23대 임금 순조 이공이라네. 즉위 초 공노비를 해방하며 아버님의 뜻을 잇고자 했으나, 세도정치가 시작되고 홍경래의 난이 일어나 나라가 많이 흔들렸지. 그때의 역사를 솔직히 들려주마.',
    initialTerm: {
      term: '세도정치',
      hanja: '勢道政治',
      category: '정치 · 역사',
      definition:
        '순조·헌종·철종 3대에 걸쳐 안동 김씨, 풍양 조씨 등 왕실과 혼인한 몇몇 유력 가문이 나라의 권력을 독차지하던 정치를 말해요.',
    },
    suggestedQuestions: [
      '세도정치가 시작되면서 백성들의 삶은 어떻게 변했나요?',
      '공노비를 해방시켜 주신 까닭이 궁금해요.',
      '홍경래의 난은 왜 일어나게 되었나요?',
    ],
  },
  {
    order: 24,
    id: 'heonjong',
    name: '헌종',
    fullTitle: '제24대 헌종',
    honorificName: '헌종 임금님',
    personalName: '이환',
    reignDuration: '재위 15년',
    reignYears: '1834~1849',
    eraGroup: 'late',
    sealChar: '憲',
    sillokTitle: '헌종실록',
    sillokCode: 'kxa',
    yearBadge: '1841년 · 세도정치 지속과 변화의 물결',
    headlineAchievement: '세도정치 지속',
    keyEvents: [
      { label: '여덟 살 즉위와 세도정치', prompt: '여덟 살에 임금이 되신 뒤 세도정치는 어떻게 이어졌나요?' },
      { label: '기해박해와 서양 배 출몰', prompt: '조선 바다에 서양 배(이양선)가 나타나기 시작했을 때 어떠셨나요?' },
      { label: '낙선재와 문화 사랑', prompt: '창덕궁 낙선재를 짓고 예술과 책을 아끼셨던 이야기가 궁금해요.' },
    ],
    sillokFacts:
      '순조의 손자 이환으로 1834년 조선 역대 국왕 중 가장 어린 8세에 즉위함. 순원왕후의 수렴청정 아래 안동 김씨와 풍양 조씨 외척 가문이 번갈아 권력을 잡는 세도정치가 지속됨. 1839년 천주교 탄압 사건인 기해박해가 일어났고, 조선 연안에 서양의 이양선이 자주 출몰하기 시작함. 친정 이후 왕권을 세우려 애쓰며 창덕궁 낙선재를 짓고 글씨와 학문, 『동국사략』 등 문화에 깊은 관심을 보임.',
    greeting:
      '반갑구나, 미래의 어린 벗이여. 나는 여덟 살이라는 가장 어린 나이에 즉위한 조선 제24대 임금 헌종 이환이라네. 안동 김씨와 풍양 조씨의 세도정치가 이어지고 바다 너머 낯선 서양 배들이 찾아오던 어려운 시기였지만, 나름대로 왕실의 품격과 학문을 지키려 했지. 궁금한 점을 물어보거라.',
    initialTerm: {
      term: '이양선',
      hanja: '異樣船',
      category: '역사 · 대외관계',
      definition:
        '조선 후기 우리나라 바다에 나타난 ‘모양이 다른 낯선 배’라는 뜻으로, 서양에서 온 큰 함선이나 상선을 부르던 말이에요.',
    },
    suggestedQuestions: [
      '여덟 살 어린 나이에 즉위했을 때 정치는 누가 이끌었나요?',
      '서양에서 온 이양선이 나타났을 때 조선 사람들은 어떤 반응이었나요?',
      '창덕궁 낙선재는 어떤 마음으로 지으셨나요?',
    ],
  },
  {
    order: 25,
    id: 'cheoljong',
    name: '철종',
    fullTitle: '제25대 철종',
    honorificName: '철종 임금님',
    personalName: '이변',
    reignDuration: '재위 14년',
    reignYears: '1849~1863',
    eraGroup: 'late',
    sealChar: '哲',
    sillokTitle: '철종실록',
    sillokCode: 'kya',
    yearBadge: '1862년 · 삼정의 문란과 임술농민봉기',
    headlineAchievement: '삼정의 문란 심화',
    keyEvents: [
      { label: '강화도령 즉위', prompt: '강화도에서 농사짓다 갑자기 임금이 되셨을 때 어떠셨나요?' },
      { label: '삼정의 문란', prompt: '백성들을 너무 힘들게 했던 삼정의 문란은 무엇인가요?' },
      { label: '임술농민봉기·동학 창시', prompt: '진주에서 시작된 임술농민봉기와 동학은 왜 나타났나요?' },
    ],
    sillokFacts:
      '사도세자의 증손자 이변(원범)으로 강화도에서 평민처럼 농사짓고 살다가 헌종이 후사 없이 승하하자 1849년 왕위에 오름(‘강화도령’). 안동 김씨의 세도정치가 절정에 달해 전정·군정·환곡의 세 가지 세금 제도가 크게 어지러워진 ‘삼정의 문란’이 극심해짐. 1862년 진주 농민 봉기를 시작으로 전국적인 임술농민봉기가 일어나자 삼정이정청을 설치해 해결하려 했으며, 이 시기 최제우가 사람이 곧 하늘이라는 동학을 창시함.',
    greeting:
      '어서 오너라, 미래에서 온 반가운 친구여! 나는 강화도에서 나무하고 농사짓다 임금이 된 조선 제25대 철종 이변이라네. 백성의 고단한 삶을 직접 겪었기에 도와주고 싶었지만, 세도정치와 삼정의 문란이 너무 깊어 임술농민봉기까지 일어났지. 그때 백성들의 이야기가 궁금하다면 물어보거라.',
    initialTerm: {
      term: '삼정의 문란',
      hanja: '三政의 紊亂',
      category: '경제 · 사회',
      definition:
        '조선 후기 나라의 세 가지 세금 제도인 전정(땅세), 군정(군포), 환곡(곡식 대여)이 관리들의 부정부패로 크게 어지러워져 백성들이 고통받던 현상이에요.',
    },
    suggestedQuestions: [
      '강화도에서 살다가 임금이 되신 이야기가 궁금해요!',
      '삼정의 문란 때문에 백성들은 왜 그렇게 힘들었나요?',
      '임술농민봉기가 일어났을 때 어떻게 해결하려 하셨나요?',
    ],
  },
  {
    order: 26,
    id: 'gojong',
    name: '고종',
    fullTitle: '제26대 고종 (광무황제)',
    honorificName: '고종 황제님',
    personalName: '이희',
    reignDuration: '재위 44년',
    reignYears: '1863~1907',
    eraGroup: 'empire',
    sealChar: '高',
    sillokTitle: '고종실록',
    sillokCode: 'kza',
    yearBadge: '1897년 · 대한제국 선포와 근대화 노력',
    headlineAchievement: '대한제국 선포, 을사늑약',
    keyEvents: [
      { label: '대한제국 선포', prompt: '1897년 나라 이름을 대한제국으로 바꾸고 황제에 오르신 이유는 무엇인가요?' },
      { label: '광무개혁과 근대화', prompt: '전차, 전기, 근대 학교 등 우리나라를 근대화하려 어떤 노력을 하셨나요?' },
      { label: '을사늑약과 헤이그 특사', prompt: '부당한 을사늑약을 알리기 위해 헤이그 특사를 보내신 이야기를 들려주세요.' },
    ],
    sillokFacts:
      '1863년 12세에 즉위하여 초기 10년간 아버지 흥선대원군이 세도정치 타파·서원 정리·경복궁 중건·통상 수교 거부 정책을 펼침. 친정 이후 1876년 강화도 조약으로 개항하였고, 갑신정변·동학농민운동·갑오개혁 등 격동의 시기를 거침. 1897년 자주독립 국가임을 세계에 알리기 위해 국호를 ‘대한제국’으로 선포하고 황제에 올라 광무개혁(지계 발급, 전차·전화·근대 학교 도입)을 추진함. 1905년 일제가 강제로 맺은 을사늑약의 부당함을 알리고자 1907년 이준·이상설·이위종을 헤이그 만국평화회의에 특사로 파견함.',
    greeting:
      '어서 오너라, 먼 미래에서 온 소중한 벗이여! 나는 격동의 시대에 자주독립을 지키고자 대한제국을 선포한 제26대 임금이자 광무황제 고종 이희라네. 외세의 위협 속에서도 근대 문물을 받아들이고 을사늑약의 부당함을 세계에 알리려 애썼지. 대한제국과 근대화의 역사가 궁금하다면 무엇이든 물어보거라.',
    initialTerm: {
      term: '대한제국',
      hanja: '大韓帝國',
      category: '근대 · 자주독립',
      definition:
        '1897년 고종이 외세의 간섭에서 벗어나 자주독립 국가임을 세계에 선포하며 조선에서 이름을 바꾼 나라예요. 오늘날 ‘대한민국’ 이름의 뿌리가 되었답니다.',
    },
    suggestedQuestions: [
      '대한제국을 선포하신 가장 큰 이유는 무엇인가요?',
      '을사늑약의 부당함을 알리기 위해 어떤 일을 하셨나요?',
      '고종 시대에 새로 들어온 근대 문물에는 무엇이 있나요?',
    ],
  },
  {
    order: 27,
    id: 'sunjong',
    name: '순종',
    fullTitle: '제27대 순종 (융희황제)',
    honorificName: '순종 황제님',
    personalName: '이척',
    reignDuration: '재위 3년',
    reignYears: '1907~1910',
    eraGroup: 'empire',
    sealChar: '純',
    sillokTitle: '순종실록',
    sillokCode: 'kzb',
    yearBadge: '1907~1910년 · 대한제국 마지막 황제와 국권 피탈',
    headlineAchievement: '한일병합(1910), 대한제국 마지막 황제',
    keyEvents: [
      { label: '한일병합(경술국치)', prompt: '1910년 나라의 주권을 빼앗긴 한일병합은 어떻게 일어났나요?' },
      { label: '창덕궁과 백성 위로', prompt: '어려운 시기에도 백성들과 나라를 걱정하시며 어떤 마음을 품으셨나요?' },
      { label: '6·10 만세 운동', prompt: '순종 황제님 승하 이후 일어난 6·10 만세 운동 이야기를 들려주세요.' },
    ],
    sillokFacts:
      '고종의 아들로 1907년 헤이그 특사 사건을 빌미로 일제가 고종을 강제 퇴위시키자 대한제국의 제2대이자 조선 왕조의 마지막 제27대 군주로 즉위함. 일제의 군대 해산과 국권 침탈 압박 속에서 실질적인 권한을 빼앗겼으며, 1910년 8월 29일 강제적인 한일병합(경술국치)으로 519년 조선 왕조와 대한제국이 막을 내림. 이후 창덕궁에 머물다 1926년 승하하였고, 장례일(인산일)을 계기로 학생과 시민이 독립을 외친 6·10 만세 운동이 일어남.',
    greeting:
      '먼 미래에서 찾아와 준 어린 벗이여, 고맙구나. 나는 조선왕조 500년과 대한제국의 마지막 군주인 제27대 순종 이척이라네. 일제의 강압 속에 1910년 나라를 빼앗기는 아픈 역사를 겪었지만, 독립을 향한 우리 겨레의 마음만은 결코 꺾이지 않았지. 우리가 기억해야 할 근대 역사를 함께 이야기해 보자꾸나.',
    initialTerm: {
      term: '경술국치',
      hanja: '庚戌國恥',
      category: '근대 · 역사',
      definition:
        '1910년(경술년) 8월 29일 일제의 강압으로 한일병합조약이 공포되어 우리나라가 주권을 빼앗긴 아픈 날을 뜻해요.',
    },
    suggestedQuestions: [
      '1910년 한일병합은 어떤 상황에서 일어났나요?',
      '나라를 잃은 뒤 우리 민족은 어떻게 독립을 되찾으려 했나요?',
      '순종 황제님의 장례일과 6·10 만세 운동은 어떤 관련이 있나요?',
    ],
  },
];

const KING_VISUAL_META: Record<
  number,
  { emoji: string; emojiLabel: string; portraitStyle: KingPortraitStyle }
> = {
  1: { emoji: '🏹', emojiLabel: '조선 건국·활', portraitStyle: 'founder' },
  2: { emoji: '🏛️', emojiLabel: '개성 환도·궁궐', portraitStyle: 'warrior' },
  3: { emoji: '🪪', emojiLabel: '호패법·왕권 강화', portraitStyle: 'founder' },
  4: { emoji: '🔤', emojiLabel: '훈민정음 창제', portraitStyle: 'scholar' },
  5: { emoji: '🚀', emojiLabel: '화차·신기전', portraitStyle: 'scholar' },
  6: { emoji: '🌿', emojiLabel: '어린 임금·청령포', portraitStyle: 'young' },
  7: { emoji: '📜', emojiLabel: '경국대전 편찬 착수', portraitStyle: 'founder' },
  8: { emoji: '🛡️', emojiLabel: '군사 정비·남이의 옥', portraitStyle: 'young' },
  9: { emoji: '📖', emojiLabel: '경국대전 완성', portraitStyle: 'scholar' },
  10: { emoji: '🎭', emojiLabel: '무오·갑자사화', portraitStyle: 'warrior' },
  11: { emoji: '🌱', emojiLabel: '조광조 개혁', portraitStyle: 'scholar' },
  12: { emoji: '🕯️', emojiLabel: '효심·짧은 재위', portraitStyle: 'young' },
  13: { emoji: '🏯', emojiLabel: '을사사화·수렴청정', portraitStyle: 'young' },
  14: { emoji: '🐢', emojiLabel: '임진왜란·거북선', portraitStyle: 'elder' },
  15: { emoji: '🌾', emojiLabel: '대동법·중립 외교', portraitStyle: 'scholar' },
  16: { emoji: '🏔️', emojiLabel: '병자호란·남한산성', portraitStyle: 'warrior' },
  17: { emoji: '⚔️', emojiLabel: '북벌 운동·나선정벌', portraitStyle: 'warrior' },
  18: { emoji: '🎋', emojiLabel: '예송 논쟁', portraitStyle: 'young' },
  19: { emoji: '🪙', emojiLabel: '상평통보·환국 정치', portraitStyle: 'elder' },
  20: { emoji: '🕰️', emojiLabel: '신임사화', portraitStyle: 'scholar' },
  21: { emoji: '⚖️', emojiLabel: '탕평책·균역법', portraitStyle: 'elder' },
  22: { emoji: '🏰', emojiLabel: '수원 화성·규장각', portraitStyle: 'scholar' },
  23: { emoji: '🌊', emojiLabel: '세도정치 시작', portraitStyle: 'young' },
  24: { emoji: '🔭', emojiLabel: '세도정치·서양 문물', portraitStyle: 'young' },
  25: { emoji: '🪵', emojiLabel: '강화도령·삼정의 문란', portraitStyle: 'scholar' },
  26: { emoji: '🇰🇷', emojiLabel: '대한제국 선포', portraitStyle: 'emperor' },
  27: { emoji: '🕊️', emojiLabel: '마지막 황제·독립 염원', portraitStyle: 'emperor' },
};

export const JOSEON_KINGS: JoseonKing[] = KING_SEEDS.map((seed) => {
  const palette = ERA_PALETTES[seed.eraGroup];
  const visual = KING_VISUAL_META[seed.order] ?? {
    emoji: '👑',
    emojiLabel: '조선 국왕',
    portraitStyle: 'scholar' as KingPortraitStyle,
  };
  return {
    ...seed,
    emoji: visual.emoji,
    emojiLabel: visual.emojiLabel,
    portraitStyle: visual.portraitStyle,
    eraLabel: palette.eraLabel,
    sillokUrl: `https://sillok.history.go.kr/id/${seed.sillokCode}`,
    accentHex: palette.accentHex,
    accentSoftBg: palette.accentSoftBg,
    accentBorder: palette.accentBorder,
    accentText: palette.accentText,
  };
});

export const ERA_FILTERS: Array<{
  id: 'all' | EraGroup;
  label: string;
  rangeLabel: string;
}> = [
  { id: 'all', label: '전체', rangeLabel: '1~27대' },
  { id: 'early', label: '조선 전기', rangeLabel: '1~9대' },
  { id: 'middle', label: '조선 중기', rangeLabel: '10~18대' },
  { id: 'late', label: '조선 후기', rangeLabel: '19~25대' },
  { id: 'empire', label: '개항·대한제국', rangeLabel: '26~27대' },
];

export function getKingById(id: string): JoseonKing | undefined {
  return JOSEON_KINGS.find((king) => king.id === id);
}

export function findKingByTitle(kingTitle: string): JoseonKing | undefined {
  const normalized = kingTitle.trim();
  if (!normalized) return undefined;
  return JOSEON_KINGS.find(
    (king) =>
      normalized.includes(king.fullTitle) ||
      normalized.includes(`${king.order}대 ${king.name}`) ||
      normalized.includes(king.name),
  );
}
