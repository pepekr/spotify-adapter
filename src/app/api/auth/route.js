import { cookies } from "next/headers";
/* import { useEffect } from "react"; */

export async function POST(req) {
  /*   useEffect(()=>{},[]) */
  const code = await req.json(); // recieving code
  if(!code)
    {
      return new Response ("No code for authentication", {status:500, Ok:false})
    }
  console.log(`Code: ${code} `); // ensure that code is exist

  const formBody = new URLSearchParams({
    // making url params to get auth token
    code: code,
    redirect_uri: process.env.REDIRECT_URI,
    grant_type: "authorization_code",
  }).toString();

  const response = await fetch("https://accounts.spotify.com/api/token", {
    //making fetch to spotify for auth object
    method: "POST",
    body: formBody,
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " +
        new Buffer.from(
          process.env.CLIENT_ID + ":" + process.env.CLIENT_SECRET
        ).toString("base64"),
    },
    json: true,
  });
  if(!response.ok)
    {
      console.log(await response.text());
    }
    else{console.log("response ok")}
  const responseObj = await response.json(); // taking auth object from a response
  console.log(responseObj.access_token); // checking

  //Cookie part
  const cookieStorage = cookies();
  setTokenCookie(cookieStorage, responseObj); // func to set a cookie if a token exists in an auth object
  console.log("TEST COOKIE !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
  console.log(cookieStorage.getAll());
  return new Response("OK", { status: 200, body: "GOODIE" });
}

const setTokenCookie = (cookieStorage, responseObj) => {
  console.log("TEST COOKIE !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
  console.log(cookieStorage.getAll());
  const oneHour = 3600000;
  const now = new Date();
  const expiration = new Date(now.getTime() + oneHour);
  const tokens = [
    // an array of token objects that needs to be in a response
    { name: "access_token", expires_in: expiration }, // TIME IS SHIT !!!!!
    { name: "refresh_token", expires_in: undefined },
  ];
  console.log(`EXPIRE: ${tokens[0].expires_in}`);
  tokens.forEach((token) => {
    // for each object token check if
    if (responseObj[token.name]) {
      // token.name is dynamic key it gets what key is storing like responseObj.access_token

      // if response object has name of token than store data of that name
      cookieStorage.set(token.name, responseObj[token.name], {
        expires: token.expires_in ? token.expires_in : undefined,
        httpOnly: true,
        secure: true,
        sameSite: 'Strict', 
      });
      console.log(`COOKIE STORED ${responseObj[token.name]}`);
    } else {
      throw new Error(`NO ${token.name} in a response`); // if some token are not in the responseObj throw an error
    }
  });
  console.log("TEST COOKIE !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
  console.log(cookieStorage.getAll());
};
