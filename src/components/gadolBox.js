import { ListItem } from '@mui/material'
import {  Button, Typography, CardContent, CardActions} from '@mui/material';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ListItemText from '@mui/material/ListItemText';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import React from 'react'
import {Card} from 'react-bootstrap'
import './GadolBox.css'


export default function GadolBox({
  currentGadol,
  gadolInfoCounter,
  increaseGadolInfoCounter,
  decreaseGadolInfoCounter
}) {

const [expanded, setExpanded] = React.useState(false);

const handleChange = (panel) => (event, isExpanded) => {
  setExpanded(isExpanded ? panel : false);
};


  return ( <Card className = "gadolbox" sx={{ minWidth: 375 }}>
    <CardContent>
      <Typography sx={{ fontSize: 30 }} color="text.primary" gutterBottom>
      {currentGadol.Name}
      </Typography>
      
      <Typography sx={{ fontSize: 15 }} color="text.secondary">
        R' Moshe Bein Msdf
      </Typography>
      <Typography sx={{ mb: 1.5 }} color="text.secondary">
        {currentGadol.Overview}
      </Typography>
      <Card sx={{ minWidth: 375 , mb: 50 }}>
        <CardContent>
        <Typography sx={{ mb: 1.5 }} color="text.primary" align="center">
        TimeLine
      </Typography>
      <Typography sx={{ mb: 1.5 }} color="text.secondary">
      {currentGadol.Locations[gadolInfoCounter][1]}
      </Typography>
      <CardActions>
        
        <Button
     variant="contained"
     disabled={(gadolInfoCounter  == 0)}
     onClick={
        () => {
             decreaseGadolInfoCounter()
           }
       
     }
   >
     Back
   </Button> 

   <Button
     variant="contained"
     disabled={!(gadolInfoCounter < currentGadol.Locations.length - 1)}
     onClick={
       gadolInfoCounter < currentGadol.Locations.length - 1
         ? () => {
           increaseGadolInfoCounter();
           }
         : null
     }
   >
     Next
   </Button>
 </CardActions>
        </CardContent></Card>
     
      <Accordion expanded={expanded === 'panel1'} sx={{mt: 3 }} onChange={handleChange('panel1')}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1bh-content"
          id="panel1bh-header"
        >
          <Typography sx={{ width: '83%', flexShrink: 0 }}>
            Teachers
          </Typography>
        
        </AccordionSummary>
        <AccordionDetails>
        {currentGadol.Teachers != ""
                ? currentGadol.Teachers.map((teacher) => {
                    return (
                      <ListItem> <ListItemText>{teacher} </ListItemText> </ListItem>
                   );
                  })
                : null}
        </AccordionDetails>
      </Accordion>
      <Accordion expanded={expanded === 'panel2'} onChange={handleChange('panel2')}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel2bh-content"
          id="panel2bh-header"
        >
          <Typography sx={{ width: '33%', flexShrink: 0 }}>Students</Typography>
         
        </AccordionSummary>
        <AccordionDetails> 
          
        

         
        </AccordionDetails>
      </Accordion>
      <Accordion expanded={expanded === 'panel3'} onChange={handleChange('panel3')}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel3bh-content"
          id="panel3bh-header"
        >
          <Typography sx={{ width: '33%', flexShrink: 0 }}>
           Works
          </Typography>
         
        </AccordionSummary>
        <AccordionDetails>
        {currentGadol.Works != "" ? currentGadol.Works.map((work) => {
               return ( <ListItem> <ListItemText>{work} </ListItemText> </ListItem>
                ) }): null}

        </AccordionDetails>
      </Accordion>
     
    
    </CardContent>
  
  </Card>)
  
  
}
