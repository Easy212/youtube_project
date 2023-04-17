import React, { useEffect, useState } from 'react'
import axios from 'axios';
function Subscriber(props) {
    const userTo = props.userTo
    const userFrom = props.userFrom

    const [SubscribeNumber, setSubscribeNumber] = useState(0) //구독자수는 0부터시작
    const [Subscribed, setSubscribed] = useState(false) //기본값 false

    const onSubscribe = ( ) => {

        let subscribeVariables = {
                userTo : userTo, //디테일 비디오 페이지에서 props로 받음
                userFrom : userFrom//디테일 비디오 페이지에서 props로 받음
        }

        if(Subscribed) {
            //이미 구독중이라면
            axios.post('/api/subscribe/unSubscribe', subscribeVariables) //요청 날리기
                .then(response => { //서버에서 응답
                    if(response.data.success){  //응답성공시
                        setSubscribeNumber(SubscribeNumber - 1) //구독취소하는 것이니 기존 SubscribeNumber에 -1
                        setSubscribed(!Subscribed) // Subscribed상태를 현재의 Subscribed의 반대 즉 Subscribe
                    } else { //응답 실패시
                        alert('구독취소를 실패 했습니다')
                    }
                })

        } else {
            // 아직 구독중이 아니라면
            axios.post('/api/subscribe/subscribe', subscribeVariables) //요청 날리기
                .then(response => { //서버에서 응답
                    if(response.data.success) { //응답성공시
                        setSubscribeNumber(SubscribeNumber + 1) //구독을 하는 것이니 기존 SubscribeNumber에 +1
                        setSubscribed(!Subscribed) // Subscribed상태를 현재의 Subscribe의 반대 즉 Subscribed
                    } else { //응답 실패시
                        alert('구독을 실패 했습니다')
                    }
                })
        }

    }

    //DB에서 구독정보 가져오기
    useEffect(() => {

        const subscribeNumberVariables = { userTo: userTo, userFrom: userFrom } //디테일 비디오페이지에서 props로 받음
        axios.post('/api/subscribe/subscribeNumber', subscribeNumberVariables)
            .then(response => {
                if (response.data.success) {
                    setSubscribeNumber(response.data.subscribeNumber)
                } else {
                    alert('구독자 수 정보를 받아오지 못했습니다')
                }
            })

        axios.post('/api/subscribe/subscribed', subscribeNumberVariables)
            .then(response => {
                if (response.data.success) {
                    setSubscribed(response.data.subcribed)
                } else {
                    alert('구독정보를 받아오지 못했습니다')
                }
            })

    }, [])


    return (
        <div>
            <button 
            onClick={onSubscribe}
            style={{
                backgroundColor: `${Subscribed ? '#AAAAAA' : '#CC0000'}`, //구독을 하고있을때의 색:#AAAAAA 안하고있을때의 색:#CC0000
                borderRadius: '4px', color: 'white',
                padding: '10px 16px', fontWeight: '500', fontSize: '1rem', textTransform: 'uppercase'
            }}>
                {SubscribeNumber} {Subscribed ? 'Subscribed' : 'Subscribe'} {/* 구독을 하고있다면 Subscribed 안하고있다면 Subscribe*/}
            </button>
        </div>
    )
}

export default Subscriber

