import React, { useState } from 'react';
import { Icon } from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup, MapConsumer, Tooltip, useMap } from 'react-leaflet';
import "./App.css";
import Navigator from './components/Navigator.js';
import GadolBox from './components/GadolBox';
import HorizontalLinearStepper from './components/infoBar.js';
import MapItems from './components/MapItems';







const rishonim = [

  {
    "Name": "Rambam",
    "City": "Cordova, Spain",
    "Locations": [[[37.88472, -4.77913],"Rambam was born here"],[[30.044420,31.235712],"He died in Cairo"]],
    "Year Born": 1138,
    "Year Died": 1205,
    "Teachers": ["R' Maimon ben Yosef HaDayan"],
    "Students": ["Sefer HaMitzvos", "Commentary on the Mishnah", "Yad HaChazakah"]
  }]
// const rishonim = [
//   {
//     "Name": "Rashi",
//     "City": "Troyes",
//     "Position": [48.29752, 4.07471],
//     "Year Born": 1040,
//     "Year Died": 1105,
//     "Teachers": ["Rabbeinu Gershom Me'or HaGolah", "R' Yaakov ben Yakar"],
//     "Students": ["Rivan", "R' Meir ben Shmuel"],
//     "Works" : ["Commentary on the Torah", "Commentary on the Talmud"]
//   },
//   {
//     "Name": "Rif",
//     "City": "Fez",
//     "Position": [34.059769, -4.96531],
//     "Year Born": 1013,
//     "Year Died": 1103,
//     "Teachers": ["Nissim ben Yacov", "Chananel ben Chushiel"],
//     "Students": ["Yoseph ibn Migash", "Yehudah Halevi"],
//     "Works": ["Sefer Hahalacha"]
//   },
//   {
//     "Name": "Rabbeinu Yonah",
//     "City": "Gerona, Spain",
//     "Position": [38.919971, -6.942800],
//     "Year Born": 1180,
//     "Year Died": 1263,
//     "Teachers": ["R' Shlomo of Montpellier"],
//     "Students": ["Rashba"],
//     "Works": ["Sharrei Teshuvah"]
//   },
//   {
//     "Name": "Ramban",
//     "City": "Gerona, Spain",
//     "Position": [38.919971, -6.942800],
//     "Year Born": 1194,
//     "Year Died": 1270,
//     "Teachers": ["R' Yehuda ben Yakar"],
//     "Students": ["Rashba"],
//     "Works": ["Chidushim al HaShas", "Commentary on the Torah"]
//   },
//   {
//     "Name": "Rashba",
//     "City": "Barcelona",
//     "Position": [41.385063, 2.173404],
//     "Year Born": 1235,
//     "Year Died": 1310,
//     "Teachers": ["Ramban","Rabbeinu Yonah"],
//     "Students": ["Rif","Ritva", "Rabbeinu Bachya"],
//     "Works": ["Chidushim al HaShas", "Responsa", "Toras HaBayis"]
//   },
//   {
//     "Name": "Rambam",
//     "City": "Cordova, Spain",
//     "Locations": [[[37.88472, -4.77913],"Rambam was born here"],[[30.044420,31.235712],"He died in Cairo"]],
//     "Year Born": 1138,
//     "Year Died": 1205,
//     "Teachers": ["R' Maimon ben Yosef HaDayan"],
//     "Students": ["Sefer HaMitzvos", "Commentary on the Mishnah", "Yad HaChazakah"]
//   },
//   {
//     "Name": "Rabbeinu Tam",
//     "City": "Ramerupt",
//     "Position": [48.51856, 4.2938],
//     "Year Born": 1100,
//     "Year Died": 1171,
//     "Teachers": ["Rambam","Rif"],
//     "Students": ["Rashba","Rashi"]
//   },
  
// ]

const achronim = [
  {
    "Name": "Maharal",
    "City": "Prague",
    "Locations": [[[50.075539, 14.437800],"Born in 1512"]],
    "Year Born": 1512,
    "Year Died": 1609,
    "Teachers": [],
    "Students": []
  },
  {
    "Name": "Vilna Gaon",
    "City": "Vilna",
    "Locations": [[[54.687157, 25.279652], "Born in 1720"]],
    "Year Born": 1720,
    "Year Died": 1796,
    "Teachers": [],
    "Students": []
  },
  {
    "Name": "Maharsha",
    "City": "Ostra",
    "Locations": [[[50.329048, 26.524920], "Born in 1555"]],
    "Year Born": 1555,
    "Year Died": 1631,
    "Teachers": [],
    "Students": []
  },
  {
    "Name": "Rema",
    "City": "Krakow",
    "Locations": [[[50.054810, 19.927840], "Born in 1530"]],
    "Year Born": 1530,
    "Year Died": 1572,
    "Teachers": [],
    "Students": []
  },
  


]



function App() {
  const [numOfCardNotShown, setGadolCard] = React.useState(0);
  const [map, setMap] = useState(null);
  const [currentGadol, setCurrentGadol] = useState(rishonim[0]);
  const [currentPosition, setCurrentPosition] = useState([37.88472, -4.77913])
  const [center, setCenter] = useState([37.88472, -4.77913])
  const [isNewGadol, setisNewGadol] = useState(false)
  const [gadolInfoCounter, setGadolInfoCounter] = useState(0)

  const getGadol = (gadol) => {
    console.log(gadol.Name);
    setCurrentGadol(gadol);
    setCurrentPosition(gadol.Locations[0][0]);
    setCenter(gadol.Locations[0][0]);
    setisNewGadol(true);
    setGadolInfoCounter(0);
  }

  const increaseGadolInfoCounter = () => {
      setGadolInfoCounter(gadolInfoCounter + 1);
  }



  const getTimeLinePosition = (timeLinePosition) => {
    setCurrentPosition(timeLinePosition);
  }
  let teachers = ""
  let students = ""
  if(rishonim.includes(currentGadol)){
     teachers = rishonim.filter(gadol => gadol.Students.includes(currentGadol.Name))
   students = rishonim.filter(gadol => gadol.Teachers.includes(currentGadol.Name))
  }
  else if (achronim.includes(currentGadol)) {
     teachers = achronim.filter(gadol => gadol.Students.includes(currentGadol.Name))
    students = achronim.filter(gadol => gadol.Teachers.includes(currentGadol.Name))
  } 
 


  return (
    <>
    
       <Navigator getGadol = {getGadol} rishonim = {rishonim} achronim = {achronim} />
     
       <GadolBox  currentGadol = {currentGadol} getGadol = {getGadol} teachers = {teachers} students = {students} getTimeLinePosition = {getTimeLinePosition} gadolInfoCounter = {gadolInfoCounter} increaseGadolInfoCounter = {increaseGadolInfoCounter}/>
    <MapContainer center={currentPosition} zoom={5}> 
    <TileLayer
        url="https://api.mapbox.com/styles/v1/dweisb/ckuyvslt608od14o4h0cqpblf/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoiZHdlaXNiIiwiYSI6ImNrdGQzZzQ2aTBicGEyb3BoZjI1YjNwaGkifQ.9LTCnUZDmffDzf7BzqVq5w"
        attribution='Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>'
      />
      
         <MapItems currentGadol= {currentGadol}  teachers = {teachers} students = {students} position = {currentPosition} gadolInfoCounter = {gadolInfoCounter} isNewGadol = {isNewGadol}/> 
           
        </MapContainer>
         
        </>
       
  );
}

export default App;
