import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import App from "./pages/app";
import Home from "./pages/home";
import Detail from "./pages/detail";
import NoMatch from "./pages/404";

export default function IRouter() {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={App}></Route>
        <Route path="/home" component={Home}>

        </Route>
        <Route path="/detail/:id" component={Detail}></Route>
        {/* 动态路由 */}
        <Route path="*" component={NoMatch}></Route>
        {/* 前面都没匹配到,其他的所有都404 */}
      </Switch>
    </Router>
  );
}
