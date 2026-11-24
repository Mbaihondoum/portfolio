import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { getAdmin, isAuthConfigured } from '@/server/auth'
import { signInWithGitHub } from '@/server/actions/auth'

export const metadata: Metadata = { title: 'Connexion' }

const ERRORS: Record<string, string> = {
  AccessDenied: 'Ce compte GitHub n’est pas autorisé à accéder à l’administration.',
  Configuration: 'L’authentification n’est pas configurée (voir AUTH_* dans .env).',
  default: 'La connexion a échoué. Réessayez.',
}

export default async function LoginPage({ searchParams }: PageProps<'/admin/login'>) {
  if (await getAdmin()) redirect('/admin')
  const { error } = await searchParams
  const message = typeof error === 'string' ? (ERRORS[error] ?? ERRORS.default) : null
  const configured = isAuthConfigured()
  return (
    <main className="grid min-h-dvh place-items-center bg-blueprint px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-8 shadow-2xl">
        <p className="font-mono text-xs tracking-widest text-accent uppercase">Portfolio · Admin</p>
        <h1 className="mt-3 text-2xl font-semibold">Connexion</h1>
        <p className="mt-2 text-sm text-muted">
          Accès réservé. Connectez-vous avec le compte GitHub autorisé.
        </p>
        {message && (
          <p
            role="alert"
            className="mt-5 rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger"
          >
            {message}
          </p>
        )}
        {!configured && (
          <div
            role="note"
            className="mt-5 rounded-lg border border-accent/40 bg-accent-soft px-4 py-3 text-sm"
          >
            <p className="font-medium text-foreground">Admin non configuré</p>
            <p className="mt-1 text-muted">
              Le site public fonctionne. Pour activer l’admin, ajoutez dans{' '}
              <code className="font-mono text-xs">.env.local</code> :
            </p>
            <ul className="mt-2 space-y-0.5 font-mono text-xs text-foreground">
              <li>AUTH_SECRET</li>
              <li>AUTH_GITHUB_ID</li>
              <li>AUTH_GITHUB_SECRET</li>
              <li>ADMIN_EMAILS</li>
            </ul>
            <p className="mt-2 text-muted">
              Puis redémarrez. Détails : README, section « Voir le portfolio en local ».
            </p>
          </div>
        )}
        {configured && (
          <form action={signInWithGitHub} className="mt-6">
            <Button type="submit" className="w-full">
              <svg aria-hidden viewBox="0 0 24 24" className="size-4 fill-current">
                <path d="M12 .5a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17.3 4.6 18.3 5 18.3 5c.6 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .5Z" />
              </svg>
              Continuer avec GitHub
            </Button>
          </form>
        )}
      </div>
    </main>
  )
}
