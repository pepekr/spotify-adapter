"use client";
import React from "react";
import Link from "next/link";
import ButtonList from "./ButtonList";
function NavbarMobile({ isHidden, handleMove,isAuth }) {
  return (
    <>
      <div
        className="menu-icon mobile-ver"
        onClick={() => handleMove("mobileDropdown")}
      >
        <img src="/assets/menuIcon.svg" alt="menu-icon" />
      </div>
      <div className="mobile-ver">
        {isHidden.mobileDropdown && (
          <div className="mobile-navbar-menu ">
            <div
              className="close-icon"
              onClick={() => handleMove("mobileDropdown")}
            >
              <img src="/assets/closeIcon.svg" alt="Closing icon" width={35} />
            </div>

            <div className="navbar-menu-el margin-bottom">
              <span className="mobile-navbar-main-btn">Language</span>
              <ButtonList
                listOfnames={["Ukranian", "English"]}
                divClassName={"mobile-button-list"}
                buttonClassName={"mobile-button-list-item"}
              />
            </div>

            <div className="navbar-menu-el">
              <span className="mobile-navbar-main-btn">Account</span>
              <ButtonList
                listOfnames={["Your account", "Exit"]}
                divClassName={"mobile-button-list"}
                buttonClassName={"mobile-button-list-item"}
                isAuth={isAuth}
              />
            </div>

            <Link
              className="navbar-menu-el mobile-navbar-main-btn "
              href="/history"
            >
              History
            </Link>
          </div>
        )}
      </div>
    </>
  );
}

export default NavbarMobile;
