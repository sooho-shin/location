"use client";

import React, { useState, useCallback, useEffect } from "react";
import { GoogleMap, useJsApiLoader, MarkerF } from "@react-google-maps/api";
import styled from "styled-components";
import PlaceDetailPanel from "./PlaceDetailPanel";

const containerStyle = {
  width: "100%",
  height: "100%",
};

const initialCenter = {
  lat: 37.5665,
  lng: 126.978,
};

// 카테고리별 마커 색상
const categoryColors: Record<string, string> = {
  kpop: "#FF4081",    // 핑크
  ramen: "#FF9800",   // 오렌지
  default: "#9C27B0", // 보라
};

export interface Place {
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  category: string;
}

interface MapComponentProps {
  places?: Place[];
  categoryId?: string;
}

const MapComponent: React.FC<MapComponentProps> = ({ places = [], categoryId = "default" }) => {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [center, setCenter] = useState(initialCenter);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

  // 현재 위치 가져오기
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const currentLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCenter(currentLocation);
        },
        () => {
          console.error("Error getting user location");
        }
      );
    }
  }, []);

  const onLoad = useCallback((map: google.maps.Map) => {
    map.setZoom(14);
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const handleMarkerClick = (place: Place) => {
    console.log("📍 장소 선택:", place.name);
    setSelectedPlace(place);

    // 지도 중심을 선택된 장소로 이동
    if (map) {
      map.panTo({ lat: place.latitude, lng: place.longitude });
    }
  };

  const handleClosePanel = () => {
    setSelectedPlace(null);
  };

  const markerColor = categoryColors[categoryId] || categoryColors.default;

  return isLoaded ? (
    <>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={14}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        }}
      >
        {/* 현재 위치 마커 (파란색) */}
        <MarkerF
          position={center}
          icon={{
            path: google.maps.SymbolPath.CIRCLE,
            scale: 12,
            fillColor: "#4285F4",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 3,
          }}
          title="현재 위치"
        />

        {/* 추천 장소 마커들 */}
        {places.map((place, index) => (
          <MarkerF
            key={`${place.name}-${index}`}
            position={{ lat: place.latitude, lng: place.longitude }}
            icon={{
              path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
              scale: 7,
              fillColor: selectedPlace?.name === place.name ? "#FFFFFF" : markerColor,
              fillOpacity: 1,
              strokeColor: selectedPlace?.name === place.name ? markerColor : "#ffffff",
              strokeWeight: selectedPlace?.name === place.name ? 3 : 2,
            }}
            title={`${place.name} - ${place.description}`}
            onClick={() => handleMarkerClick(place)}
          />
        ))}
      </GoogleMap>

      {/* 장소 상세 패널 */}
      <PlaceDetailPanel
        place={selectedPlace}
        onClose={handleClosePanel}
        categoryId={categoryId}
      />
    </>
  ) : (
    <LoadingContainer>Loading Map...</LoadingContainer>
  );
};

export default MapComponent;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  font-size: 1.5rem;
  color: #555;
  background: #f5f5f5;
`;
