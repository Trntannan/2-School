import React from 'react';
import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api';

// Updated Map component to accept props
const Map = ({ googleMapsApiKey, groups, mapContainerStyle, center }) => {
  const libraries = ['places'];

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: googleMapsApiKey,
    libraries,
  });

  if (loadError) {
    return <div>Error loading maps</div>;
  }

  if (!isLoaded) {
    return <div>Loading maps</div>;
  }

  return (
    <div style={mapContainerStyle}>
      <GoogleMap mapContainerStyle={mapContainerStyle} zoom={10} center={center}>
        {groups.map((group, index) => (
          <Marker key={index} position={group.meetLocation} />
        ))}
      </GoogleMap>
    </div>
  );
};

// Define default props in case they are not provided
Map.defaultProps = {
  googleMapsApiKey: '',
  groups: [],
  mapContainerStyle: { width: '100vw', height: '100vh' },
  center: { lat: 7.2905715, lng: 80.6337262 }, // default center coordinates
};

export default Map;