import { config } from 'dotenv'

config({ path: ['.env.test', '.env.local', '.env'], quiet: true })
process.env.DATABASE_URL ??= 'postgres://portfolio:portfolio@localhost:5432/portfolio_test'
process.env.IP_HASH_SECRET ??= 'test-ip-hash-secret-0123456789'
