import { AccordionActions } from '@mui/material'
import { Button } from '@mui/material';
import React from 'react'
import {Card, Tab, Tabs, ListGroup, Accordion, ToggleButton} from 'react-bootstrap'

import './GadolBox.css'
import { useState } from 'react'

export default function GadolBox({
  currentGadol,
  gadolInfoCounter,
  increaseGadolInfoCounter,
  decreaseGadolInfoCounter
}) {

  
  return (
    <Card className="gadolbox">
      <Card.Body>
        <Card.Title style={{ color: "green" }}>{currentGadol.Name}</Card.Title>
        <Card.Text>{currentGadol.Locations[gadolInfoCounter][1]}</Card.Text>
      </Card.Body>
      <Accordion>
        <Accordion.Item eventKey="0">
          <Accordion.Header>Teachers</Accordion.Header>
          <Accordion.Body>
            <ListGroup variant="flush">
              {" "}
              {currentGadol.Teachers != ""
                ? currentGadol.Teachers.map((teacher) => {
                    return (
                      <ListGroup.Item >
                        {teacher}
                      </ListGroup.Item>
                    );
                  })
                : null}
               
            </ListGroup>
          </Accordion.Body>
        </Accordion.Item>
        <Accordion.Item eventKey="2">
          <Accordion.Header>Students</Accordion.Header>
          <Accordion.Body>
            <ListGroup variant="flush">
              
              {currentGadol.Students != ""
                ? currentGadol.Students.map((student) => {
                    return (
                      <ListGroup.Item >
                        {student}
                      </ListGroup.Item>
                    );
                  })
                : null}
               
            </ListGroup>
          </Accordion.Body>
        </Accordion.Item>
        <Accordion.Item eventKey="3">
          <Accordion.Header>Works</Accordion.Header>
          <Accordion.Body>
            <ListGroup variant="flush">
              
             {currentGadol.Works != "" ? currentGadol.Works.map((work) => {
               return ( <ListGroup.Item>
               {work}
             </ListGroup.Item>)})
                : null}
            </ListGroup>
          </Accordion.Body>
        </Accordion.Item>
        <Accordion.Item eventKey="4">
          <Accordion.Header>Places Lived</Accordion.Header>
          <Accordion.Body>
            
            
            
           
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>

      
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

     
    </Card>
    // getTimeLinePosition(currentGadol.Locations[currentFactCount+1][0])

    //       <div className = "gadolbox">
    //         <Card style={{ width: '18rem' }}>
    //   <Card.Body>
    //     <Card.Title>{currentGadol.Name}</Card.Title>
    //     {/* {(map) => {
    //           map.flyTo(currentPosition,5,{ duration: 1.75, easeLinearity: 0.05 })

    //           return <Marker position={currentPosition}>
    //           <Popup> {currentGadol.Name} </Popup>

    //           </Marker>
    //         }} */}
    //     <Card.Subtitle className="mb-2 text-muted">{currentGadol.Teachers}</Card.Subtitle>
    //     <Card.Text>
    //     <Tabs defaultActiveKey="first">
    //         <Tab  eventKey="first" title="Teachers">   <ListGroup variant = "flush"> {teachers != null ? teachers.map((teacher) => {
    //               return  <ListGroup.Item action onClick={ () => getGadol(teacher)}>{teacher.Name}</ListGroup.Item>}) : null}
    //       </ListGroup>

    //         </Tab>
    //         <Tab  eventKey="second" title="Students">   <ListGroup variant = "flush"> {students != null ? students.map((student) => {
    //               return  <ListGroup.Item action onClick={ () => getGadol(student)}>{student.Name}</ListGroup.Item>}) : null}
    //       </ListGroup>

    //         </Tab>
    //         </Tabs>

    //     </Card.Text>
    //     {/* <Card.Link href="#">Teachers</Card.Link>
    //     <Card.Link href="#">Students</Card.Link> */}
    //   </Card.Body>
    // </Card>

    // </div>
  );
}
