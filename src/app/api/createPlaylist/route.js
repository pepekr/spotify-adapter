import { cookies } from "next/headers";
export async function POST(req)
{
    const {playlistName, finalArray} = await req.json();
    const originalArrayOfIds = finalArray;
    const arrayOfIds = originalArrayOfIds.slice(0, 100);
    const cookieStorage = await cookies();
    const authToken = cookieStorage.get("access_token") || cookieStorage.get("refresh_token");
    const userId = await getUserId(authToken.value)
    let response = undefined;
    if(userId===null){
            return new Response("NO USER ID FOUND", {status:500})
        }
    const creationResponse = await createPlaylist(authToken.value,userId, playlistName);
    const playlistInfo = await creationResponse.json();
            
    const playlistId = playlistInfo.id;
    if(playlistId===null)
        {
            return new Response("NO PLAYLIST ID FOUND", {status:500})
        }

    response =  await addSongs(authToken.value, arrayOfIds, playlistId);
    console.log(response)
    return response;
}

async function getUserId(authToken)
    {
        
        try {
            const response = await fetch("https://api.spotify.com/v1/me",{
                method:'GET',
                headers:{
                    Authorization: "Bearer "+ authToken,
                },
            });
         
            if(!response.ok){
                console.log("ERROR IN ID FUNCTION: ",response);
                return null;
            }
            const responseJson = await response.json();
            
         return responseJson.id;
        } catch (error) {
            console.log(error);
        }
    }
async function createPlaylist(authToken,userId, playlistName)
{
    try {
        const response = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
            method:'POST',
            headers:
            {
                'Content-Type': 'application/json',
                Authorization: "Bearer "+ authToken,
            },
            body: JSON.stringify({
                name: playlistName,
                description: "smth for a test",
                public: false,
            })
            
        })
        if(!response.ok){
            console.log("RESPONSE IS NOT OK !!!", await response.json());
            return null;
        }
        return response;
    } catch (error) {
        
        console.log("THIS SHIT RIGHT HERE",error);
    }
}
async function addSongs(authToken, arrayOfIds, playlistId)
{

    arrayOfIds = arrayOfIds.map((id)=>
        {
            return id = `spotify:track:${id}`
        }) 
    const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
        {
            method:"POST",
            headers:
            {
                'Content-Type':'application/json',
                Authorization: "Bearer "+authToken,
            },
            body: JSON.stringify({
                "uris":arrayOfIds,
                "position": 0
              })
        })
        if(!response.ok)
            {

                console.log("ERROR IN ADDING", await response.json());
                return new Response("Error during the adding", {status:500});
            }
        else
        {
            return new Response("Songs added", {status:200});
        }
}
