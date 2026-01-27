"use client";

import React, { useState, useCallback, useEffect, useMemo } from "react";
import { GoogleMap, useJsApiLoader, MarkerF, OverlayView } from "@react-google-maps/api";
import styled from "styled-components";
import PlaceDetailPanel from "./PlaceDetailPanel";
import ClusterSelectionPanel from "./ClusterSelectionPanel";

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

interface Cluster {
  id: string;
  places: Place[];
  center: { lat: number; lng: number };
}

interface MapComponentProps {
  places?: Place[];
  categoryId?: string;
}

// 두 좌표 사이의 거리 계산 (미터)
const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371000; // 지구 반지름 (미터)
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// 줌 레벨에 따른 클러스터링 반경 (미터)
const getClusterRadius = (zoom: number): number => {
  if (zoom >= 18) return 10;
  if (zoom >= 16) return 30;
  if (zoom >= 14) return 80;
  if (zoom >= 12) return 200;
  return 500;
};

// 장소들을 클러스터링
const clusterPlaces = (places: Place[], clusterRadius: number): Cluster[] => {
  const clusters: Cluster[] = [];
  const clustered: Set<number> = new Set();

  places.forEach((place, i) => {
    if (clustered.has(i)) return;

    const cluster: Place[] = [place];
    clustered.add(i);

    // 이 장소와 가까운 다른 장소들 찾기
    places.forEach((otherPlace, j) => {
      if (i === j || clustered.has(j)) return;

      const distance = calculateDistance(
        place.latitude, place.longitude,
        otherPlace.latitude, otherPlace.longitude
      );

      if (distance <= clusterRadius) {
        cluster.push(otherPlace);
        clustered.add(j);
      }
    });

    // 클러스터 중심점 계산
    const centerLat = cluster.reduce((sum, p) => sum + p.latitude, 0) / cluster.length;
    const centerLng = cluster.reduce((sum, p) => sum + p.longitude, 0) / cluster.length;

    clusters.push({
      id: `cluster-${i}`,
      places: cluster,
      center: { lat: centerLat, lng: centerLng },
    });
  });

  return clusters;
};

const MapComponent: React.FC<MapComponentProps> = ({ places = [], categoryId = "default" }) => {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [center, setCenter] = useState(initialCenter);
  const [zoom, setZoom] = useState(14);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [clusterSelection, setClusterSelection] = useState<{
    places: Place[];
    position: { x: number; y: number };
  } | null>(null);

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

  // 클러스터링 계산
  const clusters = useMemo(() => {
    const radius = getClusterRadius(zoom);
    return clusterPlaces(places, radius);
  }, [places, zoom]);

  const onLoad = useCallback((map: google.maps.Map) => {
    map.setZoom(14);
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const handleZoomChanged = useCallback(() => {
    if (map) {
      const newZoom = map.getZoom();
      if (newZoom) {
        setZoom(newZoom);
      }
    }
  }, [map]);

  const handleClusterClick = (cluster: Cluster, event: google.maps.MapMouseEvent) => {
    if (cluster.places.length === 1) {
      // 단일 장소면 바로 선택
      handlePlaceSelect(cluster.places[0]);
    } else {
      // 여러 장소면 선택 패널 표시
      // 마우스 위치 또는 화면 중앙 사용
      const x = event.domEvent?.clientX || window.innerWidth / 2;
      const y = event.domEvent?.clientY || window.innerHeight / 2;

      setClusterSelection({
        places: cluster.places,
        position: { x, y },
      });
    }
  };

  const handlePlaceSelect = (place: Place) => {
    console.log("📍 장소 선택:", place.name);
    setSelectedPlace(place);
    setClusterSelection(null);

    // 지도 중심을 선택된 장소로 이동
    if (map) {
      map.panTo({ lat: place.latitude, lng: place.longitude });
    }
  };

  const handleClosePanel = () => {
    setSelectedPlace(null);
  };

  const handleCloseClusterSelection = () => {
    setClusterSelection(null);
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
        onZoomChanged={handleZoomChanged}
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

        {/* 클러스터/마커 표시 */}
        {clusters.map((cluster) => {
          const isMultiple = cluster.places.length > 1;
          const isAnySelected = cluster.places.some(p => p.name === selectedPlace?.name);

          if (isMultiple) {
            // 클러스터 마커 (여러 장소)
            return (
              <OverlayView
                key={cluster.id}
                position={cluster.center}
                mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
              >
                <ClusterMarker
                  $color={markerColor}
                  $isSelected={isAnySelected}
                  onClick={(e) => {
                    e.stopPropagation();
                    const rect = (e.target as HTMLElement).getBoundingClientRect();
                    setClusterSelection({
                      places: cluster.places,
                      position: { x: rect.left + rect.width / 2, y: rect.top },
                    });
                  }}
                >
                  <ClusterCount>+{cluster.places.length}</ClusterCount>
                </ClusterMarker>
              </OverlayView>
            );
          } else {
            // 단일 마커
            const place = cluster.places[0];
            const isSelected = selectedPlace?.name === place.name;

            return (
              <MarkerF
                key={cluster.id}
                position={{ lat: place.latitude, lng: place.longitude }}
                icon={{
                  path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
                  scale: 7,
                  fillColor: isSelected ? "#FFFFFF" : markerColor,
                  fillOpacity: 1,
                  strokeColor: isSelected ? markerColor : "#ffffff",
                  strokeWeight: isSelected ? 3 : 2,
                }}
                title={`${place.name} - ${place.description}`}
                onClick={() => handlePlaceSelect(place)}
              />
            );
          }
        })}
      </GoogleMap>

      {/* 클러스터 선택 패널 */}
      {clusterSelection && (
        <ClusterSelectionPanel
          places={clusterSelection.places}
          position={clusterSelection.position}
          onSelect={handlePlaceSelect}
          onClose={handleCloseClusterSelection}
          categoryId={categoryId}
        />
      )}

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

const ClusterMarker = styled.div<{ $color: string; $isSelected: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: ${props => props.$isSelected ? "white" : props.$color};
  border: 3px solid ${props => props.$isSelected ? props.$color : "white"};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  transform: translate(-50%, -50%);
  transition: all 0.2s ease;

  &:hover {
    transform: translate(-50%, -50%) scale(1.15);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
  }

  &:active {
    transform: translate(-50%, -50%) scale(1.05);
  }
`;

const ClusterCount = styled.span`
  font-family: "Pretendard", -apple-system, sans-serif;
  font-weight: 700;
  font-size: 14px;
  color: inherit;
  
  ${ClusterMarker}:not([style*="background: white"]) & {
    color: white;
  }
`;
