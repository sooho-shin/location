"use client";

import React from "react";
import styled from "styled-components";

// 카테고리 데이터 (장소 카드 스타일)
const categories = [
  {
    id: "kpop",
    name: "케이팝 헌터스",
    icon: "🎤",
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&q=80",
    keyword: "K-pop 관련 명소, 아이돌 연습실, 엔터테인먼트 회사, 굿즈샵"
  },
  {
    id: "ramen",
    name: "한강라면",
    icon: "🍜",
    image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&q=80",
    keyword: "한강 공원 편의점, 라면 먹을 수 있는 곳, 한강 피크닉"
  },
];

interface BottomSheetProps {
  onCategorySelect?: (categoryId: string, keyword: string) => void;
}

const BottomSheet: React.FC<BottomSheetProps> = ({ onCategorySelect }) => {

  const handleCategoryClick = (category: typeof categories[0]) => {
    console.log("Category selected:", category.name);
    onCategorySelect?.(category.id, category.keyword);
  };

  return (
    <SheetContainer>
      <Handle />

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
                <CardLabel>{category.name}</CardLabel>
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

const CardLabel = styled.span`
  position: absolute;
  bottom: 12px;
  left: 12px;
  font-family: "Pretendard", -apple-system, sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
`;
