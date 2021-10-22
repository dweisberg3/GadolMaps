import React, { useState } from 'react';
import { Icon } from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import "./App.css";
import Navigator from './components/Navigator.js';





function App() {
  const [numOfCardNotShown, setGadolCard] = React.useState(0);
  const [map, setMap] = useState(null);
  const [currentGadol, setCurrentGadol] = useState('');


  const getGadol = (gadol) => {
    setCurrentGadol(gadol);
  }

  return (
    <div>
      <Navigator getGadol = {getGadol} />
    <MapContainer center={[48.148598, 17.107748]} zoom={5} whenCreated={setMap}>
      <TileLayer
        url="https://api.mapbox.com/styles/v1/dweisb/ckuyvslt608od14o4h0cqpblf/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoiZHdlaXNiIiwiYSI6ImNrdGQzZzQ2aTBicGEyb3BoZjI1YjNwaGkifQ.9LTCnUZDmffDzf7BzqVq5w"
        attribution='Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>'
      />
      
    <Marker position={currentGadol.Position}><Popup> {currentGadol.Name} </Popup></Marker>
     {/* { data.map((gadol) => {return <Marker position={gadol.Position}><Popup> {gadol.Name} </Popup></Marker>;})}  */}
     
        </MapContainer>
        

         
        </div>
       
  );
}

export default App;
