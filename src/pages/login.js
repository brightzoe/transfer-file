import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { Form, Input, Button } from "antd";
import axios from "axios";
import "./app.scss";
import "antd/dist/antd.css";

const FormItem = Form.Item;
export default function Login() {
  const [name, setName] = useState("");
  const [pwd, setPwd] = useState("");
  const history = useHistory();
  return (
    <Form className="login-form">
      <FormItem>
        <Input
          type="text"
          placeholder="请输入用户名"
          maxLength={5}
          onChange={(e) => setName(e.target.value)}
        ></Input>
      </FormItem>
      <FormItem>
        <Input
          type="password"
          placeholder="请输入密码"
          maxLength={15}
          onChange={(e) => setPwd(e.target.value)}
        ></Input>
      </FormItem>
      <label>
        {name}--{pwd}
        {/* 显示用户名和密码 */}
      </label>
      <FormItem>
        <Button
          type="primary"
          onClick={() => {
            login(name, pwd).then((response) => {
              let res = response.data;
              if (res.code === 0) {
                history.push("/home");
              }
            });
          }}
        >
          登录
        </Button>
      </FormItem>
    </Form>
  );
}

function login(name, pwd) {
  return axios.get("/login.json", {
    params: {
      name,
      pwd,
    },
  }); //返回promise
}
