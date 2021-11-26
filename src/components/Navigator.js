import React from "react";

import "./Navigator.css";

import "../../node_modules/bootstrap/dist/css/bootstrap.min.css";

import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';

import List from '@mui/material/List';

import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';



function Navigator({ getGadol, rishonim, achronim, currentGadol }) {


  const [value, setValue] = React.useState("1");

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  console.log(rishonim)
  console.log(achronim)

  const styleObj = {
    fontSize: 35,
    color: "black",
    textAlign: "center",
    paddingTop: "50px",
  }
  return (
    <div className="navigator">
      <Box sx={{ width: '100%', typography: 'body1' }}> <p style= {styleObj} >GadolMaps</p> </Box>
     
      <Box sx={{ width: '100%', typography: 'body1' }}>
      <TabContext value={value}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <TabList onChange={handleChange} aria-label="lab API tabs example">
            <Tab label="Rishonim" value="1" />
            <Tab label="Achronim" value="2" />
           
          </TabList>
        </Box>
        <TabPanel value="1" index={0} style={{maxHeight: 400, overflow: 'auto'}}>
      {rishonim.map((gadol) => {
              return (<List>
                <ListItem> <ListItemButton onClick={() => getGadol(gadol)}>
                  {gadol.Name}</ListItemButton>
                </ListItem></List>
              );
            })}
      </TabPanel>
      <TabPanel value="2" index={1} style={{maxHeight: 400, overflow: 'auto'}}>
      {achronim.map((gadol) => {
              return (<List>
                <ListItem> <ListItemButton onClick={() => getGadol(gadol)}>
                  {gadol.Name}</ListItemButton>
                </ListItem></List>
              );
            })}
      </TabPanel>
       
      </TabContext>
    </Box>

    </div>
  );
}

export default Navigator;
