"use client";

import React, { useState, useCallback, useEffect } from "react";
import { GoogleMap, useJsApiLoader, MarkerF } from "@react-google-maps/api";
import styled from "styled-components";

const containerStyle = {
  width: "100%",
  height: "100vh",
};

const initialCenter = {
  lat: 37.5665,
  lng: 126.978,
};

const MapComponent: React.FC = () => {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [center, setCenter] = useState(initialCenter);

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
          // Handle error or default to a location
          console.error("Error getting user location");
        }
      );
    }
  }, []);

  const onLoad = useCallback(
    function callback(map: google.maps.Map) {
      // You might want to adjust the zoom level after getting the user's location
      map.setZoom(15);
      setMap(map);
    },
    [] // Center is not a dependency here anymore to avoid re-fitting bounds
  );

  const onUnmount = useCallback(function callback(map: google.maps.Map) {
    setMap(null);
  }, []);

  return isLoaded ? (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={15} // Initial zoom, will be adjusted in onLoad
      onLoad={onLoad}
      onUnmount={onUnmount}
    >
      <MarkerF position={center} />
      {/* Child components, such as markers, info windows, etc. */}
    </GoogleMap>
  ) : (
    <LoadingContainer>Loading Map...</LoadingContainer>
  );
};

export default MapComponent;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  font-size: 2rem;
  color: #555;
`;
