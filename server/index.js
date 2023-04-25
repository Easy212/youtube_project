const express = require("express"); // express 모듈 불러오기
const app = express(); // express 어플리케이션 생성
const path = require("path"); // 노드.js에서 제공하는 파일 경로 관련 유틸리티 모듈 불러오기
const cors = require('cors') // CORS (Cross-Origin Resource Sharing)을 가능하게 해주는 미들웨어를 불러오기

const bodyParser = require("body-parser"); // 요청의 본문(body)을 해석하는 미들웨어 불러오기
const cookieParser = require("cookie-parser"); // 쿠키(cookie)를 다루기 위한 미들웨어 불러오기

const config = require("./config/key"); // 환경 변수나 설정 정보들을 포함하는 파일을 불러오기
const mongoose = require("mongoose"); //몽고DB연결을 위한 mongoose 불러오기

const connect = mongoose.connect(config.mongoURI, //몽고DB연결
  { // 몽구스 6.0부터는 기본값으로 useNewUrlParser와 useUnifiedTopology가 true로 설정
    // useCreateIndex와 useFindAndModify는 true로 설정되어 있지 않으면, MongoDB의 새로운 버전에서 경고가 발생하므로 설정 필요
    useNewUrlParser: true, // MongoDB의 새로운 URL 구문을 사용할 수 있도록 지원
    useUnifiedTopology: true, // MongoDB의 새로운 서버 디스커버리 및 모니터링 엔진을 사용하도록 지원
    useCreateIndex: true, //Model.createIndex() 함수가 더 이상 사용되지 않는다는 경고를 피하기 위해 인덱스 생성을 사용
    useFindAndModify: false // MongoDB 4.0 이상에서 사용되지 않으므로 false로 설정하여 경고를 방지
  })

  .then(() => console.log('MongoDB 연결됨')) //연결 성공시

  .catch(err => console.log(err)); //연결 실패시

app.use(cors())

//데이터를 파싱하기 위한 옵션을 설정
app.use(bodyParser.urlencoded({ extended: true })); //URL-encoded 데이터를 추출하고 req.body 객체에 저장되어 라우트 핸들러에서 사용

app.use(bodyParser.json()); //HTTP POST, PUT, DELETE 등의 요청 메서드로 전송된 요청의 body 데이터를 추출하여 JSON 형태로 파싱

app.use(cookieParser()); // 쿠키를 구문 분석하고 클라이언트에서 보내진 쿠키를 가져오는 데 사용(세션관리)


// Express.js를 사용하여 경로설정 
app.use('/api/users', require('./routes/users')); // /api/users 경로로 들어오는 요청은 ./routes/users 모듈에서 처리
app.use('/api/video', require('./routes/video'));// /api/video 경로로 들어오는 요청은 ./routes/video모듈에서 처리
app.use('/api/subscribe', require('./routes/subscribe')); // /api/subscribe 경로로 들어오는 요청은 ./routes/subscribe 모듈에서 처리
app.use('/api/comment', require('./routes/comment')); 
app.use('/api/like', require('./routes/like'));


app.use('/uploads', express.static('uploads')); //uploads 폴더에 저장된 파일들을 제공

// Node.js 애플리케이션의 환경 변수 (process.env.NODE_ENV)가 "production"인 경우에만 실행
if (process.env.NODE_ENV === "production") {

// 폴더에서 정적 파일을 제공하도록 설정
  app.use(express.static("client/build")); // Express 서버가 client/build  폴더에서 정적 파일을 찾아 제공


  //서버에서 클라이언트의 모든 요청에 대해 index.html 파일을 제공하도록 설정
  //클라이언트 측에서 라우팅을 처리하기 위해, 모든 요청에 대해 index.html 파일을 제공
  app.get("*", (req, res) => { //모든 페이지 경로에서
    res.sendFile(path.resolve(__dirname, "../client", "build", "index.html")); // index.html 파일을 서버에서 클라이언트로 전송
  });
}

const port = process.env.PORT || 5000 // 환경변수(process.env)에서 포트 번호를 가져오거나 포트번호가 없으면 기본값 5000을 사용

app.listen(port, () => { //Express 서버 구동
  console.log(`서버 포트연결 ${port}`)
});