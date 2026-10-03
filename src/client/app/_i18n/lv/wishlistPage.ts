import type { WishlistPageLabels } from "@/components/features/shop/WishlistPage";

export const wishlistPage: WishlistPageLabels = {
  title: "Saglabātie produkti",
  itemCount: "produkti",
  emptyTitle: "Saglabāto saraksts ir tukšs",
  emptyBody: "Saglabājiet produktus, klikšķinot uz sirsniņas ikonas — tie parādīsies šeit.",
  browseCta: "Skatīt produktus",
  genericError: "Neizdevās ielādēt saglabātos produktus. Lūdzu, mēģiniet vēlreiz.",
  productTile: {
    maskedCta: "Ienākt, lai redzētu cenu",
    restrictedCta: "Cena būs redzama pēc konta apstiprināšanas",
    priceNote: "bez PVN",
    wishlistSave: "Saglabāt vēlāk",
    wishlistRemove: "Noņemt no saglabātajiem",
    wishlistSaved: "Saglabāts",
    decreaseQty: "Samazināt daudzumu",
    increaseQty: "Palielināt daudzumu",
    addToCart: "Pievienot grozam",
    addedToCart: "Pievienots grozam",
    add: "Pievienot",
    added: "Pievienots",
  },
  packagingUnits: {
    piece: { label: "Gab.", short: "gab." },
    package: { label: "Iep.", short: "iep." },
    box: { label: "Kaste", short: "kaste" },
  },
  accountStatusNotice: {
    pendingTitle: "Konts gaida apstiprinājumu",
    pendingBody: "Cenas un pasūtīšana kļūs pieejamas, tiklīdz administrators apstiprinās jūsu kontu.",
    rejectedTitle: "Pieteikums netika apstiprināts",
    rejectedReasonLabel: "Iemesls",
    accountLinkLabel: "Skatīt kontu",
  },
};
