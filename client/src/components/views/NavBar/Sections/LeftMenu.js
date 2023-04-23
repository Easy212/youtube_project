import React from 'react';
import { Menu } from 'antd';

function LeftMenu(props) {
  return (
    <Menu mode={props.mode}>
      <Menu.Item key="mail">
        <a href="/">Home</a>
      </Menu.Item>
      
      <Menu.Item key="subscription">
        <a href="/subscription">구독페이지</a>
      </Menu.Item>
  </Menu>
  )
}

export default LeftMenu