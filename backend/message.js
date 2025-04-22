const dgram = require("dgram");
const fs = require("fs");
const Discover = require("node-discover");

const udpSocket = dgram.createSocket("udp4");
const UDP_PORT = 41234;

const d = new Discover();
const userNodes = [];

d.on("added", (node) => {
  const exists = userNodes.some((n) => n.address === node.address && n.port === node.port);
  if (!exists && node.address !== d.address) {
    userNodes.push(node);
    console.log("New peer discovered:", node.address);
  }
});

function sendMessageToPeer(address, message) {
  const buffer = Buffer.from(message);
  udpSocket.send(buffer, 0, buffer.length, UDP_PORT, address);
}

function broadcastMessage(message) {
  userNodes.forEach((peer) => {
    sendMessageToPeer(peer.address, message);
  });
}

function splitFile(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  const chunkSize = 1024;
  const chunks = [];
  for (let i = 0; i < fileBuffer.length; i += chunkSize) {
    chunks.push(fileBuffer.slice(i, i + chunkSize));
  }
  return chunks;
}

const chunkStore = {};

function storeChunks(fileId, chunks) {
  chunkStore[fileId] = {};
  chunks.forEach((chunk, index) => {
    chunkStore[fileId][index] = chunk;
  });
}

function sendFile(filePath, fileId, address) {
  const chunks = splitFile(filePath);
  const totalChunks = chunks.length;
  storeChunks(fileId, chunks);

  const chunkMap = {
    type: "chunkMap",
    fileId,
    chunks: Object.keys(chunkStore[fileId]).map(Number),
    totalChunks
  };

  sendMessageToPeer(address, JSON.stringify(chunkMap));

  let chunkIndex = 0;
  function sendNextChunk() {
    if (chunkIndex < chunks.length) {
      const chunk = chunks[chunkIndex];
      const message = JSON.stringify({
        type: "chunkData",
        fileId,
        chunkIndex,
        chunk: chunk.toString("base64"),
        totalChunks
      });
      sendMessageToPeer(address, message);
      chunkIndex++;
      setTimeout(sendNextChunk, 50); // delay to avoid flooding
    }
  }
  sendNextChunk();
}

// Broadcast file to all peers
function broadcastFile(filePath) {
  const fileId = Date.now().toString();
  userNodes.forEach((peer) => {
    sendFile(filePath, fileId, peer.address);
  });
}

// === FILE RECEIVING ===

const receivedChunks = {};

function reconstructFile(fileId, totalChunks) {
  const chunks = [];
  for (let i = 0; i < totalChunks; i++) {
    if (!receivedChunks[fileId][i]) return; // wait for all chunks
    chunks.push(receivedChunks[fileId][i]);
  }
  const fileBuffer = Buffer.concat(chunks);
  const outputPath = `received_${fileId}`;
  fs.writeFileSync(outputPath, fileBuffer);
  console.log(`File ${fileId} saved as ${outputPath}`);
}

function startListening() {
  udpSocket.on("message", (msg, rinfo) => {
    try {
      const data = JSON.parse(msg.toString());

      if (data.type === "chunkMap") {
        const { fileId, totalChunks } = data;
        if (!receivedChunks[fileId]) receivedChunks[fileId] = {};
        receivedChunks[fileId].totalChunks = totalChunks;
      } else if (data.type === "chunkData") {
        const { fileId, chunkIndex, chunk, totalChunks } = data;
        if (!receivedChunks[fileId]) receivedChunks[fileId] = {};
        if (!receivedChunks[fileId][chunkIndex]) {
          receivedChunks[fileId][chunkIndex] = Buffer.from(chunk, "base64");
        }
        const receivedCount = Object.keys(receivedChunks[fileId]).filter(k => !isNaN(k)).length;
        if (receivedCount === totalChunks) {
          reconstructFile(fileId, totalChunks);
        }
      } else {
        console.log(`Text Message from ${rinfo.address}:${rinfo.port} → ${msg}`);
      }
    } catch (e) {
      console.log(`Text Message from ${rinfo.address}:${rinfo.port} → ${msg}`);
    }
  });

  udpSocket.bind(UDP_PORT,()=>
  {
    console.log("lisning here >",UDP_PORT)
  });
  
}

function getUserNodes() {
  return userNodes;
}


module.exports = {
  startListening,
  sendMessageToPeer,
  broadcastMessage,
  sendFile,
  broadcastFile,
  getUserNodes,
};




// const dgram = require("dgram");
// const fs = require("fs");
// const udpSocket = dgram.createSocket("udp4");
// const UDP_PORT = 41234;

// let socketReady = false;
// const readyPromise = new Promise((resolve) => {
//   udpSocket.bind(UDP_PORT, () => {
//     console.log(Listening for UDP messages on port ${UDP_PORT});
//     socketReady = true;
//     resolve();
//   });
// });

// function sendMessageToPeer(address, message) {
//     console.log("inside sending message");
//   if (!socketReady) {
//     console.log("socket is not ready");
//     return readyPromise.then(() => {
//       const messageBuffer = Buffer.from(message);
//       udpSocket.send(messageBuffer, 0, messageBuffer.length, UDP_PORT, address);
//     });
//   } else {
//     console.log("sending message -> ")
//     const messageBuffer = Buffer.from(message);
//     udpSocket.send(messageBuffer, 0, messageBuffer.length, UDP_PORT, address);
//   }
// }

// function splitFile(filePath) {
//   const fileBuffer = fs.readFileSync(filePath);
//   const chunkSize = 1024;
//   const chunks = [];
//   for (let i = 0; i < fileBuffer.length; i += chunkSize) {
//     chunks.push(fileBuffer.slice(i, i + chunkSize));
//   }
//   return chunks;
// }

// const chunkStore = {};
// function storeChunks(fileId, chunks) {
//   chunkStore[fileId] = {};
//   chunks.forEach((chunk, index) => {
//     chunkStore[fileId][index] = chunk;
//   });
// }

// async function sendFile(filePath, fileId, address) {
//   await readyPromise;
//   const chunks = splitFile(filePath);
//   const totalChunks = chunks.length;
//   storeChunks(fileId, chunks);

//   const chunkMap = {
//     type: "chunkMap",
//     fileId,
//     chunks: Object.keys(chunkStore[fileId]).map(Number),
//     totalChunks,
//   };
//   await sendMessageToPeer(address, JSON.stringify(chunkMap));

//   let chunkIndex = 0;
//   function sendNextChunk() {
//     if (chunkIndex < chunks.length) {
//       const chunk = chunks[chunkIndex];
//       const message = JSON.stringify({
//         type: "chunkData",
//         fileId,
//         chunkIndex,
//         chunk: chunk.toString("base64"),
//         totalChunks,
//       });
//       sendMessageToPeer(address, message);
//       chunkIndex++;
//       setTimeout(sendNextChunk, 50);
//     }
//   }
//   sendNextChunk();
// }

// const receivedChunks = {};
// function reconstructFile(fileId, totalChunks) {
//   const chunks = [];
//   for (let i = 0; i < totalChunks; i++) {
//     if (!receivedChunks[fileId][i]) return;
//     chunks.push(receivedChunks[fileId][i]);
//   }
//   const fileBuffer = Buffer.concat(chunks);
//   const outputPath = received_${fileId};
//   fs.writeFileSync(outputPath, fileBuffer);
//   console.log(File ${fileId} saved as ${outputPath});
// }

// function startListening() {
//   udpSocket.on("message", (msg, rinfo) => {
//     try {
//       console.log("New message");
//       const data = JSON.parse(msg.toString());
//       console.log(data);

//       if (data.type === "chunkMap") {
//         const { fileId, totalChunks } = data;
//         if (!receivedChunks[fileId]) receivedChunks[fileId] = {};
//         receivedChunks[fileId].totalChunks = totalChunks;
//       } else if (data.type === "chunkData") {
//         const { fileId, chunkIndex, chunk, totalChunks } = data;
//         if (!receivedChunks[fileId]) receivedChunks[fileId] = {};
//         if (!receivedChunks[fileId][chunkIndex]) {
//           receivedChunks[fileId][chunkIndex] = Buffer.from(chunk, "base64");
//         }
//         const receivedCount = Object.keys(receivedChunks[fileId]).filter(k => !isNaN(k)).length;
//         if (receivedCount === totalChunks) {
//           reconstructFile(fileId, totalChunks);
//         }
//       } else {
//         console.log(Text Message from ${rinfo.address}:${rinfo.port} → ${msg});
//       }
//     } catch (e) {
//       console.log(Text Message from ${rinfo.address}:${rinfo.port} → ${msg});
//     }
//   });
// }

// module.exports = { sendMessageToPeer, startListening, sendFile };