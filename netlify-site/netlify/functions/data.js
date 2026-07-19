// Netlify Function backing shared, cross-device storage for the fixture
// tracker using Netlify Blobs. Deployed automatically as
// /.netlify/functions/data — no external account or API key needed, it
// uses the Netlify site's own built-in blob store.
//
// GET  /.netlify/functions/data?key=blueTigerFixtures  -> returns the saved JSON (or "null")
// POST /.netlify/functions/data?key=blueTigerFixtures  -> body is the JSON to save
//
// Every visitor to the deployed site hits this same function, which reads
// and writes the same blob store, so everyone sees the same data.

const { getStore } = require("@netlify/blobs");

exports.handler = async (event) => {
  const key = event.queryStringParameters && event.queryStringParameters.key;

  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };

  if(event.httpMethod === "OPTIONS"){
    return { statusCode: 204, headers: cors };
  }

  if(!key){
    return { statusCode: 400, headers: cors, body: "Missing ?key= parameter" };
  }

  // A lightweight key used just to check the function is reachable at all
  // (see detectStorageMode() in index.html) — always answer it directly
  // without touching the blob store.
  if(key === "__ping__"){
    return { statusCode: 200, headers: cors, body: "ok" };
  }

  try{
    const store = getStore("blueTigersData");

    if(event.httpMethod === "GET"){
      const value = await store.get(key);
      return {
        statusCode: 200,
        headers: { ...cors, "Content-Type": "application/json" },
        body: value === null ? "null" : value
      };
    }

    if(event.httpMethod === "POST"){
      await store.set(key, event.body || "");
      return {
        statusCode: 200,
        headers: { ...cors, "Content-Type": "application/json" },
        body: JSON.stringify({ ok: true })
      };
    }

    return { statusCode: 405, headers: cors, body: "Method Not Allowed" };
  }catch(err){
    return {
      statusCode: 500,
      headers: cors,
      body: JSON.stringify({ error: String(err && err.message || err) })
    };
  }
};
