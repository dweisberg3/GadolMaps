import { AccordionActions } from '@mui/material'
import React from 'react'
import {Card, Tab, Tabs, ListGroup, Accordion, Button} from 'react-bootstrap'

import './GadolBox.css'
import { useState } from 'react'

export default function GadolBox({currentGadol, getGadol, allGadols, teachers, students, getTimeLinePosition, gadolInfoCounter, increaseGadolInfoCounter}) {

  
  const [currentFact, setCurrentFact] = useState(currentGadol.Locations[0][0])
  const [currentFactCount, setcurrentFactCount] = useState(gadolInfoCounter)
  // const teachers = allGadols.map(gadol => { if(gadol.Students.includes(currentGadol.Name)); return gadol})
  // const teachers = allGadols.filter(gadol => gadol.Students.includes(currentGadol.Name))
  // const students = allGadols.filter(gadol => gadol.Teachers.includes(currentGadol.Name))
  // const teachers = allGadols.map(gadol => { if(gadol.Students.includes(currentGadol.Name)) ;return gadol})
  console.log(teachers)
 console.log(gadolInfoCounter)
//  setCurrentFact(currentGadol.Locations[1][1])
  // console.log(isNewGadol)
  //   if(isNewGadol){
  //     // setcurrentFactCount(0)
  //   }
   
    
    return (
     
      <Card className = "gadolbox">
      <Card.Body>  
           <Card.Title style={{ color: "green" }}>{currentGadol.Name}</Card.Title> 
           <Card.Text>
           {currentGadol.Locations[currentFactCount][1]}
          </Card.Text>
            </Card.Body>
<Accordion>
   
  <Accordion.Item eventKey="0">
    <Accordion.Header>Teachers</Accordion.Header>
    <Accordion.Body>
    <ListGroup variant = "flush"> {teachers != "" ? teachers.map((teacher) => {
              return  <ListGroup.Item action onClick={ () => getGadol(teacher)}>{teacher.Name}</ListGroup.Item>}) : null}
      </ListGroup>
    </Accordion.Body>
  </Accordion.Item>
  <Accordion.Item eventKey="2">
    <Accordion.Header>Students</Accordion.Header>
    <Accordion.Body>
    <ListGroup variant = "flush"> {students != "" ? students.map((student) => {
              return  <ListGroup.Item action onClick={ () => getGadol(student)}>{student.Name}</ListGroup.Item>}) : null}
      </ListGroup>
    </Accordion.Body>
  </Accordion.Item>
  <Accordion.Item eventKey="3">
    <Accordion.Header>Works</Accordion.Header>
    <Accordion.Body>
    <ListGroup variant = "flush"> {students != "" ? students.map((student) => {
              return  <ListGroup.Item action onClick={ () => getGadol(student)}>{student.Name}</ListGroup.Item>}) : null}
      </ListGroup>
    </Accordion.Body>
  </Accordion.Item>
  <Accordion.Item eventKey="4">
    <Accordion.Header>Places Lived</Accordion.Header>
    <Accordion.Body> dfgdgdfgdfgdgdgfdf
    <ListGroup variant = "flush"> {students != "" ? students.map((student) => {
              return  <ListGroup.Item action onClick={ () => getGadol(student)}>{student.Name}</ListGroup.Item>}) : null}
      </ListGroup>
    </Accordion.Body>
  </Accordion.Item>
  
</Accordion>

<Button onClick={() => {setcurrentFactCount(currentFactCount + 1) ; getTimeLinePosition(currentGadol.Locations[currentFactCount+1][0]); increaseGadolInfoCounter(currentFactCount +1)} }>next</Button>

</Card>

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
    )
}
