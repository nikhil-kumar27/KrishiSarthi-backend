/**
 * crop-normalizer.js
 *
 * Single Responsibility: Map any incoming crop-name spelling/alias
 * (as it might arrive from Member 2, Member 3, or the cost dataset)
 * to a single canonical crop name used consistently throughout
 * Member 4.
 *
 * This guards against subtle bugs where "Gram" (from one member) and
 * "Chickpea" (from another) are silently treated as two different
 * crops.
 */

// The canonical crop list. This MUST match the crops present in the
// cultivation-cost dataset (src/data/cultivation-costs.json).
const CROP_ALIASES = {
    rice: 'Rice',
    paddy: 'Rice',
    dhan: 'Rice',
    chawal: 'Rice',

    maize: 'Maize',
    corn: 'Maize',

    'fodder maize': 'Fodder Maize',

    'pigeon pea': 'Pigeon Pea',
    pigeonpea: 'Pigeon Pea',
    arhar: 'Pigeon Pea',
    toor: 'Pigeon Pea',
    tur: 'Pigeon Pea',

    sesame: 'Sesame',
    til: 'Sesame',

    'small millets': 'Small Millets',

    cowpea: 'Cowpea',
    lobia: 'Cowpea',

    'black gram': 'Black Gram',
    blackgram: 'Black Gram',
    urad: 'Black Gram',
    uradbean: 'Black Gram',

    jute: 'Jute',

    mesta: 'Mesta',

    sugarcane: 'Sugarcane',
    ganna: 'Sugarcane',

    wheat: 'Wheat',
    gehun: 'Wheat',

    lentil: 'Lentil',
    masoor: 'Lentil',

    'indian mustard': 'Indian Mustard',
    mustard: 'Indian Mustard',
    sarson: 'Indian Mustard',

    chickpea: 'Chickpea',
    'chick pea': 'Chickpea',
    gram: 'Chickpea',
    chana: 'Chickpea',

    'field pea': 'Field Pea',

    'green gram': 'Green Gram',
    greengram: 'Green Gram',
    moong: 'Green Gram',

    onion: 'Onion',
    pyaz: 'Onion',

    sorghum: 'Sorghum',
    jowar: 'Sorghum',

    'pearl millet': 'Pearl Millet',
    bajra: 'Pearl Millet',

    groundnut: 'Groundnut',
    peanut: 'Groundnut',

    barley: 'Barley',
    jau: 'Barley',

    potato: 'Potato',
    aloo: 'Potato',

    tomato: 'Tomato',

    sunflower: 'Sunflower',

    linseed: 'Linseed',
    alsi: 'Linseed',

    cotton: 'Cotton',
    kapas: 'Cotton'
};

function normalizeCropName(cropName) {
    if (!cropName || typeof cropName !== 'string') {
        return null;
    }

    const cleanedName = cropName
        .trim()
        .toLowerCase()
        .replace(/\s+/g, ' ');

    return CROP_ALIASES[cleanedName] || cropName.trim();
}

module.exports = {
    normalizeCropName
};