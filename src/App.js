import React, { useState, useEffect} from "react";

import {  MapContainer,  TileLayer, ZoomControl } from "react-leaflet";
import "./App.css";
import Navigator from "./components/Navigator.js";
import GadolBox from "./components/GadolBox";

import MapItems from "./components/MapItems";

const App = () => {
  const [rishonim, setRishonim] = useState([]);
  const [achronim, setAchronim] = useState([]);
  const [currentGadol, setCurrentGadol] = useState([]);
  const [currentPosition, setCurrentPosition] = useState([37.88472, -4.77913]);
  const [isNewGadol, setisNewGadol] = useState(false);
  const [gadolInfoCounter, setGadolInfoCounter] = useState(0);
  const [error, setError] = useState(null);
  const [achronimIsLoaded, setAchronimIsLoaded] = useState(false);
  const [rishonimIsLoaded, setRishonimIsLoaded] = useState(false);

  const getGadol = (gadol) => {
    console.log(gadol.Name);
    setCurrentGadol(gadol);
    setCurrentPosition(gadol.Locations[0][0]);
    setisNewGadol(true);
    setGadolInfoCounter(0);
   
  };

  // const filterTeachers = (currentGadol) => {
  //   // console.log(currentGadol)
  //   console.log(rishonim)
  //   console.log(currentGadol.Students)
  //   let teachers = "";
  //   if (rishonim.includes(currentGadol)) {
  //     console.log("got hesfsedf")
  //     teachers = rishonim.filter(gadol =>
  //       gadol.Students.includes(currentGadol.Name)
  //     );
  //   } else if (achronim.includes(currentGadol)) {
  //     teachers = achronim.filter(gadol =>
  //       gadol.Students.includes(currentGadol.Name)
  //     );
  //   }
  //   console.log(teachers)
  //   return teachers
  // };

  // const filterStudents = (currentGadol) => {
  //   let students = "";
  //   // console.log(currentGadol)
  //   // console.log(rishonim)
  //   if (rishonim.includes(currentGadol)) {
  //     console.log("got hesfsedf")
  //     students = rishonim.filter(gadol =>
  //       gadol.Teachers.includes(currentGadol.Name)
  //     );
  //   } else if (achronim.includes(currentGadol)) {
  //     students = achronim.filter(gadol =>
  //       gadol.Teachers.includes(currentGadol.Name)
  //     );
  //   }

  //   console.log(students)
  //   return students;
  // };

  const increaseGadolInfoCounter = () => {
    setGadolInfoCounter(gadolInfoCounter + 1);
  };

  const decreaseGadolInfoCounter = () => {
    setGadolInfoCounter(gadolInfoCounter - 1);
  };

  useEffect(() => {
    fetch("./rishonim.json", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    })
      .then((res) => res.json())
      .then((result) => {
        setRishonim(result);
        setCurrentGadol(result[3])
        setRishonimIsLoaded(true);
    
      });
    fetch("./achronim.json", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    })
      .then((res) => res.json())
      .then((result) => {
        setAchronim(result);
        setAchronimIsLoaded(true);
        
      });
    // Note: it's important to handle errors here
    // instead of a catch() block so that we don't swallow
    // exceptions from actual bugs in components.
    // (error) => {
    //   setRishonimIsLoaded(true);
    //   setError(error);
    // }
  }, []);

  if (error) {
    return <div>Error: {error.message}</div>;
  } else if (!rishonimIsLoaded || !achronimIsLoaded) {
    return <div>Loading...</div>;
  } else {
    return (
      <>
        <Navigator
          getGadol={getGadol}
          rishonim={rishonim}
          achronim={achronim}
          currentGadol={currentGadol}
        />

        <GadolBox
          currentGadol={currentGadol}
          gadolInfoCounter={gadolInfoCounter}
          increaseGadolInfoCounter={increaseGadolInfoCounter}
          decreaseGadolInfoCounter={decreaseGadolInfoCounter}
        />
        <MapContainer center={currentPosition} zoom={5} zoomControl = {false}>
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
      </>
    );
  }
};
export default App;
