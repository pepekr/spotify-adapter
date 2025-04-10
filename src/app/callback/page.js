"use client";
import React, { useEffect, useState } from "react";

export default function Callback() {
  console.log("running");
  useEffect(() => {
    console.log("running");
    processQuery();
  }, []);

  return <div>Processing...</div>;
}
const processQuery = async () => {
  console.log("running");
  const querySearch = new URLSearchParams(window.location.search);
  await sendQuery(querySearch);
  window.location.href =
    process.env.NEXT_PUBLIC_API_BASE_URL + window.location.search;
  /*     +"&querySent=true"; */
};
const sendQuery = async (querySearch) => {
  console.log("runnnig");
  if (querySearch.has("code")) {
    const codeParam = querySearch.get("code");
    console.log(`Code ${codeParam}`);
    await fetch(`/api/auth`, {
      method: "POST",
      body: JSON.stringify(codeParam),
    });
  } else if (querySearch.has("error")) {
    console.log(error);
  } // зробити так аби фронт отримував ці меседжі можливо гет метод p.s. просто кидаєм quety params при редіректі
};
