import React, { useEffect} from 'react';
import L from 'leaflet';
import './Navigator.css'
import {Tab, Tabs, ListGroup} from 'react-bootstrap'
import { MapContainer, TileLayer, Marker, Popup, useMap} from 'react-leaflet';
import '../../node_modules/bootstrap/dist/css/bootstrap.min.css';



function Navigator({getGadol, rishonim, achronim}) {


  // const map = useMap()


  // useEffect(() => {
  //   if (map) {
  //     const navigator = L.control({ position: "bottomright" });

  //     navigator.onAdd = () => {
  //       const div = L.DomUtil.create("div", "navigator");
      
  //       return div;
  //     };

  //     navigator.addTo(map);
  //   }
  // }, [map]); //here add map
     return (

<div className= "navigator">
      <h4 >GadolMaps</h4>
      <Tabs defaultActiveKey="first">
        <Tab  eventKey="first" title="Rishonim">   <ListGroup variant = "flush"> {rishonim.map((gadol) => {
              return  <ListGroup.Item action onClick={ () => getGadol(gadol)}>{gadol.Name}</ListGroup.Item>})}
      </ListGroup>
        
        </Tab>
        <Tab  eventKey="second" title="Achronim">   <ListGroup variant = "flush"> {achronim.map((gadol) => {
              return  <ListGroup.Item action onClick={ () => getGadol(gadol)}>{gadol.Name}</ListGroup.Item>})}
      </ListGroup>
        
        </Tab>
        </Tabs>
        
     

        </div>
    )
}

export default Navigator;
