export default function Pagination({ total, page, taille, onChange }) {
  const nbPages = Math.max(1, Math.ceil(total / taille));
  if (total === 0) return null;
  const debut = (page - 1) * taille + 1;
  const fin = Math.min(page * taille, total);
  return (
    <div className="pagination">
      <span>Affichage de {debut} à {fin} sur {total} résultat{total > 1 ? "s" : ""}</span>
      <div className="pages">
        <button className="page-btn" disabled={page === 1} onClick={() => onChange(page - 1)}>‹</button>
        {Array.from({ length: nbPages }, (_, i) => i + 1).map((p) => (
          <button key={p} className={`page-btn ${p === page ? "actif" : ""}`} onClick={() => onChange(p)}>{p}</button>
        ))}
        <button className="page-btn" disabled={page === nbPages} onClick={() => onChange(page + 1)}>›</button>
      </div>
    </div>
  );
}
