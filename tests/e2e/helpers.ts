import postgres from 'postgres'

export const db = () =>
  postgres(
    process.env.E2E_DATABASE_URL ?? 'postgres://portfolio:portfolio@localhost:5432/portfolio_test',
    {
      max: 1,
      onnotice: () => {},
    },
  )
