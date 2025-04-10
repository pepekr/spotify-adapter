export async function POST(req) {
  const request = await req.json();
  console.log(request);
  const headers = req.headers.get("Content-type");
  console.log(headers);
  return new Response("OK", { status: 200 });
}
