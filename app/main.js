const net = require("net");
const fs = require("fs");

const PORT = 4221;

const ROUTE_ROOT = "/";
const ROUTE_ECHO = "/echo";
const ROUTE_USER_AGENT = "/user-agent";
const ROUTE_FILES = "/files";

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
    if (path === ROUTE_ROOT) {
      socket.write("HTTP/1.1 200 OK\r\n\r\n"); // send data back to the client, respond with status code
    } else if (path.startsWith(ROUTE_ECHO)) {
      const message = path.slice(ROUTE_ECHO.length + 1); // grab the part after /echo/
      console.log(`parsed message is ${message}`);
      socket.write(
        "HTTP/1.1 200 OK\r\n" +
          "Content-Type: text/plain\r\n" +
          `Content-Length: ${message.length}\r\n\r\n` +
          `${message}` // send the header and body, delimited with \r\n\r\n
      );
    } else if (path.startsWith(ROUTE_USER_AGENT)) {
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
    } else if (path.startsWith(ROUTE_FILES)) {
      const absoluteDirPath = process.argv[3];
      const fileName = path.slice(ROUTE_FILES.length + 1);
      const absolutePath = `${absoluteDirPath}/${fileName}`;
      console.log(`absolute path is ${absolutePath}`);
      console.log(`file name from get request is ${fileName}`);
      if (method === "GET") {
        if (fs.existsSync(absolutePath)) {
          const fileContents = fs.readFileSync(absolutePath, "utf-8");
          socket.write(
            "HTTP/1.1 200 OK\r\n" +
              "Content-Type: application/octet-stream\r\n" +
              `Content-Length: ${fileContents.length}\r\n\r\n` +
              `${fileContents}`
          );
        } else {
          socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
        }
      } else if (method === "POST") {
        const fileContent = requestLines[requestLines.length - 1];
        console.log(`file content from post request is ${fileContent}`);
        fs.writeFileSync(absolutePath, fileContent);
        socket.write("HTTP/1.1 201 OK\r\n\r\n");
      }
    } else {
      socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
    }
    socket.end();
  });
});

server.listen(PORT, "localhost"); // node sets up listeners for connections at the OS level
