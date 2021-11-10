import React, { useState, useEffect } from 'react';
import  L,  { Icon , Layer, Polyline} from 'leaflet';
import { TileLayer, Marker, Popup, Tooltip, useMap } from 'react-leaflet';
import "leaflet-polylinedecorator";
import './Legend.css'
import ArrowheadsPolyline from './ArrowheadsPolyline.js';



export default function MapItems({currentGadol, teachers, students, gadolInfoCounter, isNewGadol}) {



    const redIcon = new Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });
    
      const greenIcon = new Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });

      // let teachersLatPositions = teachers.((teacher) =>  teacher.Position[0])
      // let studentsLatPositions = students.map((student) =>{return student.Position[0]})
      // console.log(teachersLatPositions)
      // studentsLatPositions.push(position[0])
      // teachersLatPositions.push(position[0])
      // const maxLatTeacher = Math.max(teachersLatPositions)
      // const minLatTeacher = Math.min(teachersLatPositions)
      // const maxLatStudent = Math.max(studentsLatPositions)
      // const minLatStudent = Math.min(studentsLatPositions)
     
      const position = currentGadol.Locations[gadolInfoCounter][0]

      const map = useMap()
      let polyLineCordinates = []
      console.log(gadolInfoCounter)
      for (let i = 0; i <= gadolInfoCounter; i++) {
        polyLineCordinates.push(currentGadol.Locations[i][0])
        console.log(currentGadol.Locations[i][0])
      }
      console.log(polyLineCordinates)
      console.log(gadolInfoCounter)

      // useEffect(() => {
      //   if (map) {
      //     const legend = L.control({ position: "bottomright" });
    
      //     legend.onAdd = () => {
      //       const div = L.DomUtil.create("div", "info legend");
      //       div.innerHTML =
      //         "<img src= '/green-marker.png'>" +
      //         "<b>Lorem ipsum dolor sit amet consectetur adipiscing</b>";
      //       return div;
      //     };
    
      //     legend.addTo(map);
      //   }
      // }, [map]); //here add map
      
      const polycords =  [[37.88472, -4.77913],[30.044420,31.235712]]
      
     map.flyTo(position,5,{ duration: 1.75, easeLinearity: 0.05})

    console.log(isNewGadol)
     console.log(teachers)
     console.log(students)
     
      return ( 
            <div>
              <Marker position={position}>
                {/* <Polyline>{polyLineCordinates}</Polyline> */}
                {teachers!= "" ?  teachers.map((teacher) => {
              return <Marker position={teacher.Position} icon = {redIcon}>
              <Tooltip>{teacher.Name}  </Tooltip>  
              
              </Marker>
          }):null}
           <Tooltip>{currentGadol.Name}  </Tooltip> 
          </Marker>

          {students!= "" ?  students.map((student) => {
              return <Marker position={student.Position} icon = {greenIcon}>
              <Tooltip>{student.Name}  </Tooltip>  
              
              </Marker> }):null}
             <ArrowheadsPolyline positions={ polyLineCordinates } arrowheads={{ size: '2%'}}/> 
            </div>)
    } 
  
     
  

    //         <div>
//              {(map) => {
         
         
//           return <Marker position={[48.148598, 17.107748]}>
//           <Tooltip>{currentGadol.Name}  </Tooltip>            
//           </Marker>}}
//         </div>
//     )
// }


// {() => currentGadol.Teachers.map((teacher) => {
//     return <Marker position={teacher.Position} icon = {redIcon}>
//     <Tooltip>{teacher}  </Tooltip>  
    
//     </Marker>
// })} 

//    {() => currentGadol.Students.map((student) => {
//     return <Marker position={student.Position} icon = {greenIcon}>
//     <Tooltip>{student}  </Tooltip>  
    
//     </Marker>

  {/* {() => currentGadol.Students.map((student) => {
              return <Marker position={student.Position} icon = {greenIcon}>
              <Tooltip>{student}  </Tooltip>  
             <Tooltip>{currentGadol.Name}  </Tooltip>                    
            </Marker>  */}