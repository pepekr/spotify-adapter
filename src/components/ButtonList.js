import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function ButtonList({ listOfnames, isOpen, divClassName, buttonClassName, isAuth }) {
  const router = useRouter()

  const actionObject = 
  {
    "Your account":()=>router.push("/api/login"),
    "Exit":()=> isAuth?window.location.replace("https://www.spotify.com/account/apps/"):"",
  }
  // дописати умову блокування кнопки якщо верхній response 200 
  const handler = (name) => {
    console.log("running");
    if (actionObject[name]) {
      actionObject[name]();
    }
    else
    {
      console.log("no action for this button");
    }
  };

  return (
    <div className={`${divClassName} ${isOpen ? "open" : "closed"}`}>
      {listOfnames.map((name, index) => (

        <button
          onClick={() => handler(name)} 
          className={name==="Your account"&&isAuth? buttonClassName +" authorized-btn":buttonClassName}
          key={index}
          type="button"
          disabled = {(name==="Your account"&&isAuth)||(name==="Exit"&&!isAuth)}>
          {name==="Your account"&&isAuth?"Authorized":name}
        </button>
      ))}
    </div>
  );
}

export default ButtonList;
