import React, { Suspense } from 'react'; // 로딩이 끝날 때까지 기다리는 동안 임시 UI를 렌더링 하는 컴포넌트
import { Route, Switch } from "react-router-dom"; // 렌더링할 컴포넌트를 선택하는 라우팅
import Auth from "../hoc/auth"; //Auth = React에서 인증  담당 / 사용자 인증 정보를 확인하여 접근 권한을 제어

// 페이지 컴포넌트들
import LandingPage from "./views/LandingPage/LandingPage.js";
import LoginPage from "./views/LoginPage/LoginPage.js";
import RegisterPage from "./views/RegisterPage/RegisterPage.js";
import NavBar from "./views/NavBar/NavBar";
import Footer from "./views/Footer/Footer"
import UploadVideoPage from './views/UploadVideoPage/UploadVideoPage.js';
import DetailVideoPage from './views/DetailVideoPage/DetailVideoPage.js'
import EditVideoPage from './views/DetailVideoPage/EditVideoPage.js'
import SubscriptionPage from './views/SubscriptionPage/SubscriptionPage.js'


function App() {
  return (
    <Suspense fallback={(<div>Loading...</div>)}> {/* fallback = 로딩 중임을 나타내는 UI를 지정하는 속성*/}
      <NavBar />
      <div style={{ paddingTop: '75px', minHeight: 'calc(100vh - 80px)' }}>
        <Switch> {/* 컴포넌트를 그룹화하고 그 중 하나만 렌더링 */}
          <Route exact path="/" component={Auth(LandingPage, null)} /> {/* null = 로그인 관계없이 이동 */}
          <Route exact path="/login" component={Auth(LoginPage, false)} /> {/* false = 로그인 되어있으면 이동 */}
          <Route exact path="/register" component={Auth(RegisterPage, false)} /> {/* false = 로그인 안되어있으면 이동 */}
          <Route exact path="/video/upload" component={Auth(UploadVideoPage, true)} /> {/* true = 로그인 해야만 이동  */}      
          <Route exact path="/video/:videoId" component={Auth(DetailVideoPage, null)} /> {/* null = 로그인 관계없이 이동 */}   
          <Route exact path="/video/edit/:videoId" component={Auth(EditVideoPage, true)} /> 
          <Route exact path="/subscription" component={Auth(SubscriptionPage, true)} /> {/* true =로그인 해야만 이동 */} 
        </Switch>
      </div>
      <Footer />
    </Suspense>
  );
}

export default App;
