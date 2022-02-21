import React from "react";
import { HashRouter, Link, Route, Switch } from "react-router-dom";
// import { Button } from 'antd';
import "./app.scss";
import "antd/dist/antd.css";
export default function App() {
  return (
    <div className="container">
      <h1>欢迎！</h1>
      <Link to="/login">去登陆</Link>
      <br />
      <Link to="/home">去首页</Link>
    </div>
  );
}
