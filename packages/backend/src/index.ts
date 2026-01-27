import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Gemini AI 초기화
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// 장소 추천 API
app.post("/api/recommend", async (req, res) => {
    try {
        const { category, keyword, latitude, longitude } = req.body;

        if (!latitude || !longitude) {
            return res.status(400).json({ error: "위치 정보가 필요합니다." });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `
당신은 서울의 로컬 여행 가이드입니다.
사용자의 현재 위치: 위도 ${latitude}, 경도 ${longitude}

카테고리: ${category}
키워드: ${keyword}

위 위치에서 반경 2km 이내에 있는 "${category}" 관련 명소 10곳을 추천해주세요.

반드시 아래 JSON 형식으로만 응답하세요 (다른 텍스트 없이):
{
  "places": [
    {
      "name": "장소 이름",
      "description": "간단한 설명 (20자 이내)",
      "latitude": 37.xxxx,
      "longitude": 126.xxxx,
      "category": "${category}"
    }
  ]
}

중요:
- 실제 존재하는 장소만 추천하세요
- 위도/경도는 실제 좌표를 사용하세요
- 반경 2km 이내 장소만 포함하세요
- JSON 형식만 반환하세요
`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // JSON 파싱 시도
        let jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error("JSON 형식을 파싱할 수 없습니다.");
        }

        const placesData = JSON.parse(jsonMatch[0]);

        res.json(placesData);
    } catch (error) {
        console.error("Gemini API 오류:", error);
        res.status(500).json({
            error: "장소 추천에 실패했습니다.",
            details: error instanceof Error ? error.message : "알 수 없는 오류"
        });
    }
});

// 헬스 체크
app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

app.listen(PORT, () => {
    console.log(`🚀 Backend server running on http://localhost:${PORT}`);
});
