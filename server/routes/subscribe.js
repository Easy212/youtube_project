const express = require('express');
const router = express.Router();


const { Subscriber } = require("../models/Subscriber");



//=================================
//             Subscribe
//=================================

//구독자수 확인
router.post("/subscribeNumber", (req, res) => { 

    Subscriber.find({ "userTo": req.body.userTo }) //Subscriber모델에서 userTo를 찾기
    .exec((err, subscribe) => { //Mongoose 쿼리(콜백함수)
        if(err) return res.status(400).send(err) //에러 발생시 400코드와 에러메세지 리턴

        res.status(200).json({ success: true, subscribeNumber: subscribe.length  })//성공시 200코드와 0구독자수 리턴
    })

});


//구독
router.post("/subscribed", (req, res) => { 

    Subscriber.find({ "userTo": req.body.userTo , "userFrom": req.body.userFrom }) //하나의 정보라도 있다면 구독을 하고있다는것
    .exec((err, subscribe) => {
        if(err) return res.status(400).send(err) // 데이터가 없다면 
        let result = false; //구독을 안하고있는것
        if(subscribe.length !== 0) { //구독자수가 0이 아니라면 result 기본값 true
            result = true
        }

        res.status(200).json({ success: true, subcribed: result  }) //subcribe에
    })

});


// 아직 구독중이 아니라면
router.post("/subscribe", (req, res) => { //db에 

    const subscribe = new Subscriber(req.body); //모든 정보(userTo와 userFrom을 저장)

    subscribe.save((err, doc) => {
        if(err) return res.json({ success: false, err }) //실패시 에러메시지
        return res.status(200).json({ success: true }) //성공시 200코드 와 success메시지 리턴
    })

});

//이미 구독중이라면
router.post("/unSubscribe", (req, res) => {

    console.log(req.body)

    Subscriber.findOneAndDelete({ userTo: req.body.userTo, userFrom: req.body.userFrom }) // .findOneAndDelete = userTo와 userFrom 값을 사용하여 Subscriber에 해당하는 정보 삭제
        .exec((err, doc)=>{
            if(err) return res.status(400).json({ success: false, err}); //에러 발생시 400코드와 에러메세지 리턴
            res.status(200).json({ success: true, doc }) //성공시 200코드 와 success메시지 및 doc리턴
        })
});



module.exports = router;
