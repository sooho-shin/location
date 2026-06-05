"use client";

import React from "react";
import styled from "styled-components";
import { API_BASE_URL } from "../lib/config";

export interface RecommendedCategory {
  id: string;
  title: string;
  subtitle: string;
  keyword: string;
  reason?: string;
  image: string;
  themeColor?: string;
  searchRadius?: number;
  priority?: number;
}

// API가 실패해도 첫 화면 탐색이 끊기지 않도록 유지하는 기본 카테고리
const fallbackCategories: RecommendedCategory[] = [
  {
    id: "kpop",
    title: "케이팝 헌터스",
    subtitle: "K-pop 명소와 굿즈샵",
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&q=80",
    keyword: "K-pop 관련 명소, 아이돌 연습실, 엔터테인먼트 회사, 굿즈샵",
    themeColor: "#FF4081",
  },
  {
    id: "ramen",
    title: "한강라면",
    subtitle: "한강 편의점과 피크닉",
    image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&q=80",
    keyword: "한강 공원 편의점, 라면 먹을 수 있는 곳, 한강 피크닉",
    themeColor: "#FF9800",
  },
];

const KOREA_TIME_ZONE_OFFSET_MINUTES = 9 * 60;

const padDatePart = (value: number): string => String(value).padStart(2, "0");

const getKoreaLocalIsoString = (date = new Date()): string => {
  const koreaTime = new Date(date.getTime() + KOREA_TIME_ZONE_OFFSET_MINUTES * 60 * 1000);

  return [
    `${koreaTime.getUTCFullYear()}-${padDatePart(koreaTime.getUTCMonth() + 1)}-${padDatePart(koreaTime.getUTCDate())}`,
    `${padDatePart(koreaTime.getUTCHours())}:${padDatePart(koreaTime.getUTCMinutes())}:${padDatePart(koreaTime.getUTCSeconds())}+09:00`,
  ].join("T");
};

interface BottomSheetProps {
  userLocation?: { lat: number; lng: number } | null;
  onCategorySelect?: (categoryId: string, keyword: string, title: string) => void;
}

const BottomSheet: React.FC<BottomSheetProps> = ({ userLocation, onCategorySelect }) => {
  const [categories, setCategories] = React.useState<RecommendedCategory[]>(fallbackCategories);
  const [loading, setLoading] = React.useState(false);
  const recentSelectedRef = React.useRef<string[]>([]);

  React.useEffect(() => {
    if (!userLocation) return;

    const controller = new AbortController();
    setLoading(true);

    fetch(`${API_BASE_URL}/api/categories/recommend`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      body: JSON.stringify({
        latitude: userLocation.lat,
        longitude: userLocation.lng,
        localTime: getKoreaLocalIsoString(),
        language: "ko",
        userType: "japanese-tourist",
        recentSelectedCategoryIds: recentSelectedRef.current,
      }),
      })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`추천 카테고리 요청 실패 (${response.status})`);
        }

        const data = await response.json();
        if (Array.isArray(data.categories) && data.categories.length > 0) {
          setCategories(data.categories);
        }
      })
      .catch((error) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        console.error("추천 카테고리 오류:", error);
        setCategories(fallbackCategories);
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [userLocation]);

  const handleCategoryClick = (category: RecommendedCategory) => {
    recentSelectedRef.current = [
      category.id,
      ...recentSelectedRef.current.filter((id) => id !== category.id),
    ].slice(0, 4);
    console.log("Category selected:", category.title);
    onCategorySelect?.(category.id, category.keyword, category.title);
  };

  return (
    <SheetContainer>
      <Handle />
      <SheetHeader>
        <SheetTitle>지금 가볼 만한 주제</SheetTitle>
        {loading && <SheetStatus>추천 중...</SheetStatus>}
      </SheetHeader>

      {/* 카테고리 카드 - 가로 스크롤 */}
      <ScrollContainer>
        <CardsRow>
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              onClick={() => handleCategoryClick(category)}
            >
              <CardImage $image={category.image}>
                <CardOverlay />
                <CardText>
                  <CardLabel>{category.title}</CardLabel>
                  <CardSubtitle>{category.subtitle}</CardSubtitle>
                </CardText>
              </CardImage>
            </CategoryCard>
          ))}
        </CardsRow>
      </ScrollContainer>
    </SheetContainer>
  );
};

export default BottomSheet;

const SheetContainer = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #ffffff;
  border-radius: 24px 24px 0 0;
  padding: 12px 0 32px;
  z-index: 90;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
`;

const Handle = styled.div`
  width: 40px;
  height: 4px;
  background: #e0e0e0;
  border-radius: 2px;
  margin: 0 auto 16px;
`;

const SheetHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px 12px;
`;

const SheetTitle = styled.h2`
  margin: 0;
  font-family: "Pretendard", -apple-system, sans-serif;
  font-size: 15px;
  font-weight: 700;
  color: #1f1f1f;
`;

const SheetStatus = styled.span`
  font-family: "Pretendard", -apple-system, sans-serif;
  font-size: 12px;
  font-weight: 600;
  color: #777777;
`;

const ScrollContainer = styled.div`
  overflow-x: auto;
  padding: 0 16px;
  
  &::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;
`;

const CardsRow = styled.div`
  display: flex;
  gap: 12px;
`;

const CategoryCard = styled.button`
  flex-shrink: 0;
  width: 200px;
  height: 120px;
  border: none;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  padding: 0;
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
  }
  
  &:active {
    transform: scale(0.98);
  }
`;

const CardImage = styled.div<{ $image: string }>`
  position: relative;
  width: 100%;
  height: 100%;
  background-image: url(${props => props.$image});
  background-size: cover;
  background-position: center;
`;

const CardOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.7) 100%);
`;

const CardText = styled.div`
  position: absolute;
  bottom: 12px;
  left: 12px;
  right: 12px;
`;

const CardLabel = styled.span`
  display: block;
  font-family: "Pretendard", -apple-system, sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
`;

const CardSubtitle = styled.span`
  display: block;
  margin-top: 3px;
  font-family: "Pretendard", -apple-system, sans-serif;
  font-size: 11px;
  font-weight: 500;
  line-height: 1.3;
  color: rgba(255, 255, 255, 0.86);
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;
