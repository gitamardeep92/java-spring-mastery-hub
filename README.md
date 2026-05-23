# ☕ Java Mastery Hub

An interactive learning portal covering Core Java, Spring Boot, and Microservices — from beginner to expert level, with production-grade code examples.

## Topics Covered

**Core Java**
- JVM / JDK / JRE Architecture & Production Tuning
- OOP & SOLID Principles
- Collections Framework Deep Dive
- Exception Handling & Custom Exceptions
- Multithreading & Concurrency
- Java 8–21 Modern Features

**Spring Boot**
- IoC & Dependency Injection
- Auto-Configuration Internals
- Spring Data JPA & Database Layer
- Spring Security — JWT & Authorization
- Actuator & Observability with Micrometer

**Microservices**
- Architecture Patterns & DDD
- API Gateway & Service Discovery
- Resilience: Circuit Breaker & Bulkhead
- Event-Driven Architecture with Kafka
- Saga Pattern for Distributed Transactions
- Docker & Kubernetes Deployment

## Local Development

```bash
npm install
npm run dev
```

## Deploy on Render

1. Push this repo to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com) → **New** → **Static Site**
3. Connect your GitHub repo
4. Set build settings:
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`
5. Click **Create Static Site**

Render auto-deploys on every `git push` to main.
