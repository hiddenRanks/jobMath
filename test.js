const qs = require('querystring');  //노드의 기본 모듈 url인코딩을 해줌

let string = "This is 한글 쿼리";
let encodedStr = qs.escape(string);

console.log(encodedStr);