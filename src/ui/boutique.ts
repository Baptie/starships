/** Modale placeholder — la boutique n'est pas encore implémentée. */
export function ouvrirBoutique(): void {
  const fond = document.createElement("div");
  fond.className = "modal-fond";
  fond.innerHTML = `
    <div class="modal">
      <h2>Boutique</h2>
      <p class="muted">En construction. Reviens plus tard pour dépenser ton Irridium sur des avantages permanents.</p>
      <button class="bouton bouton--secondaire" data-action="fermer" type="button">Fermer</button>
    </div>
  `;

  const fermer = (): void => fond.remove();
  fond.addEventListener("click", (evenement) => {
    if (evenement.target === fond) fermer();
  });
  fond.querySelector('[data-action="fermer"]')?.addEventListener("click", fermer);

  document.body.appendChild(fond);
}
