import {useEffect, useState} from "react";

import "./Navigator.css";

import "../../node_modules/bootstrap/dist/css/bootstrap.min.css";

import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";

import List from "@mui/material/List";
import { makeStyles } from "@mui/styles";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";

const useStyles = makeStyles({
  root: {
    border: 0,
    borderRadius: 0,
    color: "black",
    height: 30,
    padding: "0 0px",
  },
});

const englishHeaders = ["Feedback", "Rishonim", "Achronim"]
const hebrewHeaders = ["משוב","ראשונים","אחרונים"]

export default function Navigator({ getGadol, rishonim, achronim, currentGadol , getLanguage, language}) {
  const [value, setValue] = useState("1");
  const classes = useStyles();
  const [headers, setHeaders] = useState(englishHeaders)
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  console.log(rishonim);
  console.log(achronim);

  const styleObj = {
    fontSize: 35,
    color: "black",
    textAlign: "center",
    paddingTop: "50px",
  };

  const [alignment, setAlignment] = useState('left');

  useEffect(() => {
    if(language === "english"){
      setHeaders(englishHeaders)
    }
    else if(language === "hebrew"){
      setHeaders(hebrewHeaders)
    }
   
  }, [language])
  


const handleAlignment = (event, newAlignment) => {
  setAlignment(newAlignment);
}


 
  return (
    <div className="navigator">
      <Box sx={{ width: "100%", typography: "body1" }}>
     <ToggleButtonGroup
    value={alignment}
    exclusive
    onChange={handleAlignment}
    aria-label="text alignment"
    color = "primary"
    
  >
    <ToggleButton size = "small"  onClick = {() => getLanguage("english")} value="left" aria-label="left aligned">
    <Typography >
          EN
        </Typography>
    </ToggleButton>
    <ToggleButton size = "small" onClick = {() => getLanguage("hebrew")}   value="center" aria-label="centered">
    <Typography >
          HE     </Typography>
    </ToggleButton>
   
  </ToggleButtonGroup>
     

  
 
  <Typography align = "center" sx={{ fontSize: 30 , pt : 2}} color="text.primary" gutterBottom>
         GadolMaps
        </Typography>

        
        {" "}
      
        
      </Box>

      <Box sx={{ width: "100%", typography: "body1", borderBottom : 1 }}>
        <TabContext value={value}>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <TabList onChange={handleChange} aria-label="lab API tabs example">
              <Tab sx = {{fontSize : 16, width : "50%"}} label={headers[1]} value="1" />
              <Tab sx = {{fontSize : 16, width : "50%"}} label={headers[2]} value="2" />
            </TabList>
          </Box>
          <TabPanel
            value="1"
            index={0}
            style={{ maxHeight: 400, overflow: "auto" }}
          >
            <List sx={{ width: "100%", flexShrink: 0 }}>
              {" "}
              {rishonim.map((gadol) => {
                return (
                  <ListItem disablePadding={true}>
                    {" "}
                    {currentGadol.Name !== gadol.Name ? (
                      <ListItemButton
                        disableRipple={true}
                        className={classes.root}
                        onClick={() => getGadol(gadol)}
                        sx= {{fontSize : 15}}
                      >
                       <Typography sx={{fontSize : 16, pl: 1, width: "100%", flexShrink: 0, textAlign : "left" }}>{gadol.Name}</Typography>
                      
                      </ListItemButton>
                    ) : (
                      <ListItemButton
                        className={classes.root}
                        disableRipple={true}
                        sx={{
                          backgroundColor: "lightblue",

                          "&.MuiButtonBase-root:hover": {
                            bgcolor: "lightblue",
                          },
                          fontSize : 15,
                        }}
                      >    <Typography sx={{ fontSize : 16 ,pl: 1, width: "100%", flexShrink: 0, textAlign : "left" }}>{gadol.Name}</Typography>
                        
                      </ListItemButton>
                    )}
                  </ListItem>
                );
              })}
            </List>
          </TabPanel>
          <TabPanel
            value="2"
            index={1}
            style={{ maxHeight: 400, overflow: "auto" }}
          >
            <List>
              {" "}
              {achronim.map((gadol) => {
                return (
                  <ListItem disablePadding={true}>
                    {" "}
                    {currentGadol.Name !== gadol.Name ? (
                      <ListItemButton
                        disableRipple={true}
                        className={classes.root}
                        onClick={() => getGadol(gadol)}
                      >
                           <Typography sx={{fontSize : 16, pl: 1, width: "90%", flexShrink: 0, textAlign : "left" }}>{gadol.Name}</Typography>
                      </ListItemButton>
                    ) : (
                      <ListItemButton
                        className={classes.root}
                        disableRipple={true}
                        sx={{
                          backgroundColor: "lightblue",

                          "&.MuiButtonBase-root:hover": {
                            bgcolor: "lightblue",
                          },
                        }}
                      >
                           <Typography sx={{fontSize : 16, pl: 1, width: "90%", flexShrink: 0, textAlign : "left" }}>{gadol.Name}</Typography>
                      </ListItemButton>
                    )}
                  </ListItem>
                );
              })}
            </List>
          </TabPanel>
        </TabContext>
      </Box>
      <Typography align = "center" sx = {{p: 0, mt: 1}}>
       {/* <Link sx={{ fontSize: 12, mt : 0}} href="feedback@gadolmaps.com" underline="none">
        {'feedback@gadolmaps.com'}
      </Link> */}
       </Typography>
       
       <Typography align = "center" sx={{ fontSize: 13 , p : 0 }} variant="body1" color="inherit">
                © 2021 | 5782 David Weisberg
              </Typography>
    </div>
  );
}

