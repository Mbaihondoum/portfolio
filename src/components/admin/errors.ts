/** French labels for validation codes returned by Zod / server actions. */
const MESSAGES: Record<string, string> = {
  required: 'Champ requis.',
  tooShort: 'Trop court.',
  tooLong: 'Trop long.',
  invalidEmail: 'Email invalide.',
  invalidUrl: 'URL invalide (http:// ou https://).',
  invalidSlug: 'Minuscules, chiffres et tirets uniquement (ex. mon-projet).',
  slugTaken: 'Ce slug est déjà utilisé.',
  invalidPowerBiUrl: 'Utilisez le lien « Publier sur le web » (https://app.powerbi.com/…).',
  invalidDate: 'Date invalide.',
  endBeforeStart: 'La date de fin précède la date de début.',
  invalidPhone: 'Numéro invalide.',
  edgeUnknownNode: 'Un lien pointe vers un nœud inexistant.',
  chartLengthMismatch: 'Autant de libellés que de valeurs.',
  unauthorized: 'Session expirée : reconnectez-vous.',
  server: 'Erreur serveur. Réessayez.',
  validation: 'Certains champs sont invalides.',
  not_found: 'Élément introuvable.',
  too_large: 'Fichier trop volumineux.',
  bad_type: 'Type de fichier non accepté.',
  empty: 'Fichier vide.',
}

export function errorMessage(code: string | undefined): string | undefined {
  if (!code) return undefined
  return MESSAGES[code] ?? code
}
