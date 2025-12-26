// src/api/api.js
import { mockApi } from "../mock/mockApi";

const USE_MOCK = process.env.REACT_APP_USE_MOCK === "true";

export const api = {
  getLists() {
    return USE_MOCK
      ? mockApi.getLists()
      : fetchReal("/lists");
  },

  createList(data) {
    return USE_MOCK
      ? mockApi.createList(data)
      : fetchReal("/lists", "POST", data);
  },

  updateList(id, data) {
    return USE_MOCK
      ? mockApi.updateList(id, data)
      : fetchReal(`/lists/${id}`, "PUT", data);
  },

  deleteList(id) {
    return USE_MOCK
      ? mockApi.deleteList(id)
      : fetchReal(`/lists/${id}`, "DELETE");
  }
};


async function fetchReal(url, method = "GET", body = null) {
  const response = await fetch("http://localhost:3001" + url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined
  });

  if (!response.ok) throw new Error("Server error");

  return response.json();
}
