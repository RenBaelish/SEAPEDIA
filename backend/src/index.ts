import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { authRouter } from './routes/auth'

const app = new Hono()

app.use('*', cors())

app.get('/', (c) => {
  return c.text('Welcome to SEAPEDIA API')
})

app.route('/auth', authRouter)

export default app
