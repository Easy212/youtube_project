const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const videoSchema = mongoose.Schema({
    writer: {
        type:Schema.Types.ObjectId, //글을 쓰는 사람의 id
        ref: 'User' //User모델의 모든정보를 id만 입력해도 가져옴
    },
    title: {
        type:String,
        maxlength:50,
    },
    description: {
        type: String,
    },
    privacy: {
        type: Number,
    },
    filePath : {
        type: String,
    },
    catogory: String,
    views : { //뷰 조회수
        type: Number,
        default: 0 
    },
    duration :{
        type: String
    },
    thumbnail: {
        type: String
    }
}, { timestamps: true }) //만든날짜와 업데이트 날짜 표시를 위해 true


const Video = mongoose.model('Video', videoSchema);

module.exports = { Video }