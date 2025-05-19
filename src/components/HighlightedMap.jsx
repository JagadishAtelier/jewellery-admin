import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import countriesGeoJSON from '../data/world-countries.json';
import { useEffect } from 'react';
import L from 'leaflet';

const HighlightedMap = ({ countriesData }) => {
  const getCountryColor = (code) => {
    const country = countriesData.find((c) => c.code === code);
    return country ? country.color : '#e3ecdd'; // fallback grey
  };

  const styleFeature = (feature) => {
    const code = feature.properties['ISO3166-1-Alpha-2'];
    const color = getCountryColor(code);
    return {
      fillColor: color,
      weight: 1,
      color: '#f4f4f4',
      opacity: 1,
      fillOpacity: 0.8,
    };
  };

  const onEachCountry = (feature, layer) => {
    const code = feature.properties['ISO3166-1-Alpha-2'];
    const country = countriesData.find((c) => c.code === code);
    if (country) {
      layer.bindTooltip(`${country.name}`, {
        sticky: true,
        direction: 'top',
        className: 'leaflet-tooltip-own',
      });
    }
  };

  const FitHighlightedCountries = () => {
    const map = useMap();

    useEffect(() => {
      const highlightedFeatures = countriesGeoJSON.features.filter((feature) =>
        countriesData.some((c) => c.code === feature.properties['ISO3166-1-Alpha-2'])
      );

      if (highlightedFeatures.length > 0) {
        const geoJsonLayer = L.geoJSON(highlightedFeatures);
        map.fitBounds(geoJsonLayer.getBounds(), {
          padding: [20, 20],
        });
      }
    });

    return null;
  };

  return (
  <div
  className="bg-light rounded position-relative text-center mb-4 map-container"
  style={{ height: '250px' }}
>

      <div className="position-absolute top-0 start-0 m-2 bg-dark text-white rounded p-2 small text-start z-3">
        <div>Revenue: <strong>6.12M</strong></div>
        <div>Income: <span className="text-success">58% ▲</span></div>
        <div>Growth: <span className="text-success">30% ▲</span></div>
      </div>

      <MapContainer
        center={[20, 0]}
        zoom={1.5}
        minZoom={0}
        maxZoom={5}
        zoomControl={false}
        scrollWheelZoom={true}
        style={{
          height: '100%',
          width: '100%',
          borderRadius: '10px',
          border: '0',
          zIndex: '1',
          backgroundColor: 'white',
        }}
        attributionControl={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <GeoJSON
          data={countriesGeoJSON}
          style={styleFeature}
          onEachFeature={onEachCountry}
        />
        <FitHighlightedCountries />
      </MapContainer>
    </div>
  );
};

export default HighlightedMap;
