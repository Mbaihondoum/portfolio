# Checklist de mise en ligne

## Contenu

- [ ] Paramètres du site renseignés dans `/admin/settings` (nom, initiales, titre, accroche, parcours, façon de travailler, disponibilité, ville, email, liens) — plus aucun `[À REMPLACER]` visible.
- [ ] Chiffres clés réels (ou supprimés).
- [ ] CV FR et EN téléversés (PDF) et testés via le bouton du footer.
- [ ] Au moins 4 vrais projets publiés, avec couverture, textes FR/EN, stack, résultats vérifiables.
- [ ] Projets `[EXEMPLE]` supprimés.
- [ ] Parcours (expériences/formations) réel, entrées fictives supprimées.
- [ ] Compétences ajustées à votre profil réel.
- [ ] Textes alternatifs renseignés sur toutes les images.

## Configuration

- [ ] `NEXT_PUBLIC_SITE_URL` = domaine final (https).
- [ ] `DATABASE_URL` = _Transaction pooler_ Supabase (port 6543), migrations appliquées (`pnpm db:migrate`).
- [ ] `AUTH_SECRET` généré (32 octets aléatoires), propre à la production.
- [ ] Application OAuth GitHub de production (callback `https://<domaine>/api/auth/callback/github`).
- [ ] `ADMIN_EMAILS` ne contient que vos adresses.
- [ ] `STORAGE_DRIVER=supabase` + `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` (variable serveur uniquement).
- [ ] Domaine vérifié chez Resend, `RESEND_API_KEY`, `CONTACT_FROM_EMAIL`, `CONTACT_TO_EMAIL`.
- [ ] `IP_HASH_SECRET` généré (sinon un avertissement apparaît dans les logs).
- [ ] (Optionnel) Turnstile : `NEXT_PUBLIC_TURNSTILE_SITE_KEY` + `TURNSTILE_SECRET_KEY`.

## Vérifications après déploiement

- [ ] `https://<domaine>/api/health` → `{"status":"ok"}`.
- [ ] `/` redirige vers `/fr` ou `/en` selon la langue du navigateur.
- [ ] Connexion admin avec votre compte GitHub ; un autre compte est refusé.
- [ ] Modifier un projet dans l'admin → visible immédiatement sur le site.
- [ ] Envoyer un message via le formulaire → reçu par email et visible dans `/admin/messages`.
- [ ] Le tableau de bord affiche des pages vues après quelques visites.
- [ ] `https://<domaine>/sitemap.xml` et `/robots.txt` corrects ; sitemap soumis à Google Search Console.
- [ ] Aperçu de partage (LinkedIn Post Inspector / opengraph.xyz) correct.
- [ ] En-têtes de sécurité vérifiés (securityheaders.com) : HSTS, CSP, X-Frame-Options…
- [ ] Lighthouse (mobile et desktop) ≥ 90 sur l'accueil et une page projet.
- [ ] Test sur un vrai téléphone (iOS + Android), en mode sombre et clair, et avec « Réduire les animations » activé.
- [ ] Navigation complète au clavier (Tab / Maj+Tab / Entrée / Échap) avec focus visible.

## Exploitation

- [ ] Protection de la branche `main` : CI obligatoire avant fusion.
- [ ] Sauvegardes Supabase activées (point-in-time recovery si disponible).
- [ ] Alertes : log drain ou monitoring de `/api/health` (UptimeRobot, Better Stack…).
