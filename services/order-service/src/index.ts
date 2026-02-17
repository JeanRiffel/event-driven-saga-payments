import express from "express"
import { connectRabbitMQ, getChannel } from "./rabbitmq"
import { EVENTS, EXCHANGE } from "./events"

const app = express()
app.use(express.json())

async function bootstrap() {
  await connectRabbitMQ()
  const channel = getChannel()

  await channel.assertExchange(EXCHANGE, "topic", { durable: true })

  app.post("/orders", (req, res) => {
    const order = {
      orderId: Date.now(),
      productId: req.body.productId,
      quantity: req.body.quantity,
    }

    channel.publish(
      EXCHANGE,
      EVENTS.ORDER_CREATED,
      Buffer.from(JSON.stringify(order)),
      { persistent: true }
    )

    res.status(201).json(order)
  })

  app.listen(3000, () => {
    console.log("Order Service running on port 3000")
  })
}

bootstrap()
