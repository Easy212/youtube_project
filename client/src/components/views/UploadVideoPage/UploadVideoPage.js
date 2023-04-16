import React, { useState, useEffect } from 'react'
import { Typography, Button, Form, message, Input, Icon } from 'antd';
import Dropzone from 'react-dropzone';
import axios from 'axios';
import { useSelector } from "react-redux"; //리덕스 훅

const { Title } = Typography;
const { TextArea } = Input;

const Private = [ //map 메소드를 활용하여 키와 값으로 데이터 전달
    { value: 0, label: 'Private' },
    { value: 1, label: 'Public' }
]

const Catogory = [ //map 메소드를 활용하여 키와 값으로 데이터 전달
    { value: 0, label: "Film & Animation" },
    { value: 0, label: "Autos & Vehicles" },
    { value: 0, label: "Music" },
    { value: 0, label: "Pets & Animals" },
    { value: 0, label: "Sports" },
]

function UploadVideoPage(props) {
    const user = useSelector(state => state.user);  // 리덕스훅 = state에서 user 에대한 모든 정보가 담김
    //useState안에 value값을 저장하고 서버에 보낼때 모든 useState을 보내줌
    const [title, setTitle] = useState(""); //제목 value값
    const [Description, setDescription] = useState(""); //내용 value값
    const [privacy, setPrivacy] = useState(0) //option value값 기본값은 0 = private / 1 = public
    const [Categories, setCategories] = useState("Film & Animation") //카테고리 기본값 = Film & Animation
    const [FilePath, setFilePath] = useState("") // 파일 경로
    const [Duration, setDuration] = useState("") // 파일 러닝타임
    const [Thumbnail, setThumbnail] = useState("") //썸네일


    const handleChangeTitle = (event) => { //onChange 함수
        setTitle(event.currentTarget.value) //제목 입력한값을 셋팅
    }

    const handleChangeDecsription = (event) => {
        console.log(event.currentTarget.value)

        setDescription(event.currentTarget.value)
    }

    const handleChangeOne = (event) => {
        setPrivacy(event.currentTarget.value)
    }

    const handleChangeTwo = (event) => {
        setCategories(event.currentTarget.value)
    }

    const onSubmit = (event) => { //onSubmit동작함수

        event.preventDefault(); //새로고침 방지

        if (user.userData && !user.userData.isAuth) {
            return alert('로그인후 이용가능 합니다')
        }

        if (title === "" || Description === "" ||
            Categories === "" || FilePath === "" ||
            Duration === "" || Thumbnail === "") {
            return alert('모든 필드를 입력해주세요')
        }

        const variables = { 
            writer: user.userData._id, //작성자의 ID
            title: title,
            description: Description,
            privacy: privacy,
            filePath: FilePath,
            category: Categories,
            duration: Duration,
            thumbnail: Thumbnail
        }

        axios.post('/api/video/uploadVideo', variables) //Axios를 사용하여 서버에 보냄
            .then(response => {
                if (response.data.success) {//응답 성공하면
                    alert('파일 업로드를 성공했습니다')
                    props.history.push('/')
                } else { //응답 실패시하면
                    alert('파일 업로드를 실패했습니다')
                }
            })

    }

    const onDrop = (files) => { //files 파라미터에는 업로드한 파일의 정보가 담겨있음
        //서버에 request를 주고받을때사용 하는 axios(ajax와 비슷한개념)
        let formData = new FormData(); //FormData 생성
        const config = {
            header: { 'content-type': 'multipart/form-data' } // 헤더에 설정값을 넣지않으면 오류발생
        }
        console.log(files)
        formData.append("file", files[0])

        axios.post('/api/video/uploadfiles', formData, config) //Axios를 사용하여 서버에 보냄
            .then(response => {
                if (response.data.success) { //응답 성공하면

                    let variable = {
                        filePath: response.data.filePath, // url
                        fileName: response.data.fileName // 파일명
                    }
                    setFilePath(response.data.filePath)

                    axios.post('/api/video/thumbnail', variable) //파일 업로드 성공한후에 다시 Axios를 사용하여 서버에 보냄
                    .then(response => {
                        if (response.data.success) {  //성공시
                            setDuration(response.data.fileDuration)
                            setThumbnail(response.data.thumbsFilePath)
                        } else {
                            alert('썸네일 생성에 실패했습니다'); //실패시
                        }
                    })


                } else { //응답 실패시
                    alert('파일 업로드를 실패 했습니다')
                }
            })

    }

    return (
        <div style={{ maxWidth: '700px', margin: '2rem auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <Title level={2} > Upload Video</Title>
            </div>

            <Form onSubmit={onSubmit}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    
                    <Dropzone //파일 업로드 라이브러리
                    onDrop={onDrop}
                    multiple={false} //파일을 한번에 한개만 올릴건지 여러개 올린건지 false = 한개만 / true = 여러개
                    maxSize={800000000} //파일 사이즈
                    > 

                    {({ getRootProps, getInputProps }) => (
                        <div style={{ width: '300px', height: '240px', border: '1px solid lightgray', display: 'flex', 
                        alignItems: 'center', justifyContent: 'center' }} {...getRootProps()}>
                            <input {...getInputProps()} />
                            <Icon type="plus" style={{ fontSize: '3rem' }} />

                        </div>
                        )}
                    </Dropzone> 

                    {Thumbnail !== "" && //Thumbnail패스가 있을 경우만 아래 div랜더링
                        <div>
                            <img src={`http://localhost:5000/${Thumbnail}`} alt="Thumbnail" />
                        </div>
                    }
                </div>

                <br /><br />
                <label>Title</label>
                <Input
                    onChange={handleChangeTitle}
                    value={title}
                />
                <br /><br />
                <label>Description</label>
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
                    Submit
            </Button>

            </Form>
        </div>
    )
}

export default UploadVideoPage
