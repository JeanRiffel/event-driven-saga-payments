import { connectRabbitMQ, getChannel } from "./rabbitmq"
import { EVENTS, EXCHANGE } from "./events"

async function bootstrap() {
  await connectRabbitMQ()
  const channel = getChannel()

  await channel.assertExchange(EXCHANGE, "topic", { durable: true })

  const q = await channel.assertQueue("payment_service_queue", {
    durable: true,
  })

  await channel.bindQueue(q.queue, EXCHANGE, EVENTS.INVENTORY_RESERVED)

  channel.consume(q.queue, (msg) => {
    if (!msg) return

    const data = JSON.parse(msg.content.toString())
    console.log("Processing payment for order:", data.orderId)

    const paymentSuccess = Math.random() > 0.3

    if (paymentSuccess) {
      channel.publish(
        EXCHANGE,
        EVENTS.PAYMENT_PROCESSED,
        Buffer.from(JSON.stringify({ orderId: data.orderId })),
        { persistent: true }
      )
    } else {
      channel.publish(
        EXCHANGE,
        EVENTS.PAYMENT_FAILED,
        Buffer.from(JSON.stringify({ orderId: data.orderId })),
        { persistent: true }
      )
    }

    channel.ack(msg)
  })

  console.log("Payment Service running")
}

bootstrap()
