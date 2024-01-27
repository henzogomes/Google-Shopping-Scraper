let storeWhitelist = [
  'Amazon.com.br',
  'Apple',
  'Americanas.com',
  'Shoptime',
  'Submarino',
  'Magazine Luiza',
  'Gazin.com.br',
  'Carrefour',
  'Midea',
  'Casas Bahia',
  'Fast Shop',
  'WebContinental',
  'Leroy Merlin',
  'KaBuM!',
  'Extra.com.br',
  'Pontofrio.com',
  'Mercado Livre'
];

storeWhitelist = storeWhitelist.map(item => item.toLowerCase())

export {storeWhitelist}
