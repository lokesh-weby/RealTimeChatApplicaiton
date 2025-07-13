import { useContext, useState } from "react";
import { createContext } from "react";
import { useNavigate } from "react-router-dom";

export const context=createContext();

export const UserProvider=({children})=>{ 
  const navigate=useNavigate()
  const [toggleModel, setToggleModel] = useState(false);
  const [roomFormToggle,setRoomFormToggle]=useState(false);
  const [roomID, setRoomID] = useState("");
  return(
    <context.Provider
    value={{navigate,toggleModel,setToggleModel,roomID,setRoomID,roomFormToggle,setRoomFormToggle}}
    >
        {children}

    </context.Provider>

  )

}

export const stateContext=()=>useContext(context)