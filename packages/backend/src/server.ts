import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

interface Place {
  id?: string;
  placeId?: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  category: string;
  source?: "google_places" | "gemini";
  googleMapsUri?: string;
  rating?: number;
  userRatingCount?: number;
}

interface RecommendedCategory {
  id: string;
  title: string;
  subtitle: string;
  keyword: string;
  reason: string;
  image: string;
  themeColor: string;
  searchRadius: number;
  priority: number;
}

type AppLanguage = "ko" | "en" | "ja" | "zh" | "fr";

interface GooglePlace {
  id?: string;
  name?: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  location?: { latitude?: number; longitude?: number };
  googleMapsUri?: string;
  websiteUri?: string;
  nationalPhoneNumber?: string;
  internationalPhoneNumber?: string;
  businessStatus?: string;
  rating?: number;
  userRatingCount?: number;
  currentOpeningHours?: {
    openNow?: boolean;
    weekdayDescriptions?: string[];
  };
  photos?: Array<{
    name?: string;
    widthPx?: number;
    heightPx?: number;
  }>;
  reviews?: Array<{
    name?: string;
    rating?: number;
    relativePublishTimeDescription?: string;
    text?: { text?: string; languageCode?: string };
    authorAttribution?: {
      displayName?: string;
      uri?: string;
      photoUri?: string;
    };
  }>;
}

const app = express();
const PORT = Number(process.env.PORT) || 3001;
const RECOMMENDATION_LIMIT = 10;
const CATEGORY_RECOMMENDATION_LIMIT = 6;

const languageNames: Record<AppLanguage, string> = {
  ko: "Korean",
  en: "English",
  ja: "Japanese",
  zh: "Simplified Chinese",
  fr: "French",
};

const googlePlacesLanguageCodes: Record<AppLanguage, string> = {
  ko: "ko",
  en: "en",
  ja: "ja",
  zh: "zh-CN",
  fr: "fr",
};

const categoryPool: RecommendedCategory[] = [
  {
    id: "kpop",
    title: "케이팝 헌터스",
    subtitle: "K-pop 명소와 굿즈샵",
    keyword: "K-pop 관련 명소, 아이돌 연습실, 엔터테인먼트 회사, 굿즈샵",
    reason: "LOCATION의 기본 K-컬처 탐색 주제입니다.",
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&q=80",
    themeColor: "#FF4081",
    searchRadius: 3000,
    priority: 1,
  },
  {
    id: "ramen",
    title: "한강라면",
    subtitle: "한강 편의점과 피크닉",
    keyword: "한강 공원 편의점, 라면 먹을 수 있는 곳, 한강 피크닉",
    reason: "한국 여행에서 쉽게 경험할 수 있는 로컬 체험입니다.",
    image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&q=80",
    themeColor: "#FF9800",
    searchRadius: 3500,
    priority: 2,
  },
  {
    id: "cafe",
    title: "감성 카페",
    subtitle: "사진 찍기 좋은 카페",
    keyword: "감성 카페, 디저트 카페, 사진 찍기 좋은 카페",
    reason: "여행 중 쉬어가기 좋은 장소를 찾기 쉽습니다.",
    image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&q=80",
    themeColor: "#795548",
    searchRadius: 2000,
    priority: 3,
  },
  {
    id: "night-view",
    title: "야경 명소",
    subtitle: "저녁에 가기 좋은 뷰",
    keyword: "야경 명소, 전망대, 밤 산책 명소",
    reason: "저녁 시간대에 만족도가 높은 탐색 주제입니다.",
    image: "https://images.unsplash.com/photo-1538485399081-7191377e8241?w=600&q=80",
    themeColor: "#3F51B5",
    searchRadius: 4000,
    priority: 4,
  },
  {
    id: "market",
    title: "전통시장",
    subtitle: "길거리 음식과 로컬 분위기",
    keyword: "전통시장, 길거리 음식, 한국 시장",
    reason: "한국 로컬 분위기를 짧은 시간에 경험할 수 있습니다.",
    image: "https://images.unsplash.com/photo-1577401239170-897942555fb3?w=600&q=80",
    themeColor: "#E53935",
    searchRadius: 3000,
    priority: 5,
  },
  {
    id: "photo-spot",
    title: "사진 스팟",
    subtitle: "여행 사진 남기기 좋은 곳",
    keyword: "사진 명소, 포토스팟, 서울 관광 명소",
    reason: "관광객에게 직관적인 탐색 주제입니다.",
    image: "https://images.unsplash.com/photo-1548115184-bc6544d06a58?w=600&q=80",
    themeColor: "#00ACC1",
    searchRadius: 3500,
    priority: 6,
  },
  {
    id: "rainy-indoor",
    title: "실내 코스",
    subtitle: "날씨와 상관없는 장소",
    keyword: "실내 관광지, 복합문화공간, 쇼핑몰, 미술관",
    reason: "비나 추위가 있을 때 실패 가능성이 낮습니다.",
    image: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=600&q=80",
    themeColor: "#607D8B",
    searchRadius: 4000,
    priority: 7,
  },
  {
    id: "street-food",
    title: "한국 분식",
    subtitle: "떡볶이와 간단한 로컬 음식",
    keyword: "떡볶이, 김밥, 분식 맛집, 한국 길거리 음식",
    reason: "가볍게 한국 음식을 경험하기 좋습니다.",
    image: "https://images.unsplash.com/photo-1609501676725-7186f017a4b7?w=600&q=80",
    themeColor: "#F4511E",
    searchRadius: 2500,
    priority: 8,
  },
  {
    id: "shopping",
    title: "쇼핑 거리",
    subtitle: "굿즈와 편집숍 탐색",
    keyword: "쇼핑 거리, 편집샵, 기념품샵, 로컬 브랜드",
    reason: "관광객의 즉흥 탐색에 잘 맞습니다.",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&q=80",
    themeColor: "#8E24AA",
    searchRadius: 3500,
    priority: 9,
  },
  {
    id: "solo-meal",
    title: "혼밥 맛집",
    subtitle: "혼자 들어가기 편한 식당",
    keyword: "혼밥 맛집, 혼자 먹기 좋은 식당, 캐주얼 식당",
    reason: "혼자 여행하는 사용자에게 부담이 적습니다.",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80",
    themeColor: "#43A047",
    searchRadius: 2500,
    priority: 10,
  },
];

const categoryTranslations: Record<Exclude<AppLanguage, "ko">, Record<string, Partial<RecommendedCategory>>> = {
  en: {
    kpop: {
      title: "K-pop hunters",
      subtitle: "K-pop spots and merch shops",
      keyword: "K-pop landmarks, idol studios, entertainment companies, merchandise shops",
      reason: "A core K-culture theme for LOCATION.",
    },
    ramen: {
      title: "Han River ramen",
      subtitle: "Convenience stores and picnics",
      keyword: "Han River park convenience stores, places to eat ramen, Han River picnic",
      reason: "An easy local experience for Korea trips.",
    },
    cafe: {
      title: "Aesthetic cafes",
      subtitle: "Photogenic dessert cafes",
      keyword: "aesthetic cafes, dessert cafes, photogenic cafes",
    },
    "night-view": {
      title: "Night views",
      subtitle: "Evening viewpoints",
      keyword: "night view spots, observatories, evening walk spots",
    },
    market: {
      title: "Traditional markets",
      subtitle: "Street food and local mood",
      keyword: "traditional markets, street food, Korean markets",
    },
    "photo-spot": {
      title: "Photo spots",
      subtitle: "Places for travel photos",
      keyword: "photo spots, photogenic places, Seoul tourist attractions",
    },
    "rainy-indoor": {
      title: "Indoor courses",
      subtitle: "Weather-proof places",
      keyword: "indoor attractions, cultural complexes, shopping malls, museums",
    },
    "street-food": {
      title: "Korean snacks",
      subtitle: "Tteokbokki and casual food",
      keyword: "tteokbokki, gimbap, Korean snack restaurants, Korean street food",
    },
    shopping: {
      title: "Shopping streets",
      subtitle: "Merch and select shops",
      keyword: "shopping streets, select shops, souvenir shops, local brands",
    },
    "solo-meal": {
      title: "Solo dining",
      subtitle: "Easy restaurants for one",
      keyword: "solo dining restaurants, restaurants good for one person, casual restaurants",
    },
  },
  ja: {
    kpop: {
      title: "K-popハンターズ",
      subtitle: "K-popスポットとグッズ店",
      keyword: "K-pop名所, アイドル練習室, 芸能事務所, グッズショップ",
      reason: "LOCATIONの基本Kカルチャーテーマです。",
    },
    ramen: {
      title: "漢江ラーメン",
      subtitle: "漢江コンビニとピクニック",
      keyword: "漢江公園のコンビニ, ラーメンが食べられる場所, 漢江ピクニック",
      reason: "韓国旅行で気軽に楽しめるローカル体験です。",
    },
    cafe: {
      title: "感性カフェ",
      subtitle: "写真映えするカフェ",
      keyword: "感性カフェ, デザートカフェ, 写真映えするカフェ",
    },
    "night-view": {
      title: "夜景スポット",
      subtitle: "夜に行きたい眺め",
      keyword: "夜景スポット, 展望台, 夜の散歩スポット",
    },
    market: {
      title: "伝統市場",
      subtitle: "屋台グルメとローカル感",
      keyword: "伝統市場, 屋台グルメ, 韓国市場",
    },
    "photo-spot": {
      title: "写真スポット",
      subtitle: "旅の写真を残せる場所",
      keyword: "写真名所, フォトスポット, ソウル観光名所",
    },
    "rainy-indoor": {
      title: "屋内コース",
      subtitle: "天気に左右されない場所",
      keyword: "屋内観光地, 複合文化空間, ショッピングモール, 美術館",
    },
    "street-food": {
      title: "韓国粉食",
      subtitle: "トッポッキと軽食",
      keyword: "トッポッキ, キンパ, 粉食店, 韓国屋台グルメ",
    },
    shopping: {
      title: "ショッピング通り",
      subtitle: "グッズとセレクトショップ",
      keyword: "ショッピング通り, セレクトショップ, お土産店, ローカルブランド",
    },
    "solo-meal": {
      title: "一人ごはん",
      subtitle: "一人でも入りやすい店",
      keyword: "一人ごはん, 一人で食べやすい店, カジュアルレストラン",
    },
  },
  zh: {
    kpop: {
      title: "K-pop 探索",
      subtitle: "K-pop 景点和周边店",
      keyword: "K-pop 景点, 偶像练习室, 娱乐公司, 周边商品店",
      reason: "LOCATION 的基础 K-culture 主题。",
    },
    ramen: {
      title: "汉江拉面",
      subtitle: "汉江便利店和野餐",
      keyword: "汉江公园便利店, 可以吃拉面的地方, 汉江野餐",
      reason: "韩国旅行中容易体验的本地活动。",
    },
    cafe: { title: "氛围咖啡馆", subtitle: "适合拍照的咖啡馆", keyword: "氛围咖啡馆, 甜品咖啡馆, 适合拍照的咖啡馆" },
    "night-view": { title: "夜景名所", subtitle: "适合夜晚的景观", keyword: "夜景名所, 展望台, 夜间散步地点" },
    market: { title: "传统市场", subtitle: "街头美食和本地氛围", keyword: "传统市场, 街头美食, 韩国市场" },
    "photo-spot": { title: "拍照点", subtitle: "留下旅行照片的地方", keyword: "拍照名所, 打卡点, 首尔旅游景点" },
    "rainy-indoor": { title: "室内路线", subtitle: "不受天气影响", keyword: "室内景点, 复合文化空间, 购物中心, 美术馆" },
    "street-food": { title: "韩国小吃", subtitle: "辣炒年糕和简餐", keyword: "辣炒年糕, 紫菜包饭, 韩国小吃店, 韩国街头美食" },
    shopping: { title: "购物街", subtitle: "周边和买手店", keyword: "购物街, 买手店, 纪念品店, 本地品牌" },
    "solo-meal": { title: "一人食", subtitle: "适合一个人的餐厅", keyword: "一人食餐厅, 适合一个人吃饭的餐厅, 休闲餐厅" },
  },
  fr: {
    kpop: {
      title: "Chasse K-pop",
      subtitle: "Spots K-pop et boutiques",
      keyword: "lieux K-pop, studios d'idoles, agences de divertissement, boutiques de produits dérivés",
      reason: "Un thème K-culture de base pour LOCATION.",
    },
    ramen: {
      title: "Ramen du Han",
      subtitle: "Supérettes et pique-nique",
      keyword: "supérettes du parc du Han, lieux pour manger des ramen, pique-nique au Han",
      reason: "Une expérience locale facile pendant un voyage en Corée.",
    },
    cafe: { title: "Cafés esthétiques", subtitle: "Cafés photo et desserts", keyword: "cafés esthétiques, cafés desserts, cafés photogéniques" },
    "night-view": { title: "Vues de nuit", subtitle: "Points de vue du soir", keyword: "vues de nuit, observatoires, promenades du soir" },
    market: { title: "Marchés traditionnels", subtitle: "Street food et ambiance locale", keyword: "marchés traditionnels, street food, marchés coréens" },
    "photo-spot": { title: "Spots photo", subtitle: "Lieux pour photos de voyage", keyword: "spots photo, lieux photogéniques, attractions de Séoul" },
    "rainy-indoor": { title: "Parcours intérieur", subtitle: "Lieux à l'abri de la météo", keyword: "attractions intérieures, complexes culturels, centres commerciaux, musées" },
    "street-food": { title: "Snacks coréens", subtitle: "Tteokbokki et plats rapides", keyword: "tteokbokki, gimbap, snacks coréens, street food coréenne" },
    shopping: { title: "Rues shopping", subtitle: "Goodies et concept stores", keyword: "rues commerçantes, concept stores, boutiques souvenirs, marques locales" },
    "solo-meal": { title: "Repas en solo", subtitle: "Restaurants faciles seul", keyword: "restaurants solo, restaurants pour une personne, restaurants décontractés" },
  },
};

app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.post("/api/categories/recommend", async (req: Request, res: Response) => {
  try {
    const { latitude, longitude, localTime, language, userType, recentSelectedCategoryIds } = req.body;
    const lat = Number(latitude);
    const lng = Number(longitude);
    const normalizedLanguage = normalizeLanguage(language);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return res.status(400).json({ error: "위치 정보가 필요합니다." });
    }

    const context = {
      latitude: lat,
      longitude: lng,
      localTime: String(localTime || new Date().toISOString()),
      language: normalizedLanguage,
      userType: String(userType || "japanese-tourist"),
      recentSelectedCategoryIds: Array.isArray(recentSelectedCategoryIds)
        ? recentSelectedCategoryIds.map(String)
        : [],
    };

    const categoryResult = await recommendCategoriesWithGemini(context);

    res.json({
      categories: categoryResult.categories,
      source: categoryResult.source,
    });
  } catch (error) {
    console.warn("Category recommendation API fallback:", error);
    const fallbackLanguage = normalizeLanguage(req.body?.language);
    res.json({
      categories: getFallbackCategories(new Date().toISOString(), [], fallbackLanguage),
      source: "fallback",
    });
  }
});

app.post("/api/recommend", async (req: Request, res: Response) => {
  try {
    const { category, keyword, latitude, longitude, language } = req.body;
    const lat = Number(latitude);
    const lng = Number(longitude);
    const normalizedLanguage = normalizeLanguage(language);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return res.status(400).json({ error: "위치 정보가 필요합니다." });
    }

    const normalizedCategory = String(category || "추천 장소");
    const normalizedKeyword = String(keyword || normalizedCategory);

    console.log(`Recommendation request: ${normalizedCategory}`);

    const candidates = await fetchGooglePlaceCandidates({
      category: normalizedCategory,
      keyword: normalizedKeyword,
      latitude: lat,
      longitude: lng,
      language: normalizedLanguage,
    });

    const places = await recommendPlacesWithGemini({
      category: normalizedCategory,
      keyword: normalizedKeyword,
      latitude: lat,
      longitude: lng,
      candidates,
      language: normalizedLanguage,
    });

    console.log(`Recommended ${places.length} places`);
    res.json({
      places,
      source: candidates.length > 0 ? "google_places_gemini" : places.length > 0 ? "gemini" : "empty",
    });
  } catch (error) {
    console.error("Recommendation API error:", error);
    res.status(500).json({
      error: "장소 추천에 실패했습니다.",
      details: error instanceof Error ? error.message : "알 수 없는 오류",
    });
  }
});

app.get("/api/places/:placeId", async (req: Request, res: Response) => {
  try {
    const { placeId } = req.params;
    const language = normalizeLanguage(req.query.language);

    if (!placeId) {
      return res.status(400).json({ error: "placeId가 필요합니다." });
    }

    const detail = await fetchGooglePlaceDetail(placeId, language);
    res.json(detail);
  } catch (error) {
    console.error("Place detail API error:", error);
    res.status(500).json({
      error: "장소 상세 정보를 가져오지 못했습니다.",
      details: error instanceof Error ? error.message : "알 수 없는 오류",
    });
  }
});

app.get("/api/place-photo", async (req: Request, res: Response) => {
  try {
    const photoName = String(req.query.name || "");

    if (!photoName) {
      return res.status(400).json({ error: "photoName이 필요합니다." });
    }

    const photo = await fetchGooglePlacePhoto(photoName);

    res.setHeader("Content-Type", photo.contentType);
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.send(Buffer.from(photo.buffer));
  } catch (error) {
    console.error("Place photo API error:", error);
    res.status(500).json({
      error: "장소 사진을 가져오지 못했습니다.",
      details: error instanceof Error ? error.message : "알 수 없는 오류",
    });
  }
});

function startServer() {
  return app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`Gemini API key: ${process.env.GEMINI_API_KEY ? "configured" : "missing"}`);
    console.log(`Google Places API key: ${process.env.GOOGLE_PLACES_API_KEY ? "configured" : "missing"}`);
  });
}

if (require.main === module) {
  startServer();
}

async function fetchGooglePlaceCandidates(params: {
  category: string;
  keyword: string;
  latitude: number;
  longitude: number;
  language: AppLanguage;
}): Promise<Place[]> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) return [];

  const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": [
        "places.id",
        "places.name",
        "places.displayName",
        "places.formattedAddress",
        "places.location",
        "places.googleMapsUri",
        "places.rating",
        "places.userRatingCount",
      ].join(","),
    },
    body: JSON.stringify({
      textQuery: `${params.category} ${params.keyword}`,
      languageCode: googlePlacesLanguageCodes[params.language],
      regionCode: "KR",
      maxResultCount: RECOMMENDATION_LIMIT,
      locationBias: {
        circle: {
          center: {
            latitude: params.latitude,
            longitude: params.longitude,
          },
          radius: 2000,
        },
      },
    }),
  });

  if (!response.ok) {
    const message = await response.text();
    console.warn(`Google Places API failed: ${response.status} ${message}`);
    return [];
  }

  const data = (await response.json()) as { places?: GooglePlace[] };
  return (data.places || [])
    .map((place) => normalizeGooglePlace(place, params.category))
    .filter((place): place is Place => Boolean(place))
    .slice(0, RECOMMENDATION_LIMIT);
}

function normalizeGooglePlace(place: GooglePlace, category: string): Place | null {
  const name = place.displayName?.text;
  const latitude = place.location?.latitude;
  const longitude = place.location?.longitude;

  if (!name || !Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  return {
    id: place.name,
    placeId: place.id,
    name,
    description: trimDescription(place.formattedAddress || category),
    latitude: latitude as number,
    longitude: longitude as number,
    category,
    source: "google_places",
    googleMapsUri: place.googleMapsUri,
    rating: place.rating,
    userRatingCount: place.userRatingCount,
  };
}

async function fetchGooglePlaceDetail(placeId: string, language: AppLanguage): Promise<GooglePlace> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_PLACES_API_KEY가 설정되어 있지 않습니다.");
  }

  const resourceName = placeId.startsWith("places/") ? placeId : `places/${placeId}`;
  const response = await fetch(`https://places.googleapis.com/v1/${encodeURIComponent(resourceName).replace("%2F", "/")}?languageCode=${encodeURIComponent(googlePlacesLanguageCodes[language])}&regionCode=KR`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": [
        "id",
        "name",
        "displayName",
        "formattedAddress",
        "location",
        "googleMapsUri",
        "websiteUri",
        "nationalPhoneNumber",
        "internationalPhoneNumber",
        "businessStatus",
        "rating",
        "userRatingCount",
        "currentOpeningHours",
        "photos",
        "reviews",
      ].join(","),
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Google Place Details API failed: ${response.status} ${message}`);
  }

  return (await response.json()) as GooglePlace;
}

async function fetchGooglePlacePhoto(photoName: string): Promise<{ buffer: ArrayBuffer; contentType: string }> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_PLACES_API_KEY가 설정되어 있지 않습니다.");
  }

  const normalizedPhotoName = photoName.startsWith("places/")
    ? photoName
    : decodeURIComponent(photoName);

  if (!normalizedPhotoName.startsWith("places/") || !normalizedPhotoName.includes("/photos/")) {
    throw new Error("유효하지 않은 photoName입니다.");
  }

  const photoUrl = `https://places.googleapis.com/v1/${normalizedPhotoName}/media?maxWidthPx=1200&skipHttpRedirect=true`;
  const metadataResponse = await fetch(photoUrl, {
    method: "GET",
    headers: {
      "X-Goog-Api-Key": apiKey,
    },
  });

  if (!metadataResponse.ok) {
    const message = await metadataResponse.text();
    throw new Error(`Google Place Photo API failed: ${metadataResponse.status} ${message}`);
  }

  const metadata = (await metadataResponse.json()) as { photoUri?: string };
  if (!metadata.photoUri) {
    throw new Error("Google Place Photo 응답에 photoUri가 없습니다.");
  }

  const imageResponse = await fetch(metadata.photoUri);
  if (!imageResponse.ok) {
    const message = await imageResponse.text();
    throw new Error(`Google Place Photo download failed: ${imageResponse.status} ${message}`);
  }

  return {
    buffer: await imageResponse.arrayBuffer(),
    contentType: imageResponse.headers.get("content-type") || "image/jpeg",
  };
}

async function recommendPlacesWithGemini(params: {
  category: string;
  keyword: string;
  latitude: number;
  longitude: number;
  candidates: Place[];
  language: AppLanguage;
}): Promise<Place[]> {
  if (!process.env.GEMINI_API_KEY) {
    if (params.candidates.length > 0) return params.candidates;
    throw new Error("GEMINI_API_KEY가 설정되어 있지 않습니다.");
  }

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.2,
    },
  });

  const prompt = buildRecommendationPrompt(params);
  try {
    const result = await generateContentWithRetry(model, prompt);
    const text = result.response.text();
    const parsed = parsePlacesResponse(text);
    const merged = mergeWithCandidateMetadata(parsed, params.candidates, params.category, params.language);
    return (merged.length > 0 ? merged : params.candidates).slice(0, RECOMMENDATION_LIMIT);
  } catch (error) {
    if (params.candidates.length > 0) {
      console.warn("Gemini JSON parse failed. Returning Google Places candidates.", error);
      return params.candidates;
    }
    if (isTransientGeminiError(error)) {
      console.warn("Gemini is temporarily unavailable and no Google Places candidates were found.");
      return [];
    }
    throw error;
  }
}

function buildRecommendationPrompt(params: {
  category: string;
  keyword: string;
  latitude: number;
  longitude: number;
  candidates: Place[];
  language: AppLanguage;
}): string {
  const candidatesText = params.candidates.length > 0
    ? JSON.stringify(params.candidates, null, 2)
    : "[]";

  return `
당신은 서울의 로컬 여행 가이드입니다.
사용자의 현재 위치: 위도 ${params.latitude}, 경도 ${params.longitude}
카테고리: ${params.category}
키워드: ${params.keyword}
응답 언어: ${languageNames[params.language]}

아래 후보 장소가 있으면 반드시 후보 목록 안에서만 최대 ${RECOMMENDATION_LIMIT}개를 고르세요.
후보 장소가 비어 있으면 실제 존재하는 장소를 최대 ${RECOMMENDATION_LIMIT}개 추천하세요.

후보 장소:
${candidatesText}

반드시 아래 JSON 형식으로만 응답하세요.
{
  "places": [
    {
      "name": "장소 이름",
      "description": "short recommendation in ${languageNames[params.language]}",
      "latitude": 37.0000,
      "longitude": 126.0000,
      "category": "${params.category}"
    }
  ]
}

중요:
- 후보 장소가 있으면 name, latitude, longitude는 후보의 값을 그대로 사용하세요.
- description과 category는 반드시 ${languageNames[params.language]}로 작성하세요.
- JSON 외의 설명, 마크다운, 코드블록을 넣지 마세요.
`;
}

function parsePlacesResponse(text: string): Place[] {
  const jsonText = extractJsonObject(text);
  const parsed = JSON.parse(jsonText) as { places?: unknown };

  if (!Array.isArray(parsed.places)) {
    throw new Error("Gemini 응답에 places 배열이 없습니다.");
  }

  const places = parsed.places
    .map(coercePlace)
    .filter((place): place is Place => Boolean(place));

  if (places.length === 0) {
    throw new Error("Gemini 응답에서 유효한 장소를 찾지 못했습니다.");
  }

  return places;
}

function extractJsonObject(text: string): string {
  const trimmed = text
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();

  const firstBrace = trimmed.indexOf("{");
  if (firstBrace === -1) {
    throw new Error("JSON 시작 문자를 찾지 못했습니다.");
  }

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = firstBrace; index < trimmed.length; index += 1) {
    const char = trimmed[index];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (char === "\\") {
      escaped = true;
      continue;
    }

    if (char === "\"") {
      inString = !inString;
      continue;
    }

    if (inString) continue;

    if (char === "{") depth += 1;
    if (char === "}") depth -= 1;

    if (depth === 0) {
      return trimmed.slice(firstBrace, index + 1);
    }
  }

  throw new Error("완성된 JSON 객체를 찾지 못했습니다.");
}

function coercePlace(value: unknown): Place | null {
  if (!value || typeof value !== "object") return null;

  const place = value as Partial<Place>;
  const latitude = Number(place.latitude);
  const longitude = Number(place.longitude);

  if (!place.name || !Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  return {
    id: place.id,
    placeId: place.placeId,
    name: String(place.name),
    description: trimDescription(String(place.description || place.category || "추천 장소")),
    latitude,
    longitude,
    category: String(place.category || "추천 장소"),
    source: place.source,
    googleMapsUri: place.googleMapsUri,
    rating: place.rating,
    userRatingCount: place.userRatingCount,
  };
}

function mergeWithCandidateMetadata(places: Place[], candidates: Place[], category: string, language: AppLanguage): Place[] {
  if (candidates.length === 0) {
    return places.map((place) => ({ ...place, category, source: "gemini" }));
  }

  const candidateByName = new Map(candidates.map((candidate) => [candidate.name, candidate]));
  return places
    .map((place) => {
      const candidate = candidateByName.get(place.name);
      if (!candidate) return null;

      return {
        ...candidate,
        description: trimDescription(place.description || candidate.description),
        category: trimDescription(place.category || category),
      };
    })
    .filter((place): place is Place => Boolean(place));
}

function trimDescription(description: string): string {
  return description.length > 20 ? `${description.slice(0, 20)}...` : description;
}

function normalizeLanguage(language: unknown): AppLanguage {
  const value = String(language || "ko").toLowerCase();

  if (value === "en" || value === "us") return "en";
  if (value === "ja" || value === "jp") return "ja";
  if (value === "zh" || value === "cn" || value === "zh-cn") return "zh";
  if (value === "fr") return "fr";
  return "ko";
}

function getLocalizedCategoryPool(language: AppLanguage): RecommendedCategory[] {
  if (language === "ko") return categoryPool;

  const translations = categoryTranslations[language];
  return categoryPool.map((category) => ({
    ...category,
    ...translations[category.id],
  }));
}

async function recommendCategoriesWithGemini(params: {
  latitude: number;
  longitude: number;
  localTime: string;
  language: AppLanguage;
  userType: string;
  recentSelectedCategoryIds: string[];
}): Promise<{ categories: RecommendedCategory[]; source: "gemini" | "fallback" }> {
  const fallback = getFallbackCategories(params.localTime, params.recentSelectedCategoryIds, params.language);

  if (!process.env.GEMINI_API_KEY) {
    return { categories: fallback, source: "fallback" };
  }

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.4,
    },
  });

  try {
    const result = await generateContentWithRetry(model, buildCategoryRecommendationPrompt(params));
    const text = result.response.text();
    const selected = parseCategoryResponse(text, params.language);
    return selected.length > 0
      ? { categories: selected, source: "gemini" }
      : { categories: fallback, source: "fallback" };
  } catch (error) {
    console.warn("Gemini category recommendation failed. Returning fallback categories.", error);
    return { categories: fallback, source: "fallback" };
  }
}

function buildCategoryRecommendationPrompt(params: {
  latitude: number;
  longitude: number;
  localTime: string;
  language: AppLanguage;
  userType: string;
  recentSelectedCategoryIds: string[];
}): string {
  const localizedPool = getLocalizedCategoryPool(params.language);

  return `
당신은 한국 여행자를 위한 지도 기반 장소 탐색 큐레이터입니다.
사용자 위치: 위도 ${params.latitude}, 경도 ${params.longitude}
현지 시간: ${params.localTime}
응답 언어: ${languageNames[params.language]}
사용자 유형: ${params.userType}
최근 선택한 카테고리 ID: ${JSON.stringify(params.recentSelectedCategoryIds)}

아래 후보 카테고리 풀에서 지금 누르기 좋은 카테고리 ${CATEGORY_RECOMMENDATION_LIMIT}개를 고르세요.
후보 풀에 없는 id는 절대 만들지 마세요.

후보 카테고리:
${JSON.stringify(localizedPool, null, 2)}

반드시 아래 JSON 형식으로만 응답하세요.
{
  "categories": [
    {
      "id": "candidate-id",
      "subtitle": "18자 이내 보조 설명",
      "reason": "추천 이유 35자 이내",
      "priority": 1
    }
  ]
}

중요:
- id는 후보 카테고리의 id를 그대로 사용하세요.
- title, keyword, image, themeColor, searchRadius는 후보 값을 유지합니다.
- subtitle과 reason은 ${languageNames[params.language]}로 짧게 다듬어도 됩니다.
- 현재 시간대와 여행자 맥락을 반영하세요.
- JSON 외의 설명, 마크다운, 코드블록을 넣지 마세요.
`;
}

function parseCategoryResponse(text: string, language: AppLanguage): RecommendedCategory[] {
  const jsonText = extractJsonObject(text);
  const parsed = JSON.parse(jsonText) as { categories?: unknown };

  if (!Array.isArray(parsed.categories)) {
    throw new Error("Gemini 응답에 categories 배열이 없습니다.");
  }

  const poolById = new Map(getLocalizedCategoryPool(language).map((category) => [category.id, category]));
  const seen = new Set<string>();

  return parsed.categories
    .map((value, index) => {
      if (!value || typeof value !== "object") return null;

      const item = value as Partial<RecommendedCategory>;
      const id = String(item.id || "");
      const candidate = poolById.get(id);

      if (!candidate || seen.has(id)) return null;
      seen.add(id);

      return {
        ...candidate,
        subtitle: trimCategoryText(String(item.subtitle || candidate.subtitle), 24),
        reason: trimCategoryText(String(item.reason || candidate.reason), 45),
        priority: Number.isFinite(Number(item.priority)) ? Number(item.priority) : index + 1,
      };
    })
    .filter((category): category is RecommendedCategory => Boolean(category))
    .sort((a, b) => a.priority - b.priority)
    .slice(0, CATEGORY_RECOMMENDATION_LIMIT);
}

function getFallbackCategories(localTime: string, recentSelectedCategoryIds: string[], language: AppLanguage): RecommendedCategory[] {
  const hour = getHour(localTime);
  const recent = new Set(recentSelectedCategoryIds);
  const localizedPool = getLocalizedCategoryPool(language);

  const preferredIds = hour >= 18 || hour <= 5
    ? ["night-view", "kpop", "street-food", "cafe", "shopping", "ramen"]
    : hour >= 11 && hour <= 14
      ? ["street-food", "solo-meal", "cafe", "market", "photo-spot", "kpop"]
      : ["kpop", "ramen", "cafe", "photo-spot", "market", "shopping"];

  const preferred = preferredIds
    .map((id) => localizedPool.find((category) => category.id === id))
    .filter((category): category is RecommendedCategory => Boolean(category));

  const categories = [
    ...preferred.filter((category) => !recent.has(category.id)),
    ...preferred.filter((category) => recent.has(category.id)),
    ...localizedPool.filter((category) => !preferredIds.includes(category.id)),
  ];

  return categories
    .slice(0, CATEGORY_RECOMMENDATION_LIMIT)
    .map((category, index) => ({ ...category, priority: index + 1 }));
}

export { app, startServer, trimDescription };

function getHour(localTime: string): number {
  const date = new Date(localTime);
  if (Number.isNaN(date.getTime())) return new Date().getHours();
  return date.getHours();
}

function trimCategoryText(text: string, maxLength: number): string {
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
}

async function generateContentWithRetry(
  model: ReturnType<GoogleGenerativeAI["getGenerativeModel"]>,
  prompt: string
) {
  const maxAttempts = 2;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await model.generateContent(prompt);
    } catch (error) {
      if (!isTransientGeminiError(error) || attempt === maxAttempts) {
        throw error;
      }

      await sleep(600 * attempt);
    }
  }

  throw new Error("Gemini 요청에 실패했습니다.");
}

function isTransientGeminiError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;

  const status = (error as { status?: unknown }).status;
  const message = error instanceof Error ? error.message : "";

  return status === 429 || status === 500 || status === 502 || status === 503 || status === 504 || message.includes("503 Service Unavailable");
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
