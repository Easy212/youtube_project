import React, { useState, useEffect } from 'react'
import { Comment, Avatar, Button, Input, Modal } from 'antd';
import Axios from 'axios';
import { useSelector } from 'react-redux';
import LikeDislikes from './LikeDislikes';


const { TextArea } = Input;
function SingleComment(props) {
    const user = useSelector(state => state.user);
    const [CommentValue, setCommentValue] = useState("")
    const [OpenReply, setOpenReply] = useState(false)
    const [DeleteConfirm, setDeleteConfirm] = useState(false);


    const handleChange = (e) => {
        setCommentValue(e.currentTarget.value)
    }

    const openReply = () => {
        setOpenReply(!OpenReply)
    }

    const onSubmit = (e) => {
        e.preventDefault();

        const variables = {
            writer: user.userData._id,
            postId: props.postId,
            responseTo: props.comment._id,
            content: CommentValue
        }
        
        if (!user.userData._id) { //if (!user.userData._id) = user 객체가 null이면 true를 반환 즉 사용자가 로그인하지 않은 경우에는 알림 메시지를 띄우고 종료
            alert('로그인 후에 답글을 작성할 수 있습니다.');
            return;
        }


        Axios.post('/api/comment/saveComment', variables)
        .then(response => {
          if (response.data.success) {
            setCommentValue("")
            setOpenReply(!OpenReply)
            return props.refreshFunction(); // API 호출이 완료된 후에 화면을 갱신
          } else {
            alert('댓글 저장에 실패 했습니다.')
          }
        })
        .catch(error => console.log(error));
    }

    const onDelete = () => {
        setDeleteConfirm(true);
    };
    
    const onOk = () => {
        const commentId = props.comment._id;
        const writerId = props.comment.writer._id;
        const currentUserId = user.userData._id;
    
        if (currentUserId !== writerId) {
            alert('삭제 권한이 없습니다.');
            return;
        }
    
        Axios.delete(`/api/comment/deleteComment?id=${commentId}`)
            .then(response => {
                if (response.data.success) {
                    setDeleteConfirm(false);
                    props.refreshFunction(response.data.result); // 삭제된 댓글의 정보를 전달
                } else {
                    alert('댓글 삭제에 실패 했습니다.');
                }
            });
    };
    
    const onCancel = () => {
        setDeleteConfirm(false);
    };

    const actions = [
        <LikeDislikes comment commentId={props.comment._id} userId={localStorage.getItem('userId')} />,
        <span onClick={openReply} key="comment-basic-reply-to">답글쓰기 </span>,
        user.userData && user.userData._id === props.comment.writer._id &&
        <span onClick={onDelete} key="comment-basic-delete">삭제</span>
    ]

    return (
        <div>
        <Comment
            actions={actions}
            author={props.comment.writer.name}
            avatar={
                <Avatar
                    src={props.comment.writer.image}
                    alt="image"
                />
            }
            content={
                <p>
                    {props.comment.content}
                </p>
            }
        ></Comment>

        {OpenReply &&
            <form style={{ display: 'flex' }} onSubmit={onSubmit}>
                <TextArea
                    style={{ width: '100%', borderRadius: '5px' }}
                    onChange={handleChange}
                    value={CommentValue}
                    placeholder="답글을 작성 해주세요"
                />
                <br />
                <Button style={{ width: '20%', height: '52px' }} onClick={onSubmit}>답글 달기</Button>
            </form>
        }

        <Modal
            title="댓글 삭제"
            visible={DeleteConfirm}
            onOk={onOk}
            onCancel={onCancel}
        >
            <p>이 댓글을 삭제하시겠습니까?</p>
        </Modal>
    </div>
    )
}

export default SingleComment
