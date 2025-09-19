import React, { useState, useEffect } from 'react';
import { AmericanHistory } from './AmericanHistory';
import { useNavigation } from '../contexts/NavigationContext';
import './History.css';

interface Country {
  id: string;
  name: string;
  flag: string;
  description: string;
  available: boolean;
  resourceCount?: number;
}

const countries: Country[] = [
  {
    id: 'usa',
    name: 'United States',
    flag: '🇺🇸',
    description: 'From colonial times through modern America',
    available: true,
    resourceCount: 45
  },
  {
    id: 'uk',
    name: 'United Kingdom',
    flag: '🇬🇧',
    description: 'British history from ancient times to present',
    available: false
  },
  {
    id: 'france',
    name: 'France',
    flag: '🇫🇷',
    description: 'French history and revolution',
    available: false
  },
  {
    id: 'germany',
    name: 'Germany',
    flag: '🇩🇪',
    description: 'Germanic tribes to modern Germany',
    available: false
  },
  {
    id: 'italy',
    name: 'Italy',
    flag: '🇮🇹',
    description: 'Roman Empire through Renaissance to today',
    available: false
  },
  {
    id: 'spain',
    name: 'Spain',
    flag: '🇪🇸',
    description: 'Spanish empire and exploration',
    available: false
  },
  {
    id: 'russia',
    name: 'Russia',
    flag: '🇷🇺',
    description: 'Tsars, Soviet Union, and modern Russia',
    available: false
  },
  {
    id: 'china',
    name: 'China',
    flag: '🇨🇳',
    description: 'Ancient dynasties to modern China',
    available: false
  },
  {
    id: 'japan',
    name: 'Japan',
    flag: '🇯🇵',
    description: 'Samurai era to modern Japan',
    available: false
  },
  {
    id: 'india',
    name: 'India',
    flag: '🇮🇳',
    description: 'Ancient civilizations to independence',
    available: false
  },
  {
    id: 'egypt',
    name: 'Egypt',
    flag: '🇪🇬',
    description: 'Ancient pharaohs to modern times',
    available: false
  },
  {
    id: 'greece',
    name: 'Greece',
    flag: '🇬🇷',
    description: 'Classical civilization and democracy',
    available: false
  },
  {
    id: 'mexico',
    name: 'Mexico',
    flag: '🇲🇽',
    description: 'Aztecs, Mayans, and modern Mexico',
    available: false
  },
  {
    id: 'canada',
    name: 'Canada',
    flag: '🇨🇦',
    description: 'French and British colonial history',
    available: false
  },
  {
    id: 'brazil',
    name: 'Brazil',
    flag: '🇧🇷',
    description: 'Portuguese colonization to modern Brazil',
    available: false
  },
  {
    id: 'australia',
    name: 'Australia',
    flag: '🇦🇺',
    description: 'Aboriginal history and British settlement',
    available: false
  }
];

export const History: React.FC = () => {
  const navigation = useNavigation();
  const [selectedCountry, setSelectedCountry] = useState<string | null>(navigation.currentState.historyCountry || null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterContinent, setFilterContinent] = useState<string>('all');

  // Sync with navigation state changes
  useEffect(() => {
    setSelectedCountry(navigation.currentState.historyCountry || null);
  }, [navigation.currentState.historyCountry]);

  const selectCountry = (countryId: string | null) => {
    navigation.navigate({
      historyCountry: countryId || undefined
    });
  };

  // If a country is selected, show its specific history component
  if (selectedCountry === 'usa') {
    return (
      <AmericanHistory onBack={() => selectCountry(null)} />
    );
  }

  const filteredCountries = countries.filter(country => {
    const searchMatch = searchQuery === '' || 
      country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      country.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    let continentMatch = true;
    if (filterContinent !== 'all') {
      const continentMap: { [key: string]: string[] } = {
        'americas': ['usa', 'canada', 'mexico', 'brazil'],
        'europe': ['uk', 'france', 'germany', 'italy', 'spain', 'russia', 'greece'],
        'asia': ['china', 'japan', 'india'],
        'africa': ['egypt'],
        'oceania': ['australia']
      };
      continentMatch = continentMap[filterContinent]?.includes(country.id) || false;
    }
    
    return searchMatch && continentMatch;
  });

  return (
    <div className="history-main">
      <div className="history-header">
        <h1>World History</h1>
        <p className="tagline">Explore the history of nations around the world</p>
      </div>

      <div className="search-section">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search countries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>
      </div>

      <div className="continent-filters">
        <button
          className={`continent-filter ${filterContinent === 'all' ? 'active' : ''}`}
          onClick={() => setFilterContinent('all')}
        >
          All Regions
        </button>
        <button
          className={`continent-filter ${filterContinent === 'americas' ? 'active' : ''}`}
          onClick={() => setFilterContinent('americas')}
        >
          Americas
        </button>
        <button
          className={`continent-filter ${filterContinent === 'europe' ? 'active' : ''}`}
          onClick={() => setFilterContinent('europe')}
        >
          Europe
        </button>
        <button
          className={`continent-filter ${filterContinent === 'asia' ? 'active' : ''}`}
          onClick={() => setFilterContinent('asia')}
        >
          Asia
        </button>
        <button
          className={`continent-filter ${filterContinent === 'africa' ? 'active' : ''}`}
          onClick={() => setFilterContinent('africa')}
        >
          Africa
        </button>
        <button
          className={`continent-filter ${filterContinent === 'oceania' ? 'active' : ''}`}
          onClick={() => setFilterContinent('oceania')}
        >
          Oceania
        </button>
      </div>

      <div className="countries-grid">
        {filteredCountries.map(country => (
          <div 
            key={country.id} 
            className={`country-card ${!country.available ? 'disabled' : ''}`}
            onClick={() => country.available && selectCountry(country.id)}
            style={{ cursor: country.available ? 'pointer' : 'not-allowed' }}
          >
            <div className="country-flag">{country.flag}</div>
            <h3>{country.name}</h3>
            <p className="country-description">{country.description}</p>
            {country.resourceCount && (
              <div className="resource-count">
                {country.resourceCount} resources available
              </div>
            )}
            {!country.available && (
              <div className="coming-soon-badge">Coming Soon</div>
            )}
            {country.available && (
              <button className="explore-button">
                Explore History →
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="coming-soon-section">
        <h2>More Countries Coming Soon!</h2>
        <p>We're expanding our history content to cover more nations and civilizations.</p>
        <div className="upcoming-features">
          <div className="upcoming-card">
            <span className="feature-icon">🌍</span>
            <span className="feature-name">African Nations</span>
          </div>
          <div className="upcoming-card">
            <span className="feature-icon">🏛️</span>
            <span className="feature-name">Ancient Civilizations</span>
          </div>
          <div className="upcoming-card">
            <span className="feature-icon">🗺️</span>
            <span className="feature-name">Middle Eastern History</span>
          </div>
          <div className="upcoming-card">
            <span className="feature-icon">🏰</span>
            <span className="feature-name">Medieval Europe</span>
          </div>
        </div>
      </div>
    </div>
  );
};