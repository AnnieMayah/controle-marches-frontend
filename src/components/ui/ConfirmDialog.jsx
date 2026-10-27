/* Boîte de confirmation pour les actions sensibles (suppression…). */
export default function ConfirmDialog({ ouvert, titre, message, libelleConfirmer = "Supprimer", danger = true, onConfirmer, onAnnuler }) {
  if (!ouvert) return null;
  return (
    <div className="modal-fond" onClick={onAnnuler}>
      <div className="modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <h3>{titre}</h3>
        <p>{message}</p>
        <div className="form-actions" style={{ justifyContent: "flex-end", marginTop: 0 }}>
          <button className="btn btn-secondaire" onClick={onAnnuler}>Annuler</button>
          <button className={`btn ${danger ? "btn-danger" : ""}`} onClick={onConfirmer}>{libelleConfirmer}</button>
        </div>
      </div>
    </div>
  );
}
