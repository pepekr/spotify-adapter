"use client";
import React, { useEffect, useRef, useState } from "react";
import "../../styles/searchResult.css";
import { useRouter } from "next/navigation";
import { song_colors } from "../constants.js";
function searchResult() {
  const songsLimit = 100;
  const [searchedSongs, setSearchedSongs] = useState([]);
  const [choosedSongsIndexes, setchoosedSongsIndexes] = useState([]);
  const inputTitleRef = useRef();
  const isCreated = useRef();
  const router = useRouter();
  useEffect(() => {
    if (JSON.parse(sessionStorage.getItem("searched_songs")).length > 0) {
      setSearchedSongs(JSON.parse(sessionStorage.getItem("searched_songs")));
      console.log(JSON.parse(sessionStorage.getItem("searched_songs")));
    }
  }, []);
  useEffect(() => {
    if (searchedSongs.length > 0) {
      preloadSongs();
    }
  }, [searchedSongs]);

  return (
    <div className="search-result-container">
      {choosedSongsIndexes.length >= songsLimit && (
        <p>The limit is {songsLimit}</p>
      )}
      {searchedSongs.length > 0 && (
        <>
          <label htmlFor="inp" className="inp">
            <input
              type="text"
              id="inp"
              placeholder="&nbsp;"
              ref={inputTitleRef}
            />
            <span className="label">Title</span>
            <span className="focus-bg"></span>
          </label>
          <ul className="search-list">
            {searchedSongs.map((songResults, mainSongIndex) => {
              const array = songResults.options.map(
                (songOptionObject, optionIndex) => {
                  if (
                    songOptionObject.isMatched === null &&
                    songOptionObject.originalFileTitle === null
                  ) {
                    return null;
                  }
                  const check = searchAdded(mainSongIndex, optionIndex);

                  return (
                    <React.Fragment key={`${mainSongIndex}-${optionIndex}`}>
                      {optionIndex === 0 && (
                        <div className="org-song-name">{songResults.name}</div>
                      )}
                      <li
                        onClick={() => {
                          choosedSongsIndexes.length < songsLimit &&
                          !searchAdded(mainSongIndex, optionIndex)
                            ? addSong(mainSongIndex, optionIndex)
                            : removeSong(mainSongIndex, optionIndex);
                        }}
                        style={{
                          backgroundColor:
                            song_colors[optionIndex % song_colors.length],
                        }}
                        className={"search-item"}
                        key={optionIndex}
                      >
                        <p
                          className={`search-item-part ${
                            songOptionObject.isMatched
                              ? "primary-choice-song"
                              : "secondary-choice-song"
                          }`}
                        >
                          {" "}
                          {songOptionObject.searchObjectName}
                        </p>

                        <input
                          className="search-item-part song-checkbox"
                          key={optionIndex}
                          type="checkbox"
                          checked={check}
                          onChange={(event) => {
                            event.target.checked &&
                            choosedSongsIndexes.length < songsLimit
                              ? addSong(mainSongIndex, optionIndex)
                              : removeSong(mainSongIndex, optionIndex);
                          }}
                        ></input>
                      </li>
                    </React.Fragment>
                  );
                }
              );
              console.log(array);
              return array;
            })}
          </ul>
        </>
      )}
      <div className="button-container">
        <span className="song-count">Songs: {choosedSongsIndexes.length}</span>
        <button
          className="create-playlist-button"
          onClick={async () => {
            await createPlaylist();
            router.push(`/playlistRedirect?success=${isCreated.current}`);
          }}
        >
          Create playlist
        </button>
      </div>
    </div>
  );

  function addSong(mainSongIndex, optionIndex) {
    !searchAdded(mainSongIndex, optionIndex) &&
    choosedSongsIndexes.length < songsLimit
      ? setchoosedSongsIndexes((prevSongs) => [
          ...prevSongs,
          [mainSongIndex, optionIndex],
        ])
      : "";
  }
  function removeSong(mainSongIndex, optionIndex) {
    const deleteItem = [mainSongIndex, optionIndex];
    setchoosedSongsIndexes((previousArray) =>
      previousArray.filter(
        (item) => item[0] !== deleteItem[0] || item[1] !== deleteItem[1]
      )
    );
  }

  function searchAdded(mainSongIndex, optionIndex) {
    let check = false;
    choosedSongsIndexes.forEach((songArray) => {
      if (songArray[0] == mainSongIndex && songArray[1] == optionIndex) {
        check = true;
      }
    });
    return check;
  }
  function createFinalArray() {
    const array = choosedSongsIndexes.map((coords) => {
      return searchedSongs[coords[0]].options[coords[1]].trackId;
    });
    return array; ///HERE COORDS MISTAKE
  }

  async function createPlaylist() {
    const finalArray = createFinalArray();

    try {
      const response = await fetch("api/createPlaylist", { 
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          playlistName: inputTitleRef.current.value || "New Playlist",
          finalArray: finalArray.slice(0, 100),
        }),
      });
      const reponseText = await response.text();
      if (!response.ok) {
        isCreated.current = false;
        throw new Error("error in creating: " + reponseText);
      } else {
        isCreated.current = true;
      }
    } catch (error) {
      console.log(error);
    }
  }
  function preloadSongs() {
    searchedSongs.forEach((oneSongResult, mainIndex) => {
      oneSongResult.options.forEach((el, index) => {
        if (el.isMatched && choosedSongsIndexes < songsLimit) {
          setchoosedSongsIndexes((prevSongs) => [
            ...prevSongs,
            [mainIndex, index],
          ]);
        }
      });
    });
  }
}

export default searchResult;
