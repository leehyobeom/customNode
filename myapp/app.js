const { rejects } = require('assert')
const express = require('express')
const fs = require('fs')
const { resolve } = require('path')
const app = express()
const port = 3333
var mysql = require('mysql');
var mysql2 = require('mysql2/promise');
const { Worker } = require('worker_threads');
const net = require('net');
// let socket = net.createServer();

//   socket.on("data", function (data) {
//     console.log(data.toString());
//   });
//   socket.on("close", function (data) {
//     console.log("close");
//   });
//   socket.listen(4444);


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/worker', (req, res) => {

  const worker = new Worker(`
  const { parentPort } = require('worker_threads');
  parentPort.once('message',
  message => parentPort.postMessage({ pong: message }));
  `, { eval: true });
  worker.on('message', message => console.log(message));
  worker.postMessage('ping');
  res.send('worker')
})

app.get('/fs', (req, res) => {

  fs.readFile('./makeFile.txt', () => {
    res.send('fs')
  });
  
})


app.get('/fsError', (req, res) => {

  fs.readFileSync('./makeFileError.txt', () => {
    res.send('fsError')
  });
  
})



app.get('/fsSync', (req, res) => {
  fs.readFileSync('./makeFile.txt', () => {
    res.send('fs')
  });
})

app.get('/promise', (req, res) => {
  new Promise((resolve)=>{
    const startCallback = Date.now();
  
    // 10ms가 걸릴 어떤 작업을 합니다.
    while (Date.now() - startCallback < 1100) {
      // 아무것도 하지 않습니다.
    }
    console.log("promise");
    res.send('promise')
  });
})

app.get('/BingFsSync', (req, res) => {
  fs.readFileSync('./map.txt', 'utf8');
  res.send('BingFs')
})

app.get('/timer', (req, res) => {

  const timeoutScheduled = Date.now();

  setTimeout(() => {
    console.log("node: ", "setTimeoutEnd");
  }, 100);

  function someAsyncOperation(callback) {
    console.log("node: ", "readFileStart");
    fs.readFile('./makeFile.txt', callback);
  }
  someAsyncOperation(() => {
    const startCallback = Date.now();
    // 10ms가 걸릴 어떤 작업을 합니다.
    while (Date.now() - startCallback < 110) {
      // 아무것도 하지 않습니다.
    }
    console.log("node: ", "whileEnd");
  });
   
  res.send('timer')
})


app.get('/mysqlBigSize', (req, res) => {
  var connection = mysql.createConnection({
    host     : '127.0.0.1',
    user     : 'root',
    password : '',
    database : ''
  });
  connection.query('SELECT * from bottleneck_summary_table', function (error, results, fields) {
    if (error) throw error;
    res.send(results[0]);
  });
  connection.end();
})


app.get('/mysql', (req, res) => {
  var connection = mysql.createConnection({
    host     : '127.0.0.1',
    user     : 'root',
    password : '',
    database : ''
  });
  
  connection.query('SELECT * from admin_package_table', function (error, results, fields) {
    if (error) throw error;
    res.send(results[0]);
  });
  connection.end();
})

app.get('/mysqlError', (req, res) => {
  var connection = mysql.createConnection({
    host     : '127.0.0.1',
    user     : 'root',
    password : '',
    database : ''
  });
  
  connection.query('SELECT iddd from admin_package_table', function (error, results, fields) {
    if (error) {
      console.log("node: ",error);
      throw error
    }
    res.send(results[0]);
  });
  connection.end();
})


app.get('/mysql_10', (req, res) => {
  var connection = mysql.createConnection({
    host     : '127.0.0.1',
    user     : 'root',
    password : '',
    database : ''
  });
  
  for (let index = 0; index < 10; index++) {
    connection.query('SELECT * from admin_package_table', function (error, results, fields) {
      if (error) throw error;
      if(index == 9) res.send(results[0]);
    });   
  }
  connection.end();
})



app.get('/mysqlPromise', (req, res) => {
  new Promise((resolve,rejected)=>{
    var connection = mysql.createConnection({
      host     : '127.0.0.1',
      user     : 'root',
      password : '',
      database : ''
    });
    connection.query('SELECT * from admin_package_table', function (error, results, fields) {
      if (error) throw error;
      // fs.readFile('./makeFile.txt', () => {
      // });
      const startCallback = Date.now();
      while (Date.now() - startCallback < 110) {
        // 아무것도 하지 않습니다.
      }
      resolve(results);
    });
    connection.end();
  }).then((data)=>{
    const startCallback = Date.now();
    console.log("startCallback");
    res.send(data[0]);
  });
  console.log("@@2222");
})


app.get('/mysql2',async (req, res) => {
  var connection = mysql2.createConnection({
    host     : '127.0.0.1',
    user     : 'root',
    password : '',
    database : ''
  });
  let results = await (await connection).execute("SELECT * from admin_package_table");
  res.send(results[0]);
})

app.get('/mysql2Promise', (req, res) => {
  new Promise((resolve,rejected)=>{
    var connection = mysql2.createConnection({
      host     : '127.0.0.1',
      user     : 'root',
      password : '',
      database : ''
    });
    connection.query('SELECT * from admin_package_table', function (error, results, fields) {
      if (error) throw error;
      resolve(results);
    });
    connection.end();
  }).then((data)=>{
    const startCallback = Date.now();
    res.send(data[0]);
  });
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})


