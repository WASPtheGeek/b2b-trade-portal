import type { CategoryListLabels } from "@/components/features/admin/categories/CategoryList";

export const categoryList: CategoryListLabels = {
  heading: "Kategorijas",
  addCategoryLabel: "Pievienot",
  columnName: "Nosaukums",
  columnSlug: "Slug",
  columnParent: "Vecākkategorija",
  columnDescription: "Apraksts",
  columnVisibility: "Redzamība",
  columnActions: "",
  stickyActionsLabel: "Piespraust darbību kolonnu",
  visibleLabel: "Izvēlnē",
  hiddenLabel: "Slēpta",
  editLabel: "Rediģēt",
  deleteLabel: "Dzēst",
  deleteConfirmTitle: "Dzēst kategoriju?",
  deleteConfirmMessage:
    "Dzēst šo kategoriju? Tiks dzēstas arī tās apakškategorijas, un produkti, kas tajā ir, zaudēs šo kategoriju.",
  cancelLabel: "Atcelt",
  emptyTitle: "Vēl nav neviena kategorija",
  emptyDescription: "Šeit parādīsies kategorijas, ko pievienosiet.",
  genericErrorMessage: "Neizdevās ielādēt kategorijas. Lūdzu, mēģiniet vēlreiz.",
  moveRowLabel: "Pārvietot rindu",
  reorderHint: "Velciet, lai mainītu secību (Alt + bultiņas)",
};
