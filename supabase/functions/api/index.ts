import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const now = () => new Date().toISOString();

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const openAiKey = Deno.env.get("OPENAI_API_KEY") || "";

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

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

const majorKoNames = [
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
];

const majorKeywords = [
  "시작",
  "의지",
  "직감",
  "풍요",
  "통제",
  "전통",
  "관계",
  "전진",
  "용기",
  "성찰",
  "전환",
  "균형",
  "멈춤",
  "변화",
  "조율",
  "집착",
  "붕괴",
  "희망",
  "불안",
  "활력",
  "각성",
  "완성",
];

const minorSuits = [
  ["Wands", "불/의지"],
  ["Cups", "물/감정"],
  ["Swords", "바람/판단"],
  ["Pentacles", "흙/현실"],
];
const minorRanks = ["Ace", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Page", "Knight", "Queen", "King"];
const minorKeywords = ["씨앗", "균형", "확장", "안정", "갈등", "회복", "선택", "노력", "절정", "완료", "소식", "움직임", "성숙", "통솔"];

const tarotDeck = [
  ...majorArcana.map((name, index) => ({
    id: index + 1,
    name,
    koName: majorKoNames[index],
    group: "Major Arcana",
    keyword: majorKeywords[index],
  })),
  ...minorSuits.flatMap(([suit, element], suitIndex) =>
    minorRanks.map((rank, rankIndex) => ({
      id: 23 + suitIndex * minorRanks.length + rankIndex,
      name: `${rank} of ${suit}`,
      koName: `${element} ${rank}`,
      group: suit,
      keyword: minorKeywords[rankIndex],
    })),
  ),
];

function getCardByNumber(number: unknown) {
  const normalized = Number(number);
  if (!Number.isInteger(normalized) || normalized < 1 || normalized > 78) return null;
  return tarotDeck[normalized - 1];
}

function buildMockAnalysis(input: { name?: string; birthDate: string; birthTime?: string; gender?: string }) {
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
    detail: "이 결과는 Supabase Edge Function에서 생성한 테스트용 풀이입니다.",
    disclaimer: "사주 풀이는 엔터테인먼트 및 참고용이며 중요한 의사결정의 유일한 근거로 사용하지 않습니다.",
    createdAt: now(),
  };
}

async function getAuthUser(request: Request) {
  const header = request.headers.get("authorization") || "";
  const token = header.replace(/^Bearer\s+/i, "");
  if (!token) return null;
  if (token === "local-test-token") return { id: "local-test-user", email: "local@saju.test", nickname: "로컬 사용자" };

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return null;
  return {
    id: data.user.id,
    email: data.user.email || "",
    nickname: data.user.user_metadata?.name || data.user.email || "사용자",
  };
}

async function createInterpretation(card: ReturnType<typeof getCardByNumber>, question: string, topic: string) {
  const fallback = {
    summary: `${card?.koName} 카드는 ${card?.keyword}의 흐름을 보여줍니다.`,
    detail: `지금의 질문은 "${question || "오늘의 흐름"}"에 초점이 있습니다. ${card?.keyword}을 중심으로 오늘 할 수 있는 작은 행동부터 확인하는 것이 좋습니다.`,
    advice: "오늘은 한 번에 큰 결정을 내리기보다 선택지를 좁히고, 마음이 덜 흔들리는 방향을 고르세요.",
    caution: "운세와 타로 해석은 참고용이며 중요한 의사결정의 유일한 근거로 사용하지 마세요.",
    provider: "mock",
  };

  if (!openAiKey) return fallback;

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openAiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: Deno.env.get("OPENAI_MODEL") || "gpt-4.1-mini",
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
            card,
            outputShape: { summary: "string", detail: "string", advice: "string", caution: "string" },
          }),
        },
      ],
      text: { format: { type: "json_object" } },
    }),
  });

  if (!response.ok) return fallback;
  const data = await response.json();
  const outputText = data.output_text || "";
  try {
    return { ...fallback, ...JSON.parse(outputText), provider: "openai" };
  } catch {
    return { ...fallback, detail: outputText || fallback.detail, provider: "openai" };
  }
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const url = new URL(request.url);
    const path = url.pathname.replace(/^\/functions\/v1\/api/, "").replace(/^\/api/, "") || "/";

    if (request.method === "GET" && path === "/health") {
      return json({ status: "ok", service: "saju-edge-api", mode: "supabase-edge", timestamp: now() });
    }

    if (request.method === "GET" && path === "/config") {
      return json({ authProvider: "supabase", socialProviders: ["kakao"], storage: "supabase-bucket", aiProvider: "openai" });
    }

    if (request.method === "GET" && path === "/catalog") {
      return json({ categories, services });
    }

    if (request.method === "GET" && path === "/tarot/deck") {
      return json({ count: tarotDeck.length, numbers: tarotDeck.map((card) => card.id) });
    }

    if (request.method === "POST" && path === "/tarot/draw") {
      const body = await request.json().catch(() => ({}));
      const card = getCardByNumber(body.number);
      if (!card) return json({ message: "1부터 78 사이의 숫자로 카드를 선택하세요." }, 400);
      return json({ card, canPreview: true, analysisRequiresLogin: true });
    }

    if (request.method === "POST" && path === "/analysis") {
      const body = await request.json().catch(() => ({}));
      if (!body.birthDate) return json({ message: "생년월일은 필수입니다." }, 400);
      const analysis = buildMockAnalysis({ name: body.name, birthDate: body.birthDate, birthTime: body.birthTime, gender: body.gender || "미선택" });
      await supabase.from("analyses").insert({
        id: analysis.id,
        user_id: analysis.userId,
        input: analysis.input,
        summary: analysis.summary,
        highlights: analysis.highlights,
        detail: analysis.detail,
        disclaimer: analysis.disclaimer,
      });
      return json({ analysis }, 201);
    }

    if (request.method === "GET" && path === "/analysis/history") {
      const { data } = await supabase.from("analyses").select("*").order("created_at", { ascending: false }).limit(10);
      return json({
        analyses: (data || []).map((analysis) => ({
          id: analysis.id,
          userId: analysis.user_id,
          input: analysis.input,
          summary: analysis.summary,
          highlights: analysis.highlights,
          detail: analysis.detail,
          disclaimer: analysis.disclaimer,
          createdAt: analysis.created_at,
        })),
      });
    }

    if (request.method === "POST" && path === "/auth/mock-login") {
      const body = await request.json().catch(() => ({}));
      const email = body.email || "local@saju.test";
      const nickname = body.nickname || "로컬 사용자";
      await supabase.from("users").upsert({
        id: "local-test-user",
        name: nickname,
        email,
        password: "local-test-token",
        role: "user",
        bio: "",
        is_active: true,
        updated_at: now(),
      });
      return json({
        session: { accessToken: "local-test-token", provider: body.provider || "email", expiresAt: new Date(Date.now() + 1000 * 60 * 60).toISOString() },
        user: { id: "local-test-user", email, nickname, avatarUrl: null, createdAt: now() },
      });
    }

    if (request.method === "POST" && path === "/tarot/interpret") {
      const user = await getAuthUser(request);
      if (!user) return json({ message: "로그인한 회원만 결과 분석을 볼 수 있습니다." }, 401);

      const body = await request.json().catch(() => ({}));
      const card = getCardByNumber(body.number);
      if (!card) return json({ message: "선택한 타로카드를 찾을 수 없습니다." }, 400);

      const interpretation = await createInterpretation(card, body.question || "", body.topic || "오늘의 운세");
      const reading = {
        id: `tarot-${Date.now()}`,
        type: "tarot",
        userId: user.id,
        question: body.question || "",
        topic: body.topic || "오늘의 운세",
        card,
        interpretation,
        createdAt: now(),
      };
      await supabase.from("readings").insert({
        id: reading.id,
        type: reading.type,
        user_id: reading.userId,
        question: reading.question,
        topic: reading.topic,
        card: reading.card,
        interpretation: reading.interpretation,
      });
      return json({ reading }, 201);
    }

    if (request.method === "GET" && path === "/readings") {
      const user = await getAuthUser(request);
      if (!user) return json({ message: "로그인한 회원만 결과 분석을 볼 수 있습니다." }, 401);
      const { data } = await supabase.from("readings").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      return json({
        readings: (data || []).map((reading) => ({
          id: reading.id,
          type: reading.type,
          userId: reading.user_id,
          question: reading.question,
          topic: reading.topic,
          card: reading.card,
          interpretation: reading.interpretation,
          createdAt: reading.created_at,
        })),
      });
    }

    return json({ message: "API route not found", path }, 404);
  } catch (error) {
    console.error(error);
    return json({ message: error instanceof Error ? error.message : "서버 오류가 발생했습니다." }, 500);
  }
});
