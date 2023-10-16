const net = require("net");

const PORT = 4221;

const ECHO_ROUTE = "/echo";
const USER_AGENT_ROUTE = "/user-agent";

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
    const requestData = data.toString();
    const requestLines = requestData.split("\r\n");
    const requestLine = requestLines[0];
    const requestLineParts = requestLine.split(" ");
    const [method, path, version] = requestLineParts;
    console.log(`method: ${method}`);
    console.log(`path: ${path}`);
    console.log(`version: ${version}`);
    if (path === "/") {
      socket.write("HTTP/1.1 200 OK\r\n\r\n"); // send data back to the client, respond with status code
    } else if (path.startsWith(ECHO_ROUTE)) {
      const message = path.slice(ECHO_ROUTE.length + 1); // grab the part after /echo/
      console.log(`parsed message is ${message}`);
      socket.write(
        "HTTP/1.1 200 OK\r\n" +
          "Content-Type: text/plain\r\n" +
          `Content-Length: ${message.length}\r\n\r\n` +
          `${message}` // send the header and body, delimited with \r\n\r\n
      );
    } else if (path.startsWith(USER_AGENT_ROUTE)) {
      const hostLine = requestLines[1];
      const userAgentLine = requestLines[2];
      const userAgentParts = userAgentLine.split(" ");
      const userAgent = userAgentParts[1];
      socket.write(
        "HTTP/1.1 200 OK\r\n" +
          "Content-Type: text/plain\r\n" +
          `Content-Length: ${userAgent.length}\r\n\r\n` +
          `${userAgent}`
      );
    } else {
      socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
    }
    socket.end();
  });
});

server.listen(PORT, "localhost"); // node sets up listeners for connections at the OS level
