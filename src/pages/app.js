import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Upload, Button } from "antd";
import SparkMd5 from "spark-md5";
import "./app.scss";
import "antd/dist/antd.css";
export default function App() {
  const [time, setTime] = useState(null);
  const [timeByWorker, setTimeByWorker] = useState(null);
  const worker = new Worker("/readFileAsBuffer.js");
  const calculateHash = (file, chunkSize) =>
    new Promise((resolve, reject) => {
      let blobSlice =
          File.prototype.slice ||
          File.prototype.mozSlice ||
          File.prototype.webkitSlice,
        chunks = Math.ceil(file.size / chunkSize),
        currentChunk = 0,
        spark = new SparkMd5.ArrayBuffer(),
        fileReader = new FileReader();

      fileReader.onload = function (e) {
        spark.append(e.target.result); // Append array buffer
        console.log("current chunk index", currentChunk);
        currentChunk++;
        if (currentChunk < chunks) {
          loadNext();
        } else {
          let fileHash = spark.end(); //compute hash
          resolve(fileHash);
        }
      };

      fileReader.onerror = function (e) {
        reject(e);
      };

      function loadNext() {
        const start = currentChunk * chunkSize,
          end = start + chunkSize >= file.size ? file.size : start + chunkSize;

        fileReader.readAsArrayBuffer(blobSlice.call(file, start, end));
      }

      loadNext();
    });

  const calculateHashByWorker = (file, chunkSize) =>
    new Promise((resolve, reject) => {
      let blobSlice =
          File.prototype.slice ||
          File.prototype.mozSlice ||
          File.prototype.webkitSlice,
        chunks = Math.ceil(file.size / chunkSize),
        currentChunk = 0,
        spark = new SparkMd5.ArrayBuffer(),
        fileReader = new FileReader();

      fileReader.onload = function (e) {
        worker.postMessage(
          {
            operation: "sendArrayBuffer",
            input: e.target.result,
            threshold: 0.8,
            finish: true,
          },
          [e.target.result]
        );
      };

      fileReader.onerror = function (e) {
        reject(e);
      };
      fileReader.readAsArrayBuffer(blobSlice.call(file, 0, file.size));
      worker.onmessage = function (e) {
        console.log("收到", e.data);
        resolve(e.data);
      };
    });
  const onChange = (info) => {
    console.log("onChange", info);
  };
  const beforeUpload = async (file) => {
    setTime(null);
    const start = performance.now();
    const hash = await calculateHash(file, 1024 * 1024);
    const end = performance.now();
    setTime((end - start) / 1000);
    console.log("file", file, hash, `cost ${(end - start) / 1000}s`);
    return Promise.reject();
  };
  const beforeUploadByWorker = async (file) => {
    setTimeByWorker(null);
    const start = performance.now();
    const hash = await calculateHashByWorker(file, 1024 * 1024);
    const end = performance.now();
    setTimeByWorker((end - start) / 1000);
    console.log("file", file, hash, `cost ${(end - start) / 1000}s`);
    return Promise.reject();
  };

  return (
    <div className="container">
      <h1>欢迎！</h1>
      <Upload beforeUpload={beforeUpload} onChange={onChange}>
        <Button> Click to Upload</Button>
        {time && `calc hash cost ${time} s`}
      </Upload>
      <Upload beforeUpload={beforeUploadByWorker} onChange={onChange}>
        <Button> Click to Upload</Button>
        {time && `calc hash cost ${timeByWorker} s`}
      </Upload>
      <Link to="/login">去登陆</Link>
      <br />
      <Link to="/home">去首页</Link>
    </div>
  );
}
