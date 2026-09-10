import type { CategoryFormLabels } from "@/components/features/admin/categories/CategoryForm";

export const categoryForm: CategoryFormLabels = {
  createHeading: "Pievienot kategoriju",
  editHeading: "Rediģēt kategoriju",
  nameLabel: "Nosaukums",
  slugLabel: "Slug",
  slugHint: "Izmantots kategorijas adresē (URL) — izveidots no nosaukuma, bet var mainīt.",
  parentLabel: "Vecākkategorija",
  parentPlaceholder: "Nav (augšējā līmeņa kategorija)",
  descriptionLabel: "Apraksts",
  sortOrderLabel: "Kārtas numurs",
  isCustomLabel: "Pielāgots navigācijas mezgls (piem., īslaicīga akcija)",
  showInMenuLabel: "Rādīt veikala izvēlnē",
  submitLabel: "Saglabāt kategoriju",
  submittingLabel: "Saglabā…",
  cancelLabel: "Atcelt",
  genericErrorMessage: "Neizdevās saglabāt kategoriju. Lūdzu, mēģiniet vēlreiz.",
};
