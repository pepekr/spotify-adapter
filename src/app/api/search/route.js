import { parseBlob } from "music-metadata";
import { cookies } from "next/headers";
export async function POST(req) {
  const files = [];
  const metadataArray = [];
  const searchedSongs = [];
  const cookieStorage = await cookies();
  let access_token = cookieStorage.get("access_token");
  const refresh_token = cookieStorage.get("refresh_token");
  let response;

  if (refresh_token && access_token) {
    response = await handleFiles(req, files, metadataArray, access_token.value);
    return response;
  } else if (refresh_token) {
    await getNewToken(refresh_token, cookieStorage);
    access_token = cookieStorage.get("access_token"); // updating token
    response = await handleFiles(req, files, metadataArray, access_token.value);
    return response;
  } else {
    return new Response("Unauthorized", { status: 400 });
  }
}

///Handling request: takes formdata "file{index}:file" and parses it to an array
const handleFiles = async (req, files, metadataArray, access_token) => {
  try {
    const formData = await req.formData();
    
    formData.forEach((value) => {
      files.push(value);
    });
    if(files.length<=0)
      {
        console.log(`NO FILES FOR HANDLING: ${error}`);
        return new Response("BAD", { status: 500, message: "NO FILES FOR HANDLING" })
      }
 
    await handleMetadata(files, metadataArray);
    
    const searchedSongsResult = await searchForTracks(
      metadataArray,
      access_token
    );
   
    console.log(searchedSongsResult);
    return new Response(JSON.stringify(searchedSongsResult), {
      status: 200,
    });
  } catch (error) {
    console.log(`ERROR IN HANDLING FILES: ${error}`);
    return new Response("BAD", { status: 500, message: "POPIZDE" });
  }
};
/// getting files metadata from metaDataObject
/// async anononymys map func returns an array of promises
/// promise.all waiting for all prommise to resolve
/// push values in an array
const handleMetadata = async (files, metadataArray) => {
  console.log(metadataArray);
  const arrayOfMetaData = files.map(async (file) => {
    const fileMetadata = await parseBlob(file);
    const artistsArray = fileMetadata.common?.artists?.filter(Boolean) || [];

    const metaDataObject = {
      title: fileMetadata.common.title || undefined,
      fileName: file.name || undefined,
      duration: fileMetadata.format.duration || undefined,
      artists:
        (artistsArray.length > 0 ? artistsArray : undefined) ||
        (artistsArray.length > 0 ? artistsArray : undefined) ||
        [],

      year: fileMetadata.common.year || undefined,
      album: fileMetadata.common.album || undefined,
    };
    return metaDataObject;
  });
  await Promise.all(arrayOfMetaData).then((fulfilledValues) => {
    metadataArray.push(...fulfilledValues);
  });

};

/// Getting new refresh and access tokens
const getNewToken = async (refresh_token, cookieStorage) => {
  console.log("TEST IN GET NEW TOKEN MUST BE ONE CALL !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
  console.log(cookieStorage.getAll());
  console.log("runnning");
  try {
    const authParams = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refresh_token.value,
    }).toString();
    const authResponse = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization:
          "Basic " +
          new Buffer.from(
            process.env.CLIENT_ID + ":" + process.env.CLIENT_SECRET
          ).toString("base64"),
      },
      body: authParams,
    });
    if (!authResponse.ok) {
      console.log("ERROR IN GETTING A NEW AUTH TOKEN", await authResponse.text());
    } else {
      const responseObj = await authResponse.json();
      console.log(responseObj);
      const oneHour = 3600000;
      const now = new Date();
      const expiration = new Date(now.getTime() + oneHour);

      responseObj.access_token
        ? cookieStorage.set("access_token", responseObj.access_token, {
          expires: expiration,
          httpOnly: true,
          secure: true,
          sameSite: 'Strict', 
          path: '/',
        })
        : console.log("NO ACCESS IN RESPONSE");
      responseObj.refresh_token
        ? cookieStorage.set("refresh_token", responseObj.refresh_token,{
          expires: undefined,
          httpOnly: true,
          secure: true,
          sameSite: 'Strict', 
          path: '/',
        })
        : console.log("NO REFRESH IN RESPONSE");
      console.log(cookieStorage.getAll());
    }
  } catch (error) {
    console.log("ERROR IN GET NEW TOKEN", error);
  }
};
// this func goes like this:
// it maps every file (user songs) in metaData Array (metadataArray.map(async (file) => wraps all func )
// making title(deleting all unnecesaries) and making a request to spotify based on title + artists
// recieve response -> make it json -> now we taking each of items array ->
// (this array storing all searches for one song in our case limit: 3)
// example of how this looks like:
/* response{
      tracks{
          some additional info about request and response*
          items[
            album[] // array info about an album
            some more info
            artists[] // array info about artists 
            name 
            duration
          ]
  }
}
  so response is basicly info about it and items array 
...taking each of items array by responseJSON.tracks.items.map(
        (searchObject) => {
    and making 4 comparisons -> title duration artists yea
    based on this info we returning this options into array, in object like this 
    {
    isMatch: true/false
    searchedOption: 
    }
    if no options were match return null
    so it would be for one file [{}, {}, {}] - ArrayOfSearchedOptions and for each file we r returning this array 
    in array for files - arrayOfSongsSearchResult 
    [[{}, {}, {}] [{}, {}, {}]] so this is an array that contains 2 songs 3 options max for each 
    ofcourse in first map we have async func so in the await Promise.all
    thats it -_-
*/
const searchForTracks = async (metadataArray, access_token) => {
  const regex = /\.| |_|-| /g;
  const arrayOfSongsSearchResult = await metadataArray.map(async (file) => {
    const title = parseFileName(
      file.title || file.fileName,
      file.artists
    ).toLowerCase();

    const url = `https://api.spotify.com/v1/search?q=${title}+${
      file.artists ? file.artists.join("+") : ""
    }&type=track&limit=3&offset=0`.toString("base64");

    console.log(Date.now());
    const a = Date.now();
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    console.log(Date.now(), a - Date.now());
    if (!response.ok) {
      console.log(`Error in search tracks ${await response.text()}`);
    } else {
      const responseJSON = await response.json();
      const arrayOfSearchedOptions = responseJSON.tracks.items.map(
        (searchObject) => {
          const artistsNameArray = searchObject.artists.map(
            (artistObj) => artistObj.name // making an array of artists
          );

          const isTitle = containsSubstring(
            title.replaceAll(regex, ""),
            parseFileName(searchObject.name, file.artists)
              .toLowerCase()
              .replaceAll(regex, "")
          );
          const isDuration =
            file.duration - 10 <=
            searchObject.duration_ms / 1000 <=
            file.duration + 10;
          const isArtists = file.artists
            ? containsSubstring(
                file.artists.join("").toLowerCase(),
                artistsNameArray.join("").toLowerCase()
              )
            : false;
          const isYear = file.year
            ? file.year === searchObject.album.release_date.slice(0, 4)
            : false;
          if (isArtists && isTitle) {
            return {
              // CHANGE COMMENTS ABOUT FUNC (MADE OBJECT WITH LESS INFO)
              originalFileTitle: title,
              isMatched: true,
              searchObjectName: searchObject.name,
              date: searchObject.album.release_date,
              duration: searchObject.duration_ms,
              trackId: searchObject.id,
              href: searchObject.href,
            };
          }
          if ((isArtists || isTitle) && (isDuration || isYear)) {
            console.log(searchObject.name);
            return {
              originalFileTitle: title,
              isMatched: true,
              searchObjectName: searchObject.name,
              date: searchObject.album.release_date,
              duration: searchObject.duration_ms,
              trackId: searchObject.id,
              href: searchObject.href,
            };
          } else if (isArtists || isTitle || isDuration || isYear) {
            return {
              originalFileTitle: title,
              isMatched: false,
              searchObjectName: searchObject.name,
              date: searchObject.album.release_date,
              duration: searchObject.duration_ms,
              trackId: searchObject.id,
              href: searchObject.href,
            };
          } else {
            return {isMatched: false, originalFileTitle: null};
          }
        }
      );

      return {name:  file.title|| file.fileName, options: arrayOfSearchedOptions};
    }
  });
  const fullfilledSongsSearchResult = await Promise.all(
    arrayOfSongsSearchResult
  );
  console.log(fullfilledSongsSearchResult);
  return fullfilledSongsSearchResult;
};

// func checks length, which string is longer will be longer.includes(smaller)
// faster than str1.includes(str2) || str2.includes(str1) coz first checks for length to prevent unnecessary checks
// like smaller.includes(longer) -> automaticly false
function containsSubstring(str1, str2) {
  if (str1 === "" || str2 === "") return false;
  return str1.length > str2.length ? str1.includes(str2) : str2.includes(str1);
}

// parsing file name and deleting some stuff
const parseFileName = (fileName, arrayOfArtists) => {
  let mainRegex = `\\([a-zA-Z0-9]+\\)|\\[[a-zA-Z0-9]+\\]|(\\.mp3)+|\\.com|\\.net|feat|feat\\.`;
  let regexForsymbols = /\.| |_|-| +/g;
  if (arrayOfArtists.length > 0) {
    mainRegex +=
      "|" +
      arrayOfArtists
        .filter((el) => {
          if (el) {
            return el;
          }
        })
        .join("|");
  }
  const regex = new RegExp(mainRegex, "g"); // deleting all (smth), [smth], artists name, .mp3, .net, .com, feat, feat.

  fileName = fileName.replace(regex, "").trim();
  fileName = fileName.replace(regexForsymbols, " ").trim();
  fileName = fileName.replace(/ +/g, " ").trim();
  const firstDot = fileName.indexOf("."); // Use indexOf instead of search,
  if (fileName.includes(" ") && firstDot > 0) {
    // needs to delete things like: title.CreatedBySmth
    fileName = fileName.slice(0, firstDot);
  }
  return fileName;
};
