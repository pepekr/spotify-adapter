import React from "react";
import Link from "next/link";
import ButtonList from "./ButtonList";

function NavbarPC({ isHidden, handleMove,isAuth }) {
  return (
    <div className="navbar-menu  PC">
      <div
        className="navbar-menu-el"
        onMouseOver={() => handleMove("account")}
        onMouseOut={() => handleMove("account")}
      >
        <button
          className="navbar-main-btn"
          type="button"
          onClick={() => handleMove("account")}
        >
          Account
        </button>

        {isHidden.account && (
          <ButtonList
            listOfnames={["Your account", "Exit"]}
            isOpen={isHidden.account}
            divClassName={"button-list"}
            buttonClassName={"button-list-item"}
            isAuth={isAuth}
          />
        )}
      </div>

      {/* <Link className="navbar-menu-el navbar-main-btn" href="/history">
        History
      </Link> */}

      <div
        className="navbar-menu-el"
        onMouseOver={() => handleMove("language")}
        onMouseOut={() => handleMove("language")}
      >
        <button
          type="button"
          className="navbar-main-btn"
          onClick={() => handleMove("language")}
        >
          Language
        </button>
        {isHidden.language && (
          <ButtonList
            listOfnames={["Ukranian", "English"]}
            isOpen={isHidden.language}
            divClassName={"button-list"}
            buttonClassName={"button-list-item"}
          />
        )}
      </div>
    </div>
  );
}

export default NavbarPC;
