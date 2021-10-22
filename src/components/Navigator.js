import React, { useState } from 'react';
import { LeafletEventHandlerFnMap, Map } from 'leaflet';
import './Navigator.css'
import {Tab, Tabs, ListGroup} from 'react-bootstrap'
import { MapContainer, TileLayer, Marker, Popup, useMap} from 'react-leaflet';
import '../../node_modules/bootstrap/dist/css/bootstrap.min.css';

const data = [
  {
    "Name": "Rashi",
    "City": "Troyes",
    "Position": [48.29752, 4.07471],
    "Year Born": 1040,
    "Year Died": 1105,
    "Teachers": "",
    "Students": ""
  },
  {
    "Name": "Rif",
    "City": "Fez",
    "Position": [34.059769, -4.96531],
    "Year Born": 1013,
    "Year Died": 1103,
    "Teachers": "",
    "Students": ""
  },
  {
    "Name": "Rambam",
    "City": "Cordova",
    "Position": [37.88472, -4.77913],
    "Year Born": 1138,
    "Year Died": 1205,
    "Teachers": "",
    "Students": ""
  },
  {
    "Name": "Aruch",
    "City": "Rome",
    "Position": [41.902782, 12.496365],
    "Year Born": 1045,
    "Year Died": 1103,
    "Teachers": "",
    "Students": ""
  },
  {
    "Name": "Rabeinu Tam",
    "City": "Ramerupt",
    "Position": [48.51856, 4.2938],
    "Year Born": 1100,
    "Year Died": 1171,
    "Teachers": "",
    "Students": ""
  },
  {
    "Name": "Ibn Ezra",
    "City": "Cordova",
    "Position": [37.88472, -4.77913],
    "Year Born": 1089,
    "Year Died": 1164,
    "Teachers": "",
    "Students": ""
  }
]

function Navigator({getGadol}) {

     return (

<div className= "navigator">
      <h4 >GadolMaps!!</h4>
      <Tabs defaultActiveKey="first">
        <Tab  eventKey="first" title="Rishonim">   <ListGroup> {data.map((gadol) => {
              return  <ListGroup.Item action onClick={ () => getGadol(gadol)}>{gadol.Name}</ListGroup.Item>})}
      </ListGroup>
        
        </Tab>
        <Tab eventKey="second" title="Achronim">
          Hii, I am 2nd tab content
        </Tab>
        </Tabs>
        
     

        </div>
    )
}

export default Navigator;
