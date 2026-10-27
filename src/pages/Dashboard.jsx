import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList } from "recharts";
import Icone from "../components/ui/Icone";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../theme/ThemeContext";
import { getPalette } from "../theme/colors";
import {
  getResume, getEvolution, getStatsParNature, getStatsParModePassation, getTauxConformite, getTauxConformiteParEntite,
} from "../services/statistiques";
import { getControles } from "../services/controles";
import { getRisques } from "../services/marches";
import { CLASSE_NIVEAU } from "./Detection";
import { formaterErreur } from "../utils/erreurs";
import { formatDate, formatMontant, statutControle } from "../utils/format";

function Kpi({ icone, couleur, valeur, label, delta, sousTexte }) {
  const aDelta = delta !== null && delta !== undefined;
  return (
    <div className="kpi-card">
      <div className={`kpi-icone ${couleur}`}><Icone nom={icone} taille={24} /></div>
      <div>
        <div className="kpi-valeur">{valeur}</div>
        <div className="kpi-label">{label}</div>
        {aDelta ? (
          <div className={`kpi-delta ${delta > 0 ? "hausse" : delta < 0 ? "baisse" : ""}`}>
            {delta !== 0 && <Icone nom={delta > 0 ? "fleche_haut" : "fleche_bas"} taille={13} />}
            {delta > 0 ? "+" : ""}{delta}% <span style={{ fontWeight: 400, color: "var(--text-muted)" }}>par rapport au mois dernier</span>
          </div>
        ) : sousTexte ? <div className="kpi-delta">{sousTexte}</div> : null}
      </div>
    </div>
  );
}

function TableauMontants({ titre, lignes, colonne, pal, styleTooltip }) {
  const [vue, setVue] = useState("tableau");
  const totalMontant = lignes.reduce((t, l) => t + l.montant, 0);
  const totalNombre = lignes.reduce((t, l) => t + l.nombre, 0);
  const donnees = lignes.filter((l) => l.montant > 0);
  return (
    <div className="card">
      <div className="card-entete"><h3>{titre}</h3>
        <div className="tabs" style={{ marginBottom: 0 }} role="group" aria-label="Mode d'affichage">
          <button className={`tab ${vue === "tableau" ? "actif" : ""}`} onClick={() => setVue("tableau")}>Tableau</button>
          <button className={`tab ${vue === "camembert" ? "actif" : ""}`} onClick={() => setVue("camembert")}>Camembert</button>
        </div>
      </div>
      {lignes.length === 0 ? <div className="vide">Aucune donnée.</div> : vue === "tableau" ? (
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>{colonne}</th><th className="num">Nombre</th><th className="num">Montant</th><th className="num">Part</th></tr></thead>
            <tbody>
              {lignes.map((l) => (
                <tr key={l.libelle}>
                  <td>{l.libelle}</td><td className="num">{l.nombre}</td>
                  <td className="num">{formatMontant(l.montant)}</td>
                  <td className="num">{totalMontant ? Math.round((l.montant / totalMontant) * 100) : 0}%</td>
                </tr>
              ))}
              <tr><td><strong>Total</strong></td><td className="num"><strong>{totalNombre}</strong></td>
                <td className="num"><strong>{formatMontant(totalMontant)}</strong></td><td className="num"><strong>100%</strong></td></tr>
            </tbody>
          </table>
        </div>
      ) : (
        <>
          <div style={{ height: 210 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={donnees} dataKey="montant" nameKey="libelle" innerRadius={52} outerRadius={86} paddingAngle={2} stroke="none">
                  {donnees.map((_, i) => <Cell key={i} fill={pal.serie[i % pal.serie.length]} />)}
                </Pie>
                <Tooltip contentStyle={styleTooltip} formatter={(v) => formatMontant(v)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="legende">
            {donnees.map((l, i) => (
              <div className="legende-ligne" key={l.libelle}>
                <span className="pastille" style={{ background: pal.serie[i % pal.serie.length] }} />{l.libelle}
                <span className="pct">{Math.round((l.montant / totalMontant) * 100)}% · {formatMontant(l.montant)}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function Dashboard({ naviguer }) {
  const { utilisateur } = useAuth();
  const { theme } = useTheme();
  const pal = getPalette(theme);
  const [d, setD] = useState(null);
  const [erreur, setErreur] = useState(null);

  useEffect(() => {
    Promise.all([getResume(), getEvolution(), getStatsParNature(), getStatsParModePassation(),
                 getTauxConformite(), getTauxConformiteParEntite(), getControles({ limit: 5 }), getRisques()])
      .then(([resume, evolution, nature, mode, taux, parEntite, derniers, risques]) => setD({ resume, evolution, nature, mode, taux, parEntite, derniers, risques }))
      .catch((err) => setErreur(formaterErreur(err)));
  }, []);

  const styleTooltip = { background: pal.surface, border: `1px solid ${pal.grille}`, borderRadius: 8, fontSize: 12 };
  const aujourdhui = new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });

  const entete = (
    <div className="page-header">
      <div>
        <h1>Bonjour {utilisateur.prenom || utilisateur.nom},</h1>
        <p>Voici un aperçu de l'activité de contrôle a posteriori.</p>
      </div>
      <div className="date-chip"><Icone nom="calendrier" taille={26} /><div>Aujourd'hui<strong>{aujourdhui}</strong></div></div>
    </div>
  );

  if (erreur) return <>{entete}<div className="alerte alerte-erreur">{erreur}</div></>;
  if (!d) return <>{entete}<p>Chargement du tableau de bord…</p></>;

  const { resume, evolution, nature, mode, taux, parEntite, derniers, risques } = d;
  const totalMarches = nature.reduce((s, n) => s + n.nombre, 0);

  return (
    <>
      {entete}

      <div className="kpi-grid">
        <Kpi icone="controles" couleur="bleu" valeur={resume.controles_planifies} label="Contrôles planifiés" delta={resume.controles_planifies_delta} />
        <Kpi icone="check" couleur="vert" valeur={resume.controles_realises} label="Contrôles réalisés" delta={resume.controles_realises_delta} />
        <Kpi icone="alerte" couleur="rouge" valeur={resume.anomalies} label="Anomalies détectées"
             sousTexte={`dont ${resume.anomalies_critiques} impactant l'attribution`} />
        <Kpi icone="entites" couleur="violet" valeur={resume.entites_controlees} label="Établissements contrôlés"
             sousTexte={`sur ${resume.entites_total} entité${resume.entites_total > 1 ? "s" : ""}`} />
      </div>

      <div className="grille-3">
        <div className="card">
          <div className="card-entete"><h3>Répartition des marchés par nature</h3></div>
          {nature.length === 0 ? <div className="vide">Aucun marché enregistré.</div> : (
            <>
              <div className="donut-wrap">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={nature} dataKey="nombre" nameKey="nature" innerRadius={54} outerRadius={80} paddingAngle={2} stroke="none">
                      {nature.map((_, i) => <Cell key={i} fill={pal.serie[i % pal.serie.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={styleTooltip} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="donut-centre"><strong>{totalMarches}</strong><span>marchés</span></div>
              </div>
              <div className="legende">
                {nature.map((n, i) => (
                  <div className="legende-ligne" key={n.nature}>
                    <span className="pastille" style={{ background: pal.serie[i % pal.serie.length] }} />{n.nature}
                    <span className="pct">{Math.round((n.nombre / totalMarches) * 100)}%</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="card">
          <div className="card-entete">
            <h3>Évolution des contrôles</h3>
            <div className="legende-inline">
              <span><i className="pastille" style={{ width: 9, height: 9, borderRadius: "50%", background: pal.serie[0], display: "inline-block" }} />Planifiés</span>
              <span><i className="pastille" style={{ width: 9, height: 9, borderRadius: "50%", background: pal.serie[1], display: "inline-block" }} />Réalisés</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={evolution} barGap={4}>
              <CartesianGrid vertical={false} stroke={pal.grille} />
              <XAxis dataKey="mois" tick={{ fill: pal.texte, fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fill: pal.texte, fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={styleTooltip} cursor={{ fill: pal.grille, opacity: 0.4 }} />
              <Bar dataKey="planifies" name="Planifiés" fill={pal.serie[0]} radius={[4, 4, 0, 0]} />
              <Bar dataKey="realises" name="Réalisés" fill={pal.serie[1]} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="card-entete"><h3>Derniers contrôles</h3><button className="lien-voir" onClick={() => naviguer("controles")}>Voir tout →</button></div>
          {derniers.length === 0 && <div className="vide">Aucun contrôle pour le moment.</div>}
          {derniers.map((c) => {
            const s = statutControle(c);
            return (
              <div className="dernier" key={c.id} style={{ cursor: "pointer" }} onClick={() => naviguer("detail-controle", { idControle: c.id })}>
                <div className="dernier-icone"><Icone nom="entites" taille={18} /></div>
                <div className="dernier-info"><strong title={c.entite}>{c.entite}</strong><small>{c.nature}</small></div>
                <div className="dernier-droite"><span className={`badge ${s.classe}`}>{s.label}</span><span className="dernier-date">{formatDate(c.date_controle)}</span></div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grille-2">
        <div className="card">
          <div className="card-entete">
            <h3>Taux de conformité par entité</h3>
            <span className="badge badge-info">Global : {taux.taux_conformite_pct}% ({taux.conformes}/{taux.total_controles})</span>
          </div>
          {parEntite.length === 0 ? <div className="vide">Aucun contrôle validé pour le moment.</div> : (
            <ResponsiveContainer width="100%" height={Math.max(220, parEntite.length * 56)}>
              <BarChart data={parEntite} layout="vertical" margin={{ left: 8, right: 40 }}>
                <CartesianGrid horizontal={false} stroke={pal.grille} />
                <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fill: pal.texte, fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="entite" width={150} tick={{ fill: pal.texte, fontSize: 11.5 }} axisLine={false} tickLine={false}
                       tickFormatter={(v) => (v.length > 24 ? v.slice(0, 23) + "…" : v)} />
                <Tooltip contentStyle={styleTooltip} cursor={{ fill: pal.grille, opacity: 0.4 }} formatter={(v) => [`${v}%`, "Conformité"]} />
                <Bar dataKey="taux_conformite_pct" radius={[0, 5, 5, 0]} barSize={22} minPointSize={4}>
                  {parEntite.map((e, i) => <Cell key={i} fill={e.taux_conformite_pct >= 50 ? pal.serie[1] : pal.serie[5]} />)}
                  <LabelList dataKey="taux_conformite_pct" position="right" formatter={(v) => `${v}%`} fill={pal.texte} fontSize={12} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card">
          <div className="card-entete"><h3>Marchés à surveiller</h3><button className="lien-voir" onClick={() => naviguer("detection")}>Détection automatique →</button></div>
          {risques.filter((r) => r.points > 0).length === 0 ? <div className="vide">Aucune anomalie détectée par les règles automatiques ✓</div> :
            risques.filter((r) => r.points > 0).slice(0, 5).map((r) => (
              <div className="dernier" key={r.id} style={{ cursor: "pointer" }} onClick={() => naviguer("detection")}>
                <div className="dernier-icone" style={{ background: "var(--warning-soft)", color: "var(--warning)" }}><Icone nom="detection" taille={18} /></div>
                <div className="dernier-info"><strong title={r.objet}>{r.reference}</strong><small>{r.entite}</small></div>
                <div className="dernier-droite"><span className={`badge ${CLASSE_NIVEAU[r.niveau]}`}>{r.niveau}</span><span className="dernier-date">{r.anomalies.length} anomalie{r.anomalies.length > 1 ? "s" : ""}</span></div>
              </div>
            ))}
        </div>
      </div>

      <div className="grille-2">
        <TableauMontants titre="Montants par nature" colonne="Nature" lignes={nature.map((n) => ({ libelle: n.nature, nombre: n.nombre, montant: n.montant }))} pal={pal} styleTooltip={styleTooltip} />
        <TableauMontants titre="Montants par mode de passation" colonne="Mode de passation" lignes={mode.map((m) => ({ libelle: m.mode_passation, nombre: m.nombre, montant: m.montant }))} pal={pal} styleTooltip={styleTooltip} />
      </div>
    </>
  );
}
