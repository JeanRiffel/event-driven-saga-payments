Event-Driven Saga Payments

A distributed payment system prototype implementing a choreography-based Saga pattern using RabbitMQ.

This project demonstrates how microservices coordinate business transactions using asynchronous events and compensating actions.

🚀 What This Project Demonstrates

Event-driven microservices architecture

Saga pattern (choreography-based)

Compensating transactions

Idempotent message consumers

At-least-once delivery handling

Distributed workflow coordination without a central orchestrator

🏗 Architecture Overview

The system consists of three services:

order-service – Entry point. Creates orders and publishes domain events

inventory-service – Reserves and releases stock

payment-service – Processes or rejects payments

Services communicate asynchronously using RabbitMQ events.

🔄 Saga Flow
✅ Happy Path

Order Created

Inventory Reserved

Payment Processed

Order Completed

❌ Failure Scenario (Payment Fails)

Order Created

Inventory Reserved

Payment Failed

Inventory Compensation Triggered

Order Cancelled

🐳 Running the Project

Start everything with:

docker compose up --build

🧪 Testing the System
Create an order (default payload)
curl -X POST http://localhost:3000/orders

Create an order with custom payload
curl -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -d '{"productId":"p1","quantity":2}'


Check the service logs to observe the event flow.

🐇 RabbitMQ Management UI

Access the RabbitMQ dashboard:

http://localhost:15672


Credentials:

username: guest
password: guest


You can:

Inspect exchanges

View queues

Monitor message flow

Observe retries and requeues

📁 Project Structure
order-service/
inventory-service/
payment-service/
docker-compose.yml


Each service:

Manages its own RabbitMQ connection

Publishes domain events

Consumes relevant events

Implements idempotent message handling

🧠 Key Learning Points

How choreography-based Saga avoids tight coupling

Why idempotency is critical in distributed systems

Handling at-least-once delivery safely

Designing compensating transactions

Service ownership of infrastructure concerns

🔮 Possible Improvements

Persistent database instead of in-memory storage

Correlation IDs for tracing

Dead-letter queues (DLQ)

Retry policies with exponential backoff

Observability (metrics and structured logging)

Distributed tracing

📌 Purpose

This project is intended for learning and experimentation with:

Event-driven architecture

Distributed transactions

Microservices communication patterns

Saga design pattern