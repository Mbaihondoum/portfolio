'use client'

import { AnimatePresence, motion } from 'motion/react'
import Script from 'next/script'
import { useRef, useState, type FormEvent } from 'react'
import { cn } from '@/lib/cn'
import type { Locale } from '@/lib/types'
import type { ContactField } from '@/lib/validators/contact'
import { bezier } from '@/motion.config'
import type { Dictionary } from '@/i18n/dictionaries/fr'
import { Magnetic } from '@/components/motion/magnetic'

type State = 'idle' | 'sending' | 'success' | 'error'
type Labels = Dictionary['contact']

const TURNSTILE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

function FloatingField({
  name,
  label,
  type = 'text',
  multiline,
  error,
  autoComplete,
}: {
  name: ContactField
  label: string
  type?: string
  multiline?: boolean
  error?: string
  autoComplete?: string
}) {
  const id = `contact-${name}`
  const shared = {
    id,
    name,
    placeholder: ' ',
    required: true,
    autoComplete,
    'aria-invalid': !!error,
    'aria-describedby': error ? `${id}-error` : undefined,
    className:
      'peer w-full rounded-none border-0 border-b border-border-strong bg-transparent px-0 pt-6 pb-2 text-base text-foreground outline-none transition-colors focus:border-accent focus-visible:outline-none aria-invalid:border-danger',
  }
  return (
    <div className="relative">
      {multiline ? (
        <textarea rows={5} {...shared} className={cn(shared.className, 'resize-y')} />
      ) : (
        <input type={type} {...shared} />
      )}
      <label
        htmlFor={id}
        className="pointer-events-none absolute top-6 left-0 origin-left text-muted transition-all duration-300 ease-out-expo peer-focus:top-0 peer-focus:scale-[0.8] peer-focus:text-accent peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:scale-[0.8]"
      >
        {label}
      </label>
      <span
        aria-hidden
        className="absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 bg-accent transition-transform duration-500 ease-out-expo peer-focus:scale-x-100"
      />
      {error && (
        <p id={`${id}-error`} className="mt-2 text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  )
}

export function ContactForm({ locale, labels }: { locale: Locale; labels: Labels }) {
  const [state, setState] = useState<State>('idle')
  const [errors, setErrors] = useState<Partial<Record<ContactField, string>>>({})
  const [message, setMessage] = useState<string | null>(null)
  const startedAt = useRef<number>(0)
  const msg = (code?: string) =>
    code ? (labels.errors[code as keyof Labels['errors']] ?? labels.errors.server) : undefined

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>
    const payload = {
      name: data.name,
      email: data.email,
      subject: data.subject,
      message: data.message,
      website: data.website ?? '',
      locale,
      startedAt: startedAt.current || Date.now() - 60_000,
      turnstileToken: data['cf-turnstile-response'],
    }
    // Zod is loaded on demand so it never weighs on the initial page load.
    const { contactSchema } = await import('@/lib/validators/contact')
    const parsed = contactSchema.safeParse(payload)
    if (!parsed.success) {
      const fieldErrors: Partial<Record<ContactField, string>> = {}
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as ContactField
        if (!fieldErrors[key]) fieldErrors[key] = msg(issue.message)
      }
      setErrors(fieldErrors)
      form.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
      return
    }
    setErrors({})
    setState('sending')
    setMessage(null)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        setState('success')
        setMessage(labels.success)
        form.reset()
        return
      }
      const body = await res.json().catch(() => null)
      const code: string = body?.error?.code ?? 'server'
      if (code === 'validation' && body?.error?.fields) {
        setErrors(
          Object.fromEntries(
            Object.entries(body.error.fields).map(([k, v]) => [k, msg(v as string)]),
          ),
        )
      }
      setState('error')
      setMessage(msg(code === 'validation' ? 'server' : code) ?? labels.errors.server)
    } catch {
      setState('error')
      setMessage(labels.errors.network)
    }
  }

  return (
    <form
      noValidate
      onSubmit={onSubmit}
      onFocus={() => {
        if (!startedAt.current) startedAt.current = Date.now()
      }}
      className="flex flex-col gap-8"
      aria-describedby="contact-status"
    >
      <div className="grid gap-8 sm:grid-cols-2">
        <FloatingField name="name" label={labels.name} error={errors.name} autoComplete="name" />
        <FloatingField
          name="email"
          type="email"
          label={labels.email}
          error={errors.email}
          autoComplete="email"
        />
      </div>
      <FloatingField name="subject" label={labels.subject} error={errors.subject} />
      <FloatingField name="message" label={labels.message} multiline error={errors.message} />
      {/* Honeypot: invisible to humans, tempting for bots. */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="contact-website">{labels.honeypot}</label>
        <input id="contact-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      {TURNSTILE_KEY && (
        <>
          <Script
            src="https://challenges.cloudflare.com/turnstile/v0/api.js"
            strategy="lazyOnload"
          />
          <div className="cf-turnstile" data-sitekey={TURNSTILE_KEY} data-theme="dark" />
        </>
      )}
      <div className="flex flex-wrap items-center gap-5">
        <Magnetic>
          <button
            type="submit"
            disabled={state === 'sending'}
            data-state={state}
            className={cn(
              'relative inline-flex h-13 min-w-44 items-center justify-center overflow-hidden rounded-full px-7 font-medium transition-[background-color,box-shadow] duration-300',
              state === 'success'
                ? 'bg-success text-background'
                : state === 'error'
                  ? 'bg-danger text-background'
                  : 'bg-accent text-accent-foreground hover:shadow-[0_0_0_6px_var(--accent-soft)]',
            )}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={state}
                className="flex items-center gap-2"
                initial={{ y: 18, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -18, opacity: 0 }}
                transition={{ duration: 0.25, ease: bezier.expo }}
              >
                {state === 'sending' && (
                  <svg aria-hidden viewBox="0 0 24 24" className="size-4 animate-spin">
                    <circle
                      cx="12"
                      cy="12"
                      r="9"
                      fill="none"
                      stroke="currentColor"
                      strokeOpacity=".25"
                      strokeWidth="3"
                    />
                    <path
                      d="M21 12a9 9 0 0 0-9-9"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
                {state === 'success' && (
                  <svg aria-hidden viewBox="0 0 24 24" className="size-4">
                    <path
                      d="M5 12.5 10 17 19 7"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      pathLength={1}
                      className="[animation:draw_500ms_var(--ease-out)_both] [stroke-dasharray:1]"
                    />
                  </svg>
                )}
                {state === 'sending'
                  ? labels.sending
                  : state === 'success'
                    ? labels.sent
                    : state === 'error'
                      ? labels.retry
                      : labels.send}
              </motion.span>
            </AnimatePresence>
          </button>
        </Magnetic>
        <p
          id="contact-status"
          role="status"
          aria-live="polite"
          className={cn('text-sm', state === 'error' ? 'text-danger' : 'text-muted')}
        >
          {message}
        </p>
      </div>
    </form>
  )
}
