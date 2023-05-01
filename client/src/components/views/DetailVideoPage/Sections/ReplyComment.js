import React, { useEffect, useState} from 'react'
import SingleComment from './SingleComment';
import axios from 'axios';

function ReplyComment(props) { 
    const [ChildCommentNumber, setChildCommentNumber] = useState(0)
    const [OpenReplyComments, setOpenReplyComments] = useState(false)

    useEffect(() => {
        let commentNumber = 0;
        if (props.CommentLists) {
            props.CommentLists.map((comment) => {
            if (comment && comment.responseTo === props.parentCommentId) {
                commentNumber++;
            }
            });
        }
        setChildCommentNumber(commentNumber);
    }, [props.CommentLists, props.parentCommentId]);

    const handleDelete = (commentId) => {
        axios.delete(`/api/comment/deleteComment?id=${commentId}`)
          .then(response => {
            if (response.data.success) {
              const updatedCommentLists = props.CommentLists.filter(comment => comment._id !== commentId && comment.responseTo !== commentId);
              response.data.success && props.refreshFunction(updatedCommentLists);
            } else {
              alert('댓글 삭제에 실패하였습니다.');
            }
          })
          .catch((error) => {
            console.log(error);
          });
    };

      let renderReplyComment = (parentCommentId) => {
        return props.CommentLists.map((comment, index) => (
          <React.Fragment key={comment._id}>
            {comment.responseTo === parentCommentId && (
              <div style={{ width: "80%", marginLeft: "40px" }}>
                <SingleComment
                  comment={comment}
                  postId={props.postId}
                  refreshFunction={props.refreshFunction}
                />
                <ReplyComment
                  CommentLists={props.CommentLists}
                  parentCommentId={comment._id}
                  postId={props.postId}
                  refreshFunction={props.refreshFunction}
                />
                {comment.writer._id === props.userId && (
                  <button onClick={() => handleDelete(comment._id)}>삭제</button>
                )}
              </div>
            )}
          </React.Fragment>
        ));
      };

    const handleChange = () => {
        setOpenReplyComments(!OpenReplyComments)
    }


    return (
        <div>

            {ChildCommentNumber > 0 &&
                <p style={{ fontSize: '14px', margin: 0, color: 'gray' }}
                    onClick={handleChange} >
                    답글 {ChildCommentNumber}개
             </p>
            }

            {OpenReplyComments &&
                renderReplyComment(props.parentCommentId)
            }

        </div>
    )
}
export default ReplyComment
