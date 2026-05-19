/**
 * Normalizes a player name for consistent comparison and aggregation.
 * Handles specific name corrections, removes extra characters, and standardizes format.
 */
export function normalizeName(name: string): string {
  if (!name) return '';

  // 1. Remove extra characters like (CAP) and *
  let clean = name
    .replace(/\(CAP\)/gi, '')
    .replace(/\*/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  // 2. Specific corrections for known data issues
  const upperClean = clean.toUpperCase();
  
  // Specific corrections from user and data analysis
  if ((upperClean.includes('ALVAREZ GONZALEZ') || upperClean.includes('AUZMENDI GONZALEZ')) && upperClean.includes('SARA')) {
    return 'AUZMENDI GONZÁLEZ, SARA';
  }
  if (upperClean.includes('MERINERO PEINADO') && upperClean.includes('SARA')) {
    return 'MERINERO PEINADO, SARA';
  }
  if (upperClean.includes('LUNA MARIA') && upperClean.includes('RODRIGUEZ MUR')) {
    return 'RODRIGUEZ MUR, LUISA MARIA';
  }
  if (upperClean.includes('ANGELLY RAQUEL') && (upperClean.includes('RODRIGUEZ CEPEZA') || upperClean.includes('RODRIGUEZ CEPEDA'))) {
    return 'RODRIGUEZ ZEPEDA, ANGELLY RAQUEL';
  }
  if (upperClean.includes('NAOMI') && upperClean.includes('CAMPOVERDE ILLANES')) {
    return 'CAMPOVERDE ILLANES, NAOMI';
  }
  if (upperClean.includes('NICOLE') && upperClean.includes('ATANASSOVA')) {
    return 'ATANASSOVA, NICOLE';
  }
  if (upperClean.includes('MARY DEL CARMEN') && upperClean.includes('CASTILLO MERINO')) {
    return 'CASTILLO MERINO, MARY DEL CARMEN';
  }
  if (upperClean.includes('DANEK') && upperClean.includes('NUÑEZ SALAZAR')) {
    return 'NUÑEZ SALAZAR, DAREK';
  }
  if (upperClean.includes('VALENTINA MICAELA') && (upperClean.includes('GUAMAN LOAYZA') || upperClean.includes('HUAMAN CAYZA') || upperClean.includes('HUAMAN CAYTA'))) {
    return 'GUAMAN LOAYZA, VALENTINA MICAELA';
  }
  if (upperClean.includes('SARA GUADALUPE') && (upperClean.includes('PROAÑO GUAJARD') || upperClean.includes('PROAÑO QUINAUCHO'))) {
    return 'PROAÑO QUINAUCHO, SARA GUADALUPE';
  }

  // Standardize "APELLIDO, NOMBRE" format if possible, or just return uppercase
  return upperClean;
}

/**
 * Checks if two names refer to the same player after normalization.
 */
export function isSamePlayer(name1: string, name2: string): boolean {
  const norm1 = normalizeName(name1);
  const norm2 = normalizeName(name2);
  
  if (norm1 === norm2) return true;

  // Fallback: Check if one contains the other (for partial names)
  // But only if they are long enough to avoid false positives
  const n1 = norm1.replace(/,/g, '').normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const n2 = norm2.replace(/,/g, '').normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const parts1 = n1.split(' ').filter(p => p.length > 2);
  const parts2 = n2.split(' ').filter(p => p.length > 2);

  if (parts1.length > 0 && parts2.length > 0) {
    // If all parts of the shorter name are in the longer name
    const [shorter, longer] = parts1.length < parts2.length ? [parts1, n2] : [parts2, n1];
    return shorter.every(part => longer.includes(part));
  }

  return false;
}
