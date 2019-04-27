//module을 불러온다.
const express = require('express');
const http = require('http');
const path = require('path');
const request = require('request');
const cheerio = require('cheerio');
const bodyParser = require('body-parser');

let app = express(); //let app = new express();

app.set('port', 12000);
app.set('views', path.join(__dirname, "views"));
app.set('view engine', 'ejs');

//그냥 받아오지 못하는 .ejs의 경로들을 오류없이 가져오게 해준다.
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json()); //미들웨어로 바디파서를 사용함.
app.use(bodyParser.urlencoded({extended:true}));

//슬래쉬가 올때 main.ejs로 보내줌
app.all('/', function(req, res) {
    res.render('main', {msg: 'Welcome To Express4'});
});

app.get('/top20', function(req, res) {
    request("https://www.naver.com", function(err, response, body){ //res가 아닌 response로 한 이유는 위에 res랑 겹쳐서임
        let list = [];
        $ = cheerio.load(body);

        let top20 = $(".ah_roll_area > .ah_l .ah_item .ah_k");
        for(let i = 0; i < top20.length; i++) {
            let msg = $(top20[i]).text();
            list.push(msg);
        }

        res.render('top', {msg:'네이버 실시간 급 상승 겁색어!', list:list});
    });
});

app.get('/search', function(req, res) {
    res.render('search', {list:list = undefined});
});

app.post('/search', function(req, res) {
    let word = req.body.word;
    let url = "https://search.naver.com/search.naver?sm=top_hty&fbm=0&ie=utf8&query=" + word;
    request(url, function(err, response, body){ //res가 아닌 response로 한 이유는 위에 res랑 겹쳐서임
        let list = [];
        $ = cheerio.load(body);

        let result = $(".sp_website .type01 > li dt > a:first-child");
        for(let i = 0; i < result.length; i++) {
            let msg = $(result[i]).text();
            list.push(msg);
        }

        res.render('search', {msg:'검색 결과', list:list});
    });
});

let server = http.createServer(app);
server.listen(app.get('port'), function() {
    console.log(`Express 엔진이 ${app.get('port')}에서 실행중`);
});