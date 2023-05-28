import { ListItem } from "@mui/material";
import {Box, Card, Button, Typography, CardContent, CardActions } from "@mui/material";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ListItemText from "@mui/material/ListItemText";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {useEffect, useState} from "react";
// import { Card } from "react-bootstrap";
import "./GadolBox.css";
import React from "react";


const hebrewHeaders = ["תולדותיו","חזור","הבא", "רבותיו","תלמידיו","חיבוריו"]

  const englishHeaders = ["Timeline", "Back", "Next", "Teachers", "Students", "Works"]

export default function GadolBox({
  currentGadol,
  gadolInfoCounter,
  increaseGadolInfoCounter,
  decreaseGadolInfoCounter,
  language,
}) {
  const [expanded, setExpanded] = useState(false);
  const [headers, setHeaders] = useState(englishHeaders)
  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  useEffect(() => {
    if(language === "english"){
      setHeaders(englishHeaders)
    }
    else if(language === "hebrew"){ 
      setHeaders(hebrewHeaders)
    }
   
  }, [language])

  useEffect(() => {
    setExpanded(false)
  },[currentGadol])



  return (
    <Box className="gadolbox" >
    
     <Box sx = {{height : 100,border : 1,m : 2,textAlign: 'center'}}>
        <Typography sx={{ fontSize: 27}} color="text.primary" gutterBottom>
          {currentGadol.Name}
        </Typography>

        <Typography sx={{ fontSize: 15 }} color="text.secondary">
          {currentGadol.Fullname}
        </Typography>
        <Typography sx={{ fontSize: 13, m:0 }} color="text.secondary">
          {currentGadol.Overview}
        </Typography>
        </Box>
       <Box sx={{height : 110, margin : 1}}>
       <Typography sx={{ margin : 1}} color="text.primary" align="center">
              {headers[0]}
            </Typography>
            <Typography sx={{ m: 4 , fontSize : 15}} color="text.secondary">
              {currentGadol.Locations[gadolInfoCounter][1]}
            </Typography>
       </Box>
           
          <Box sx = {{p: 2, bottom : 0, textAlign : 'center'}}>
              <Button
                variant="contained"
                disabled={gadolInfoCounter == 0}
                onClick={() => {
                  decreaseGadolInfoCounter();
                }}
                size = "small"
                sx={{ mb: 0.5 , margin : 1, bottom :0}}
              >
                {headers[1]}
              </Button>

              <Button
                variant="contained"
                disabled={
                  !(gadolInfoCounter < currentGadol.Locations.length - 1)
                }
                onClick={
                  gadolInfoCounter < currentGadol.Locations.length - 1
                    ? () => {
                        increaseGadolInfoCounter();
                      }
                    : null
                }
                size = "small"
              >
                {headers[2]}
              </Button>
              </Box>

        <Accordion
          expanded={expanded === "panel1"}
          sx={{ m:0, p:0, backgroundColor : "#B3CFDF" }}
          onChange={handleChange("panel1")}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1bh-content"
            id="panel1bh-header"
            
          >
            <Typography sx={{ width: "100%", flexShrink: 0 }}>
              {headers[3]}
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{  m:0 }}>
            {currentGadol.Teachers != ""
              ? currentGadol.Teachers.map((teacher) => {
                  return (
                    <ListItem disablePadding sx={{ pt: 0, pb: 0 }}>
                      {" "}
                      <ListItemText primaryTypographyProps={{ fontSize: "14px" }}  sx={{ m: 0 , ml:2}}>{teacher} </ListItemText>{" "}
                    </ListItem>
                  );
                })
              : null}
          </AccordionDetails>
        </Accordion>
        <Accordion
        sx={{ m:0, p:0, backgroundColor : "#B3CFDF" }}
          expanded={expanded === "panel2"}
          onChange={handleChange("panel2")}
          
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel2bh-content"
            id="panel2bh-header"
          >
            <Typography sx={{ width: "100%", flexShrink: 0 }}>
              {headers[4]}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            {currentGadol.Students != ""
              ? currentGadol.Students.map((student) => {
                  return (
                    <ListItem disablePadding sx={{ pt: 0, pb: 0 }}>
                      {" "}
                      <ListItemText primaryTypographyProps={{ fontSize: "14px" }}  sx={{ m: 0, ml:2 }}>{student} </ListItemText>{" "}
                    </ListItem>
                  );
                })
              : null}
          </AccordionDetails>
        </Accordion>
        <Accordion
        sx={{ m:0, p:0, backgroundColor : "#B3CFDF" }}
          expanded={expanded === "panel3"}
          onChange={handleChange("panel3")}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel3bh-content"
            id="panel3bh-header"
          >
            <Typography sx={{ width: "100%", flexShrink: 0 }}>{headers[5]}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {currentGadol.Works != ""
              ? currentGadol.Works.map((work) => {
                  return (
                    <ListItem disablePadding>
                      {" "}
                      <ListItemText
                        primaryTypographyProps={{ fontSize: "14px", ml:2 }}
                        sx={{ m: 0 }}
                      >
                        {work}{" "}
                      </ListItemText>{" "}
                    </ListItem>
                  );
                })
              : null}
          </AccordionDetails>
        </Accordion>
      
   </Box>
  );
}
