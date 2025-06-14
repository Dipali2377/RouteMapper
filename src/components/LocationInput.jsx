import React, { useState, useRef, useEffect } from 'react';

export default function LocationInput({ 
  placeholder, 
  value, 
  onChange, 
  onLocationSelect,
  googleMaps 
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const autocompleteService = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (googleMaps && !autocompleteService.current) {
      autocompleteService.current = new googleMaps.places.AutocompleteService();
    }
  }, [googleMaps]);

  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    onChange(inputValue);

    if (inputValue.length > 2 && autocompleteService.current) {
      autocompleteService.current.getPlacePredictions(
        {
          input: inputValue,
          types: ['geocode']
        },
        (predictions, status) => {
          if (status === googleMaps.places.PlacesServiceStatus.OK && predictions) {
            setSuggestions(predictions);
            setShowSuggestions(true);
          } else {
            setSuggestions([]);
            setShowSuggestions(false);
          }
        }
      );
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    onChange(suggestion.description);
    onLocationSelect(suggestion);
    setShowSuggestions(false);
  };

  const handleBlur = () => {       
    setTimeout(() => setShowSuggestions(false), 150);
  };

  return (
    <div className="location-input-container">
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={handleInputChange}
        onBlur={handleBlur}
        onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
        className="location-input"
      />
      {showSuggestions && suggestions.length > 0 && (
        <div className="suggestions-dropdown">
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.place_id}
              className="suggestion-item"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <div className="suggestion-main">
                {suggestion.structured_formatting.main_text}
              </div>
              <div className="suggestion-secondary">
                {suggestion.structured_formatting.secondary_text}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}