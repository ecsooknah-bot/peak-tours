/* ------------------------------------------------------------------
   TEESZ — store settings.
   Everything the brand may want to change lives here: contact details,
   prices, sizes and product photos. No coding knowledge needed —
   just edit the text between the quotes.
------------------------------------------------------------------- */
window.TEESZ_CONFIG = {
  brand: 'TEESZ',

  // Where orders and waitlist sign-ups are sent.
  // whatsapp: international format, digits only (e.g. '2305XXXXXXX'). Leave '' to skip.
  whatsapp: '',
  instagram: 'teesz', // TODO: confirm the exact Instagram handle
  email: '',

  currency: 'Rs',
  payments: ['Juice', 'Cash'],

  products: [
    {
      id: 'offscript',
      name: 'Off Script Tee',
      colorway: 'Black / Pink',
      swatch: '#151316',
      price: 0, // TODO: set price
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      front: 'assets/tees/black-front.svg', // swap for the real photos
      back: 'assets/tees/black-back.svg',
      details: ['Oversized boxy fit', 'Pink star-T chest logo', 'Chrome graffiti print', 'Unisex'],
    },
    {
      id: 'moneymaker',
      name: 'Moneymaker Tee',
      colorway: 'Cream / Burgundy',
      swatch: '#efe6d6',
      price: 0, // TODO: set price
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      front: 'assets/tees/cream-front.svg',
      back: 'assets/tees/cream-back.svg',
      details: ['Oversized boxy fit', 'Burgundy star-T chest logo', '“Moneymaker” back print', 'Unisex'],
    },
  ],
};
