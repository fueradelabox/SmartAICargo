import React from 'react';
import { Map, AdvancedMarker } from '@vis.gl/react-google-maps';

interface GoogleMapComponentProps {
  mapId?: string;
  center: { lat: number; lng: number };
  zoom: number;
  markerPosition?: { lat: number; lng: number } | null;
  markerTitle?: string;
  style?: React.CSSProperties;
}

const GoogleMapComponent: React.FC<GoogleMapComponentProps> = ({
  mapId = 'smartcargo-map',
  center,
  zoom,
  markerPosition,
  markerTitle,
  style = { height: '100%', minHeight: '300px', width: '100%', borderRadius: '0.75rem', overflow: 'hidden' }
}) => {
  return (
    <div style={style}>
      <Map
        mapId={mapId}
        center={center}
        zoom={zoom}
        gestureHandling={'greedy'} // Allows better interaction on mobile
        disableDefaultUI={false} // Show default controls like zoom, street view
        // Common map options can be added here if needed
        // options={{ styles: mapStylesArray }} // For custom JSON map styles
      >
        {markerPosition && (
          <AdvancedMarker position={markerPosition} title={markerTitle}>
            {/* You can customize the marker icon here if needed */}
            {/* Example: <img src="/path/to/custom-marker.png" width="30" height="30" /> */}
             <span style={{ fontSize: '24px' }}>📍</span> 
          </AdvancedMarker>
        )}
      </Map>
    </div>
  );
};

export default GoogleMapComponent;