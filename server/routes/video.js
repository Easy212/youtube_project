const express = require('express');
const router = express.Router(); //express에서 제공하는 router

const multer = require('multer'); // multer = 파일업로드를 위한 모듈
var ffmpeg = require('fluent-ffmpeg'); // 오디오, 비디오 등 미디어 파일의 인코딩, 디코딩, 변환 하는 프레임워크
const { Video } = require("../models/Video"); // mongoose 모듈에서 Video 모델을 가져오기
const { Subscriber } = require("../models/Subscriber"); // mongoose 모듈에서 Subscriber 모델을 가져오기
//const { auth } = require("../middleware/auth");


var storage = multer.diskStorage({ 
    destination: (req, file, cb) => { // destinatio= 파일을 어디경로로 저장할지 설정
        cb(null, 'uploads/') //uploads폴더에 저장
    },
    filename: (req, file, cb) => { //파일이름을 무엇으로 저장 할것인지
        cb(null, `${Date.now()}_${file.originalname}`)//현재날짜 및 시간_파일이름으로 저장(중복되지않게)
    },
    fileFilter: (req, file, cb) => { //파일확장자 설정
        const ext = path.extname(file.originalname)
        if (ext !== '.mp4') { //mp4만 업로드가능 (다른확장자의 경우 똑같이 |추가해주면됨 ex: || ext !== '.jpg')
            return cb(res.status(400).end('only jpg, png, mp4 is allowed'), false);
        }
        cb(null, true)
    }
})

var upload = multer({ storage: storage }).single("file") 
// 업로드 시 어떤 파일을 어떻게 저장할 것인지 설정/ .single() = 파일 하나만 업로드할때 사용



//파일 저장
router.post("/uploadfiles", (req, res) => { // req를통해 파일을 받아옴
    //동영상 파일을 서버에 저장요청
    upload(req, res, err => {
        if (err) { //실패시
            return res.json({ success: false, err })//json형식으로 axios에 보냄
        }//성공시
        return res.json({ success: true, filePath: res.req.file.path, fileName: res.req.file.filename }) //json형식으로 axios에 보냄
    })

});

//동영상 정보들을 몽고DB에 저장
router.post("/uploadVideo", (req, res) => { //index.js 에서 요청
    const video = new Video(req.body) // req.body => 클라이언트에서 보낸 모든variables이 저장

    video.save((err, video) => { //몽고DB에 저장
        if(err) return res.status(400).json({ success: false, err }) //에러 발생시 400코드와 err메세지 반환
        return res.status(200).json({success: true}) //저장 성공시 발생시 200코드와 성공 메세지 반환
    })

});
//썸네일 생성 하기
router.post("/thumbnail", (req, res) => {
    let thumbsFilePath ="";
    let fileDuration ="";

   
    // 미디어파일의 정보추출
    ffmpeg.ffprobe(req.body.filePath, function(err, metadata){  //metadata 안에는 업로드된 동영상에 대한 모든 정보가 들어있음
        console.dir(metadata); //console.dir = 객체의속성을 모두 나열해 보고싶을때 사용
        console.log(metadata.format.duration); //동영상 러닝타임 정보만 가져오기
        fileDuration = metadata.format.duration;
    })

    ffmpeg(req.body.filePath) // 파일이 저장된 경로
        .on('filenames', function (filenames) { //비디오 썸네일 파일 이름 생성
            console.log('썸네일생성:' + filenames)
            thumbsFilePath = "uploads/thumbnails/" + filenames[0];
        })
        .on('end', function () { //썸네일 생성후 어떤 작업을 할것인지
            console.log('파일저장경로:'+thumbsFilePath);
            console.log('러닝타임:'+fileDuration);
            return res.json({ success: true, thumbsFilePath: thumbsFilePath, fileDuration: fileDuration})
        })
        .screenshots({ 
            count: 1, // 1개의 썸네일
            folder: 'uploads/thumbnails', //uploads/thumbnails안에 썸네일 파일이 저장
            size:'320x240', //썸네일 사이즈
            filename:'thumbnail-%b.png' //파일이름 = thumbnail-파일이름.png / %b = 업로드된 파일의 원래이름
        });

});



//비디오를 DB에서 가져온 후 클라이언트에 보여주기
router.get("/getVideos", (req, res) => {
    
    Video.find() //Video 모델에서 찾기
        .populate('writer') // populate을 해주지않으면 모든 정보가아닌 writer의 ID값만 가져옴
        .exec((err, videos) => { //Mongoose 쿼리실행
            if(err) return res.status(400).send(err); //에러 발생시 400코드와 에러메세지 리턴
            res.status(200).json({ success: true, videos }) //성공시 200코드와 비디오정보 리턴
        })
});

//비디오 상세정보 가져온후 클라이언트 보여주기
router.post("/getVideoDetail", (req, res) => {

    Video.findOne({ "_id" : req.body.videoId })//Video 모델에서 id값을 이용해 비디오 찾기
    .populate('writer')  // populate을 해주지않으면 모든 정보가아닌 writer의 ID값만 가져옴
    .exec((err, video) => { //Mongoose 쿼리(콜백함수) 
        if(err) return res.status(400).send(err); //에러 발생시 400코드와 에러메세지 리턴
        res.status(200).json({ success: true, video }) //성공시 200코드와 비디오정보 리턴
    }) 
});


//구독한 비디오
router.post("/getSubscriptionVideos", (req, res) => {

    // 내 아이디를 가지고 구독한 사람 찾기
    Subscriber.find({ 'userFrom': req.body.userFrom }) // Subscriber 모델에서 userFrom이 현재 사용자의 아이디와 같은 경우 찾기
    .exec((err, subscribers)=> {
        if(err) return res.status(400).send(err);

        let subscribedUser = []; //user to 정보담을 빈배열

        subscribers.map((subscriber, i)=> {  //subscribers 배열의 모든 요소에 대해 반복
            subscribedUser.push(subscriber.userTo) //구독자를 찾으면  subscriber의 userTo 값을 배열에 추가
        })

        // 찾은사람들의 비디오를 가져오기
        Video.find({ writer: { $in: subscribedUser }})// $in: 메소드 = 배열에 포함된 user 중 하나와 일치하는 경우 찾기
            .populate('writer')  //writer 필드가 참조하는 User 모델의 정보 모두 가져오기
            .exec((err, videos) => {
                if(err) return res.status(400).send(err);
                res.status(200).json({ success: true, videos }) //찾은 비디오들을 반환
            })
    })
});


// 비디오 삭제 요청 처리
router.post('/deleteVideo', (req, res) => {
  Video.findOneAndDelete({ _id: req.body.videoId }, (err, video) => {
    if (err) {
      return res.json({ success: false, err });
    }
    if (!video) {
      return res.json({ success: false, message: '해당 비디오를 찾을 수 없습니다.' });
    }
    return res.json({ success: true });
  });
});


router.post("/editVideo", (req, res) => {
    const { videoId, title, description } = req.body;
  
    // 수정할 비디오 정보 업데이트
    Video.findOneAndUpdate(
      { _id: videoId },
      { $set: { title: title, description: description } },
      { new: true }
    )
      .exec((err, video) => {
        if (err) return res.status(400).json({ success: false, err });
        if (!video)
          return res.status(404).json({ success: false, message: '해당 비디오를 찾을 수 없습니다.' });
  
        return res.status(200).json({ success: true, video });
      });
  });


  router.post("/updateViews", (req, res) => {
    Video.findByIdAndUpdate(req.body.videoId, { $inc: { views: 1 } }, { new: true })
      .exec((err, video) => {
        if (err) return res.status(400).send(err);
        res.status(200).json({ success: true, views: video.views });
      });
  });


module.exports = router;
