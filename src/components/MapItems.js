import React, { useState, useEffect } from 'react';
import { Icon , L,  Layer} from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup, MapConsumer, Tooltip, useMap } from 'react-leaflet';



export default function MapItems({currentGadol, teachers, students, position}) {


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


      const map = useMap()
     console.log(currentGadol.Name)
     map.flyTo(position,5,{ duration: 1.75, easeLinearity: 0.05})
    //  map.setZoom(4)
     console.log(teachers)
     console.log(students)
     
      return ( 
            <div>
              <Marker position={position}>
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