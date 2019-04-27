const request = require('request');
const cheerio = require('cheerio'); //서버에서 jQuery와 비슷하게 사용할수 있게됨

const options = {
    url: 'http://www.y-y.hs.kr/lunch.view?date=20190429',
    headers: {
        'User-Agent': 'Mozilla/5.0',
        'Content-Type': 'text/html; charset=utf-8'
    },
    encoding: 'utf8'
}

let url = "/www.y-y.hs.kr/lunch.view?date=20190429"; 
request(options, function(err, res, body){
    if(err != null) {
        console.log(err); //에러가 나온다면 true아니면 null로 받아옴
        return;
    }

    console.log(body);
    $ = cheerio.load(body);

    //let list = $(".ah_roll_area > .ah_l .ah_item .ah_k"); //naver 인기검색 순위
    let list = $(".menuName > span");
    // for(let i = 0; i < list.length; i++) {
    //     let txt = $(list[i]).text();
    //     console.log(txt);
    // }
    console.log(list);
    console.log(list.text());
});