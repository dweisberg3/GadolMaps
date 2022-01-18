import React, { useState, useEffect} from "react";
import axios from 'axios'

import {  MapContainer,  TileLayer, ZoomControl } from "react-leaflet";
import "./App.css";
import Navigator from "./components/Navigator.js";
import GadolBox from "./components/GadolBox.js";

import MapItems from "./components/MapItems.js";

const App = () => {
  const [rishonim, setRishonim] = useState([]);
  const [achronim, setAchronim] = useState([]);
  const [hebrewRishonim, setHebrewRishonim] = useState([])
  const [hebrewAchronim, setHebrewAchronim] = useState([])
  const [englishRishonim, setEnglishRishonim] = useState([])
  const [englishAchronim, setEnglishAchronim] = useState([])
  const [currentGadol, setCurrentGadol] = useState([]);
  const [currentPosition, setCurrentPosition] = useState([37.88472, -4.77913]);
  const [isNewGadol, setisNewGadol] = useState(false);
  const [gadolInfoCounter, setGadolInfoCounter] = useState(0);
  const [error, setError] = useState(null);
  const [achronimIsLoaded, setAchronimIsLoaded] = useState(false);
  const [rishonimIsLoaded, setRishonimIsLoaded] = useState(false);
  const [hebrewAchronimIsLoaded, setHebrewAchronimIsLoaded] = useState(false);
  const [hebrewRishonimIsLoaded, setHebrewRishonimIsLoaded] = useState(false);
  const [language, setLanguage] = useState("english");
  const [names,setNames] = useState(null);
  const [axiosLoaded, setAxiosLoaded] = useState(false);
  const [gadolTeachers, setGadolTeachers] = useState([])
  const [gadolStudents, setGadolStudents] = useState([])
  const [gadolEvents, setGadolEvents] = useState([])
  const [gadol, setGadol] = useState()


  const getGadol = async (gadol) => {
    const gadolName = gadol.name;
    console.log(gadol.name)
    console.log("got to get gadol")
    
    const theGadol = await axios.get("http://localhost:8080/gadol" , {params : {name : gadol.name}} )
    setCurrentPosition([theGadol.data.latitude, theGadol.data.longitude]);
    setGadol(theGadol.data)

    const teachers = await axios.get("http://localhost:8080/teachers", {params : {name : gadol.name}})
      console.log(teachers.data);
      setGadolTeachers(teachers.data);
      
  
    const students = await axios.get("http://localhost:8080/students", {params : {name : gadol.name}})
      console.log(students.data);
      setGadolStudents(students.data);
     
    const events = await  axios.get("http://localhost:8080/events", {params : {name : gadol.name}})
      console.log(events.data);
      setGadolEvents(events.data);
      
    // console.log(gadol.Name);
    // setCurrentGadol(gadol);
    // setCurrentPosition(gadol.Locations[0][0]);
    // setisNewGadol(true);
    // setGadolInfoCounter(0);
   
  };

  const getLanguage = (pick) => {

   
    if (pick === "hebrew") {
      
      console.log("got to hebrew")
      
      setRishonim(hebrewRishonim)
      setAchronim(hebrewAchronim)
      setLanguage("hebrew")
      // if(rishonIndex != -1){
      //   setCurrentGadol(rishonim[rishonIndex])
      // }
      // else if(achronIndex != -1){
      //   setCurrentGadol(achronim[achronIndex])
      // }
    }


    else if (pick === "english") {
      console.log("got to english")
      setRishonim(englishRishonim)
      setAchronim(englishAchronim)
      setLanguage("english")
      // if(rishonIndex != -1){
      //   setCurrentGadol(fghfghrishonim[rishonIndex])
      // }
      // else if(achronIndex != -1){
      //   setCurrentGadol(achronim[achronIndex])
      // }
    } 
  }

  

  const increaseGadolInfoCounter = () => {
    setGadolInfoCounter(gadolInfoCounter + 1);
  };

  const decreaseGadolInfoCounter = () => {
    setGadolInfoCounter(gadolInfoCounter - 1);
  };

  // useEffect(() => {
  //   fetch("./englishrishonim.json", {
  //     headers: {
  //       "Content-Type": "application/json",
  //       Accept: "application/json",
  //     },
  //   })
  //     .then((res) => res.json())
  //     .then((result) => {
  //       setEnglishRishonim(result)
  //       setRishonim(result);
  //       setCurrentGadol(result[2])
  //       setRishonimIsLoaded(true);
    
  //     });
  //   fetch("./englishachronim.json", {
  //     headers: {
  //       "Content-Type": "application/json",
  //       Accept: "application/json",
  //     },
  //   })
  //     .then((res) => res.json())
  //     .then((result) => {
  //       setEnglishAchronim(result)
  //       setAchronim(result);
  //       setAchronimIsLoaded(true);
        
  //     });
  //     fetch("./hebrewrishonim.json", {
  //       headers: {
  //         "Content-Type": "application/json",
  //         Accept: "application/json",
  //       },
  //     })
  //       .then((res) => res.json())
  //       .then((result) => {
  //         setHebrewRishonim(result);
  //         setHebrewRishonimIsLoaded(true);
          
  //       });
  //       fetch("./hebrewachronim.json", {
  //         headers: {
  //           "Content-Type": "application/json",
  //           Accept: "application/json",
  //         },
  //       })
  //         .then((res) => res.json())
  //         .then((result) => {
  //           setHebrewAchronim(result);
  //           setHebrewAchronimIsLoaded(true);
            
  //         });

       


    // Note: it's important to handle errors here
    // instead of a catch() block so that we don't swallow
    // exceptions from actual bugs in components.
    // (error) => {
    //   setRishonimIsLoaded(true);
    //   setError(error);
    // }
  // }, []);

  useEffect(() => {
    axios.get("http://localhost:8080").then((response) => {
      console.log(response.data);
      console.log(typeof response.data);
      setNames(response.data);
      setGadol(response.data)
      setAxiosLoaded(true)
    });
    
  }, [])

  if (error) {
    return <div>Error: {error.message}</div>;
  } else if (!axiosLoaded) {
    return <div>Loading...</div>;
  } else {
    return (
      <div>
        <Navigator
          getGadol={getGadol}
          rishonim={rishonim}
          achronim={achronim}
          names = {names}
          currentGadol={currentGadol}
          getLanguage = {getLanguage}
          language = {language}
        />

        <GadolBox
          currentGadol={currentGadol}
          gadol = {gadol}
          students = {gadolStudents}
          teachers = {gadolTeachers}
          gadolInfoCounter={gadolInfoCounter}
          increaseGadolInfoCounter={increaseGadolInfoCounter}
          decreaseGadolInfoCounter={decreaseGadolInfoCounter}
          language = {language}
        />
        <MapContainer center={currentPosition} maxZoom = {7} minZoom = {4} zoom={4} zoomControl = {false} maxBounds = {[8.12884, -49.72852],[66.28807, 76.55273]}>
          <TileLayer
            url="https://api.mapbox.com/styles/v1/dweisb/ckuyvslt608od14o4h0cqpblf/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoiZHdlaXNiIiwiYSI6ImNrdGQzZzQ2aTBicGEyb3BoZjI1YjNwaGkifQ.9LTCnUZDmffDzf7BzqVq5w"
            attribution='Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>'
          />
          <ZoomControl position="bottomright"  />

          <MapItems
            currentGadol={currentGadol}
            gadol = {gadol}
            position={currentPosition}
            gadolInfoCounter={gadolInfoCounter}
            isNewGadol={isNewGadol}
            students = {gadolStudents}
            teachers = {gadolTeachers}
          />
        </MapContainer>
      </div>
    );
  }
};
export default App;
