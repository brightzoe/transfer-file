import React, { useEffect, useState } from "react";
import { Upload, Button } from "antd";
import axios from "axios";
import { saveAs } from "file-saver";
import { calculateHash, calculateHashByWorker } from "../utils/upload";
import { downloadFileByA, downloadFileByBlob, getBinaryContent, asyncPool, saveByBlob } from "../utils/download";
import "./app.scss";
import "antd/dist/antd.css";
export default function App() {
  const [time, setTime] = useState(null);
  const [timeByWorker, setTimeByWorker] = useState(null);
  const worker = new Worker("/readFileAsBuffer.js");

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
    const hash = await calculateHashByWorker(file, 1024 * 1024, worker);
    const end = performance.now();
    setTimeByWorker((end - start) / 1000);
    console.log("file", file, hash, `cost ${(end - start) / 1000}s`);
    return Promise.reject();
  };

  const download1 = () => {
    // 无法重命名
    downloadFileByA("http://localhost:8080/down/video.flv", "aa.flv");
  };
  const download2 = () => {
    downloadFileByBlob("down/reader.mp4", "aa.mp4");
  };

  const SIZE = 20 * 1024 * 1024; //设置切片的大小
  const CONTENT_LENGTH = 794359202; //从接口获取文件大小

  const download3 = async () => {
    let chunks = Math.ceil(CONTENT_LENGTH / SIZE);
    let chunksArray = [...new Array(chunks).keys()];
    console.log("arr", chunksArray);
    let results = await asyncPool(3, chunksArray, (i) => {
      let start = i * SIZE;
      let end = i + 1 === chunks ? CONTENT_LENGTH : (i + 1) * SIZE - 1;
      return getBinaryContent(`down/reader.mp4`, start, end, i);
    });
    results.sort((a, b) => a.index - b.index);
    let arr = results.map((r) => r.data?.data);
    console.log("arr", arr);
    const blob = new Blob(arr, { type: "application/octet-stream" });
    saveByBlob("mp4.mp4", blob);
  };
  const download4 = async () => {
    downloadFileByA("http://localhost:8080/down/video.flv/cust.flv", "cust.flv");
  };
  const download5 = () => {
    saveAs("http://localhost:8080/down/video.flv", "abc.flv");
  };
  return (
    <div className="container">
      <Upload beforeUpload={beforeUpload} onChange={onChange}>
        <Button> calc hash</Button>
        {time && `calc hash cost ${time} s`}
      </Upload>
      <Upload beforeUpload={beforeUploadByWorker} onChange={onChange}>
        <Button> calc hash by Worker</Button>
        {timeByWorker && `calc hash cost ${timeByWorker} s`}
      </Upload>
      <Button onClick={download1}>download by a</Button>
      <Button onClick={download2}>download by blob</Button>
      <Button onClick={download3}>download by partial blob</Button>
      <Button onClick={download4}>download by pass filename</Button>
      <Button onClick={download5}>download by file saver</Button>
    </div>
  );
}
