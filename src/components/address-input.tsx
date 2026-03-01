"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Restaurant } from "@prisma/client";
import { Loader2, MapPin, Navigation } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export interface AddressData {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  latitude?: number;
  longitude?: number;
  formattedAddress: string;
}

interface AddressInputProps {
  value: AddressData;
  onChange: (address: AddressData) => void;
  onValidationChange?: (isValid: boolean) => void;
  className?: string;
  required?: boolean;
  placeholder?: string;
  restaurant: Restaurant;
  label?: string;
  showCurrentLocation?: boolean;
}

interface GooglePlacesResult {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

export function AddressInput({
  value,
  onChange,
  onValidationChange,
  className,
  required = false,
  placeholder = "Enter your address",
  label = "Address",
  showCurrentLocation = true,
}: AddressInputProps) {
  const [query, setQuery] = useState(value.formattedAddress || "");
  const [suggestions, setSuggestions] = useState<GooglePlacesResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [manualEntry, setManualEntry] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteService =
    useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);

  // Initialize Google Places API
  useEffect(() => {
    if (typeof window !== "undefined" && window.google) {
      autocompleteService.current =
        new window.google.maps.places.AutocompleteService();
      const mapDiv = document.createElement("div");
      const map = new window.google.maps.Map(mapDiv);
      placesService.current = new window.google.maps.places.PlacesService(map);
    }
  }, []);

  // Validate address completeness
  const validateAddress = (address: AddressData) => {
    const isValid = !!(
      address.street &&
      address.city &&
      address.state &&
      address.country
    );
    onValidationChange?.(isValid);
    return isValid;
  };

  // Update validation when value changes
  useEffect(() => {
    validateAddress(value);
  }, [value, onValidationChange]);

  // Debounced search for address suggestions
  useEffect(() => {
    if (!query || query.length < 3 || manualEntry) {
      setSuggestions([]);
      return;
    }

    const timeoutId = setTimeout(() => {
      if (autocompleteService.current) {
        setIsLoading(true);
        autocompleteService.current.getPlacePredictions(
          {
            input: query,
            types: ["address"],
            componentRestrictions: { country: ["us", "ca", "gb", "au"] }, // Adjust countries as needed
          },
          (predictions, status) => {
            setIsLoading(false);
            if (
              status === window.google.maps.places.PlacesServiceStatus.OK &&
              predictions
            ) {
              setSuggestions(predictions);
              setShowSuggestions(true);
            } else {
              setSuggestions([]);
            }
          },
        );
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, manualEntry]);

  // Get place details and parse address components
  const selectPlace = (placeId: string) => {
    if (!placesService.current) return;

    placesService.current.getDetails(
      {
        placeId,
        fields: ["formatted_address", "geometry", "address_components"],
      },
      (
        place: google.maps.places.PlaceResult | null,
        status: google.maps.places.PlacesServiceStatus,
      ) => {
        if (
          status === window.google.maps.places.PlacesServiceStatus.OK &&
          place
        ) {
          const addressData = parseAddressComponents(place);
          onChange(addressData);
          setQuery(addressData.formattedAddress);
          setShowSuggestions(false);
        }
      },
    );
  };

  // Parse Google Places address components
  const parseAddressComponents = (
    place: google.maps.places.PlaceResult,
  ): AddressData => {
    const components = place.address_components ?? [];

    let streetNumber = "";
    let route = "";
    let fallbackStreet = "";
    let city = "";
    let state = "";
    let postalCode = "";
    let country = "";

    components.forEach((component) => {
      const types = component.types;

      // Proper street structure (if available)
      if (types.includes("street_number")) {
        streetNumber = component.long_name;
      }

      if (types.includes("route")) {
        route = component.long_name;
      }

      // 🔥 Fallback for Pakistan (component with no types)
      if (types.length === 0 && !fallbackStreet) {
        fallbackStreet = component.long_name;
      }

      if (
        types.includes("locality") ||
        types.includes("sublocality") ||
        types.includes("postal_town")
      ) {
        if (!city) city = component.long_name;
      }

      if (types.includes("administrative_area_level_1")) {
        state = component.long_name;
      }

      if (types.includes("postal_code")) {
        postalCode = component.long_name;
      }

      if (types.includes("country")) {
        country = component.long_name;
      }
    });

    // Build street properly
    let street = "";

    // Always prefer full formatted address
    if (place.formatted_address) {
      street = place.formatted_address;
    }
    // If somehow formatted_address missing
    else if (streetNumber || route) {
      street = `${streetNumber} ${route}`.trim();
    }
    // Final fallback
    else if (fallbackStreet) {
      street = fallbackStreet;
    }

    const lat = place.geometry?.location?.lat?.();
    const lng = place.geometry?.location?.lng?.();

    return {
      street,
      city,
      state,
      postalCode,
      country,
      latitude: lat ?? 0,
      longitude: lng ?? 0,
      formattedAddress: place.formatted_address ?? "",
    };
  };

  // Get current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by this browser.");
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        // Reverse geocode to get address
        if (window.google) {
          const geocoder = new window.google.maps.Geocoder();

          geocoder.geocode(
            { location: { lat: latitude, lng: longitude } },
            (results, status) => {
              setIsGettingLocation(false);

              if (status === "OK" && results && results.length > 0) {
                // 🔥 Try to find result that includes postal code
                const resultWithPostal = results.find((r) =>
                  r.address_components.some((c) =>
                    c.types.includes("postal_code"),
                  ),
                );

                const bestResult = resultWithPostal || results[0];

                const addressData = parseAddressComponents({
                  formatted_address: bestResult.formatted_address,
                  geometry: bestResult.geometry,
                  address_components: bestResult.address_components,
                } as google.maps.places.PlaceResult);

                onChange(addressData);
                setQuery(addressData.formattedAddress);
              }
            },
          );
        }
      },
      (error) => {
        setIsGettingLocation(false);
        console.error("Error getting location:", error);
        toast.error(
          "Unable to get your current location. Please enter your address manually.",
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 },
    );
  };

  // Handle manual address input
  const handleManualInput = (field: keyof AddressData, fieldValue: string) => {
    const updatedAddress = { ...value, [field]: fieldValue };

    // Update formatted address when manual fields change
    if (field !== "formattedAddress") {
      updatedAddress.formattedAddress = [
        updatedAddress.street,
        updatedAddress.city,
        updatedAddress.state,
        updatedAddress.postalCode,
        updatedAddress.country,
      ]
        .filter(Boolean)
        .join(", ");
    }

    onChange(updatedAddress);
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="address-search">
            {label} {required && <span className="text-red-500">*</span>}
          </Label>
          <div className="flex gap-2">
            {showCurrentLocation && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={getCurrentLocation}
                disabled={isGettingLocation}
                // style={{
                //     backgroundColor: restaurant.button_text_icons_color || "black",
                //     color: restaurant.accent_color || "black",
                //     borderColor: restaurant.accent_color || "black",
                // }}
                className="text-xs bg-transparent cursor-pointer"
              >
                {isGettingLocation ? (
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                ) : (
                  <Navigation className="h-3 w-3 mr-1" />
                )}
                Current Location
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              // style={{
              //     color: restaurant.button_text_icons_color || "black",
              //     backgroundColor: restaurant.accent_color || "black",
              //     borderColor: restaurant.accent_color || "black",
              // }}
              onClick={() => setManualEntry(!manualEntry)}
              className="text-xs cursor-pointer"
            >
              {manualEntry ? "Use Search" : "Manual Entry"}
            </Button>
          </div>
        </div>

        {!manualEntry ? (
          <div className="relative">
            <div className="relative">
              <MapPin
                // style={{
                //     color: restaurant.accent_color || "black"
                // }}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4"
              />
              <Input
                ref={inputRef}
                id="address-search"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={placeholder}
                className="pl-10 "
                // style={{
                //     color: restaurant.accent_color || "black",
                //     borderColor: restaurant.accent_color || "black",
                //     // @ts-expect-error due to types
                //     '--tw-ring-color': restaurant.accent_color, // dynamic ring color
                // }}
                autoComplete="street-address"
              />
              {isLoading && (
                <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
              )}
            </div>

            {showSuggestions && suggestions.length > 0 && (
              <Card
                // style={{
                //     backgroundColor: restaurant.accent_color || "black",
                // }}
                className="absolute z-50 w-full mt-1 max-h-60 overflow-y-auto border-none"
              >
                <CardContent className="p-0">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion.place_id}
                      // style={{
                      //     borderColor: restaurant.button_text_icons_color || "black",
                      // }}
                      type="button"
                      className="w-full text-left p-3 hover:opacity-50 cursor-pointer border-b last:border-b-0 focus:outline-none"
                      onClick={() => selectPlace(suggestion.place_id)}
                    >
                      <div
                        // style={{
                        //     color: restaurant.button_text_icons_color || "black",
                        // }}
                        className="font-medium text-sm"
                      >
                        {suggestion.structured_formatting.main_text}
                      </div>
                      <div
                        // style={{
                        //     color: restaurant.button_text_icons_color || "black",
                        // }}
                        className="text-xs text-gray-500"
                      >
                        {suggestion.structured_formatting.secondary_text}
                      </div>
                    </button>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <div
            // style={{
            //     color: restaurant.accent_color || "black",
            // }}
            className="grid grid-cols-1 gap-4"
          >
            <div className="space-y-2">
              <Label htmlFor="street">
                Street Address{" "}
                {required && <span className="text-red-500">*</span>}
              </Label>
              <Input
                id="street"
                value={value.street}
                onChange={(e) => handleManualInput("street", e.target.value)}
                placeholder="123 Main Street"
                className=""
                // style={{
                //     color: restaurant.accent_color || "black",
                //     borderColor: restaurant.accent_color || "black",
                //     // @ts-expect-error due to types
                //     '--tw-ring-color': restaurant.accent_color, // dynamic ring color
                // }}
                autoComplete="address-line1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">
                  City {required && <span className="text-red-500">*</span>}
                </Label>
                <Input
                  id="city"
                  className=""
                  // style={{
                  //     color: restaurant.accent_color || "black",
                  //     borderColor: restaurant.accent_color || "black",
                  //     // @ts-expect-error due to types
                  //     '--tw-ring-color': restaurant.accent_color, // dynamic ring color
                  // }}
                  value={value.city}
                  onChange={(e) => handleManualInput("city", e.target.value)}
                  placeholder="New York"
                  autoComplete="address-level2"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">
                  State {required && <span className="text-red-500">*</span>}
                </Label>
                <Input
                  id="state"
                  className=""
                  // style={{
                  //     color: restaurant.accent_color || "black",
                  //     borderColor: restaurant.accent_color || "black",
                  //     // @ts-expect-error due to types
                  //     '--tw-ring-color': restaurant.accent_color, // dynamic ring color
                  // }}
                  value={value.state}
                  onChange={(e) => handleManualInput("state", e.target.value)}
                  placeholder="NY"
                  autoComplete="address-level1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="postalCode">
                  ZIP Code {required && <span className="text-red-500">*</span>}
                </Label>
                <Input
                  id="postalCode"
                  className=""
                  // style={{
                  //     color: restaurant.accent_color || "black",
                  //     borderColor: restaurant.accent_color || "black",
                  //     // @ts-expect-error due to types
                  //     '--tw-ring-color': restaurant.accent_color, // dynamic ring color
                  // }}
                  value={value.postalCode}
                  onChange={(e) =>
                    handleManualInput("postalCode", e.target.value)
                  }
                  placeholder="10001"
                  autoComplete="postal-code"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">
                  Country {required && <span className="text-red-500">*</span>}
                </Label>
                <Input
                  id="country"
                  className=""
                  // style={{
                  //     color: restaurant.accent_color || "black",
                  //     borderColor: restaurant.accent_color || "black",
                  //     // @ts-expect-error due to types
                  //     '--tw-ring-color': restaurant.accent_color, // dynamic ring color
                  // }}
                  value={value.country}
                  onChange={(e) => handleManualInput("country", e.target.value)}
                  placeholder="United States"
                  autoComplete="country-name"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
