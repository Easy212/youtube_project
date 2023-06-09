import React, { useState } from 'react'
import { Button, Input } from 'antd';
import axios from 'axios';
import { useSelector } from 'react-redux';
import SingleComment from './SingleComment';
import ReplyComment from './ReplyComment';
const { TextArea } = Input;

function CommentsLogin(props) {
    const user = useSelector(state => state.user)
    const [Comment, setComment] = useState("")

    const handleChange = (e) => {
        setComment(e.currentTarget.value)
    }

    const onSubmit = (e) => {
        e.preventDefault();

        // 로그인되어 있지 않은 경우
        if (!user.userData.isAuth) {
            alert('로그인 후에 댓글을 작성할 수 있습니다.');
            return;
        }

        const variables = {
            content: Comment,
            writer: user.userData._id,
            postId: props.postId
        }

        axios.post('/api/comment/saveComment', variables)
            .then(response => {
                if (response.data.success) {
                    setComment("")
                    props.refreshFunction(response.data.result)
                } else {
                    alert('댓글저장에 실패 했습니다.')
                }
            })
    }

    const handleDelete = (commentId) => {
        const confirm = window.confirm("정말로 이 댓글을 삭제하시겠습니까?");
        if (confirm) {
          axios.delete(`/api/comment/deleteComment?id=${commentId}`)
            .then(response => {
              if (response.data.success) {
                const newCommentLists = props.CommentLists.filter(comment => comment._id !== commentId);
                props.refreshFunction(newCommentLists);
              } else {
                alert('댓글 삭제에 실패했습니다.');
              }
            })
            .catch(error => {
              console.log(error);
            });
        }
      };

    return (
        <div>
            <br />
            <p>댓글목록</p>
            <hr />
            {/* 댓글리스트  */}
            {props.CommentLists && props.CommentLists.map((comment, index) => (
                (comment && !comment.responseTo &&
                    <React.Fragment key={comment._id}>
                        <SingleComment comment={comment} postId={props.postId} refreshFunction={props.refreshFunction} handleDelete={handleDelete} />
                        <ReplyComment CommentLists={props.CommentLists} postId={props.postId} parentCommentId={comment._id} refreshFunction={props.refreshFunction} />
                    </React.Fragment>
                )
            ))}


            {/* Root Comment Form */}
            <form style={{ display: 'flex' }} onSubmit={onSubmit}>
                <TextArea
                    style={{ width: '100%', borderRadius: '5px' }}
                    onChange={handleChange}
                    value={Comment}
                    placeholder="댓글을 작성해주세요"
                />
                <br />
                <Button style={{ width: '20%', height: '52px' }} onClick={onSubmit}>댓글달기</Button>
            </form>

        </div>
    )
}

export default CommentsLogin
