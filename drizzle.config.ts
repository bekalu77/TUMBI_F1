import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: "./shared/schema.ts",
  out: "./drizzle",
  dialect: 'sqlite',
  dbCredentials: {
    url: 'data/database.sqlite'
  },
  verbose: true,
  strict: true,
})
