const express = require('express');
const router = express.Router();
const { User } = require("../models/User");
const { auth } = require("../middleware/auth");

//=================================
//             User
//=================================

//사용자 인증정보(로그인한 사용자가 어떤 권한을 가지고 있는지 등)
router.get("/auth", auth, (req, res) => { // /auth 경로로 GET 요청이 들어왔을 때 실행
    res.status(200).json({ // auth 미들웨어가 먼저 실행(auth 미들웨어는 인증된 사용자인지 확인)
        _id: req.user._id,
        isAdmin: req.user.role === 0 ? false : true, // 사용자의 권한(0이면 일반 사용자, 1이면 관리자)
        isAuth: true, //인증된 사용자인지 여부확인 (인증되었다면 true, 아니라면 false)
        email: req.user.email, // 이메일 주소
        name: req.user.name, // 이름
        role: req.user.role, // 사용자의 권한을 나타내는 숫자 값
        image: req.user.image, // 사용자의 프로필 이미지 경로
    });
});


// 회원가입
router.post("/register", (req, res) => {
    const user = new User(req.body); //req.body => 클라이언트에서 보낸 모든variables이 저장

    user.save((err, doc) => { //몽고DB에 저장
        if (err) return res.json({ success: false, err }); //실패시
        return res.status(200).json({ //성공시
            success: true
        });
    });
});


// 로그인
router.post("/login", (req, res) => {
    User.findOne({ email: req.body.email }, (err, user) => {
        if (!user)
            return res.json({
                loginSuccess: false,
                message: "인증실패, 이메일 주소를 찾을수 없습니다"
            });

        user.comparePassword(req.body.password, (err, isMatch) => { //로그인 폼에서 입력한 비밀번호를 전달
            if (!isMatch) //비밀번호가 일치하지않는다면
                return res.json({ loginSuccess: false, message: "비밀번호가 일치하지 않습니다" });

            user.generateToken((err, user) => {
                if (err) return res.status(400).send(err);
                res.cookie("w_authExp", user.tokenExp);
                res
                    .cookie("w_auth", user.token)
                    .status(200)
                    .json({
                        loginSuccess: true, userId: user._id
                    });
            });
        });
    });
});


//로그아웃
router.get("/logout", auth, (req, res) => {
    User.findOneAndUpdate({ _id: req.user._id }, { token: "", tokenExp: "" }, (err, doc) => {
        if (err) return res.json({ success: false, err });
        return res.status(200).send({
            success: true
        });
    });
});

module.exports = router;
