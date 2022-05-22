import React from "react";
import { useParams, useHistory } from "react-router-dom";
import { Button } from "antd";
import "./app.scss";
import "antd/dist/antd.css";
export default function Detail() {
  const history = useHistory(); //路由地址跳转
  const params = useParams(); //获取路由的属性
  return (
    <div className="container">
      <p>this is detail.</p>
      <p>当前参数值为：{params.id}</p>
      <Button
        onClick={() => {
          history.push("/");
        }}
      >
        跳转首页
      </Button>
    </div>
  );
}
// export default class Detail extends React.Component{
// 	handleJump = ()=>{
// 		this.props.history.push('/login')
// 	}
// 	render() {
// 		return <div>
// 			<h1>欢迎</h1>
// 			<p>当前ID为：{this.props.match.params.id}</p>
// 		</div>
// 	}
// }
