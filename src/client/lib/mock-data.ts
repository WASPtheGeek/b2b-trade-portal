// Placeholder catalog data for the Home page, ported from src/design/ui_kits/storefront/data.js.
// Latvian names, EANs and SKUs are plausible fabrications, not a real ERP export. Replace with
// the real /api/products, /api/categories clients (see FRONTEND_CONTEXT.md §8) once built.
import type {
  Brand,
  CatalogMenuDepartment,
  CategoryTreeItem,
  DepartmentCardItem,
  DepartmentNavItem,
  FooterColumn,
  Product,
  ProductUnit,
} from "@/types/catalog";

function units(
  gab: number,
  iepQty: number,
  iepPrice: number,
  kasteQty: number,
  kastePrice: number,
  gabAvailable = true,
): ProductUnit[] {
  return [
    { value: "gab", label: "Gab.", short: "gab.", price: gab, available: gabAvailable },
    { value: "iep", label: "Iep.", short: "iep.", qty: String(iepQty), price: iepPrice },
    { value: "kaste", label: "Kaste", short: "kaste", qty: String(kasteQty), price: kastePrice },
  ];
}

export const DEPARTMENTS: DepartmentNavItem[] = [
  { id: "partika", label: "Pārtika un dzērieni" },
  { id: "higiena", label: "Higiēna un tīrīšana" },
  { id: "birojs", label: "Biroja preces" },
  { id: "iepakojums", label: "Iepakojums un HoReCa" },
  { id: "aizsardziba", label: "Darba aizsardzība" },
  { id: "akcijas", label: "Akcijas" },
];

export const MEGA_CATALOG: CatalogMenuDepartment[] = [
  { id: "partika", label: "Pārtika un dzērieni", groups: [
    { title: "Bezalkoholiskie dzērieni", links: ["Ūdens", "Sulas un nektāri", "Gāzētie dzērieni", "Enerģijas dzērieni"] },
    { title: "Kafija un tēja", links: ["Maltā kafija", "Kafijas pupiņas", "Tēja", "Karstā šokolāde"] },
    { title: "Pamatprodukti", links: ["Cukurs un milti", "Eļļas un mērces", "Konservi", "Uzkodas"] },
  ] },
  { id: "higiena", label: "Higiēna un tīrīšana", groups: [
    { title: "Papīra produkcija", links: ["Papīra dvieļi", "Tualetes papīrs", "Salvetes", "Dozatori"] },
    { title: "Tīrīšanas līdzekļi", links: ["Trauku mazgāšana", "Grīdas kopšana", "Virsmu tīrīšana", "Sanitārtelpas"] },
    { title: "Individuālā aizsardzība", links: ["Nitrila cimdi", "Sejas maskas", "Dezinfekcija"] },
  ] },
  { id: "birojs", label: "Biroja preces", groups: [
    { title: "Papīrs un druka", links: ["Biroja papīrs", "Kartridži", "Etiķetes"] },
    { title: "Rakstāmpiederumi", links: ["Pildspalvas", "Marķieri", "Zīmuļi"] },
    { title: "Organizēšana", links: ["Mapes", "Arhīva kastes", "Skavotāji"] },
  ] },
];

// Mobile category drawer tree, ported from src/design/ui_kits/storefront/data.js's
// window.ELKS.TREE plus the extra department groups HomeMobileScreen.jsx appends to it.
export const CATEGORY_TREE: CategoryTreeItem[] = [
  { id: "papirs", label: "Papīra produkcija", count: 186, children: [
    { id: "dvieli", label: "Papīra dvieļi", count: 44 },
    { id: "tualetes", label: "Tualetes papīrs", count: 58 },
    { id: "salvetes", label: "Salvetes", count: 84 },
  ] },
  { id: "tirisana", label: "Tīrīšanas līdzekļi", count: 421, children: [
    { id: "trauki", label: "Trauku mazgāšana", count: 96 },
    { id: "grida", label: "Grīdas kopšana", count: 118 },
    { id: "virsmas", label: "Virsmu tīrīšana", count: 207 },
  ] },
  { id: "cimdi", label: "Individuālā aizsardzība", count: 335, children: [
    { id: "nitrila", label: "Nitrila cimdi", count: 62 },
    { id: "maskas", label: "Sejas maskas", count: 41 },
  ] },
  { id: "partika", label: "Pārtika un dzērieni", count: 1284, children: [
    { id: "kafija", label: "Kafija un tēja", count: 148 },
    { id: "dzerieni", label: "Bezalkoholiskie dzērieni", count: 212 },
    { id: "pamat", label: "Pamatprodukti", count: 396 },
  ] },
  { id: "iepakojums", label: "Iepakojums un HoReCa", count: 512, children: [
    { id: "trauki-vien", label: "Vienreizlietojamie trauki", count: 164 },
    { id: "maisi", label: "Maisi un plēves", count: 118 },
    { id: "kastes", label: "Kartona kastes", count: 96 },
  ] },
  { id: "birojs", label: "Biroja preces", count: 618, children: [
    { id: "papirs-biroja", label: "Kopēšanas papīrs", count: 74 },
    { id: "rakstlietas", label: "Rakstlietas", count: 208 },
    { id: "arhivs", label: "Arhivēšana", count: 141 },
  ] },
  { id: "akcijas", label: "Akcijas", count: 87, children: [
    { id: "menesa", label: "Mēneša piedāvājumi", count: 42 },
    { id: "izpardosana", label: "Izpārdošana", count: 45 },
  ] },
  { id: "aizsardziba", label: "Darba aizsardzība", count: 274, children: [
    { id: "apgerbs", label: "Darba apģērbs", count: 112 },
    { id: "apavi", label: "Darba apavi", count: 68 },
    { id: "aizsargl", label: "Aizsarglīdzekļi", count: 94 },
  ] },
];

export const DEPARTMENT_CARDS: DepartmentCardItem[] = [
  { id: "partika", label: "Pārtika un dzērieni", icon: "coffee", count: "1 284" },
  { id: "higiena", label: "Higiēna un tīrīšana", icon: "spray-can", count: "942" },
  { id: "birojs", label: "Biroja preces", icon: "paperclip", count: "618" },
  { id: "iepakojums", label: "Iepakojums un HoReCa", icon: "box", count: "507" },
  { id: "aizsardziba", label: "Darba aizsardzība", icon: "hard-hat", count: "335" },
];

export const PRODUCTS: Product[] = [
  {
    id: "s1",
    name: "Papīra dvieļi Grite Optimum, 2 slāņi, 150 loksnes",
    brand: "Grite",
    category: "Papīra dvieļi",
    sku: "ELK-118902",
    ean: "4770175045781",
    price: 2.85,
    discount: 15,
    units: units(2.85, 6, 16.2, 48, 126.4, false),
    description:
      "Divslāņu papīra dvieļi profesionālai lietošanai birojos, ražotnēs un HoReCa vidē. Augsta absorbcija un izturība mitrā stāvoklī — viena loksne aizstāj divas standarta loksnes. Piegādā iepakojumos pa sešiem vai kastēs pa 48, kas ir ērtākais formāts regulāriem pasūtījumiem.",
    features: [
      "Sertificēts pārstrādātas celulozes saturs",
      "Piemērots standarta sienas dozatoriem",
      "Pieejams arī baltā un dabīgā tonī",
    ],
    specs: [
      { label: "Zīmols", value: "Grite" },
      { label: "Slāņu skaits", value: "2" },
      { label: "Loksnes iepakojumā", value: "150" },
      { label: "Gabali iepakojumā", value: "6" },
      { label: "Gabali kastē", value: "48" },
      { label: "Artikuls", value: "ELK-118902" },
    ],
  },
  { id: "s2", name: "Tualetes papīrs Grite Premium, 3 slāņi, 8 ruļļi", brand: "Grite", category: "Tualetes papīrs", sku: "ELK-119440", ean: "4770175048119", price: 3.42, units: units(3.42, 6, 19.8, 48, 152.6) },
  { id: "s3", name: "Salvetes Elkaro Pro, baltas, 33×33 cm, 100 gab.", brand: "Elkaro Pro", category: "Salvetes", sku: "ELK-770045", ean: "4750998001234", price: 1.48, units: units(1.48, 20, 27.6, 240, 316.8) },
  { id: "s4", name: "Trauku mazgāšanas līdzeklis Fairy Original, 900 ml", brand: "Fairy", category: "Trauku mazgāšana", sku: "ELK-330118", ean: "8001090242945", price: 3.14, discount: 10, units: units(3.14, 10, 30.1, 60, 174.6) },
  { id: "s5", name: "Vienreizlietojamie cimdi nitrila, M, 100 gab.", brand: "Elkaro Pro", category: "Nitrila cimdi", sku: "ELK-661903", ean: "4750998009871", price: 6.2, units: units(6.2, 10, 59.0, 100, 570.0, false) },
  { id: "s6", name: "Grīdas mazgāšanas līdzeklis Ajax Floral, 1 l", brand: "Ajax", category: "Grīdas kopšana", sku: "ELK-341002", ean: "8718951208605", price: 2.36, units: units(2.36, 12, 27.1, 96, 210.6) },
  { id: "s7", name: "Dzeramais ūdens Mangaļi, negāzēts, 1.5 l", brand: "Mangaļi", category: "Ūdens", sku: "ELK-448210", ean: "4750123456789", price: 0.62, units: units(0.62, 6, 3.54, 72, 41.04) },
  { id: "s8", name: "Kafija Paulig Classic, maltā, 500 g", brand: "Paulig", category: "Maltā kafija", sku: "ELK-902341", ean: "6411300110016", price: 7.9, discount: 20, units: units(7.9, 12, 91.2, 96, 705.6) },
  { id: "s9", name: "Atkritumu maisi Elkaro Pro, 60 l, 20 gab.", brand: "Elkaro Pro", category: "Sanitārtelpas", sku: "ELK-770228", ean: "4750998004561", price: 2.05, units: units(2.05, 25, 48.0, 200, 374.0) },
  { id: "s10", name: "Biroja papīrs Elkaro Pro A4, 80 g/m², 500 lapas", brand: "Elkaro Pro", category: "Biroja papīrs", sku: "ELK-210044", ean: "4750998012345", price: 4.18, units: units(4.18, 5, 20.2, 40, 158.4) },
  { id: "s11", name: "Tēja Lipton Yellow Label, 100 maisiņi", brand: "Lipton", category: "Tēja", sku: "ELK-884012", ean: "8712100849206", price: 4.68, units: units(4.68, 12, 54.0, 72, 316.8) },
  { id: "s12", name: "Sula Cido Apple, 100%, 1 l", brand: "Cido", category: "Sulas un nektāri", sku: "ELK-460119", ean: "4750027011238", price: 1.34, units: units(1.34, 12, 15.2, 108, 133.9) },
];

// Brand filter facet for the category page sidebar. Counts are fabricated to match the
// department cards' implied catalog size (1 284+ products), not derived from the 12-item
// PRODUCTS sample above - same "plausible fabrication" approach as the rest of this file.
export const BRANDS: Brand[] = [
  { name: "Grite", count: 58 },
  { name: "Elkaro Pro", count: 74 },
  { name: "Fairy", count: 22 },
  { name: "Ajax", count: 19 },
  { name: "Mangaļi", count: 14 },
  { name: "Paulig", count: 27 },
  { name: "Lipton", count: 16 },
  { name: "Cido", count: 12 },
];

export const FOOTER_COLUMNS: FooterColumn[] = [
  { title: "Katalogs", links: ["Pārtika un dzērieni", "Higiēna un tīrīšana", "Biroja preces", "Iepakojums un HoReCa"] },
  { title: "Uzņēmumiem", links: ["Reģistrēt uzņēmumu", "Kā notiek pasūtīšana", "Piegādes noteikumi", "Sekot pasūtījumam"] },
  { title: "Kontakti", links: ["Pirmdiena–piektdiena 8:00–17:00", "+371 6 700 4200", "info@elkaro.lv", "Krasta iela 68, Rīga"] },
];
