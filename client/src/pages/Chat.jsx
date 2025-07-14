import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const Chat = () => {
  const [toggleMenu, setToggleMenu] = useState(false);
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);
  const [activeUsers, setActiveUsers] = useState();
  const socketRef = useRef(null);
  const lastMessageRef = useRef(null);

  const username = sessionStorage.getItem("username");
  const room = sessionStorage.getItem("roomId");
  const uid = sessionStorage.getItem("uid");
  const token = sessionStorage.getItem("token");

  // console.log(import.meta.env.VITE_SOCKET_URL);
  // console.log(import.meta.env.VITE_SOCKET_URL);

  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]); // <- triggered every time messages change

  useEffect(() => {
      console.log("Socket URL",import.meta.env.VITE_SERVER_URL);

    const socket = io(import.meta.env.VITE_SOCKET_URL, {
      transports: ["websocket", "polling"],
      autoConnect: false,
      secure: true,
     
    });

    socket.auth = { token };
    socket.connect();

    socket.on("connect", () => {
      console.log("✅ Connected to socket:", socket.id);
      socket.emit("joinRoom", { uid, username, room });
    });

    socket.on("connect_error", (err) => {
      console.log("❌ Socket connect error:", err);
    });


    socket.emit("joinRoom", { uid, username, room });

    socket.on("receiveMessage", (msg) => {
      console.log(msg);
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("activeUsers", (users) => {
      setActiveUsers(users);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect(); // cleanup on unmount
    };
  }, [token]);

  const handleSend = () => {
    if (text.trim() && socketRef.current) {
      socketRef.current.emit("sendMessage", { room, text });
      setText("");
    }
  };

  return (
    <section className="flex h-screen  w-full">
      <aside
        className={`absolute top-0 ${
          toggleMenu ? "left-0" : "-left-55"
        } h-full backdrop-blur-lg shadow-lg z-40 p-6 text-white transition-all md:static md:bg-green-900`}
      >
        <span className="my-10 text-xl"> ChatRoom </span>
        <button
          className="ml-5 md:hidden"
          onClick={() => setToggleMenu((prev) => !prev)}
        >
          <i className="fa-solid fa-xmark"></i>
        </button>
        <div className="my-10 h-2/3 overflow-y-auto flex-col gap-y-5">
          <h1 className="my-6 text-sm">{`Room: ${sessionStorage.getItem(
            "roomId"
          )}`}</h1>
          <h1 className="my-6 text-xl">Members</h1>
          <ol className="list-decimal pl-5 space-y-2">
            {activeUsers?.map((user, index) => (
              <li key={index} className="text-lg my-4 md:text-xl">
                {user.username}
              </li>
            ))}
          </ol>
        </div>
      </aside>

      <div className="flex flex-1 flex-col bg-[url('https://cdn.wallpapersafari.com/30/82/NCR8P4.jpg')] bg-cover bg-center ">
        <nav className="w-full backdrop-blur-sm p-5 md:hidden">
          <button
            className="text-white md:hidden"
            onClick={() => setToggleMenu((prev) => !prev)}
          >
            <i className="fa-solid fa-bars"></i>
          </button>
        </nav>
        <div className="textarea flex flex-1 flex-col items-center gap-8 overflow-y-auto p-8 ">
          <span className="rounded-full bg-gray-200 px-5 py-2">
            Welcome to Chat Room
          </span>

          {messages.map((msg, index) => {
            const isServerMsg = msg.sender === "Server" || !msg.uid;

            if (isServerMsg) {
              return (
                <div
                  key={index}
                  ref={index ? lastMessageRef : null}
                  className="flex w-full justify-center"
                >
                  <span className="rounded-full bg-gray-200 px-5 py-2">
                    {msg.text}
                  </span>
                </div>
              );
            }

            return (
              <div
                key={index}
                className={`flex w-full ${
                  msg.uid === uid ? "justify-end" : "justify-start"
                }`}
                ref={index === messages.length - 1 ? lastMessageRef : null}
              >
                <div className="w-1/2 md:w-1/3 rounded-xl bg-gray-200 p-2 px-4 shadow-lg">
                  <p className="text-gray-500 text-sm">
                    {msg.uid === uid ? "You" : msg.sender}
                  </p>
                  <p className="text-lg">{msg.text}</p>
                  <p className="text-end text-xs text-gray-400">
                    {new Date(msg.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex sticky w-full left-0 bottom-0 z-50">
          <input
            type="text"
            className="flex-1 bg-gray-300 px-4 py-2 outline-none"
            placeholder="Message"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <button
            className="bg-green-900 px-4 py-3 text-white"
            onClick={handleSend}
          >
            Send
          </button>
        </div>
      </div>
    </section>
  );
};

export default Chat;
