// https://codeforces.com/apiHelp

const crypto = require("crypto");
const axios = require("axios");

const makeAttempt = async (methodName, params) => {
  let url = "https://codeforces.com/api/";
  url += `${methodName}?`;

  params.push(
    ["apiKey", process.env.CF_API_KEY],
    ["time", String(Math.floor(Date.now() / 1000))]
  );

  params.sort((a, b) => {
    if (a[0] === b[0]) return a[1] < b[1] ? -1 : 1;
    return a[0] < b[0] ? -1 : 1;
  });

  for (const pair of params) {
    url += `${pair[0]}=${pair[1]}&`;
  }

  const rand = Math.floor(Math.random() * 1000000);
  let apiSig =
    `${rand}/` +
    url.substring(url.indexOf("api/") + 4, url.length - 1) +
    `#${process.env.CF_API_SECRET}`;

  apiSig = crypto.createHash("sha512").update(String(apiSig)).digest("hex");

  url += `apiSig=${rand}${apiSig}`;

  let response = await axios.get(url);
  return response;
};

const makeRequest = async (methodName, params) => {
  let response = null;
  for (let i = 0; i < 5; ++i) {
    try {
      response = await makeAttempt(methodName, params);
    } catch (err) {
      error = err;
    }

    if (response !== null) break;
  }

  if (response === null) throw new Error(error);

  return response;
};

module.exports = makeRequest;
