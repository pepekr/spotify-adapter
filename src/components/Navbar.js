"use client";
import React, { useState,useEffect } from "react";
import Link from "next/link";
import NavbarPC from "./NavbarPC";
import NavbarMobile from "./NavbarMobile";
import "../styles/navbarStyles.css";
import { useAuthContext } from "../app/AuthContext";
function Navbar() {
  const {isAuthorized, setIsAuthorized} = useAuthContext();
  useEffect(()=>{
    const authFunc = async ()=>
      {
        const response = await fetch('api/authCheck',
          {
            method:"GET",
          })
          if(!response.ok)
            {
              setIsAuthorized(false);
            }
          else
          {
            setIsAuthorized(true);
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

        <NavbarMobile isHidden={isHidden} handleMove={handleMove} isAuth={isAuthorized}/>
        <NavbarPC isHidden={isHidden} handleMove={handleMove} isAuth={isAuthorized} />
      </div>
    </>
  );
}

export default Navbar;
