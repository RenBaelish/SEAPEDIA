import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { authRouter } from './routes/auth'
import { reviewRouter } from './routes/reviews'

const app = new Hono()

app.use('*', cors())

app.get('/', (c) => {
  return c.text('Welcome to SEAPEDIA API')
})

app.route('/auth', authRouter)
app.route('/reviews', reviewRouter)

export default app
