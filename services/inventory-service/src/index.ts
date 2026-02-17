import { connectRabbitMQ, getChannel } from "./rabbitmq"
import { EVENTS, EXCHANGE } from "./events"

async function bootstrap() {
  await connectRabbitMQ()
  const channel = getChannel()

  await channel.assertExchange(EXCHANGE, "topic", { durable: true })

  const q = await channel.assertQueue("inventory_service_queue", {
    durable: true,
  })

  await channel.bindQueue(q.queue, EXCHANGE, EVENTS.ORDER_CREATED)

  channel.consume(q.queue, (msg) => {
    if (!msg) return

    const order = JSON.parse(msg.content.toString())
    console.log("Inventory received order:", order)

    // Simulate stock check
    const inStock = Math.random() > 0.3

    if (inStock) {
      channel.publish(
        EXCHANGE,
        EVENTS.INVENTORY_RESERVED,
        Buffer.from(JSON.stringify({ orderId: order.orderId })),
        { persistent: true }
      )
    } else {
      channel.publish(
        EXCHANGE,
        EVENTS.INVENTORY_FAILED,
        Buffer.from(JSON.stringify({ orderId: order.orderId })),
        { persistent: true }
      )
    }

    channel.ack(msg)
  })

  console.log("Inventory Service running")
}

bootstrap()
