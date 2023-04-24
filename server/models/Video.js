const mongoose = require('mongoose'); //MongoDB를 다루기 위한 라이브러리
const Schema = mongoose.Schema; //MongoDB에서 컬렉션을 만들 때 필요한 문서의 형태를 정의하는 객체

const videoSchema = mongoose.Schema({
    writer: {
        type:Schema.Types.ObjectId, //글을 쓰는 사람의 id
        ref: 'User' //User모델의 모든정보를 id만 입력해도 가져옴
    },
    title: { //제목
        type:String,
        maxlength:50,
    },
    description: { //내용
        type: String,
    },
    privacy: { //공개여부
        type: Number,
    },
    filePath : { //파일 저장 경로
        type: String,
    },
    
    catogory: String, // 

    views : { //뷰 조회수
        type: Number,
        default: 0 
    },
    duration :{ //러닝타임
        type: String
    },
    thumbnail: { //썸네일
        type: String
    }
}, { timestamps: true }) //만든날짜와 업데이트 날짜 표시를 위해 true


const Video = mongoose.model('Video', videoSchema);

module.exports = { Video }