BASE_API_URL = "http://ec2-18-216-75-132.us-east-2.compute.amazonaws.com/api/orders";

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
