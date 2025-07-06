"use client";
import React, { useEffect, useRef, useState } from "react";
import "../../styles/searchResult.css";
import { useRouter } from "next/navigation";
import { song_colors } from "../constants.js";
function searchResult() {
  const songsLimit = 100;
  const [searchedSongs, setSearchedSongs] = useState([]);
  const [choosedSongsIndexes, setchoosedSongsIndexes] = useState([]);
  const isCreated = useRef();
  const router = useRouter();
  useEffect(() => {
    console.log("RELOAD");
    if (JSON.parse(sessionStorage.getItem("searched_songs")).length > 0) {
      setSearchedSongs(JSON.parse(sessionStorage.getItem("searched_songs")));
    }
  }, []);
  useEffect(() => {
    if (searchedSongs.length > 0) {
      preloadSongs();
    }
  }, [searchedSongs]);
  useEffect(() => {
    console.log("LENGTH" + choosedSongsIndexes.length);
  }, [choosedSongsIndexes, preloadSongs]);

  return (
    <div className="search-result-container">
      {choosedSongsIndexes.length >= songsLimit && (
        <p>The limit is {songsLimit}</p>
      )}
      {searchedSongs.length > 0 && (
        <ul className="search-list">
          {searchedSongs.map((songOptionsArray, mainSongIndex) => {
            const array = songOptionsArray.map((songOptionObject, index) => {
              const check = searchAdded(mainSongIndex, index);
              return (
                <li
                  onClick={() => {
                    choosedSongsIndexes.length < songsLimit && !searchAdded(mainSongIndex, index)
                      ? addSong(mainSongIndex, index)
                      : removeSong(mainSongIndex, index);
                  }}
                  style={{
                    backgroundColor: song_colors[index % song_colors.length],
                  }}
                  className={"search-item"}
                  key={index}
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
                    key={index}
                    type="checkbox"
                    checked={check}
                    onChange={(event) => {
                      event.target.checked &&
                      choosedSongsIndexes.length < songsLimit
                        ? addSong(mainSongIndex, index)
                        : removeSong(mainSongIndex, index);
                    }}
                  ></input>
                </li>
              );
            });
            console.log(array);
            return array;
          })}
        </ul>
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
      return searchedSongs[coords[0]][coords[1]].trackId;
    });
    return array;
  }

  async function createPlaylist() {
    const finalArray = createFinalArray();

    try {
      const response = await fetch("api/createPlaylist", {
        method: "POST",
        body: JSON.stringify(finalArray.slice(0, 100)),
      });
      const reponseText = await response.text();
      if (!response.ok) {
        isCreated.current = false;
        throw new Error("error in creating: " + reponseText);
      } else {
        isCreated.current = true;
        console.log(`TEEEEEEEEEEEEST ${reponseText}`);
      }
    } catch (error) {
      console.log(error);
    }
  }
  function preloadSongs() {
    searchedSongs.forEach((oneSongChoices, mainIndex) => {
      oneSongChoices.forEach((el, index) => {
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
