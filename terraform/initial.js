addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const path = request.url.replace("https://maven.kotori316.com/", "");
  console.log(path);
  const res = await fetch(
    `https://storage.googleapis.com/kotori316-maven-storage/maven/${path}`,
    {
      method: "GET",
      redirect: "follow",
    },
  );
  if (!res.ok) {
    return new Response('Not Found', {
      status: 404,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  }
  return res;
}
