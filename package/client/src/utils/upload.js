import SparkMd5 from "spark-md5";

export const calculateHash = (file, chunkSize) =>
  new Promise((resolve, reject) => {
    let blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice,
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
export const calculateHashByWorker = (file,chunkSize, worker) =>
  new Promise((resolve, reject) => {
    let blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice,
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
