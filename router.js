//module을 불러온다.
const express = require('express');
const request = require('request');
const cheerio = require('cheerio');
const qs = require('querystring');
const mysql = require('mysql');

const router = express.Router();

const dbinfo = require('./dbinfo');
const Top20 = require('./mymodules/Top20');
const Lunch = require('./mymodules/Lunch');
const datalab = require('./mymodules/NaverData');

/* mysql 연결 부분 */
const conn = mysql.createConnection(dbinfo);

conn.query("USE yy_30220"); //yy_30220 데이터베이스 사용
/* mysql 연결 종료 */

//슬래쉬가 올때 main.ejs로 보내줌
router.all('/', function(req, res) {
    res.render('main', {msg: 'Welcome To Express4'});
});

router.get('/top20', function(req, res) {
    Top20(function(list) {
        res.render('top', {msg:'네이버 실시간 급 상승 겁색어!', list:list});
    });
});

router.get('/search', function(req, res) {
    res.render('search', {list:list = undefined});
});

router.post('/search', function(req, res) {
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

router.get('/lunch', function(req, res) {
    res.render('lunch', {});
});

router.post('/lunch', function(req, res) {
    Lunch(req.body.date, function(menu) {
        res.render('lunch', {menu:menu});
    });
});

router.get('/board', function(req, res) {
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

router.get('/board/write', function(req, res) {
    res.render('write', {});
});

router.post('/board/write', function(req, res) {
    let param = [req.body.title, req.body.content, req.body.writer];
    
    let sql = "INSERT INTO board (title, content, writer) VALUES(?, ?, ?)";
    conn.query(sql, param, function(err, result) {
        if(!err) {
            res.redirect('/board');
        }
    });
});

router.get('/datalab2', function(req, res) {
    res.render('datalab', {});
});

router.post("/datalab2", function(req, res) {
    let data = [
        { "groupName": req.body.word, "keywords": [] }
    ];

    if(req.body.key == null) {
        //키워드를 안넣으면 넣은 제목이 키워드가 됨
        data[0].keywords = req.body.word;
    }
    else if(req.body.key != null) {
        let keyWord = req.body.key.split(",");

        if(keyWord.length > 10) {
            //키워드가 10개 이상일시 제목이 키워드가 됨
            keyWord = req.body.word;
        }
        else {
            for(let i = 0; i < keyWord.length; i++) {
                data[0].keywords[i] = keyWord[i];
            }
        }
    }

    datalab("2019-02-01", "2019-05-01", "week", data, function(result) {
        let colors = ["rgb(75, 192, 192)", "rgb(75, 141, 111)", "rgb(11, 123, 231)"];
        let gData = {"labels": [], "datasets": []};

        let r = result.results;
        console.log(r);
        for(let i = 0; i < r.length; i++) {
            let item = {
                "label":r[i].title, 
                "borderColor":colors[i], 
                "fill":false, 
                "lineTension":0.2, 
                "data":[]
            };

            for(let j = 0; j < r[i].data.length; j++) {
                item.data.push(r[i].data[j].ratio);
                if(i == 0) {
                    let date = r[i].data[j].period;
                    let arr = date.split("-"); //-를 기점으로 다 짤라서 년도 / 월 / 일로 받아온다.
                    gData.labels.push(arr[1] + '/' + arr[2]); //그중에서 월 / 일만 합쳐서 합체
                }
            }

            gData.datasets.push(item);
        }

        res.render('datalab2', {g:gData});
    });
});

module.exports = router; //외부 파일로 빼서 router가 빠져나온다.