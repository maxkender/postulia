/** Codes ISO 3166-1 des pays ; les noms sont produits par le navigateur dans la langue de l'interface. */
const CODES =
  "AF AL DZ AD AO AG AR AM AU AT AZ BS BH BD BB BY BE BZ BJ BT BO BA BW BR BN BG BF BI CV KH CM CA CF TD CL CN CO KM CG CD CR CI HR CU CY CZ DK DJ DM DO EC EG SV GQ ER EE SZ ET FJ FI FR GA GM GE DE GH GR GD GT GN GW GY HT HN HK HU IS IN ID IR IQ IE IL IT JM JP JO KZ KE KI KW KG LA LV LB LS LR LY LI LT LU MO MG MW MY MV ML MT MH MR MU MX FM MD MC MN ME MA MZ MM NA NR NP NL NZ NI NE NG KP MK NO OM PK PW PS PA PG PY PE PH PL PT PR QA RO RU RW KN LC VC WS SM ST SA SN RS SC SL SG SK SI SB SO ZA KR SS ES LK SD SR SE CH SY TW TJ TZ TH TL TG TO TT TN TR TM TV UG UA AE GB US UY UZ VU VA VE VN YE ZM ZW".split(
    " ",
  );

let cache: { code: string; name: string }[] | null = null;

export function countries() {
  if (cache) return cache;
  const names = new Intl.DisplayNames(["fr"], { type: "region" });
  cache = CODES.map((code) => ({ code, name: names.of(code) ?? code })).sort((a, b) => a.name.localeCompare(b.name, "fr"));
  return cache;
}

export function countryName(code: string) {
  return countries().find((c) => c.code === code)?.name ?? code;
}

export const REGIONS = ["Monde entier", "Europe", "Amérique du Nord", "Amérique latine", "Afrique", "Moyen-Orient", "Asie", "Océanie"];
export const CURRENCIES = ["EUR", "USD", "GBP", "CHF", "CAD", "AUD", "MAD", "XOF", "AED", "INR", "BRL", "JPY"];
