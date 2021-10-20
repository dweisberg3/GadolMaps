import React from 'react';
import { Icon } from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import "./App.css";

function App() {
  return (
    <MapContainer center={[48.148598, 17.107748]} zoom={5}>
      <TileLayer
        url="https://api.mapbox.com/styles/v1/dweisb/ckuyvslt608od14o4h0cqpblf/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoiZHdlaXNiIiwiYSI6ImNrdGQzZzQ2aTBicGEyb3BoZjI1YjNwaGkifQ.9LTCnUZDmffDzf7BzqVq5w"
        attribution='Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>'
      />
      </MapContainer>
  );
}

export default App;
