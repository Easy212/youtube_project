const express = require('express');
const router = express.Router();
const { Comment } = require("../models/Comment");

const { auth } = require("../middleware/auth");

//=================================
//             Comment
//=================================


router.post("/saveComment", (req, res) => { //댓글 저장하기

    const comment = new Comment(req.body) //Comment 스키마를 사용하여 새로운 Comment 모델을 생성

    comment.save((err, comment) => { // 몽고DB에 저장
        if (err) return res.json({ success: false, err }) // 에러가 발생한 경우 에러 메시지와 함께 JSON 응답으로 클라이언트에게 반환

        Comment.find({ '_id': comment._id }) //몽고DB의 find() 메소드를 사용하여 _id가 comment._id와 같은 Comment 객체를 찾기
            .populate('writer') // Comment 모델의 writer 속성 값을 사용하여 해당 사용자 정보가져오기
            .exec((err, result) => { //Mongoose 쿼리실행
                if (err) return res.json({ success: false, err }) //실패시
                return res.status(200).json({ success: true, result }) //성공시
            })
    })

})

router.post("/getComments", (req, res) => {

    Comment.find({ "postId": req.body.videoId })
        .populate('writer')
        .exec((err, comments) => {
            if (err) return res.status(400).send(err)
            res.status(200).json({ success: true, comments })
        })

});

module.exports = router;
