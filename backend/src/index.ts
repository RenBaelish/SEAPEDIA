import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { authRouter } from './routes/auth'
import { reviewRouter } from './routes/reviews'
import { storeRouter } from './routes/stores'
import { productRouter } from './routes/products'
import { walletRouter } from './routes/wallets'
import { cartRouter } from './routes/carts'
import { orderRouter } from './routes/orders'

const app = new Hono()

app.use('*', cors())

app.get('/', (c) => {
  return c.text('Welcome to SEAPEDIA API')
})

app.route('/auth', authRouter)
app.route('/reviews', reviewRouter)
app.route('/stores', storeRouter)
app.route('/products', productRouter)
app.route('/wallets', walletRouter)
app.route('/carts', cartRouter)
app.route('/orders', orderRouter)

export default app
