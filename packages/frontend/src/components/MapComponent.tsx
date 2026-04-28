"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import PlaceDetailPanel from "./PlaceDetailPanel";
import ClusterSelectionPanel from "./ClusterSelectionPanel";

const initialCenter: [number, number] = [37.5665, 126.978];

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

const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
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
        place.latitude, place.longitude,
        otherPlace.latitude, otherPlace.longitude
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

const createCurrentLocationIcon = () =>
  L.divIcon({
    className: "current-location-marker",
    html: `<div style="width:24px;height:24px;border-radius:50%;background:#4285F4;border:3px solid #ffffff;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });

const createPlaceIcon = (color: string, selected: boolean) =>
  L.divIcon({
    className: "place-marker",
    html: `<div style="width:16px;height:16px;border-radius:50%;background:${selected ? "#FFFFFF" : color};border:${selected ? 3 : 2}px solid ${selected ? color : "#ffffff"};box-shadow:0 2px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });

const createClusterIcon = (color: string, count: number, selected: boolean) =>
  L.divIcon({
    className: "cluster-marker",
    html: `<div style="display:flex;align-items:center;justify-content:center;width:44px;height:44px;border-radius:50%;background:${selected ? "#ffffff" : color};border:3px solid ${selected ? color : "#ffffff"};box-shadow:0 4px 12px rgba(0,0,0,0.3);color:${selected ? color : "#ffffff"};font-weight:700;font-size:14px;font-family:Pretendard,-apple-system,sans-serif;">+${count}</div>`,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
  });

const MapEvents: React.FC<{ onZoom: (zoom: number) => void }> = ({ onZoom }) => {
  useMapEvents({
    zoomend: (e) => onZoom(e.target.getZoom()),
  });
  return null;
};

const PanToPlace: React.FC<{ place: Place | null }> = ({ place }) => {
  const map = useMap();
  useEffect(() => {
    if (place) {
      map.panTo([place.latitude, place.longitude]);
    }
  }, [place, map]);
  return null;
};

const InitialCenter: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();
  const appliedRef = useRef(false);
  useEffect(() => {
    if (!appliedRef.current && (center[0] !== initialCenter[0] || center[1] !== initialCenter[1])) {
      map.setView(center, map.getZoom());
      appliedRef.current = true;
    }
  }, [center, map]);
  return null;
};

const MapComponent: React.FC<MapComponentProps> = ({ places = [], categoryId = "default" }) => {
  const [center, setCenter] = useState<[number, number]>(initialCenter);
  const [zoom, setZoom] = useState(14);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [clusterSelection, setClusterSelection] = useState<{
    places: Place[];
    position: { x: number; y: number };
  } | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCenter([position.coords.latitude, position.coords.longitude]);
        },
        () => {
          console.error("Error getting user location");
        }
      );
    }
  }, []);

  const clusters = useMemo(() => {
    const radius = getClusterRadius(zoom);
    return clusterPlaces(places, radius);
  }, [places, zoom]);

  const markerColor = categoryColors[categoryId] || categoryColors.default;

  const handlePlaceSelect = (place: Place) => {
    console.log("📍 장소 선택:", place.name);
    setSelectedPlace(place);
    setClusterSelection(null);
  };

  const handleClosePanel = () => setSelectedPlace(null);
  const handleCloseClusterSelection = () => setClusterSelection(null);

  return (
    <>
      <MapContainer
        center={initialCenter}
        zoom={14}
        style={{ width: "100%", height: "100%" }}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapEvents onZoom={setZoom} />
        <InitialCenter center={center} />
        <PanToPlace place={selectedPlace} />

        <Marker position={center} icon={createCurrentLocationIcon()} />

        {clusters.map((cluster) => {
          const isMultiple = cluster.places.length > 1;
          const isAnySelected = cluster.places.some((p) => p.name === selectedPlace?.name);

          if (isMultiple) {
            return (
              <Marker
                key={cluster.id}
                position={[cluster.center.lat, cluster.center.lng]}
                icon={createClusterIcon(markerColor, cluster.places.length, isAnySelected)}
                eventHandlers={{
                  click: (e) => {
                    const ev = e.originalEvent as MouseEvent;
                    setClusterSelection({
                      places: cluster.places,
                      position: { x: ev.clientX, y: ev.clientY },
                    });
                  },
                }}
              />
            );
          }

          const place = cluster.places[0];
          const isSelected = selectedPlace?.name === place.name;

          return (
            <Marker
              key={cluster.id}
              position={[place.latitude, place.longitude]}
              icon={createPlaceIcon(markerColor, isSelected)}
              eventHandlers={{
                click: () => handlePlaceSelect(place),
              }}
            />
          );
        })}
      </MapContainer>

      {clusterSelection && (
        <ClusterSelectionPanel
          places={clusterSelection.places}
          position={clusterSelection.position}
          onSelect={handlePlaceSelect}
          onClose={handleCloseClusterSelection}
          categoryId={categoryId}
        />
      )}

      <PlaceDetailPanel
        place={selectedPlace}
        onClose={handleClosePanel}
        categoryId={categoryId}
      />
    </>
  );
};

export default MapComponent;
