# GEHU-Hackathon-p2p

A peer-to-peer (P2P) file sharing and messaging application developed during the GEHU Hackathon 2025.

## 🧠 Overview

This project implements a decentralized P2P network using UDP sockets in Node.js, enabling users to:

- Discover peers on the local network
- Exchange real-time text messages
- Transfer files in chunks
- Maintain an active peer list without centralized servers

## 🚀 Features

- **Peer Discovery**: Uses UDP broadcasting to find peers in the local network.
- **Messaging**: Send and receive real-time messages between connected peers.
- **File Transfer**: Split large files into chunks, send over the network, and reconstruct them at the receiver's end.
- **Active Peer Management**: Continuously monitors and updates the list of active peers.


## 🛠 Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/aashish1100/GEHU-Hackathon-p2p

```

For Backend:
```npm start```

For Frontend:
```npm run dev```


