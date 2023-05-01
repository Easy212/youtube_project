import React, { useEffect, useState } from 'react'
import { List, Avatar, Row, Col, Button} from 'antd';
import { useSelector } from "react-redux";
import axios from 'axios';

import SideVideo from './Sections/SideVideo';
import Subscriber from './Sections/Subscriber';
import CommentsLogin from './Sections/CommentsLogin'
import LikeDislikes from './Sections/LikeDislikes';
import CommentsLogout from './Sections/ComentsLogout';


function DetailVideoPage(props) {
    const user = useSelector(state => state.user)
    const videoId = props.match.params.videoId //해당페이지의 비디오 ID가져오기 (/video/:videoId의 URL해당 페이지의 URL에서 :videoId 자리에 들어가는 값)
    const [Video, setVideo] = useState([])
    const [CommentLists, setCommentLists] = useState([])
    const [CommentKey, setCommentKey] = useState(0); // key값 추가
    const videoVariable = {videoId: videoId} //비디오 ID값


    //비디오 정보 가져오기
    useEffect(() => { //컴포넌트가 렌더링된 이후 특정 동작을 수행
        axios.post('/api/video/getVideoDetail', videoVariable) //videoVariable에 담긴 videoId 값을 가지고 해당 비디오의 정보를 가져옴
            .then(response => {
                if (response.data.success) { //요청 성공시
                    console.log(response.data.video)
                    setVideo(response.data.video)// video state 값을 해당 비디오 정보로 업데이트
                } else { //실패시
                    alert('비디오 정보 가져오기를 실패했습니다')
                }
            })

        axios.post('/api/comment/getComments', videoVariable)
            .then(response => {
                if (response.data.success) {
                    console.log('response.data.comments',response.data.comments)
                    setCommentLists(response.data.comments)
                } else {
                    alert('댓글 정보 가져오기를 실패했습니다')
                }
            })


    }, [])

    const updateComment = (newComment) => {
        setCommentLists(CommentLists.concat(newComment))
    } 

    const handleDelete = () => {
        const confirm = window.confirm("정말로 이 동영상을 삭제하시겠습니까?");
        if (confirm) {
            axios.post('/api/video/deleteVideo', videoVariable)
                .then(response => {
                    if (response.data.success) {
                        alert('동영상 삭제를 성공했습니다.');
                        props.history.push('/');
                    } else {
                        alert('동영상 삭제를 실패했습니다.');
                    }
                });
        }
    };

    const handleEdit = () => {
        props.history.push(`/video/edit/${videoId}`)
    }

    if (Video.writer) { //이미지 정보를 가져오기전에 DetailVideoPage이 먼저 렌더링되면 에러가뜨니까 Video.writer가 있을 경우에만 랜더링
       const SubscribeButton =  Video.writer._id !== localStorage.getItem('userId') && <Subscriber userTo={Video.writer._id} userFrom={localStorage.getItem('userId')} />
       const isOwner = user.userData && user.userData._id === Video.writer._id;
       
        return ( 
            <Row> {/*  Ant Design 그리드 방식*/}
                <Col lg={18} xs={24}> {/*반응형 사이즈 조절 */}
                    <div className="postPage" style={{ width: '100%', padding: '3rem 4em' }}>
                        <video style={{ width: '100%' }} src={`http://localhost:5000/${Video.filePath}`} controls></video> {/* 비디오 서버포트 5000/Video모델의 filePath 속성의 경로*/}

                        <List.Item
                            actions={[
                            <LikeDislikes video videoId={videoId} userId={localStorage.getItem('userId')}  />, //좋아요
                            SubscribeButton,
                            isOwner && <Button onClick={handleEdit}>수정</Button>,
                            isOwner && <Button onClick={handleDelete}>삭제</Button>
                        ]} 
                        >
                            <List.Item.Meta
                                avatar={<Avatar src={Video.writer && Video.writer.image} />} //유저 이미지
                                title={Video.title}//제목
                                description={Video.description}  //내용
                            />
                            <div></div>
                        </List.Item>

                        <CommentsLogin CommentLists={CommentLists} postId={Video._id} refreshFunction={updateComment} /> {/* 댓글리스트*/}
                        

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