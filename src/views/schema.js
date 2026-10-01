// Datos estructurados (schema.org en JSON-LD) para la portada: le dicen a Google qué es Alcance Isleño,
// dónde trabaja, su horario, su teléfono y sus servicios con precio. Todo sale de site.js y de la misma
// lista de precios que se ve en la web, así que no se pueden desincronizar.
// Solo se generan si se conoce la dirección pública (Google necesita URLs absolutas).

// "desde 200 €" → { minPrice: 200 }; "50 € / 10 uds." → { price: 50, unitText: '10 uds.' }.
export function parsePrice(text) {
  const match = /^(desde\s+)?(\d+(?:,\d+)?)\s*€(?:\s*\/\s*(.+))?$/.exec(text.trim());
  if (!match) throw new Error(`Precio no reconocido para los datos estructurados: "${text}"`);
  const amount = Number(match[2].replace(',', '.'));
  return {
    '@type': 'UnitPriceSpecification',
    ...(match[1] ? { minPrice: amount } : { price: amount }),
    priceCurrency: 'EUR',
    valueAddedTaxIncluded: false, // precios sin IGIC
    ...(match[3] ? { unitText: match[3] } : {}),
  };
}

const offer = (name, price) => ({
  '@type': 'Offer',
  itemOffered: { '@type': 'Service', name },
  priceSpecification: parsePrice(price),
});

export function structuredDataObject({ site, config, priceGroups }) {
  const base = config.publicBaseUrl;
  const business = site.business || {};
  const groups = [
    ...(site.pack ? [{ title: 'Pack destacado', rows: [{ label: site.pack.name, price: site.pack.price }] }] : []),
    ...priceGroups,
  ];
  const amounts = groups.flatMap((g) => g.rows).map((row) => {
    const spec = parsePrice(row.price);
    return spec.price ?? spec.minPrice;
  });
  const negocio = {
    '@type': 'ProfessionalService',
    '@id': `${base}/#negocio`,
    name: site.name,
    url: `${base}/`,
    description: site.description,
    telephone: `+${config.whatsappNumber || site.whatsappNumber}`,
    ...(config.contactEmail || site.email ? { email: config.contactEmail || site.email } : {}),
    ...(site.ogImage ? { image: `${base}/assets/${site.ogImage}` } : {}),
    areaServed: { '@type': 'AdministrativeArea', name: site.region },
    ...(business.address ? { address: { '@type': 'PostalAddress', addressRegion: business.address.region, addressCountry: business.address.country } } : {}),
    ...(business.hours ? {
      openingHoursSpecification: [{
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: business.hours.days,
        opens: business.hours.opens,
        closes: business.hours.closes,
      }],
    } : {}),
    priceRange: `${Math.min(...amounts)} € - ${Math.max(...amounts)} €`,
    currenciesAccepted: 'EUR',
    ...(business.googleBusinessUrl ? { sameAs: [business.googleBusinessUrl], hasMap: business.googleBusinessUrl } : {}),
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Servicios y precios',
      itemListElement: groups.map((group) => ({
        '@type': 'OfferCatalog',
        name: group.title,
        itemListElement: group.rows.map((row) => offer(row.label, row.price)),
      })),
    },
  };
  const web = {
    '@type': 'WebSite',
    '@id': `${base}/#web`,
    url: `${base}/`,
    name: site.name,
    inLanguage: 'es',
    publisher: { '@id': negocio['@id'] },
  };
  return { '@context': 'https://schema.org', '@graph': [negocio, web] };
}

// <script type="application/ld+json">: es un bloque de datos, no se ejecuta, así que la CSP no lo
// bloquea. Se escapa "<" para que ningún texto pueda cerrar la etiqueta.
export function structuredData({ site, config, priceGroups }) {
  if (!config.publicBaseUrl) return '';
  const json = JSON.stringify(structuredDataObject({ site, config, priceGroups }), null, 2).replace(/</g, '\\u003c');
  return `<script type="application/ld+json">\n${json}\n</script>\n`;
}
