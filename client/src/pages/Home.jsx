import React, { useState } from "react";
import Button from "../components/Button";
import { RandomizedTextEffect } from "../components/RandomizedTextEffect";

import { stateContext } from "../Context/Context";
import RoomIDForm from "../components/RoomIDForm";

const Home = () => {
const {navigate,toggleModel,setToggleModel,roomID,setRoomID,roomFormToggle,setRoomFormToggle}=stateContext()

  console.log(toggleModel);
  
  return (
    <div className="flex flex-col justify-center items-center gap-5">
      <h1
        className="bg-gradient-to-b my-5 from-white to-slate-700 bg-clip-text text-transparent text-4xl text-center font-semibold text-wrap"
      >
        Welcome to <RandomizedTextEffect text={"ChatRoom!"}/>
      </h1>
      


      {/* Join Room Button */}
     
      <Button btn_name={"Join a Room Now"} setRoomFormToggle={()=>setRoomFormToggle((prev)=>!prev)}  />

      {/* Modal for joining room */}
       <div
        className={`${
        roomFormToggle
            ? "fixed top-0 left-0 w-full h-full backdrop-blur-lg flex items-center justify-center"
            : "hidden"
        }`}
      >
        <RoomIDForm/>
      
      </div>
    </div>
  );
};

export default Home;
