import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.resolve(__dirname, "..", "data");
const readingsPath = path.join(dataDir, "readings.json");

app.use(cors({ origin: process.env.FRONTEND_ORIGIN || "http://localhost:3000" }));
app.use(express.json({ limit: "2mb" }));

const now = () => new Date().toISOString();
const hasOpenAiKey = Boolean(process.env.OPENAI_API_KEY);

const categories = [
  { id: "all", label: "전체" },
  { id: "saju", label: "사주" },
  { id: "tarot", label: "타로" },
];

const services = [
  {
    id: "daily-saju",
    category: "saju",
    title: "정통 사주",
    subtitle: "하루의 기운과 선택 포인트",
    summary: "생년월일과 태어난 시간을 바탕으로 오늘의 흐름을 간단히 읽습니다.",
    imageKey: "daily",
    priceType: "saju",
  },
  {
    id: "daily-tarot",
    category: "tarot",
    title: "오늘의 타로",
    subtitle: "지금 필요한 카드 한 장",
    summary: "가볍게 질문을 정하고 오늘의 선택 방향을 타로 카드로 확인합니다.",
    imageKey: "tarot",
    priceType: "tarot",
  },
];

const sampleAnalyses = [];

const majorArcana = [
  "The Fool",
  "The Magician",
  "The High Priestess",
  "The Empress",
  "The Emperor",
  "The Hierophant",
  "The Lovers",
  "The Chariot",
  "Strength",
  "The Hermit",
  "Wheel of Fortune",
  "Justice",
  "The Hanged Man",
  "Death",
  "Temperance",
  "The Devil",
  "The Tower",
  "The Star",
  "The Moon",
  "The Sun",
  "Judgement",
  "The World",
];

const minorSuits = [
  ["Wands", "불/의지"],
  ["Cups", "물/감정"],
  ["Swords", "바람/판단"],
  ["Pentacles", "흙/현실"],
];
const minorRanks = ["Ace", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Page", "Knight", "Queen", "King"];

const tarotDeck = [
  ...majorArcana.map((name, index) => ({
    id: index + 1,
    name,
    koName: [
      "바보",
      "마법사",
      "여사제",
      "여황제",
      "황제",
      "교황",
      "연인",
      "전차",
      "힘",
      "은둔자",
      "운명의 수레바퀴",
      "정의",
      "매달린 사람",
      "죽음",
      "절제",
      "악마",
      "탑",
      "별",
      "달",
      "태양",
      "심판",
      "세계",
    ][index],
    group: "Major Arcana",
    keyword: ["시작", "의지", "직감", "풍요", "통제", "전통", "관계", "전진", "용기", "성찰", "전환", "균형", "멈춤", "변화", "조율", "집착", "붕괴", "희망", "불안", "활력", "각성", "완성"][index],
  })),
  ...minorSuits.flatMap(([suit, element], suitIndex) =>
    minorRanks.map((rank, rankIndex) => ({
      id: 23 + suitIndex * minorRanks.length + rankIndex,
      name: `${rank} of ${suit}`,
      koName: `${element} ${rank}`,
      group: suit,
      keyword: ["씨앗", "균형", "확장", "안정", "갈등", "회복", "선택", "노력", "절정", "완료", "소식", "움직임", "성숙", "통솔"][rankIndex],
    })),
  ),
];

async function readReadings() {
  try {
    const content = await fs.readFile(readingsPath, "utf8");
    return JSON.parse(content);
  } catch {
    return [];
  }
}

async function saveReading(reading) {
  await fs.mkdir(dataDir, { recursive: true });
  const readings = await readReadings();
  readings.unshift(reading);
  await fs.writeFile(readingsPath, JSON.stringify(readings.slice(0, 100), null, 2));
}

function getAuthUser(req) {
  const header = req.get("authorization") || "";
  const token = header.replace(/^Bearer\s+/i, "");
  if (!token) return null;
  if (token === "local-test-token") {
    return { id: "local-test-user", email: "local@saju.test", nickname: "로컬 사용자" };
  }
  return null;
}

function requireAuth(req, res, next) {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ message: "로그인한 회원만 결과 분석을 볼 수 있습니다." });
  }
  req.user = user;
  next();
}

function getCardByNumber(number) {
  const normalized = Number(number);
  if (!Number.isInteger(normalized) || normalized < 1 || normalized > 78) return null;
  return tarotDeck[normalized - 1];
}

async function createOpenAiInterpretation({ question, card, topic }) {
  const fallback = {
    summary: `${card.koName} 카드는 ${card.keyword}의 흐름을 보여줍니다.`,
    detail: `지금의 질문은 "${question || "오늘의 흐름"}"에 초점이 있습니다. ${card.keyword}을 중심으로 성급하게 결론 내리기보다, 오늘 할 수 있는 작은 행동부터 확인하는 것이 좋습니다.`,
    advice: "오늘은 한 번에 큰 결정을 내리기보다 선택지를 좁히고, 마음이 덜 흔들리는 방향을 고르세요.",
    caution: "운세와 타로 해석은 참고용이며 중요한 의사결정의 유일한 근거로 사용하지 마세요.",
  };

  if (!hasOpenAiKey) return { ...fallback, provider: "mock" };

  const { default: OpenAI } = await import("openai");
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const response = await client.responses.create({
    model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
    input: [
      {
        role: "system",
        content:
          "너는 한국어 운세 앱의 타로 해석가다. 답변은 엔터테인먼트/참고용임을 분명히 하고, 과도한 단정이나 공포 조장을 피한다. JSON만 출력한다.",
      },
      {
        role: "user",
        content: JSON.stringify({
          topic,
          question,
          card: { number: card.id, name: card.name, koName: card.koName, group: card.group, keyword: card.keyword },
          outputShape: { summary: "string", detail: "string", advice: "string", caution: "string" },
        }),
      },
    ],
    text: { format: { type: "json_object" } },
  });

  try {
    const parsed = JSON.parse(response.output_text);
    return { ...fallback, ...parsed, provider: "openai" };
  } catch {
    return { ...fallback, detail: response.output_text || fallback.detail, provider: "openai" };
  }
}

function buildMockAnalysis(input) {
  const name = input.name?.trim() || "사용자";
  const hour = input.birthTime ? Number(input.birthTime.split(":")[0]) : 12;
  const element = hour < 6 ? "수(水)" : hour < 12 ? "목(木)" : hour < 18 ? "화(火)" : "금(金)";

  return {
    id: `analysis-${Date.now()}`,
    userId: "local-test-user",
    input,
    summary: `${name}님의 오늘 흐름은 ${element}의 기운이 강하게 작용하는 형태입니다.`,
    highlights: [
      { label: "핵심 기운", value: element },
      { label: "좋은 선택", value: "일을 작게 나누고 먼저 연락하기" },
      { label: "주의", value: "감정적인 답장은 잠시 미루기" },
    ],
    detail:
      "이 결과는 로컬 테스트용 목업입니다. 최종 구현에서는 Node 테스트 API 또는 Supabase Edge Function에서 OpenAI API를 호출하고, 결과를 Supabase DB에 저장하도록 전환합니다.",
    disclaimer: "사주 풀이는 엔터테인먼트 및 참고용이며 중요한 의사결정의 유일한 근거로 사용하지 않습니다.",
    createdAt: now(),
  };
}

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "saju-test-api",
    mode: "local-node",
    supabaseTarget: true,
    timestamp: now(),
  });
});

app.get("/api/config", (req, res) => {
  res.json({
    authProvider: "supabase",
    socialProviders: ["kakao"],
    storage: "supabase-bucket",
    aiProvider: "openai",
    localNodeOnly: true,
  });
});

app.get("/api/catalog", (req, res) => {
  res.json({ categories, services });
});

app.get("/api/tarot/deck", (req, res) => {
  res.json({
    count: tarotDeck.length,
    numbers: tarotDeck.map((card) => card.id),
  });
});

app.post("/api/tarot/draw", (req, res) => {
  const card = getCardByNumber(req.body?.number);
  if (!card) return res.status(400).json({ message: "1부터 78 사이의 숫자로 카드를 선택하세요." });
  res.json({
    card,
    canPreview: true,
    analysisRequiresLogin: true,
  });
});

app.post("/api/tarot/interpret", requireAuth, async (req, res, next) => {
  try {
    const card = getCardByNumber(req.body?.number);
    if (!card) return res.status(400).json({ message: "선택한 타로카드를 찾을 수 없습니다." });

    const interpretation = await createOpenAiInterpretation({
      question: req.body?.question || "",
      topic: req.body?.topic || "오늘의 운세",
      card,
    });

    const reading = {
      id: `tarot-${Date.now()}`,
      type: "tarot",
      userId: req.user.id,
      question: req.body?.question || "",
      topic: req.body?.topic || "오늘의 운세",
      card,
      interpretation,
      createdAt: now(),
    };
    await saveReading(reading);
    res.status(201).json({ reading });
  } catch (error) {
    next(error);
  }
});

app.post("/api/auth/mock-login", (req, res) => {
  const email = req.body?.email || "local@saju.test";
  res.json({
    session: {
      accessToken: "local-test-token",
      provider: req.body?.provider || "email",
      expiresAt: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
    },
    user: {
      id: "local-test-user",
      email,
      nickname: req.body?.nickname || "로컬 사용자",
      avatarUrl: null,
      createdAt: now(),
    },
  });
});

app.post("/api/analysis", (req, res) => {
  const { name, birthDate, birthTime } = req.body || {};

  if (!birthDate) {
    return res.status(400).json({ message: "생년월일은 필수입니다." });
  }

  const analysis = buildMockAnalysis({ name, birthDate, birthTime, gender: req.body.gender || "미선택" });
  sampleAnalyses.unshift(analysis);
  res.status(201).json({ analysis });
});

app.get("/api/analysis/history", (req, res) => {
  res.json({ analyses: sampleAnalyses.slice(0, 10) });
});

app.get("/api/readings", requireAuth, async (req, res, next) => {
  try {
    const readings = await readReadings();
    res.json({ readings: readings.filter((reading) => reading.userId === req.user.id) });
  } catch (error) {
    next(error);
  }
});

app.use((req, res) => {
  res.status(404).json({ message: "API route not found", path: req.path });
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(error.status || 500).json({ message: error.message || "서버 오류가 발생했습니다." });
});

export default app;
