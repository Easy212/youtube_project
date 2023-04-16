import React, { useEffect, useState } from 'react'
import { List, Avatar, Row, Col } from 'antd';
import axios from 'axios';
import SideVideo from './Sections/SideVideo';
import Subscriber from './Sections/Subscriber';
import Comments from './Sections/Comments'
import LikeDislikes from './Sections/LikeDislikes';
function DetailVideoPage(props) {


    const videoId = props.match.params.videoId //비디오 ID가져오기 (/video/:videoId의 URL해당 페이지의 URL에서 :videoId 자리에 들어가는 값)
    const [Video, setVideo] = useState([])
    const [CommentLists, setCommentLists] = useState([])

    const videoVariable = {videoId: videoId} // 

    useEffect(() => {
        axios.post('/api/video/getVideoDetail', videoVariable) //post로 요청
            .then(response => {
                if (response.data.success) {
                    console.log(response.data.video)
                    setVideo(response.data.video)
                } else {
                    alert('비디오 정보 가져오기를 실패했습니다')
                }
            })

        axios.post('/api/comment/getComments', videoVariable)
            .then(response => {
                if (response.data.success) {
                    console.log('response.data.comments',response.data.comments)
                    setCommentLists(response.data.comments)
                } else {
                    alert('비디오 정보 가져오기를 실패했습니다')
                }
            })


    }, [])

    const updateComment = (newComment) => {
        setCommentLists(CommentLists.concat(newComment))
    }


    if (Video.writer) { //이미지 정보를 가져오기전에 DetailVideoPage이 먼저 렌더링되면 에러가뜨니까 Video.writer가 있을 경우에만 랜더링
        return (
            <Row>
                <Col lg={18} xs={24}> {/*반응형 사이즈 조절 */}
                    <div className="postPage" style={{ width: '100%', padding: '3rem 4em' }}>
                        <video style={{ width: '100%' }} src={`http://localhost:5000/${Video.filePath}`} controls></video> {/* 비디오 서버포트 5000/${Video.filePath} = 경로*/}

                        <List.Item
                            actions={[<LikeDislikes video videoId={videoId} userId={localStorage.getItem('userId')}  />, //
                            <Subscriber userTo={Video.writer._id} userFrom={localStorage.getItem('userId')} />]} //구독 
                        >
                            <List.Item.Meta
                                avatar={<Avatar src={Video.writer && Video.writer.image} />} //유저 이미지
                                title={Video.title}//제목
                                description={Video.description}  //내용
                            />
                            <div></div>
                        </List.Item>

                        <Comments CommentLists={CommentLists} postId={Video._id} refreshFunction={updateComment} />{/* 댓글 부분 */}

                    </div>
                </Col>
                <Col lg={6} xs={24}> {/* 사이드쪽 비디오 목록 반응형 사이즈 조절 */}

                    <SideVideo />

                </Col>
            </Row>
        )

    } else {
        return (
            <div>로딩중....</div>
        )
    }


}

export default DetailVideoPage

