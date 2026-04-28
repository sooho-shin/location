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

app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.post("/api/recommend", async (req: Request, res: Response) => {
  try {
    const { category, keyword, latitude, longitude } = req.body;
    const lat = Number(latitude);
    const lng = Number(longitude);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return res.status(400).json({ error: "위치 정보가 필요합니다." });
    }

    const normalizedCategory = String(category || "추천 장소");
    const normalizedKeyword = String(keyword || normalizedCategory);

    console.log(`Recommendation request: ${normalizedCategory} at (${lat}, ${lng})`);

    const candidates = await fetchGooglePlaceCandidates({
      category: normalizedCategory,
      keyword: normalizedKeyword,
      latitude: lat,
      longitude: lng,
    });

    const places = await recommendPlacesWithGemini({
      category: normalizedCategory,
      keyword: normalizedKeyword,
      latitude: lat,
      longitude: lng,
      candidates,
    });

    console.log(`Recommended ${places.length} places`);
    res.json({
      places,
      source: candidates.length > 0 ? "google_places_gemini" : "gemini",
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

    if (!placeId) {
      return res.status(400).json({ error: "placeId가 필요합니다." });
    }

    const detail = await fetchGooglePlaceDetail(placeId);
    res.json(detail);
  } catch (error) {
    console.error("Place detail API error:", error);
    res.status(500).json({
      error: "장소 상세 정보를 가져오지 못했습니다.",
      details: error instanceof Error ? error.message : "알 수 없는 오류",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Gemini API key: ${process.env.GEMINI_API_KEY ? "configured" : "missing"}`);
  console.log(`Google Places API key: ${process.env.GOOGLE_PLACES_API_KEY ? "configured" : "missing"}`);
});

async function fetchGooglePlaceCandidates(params: {
  category: string;
  keyword: string;
  latitude: number;
  longitude: number;
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
      languageCode: "ko",
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

async function fetchGooglePlaceDetail(placeId: string): Promise<GooglePlace> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_PLACES_API_KEY가 설정되어 있지 않습니다.");
  }

  const resourceName = placeId.startsWith("places/") ? placeId : `places/${placeId}`;
  const response = await fetch(`https://places.googleapis.com/v1/${encodeURIComponent(resourceName).replace("%2F", "/")}?languageCode=ko&regionCode=KR`, {
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

async function recommendPlacesWithGemini(params: {
  category: string;
  keyword: string;
  latitude: number;
  longitude: number;
  candidates: Place[];
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
  const result = await model.generateContent(prompt);
  const text = result.response.text();

  try {
    const parsed = parsePlacesResponse(text);
    const merged = mergeWithCandidateMetadata(parsed, params.candidates, params.category);
    return (merged.length > 0 ? merged : params.candidates).slice(0, RECOMMENDATION_LIMIT);
  } catch (error) {
    if (params.candidates.length > 0) {
      console.warn("Gemini JSON parse failed. Returning Google Places candidates.", error);
      return params.candidates;
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
}): string {
  const candidatesText = params.candidates.length > 0
    ? JSON.stringify(params.candidates, null, 2)
    : "[]";

  return `
당신은 서울의 로컬 여행 가이드입니다.
사용자의 현재 위치: 위도 ${params.latitude}, 경도 ${params.longitude}
카테고리: ${params.category}
키워드: ${params.keyword}

아래 후보 장소가 있으면 반드시 후보 목록 안에서만 최대 ${RECOMMENDATION_LIMIT}개를 고르세요.
후보 장소가 비어 있으면 실제 존재하는 장소를 최대 ${RECOMMENDATION_LIMIT}개 추천하세요.

후보 장소:
${candidatesText}

반드시 아래 JSON 형식으로만 응답하세요.
{
  "places": [
    {
      "name": "장소 이름",
      "description": "20자 이내 추천 설명",
      "latitude": 37.0000,
      "longitude": 126.0000,
      "category": "${params.category}"
    }
  ]
}

중요:
- 후보 장소가 있으면 name, latitude, longitude는 후보의 값을 그대로 사용하세요.
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

function mergeWithCandidateMetadata(places: Place[], candidates: Place[], category: string): Place[] {
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
        category,
      };
    })
    .filter((place): place is Place => Boolean(place));
}

function trimDescription(description: string): string {
  return description.length > 20 ? `${description.slice(0, 20)}...` : description;
}
