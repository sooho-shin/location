"use client";

import React from "react";
import styled, { keyframes } from "styled-components";
import { Place } from "./MapComponent";

interface ClusterSelectionPanelProps {
    places: Place[];
    position: { x: number; y: number };
    onSelect: (place: Place) => void;
    onClose: () => void;
    categoryId?: string;
}

// 카테고리별 테마 색상
const categoryThemes: Record<string, { primary: string; light: string }> = {
    kpop: { primary: "#FF4081", light: "#FCE4EC" },
    ramen: { primary: "#FF9800", light: "#FFF3E0" },
    default: { primary: "#9C27B0", light: "#F3E5F5" },
};

const ClusterSelectionPanel: React.FC<ClusterSelectionPanelProps> = ({
    places,
    position,
    onSelect,
    onClose,
    categoryId = "default",
}) => {
    const theme = categoryThemes[categoryId] || categoryThemes.default;

    // 패널이 화면 밖으로 나가지 않도록 위치 조정
    const adjustedPosition = {
        x: Math.min(position.x, window.innerWidth - 280),
        y: Math.min(position.y, window.innerHeight - (places.length * 70 + 60)),
    };

    return (
        <>
            <Overlay onClick={onClose} />
            <PanelContainer
                style={{
                    left: adjustedPosition.x,
                    top: adjustedPosition.y
                }}
                $color={theme.primary}
            >
                <PanelHeader $color={theme.primary}>
                    <HeaderTitle>
                        <ClusterIcon>📍</ClusterIcon>
                        {places.length}개 장소
                    </HeaderTitle>
                    <CloseButton onClick={onClose}>✕</CloseButton>
                </PanelHeader>
                <PlaceList>
                    {places.map((place, index) => (
                        <PlaceItem
                            key={`${place.name}-${index}`}
                            onClick={() => onSelect(place)}
                            $color={theme.primary}
                            $light={theme.light}
                        >
                            <PlaceIcon $color={theme.primary}>
                                {index + 1}
                            </PlaceIcon>
                            <PlaceInfo>
                                <PlaceName>{place.name}</PlaceName>
                                <PlaceDesc>{place.description}</PlaceDesc>
                            </PlaceInfo>
                            <ArrowIcon>→</ArrowIcon>
                        </PlaceItem>
                    ))}
                </PlaceList>
            </PanelContainer>
        </>
    );
};

export default ClusterSelectionPanel;

// Animations
const slideUp = keyframes`
    from {
        opacity: 0;
        transform: translateY(10px) scale(0.95);
    }
    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
`;

const fadeIn = keyframes`
    from { opacity: 0; }
    to { opacity: 1; }
`;

// Styled Components
const Overlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: transparent;
    z-index: 150;
`;

const PanelContainer = styled.div<{ $color: string }>`
    position: fixed;
    z-index: 200;
    background: white;
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2), 0 2px 8px rgba(0, 0, 0, 0.1);
    min-width: 260px;
    max-width: 320px;
    max-height: 400px;
    overflow: hidden;
    animation: ${slideUp} 0.25s ease-out;
    border: 2px solid ${props => props.$color}20;
`;

const PanelHeader = styled.div<{ $color: string }>`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px;
    background: linear-gradient(135deg, ${props => props.$color}, ${props => props.$color}CC);
    color: white;
`;

const HeaderTitle = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    font-family: "Pretendard", -apple-system, sans-serif;
    font-weight: 600;
    font-size: 15px;
`;

const ClusterIcon = styled.span`
    font-size: 18px;
`;

const CloseButton = styled.button`
    background: rgba(255, 255, 255, 0.2);
    border: none;
    color: white;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    transition: background 0.2s;

    &:hover {
        background: rgba(255, 255, 255, 0.3);
    }
`;

const PlaceList = styled.div`
    max-height: 320px;
    overflow-y: auto;

    &::-webkit-scrollbar {
        width: 4px;
    }

    &::-webkit-scrollbar-thumb {
        background: #ddd;
        border-radius: 2px;
    }
`;

const PlaceItem = styled.button<{ $color: string; $light: string }>`
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    padding: 14px 16px;
    background: white;
    border: none;
    border-bottom: 1px solid #f0f0f0;
    cursor: pointer;
    text-align: left;
    transition: all 0.2s;

    &:last-child {
        border-bottom: none;
    }

    &:hover {
        background: ${props => props.$light};
    }

    &:active {
        transform: scale(0.98);
    }
`;

const PlaceIcon = styled.div<{ $color: string }>`
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: ${props => props.$color};
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 14px;
    flex-shrink: 0;
`;

const PlaceInfo = styled.div`
    flex: 1;
    min-width: 0;
`;

const PlaceName = styled.div`
    font-family: "Pretendard", -apple-system, sans-serif;
    font-weight: 600;
    font-size: 14px;
    color: #1a1a1a;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const PlaceDesc = styled.div`
    font-size: 12px;
    color: #888;
    margin-top: 2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const ArrowIcon = styled.span`
    color: #ccc;
    font-size: 16px;
    flex-shrink: 0;
`;
