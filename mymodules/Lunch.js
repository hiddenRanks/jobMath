const request = require('request');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');
const charset = require('charset');

module.exports = function(date, callback) {
    
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

        callback(menu.text());
    });
}