// src/mock/mockApi.js

let mockSeznamy = [
  {
    id: 1,
    nazev: "Seznam Lidl",
    vlastnik: "Alice",
    clenove: ["Alice", "Bob", "Carol"],
    polozky: [
      { id: 1, nazev: "Mléko", vyrieseno: false },
      { id: 2, nazev: "Chleba", vyrieseno: true },
    ],
    archivovany: false,
  },
  {
    id: 2,
    nazev: "Seznam Tesco",
    vlastnik: "Bob",
    clenove: ["Bob", "Alice", "David"],
    polozky: [
      { id: 1, nazev: "Máslo", vyrieseno: false },
      { id: 2, nazev: "Sýr", vyrieseno: false },
    ],
    archivovany: false,
  },
];

export const mockApi = {
  getLists() {
    return Promise.resolve(mockSeznamy);
  },

  createList(data) {
    const newList = { ...data, id: mockSeznamy.length + 1, polozky: [], archivovany: false };
    mockSeznamy.push(newList);
    return Promise.resolve(newList);
  },

  updateList(id, changes) {
    mockSeznamy = mockSeznamy.map(s =>
      s.id === id ? { ...s, ...changes } : s
    );
    return Promise.resolve(mockSeznamy.find(s => s.id === id));
  },

  deleteList(id) {
    mockSeznamy = mockSeznamy.filter(s => s.id !== id);
    return Promise.resolve(true);
  }
};

