import type { CategoryListLabels } from "@/components/features/admin/categories/CategoryList";

export const categoryList: CategoryListLabels = {
  heading: "Kategorijas",
  addCategoryLabel: "Pievienot kategoriju",
  columnName: "Nosaukums",
  columnSlug: "Slug",
  columnVisibility: "Redzamība",
  columnActions: "",
  visibleLabel: "Izvēlnē",
  hiddenLabel: "Slēpta",
  editLabel: "Rediģēt",
  deleteLabel: "Dzēst",
  deleteConfirmMessage:
    "Dzēst šo kategoriju? Tiks dzēstas arī tās apakškategorijas, un produkti, kas tajā ir, zaudēs šo kategoriju.",
  emptyTitle: "Vēl nav neviena kategorija",
  emptyDescription: "Šeit parādīsies kategorijas, ko pievienosiet.",
  genericErrorMessage: "Neizdevās ielādēt kategorijas. Lūdzu, mēģiniet vēlreiz.",
};
