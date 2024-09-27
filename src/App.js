import React, { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [suggestions, setSuggestions] = useState([]);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [hasTyped, setHasTyped] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [query]);

  useEffect(() => {
    if (debouncedQuery) {
      const fetchData = async () => {
        try {
          const response = await fetch(
            `https://www.themealdb.com/api/json/v1/1/search.php?s=${debouncedQuery}`
          );
          const data = await response.json();
          setSuggestions(data.meals || []);
        } catch (error) {
          console.error('Error fetching data:', error);
          setSuggestions([]);
        }
      };
      fetchData();
      setIsDropdownVisible(true);
    } else {
      setSuggestions([]);
      setIsDropdownVisible(false);
    }
  }, [debouncedQuery]);

  const handleSuggestionClick = (mealName) => {
    setQuery(mealName);
    setIsDropdownVisible(false);
    setHighlightedIndex(-1);
  };

  const handleInputFocus = () => {
    setIsDropdownVisible(true);
    setHasTyped(false);
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    setHasTyped(true);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prevIndex) => {
        const newIndex = prevIndex < suggestions.length - 1 ? prevIndex + 1 : prevIndex;
        scrollToSuggestion(newIndex);
        return newIndex;
      });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prevIndex) => {
        const newIndex = prevIndex > 0 ? prevIndex - 1 : prevIndex;
        scrollToSuggestion(newIndex);
        return newIndex;
      });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0) {
        handleSuggestionClick(suggestions[highlightedIndex].strMeal);
      }
    }
  };

  const scrollToSuggestion = (index) => {
    if (dropdownRef.current) {
      const suggestionElement = dropdownRef.current.children[index];
      if (suggestionElement) {
        suggestionElement.scrollIntoView({
          block: 'nearest',
        });
      }
    }
  };

  const handleClickOutside = (event) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target) &&
      inputRef.current &&
      !inputRef.current.contains(event.target)
    ) {
      setQuery(""); 
      setIsDropdownVisible(false);
      setHighlightedIndex(-1); 
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="autocomplete-container">
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        placeholder="Search for meals..."
        onFocus={handleInputFocus}
        onKeyDown={handleKeyDown}
        ref={inputRef} 
        className="autocomplete-input"
      />

      {isDropdownVisible && suggestions.length > 0 && (
        <div className="dropdown" ref={dropdownRef}>
          {suggestions.map((meal, index) => (
            <div
              key={meal.idMeal}
              className={`dropdown-item ${highlightedIndex === index ? 'highlighted' : ''}`}
              onClick={() => handleSuggestionClick(meal.strMeal)}
            >
              {meal.strMeal}
            </div>
          ))}
        </div>
      )}

      {isDropdownVisible && hasTyped && suggestions.length === 0 && (
        <div className="dropdown no-suggestions">No suggestions found</div>
      )}
    </div>
  );
}

export default App;
