import React, { useState, useEffect, useRef} from "react";
import axios from 'axios'

import {  MapContainer,  TileLayer, ZoomControl } from "react-leaflet";
import "./App.css";
import Navigator from "./components/Navigator.js";
import GadolBox from "./components/GadolBox.js";

import MapItems from "./components/MapItems.js";

const App = () => {
  const [rishonim, setRishonim] = useState([]);
  const [achronim, setAchronim] = useState([]);
  
  const [currentGadol, setCurrentGadol] = useState([]);
  const [currentPosition, setCurrentPosition] = useState([37.88472, -4.77913]);
  const [error, setError] = useState(null);
  const [language, setLanguage] = useState("english");
  const [names,setNames] = useState(null);
  const [axiosLoaded, setAxiosLoaded] = useState(false);
  const [gadolTeachers, setGadolTeachers] = useState([])
  const [gadolStudents, setGadolStudents] = useState([])
  const [gadolEvents, setGadolEvents] = useState([])
  const [gadol, setGadol] = useState({"name" : "Rashi"})
  const [gadolWorks, setGadolWorks] = useState([])
  const [currentEvent, setCurrentEvent] = useState(0)
  const [eventText, setEventText] = useState("")
  const [isMaxEvent, setIsMaxEvent] = useState(false)
  const [isMinEvent, setIsMinEvent] = useState(true)
  const isNewGadolRef = useRef(true)
  


  useEffect(() => {
    axios.get("http://localhost:8080").then((response) => {
      // console.log(response.data);
      // console.log(response.data[0].name)
      // console.log(typeof response.data);
      setNames(response.data);
      setGadol(response.data[0])
      setAxiosLoaded(true)
    });
    
  }, [])

  const handleGadolChange = (gadol) => {
    
    isNewGadolRef.current = true;
    setGadol(gadol) //set Gadol triggers the change in variable gadol with triggers the useEffect below
  }

  useEffect(() => {
    getGadol(gadol);
   }, [gadol]);

   
   
  const getGadol = async (gadol) => {

    setCurrentEvent(0)
   
    const events = await  axios.get("http://localhost:8080/events", {params : {name : gadol.name}})
    
    setGadolEvents(events.data)
    setEventText(events.data[0].event_text)
    setIsMaxEvent(false)
    setIsMinEvent(true)
    
    const theGadol = await axios.get("http://localhost:8080/gadol" , {params : {name : gadol.name}} )
    setCurrentPosition([theGadol.data.latitude, theGadol.data.longitude]);
    // setGadol(theGadol.data)

    const teachers = await axios.get("http://localhost:8080/teachers", {params : {name : gadol.name}})
      // console.log(teachers.data);
      setGadolTeachers(teachers.data);
      
  
    const students = await axios.get("http://localhost:8080/students", {params : {name : gadol.name}})
      // console.log(students.data);
      setGadolStudents(students.data);

    const works = await  axios.get("http://localhost:8080/works", {params : {name : gadol.name}})
      // console.log(works.data);
      setGadolWorks(works.data);
     
  };

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////Below is where event changing happens//////////////////////////////////////////////////////

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  const handleEventChange = (increase) => {
    
    isNewGadolRef.current = false;
    if(increase){
      setCurrentEvent(currentEvent + 1)
    }
    else{
      setCurrentEvent(currentEvent - 1)
    }
    
  }

  useEffect(() => {

    const newGadol = isNewGadolRef.current
    
    if(!newGadol){
      changeEvent(currentEvent)
    }
    
    
  }, [currentEvent]);

  
  const changeEvent = (currentEvent) => {
    if (currentEvent == 0) {
      setIsMinEvent(true);
      setIsMaxEvent(false)
    }
    if (currentEvent == gadolEvents.length - 1) {
      setIsMaxEvent(true);
      setIsMinEvent(false)
    }
    setCurrentPosition([
      gadolEvents[currentEvent].event_latitude,
      gadolEvents[currentEvent].event_longitude,
    ]);
    setEventText(gadolEvents[currentEvent].event_text);
  }
  //////////////////////////////////////////////////////////
    /////////////Event changing Ends
////////////////////////////////////////////////////////////////
  const getLanguage = (pick) => {

   
    if (pick === "hebrew") {
      console.log("got to hebrew")
      
      // setRishonim(hebrewRishonim)
      // setAchronim(hebrewAchronim)
      setLanguage("hebrew")
    }
    else if (pick === "english") {
      console.log("got to english")
      // setRishonim(englishRishonim)
      // setAchronim(englishAchronim)
      setLanguage("english")
    } 
  }


  if (error) {
    return <div>Error: {error.message}</div>;
  } else if (!axiosLoaded) {
    return <div>Loading...</div>;
  } else {
    return (
      <div>{console.log(isNewGadolRef.current)}
        <Navigator
          rishonim={rishonim}
          achronim={achronim}
          names={names}
          currentGadol={currentGadol}
          getLanguage={getLanguage}
          language={language}
          handleGadolChange = {handleGadolChange}
        />

        <GadolBox
          currentGadol={currentGadol}
          gadol={gadol}
          students={gadolStudents}
          teachers={gadolTeachers}
          works={gadolWorks}
          language={language}
          handleEventChange = {handleEventChange}
          event={eventText}
          isMaxEvent={isMaxEvent}
          isMinEvent={isMinEvent}
        />
        <MapContainer
          center={currentPosition}
          maxZoom={7}
          minZoom={4}
          zoom={4}
          zoomControl={false}
          maxBounds={([8.12884, -49.72852], [66.28807, 76.55273])}
        >
          <TileLayer
            url="https://api.mapbox.com/styles/v1/dweisb/ckuyvslt608od14o4h0cqpblf/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoiZHdlaXNiIiwiYSI6ImNrdGQzZzQ2aTBicGEyb3BoZjI1YjNwaGkifQ.9LTCnUZDmffDzf7BzqVq5w"
            attribution='Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>'
          />
          <ZoomControl position="bottomright" />

          <MapItems
            currentGadol={currentGadol}
            gadol={gadol}
            position={currentPosition}
            students={gadolStudents}
            teachers={gadolTeachers}
          />
        </MapContainer>
      </div>
    );
  }
};
export default App;
