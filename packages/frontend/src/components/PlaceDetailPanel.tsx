"use client";

import React from "react";
import styled, { keyframes } from "styled-components";
import { Place } from "./MapComponent";

interface PlaceDetailPanelProps {
    place: Place | null;
    onClose: () => void;
    categoryId?: string;
}

// 카테고리별 테마 색상
const categoryThemes: Record<string, { primary: string; light: string }> = {
    kpop: { primary: "#FF4081", light: "#FCE4EC" },
    ramen: { primary: "#FF9800", light: "#FFF3E0" },
    default: { primary: "#9C27B0", light: "#F3E5F5" },
};

// 카테고리별 이미지
const categoryImages: Record<string, string> = {
    kpop: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80",
    ramen: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&q=80",
    default: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80",
};

const PlaceDetailPanel: React.FC<PlaceDetailPanelProps> = ({
    place,
    onClose,
    categoryId = "default",
}) => {
    if (!place) return null;

    const theme = categoryThemes[categoryId] || categoryThemes.default;
    const image = categoryImages[categoryId] || categoryImages.default;

    const handleNavigation = () => {
        // 카카오맵 길찾기 열기
        const url = `https://map.kakao.com/link/to/${place.name},${place.latitude},${place.longitude}`;
        window.open(url, "_blank");
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: place.name,
                text: place.description,
                url: window.location.href,
            });
        } else {
            navigator.clipboard.writeText(`${place.name} - ${place.description}`);
            alert("클립보드에 복사되었습니다!");
        }
    };

    return (
        <PanelOverlay onClick={onClose}>
            <PanelContainer onClick={(e) => e.stopPropagation()}>
                {/* 상단 이미지 영역 */}
                <ImageSection $image={image}>
                    <ImageOverlay />
                    <CloseButton onClick={onClose}>
                        <CloseIcon>✕</CloseIcon>
                    </CloseButton>
                    <StreetViewBadge>
                        <span>📍 거리뷰</span>
                    </StreetViewBadge>
                </ImageSection>

                {/* 장소 정보 헤더 */}
                <InfoHeader>
                    <PlaceName>{place.name}</PlaceName>
                    <PlaceCategory $color={theme.primary}>{place.description}</PlaceCategory>
                    <ReviewInfo>
                        <Stars>★★★★★</Stars>
                        <ReviewCount>방문자 리뷰 12</ReviewCount>
                    </ReviewInfo>
                </InfoHeader>

                {/* 액션 버튼 */}
                <ActionButtons>
                    <ActionButton $variant="outline" $color={theme.primary}>
                        출발
                    </ActionButton>
                    <ActionButton $variant="filled" $color={theme.primary} onClick={handleNavigation}>
                        도착
                    </ActionButton>
                </ActionButtons>

                {/* 퀵 액션 */}
                <QuickActions>
                    <QuickAction>
                        <QuickIcon>☆</QuickIcon>
                        <QuickLabel>저장</QuickLabel>
                    </QuickAction>
                    <QuickAction>
                        <QuickIcon>📍</QuickIcon>
                        <QuickLabel>거리뷰</QuickLabel>
                    </QuickAction>
                    <QuickAction onClick={handleShare}>
                        <QuickIcon>↗</QuickIcon>
                        <QuickLabel>공유</QuickLabel>
                    </QuickAction>
                </QuickActions>

                {/* 탭 메뉴 */}
                <TabMenu>
                    <Tab $active>홈</Tab>
                    <Tab>리뷰</Tab>
                    <Tab>정보</Tab>
                </TabMenu>

                {/* 상세 정보 */}
                <DetailSection>
                    <DetailItem>
                        <DetailIcon>📍</DetailIcon>
                        <DetailText>
                            서울시 {place.name} 인근
                            <DetailSub>지도에서 위치 확인</DetailSub>
                        </DetailText>
                    </DetailItem>
                    <DetailItem>
                        <DetailIcon>🕐</DetailIcon>
                        <DetailText>
                            <OpenStatus>영업 중</OpenStatus> · 20:00에 영업 종료
                        </DetailText>
                    </DetailItem>
                    <DetailItem>
                        <DetailIcon>📞</DetailIcon>
                        <DetailText>
                            02-XXXX-XXXX
                            <CopyButton>복사</CopyButton>
                        </DetailText>
                    </DetailItem>
                    <DetailItem>
                        <DetailIcon>🏷️</DetailIcon>
                        <DetailText>
                            {categoryId === "kpop" ? "K-pop 명소" : categoryId === "ramen" ? "라멘 맛집" : "추천 장소"}
                        </DetailText>
                    </DetailItem>
                </DetailSection>

                {/* 더보기 버튼 */}
                <MoreButton>
                    정보 더보기 〉
                </MoreButton>
            </PanelContainer>
        </PanelOverlay>
    );
};

export default PlaceDetailPanel;

// Animations
const slideIn = keyframes`
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

// Styled Components
const PanelOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 300;
  animation: ${fadeIn} 0.2s ease-out;
`;

const PanelContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 380px;
  max-width: 90vw;
  height: 100%;
  background: #ffffff;
  box-shadow: 4px 0 20px rgba(0, 0, 0, 0.15);
  overflow-y: auto;
  animation: ${slideIn} 0.3s ease-out;

  &::-webkit-scrollbar {
    width: 0;
  }
`;

const ImageSection = styled.div<{ $image: string }>`
  position: relative;
  width: 100%;
  height: 200px;
  background-image: url(${(props) => props.$image});
  background-size: cover;
  background-position: center;
`;

const ImageOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0.2) 0%,
    rgba(0, 0, 0, 0) 30%,
    rgba(0, 0, 0, 0) 70%,
    rgba(0, 0, 0, 0.4) 100%
  );
`;

const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;

  &:hover {
    background: rgba(0, 0, 0, 0.7);
  }
`;

const CloseIcon = styled.span`
  color: white;
  font-size: 18px;
`;

const StreetViewBadge = styled.div`
  position: absolute;
  bottom: 16px;
  left: 16px;
  background: rgba(0, 0, 0, 0.6);
  padding: 6px 12px;
  border-radius: 4px;
  color: white;
  font-size: 13px;
`;

const InfoHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
`;

const PlaceName = styled.h2`
  font-family: "Pretendard", -apple-system, sans-serif;
  font-size: 22px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 4px;
`;

const PlaceCategory = styled.span<{ $color: string }>`
  font-size: 14px;
  color: #666;
`;

const ReviewInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
`;

const Stars = styled.span`
  color: #ffc107;
  font-size: 14px;
`;

const ReviewCount = styled.span`
  font-size: 13px;
  color: #888;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
  padding: 16px 20px;
`;

const ActionButton = styled.button<{ $variant: "outline" | "filled"; $color: string }>`
  flex: 1;
  padding: 12px 24px;
  border-radius: 24px;
  font-family: "Pretendard", -apple-system, sans-serif;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  ${(props) =>
        props.$variant === "outline"
            ? `
    background: white;
    border: 2px solid ${props.$color};
    color: ${props.$color};
    
    &:hover {
      background: ${props.$color}10;
    }
  `
            : `
    background: ${props.$color};
    border: none;
    color: white;
    
    &:hover {
      filter: brightness(1.1);
    }
  `}
`;

const QuickActions = styled.div`
  display: flex;
  justify-content: space-around;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
`;

const QuickAction = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px 16px;
  
  &:hover {
    opacity: 0.7;
  }
`;

const QuickIcon = styled.span`
  font-size: 20px;
`;

const QuickLabel = styled.span`
  font-size: 12px;
  color: #666;
`;

const TabMenu = styled.div`
  display: flex;
  border-bottom: 2px solid #f0f0f0;
`;

const Tab = styled.button<{ $active?: boolean }>`
  flex: 1;
  padding: 14px;
  background: none;
  border: none;
  font-family: "Pretendard", -apple-system, sans-serif;
  font-size: 15px;
  font-weight: ${(props) => (props.$active ? 600 : 400)};
  color: ${(props) => (props.$active ? "#1a1a1a" : "#888")};
  cursor: pointer;
  position: relative;

  ${(props) =>
        props.$active &&
        `
    &::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 0;
      right: 0;
      height: 2px;
      background: #1a1a1a;
    }
  `}
`;

const DetailSection = styled.div`
  padding: 16px 20px;
`;

const DetailItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 0;
  
  &:not(:last-child) {
    border-bottom: 1px solid #f5f5f5;
  }
`;

const DetailIcon = styled.span`
  font-size: 18px;
  width: 24px;
  text-align: center;
`;

const DetailText = styled.div`
  flex: 1;
  font-size: 14px;
  color: #333;
  line-height: 1.5;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
`;

const DetailSub = styled.span`
  display: block;
  width: 100%;
  font-size: 12px;
  color: #888;
  margin-top: 2px;
`;

const OpenStatus = styled.span`
  color: #4caf50;
  font-weight: 500;
`;

const CopyButton = styled.button`
  background: none;
  border: none;
  color: #2196f3;
  font-size: 13px;
  cursor: pointer;
  padding: 0;
  
  &:hover {
    text-decoration: underline;
  }
`;

const MoreButton = styled.button`
  display: block;
  width: calc(100% - 40px);
  margin: 8px 20px 24px;
  padding: 14px;
  background: #f8f8f8;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-family: "Pretendard", -apple-system, sans-serif;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  text-align: center;
  
  &:hover {
    background: #f0f0f0;
  }
`;
