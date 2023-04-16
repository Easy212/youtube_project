import React, { useEffect, useState } from 'react'
import axios from 'axios';
function Subscriber(props) {
    const userTo = props.userTo
    const userFrom = props.userFrom

    const [SubscribeNumber, setSubscribeNumber] = useState(0) //구독자수는 0부터시작
    const [Subscribed, setSubscribed] = useState(false) //기본값 false

    const onSubscribe = ( ) => {

        let subscribeVariables = {
                userTo : userTo, 
                userFrom : userFrom
        }

        if(Subscribed) {
            //when we are already subscribed 
            axios.post('/api/subscribe/unSubscribe', subscribeVariables)
                .then(response => {
                    if(response.data.success){ 
                        setSubscribeNumber(SubscribeNumber - 1)
                        setSubscribed(!Subscribed)
                    } else {
                        alert('Failed to unsubscribe')
                    }
                })

        } else {
            // when we are not subscribed yet
            
            axios.post('/api/subscribe/subscribe', subscribeVariables)
                .then(response => {
                    if(response.data.success) {
                        setSubscribeNumber(SubscribeNumber + 1)
                        setSubscribed(!Subscribed)
                    } else {
                        alert('Failed to subscribe')
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

