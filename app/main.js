const net = require("net");

const PORT = 4221;

// create a new TCP server.
// When a client connects (determined from server.listen), node creates a socket object to represent a connection to that specific client. Node calls the provided callback with the socket.
// Inside the callback, when a client connects, the inner callback is run
const server = net.createServer((socket) => {
  console.log("Client connected!");

  // the inner callback registers a listener - when the client closes the connection, call these methods on the socket
  socket.on("close", () => {
    socket.end();
    server.close();
  });

  // listen for data from the client
  socket.on("data", (data) => {
    console.log("Received data from the client:", data.toString()); // convert buffer to string, by default interpret it as UTF-8 encoded
    socket.write("HTTP/1.1 200 OK\r\n\r\n"); // send data back to the client
    socket.end();
  });
});

server.listen(PORT, "localhost"); // node sets up listeners for connections at the OS level
