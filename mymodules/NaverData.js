const request = require('request');
const apikey = require('./apikeys');

module.exports = function (start, end, unit, data, callback) {
    let apiURL = "https://openapi.naver.com/v1/datalab/search";
    let req_body = {
        "startDate": start,
        "endDate": end,
        "timeUnit": unit,
        "keywordGroups": data
    }

    request.post(
        {
            url: apiURL,
            body: JSON.stringify(req_body), //JSON의 타입을 문자열로 받아온다. / JSON.parse(넣을 값)으로 하면 다시 JSON으로 받아온다.
            headers: {
                'X-Naver-Client-Id': apikey.CLIENT_ID,
                'X-Naver-Client-Secret': apikey.CLIENT_SECRET,
                'Content-Type': 'application/json'
            }
        },
        function (err, response, body) {
            callback(JSON.parse(body));
        }
    );
}