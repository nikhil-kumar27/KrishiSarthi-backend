const CROP_NAMES = Object.freeze({

  wheat:
    'Wheat',

  rice:
    'Rice',

  maize:
    'Maize',

  sugarcane:
    'Sugarcane',

  potato:
    'Potato',

  cotton:
    'Cotton',

  jute:
    'Jute',

  makhana:
    'Makhana',

  mango:
    'Mango',

  litchi:
    'Litchi',


  // ----------------------------------------------
  // Member 4 / Member 12 aliases
  // ----------------------------------------------

  gram:
    'Gram',

  chickpea:
    'Gram',


  lentil:
    'Lentil',


  moong:
    'Moong',

  'green gram':
    'Moong',


  arhar:
    'Arhar',

  'pigeon pea':
    'Arhar',


  mustard:
    'Mustard',

  'indian mustard':
    'Mustard',


  sunflower:
    'Sunflower',

  groundnut:
    'Groundnut',


  // ----------------------------------------------
  // Accepted names even when the current market
  // dataset does not yet contain those crops.
  // ----------------------------------------------

  'black gram':
    'Black Gram',

  blackgram:
    'Black Gram',

  cowpea:
    'Cowpea',

  'field pea':
    'Field Pea',

  'fodder maize':
    'Fodder Maize',

  'small millets':
    'Small Millets',

  mesta:
    'Mesta',

  onion:
    'Onion',

  sorghum:
    'Sorghum',

  'pearl millet':
    'Pearl Millet',

  barley:
    'Barley',

  linseed:
    'Linseed',

  tomato:
    'Tomato',

});


export function normalizeCropName(crop) {

  if (
    typeof crop !== 'string'
  ) {

    return null;
  }


  const normalized =
    crop
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' ');


  return (
    CROP_NAMES[normalized] ||
    null
  );
}