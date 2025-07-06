import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import querystring from "querystring";
export async function GET() {
  const cookieStorage = await cookies();
  const refreshToken = cookieStorage.get("refresh_token");
  if(refreshToken)
    {
      return NextResponse.redirect(NEXT_PUBLIC_API_BASE_URL );
    }
  console.log("runinng");
  let url =
    "https://accounts.spotify.com/authorize?" +
    querystring.stringify({
      response_type: "code",
      client_id: process.env.CLIENT_ID,
      scope: "playlist-modify-public, playlist-modify-private, user-read-private, user-read-email",
      redirect_uri: process.env.REDIRECT_URI,
      state: "1234567890098765",
    });
    
  return NextResponse.redirect(url);
}
