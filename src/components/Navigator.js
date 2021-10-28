import React, { useState } from 'react';
import { LeafletEventHandlerFnMap, Map } from 'leaflet';
import './Navigator.css'
import {Tab, Tabs, ListGroup} from 'react-bootstrap'
import { MapContainer, TileLayer, Marker, Popup, useMap} from 'react-leaflet';
import '../../node_modules/bootstrap/dist/css/bootstrap.min.css';



function Navigator({getGadol, rishonim, achronim}) {

     return (

<div className= "navigator">
      <h4 >GadolMaps</h4>
      <Tabs defaultActiveKey="first">
        <Tab  eventKey="first" title="Rishonim">   <ListGroup> {rishonim.map((gadol) => {
              return  <ListGroup.Item action onClick={ () => getGadol(gadol)}>{gadol.Name}</ListGroup.Item>})}
      </ListGroup>
        
        </Tab>
        <Tab  eventKey="second" title="Achronim">   <ListGroup> {achronim.map((gadol) => {
              return  <ListGroup.Item action onClick={ () => getGadol(gadol)}>{gadol.Name}</ListGroup.Item>})}
      </ListGroup>
        
        </Tab>
        </Tabs>
        
     

        </div>
    )
}

export default Navigator;
