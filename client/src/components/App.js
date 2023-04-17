import React, { Suspense } from 'react';
import { Route, Switch } from "react-router-dom";
import Auth from "../hoc/auth";
// pages for this product
import LandingPage from "./views/LandingPage/LandingPage.js";
import LoginPage from "./views/LoginPage/LoginPage.js";
import RegisterPage from "./views/RegisterPage/RegisterPage.js";
import NavBar from "./views/NavBar/NavBar";
import Footer from "./views/Footer/Footer"
import UploadVideoPage from './views/UploadVideoPage/UploadVideoPage.js';
import DetailVideoPage from './views/DetailVideoPage/DetailVideoPage.js'
import SubscriptionPage from './views/SubscriptionPage/SubscriptionPage.js'

//null   Anyone Can go inside
//true   only logged in user can go inside
//false  logged in user can't go inside

function App() {
  return (
    <Suspense fallback={(<div>Loading...</div>)}>
      <NavBar />
      <div style={{ paddingTop: '69px', minHeight: 'calc(100vh - 80px)' }}>
        <Switch>
          <Route exact path="/" component={Auth(LandingPage, null)} /> {/* null = 로그인 관계없이 이동 */}
          <Route exact path="/login" component={Auth(LoginPage, false)} /> {/* false = 로그인 되어있으면 이동 */}
          <Route exact path="/register" component={Auth(RegisterPage, false)} /> {/* false = 로그인 안되어있으면 이동 */}
          <Route exact path="/video/upload" component={Auth(UploadVideoPage, true)} /> {/* true = 로그인 해야만 이동  */}      
          <Route exact path="/video/:videoId" component={Auth(DetailVideoPage, null)} /> {/* null = 로그인 관계없이 이동 */}      
          <Route exact path="/subscription" component={Auth(SubscriptionPage, true)} /> {/* true =로그인 해야만 이동 */} 
        </Switch>
      </div>
      <Footer />
    </Suspense>
  );
}

export default App;
