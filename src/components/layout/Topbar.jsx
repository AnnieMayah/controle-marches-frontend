import { useEffect, useRef, useState } from "react";
import Icone from "../ui/Icone";
import useClickOutside from "../../hooks/useClickOutside";
import { useAuth } from "../../context/AuthContext";
import { rechercher, getNotifications } from "../../services/divers";
import { formatDate, LIBELLES_ROLES } from "../../utils/format";

const COULEURS_NIVEAU = { info: "var(--primary)", succes: "var(--success)", alerte: "var(--warning)" };
const enDate = (iso) => new Date(/[zZ]|[+-]\d\d:\d\d$/.test(iso) ? iso : iso + "Z");

export default function Topbar({ naviguer }) {
  const { utilisateur, seDeconnecter } = useAuth();

  // ----- recherche globale -----
  const [q, setQ] = useState("");
  const [resultats, setResultats] = useState(null);
  const [rechercheOuverte, setRechercheOuverte] = useState(false);
  const refRecherche = useRef(null);
  useClickOutside(refRecherche, () => setRechercheOuverte(false));

  useEffect(() => {
    if (q.trim().length < 2) { setResultats(null); return; }
    const t = setTimeout(() => rechercher(q.trim()).then(setResultats).catch(() => setResultats(null)), 300);
    return () => clearTimeout(t);
  }, [q]);

  const aller = (page, params) => { setRechercheOuverte(false); setQ(""); naviguer(page, params); };
  const total = resultats ? resultats.marches.length + resultats.entites.length + resultats.controles.length : 0;

  // ----- notifications -----
  const [notifs, setNotifs] = useState([]);
  const [notifsOuvert, setNotifsOuvert] = useState(false);
  const [vuLe, setVuLe] = useState(() => localStorage.getItem("cmp-notif-vu") || "1970-01-01T00:00:00.000Z");
  const refNotifs = useRef(null);
  useClickOutside(refNotifs, () => setNotifsOuvert(false));

  useEffect(() => {
    const charger = () => getNotifications().then(setNotifs).catch(() => {});
    charger();
    const t = setInterval(charger, 60000);
    return () => clearInterval(t);
  }, []);

  const nonLues = notifs.filter((n) => enDate(n.date) > new Date(vuLe)).length;
  const ouvrirNotifs = () => {
    const ouvrir = !notifsOuvert;
    setNotifsOuvert(ouvrir);
    if (ouvrir) { const maintenant = new Date().toISOString(); localStorage.setItem("cmp-notif-vu", maintenant); setTimeout(() => setVuLe(maintenant), 1500); }
  };

  // ----- menu utilisateur -----
  const [menuOuvert, setMenuOuvert] = useState(false);
  const refMenu = useRef(null);
  useClickOutside(refMenu, () => setMenuOuvert(false));
  const initiales = `${utilisateur.prenom?.[0] ?? ""}${utilisateur.nom?.[0] ?? ""}`.toUpperCase();

  return (
    <header className="topbar">
      <div className="search-wrap" ref={refRecherche}>
        <div className="search-box">
          <Icone nom="recherche" />
          <input value={q} onChange={(e) => { setQ(e.target.value); setRechercheOuverte(true); }} onFocus={() => setRechercheOuverte(true)}
                 placeholder="Rechercher une entité, un marché, un contrôle…" aria-label="Recherche globale" />
        </div>
        {rechercheOuverte && q.trim().length >= 2 && (
          <div className="popover gauche">
            {!resultats && <div className="popover-titre">Recherche…</div>}
            {resultats && total === 0 && <div className="popover-titre">Aucun résultat pour « {q} »</div>}
            {resultats?.controles.length > 0 && <div className="popover-titre">Contrôles</div>}
            {resultats?.controles.map((c) => (
              <button key={`c${c.id}`} className="popover-item" onClick={() => aller("detail-controle", { idControle: c.id })}>
                {c.reference}<small>{c.reference_marche} — {c.entite}</small>
              </button>
            ))}
            {resultats?.marches.length > 0 && <div className="popover-titre">Marchés</div>}
            {resultats?.marches.map((m) => (
              <button key={`m${m.id}`} className="popover-item" onClick={() => aller("entites-marches", { onglet: "marches", recherche: m.reference })}>
                {m.reference}<small>{m.objet}</small>
              </button>
            ))}
            {resultats?.entites.length > 0 && <div className="popover-titre">Entités</div>}
            {resultats?.entites.map((e) => (
              <button key={`e${e.id}`} className="popover-item" onClick={() => aller("entites-marches", { onglet: "entites", recherche: e.nom })}>
                {e.nom}<small>{e.type}</small>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="topbar-droite">
        <div style={{ position: "relative" }} ref={refNotifs}>
          <button className="icon-btn" onClick={ouvrirNotifs} aria-label="Notifications">
            <Icone nom="cloche" taille={20} />
            {nonLues > 0 && <span className="notif-badge">{nonLues > 9 ? "9+" : nonLues}</span>}
          </button>
          {notifsOuvert && (
            <div className="popover notif-liste">
              <div className="popover-titre">Activité récente</div>
              {notifs.length === 0 && <div className="vide">Aucune activité pour le moment.</div>}
              {notifs.map((n, i) => (
                <div key={i} className="popover-item" style={{ cursor: "default" }}>
                  <span className="notif-point" style={{ background: COULEURS_NIVEAU[n.niveau] }} />{n.texte}
                  <small>{formatDate(enDate(n.date).toISOString())}</small>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ position: "relative" }} ref={refMenu}>
          <button className="user-chip" onClick={() => setMenuOuvert(!menuOuvert)}>
            <span className="avatar">{initiales}</span>
            <span className="infos">
              <div className="nom">{utilisateur.prenom} {utilisateur.nom}</div>
              <div className="role">{LIBELLES_ROLES[utilisateur.role] || utilisateur.role}</div>
            </span>
            <Icone nom="chevron" taille={16} />
          </button>
          {menuOuvert && (
            <div className="popover" style={{ minWidth: 200 }}>
              <button className="popover-item" onClick={() => { setMenuOuvert(false); naviguer("parametres"); }}>Paramètres du compte</button>
              <button className="popover-item" onClick={seDeconnecter}>Se déconnecter</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
