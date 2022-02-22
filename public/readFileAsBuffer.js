importScripts("./spark-md5.js");

const spark = new SparkMD5.ArrayBuffer();
const saveArrayBuffer = [];
const start = false;
const finish = false;

/*接收到主线程发来的文件*/
onmessage = function (event) {
  console.log("worker", event);
  spark.append(event.data.input);
  const md5 = spark.end();
  postMessage(md5);
};
