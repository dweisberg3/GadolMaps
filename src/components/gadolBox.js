import { ListItem } from "@mui/material";
import { Button, Typography, CardContent, CardActions } from "@mui/material";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ListItemText from "@mui/material/ListItemText";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {useEffect, useState} from "react";
import { Card } from "react-bootstrap";
import "./GadolBox.css";


const hebrewHeaders = ["ציר הזמן","חזור","הבא", "רבותיו","תלמידיו","ספריו"]

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

  



  return (
    <Card className="gadolbox" sx={{ minWidth: 375 }}>
      <CardContent>
        <Typography sx={{ fontSize: 30 }} color="text.primary" gutterBottom>
          {currentGadol.Name}
        </Typography>

        <Typography sx={{ fontSize: 15 }} color="text.secondary">
          {currentGadol.Fullname}
        </Typography>
        <Typography sx={{ mb: 1.5 }} color="text.secondary">
          {currentGadol.Overview}
        </Typography>
        <Card sx={{maxHeight : 10, minWidth: 375,  mb : 0 , margin : 0, pt: 0}}>
          <CardContent>
            <Typography sx={{ mb: 1.5 }} color="text.primary" align="center">
              {headers[0]}
            </Typography>
            <Typography sx={{ mb: 1.5 , fontSize : 13}} color="text.secondary">
              {currentGadol.Locations[gadolInfoCounter][1]}
            </Typography>
            <CardActions>
              <Button
                variant="contained"
                disabled={gadolInfoCounter == 0}
                onClick={() => {
                  decreaseGadolInfoCounter();
                }}
                size = "small"
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
            </CardActions>
          </CardContent>
        </Card>

        <Accordion
          expanded={expanded === "panel1"}
          sx={{ mt: 3 }}
          onChange={handleChange("panel1")}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1bh-content"
            id="panel1bh-header"
          >
            <Typography sx={{ width: "83%", flexShrink: 0 }}>
              {headers[3]}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            {currentGadol.Teachers != ""
              ? currentGadol.Teachers.map((teacher) => {
                  return (
                    <ListItem disablePadding sx={{ pt: 0, pb: 0 }}>
                      {" "}
                      <ListItemText primaryTypographyProps={{ fontSize: "15px" }}  sx={{ m: 0 }}>{teacher} </ListItemText>{" "}
                    </ListItem>
                  );
                })
              : null}
          </AccordionDetails>
        </Accordion>
        <Accordion
          expanded={expanded === "panel2"}
          onChange={handleChange("panel2")}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel2bh-content"
            id="panel2bh-header"
          >
            <Typography sx={{ width: "33%", flexShrink: 0 }}>
              {headers[4]}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            {currentGadol.Students != ""
              ? currentGadol.Students.map((student) => {
                  return (
                    <ListItem disablePadding sx={{ pt: 0, pb: 0 }}>
                      {" "}
                      <ListItemText primaryTypographyProps={{ fontSize: "15px" }}  sx={{ m: 0 }}>{student} </ListItemText>{" "}
                    </ListItem>
                  );
                })
              : null}
          </AccordionDetails>
        </Accordion>
        <Accordion
          expanded={expanded === "panel3"}
          onChange={handleChange("panel3")}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel3bh-content"
            id="panel3bh-header"
          >
            <Typography sx={{ width: "33%", flexShrink: 0 }}>{headers[5]}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {currentGadol.Works != ""
              ? currentGadol.Works.map((work) => {
                  return (
                    <ListItem disablePadding>
                      {" "}
                      <ListItemText
                        primaryTypographyProps={{ fontSize: "15px" }}
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
      </CardContent>
    </Card>
  );
}
