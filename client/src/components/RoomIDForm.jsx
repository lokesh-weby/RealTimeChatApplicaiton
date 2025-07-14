import React, { useState, useEffect } from "react";
import { stateContext } from "../Context/Context";
import { v4 as uuidv4 } from "uuid";

const RoomIDForm = () => {
  const { setRoomFormToggle, navigate } = stateContext();
  const [data, setData] = useState({
    username: "",
    roomId: "",
  });

  const handleChange = (e) => {
    const { id, value } = e.target;
    setData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const uid = uuidv4().split("-")[0];
      sessionStorage.setItem("uid", uid);

    if (!data.username || !data.roomId) {
      alert("Please enter both username and room");
      return;
    }

    try {
      const uid = sessionStorage.getItem("uid");

      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uid,
          username: data.username,
        }),
      });

      const result = await res.json();

      if (res.ok && result.token) {
        sessionStorage.setItem("token", result.token);
        sessionStorage.setItem("username", data.username);
        sessionStorage.setItem("roomId", data.roomId);
        navigate("/chat");
      } else {
        alert(result.error || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      alert("Something went wrong. Try again.");
    }
  };

  const handleCancel = () => {
    setData({
      username: "",
      roomId: "",
    });
    setRoomFormToggle((prev) => !prev);
  };

  return (
    <form
      className="bg-white flex flex-col gap-3 p-5 rounded-xl"
      onSubmit={handleSubmit}
    >
      <h1 className="text-center text-lg">Join Room</h1>

      <label htmlFor="username">Username</label>
      <input
        type="text"
        id="username"
        className="bg-gray-200 p-2 outline-none"
        placeholder="Enter your name"
        value={data.username}
        onChange={handleChange}
      />

      <label htmlFor="roomId">Select Room</label>
      <select
        id="roomId"
        className="bg-gray-200 p-2 outline-none"
        value={data.roomId}
        onChange={handleChange}
      >
        <option value="">-- Select a Room --</option>
        <option value="room-1">Room 1</option>
        <option value="room-2">Room 2</option>
        <option value="room-3">Room 3</option>
      </select>

      <button
        type="submit"
        className="bg-purple-700 text-white py-2 rounded cursor-pointer mt-5"
      >
        Join Room
      </button>

      <button
        type="button"
        className="bg-red-700 text-white py-2 rounded cursor-pointer"
        onClick={handleCancel}
      >
        Cancel
      </button>
    </form>
  );
};

export default RoomIDForm;
