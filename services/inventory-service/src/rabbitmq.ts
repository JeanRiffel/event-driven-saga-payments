import amqp from "amqplib"
import { EVENTS, EXCHANGE } from "./events"

let channel: amqp.Channel

async function connectWithRetry() {
  try {
    return await amqp.connect("amqp://rabbitmq:5672")
  } catch (err) {
    console.log("RabbitMQ not ready, retrying in 5 seconds...")
    await new Promise(res => setTimeout(res, 5000))
    return connectWithRetry()
  }
}

export async function connectRabbitMQ() {
  try {
    const connection = await connectWithRetry()

    channel = await connection.createChannel()

    await channel.assertExchange(EXCHANGE, "topic", {
      durable: true,
    })

    const q = await channel.assertQueue("order_service_queue", {
      durable: true,
    })

    await channel.bindQueue(q.queue, EXCHANGE, EVENTS.INVENTORY_FAILED)
    await channel.bindQueue(q.queue, EXCHANGE, EVENTS.PAYMENT_FAILED)
    await channel.bindQueue(q.queue, EXCHANGE, EVENTS.PAYMENT_PROCESSED)

    channel.prefetch(1)

    console.log("Connected to RabbitMQ")

    channel.consume(q.queue, (msg) => {
      if (!msg) return

      const routingKey = msg.fields.routingKey
      const content = JSON.parse(msg.content.toString())

      console.log("Received:", routingKey, content)

      switch (routingKey) {
        case EVENTS.INVENTORY_FAILED:
        case EVENTS.PAYMENT_FAILED:
          channel.publish(
            EXCHANGE,
            EVENTS.ORDER_CANCELLED,
            Buffer.from(JSON.stringify({ orderId: content.orderId })),
            { persistent: true }
          )
          break

        case EVENTS.PAYMENT_PROCESSED:
          channel.publish(
            EXCHANGE,
            EVENTS.ORDER_COMPLETED,
            Buffer.from(JSON.stringify({ orderId: content.orderId })),
            { persistent: true }
          )
          break
      }

      channel.ack(msg)
    })
  } catch (err) {
    console.log("RabbitMQ not ready. Retrying in 5 seconds...")
    setTimeout(connectRabbitMQ, 5000)
  }
}

export function getChannel() {
  if (!channel) {
    throw new Error("RabbitMQ channel not initialized")
  }
  return channel
}