import 'server-only'
import { Resend } from 'resend'
import { env } from '@/server/env'
import { logger } from '@/server/logger'

export type Mail = { to: string; subject: string; text: string; html?: string; replyTo?: string }

export interface MailDriver {
  send(mail: Mail): Promise<void>
}

class ConsoleMailDriver implements MailDriver {
  async send(mail: Mail) {
    logger.info('mail.console', { to: mail.to, subject: mail.subject, text: mail.text })
  }
}

class ResendMailDriver implements MailDriver {
  constructor(
    private client: Resend,
    private from: string,
  ) {}
  async send(mail: Mail) {
    const { error } = await this.client.emails.send({
      from: this.from,
      to: mail.to,
      subject: mail.subject,
      text: mail.text,
      html: mail.html,
      replyTo: mail.replyTo,
    })
    if (error) throw new Error(`Resend: ${error.message}`)
  }
}

let driver: MailDriver | undefined

/** Resend when RESEND_API_KEY is set, console otherwise (dev/tests). */
export function mailer(): MailDriver {
  if (driver) return driver
  const e = env()
  driver = e.RESEND_API_KEY
    ? new ResendMailDriver(new Resend(e.RESEND_API_KEY), e.CONTACT_FROM_EMAIL)
    : new ConsoleMailDriver()
  return driver
}

export function setMailerForTests(d: MailDriver | undefined) {
  driver = d
}
