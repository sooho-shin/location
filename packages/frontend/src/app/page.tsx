"use client";

import { useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import styled from "styled-components";
import Header from "../components/Header";
import type { Place } from "../components/MapComponent";
import BottomSheet from "../components/BottomSheet";
import { API_BASE_URL } from "../lib/config";
import { DEFAULT_LANGUAGE, getMessages, isAppLanguage, type AppLanguage } from "../lib/i18n";

const MapComponent = dynamic(() => import("../components/MapComponent"), {
  ssr: false,
});

const LANGUAGE_STORAGE_KEY = "location-language";

const getSavedLanguage = (): AppLanguage => {
  const savedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (isAppLanguage(savedLanguage)) return savedLanguage;

  const browserLanguage = window.navigator.language.toLowerCase();
  if (browserLanguage.startsWith("ja")) return "ja";
  if (browserLanguage.startsWith("zh")) return "zh";
  if (browserLanguage.startsWith("fr")) return "fr";
  if (browserLanguage.startsWith("en")) return "en";

  return DEFAULT_LANGUAGE;
};

export default function Home() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [currentCategory, setCurrentCategory] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [language, setLanguage] = useState<AppLanguage>(DEFAULT_LANGUAGE);
  const t = getMessages(language);

  useEffect(() => {
    setLanguage(getSavedLanguage());
  }, []);

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

  const handleLanguageChange = useCallback((nextLanguage: AppLanguage) => {
    if (nextLanguage === language) return;

    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
    setLanguage(nextLanguage);
  }, [language]);

  const handleCategorySelect = useCallback(async (categoryId: string, keyword: string, title: string) => {
    if (!userLocation) {
      alert(t.waitingForLocation);
      return;
    }

    setLoading(true);
    setCurrentCategory(categoryId);

    try {
      const response = await fetch(`${API_BASE_URL}/api/recommend`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          category: title || categoryId,
          keyword,
          language,
          latitude: userLocation.lat,
          longitude: userLocation.lng,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("API 오류 응답:", data);
        throw new Error(data?.details || data?.error || "API 요청 실패");
      }
      console.log("추천 장소:", data);

      if (data.places && Array.isArray(data.places)) {
        setPlaces(data.places);
        if (data.places.length === 0) {
          alert(t.emptyPlaces);
        }
      }
    } catch (error) {
      console.error("장소 추천 오류:", error);
      alert(t.recommendFailed);
    } finally {
      setLoading(false);
    }
  }, [language, t, userLocation]);

  return (
    <Container>
      <Header currentLanguage={language} onLanguageChange={handleLanguageChange} />
      <MapWrapper>
        <MapComponent places={places} categoryId={currentCategory} language={language} />
      </MapWrapper>

      {/* 로딩 오버레이 */}
      {loading && (
        <LoadingOverlay>
          <LoadingSpinner />
          <LoadingText>{t.loadingPlaces}</LoadingText>
        </LoadingOverlay>
      )}

      <BottomSheet userLocation={userLocation} language={language} onCategorySelect={handleCategorySelect} />
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
