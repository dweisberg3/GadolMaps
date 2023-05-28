const express = require('express');
var app = express();
const port = 3001;
const path = require('path');
const obj = require('./db.json');

let s : number = 0;




 app.use(express.static(path.join('server', "..",  'db.json')));

 app.get('/', (req, res) => {
    res.sendFile('db.json', { root: 'server' }); 
  });


//  app.get('/', function(req, res){
//     res.send({ title: 'GeeksforGeeks' });
// });

app.get('/me', (req, res) => {
    res.sendFile('db.json', { root: 'server' }); 
    // res.sendFile('hi.html', { root: 'server' });
 
app.get('/data', (req, res) => {
    res.sendFile('db.json', { root: 'server' }); 
})
  });
 



 app.listen(port, ()=>{
     console.log('Server now listening at http://localhost:', {port})
 })