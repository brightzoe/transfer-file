const express = require("express");
const fs = require("fs");
const fsp = require("fs").promises;
const path = require("path");
const multer = require("multer"); //解析上传的文件
const cors = require("cors");
const compression = require("compression");
const app = express();
const uploader = multer({ dest: __dirname + "/uploads/" });
app.locals.pretty = true; //美化源码
app.use(compression());

app.use((req, res, next) => {
  console.log("req", req.method, req.url);
  next();
});

app.use(express.static(__dirname + "/static")); //文件资源服务器，请求的资源在此路径下
app.use("/uploads/", express.static(__dirname + "/uploads"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.route("/upload").post(uploader.single("avatar"), async (req, res, next) => {
  let file = req.file;
  let name = req.name;
  let targetName = file ? file.path + "-" + file.originalname : "avatar.png";
  console.log("收到文件", req, res, file);
  file && (await fsp.rename(file.path, targetName));
});

app.get("/down/:name/:filename?", (req, res) => {
  const { name, filename } = req.params;
  //获取文件的位置 和文件的大小
  let filePath = path.resolve(__dirname, "uploads/", name);
  let size = fs.statSync(filePath).size;
  //获取请求头的range字段
  let range = req.headers["range"];
  let file = path.resolve(__dirname, "uploads/", name);
  //不使用分片下载  直接传输文件
  if (!range) {
    //res.set({'Accept-Ranges':'bytes'})
    res.set({
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename=${filename || name}`,
    });
    fs.createReadStream(file).pipe(res);
    return;
  }
  //获取分片的开始和结束位置
  let bytesV = range.split("=");
  bytesV.shift();
  let [start, end] = bytesV.join("").split("-");
  start = Number(start);
  end = Number(end);
  //分片开始 结束位置不对 拒绝下载
  if (start > size || end > size) {
    res.set({ "Content-Range": `bytes */${size}` });
    res.status(416).send(null);
    return;
  }
  //开始分片下载
  res.status(206);
  res.set({
    "Accept-Ranges": "bytes",
    "Content-Range": `bytes ${start}-${end ? end : size}/${size}`,
  });

  console.log(start + "---" + end);
  fs.createReadStream(file, { start, end }).pipe(res);
});

app.listen(8080, console.log("8080"));
