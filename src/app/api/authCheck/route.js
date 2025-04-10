import { cookies } from "next/headers";
export async function GET()
{
    const cookieStorage = await cookies();
    const access_token = cookieStorage.get("access_token");
    const refresh_token = cookieStorage.get("refresh_token");
    if(!access_token&&!refresh_token)
        {
            return new Response("Unauthorized", {status:401});
        }
    return new Response ("Good", {status:200});
}