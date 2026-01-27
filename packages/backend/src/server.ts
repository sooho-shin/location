import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Gemini AI 초기화
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 장소 추천 API
app.post('/api/recommend', async (req: Request, res: Response) => {
  try {
    const { category, keyword, latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: '위치 정보가 필요합니다.' });
    }

    console.log(`📍 추천 요청: ${category} at (${latitude}, ${longitude})`);

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `
당신은 서울의 로컬 여행 가이드입니다.
사용자의 현재 위치: 위도 ${latitude}, 경도 ${longitude}

카테고리: ${category}
키워드: ${keyword}

위 위치에서 반경 2km 이내에 있는 "${category}" 관련 명소 10곳을 추천해주세요.
관련 장소가 없다면, 해당 테마와 관련있는 인기 명소를 추천해주세요.

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
- 정확히 10개의 장소를 추천하세요
- JSON 형식만 반환하세요
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('🤖 Gemini 응답:', text.substring(0, 200));

    // JSON 파싱 시도
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('JSON 형식을 파싱할 수 없습니다.');
    }

    const placesData = JSON.parse(jsonMatch[0]);
    console.log(`✅ ${placesData.places?.length || 0}개 장소 추천 완료`);

    res.json(placesData);
  } catch (error) {
    console.error('❌ Gemini API 오류:', error);
    res.status(500).json({
      error: '장소 추천에 실패했습니다.',
      details: error instanceof Error ? error.message : '알 수 없는 오류'
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/health`);
  console.log(`   API Key: ${process.env.GEMINI_API_KEY ? '설정됨 ✅' : '미설정 ❌'}`);
});
