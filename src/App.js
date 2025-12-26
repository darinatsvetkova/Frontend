import { BrowserRouter as Router, Routes, Route, Link, useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import './App.css';
import { api } from "./api/api";

// nové importy pro grafy a překlady
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useTranslation } from 'react-i18next';
import './i18n';

const prihlasenyUzivatel = "Alice";

const ramecekStyl = {
  border: "1px solid ",
  borderRadius: "8px",
  padding: "15px",
  marginBottom: "15px"
};

const itemStyl = {
  padding: "10px",
  marginBottom: "10px",
  borderRadius: "8px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

function App() {
  const [seznamy, setSeznamy] = useState([]);
  const [zobrazitArchiv, setZobrazitArchiv] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // dark mode
  const [darkMode, setDarkMode] = useState(false);

  // překlady
  const { t, i18n } = useTranslation();

  useEffect(() => {
    setLoading(true);
    setError(null);
    api.getLists()
      .then((data) => setSeznamy(data))
      .catch((err) => {
        console.error(err);
        setError("Chyba při načítání seznamů!");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
   <div className={`app ${darkMode ? "dark-mode" : "light-mode"}`}>
    <Router>
       <Routes>

          <Route
            path="/"
            element={
              <HomePage
                seznamy={seznamy}
                setSeznamy={setSeznamy}
                zobrazitArchiv={zobrazitArchiv}
                setZobrazitArchiv={setZobrazitArchiv}
                darkMode={darkMode}
                setDarkMode={setDarkMode}
                t={t}
                i18n={i18n}
              />
            }
          />
          <Route
            path="/seznam/:id"
            element={<DetailPage seznamy={seznamy} setSeznamy={setSeznamy} />}
          />
          <Route
            path="/members/:id"
            element={<ManageMembers seznamy={seznamy} setSeznamy={setSeznamy} />}
          />
        </Routes>
      </Router>
    </div>
  );
}

function HomePage({ seznamy, setSeznamy, zobrazitArchiv, setZobrazitArchiv, darkMode, setDarkMode, t, i18n }) {
  const [showModal, setShowModal] = useState(false);
  const [errorAction, setErrorAction] = useState(null);

  const dostupneSeznamy = seznamy.filter(
    (s) =>
      (s.vlastnik === prihlasenyUzivatel ||
        s.clenove.includes(prihlasenyUzivatel)) &&
      s.archivovany === zobrazitArchiv
  );

  const smazatSeznam = (id) => {
    if (!window.confirm("Opravdu chceš smazat seznam?")) return;

    setErrorAction(null);

    api.deleteList(id)
      .then(() => setSeznamy(seznamy.filter((s) => s.id !== id)))
      .catch((err) => {
        console.error(err);
        setErrorAction("Chyba při mazání seznamu!");
      });
  };

  const archivovatSeznam = (id) => {
    setErrorAction(null);

    api.updateList(id, { archivovany: true })
      .then((upd) => setSeznamy(seznamy.map((s) => (s.id === id ? upd : s))))
      .catch((err) => {
        console.error(err);
        setErrorAction("Chyba při archivaci seznamu!");
      });
  };

  // data pro sloupcový graf
  const chartData = dostupneSeznamy.map(s => ({
    name: s.nazev,
    items: s.polozky.length
  }));

  return (
    <div className="container">
      <div className="top-bar">
        <div className="user-box">{prihlasenyUzivatel}</div>
        <button className="button" onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? "Light Mode" : "Dark Mode"}
        </button>
        
  <button className="button" onClick={() => i18n.changeLanguage("cs")}>CZ</button>
  <button className="button" onClick={() => i18n.changeLanguage("en")}>EN</button>

        <button className="button">Odhlásit se</button>
      </div>

      <h1>{t("My shopping lists")}</h1>

      {errorAction && <p style={{ color: "red" }}>{errorAction}</p>}

      <div className="controls">
        {!zobrazitArchiv && (
          <button className="button" onClick={() => setShowModal(true)}>{t("Create new list")}</button>
        )}
        <button className="button" onClick={() => setZobrazitArchiv(!zobrazitArchiv)}>
          {zobrazitArchiv ? t("Show active lists") : t("Show archived lists")}
        </button>
      </div>

      <div className="list-grid">
        {dostupneSeznamy.map((s) => (
          <div key={s.id} style={ramecekStyl} className="card">
            <div className="list-header">
              <strong className="list-name">{s.nazev}</strong>
            </div>
            <p><strong>Owner:</strong> {s.vlastnik}</p>
            <div className="list-buttons">
              <Link to={`/seznam/${s.id}`}><button className="button">Open</button></Link>
              {!zobrazitArchiv && s.vlastnik === prihlasenyUzivatel && (
                <button className="button" onClick={() => archivovatSeznam(s.id)}>Archive</button>
              )}
              {s.vlastnik === prihlasenyUzivatel && (
                <button className="button" onClick={() => smazatSeznam(s.id)}>Delete</button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Sloupcový graf */}
      <div style={{ marginTop: "30px" }}>
        <h2>Lists overview</h2>
        <BarChart width={500} height={300} data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="items" fill="#82ca9d" />
        </BarChart>
      </div>

      <Modal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={(nazev) => {
          if (!nazev) return;

          setErrorAction(null);

          api.createList({
            nazev,
            vlastnik: prihlasenyUzivatel,
            clenove: [prihlasenyUzivatel],
            polozky: [],
            archivovany: false,
          })
            .then(() => api.getLists())
            .then((data) => {
              setSeznamy(data);
              setShowModal(false);
            })
            .catch((err) => {
              console.error(err);
              setErrorAction("Chyba při vytváření seznamu!");
            });
        }}
      />
    </div>
  );
}

function DetailPage({ seznamy, setSeznamy }) {
  const { id } = useParams();
  const seznam = seznamy.find((s) => s.id === parseInt(id));
  const [errorAction, setErrorAction] = useState(null);
  const [filterNevyriesene, setFilterNevyriesene] = useState(true);
  const navigate = useNavigate();

  if (!seznam) return <p>Seznam nenalezen</p>;

  const updateSeznam = (upd) => {
    setErrorAction(null);

    api.updateList(seznam.id, upd)
      .then((updated) => setSeznamy(seznamy.map((s) => (s.id === seznam.id ? updated : s))))
      .catch((err) => {
        console.error(err);
        setErrorAction("Chyba při aktualizaci seznamu!");
      });
  };

  const pridatPolozku = () => {
    const nazev = prompt("Název nové položky:");
    if (!nazev) return;
    const novaPolozka = { id: seznam.polozky.length + 1, nazev, vyrieseno: false };
    updateSeznam({ polozky: [...seznam.polozky, novaPolozka] });
  };

  const smazatPolozku = (polozkaId) => {
    updateSeznam({ polozky: seznam.polozky.filter((p) => p.id !== polozkaId) });
  };

  const toggleVyrieseno = (polozkaId) => {
    updateSeznam({
      polozky: seznam.polozky.map((p) =>
        p.id === polozkaId ? { ...p, vyrieseno: !p.vyrieseno } : p
      )
    });
  };

  const completePolozku = (polozkaId) => {
    updateSeznam({
      polozky: seznam.polozky.map((p) =>
        p.id === polozkaId ? { ...p, vyrieseno: true } : p
      )
    });
  };

  const zmenNazev = (novyNazev) => {
    updateSeznam({ nazev: novyNazev });
  };

  // data pro koláčový graf
  const completed = seznam.polozky.filter(p => p.vyrieseno).length;
  const notCompleted = seznam.polozky.length - completed;
  const data = [
    { name: 'Completed', value: completed },
    { name: 'Not completed', value: notCompleted }
  ];
  const COLORS = ['#0088FE', '#FF8042'];

  return (
    <div className="container">
      <button className="button back-btn" onClick={() => navigate("/")}>← Back to lists</button>

      {errorAction && <p style={{ color: "red" }}>{errorAction}</p>}

      <div style={{ ...ramecekStyl, display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h1 style={{ margin: 0, fontSize: "1.8em" }}>{seznam.nazev}</h1>
        {seznam.vlastnik === prihlasenyUzivatel && (
          <button className="button" onClick={() => {
            const novyNazev = prompt("Zadej nový název seznamu:", seznam.nazev);
            if (novyNazev) zmenNazev(novyNazev);
          }}>Rename</button>
        )}
      </div>

      {/* Members */}
      <div style={{ ...ramecekStyl, marginBottom: "20px" }}className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2>Members</h2>
          {seznam.vlastnik === prihlasenyUzivatel && (
            <Link to={`/members/${seznam.id}`}><button className="button">Manage</button></Link>
          )}
        </div>
        <ul>
          {seznam.clenove.map((c) => (
            <li key={c}>{c} {c === seznam.vlastnik && "(Owner)"}</li>
          ))}
        </ul>
        {seznam.clenove.includes(prihlasenyUzivatel) && seznam.vlastnik !== prihlasenyUzivatel && (
          <button className="button" onClick={() => {
            if (window.confirm("Opravdu chceš odejít z tohoto seznamu?")) {
              updateSeznam({ clenove: seznam.clenove.filter((cl) => cl !== prihlasenyUzivatel) });
              navigate("/");
            }
          }}>Leave the shopping list</button>
        )}
      </div>

      {/* Items */}
      <div style={ramecekStyl} className="card">
        <label className="checkbox-label">
          <input type="checkbox" checked={!filterNevyriesene} onChange={() => setFilterNevyriesene(!filterNevyriesene)} /> Show completed items
        </label>
        <ul className="items-list">
          {seznam.polozky.filter((p) => !filterNevyriesene || !p.vyrieseno).map((p) => (
            <li key={p.id} style={itemStyl} className="card">

              <span>
                <input type="checkbox" checked={p.vyrieseno} onChange={() => toggleVyrieseno(p.id)} /> {p.nazev}
              </span>
              <div>
                <button className="button" onClick={() => completePolozku(p.id)}>Complete</button>
                <button className="button" onClick={() => smazatPolozku(p.id)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
        <button className="button" onClick={pridatPolozku}>+ Add item</button>
      </div>

      {/* Koláčový graf */}
      <div style={{ marginTop: "30px" }}>
        <h2>Items status</h2>
        <PieChart width={300} height={300}>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={80}
            fill="#8884d8"
            label
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </div>
    </div>
  );
}

// ManageMembers a Modal zůstávají beze změny
// ... (ponechávám přesně tvůj původní kód pro ManageMembers a Modal)
function ManageMembers({ seznamy, setSeznamy }) {
  const { id } = useParams();
  const seznam = seznamy.find((s) => s.id === parseInt(id));
  const [errorAction, setErrorAction] = useState(null);
  const navigate = useNavigate();

  if (!seznam) return <p>Seznam nenalezen</p>;

  const updateSeznam = (upd) => {
    setErrorAction(null);

    api.updateList(seznam.id, upd)
      .then((updated) => setSeznamy(seznamy.map((s) => (s.id === seznam.id ? updated : s))))
      .catch((err) => {
        console.error(err);
        setErrorAction("Chyba při aktualizaci členů seznamu!");
      });
  };

  const pridatClena = () => {
    const jmeno = prompt("Zadej jméno nového člena:");
    if (!jmeno) return;
    if (!seznam.clenove.includes(jmeno)) {
      updateSeznam({ clenove: [...seznam.clenove, jmeno] });
    } else alert("Uživatel již je členem seznamu!");
  };

  const odebratClena = (c) => {
    updateSeznam({ clenove: seznam.clenove.filter((cl) => cl !== c) });
  };

  return (
    <div className="container">
      <button className="button back-btn" onClick={() => navigate(-1)}>← Back</button>

      {errorAction && <p style={{ color: "red" }}>{errorAction}</p>}

      <h1>Members of the shopping list</h1>
      <div className="list-grid">
        {seznam.clenove.map((c) => (
          <div key={c} style={ramecekStyl} className="card">
            <p><strong>Name:</strong> {c}</p>
            <p><strong>Role:</strong> {c === seznam.vlastnik ? <u>Owner</u> : "Member"}</p>
            {c !== seznam.vlastnik && <button className="button" onClick={() => odebratClena(c)}>Remove</button>}
          </div>
        ))}
      </div>
      <button className="button" onClick={pridatClena}>+ Add member</button>
    </div>
  );
}

function Modal({ visible, onClose, onSubmit }) {
  if (!visible) return null;

  return (
    <div style={modalOverlay}>
      <div style={modalContent}>
        <h2>Create new list</h2>
        <input id="modalInput" type="text" placeholder="Name of the list" style={modalInput} />
        <div style={{ textAlign: "right", marginTop: "20px" }}>
          <button className="button" onClick={onClose}>Cancel</button>
          <button className="button" onClick={() => {
            const val = document.getElementById("modalInput").value;
            onSubmit(val);
          }}>Create</button>
        </div>
      </div>
    </div>
  );
}

const modalOverlay = {
  position: "fixed",
  top: 0, left: 0,
  width: "100%", height: "100%",
  backgroundColor: "rgba(0,0,0,0.4)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center"
};

const modalContent = {
  padding: "20px",
  borderRadius: "10px",
  width: "300px"
};


const modalInput = {
  width: "100%",
  padding: "8px",
  marginTop: "10px",
  borderRadius: "5px",
  border: "1px solid #ddd"
};

export default App;