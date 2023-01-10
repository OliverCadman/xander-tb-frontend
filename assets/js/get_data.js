BASE_API_URL = "http://127.0.0.1:8000/api/orders";

async function getData(endpoint) {
  const url = `${BASE_API_URL}${endpoint}`;
  try {
    const resp = await fetch(url);
    const data = await resp.json();
    return data;
  } catch (err) {
    console.log(`Error: ${err}`);
  }
}
