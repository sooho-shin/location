"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import PlaceDetailPanel from "./PlaceDetailPanel";
import ClusterSelectionPanel from "./ClusterSelectionPanel";

const initialCenter = { lat: 37.5665, lng: 126.978 };
const defaultZoom = 14;

const categoryColors: Record<string, string> = {
  kpop: "#FF4081",
  ramen: "#FF9800",
  default: "#9C27B0",
};

export interface Place {
  id?: string;
  placeId?: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  category: string;
  source?: "google_places" | "gemini";
  googleMapsUri?: string;
  rating?: number;
  userRatingCount?: number;
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

declare global {
  interface Window {
    google?: typeof google;
    googleMapsApiPromise?: Promise<typeof google.maps>;
  }
}

const loadGoogleMaps = (apiKey: string): Promise<typeof google.maps> => {
  if (window.google?.maps) {
    return Promise.resolve(window.google.maps);
  }

  if (!window.googleMapsApiPromise) {
    window.googleMapsApiPromise = new Promise((resolve, reject) => {
      const existingScript = document.querySelector<HTMLScriptElement>('script[data-location-google-maps="true"]');

      if (existingScript) {
        existingScript.addEventListener("load", () => resolve(window.google!.maps));
        existingScript.addEventListener("error", () => reject(new Error("Google Maps API 로드 실패")));
        return;
      }

      const script = document.createElement("script");
      script.dataset.locationGoogleMaps = "true";
      script.async = true;
      script.defer = true;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&loading=async&language=ko&region=KR`;
      script.onload = () => resolve(window.google!.maps);
      script.onerror = () => reject(new Error("Google Maps API 로드 실패"));
      document.head.appendChild(script);
    });
  }

  return window.googleMapsApiPromise;
};

const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const getClusterRadius = (zoom: number): number => {
  if (zoom >= 18) return 10;
  if (zoom >= 16) return 30;
  if (zoom >= 14) return 80;
  if (zoom >= 12) return 200;
  return 500;
};

const clusterPlaces = (places: Place[], clusterRadius: number): Cluster[] => {
  const clusters: Cluster[] = [];
  const clustered: Set<number> = new Set();

  places.forEach((place, i) => {
    if (clustered.has(i)) return;

    const cluster: Place[] = [place];
    clustered.add(i);

    places.forEach((otherPlace, j) => {
      if (i === j || clustered.has(j)) return;

      const distance = calculateDistance(
        place.latitude,
        place.longitude,
        otherPlace.latitude,
        otherPlace.longitude
      );

      if (distance <= clusterRadius) {
        cluster.push(otherPlace);
        clustered.add(j);
      }
    });

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

const svgMarker = (svg: string): string =>
  `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;

const createCurrentLocationIcon = (): google.maps.Icon => ({
  url: svgMarker(`
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="14" cy="14" r="10" fill="#4285F4" stroke="white" stroke-width="4"/>
      <circle cx="14" cy="14" r="13" stroke="#4285F4" stroke-opacity="0.22" stroke-width="2"/>
    </svg>
  `),
  scaledSize: new google.maps.Size(28, 28),
  anchor: new google.maps.Point(14, 14),
});

const createPlaceIcon = (color: string, selected: boolean): google.maps.Icon => ({
  url: svgMarker(`
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="${selected ? 8 : 7}" fill="${selected ? "#FFFFFF" : color}" stroke="${selected ? color : "#FFFFFF"}" stroke-width="${selected ? 4 : 3}"/>
      <circle cx="12" cy="12" r="10.5" stroke="black" stroke-opacity="0.12"/>
    </svg>
  `),
  scaledSize: new google.maps.Size(24, 24),
  anchor: new google.maps.Point(12, 12),
});

const createClusterIcon = (color: string, selected: boolean): google.maps.Icon => ({
  url: svgMarker(`
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="20" fill="${selected ? "#FFFFFF" : color}" stroke="${selected ? color : "#FFFFFF"}" stroke-width="4"/>
      <circle cx="24" cy="24" r="23" stroke="black" stroke-opacity="0.12"/>
    </svg>
  `),
  scaledSize: new google.maps.Size(48, 48),
  anchor: new google.maps.Point(24, 24),
  labelOrigin: new google.maps.Point(24, 24),
});

const MapComponent: React.FC<MapComponentProps> = ({ places = [], categoryId = "default" }) => {
  const mapRef = useRef<google.maps.Map | null>(null);
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const currentLocationMarkerRef = useRef<google.maps.Marker | null>(null);
  const appliedLocationRef = useRef(false);
  const [center, setCenter] = useState(initialCenter);
  const [zoom, setZoom] = useState(defaultZoom);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [clusterSelection, setClusterSelection] = useState<{
    places: Place[];
    position: { x: number; y: number };
  } | null>(null);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const markerColor = categoryColors[categoryId] || categoryColors.default;

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCenter({ lat: position.coords.latitude, lng: position.coords.longitude });
        },
        () => {
          console.error("사용자 위치를 가져오지 못했습니다.");
        }
      );
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    if (!apiKey) {
      setMapError("NEXT_PUBLIC_GOOGLE_MAPS_API_KEY가 설정되어 있지 않습니다.");
      return;
    }

    loadGoogleMaps(apiKey)
      .then((maps) => {
        if (cancelled || !mapElementRef.current || mapRef.current) return;

        mapRef.current = new maps.Map(mapElementRef.current, {
          center: initialCenter,
          zoom: defaultZoom,
          clickableIcons: false,
          fullscreenControl: false,
          mapTypeControl: false,
          streetViewControl: false,
        });

        mapRef.current.addListener("zoom_changed", () => {
          const nextZoom = mapRef.current?.getZoom();
          if (typeof nextZoom === "number") {
            setZoom(nextZoom);
          }
        });

        setMapReady(true);
        setMapError(null);
      })
      .catch((error: Error) => {
        if (!cancelled) {
          setMapError(error.message);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [apiKey]);

  useEffect(() => {
    if (!mapReady || !mapRef.current) return;

    if (!appliedLocationRef.current) {
      mapRef.current.setCenter(center);
      appliedLocationRef.current = true;
    }

    if (!currentLocationMarkerRef.current) {
      currentLocationMarkerRef.current = new google.maps.Marker({
        map: mapRef.current,
        position: center,
        icon: createCurrentLocationIcon(),
        title: "현재 위치",
        zIndex: 10,
      });
      return;
    }

    currentLocationMarkerRef.current.setPosition(center);
  }, [center, mapReady]);

  useEffect(() => {
    if (selectedPlace && mapRef.current) {
      mapRef.current.panTo({ lat: selectedPlace.latitude, lng: selectedPlace.longitude });
    }
  }, [selectedPlace]);

  const clusters = useMemo(() => {
    const radius = getClusterRadius(zoom);
    return clusterPlaces(places, radius);
  }, [places, zoom]);

  useEffect(() => {
    if (!mapReady || !mapRef.current) return;

    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    clusters.forEach((cluster) => {
      const isMultiple = cluster.places.length > 1;
      const isAnySelected = cluster.places.some((p) => p.name === selectedPlace?.name);

      if (isMultiple) {
        const marker = new google.maps.Marker({
          map: mapRef.current,
          position: cluster.center,
          icon: createClusterIcon(markerColor, isAnySelected),
          label: {
            text: `+${cluster.places.length}`,
            color: isAnySelected ? markerColor : "#FFFFFF",
            fontFamily: "Pretendard, -apple-system, sans-serif",
            fontSize: "14px",
            fontWeight: "700",
          },
          zIndex: isAnySelected ? 30 : 20,
        });

        marker.addListener("click", (event: google.maps.MapMouseEvent) => {
          const domEvent = event.domEvent as MouseEvent | undefined;
          setClusterSelection({
            places: cluster.places,
            position: {
              x: domEvent?.clientX ?? window.innerWidth / 2,
              y: domEvent?.clientY ?? window.innerHeight / 2,
            },
          });
        });

        markersRef.current.push(marker);
        return;
      }

      const place = cluster.places[0];
      const isSelected = selectedPlace?.name === place.name;
      const marker = new google.maps.Marker({
        map: mapRef.current,
        position: { lat: place.latitude, lng: place.longitude },
        icon: createPlaceIcon(markerColor, isSelected),
        title: place.name,
        zIndex: isSelected ? 30 : 20,
      });

      marker.addListener("click", () => {
        setSelectedPlace(place);
        setClusterSelection(null);
      });

      markersRef.current.push(marker);
    });

    return () => {
      markersRef.current.forEach((marker) => marker.setMap(null));
      markersRef.current = [];
    };
  }, [clusters, mapReady, markerColor, selectedPlace]);

  const handlePlaceSelect = (place: Place) => {
    setSelectedPlace(place);
    setClusterSelection(null);
  };

  const handleClosePanel = () => setSelectedPlace(null);
  const handleCloseClusterSelection = () => setClusterSelection(null);

  return (
    <>
      <div ref={mapElementRef} style={{ width: "100%", height: "100%" }} />

      {mapError && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            background: "#f5f5f5",
            color: "#333333",
            fontSize: 15,
            fontWeight: 600,
            textAlign: "center",
          }}
        >
          {mapError}
        </div>
      )}

      {clusterSelection && (
        <ClusterSelectionPanel
          places={clusterSelection.places}
          position={clusterSelection.position}
          onSelect={handlePlaceSelect}
          onClose={handleCloseClusterSelection}
          categoryId={categoryId}
        />
      )}

      <PlaceDetailPanel place={selectedPlace} onClose={handleClosePanel} categoryId={categoryId} />
    </>
  );
};

export default MapComponent;
