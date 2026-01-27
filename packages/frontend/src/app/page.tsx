"use client";

import { useState, useCallback, useEffect } from "react";
import styled from "styled-components";
import Header from "../components/Header";
import MapComponent, { Place } from "../components/MapComponent";
import BottomSheet from "../components/BottomSheet";

export default function Home() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [currentCategory, setCurrentCategory] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // 사용자 위치 가져오기
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("위치 정보 오류:", error);
          // 기본값: 서울 시청
          setUserLocation({ lat: 37.5665, lng: 126.978 });
        }
      );
    }
  }, []);

  const handleCategorySelect = useCallback(async (categoryId: string, keyword: string) => {
    if (!userLocation) {
      alert("위치 정보를 가져오는 중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    setLoading(true);
    setCurrentCategory(categoryId);

    try {
      const response = await fetch("http://localhost:3001/api/recommend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          category: categoryId === "kpop" ? "케이팝 헌터스" : "한강라면",
          keyword,
          latitude: userLocation.lat,
          longitude: userLocation.lng,
        }),
      });

      if (!response.ok) {
        throw new Error("API 요청 실패");
      }

      const data = await response.json();
      console.log("추천 장소:", data);

      if (data.places && Array.isArray(data.places)) {
        setPlaces(data.places);
      }
    } catch (error) {
      console.error("장소 추천 오류:", error);
      alert("장소 추천에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  }, [userLocation]);

  return (
    <Container>
      <Header />
      <MapWrapper>
        <MapComponent places={places} categoryId={currentCategory} />
      </MapWrapper>

      {/* 로딩 오버레이 */}
      {loading && (
        <LoadingOverlay>
          <LoadingSpinner />
          <LoadingText>AI가 명소를 찾고 있어요...</LoadingText>
        </LoadingOverlay>
      )}

      <BottomSheet onCategorySelect={handleCategorySelect} />
    </Container>
  );
}

const Container = styled.div`
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: #f5f5f5;
`;

const MapWrapper = styled.div`
  position: fixed;
  top: 56px;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
`;

const LoadingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 100;
`;

const LoadingSpinner = styled.div`
  width: 48px;
  height: 48px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const LoadingText = styled.p`
  margin-top: 16px;
  color: #ffffff;
  font-family: "Pretendard", sans-serif;
  font-size: 16px;
  font-weight: 500;
`;