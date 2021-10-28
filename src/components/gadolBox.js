import React from 'react'
import {Card, Tab, Tabs, ListGroup} from 'react-bootstrap'
import './GadolBox.css'

export default function GadolBox({currentGadol, getGadol, allGadols}) {

  // const teachers = allGadols.map(gadol => { if(gadol.Students.includes(currentGadol.Name)); return gadol})
  const teachers = allGadols.filter(gadol => gadol.Students.includes(currentGadol.Name))
  const students = allGadols.filter(gadol => gadol.Teachers.includes(currentGadol.Name))
  // const teachers = allGadols.map(gadol => { if(gadol.Students.includes(currentGadol.Name)) ;return gadol})
  console.log(teachers)
 
  

  
   
    
    return (


      <div className = "gadolbox">
        <Card style={{ width: '18rem' }}>
  <Card.Body>
    <Card.Title>{currentGadol.Name}</Card.Title>
    {/* {(map) => {
          map.flyTo(currentPosition,5,{ duration: 1.75, easeLinearity: 0.05 })
         
          return <Marker position={currentPosition}>
          <Popup> {currentGadol.Name} </Popup>
          
          </Marker>
        }} */}
    <Card.Subtitle className="mb-2 text-muted">{currentGadol.Teachers}</Card.Subtitle>
    <Card.Text>
    <Tabs defaultActiveKey="first">
        <Tab  eventKey="first" title="Teachers">   <ListGroup> {teachers != null ? teachers.map((teacher) => {
              return  <ListGroup.Item action onClick={ () => getGadol(teacher)}>{teacher.Name}</ListGroup.Item>}) : null}
      </ListGroup>
        
        </Tab>
        <Tab  eventKey="second" title="Students">   <ListGroup> {students != null ? students.map((student) => {
              return  <ListGroup.Item action onClick={ () => getGadol(student)}>{student.Name}</ListGroup.Item>}) : null}
      </ListGroup>
        
        </Tab>
        </Tabs>
    
    </Card.Text>
    {/* <Card.Link href="#">Teachers</Card.Link>
    <Card.Link href="#">Students</Card.Link> */}
  </Card.Body>
</Card>

</div>
    )
}
