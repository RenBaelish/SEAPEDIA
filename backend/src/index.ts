import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { authRouter } from './routes/auth'
import { reviewRouter } from './routes/reviews'
import { storeRouter } from './routes/stores'
import { productRouter } from './routes/products'
import { walletRouter } from './routes/wallets'
import { addressRouter } from './routes/addresses'
import { cartRouter } from './routes/carts'
import { orderRouter } from './routes/orders'
import { promoRouter } from './routes/promos'
import { deliveryRouter } from './routes/deliveries'
import { adminRouter } from './routes/admin'
import { categoryRouter } from './routes/categories'
import { swaggerUI } from '@hono/swagger-ui'
import openapiSpec from '../openapi.json'
import seedHandler from './seed'

const app = new Hono()

app.use('*', cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['POST', 'GET', 'OPTIONS', 'PUT', 'DELETE', 'PATCH'],
  exposeHeaders: ['Content-Length'],
  maxAge: 600,
  credentials: true,
}))

app.get('/favicon.ico', (c) => c.redirect('http://localhost:5173/only-logo-seapedia.png'))

app.get('/openapi.json', (c) => c.json(openapiSpec))

app.get('/docs', swaggerUI({
  url: '/openapi.json',
  title: 'SEAPEDIA API Docs'
}))

app.get('/', (c) => {
  return c.text('Welcome to SEAPEDIA API')
})

app.route('/auth', authRouter)
app.route('/reviews', reviewRouter)
app.route('/stores', storeRouter)
app.route('/products', productRouter)
app.route('/wallet', walletRouter)
app.route('/addresses', addressRouter)
app.route('/cart', cartRouter)
app.route('/orders', orderRouter)
app.route('/promos', promoRouter)
app.route('/deliveries', deliveryRouter)
app.route('/admin', adminRouter)
app.route('/categories', categoryRouter)

app.get('/seed', (c) => seedHandler.fetch(c.req.raw, c.env))

export default app
