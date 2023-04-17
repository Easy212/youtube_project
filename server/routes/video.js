const express = require('express');
const router = express.Router();
const multer = require('multer');
var ffmpeg = require('fluent-ffmpeg');
const { Video } = require("../models/Video");
const { Subscriber } = require("../models/Subscriber");
const { auth } = require("../middleware/auth");

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

var upload = multer({ storage: storage }).single("file") // 업로드 시 어떤 파일을 어떻게 저장할 것인지 설정/ .single() = 파일 하나만 업로드할때 사용


//=================================
//             User
//=================================


//파일 저장
router.post("/uploadfiles", (req, res) => { // req를통해 파일을 받아옴
    //비디오파일을 서버에 저장
    upload(req, res, err => {
        if (err) { //에러가 나면
            return res.json({ success: false, err })//json형식으로 axios에 보냄
        }//성공하면
        return res.json({ success: true, filePath: res.req.file.path, fileName: res.req.file.filename }) //json형식으로 axios에 보냄
    })

});

//비디오 정보들을 몽고DB에 저장
router.post("/uploadVideo", (req, res) => { //index.js 에서 요청 보내
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

   
    ffmpeg.ffprobe(req.body.filePath, function(err, metadata){  //비디오 러닝타임 정보 가져오기
        console.dir(metadata);
        console.log(metadata.format.duration); //파일의 러닝타임

        fileDuration = metadata.format.duration;
    })

    ffmpeg(req.body.filePath) // 파일이 저장된 경로
        .on('filenames', function (filenames) { //비디오 썸네일 파일 이름 생성
            console.log('Will generate ' + filenames.join(', '))
            thumbsFilePath = "uploads/thumbnails/" + filenames[0];
        })
        .on('end', function () { //썸네일 생성후 어떤 작업을 할것인지
            console.log('Screenshots taken'); // 
            return res.json({ success: true, thumbsFilePath: thumbsFilePath, fileDuration: fileDuration})
        })
        .screenshots({ 
            // Will take screens at 20%, 40%, 60% and 80% of the video
            count: 1, // 3개의 썸네일
            folder: 'uploads/thumbnails', //uploads/thumbnails안에 썸네일 파일이 저장
            size:'320x240', //썸네일 사이즈
            // %b input basename ( filename w/o extension )
            filename:'thumbnail-%b.png' //파일이름 = thumbnail-파일이름.png
        });

});


router.get("/getVideos", (req, res) => {
    //비디오를 DB에서 가져온 후 클라이언트에 보여주기
    Video.find() //Video 모델에서 찾기
        .populate('writer') // populate을 해주지않으면 모든 정보가아닌 writer의 ID값만 가져옴
        .exec((err, videos) => { //Mongoose 쿼리(콜백함수)
            if(err) return res.status(400).send(err); //에러 발생시 400메세지와 에러메세지 리턴
            res.status(200).json({ success: true, videos }) //성공시 200메세지와 비디오정보 리턴
        })
});


router.post("/getVideoDetail", (req, res) => {

    Video.findOne({ "_id" : req.body.videoId })//id값을 이용해 비디오 찾기
    .populate('writer')  // populate을 해주지않으면 모든 정보가아닌 writer의 ID값만 가져옴
    .exec((err, video) => { //Mongoose 쿼리(콜백함수) 
        if(err) return res.status(400).send(err); //에러 발생시 400메세지와 에러메세지 리턴
        res.status(200).json({ success: true, video }) //성공시 200메세지와 비디오정보 리턴
    }) 
});


//구독한 비디오
router.post("/getSubscriptionVideos", (req, res) => {

    // 내 아이디를 가지고 구독한 사람 찾기
    Subscriber.find({ 'userFrom': req.body.userFrom })
    .exec((err, subscribers)=> {
        if(err) return res.status(400).send(err);

        let subscribedUser = []; //userto 정보담을 빈배열

        subscribers.map((subscriber, i)=> {
            subscribedUser.push(subscriber.userTo)
        })


        // 찾은사람들의 비디오를 가져오기
        Video.find({ writer: { $in: subscribedUser }})// 여러명 일땐req.body사용불가 / $in: 메소드 =
            .populate('writer')
            .exec((err, videos) => {
                if(err) return res.status(400).send(err);
                res.status(200).json({ success: true, videos })
            })
    })
});

module.exports = router;
