import React, { useEffect, useState } from 'react'
import { FaCode } from "react-icons/fa";
import { Card, Avatar, Col, Typography, Row } from 'antd';
import axios from 'axios';
import moment from 'moment';
const { Title } = Typography;
const { Meta } = Card;
function LandingPage() {

    const [Videos, setVideos] = useState([]) //비디오 정보 배열에 저장

    useEffect(() => { //몽고DB에서 DOM이 로드 되자마자 실행
        axios.get('/api/video/getVideos') //db에서 비디오정보 가져오기
            .then(response => {
                if (response.data.success) {
                    console.log(response.data.videos)
                    setVideos(response.data.videos)
                } else {
                    alert('비디오 가져오기를 실패했습니다')
                }
            })
    }, []) //[] = DOM실행됬을때 한번만 실행

    const renderCards = Videos.map((video, index) => { // map형식으로 

        var minutes = Math.floor(video.duration / 60); //video.duration(러닝타임)/60 = 분
        var seconds = Math.floor(video.duration - minutes * 60); //minutes/60 = 초

        return <Col lg={6} md={8} xs={24}> {/* 창크기가 가장클때는 6, 중간일때는 8, 가장작을때는 24 사이즈 (반응형)*/}
            <div style={{ position: 'relative' }}> 
                <a href={`/video/${video._id}`} > {/* 클릭시 상세페이지로 넘어가는 링크 */}
                <img style={{ width: '100%' }} alt="thumbnail" src={`http://localhost:5000/${video.thumbnail}`} />{/* 썸네일부분 */}
                <div className=" duration"
                    style={{ bottom: 0, right:0, position: 'absolute', margin: '4px', 
                    color: '#fff', backgroundColor: 'rgba(17, 17, 17, 0.8)', opacity: 0.8, 
                    padding: '2px 4px', borderRadius:'2px', letterSpacing:'0.5px', fontSize:'12px',
                    fontWeight:'500', lineHeight:'12px' }}>
                    <span>{minutes} : {seconds}</span>
                </div>
                </a>
            </div><br />
            <Meta
                avatar={ //유저 이미지
                    <Avatar src={video.writer.image} />
                }
                title={video.title} //비디오 제목
            />
            <span>{video.writer.name} </span><br /> {/* 작성자 이름 */}
            <span style={{ marginLeft: '3rem' }}> {video.views}</span>  {/* 비디오 조회수*/}
            - <span> {moment(video.createdAt).format("MMM Do YY")} </span>{/* 업데이트 날짜 */}
        </Col>

    })



    return (
        <div style={{ width: '85%', margin: '3rem auto' }}>
            <Title level={2} > 추천 동영상 </Title>
            <hr />

            <Row gutter={16}>
                {renderCards}
            </Row>
        </div>
    )
}

export default LandingPage
