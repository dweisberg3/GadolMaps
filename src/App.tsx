import React, { useState, useEffect} from "react";

import {  MapContainer,  TileLayer, ZoomControl } from "react-leaflet";
import {isMobile} from 'react-device-detect';

import "./App.css";
import Navigator from "./components/Navigator";
import GadolBox from "./components/GadolBox";

import MapItems from "./components/MapItems";

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

  const getGadol = (gadol) => {
    console.log(gadol.Name);
    setCurrentGadol(gadol);
    setCurrentPosition(gadol.Locations[0][0]);
    setisNewGadol(true);
    setGadolInfoCounter(0);
   
  };

  const getLanguage = (pick) => {

    const rishonIndex = rishonim.findIndex(({ Name }) => Name === currentGadol.Name);
    const achronIndex = achronim.findIndex(({ Name }) => Name === currentGadol.Name);
    console.log(rishonIndex)
    console.log(achronIndex)
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
      //   setCurrentGadol(rishonim[rishonIndex])
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

  useEffect(() => {
    fetch("./englishrishonim.json", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    })
      .then((res) => res.json())
      .then((result) => {
        setEnglishRishonim(result)
        setRishonim(result);
        setCurrentGadol(result[3])
        setRishonimIsLoaded(true);
    
      });
    fetch("./englishachronim.json", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    })
      .then((res) => res.json())
      .then((result) => {
        setEnglishAchronim(result)
        setAchronim(result);
        setAchronimIsLoaded(true);
        
      });
      fetch("./hebrewrishonim.json", {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })
        .then((res) => res.json())
        .then((result) => {
          setHebrewRishonim(result);
          setHebrewRishonimIsLoaded(true);
          
        });
        fetch("./hebrewachronim.json", {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        })
          .then((res) => res.json())
          .then((result) => {
            setHebrewAchronim(result);
            setHebrewAchronimIsLoaded(true);
            
          });
  
  }, []);

  if(isMobile){
    return (<div style = {{margin:1 + 'em'}}><h1>Thank you for visiting gadolmaps.com!</h1> 
    <p><br/><strong>This tool is meant to be used in the classroom. Version 1 is only available on desktop. Please visit again from a desktop screen. </strong></p>
    <p>If you'd like to see tablet or mobile versions of gadolmaps.com, let us know by emailing feedback@gadolmaps.com.</p> </div>)
  }
  else if (error) {
    return <div>Error: {error.message}</div>;
  } else if (!rishonimIsLoaded || !achronimIsLoaded  || !hebrewRishonimIsLoaded || !hebrewAchronimIsLoaded) {
    return <div>Loading...</div>;
  } else {
    return (
      <div>
        <Navigator
          getGadol={getGadol}
          rishonim={rishonim}
          achronim={achronim}
          currentGadol={currentGadol}
          getLanguage = {getLanguage}
          language = {language}
        />

        <GadolBox
          currentGadol={currentGadol}
          gadolInfoCounter={gadolInfoCounter}
          increaseGadolInfoCounter={increaseGadolInfoCounter}
          decreaseGadolInfoCounter={decreaseGadolInfoCounter}
          language = {language}
        />
        <MapContainer center={currentPosition} maxZoom = {8} minZoom = {3} zoom={6} zoomControl = {false} maxBounds = {[8.12884, -49.72852],[66.28807, 76.55273]}>
          <TileLayer
            url="https://api.mapbox.com/styles/v1/dweisb/ckuyvslt608od14o4h0cqpblf/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoiZHdlaXNiIiwiYSI6ImNrdGQzZzQ2aTBicGEyb3BoZjI1YjNwaGkifQ.9LTCnUZDmffDzf7BzqVq5w"
            attribution='Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>'
          />
          <ZoomControl position="bottomright"  />

          <MapItems
            currentGadol={currentGadol}
            position={currentPosition}
            gadolInfoCounter={gadolInfoCounter}
            isNewGadol={isNewGadol}
          />
        </MapContainer>
      </div>
    );
  }
};
export default App;
