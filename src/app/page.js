"use client";
import React, { useEffect, useRef, useState } from "react";
import "../styles/HomeStyles.css";
import "../styles/unauthorized-box.css";
import { song_colors } from "./constants.js";
function Home() {
  const limit = 100;
  const [data, setData] = useState([]);
  const [isAuthorized, setIsAuthorized] = useState(true);
  const [showUnathorized, setShowUnAthorized] = useState(false);
  const [isLimit, setIsLimit] = useState(false);
  const inputElement = useRef();
  useEffect(() => {
    const checkAuthorization = async () => {
      try {
        const response = await fetch("api/authCheck", {
          method: "GET",
        });
        if (!response.ok) {
          setIsAuthorized(false);
        }
      } catch (error) {
        console.error("Error checking authorization:", error);
        setIsAuthorized(false);
      }
    };

    checkAuthorization(); // Call the async function
  }, []);
  useEffect(() => {
    console.log(showUnathorized);
  }, []);
  const handleDragEvents = (event) => {
    event.preventDefault();
  };

  const handleDrop = async (event) => {
    event.preventDefault();
    const mainArray = [];
    const items = event.dataTransfer.items;

    if (items.length + data.length > limit) {
      setIsLimit(true);
    } else {
      const dataPromises = Array.from(items).map((item) => {
        const entry = item.webkitGetAsEntry();

        if (entry && entry.isFile) {
          item.type === "audio/mp3" ||
          item.type === "audio/mpeg" ||
          item.type === "audio/x-m4a"
            ? mainArray.push(item.getAsFile())
            : console.log(item.type); // CREATE A MESSAGE
        } else if (entry && entry.isDirectory) {
          const dirReader = entry.createReader();
          return scanDirectory(dirReader, mainArray);
        }
      });
      await Promise.all(dataPromises);
      setData((prevData) => [...prevData, ...mainArray]);
    }
  };

  const handleFileSelection = (event) => {
    const selectedFiles = event.target.files;
    const mainArray = [];

    console.log("Selected files:", selectedFiles.length);

    if (selectedFiles.length + data.length > limit) {
      setIsLimit(true);
    } else {
      Array.from(selectedFiles).forEach((file) => {
        if (
          file.type === "audio/mp3" ||
          file.type === "audio/mpeg" ||
          file.type === "audio/x-m4a"
        ) {
          mainArray.push(file);
        } else {
          console.log(`Unsupported file type: ${file.type}`);
        }
      });
      setData((prevData) => [...prevData, ...mainArray]);
      console.log(data.length);
    }
  };

  const unauthorizedDrop = (event) => {
    event.preventDefault();
    setShowUnAthorized(true);
  };
  const scanDirectory = (dirReader, mainArray) => {
    return new Promise(async (resolve) => {
      dirReader.readEntries(async (entries) => {
        const dirPromises = Array.from(entries).map((entry) => {
          if (entry && entry.isFile) {
            return new Promise((resolve) => {
              entry.file((file) => {
                if (file.type === "audio/mp3") {
                  mainArray.push(file);
                } else {
                  console.log("Files needs to be an mp3 ");
                }
                resolve();
              });
            });
          } else if (entry && entry.isDirectory) {
            return scanDirectory(entry.createReader(), mainArray);
          }
        });
        await Promise.all(dirPromises);
        resolve();
      });
    });
  };
  const bytesToMb = (bNumber) => {
    try {
      return bNumber / 1000000;
    } catch (error) {
      console.log($`Error during converting bytes to mb ${error}`);
      return "Error";
    }
  };

  const handleDelete = (event, name) => {
    event.preventDefault();
    const files = data.filter((item) => item.name !== name);
    setData(files);
    data.length <= limit ? setIsLimit(false) : "";
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (data.length <= 0) {
      console.log("Nothing to search");
      return;
    }
    const formData = new FormData();
    data.forEach((dataEl, index) => {
      formData.append(`file${index}:`, dataEl);
    });

    try {
      const response = await fetch("/api/search", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.log("Error Response:", errorText);
        setIsAuthorized(false);
        setShowUnAthorized(true);
      } else {
        console.log("running");
        const responseJson = await response.json();

        sessionStorage.setItem("searched_songs", JSON.stringify(responseJson));

        window.location.replace("/searchResult");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };
  return (
    <div className="home">
      {data.length <= 0 && (
        <div className="motto-div mobile-show">
          <p className="motto-p mobile-show">Fastest way to spotify world!</p>
          <img className="motto-img mobile-show" src="/assets/arrowS.svg"></img>
        </div>
      )}
      {isLimit && <p className="board-hint">The limit is {limit} files</p>}
      {showUnathorized && (
        <div
          onDrop={unauthorizedDrop}
          onDragOver={handleDragEvents}
          className="unauthorized-box"
        >
          <p className="unauthorized-message">Please authorize first</p>
          <button
            className="unauthorized-btn"
            onClick={() => setShowUnAthorized(false)}
          >
            Ok
          </button>
        </div>
      )}

      <div
        className={`main-container ${
          data.length > 0 ? "main-container-songs" : ""
        }`}
      >
        {data.length > 0 && (
          <ul className="search-list">
            {data.map((song, index) => {
              return (
                <li
                  className="search-item"
                  style={{
                    backgroundColor: song_colors[index % song_colors.length],
                  }}
                  key={index}
                >
                  <p className="file-name search-item-part">
                    {song.name.slice(0, 34)}
                    {song.name.length > 34 ? "..." : ""}
                  </p>
                  <p className="file-size search-item-part mobile-hide">
                    {bytesToMb(song.size).toPrecision(3)} mb{" "}
                  </p>
                  <p
                    className="delete-button search-item-part"
                    onClick={(event) => handleDelete(event, song.name)}
                  >
                    X
                  </p>
                </li>
              );
            })}
          </ul>
        )}
        <div
          className={`container-board ${data.length > 0 ? "hidden" : ""}`}
          hidden={data.length > 0 ? true : false}
          onDrop={isAuthorized ? handleDrop : (e) => {e.preventDefault(); setShowUnAthorized(true)}}
          onDragOver={handleDragEvents}
        >
          <label className="drop-label" htmlFor="song-input">
            <p className="mobile-drop-p">
              Choose or drop <br className="mobile-show" /> your files{" "}
              <br className="mobile-show" /> here
            </p>
            <input
              accept="audio/mpeg, audio/mp3, audio/x-m4a"
              type="file"
              id="song-input"
              onInput={
                isAuthorized
                  ? handleFileSelection
                  : () => setShowUnAthorized(true)
              }
              ref={inputElement}
              multiple
            ></input>
          </label>
          <img
            src="/assets/mobile-download.svg"
            className="mobile-download-image"
            alt="Download image"
          ></img>
        </div>
      </div>

      <div className="button-container">
        <button
          className="add-more-files mobile-hide"
          onClick={() => {
            isAuthorized
              ? inputElement.current.click()
              : () => setShowUnAthorized(true);
          }}
        >
          Add more Files
        </button>
        <button
          className="add-more-files mobile-show"
          onClick={() => {
            isAuthorized
              ? inputElement.current.click()
              : () => setShowUnAthorized(true);
          }}
        >
          <img src="/assets/plus-button.svg"></img>
        </button>
        <button onClick={handleSubmit} className="button-search">
          Search it!
        </button>
      </div>
      
    </div>
  );
}

export default Home;
