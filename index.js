const express = require('express');
const http = require('http');
const path = require('path');
const bodyParser = require('body-parser');

let app = express(); //let app = new express();

app.set('port', 12000);
app.set('views', path.join(__dirname, "views"));
app.set('view engine', 'ejs');

//그냥 받아오지 못하는 .ejs의 경로들을 오류없이 가져오게 해준다.
app.use(express.static(path.join(__dirname, "public"))); //join는 여러 문자를 연결시켜주는 용도로 쓴다.
app.use(bodyParser.json()); //미들웨어로 바디파서를 사용함.
app.use(bodyParser.urlencoded({extended:true}));

const router = require('./router');
app.use(router);

let server = http.createServer(app);
server.listen(app.get('port'), function() {
    console.log(`Express 엔진이 ${app.get('port')}에서 실행중`);
});