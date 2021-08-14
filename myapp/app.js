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
var https = require('https');
const { send } = require('process')


//요청 받는것은 워커스레드가 늘어나지 않는다.
app.get('/', (req, res) => {
  console.log("Hello Node!");
  res.send('Hello Node!')
})

//요청하는것은 워커쓰레드 생성됨
app.get('/https', (req, res) => {
  console.log("https");
  https.request("https://daf3dce1-0a55-4514-bccc-bc81e2d32368.mock.pstmn.io/test", function(response){
    res.send('https')
}).end();
})

//이벤트 루프가 점령 된것을 확인
app.get('/while', (req, res) => {
  console.log("while");
  while(true){
  }
  res.send('while')
})

//메인 쓰레드가 점령됨
app.get('/promise', (req, res) => {
  console.log("promise");
  new Promise((resolve)=>{
    while (true) {
    }
    resolve(res.send('promise'))
  });
})

//이벤트 루프가 점령 된것을 확인, 워커쓰레드 생성되지 않음
app.get('/fsSync', (req, res) => {
  console.log("fsSync");
  fs.readFileSync('./makeFile.txt');
  res.send('fsSync')
})

//워커쓰레드 생성됨
app.get('/fs', (req, res) => {
  console.log("fs");
  fs.readFile('./makeFile.txt', () => {
    res.send('fs')
  });
})


//메인쓰레드 점령하지 않음, 워커 쓰레드도 생성되지 않음
app.get('/mysql', (req, res) => {
  console.log("mysql");
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


//setImmediate 항상 먼저 실행되는 이유?
//IO 작업이 끝나고 호출되는데 결국 항상 poll큐가 끝나는 지점에서 시작됨
//poll큐 다음인 check큐를 실행하기 때문에 immediate 항상 먼저 실행됨
let ti = 0;
//poll큐 스타트의 근거이며 요청이 온다고 해서 워커쓰레드가 생성되지 않는다.
//하지만 요청은 워커쓰레드가 생성되지 않을까?
app.get('/ti', (req, res) => {
  ti++;
  console.log("ti");
  setTimeout(() => {
    console.log('timeout: ', ti);
  }, 0);
  setImmediate(() => {
    console.log('immediate: ', ti);
  });
  res.send('fs')

})
 

// 항상 Q의 순차에 따라 진행되지 않는다.
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


app.get('/v8Parsing', (req, res) => {
  function sample(a, b, c) {
    const d = c - 100;
    return a + d * b;
  }
  
  for (let i = 0; i < 100000; i++) {
    sample(i, 2, 100);
  }
  res.send('v8Parsing')
})


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})


