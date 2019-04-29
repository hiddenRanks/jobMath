//module을 불러온다.
const express = require('express');
const http = require('http');
const path = require('path');
const request = require('request');
const cheerio = require('cheerio');
const bodyParser = require('body-parser');
const qs = require('querystring');
const iconv = require('iconv-lite');
const charset = require('charset');
const mysql = require('mysql');

/* mysql 연결 부분 */
const conn = mysql.createConnection({
    user: "yy_30220", //mysql ID
    password: "1234", //mysql Pass
    host: "gondr.asuscomm.com" //msql Url
});

conn.query("USE yy_30220"); //yy_30220 데이터베이스 사용
/* mysql 연결 종료 */

let app = express(); //let app = new express();

app.set('port', 12000);
app.set('views', path.join(__dirname, "views"));
app.set('view engine', 'ejs');

//그냥 받아오지 못하는 .ejs의 경로들을 오류없이 가져오게 해준다.
app.use(express.static(path.join(__dirname, "public"))); //join는 여러 문자를 연결시켜주는 용도로 쓴다.
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
    word = qs.escape(word);
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

app.get('/lunch', function(req, res) {
    res.render('lunch', {});
});

app.post('/lunch', function(req, res) {
    let date = req.body.date;
    date = date.split("-").join("");

    const options = {
        url: 'http://www.y-y.hs.kr/lunch.view?date=' + date,
        headers: {
            'User-Agent': 'Mozilla/5.0'
        },
        encoding:null   //별도의 인코딩을 하지 않게 한다.
    }
    
    let url = "/www.y-y.hs.kr/lunch.view?date=20190429"; 
    request(options, function(err, response, body){ //callback function()
        if(err != null) {
            console.log(err); //에러가 나온다면 true아니면 null로 받아옴
            return;
        }
    
        const enc = charset(response.headers, body); //사이트의 인코딩을 알아냄
        const result = iconv.decode(body, enc);
    
        $ = cheerio.load(result);
        let menu = $(".menuName > span");

        res.render('lunch', {menu:menu.text()});
    });
});

app.get('/board', function(req, res) {
    let sql = "SELECT * FROM board WHERE title LIKE ? ORDER BY id DESC";
    
    let keyword = "%%";
    if(req.query.key != undefined) {
        keyword = "%" + req.query.key + "%"; //검색어 받아오기
    }

    //여러개일 수도 있으니 배열로 받는다.
    conn.query(sql, [keyword], function(err, result) {
        //console.log(result); //가져온 쿼리 확인

        res.render('board', {list:result});
    });
});

app.get('/board/write', function(req, res) {
    res.render('write', {});
});

app.post('/board/write', function(req, res) {
    let param = [req.body.title, req.body.content, req.body.writer];
    
    let sql = "INSERT INTO board (title, content, writer) VALUES(?, ?, ?)";
    conn.query(sql, param, function(err, result) {
        if(!err) {
            res.redirect('/board');
        }
    });
});

let server = http.createServer(app);
server.listen(app.get('port'), function() {
    console.log(`Express 엔진이 ${app.get('port')}에서 실행중`);
});