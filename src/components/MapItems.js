import React, { useEffect } from "react";
import L  from "leaflet";
import { Marker,  useMap, Tooltip} from "react-leaflet";
import "leaflet-polylinedecorator";

import ArrowheadsPolyline from "./ArrowheadsPolyline.js";

export default function MapItems({
  currentGadol,
  gadolInfoCounter, position,
  
}) {
  // const redIcon = new Icon({
  //   iconUrl:
  //     "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  //   shadowUrl:
  //     "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  //   iconSize: [25, 41],
  //   iconAnchor: [12, 41],
  //   popupAnchor: [1, -34],
  //   shadowSize: [41, 41],
  // });

  // const greenIcon = new Icon({
  //   iconUrl:
  //     "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  //   shadowUrl:
  //     "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  //   iconSize: [25, 41],
  //   iconAnchor: [12, 41],
  //   popupAnchor: [1, -34],
  //   shadowSize: [41, 41],
  // });

 
  // const position = currentGadol.Locations[gadolInfoCounter][0];
  console.log(position)
  const map = useMap();
  // let polyLineCordinates = [];
  // console.log(gadolInfoCounter);
  // for (let i = 0; i <= gadolInfoCounter; i++) {
  //   polyLineCordinates.push(currentGadol.Locations[i][0]);
  //   // console.log(currentGadol.Locations[i][0]);
  // }
  // console.log(polyLineCordinates);
  // console.log(gadolInfoCounter);

  useEffect(() => {
    
    map.setMaxZoom(6);
    map.setMinZoom(4);
    map.setMaxBounds([
      [8.12884, -49.72852],
      [66.28807, 76.55273],
    ]);

    // L.control
    //   .zoom({
    //     position: "bottomright",
    //   })
    
      // .addTo(map);
  }, [map]); //here add map

 
  // useEffect(() => {
  //   map.panInsideBounds(polyLineCordinates,{ duration: 1.75, easeLinearity: 0.05, maxZoom : 3 })
   
  // }, [position])

  map.flyTo(position, 5, { duration: 1.75, easeLinearity: 0.05 });

  // console.log(isNewGadol);
  // console.log(teachers);
  // console.log(students);
  // console.log(currentGadol.TeachersNamesOnly)

  return (
    <div>
       <Marker position={position}>
      <Tooltip>{currentGadol.Name}</Tooltip>
      </Marker>

      {/* <ArrowheadsPolyline
        positions={polyLineCordinates}
        arrowheads={{ size: '15px' }}
      /> */}
    </div>
  );
}
