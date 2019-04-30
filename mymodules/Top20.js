const request = require('request');
const cheerio = require('cheerio');

module.exports = function(callback) {
    request("https://www.naver.com", function(err, response, body){ //res가 아닌 response로 한 이유는 위에 res랑 겹쳐서임
        let list = [];
        $ = cheerio.load(body);

        let top20 = $(".ah_roll_area > .ah_l .ah_item .ah_k");
        for(let i = 0; i < top20.length; i++) {
            let msg = $(top20[i]).text();
            list.push(msg);
        }

        callback(list); //비동기라서 return list하면 막 실행되버림 / function(callback)해주고 callback(list)해주자.
    });
}