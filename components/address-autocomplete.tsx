"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { GoogleMap, useJsApiLoader, MarkerF } from "@react-google-maps/api";
import { Input } from "@/components/ui/input";
import {
  googleRegionToChilean,
  matchCityInRegion,
} from "@/lib/chile-cities";

const LIBRARIES: ("places")[] = ["places"];

const MAP_CONTAINER_STYLE = {
  width: "100%",
  height: "200px",
  borderRadius: "0.5rem",
};

const DEFAULT_CENTER = { lat: -33.4489, lng: -70.6693 }; // Santiago

const MAP_OPTIONS: google.maps.MapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  gestureHandling: "none",
  styles: [
    { featureType: "poi", stylers: [{ visibility: "off" }] },
    { featureType: "transit", stylers: [{ visibility: "off" }] },
  ],
};

export interface AddressResult {
  formattedAddress: string;
  streetAddress: string;
  region: string | null;
  city: string | null;
  postalCode: string | null;
  lat: number;
  lng: number;
}

interface AddressAutocompleteProps {
  defaultValue?: string;
  onAddressSelect: (result: AddressResult) => void;
}

function extractComponent(
  components: google.maps.GeocoderAddressComponent[],
  type: string,
): string {
  return components.find((c) => c.types.includes(type))?.long_name ?? "";
}

function buildStreetAddress(
  components: google.maps.GeocoderAddressComponent[],
): string {
  const route = extractComponent(components, "route");
  const number = extractComponent(components, "street_number");
  if (!route) return "";
  return number ? `${route} ${number}` : route;
}

export function AddressAutocomplete({
  defaultValue,
  onAddressSelect,
}: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [marker, setMarker] = useState(DEFAULT_CENTER);
  const [showMap, setShowMap] = useState(false);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
    libraries: LIBRARIES,
  });

  const handlePlaceChanged = useCallback(() => {
    const place = autocompleteRef.current?.getPlace();
    if (!place?.geometry?.location || !place.address_components) return;

    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();
    setMarker({ lat, lng });
    setShowMap(true);

    const components = place.address_components;
    const streetAddress = buildStreetAddress(components);
    const googleRegion = extractComponent(components, "administrative_area_level_1");
    const locality =
      extractComponent(components, "locality") ||
      extractComponent(components, "administrative_area_level_3") ||
      extractComponent(components, "administrative_area_level_2") ||
      extractComponent(components, "sublocality_level_1");
    const postalCode = extractComponent(components, "postal_code");

    const region = googleRegionToChilean(googleRegion);
    const city = region ? matchCityInRegion(region, locality) : null;

    onAddressSelect({
      formattedAddress: place.formatted_address ?? "",
      streetAddress: streetAddress || place.formatted_address?.split(",")[0] || "",
      region,
      city,
      postalCode: postalCode || null,
      lat,
      lng,
    });
  }, [onAddressSelect]);

  useEffect(() => {
    if (!isLoaded || !inputRef.current || autocompleteRef.current) return;

    const ac = new google.maps.places.Autocomplete(inputRef.current, {
      componentRestrictions: { country: "cl" },
      fields: [
        "address_components",
        "formatted_address",
        "geometry",
      ],
      types: ["address"],
    });

    ac.addListener("place_changed", handlePlaceChanged);
    autocompleteRef.current = ac;

    return () => {
      google.maps.event.clearInstanceListeners(ac);
    };
  }, [isLoaded, handlePlaceChanged]);

  if (!isLoaded) {
    return (
      <Input
        placeholder="Cargando Google Maps..."
        disabled
        className="mt-1"
      />
    );
  }

  return (
    <div className="space-y-3">
      <Input
        ref={inputRef}
        id="shippingAddress"
        name="shippingAddress"
        required
        placeholder="Busca tu dirección..."
        className="mt-1"
        autoComplete="off"
        defaultValue={defaultValue}
      />

      {showMap && (
        <div className="animate-in fade-in slide-in-from-top-2 overflow-hidden rounded-lg border border-border duration-300">
          <GoogleMap
            mapContainerStyle={MAP_CONTAINER_STYLE}
            center={marker}
            zoom={16}
            options={MAP_OPTIONS}
          >
            <MarkerF position={marker} />
          </GoogleMap>
        </div>
      )}
    </div>
  );
}
