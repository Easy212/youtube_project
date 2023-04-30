import React, { useState, useEffect } from 'react';
import { Typography, Button, Form, message, Input, Icon } from 'antd';
import axios from 'axios';
import { useSelector } from 'react-redux';

const { Title } = Typography;
const { TextArea } = Input;

const Private = [ //map 메소드를 활용하여 키와 값으로 데이터 전달
    { value: 0, label: 'Private' },
    { value: 1, label: 'Public' }
]

const Catogory = [ //map 메소드를 활용하여 키와 값으로 데이터 전달
    { value: "Film & Animation", label: "Film & Animation" },
    { value: "Autos & Vehicles", label: "Autos & Vehicles" },
    { value: "Music", label: "Music" },
    { value: "Pets & Animals" , label: "Pets & Animals" },
    { value: "Sports", label: "Sports" },
]


function EditVideoPage(props) {
  const user = useSelector((state) => state.user);
  const [title, setTitle] = useState(""); //제목 value값
  const [Description, setDescription] = useState(""); //내용 value값
  const [privacy, setPrivacy] = useState(0) //option value값 기본값은 0 = private / 1 = public
  const [Categories, setCategories] = useState("Film & Animation") //카테고리 기본값 = Film & Animation

  // 수정 페이지에서 필요한 state 및 setState들
  const [video, setVideo] = useState([]);
  const videoId = props.match.params.videoId; // 해당 페이지의 비디오 ID를 가져오기
  const videoVariable = { videoId: videoId }; // 비디오 ID값을 변수에 담기


  // 수정할 비디오 정보를 가져오는 useEffect
  useEffect(() => {
    const videoId = props.match.params.videoId; // URL에서 비디오 ID를 가져옵니다 (/video/:videoId의 URL에서 :videoId 자리에 들어가는 값)
    const videoVariable = { videoId: videoId }; // 비디오 ID값을 변수에 담습니다

    axios.post('/api/video/getVideoDetail', videoVariable)
      .then((response) => {
        if (response.data.success) {
          const videoData = response.data.video;
          setVideo(videoData);
          setTitle(videoData.title);
          setDescription(videoData.description);
          setPrivacy(videoData.privacy);
          setCategories(videoData.category);
        } else {
          alert('비디오 정보 가져오기를 실패했습니다.');
        }
      });
  }, []);

  

  const handleChangeTitle = (event) => {
    setTitle(event.currentTarget.value)
  }

  const handleChangeDecsription = (event) => {
      setDescription(event.currentTarget.value)
  }

  const handleChangeOne = (event) => {
      setPrivacy(event.currentTarget.value)
  }

  const handleChangeTwo = (event) => {
      setCategories(event.currentTarget.value)
  }

  const onSubmit = (event) => {
    event.preventDefault();

    const variables = {
      videoId: videoId,
      title: title,
      writer: user.userData._id, //작성자의 ID
      description: Description, //내용
      privacy: privacy, //공개여부
      category: Catogory
    };

    axios.post('/api/video/editVideo', variables)
      .then((response) => {
        if (response.data.success) {
          message.success('비디오 수정을 성공했습니다.');
          props.history.push('/');
        } else {
          alert('비디오 수정을 실패했습니다.');
        }
      });
  };

  return (
    <div style={{ maxWidth: '700px', margin: '2rem auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <Title level={2}>동영상 정보 수정</Title>
      </div>

      <Form onSubmit={onSubmit} enctype="multipart/form-data">
        {/* 비디오 수정에 필요한 입력 폼들 */}
          <label>제목</label>
          <Input
              onChange={handleChangeTitle}
              value={title}
          />
          <br /><br />
          <label>내용</label>
          <TextArea
              onChange={handleChangeDecsription}
              value={Description}
          />
          <br /><br />

          <select onChange={handleChangeOne}>
              {Private.map((item, index) => (
                  <option key={index} value={item.value}>{item.label}</option>
              ))}
          </select>
          <br /><br />

          <select onChange={handleChangeTwo}>
              {Catogory.map((item, index) => (
                  <option key={index} value={item.label}>{item.label}</option>
              ))}
          </select>
        <br /><br />

        <Button type="primary" size="large" onClick={onSubmit}>
          저장
        </Button>
      </Form>
    </div>
  );
}

export default EditVideoPage