"use client";
import React, { useState,useEffect } from "react";
import Link from "next/link";
import NavbarPC from "./NavbarPC";
import NavbarMobile from "./NavbarMobile";
import "../styles/navbarStyles.css";
function Navbar() {
  const [isAuth, setIsAuth] = useState(false);
  useEffect(()=>{
    const authFunc = async ()=>
      {
        const response = await fetch('api/authCheck',
          {
            method:"GET",
          })
          if(!response.ok)
            {
              setIsAuth(false);
            }
          else
          {
            setIsAuth(true);
          }
      }
      authFunc()
  },[]);
  const [isHidden, setIsHidden] = useState({
    account: false,
    language: false,
    mobileDropdown: false,
  });
  const handleMove = (key) => {
    // передає ключ (список кнопок який повинен розкритись)
    setIsHidden((isHidden) => ({
      // спочатку запускає функцію яка підтверджує останні дані
      ...isHidden, // потім робить копію об'єкта
      [key]: !isHidden[key], // міняє значення по ключу
    }));
  };

  return (
    <>
      <div className="navbar">
        <div className="main-icon">
          <Link href="/">
            <img src="/assets/Sptfy.svg" alt="icon" />
          </Link>
        </div>

        <NavbarMobile isHidden={isHidden} handleMove={handleMove} isAuth={isAuth}/>

        <NavbarPC isHidden={isHidden} handleMove={handleMove} isAuth={isAuth} />
      </div>
    </>
  );
}

export default Navbar;
