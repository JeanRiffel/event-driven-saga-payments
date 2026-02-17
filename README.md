# Event-Driven Saga Payments

A distributed payment system prototype implementing a choreography-based Saga using RabbitMQ.

This project demonstrates:
- Event-driven microservices
- Saga pattern (choreography)
- Compensating transactions
- Idempotent message consumers
- At-least-once delivery handling


docker compose up --build

curl -X POST http://localhost:3000/orders

curl -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -d '{"productId":"p1","quantity":2}'



http://localhost:15672/#/
guest - guest

