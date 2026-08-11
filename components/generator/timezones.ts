/**
 * Lista curta de fusos horários para o seletor.
 *
 * `Intl.supportedValuesOf('timeZone')` devolveria mais de 400 entradas — um
 * `<select>` inutilizável e algumas dezenas de kilobytes de DOM. O fuso do
 * próprio visitante é acrescentado em tempo de execução, então nenhum caso
 * comum fica de fora. Qualquer fuso IANA continua válido pela URL.
 */
export const COMMON_TIMEZONES: readonly string[] = [
  'UTC',
  'America/Sao_Paulo',
  'America/Manaus',
  'America/Belem',
  'America/Fortaleza',
  'America/Bogota',
  'America/Mexico_City',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Buenos_Aires',
  'Atlantic/Azores',
  'Europe/Lisbon',
  'Europe/London',
  'Europe/Madrid',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Rome',
  'Europe/Moscow',
  'Africa/Lagos',
  'Africa/Johannesburg',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Asia/Shanghai',
  'Asia/Tokyo',
  'Asia/Seoul',
  'Australia/Sydney',
  'Pacific/Auckland',
] as const;
