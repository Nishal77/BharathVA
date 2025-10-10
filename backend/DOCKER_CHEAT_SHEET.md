# Docker Cheat Sheet - BharathVA Backend

## 🚀 Quick Commands

### Install Docker
```bash
brew install --cask docker
open /Applications/Docker.app
docker --version
```

### Update Email
```bash
# Edit docker-compose.yml line 68
# Change: SMTP_USERNAME=your-email@gmail.com
```

### Build & Start (One Command!)
```bash
cd backend
docker-compose up --build
```

### Stop
```bash
docker-compose down
```

---

## 📊 Essential Commands

| Command | What It Does |
|---------|--------------|
| `docker-compose up` | Start all services |
| `docker-compose up -d` | Start in background |
| `docker-compose down` | Stop all services |
| `docker-compose logs -f` | View all logs |
| `docker-compose logs -f auth-service` | View auth logs |
| `docker-compose ps` | List containers |
| `docker-compose restart` | Restart all |
| `docker-compose restart auth-service` | Restart auth only |
| `docker ps` | Show running containers |
| `docker images` | Show images |

---

## 🧪 Test APIs

```bash
# Health check
curl http://localhost:8080/api/auth/register/health

# Register
curl -X POST http://localhost:8080/api/auth/register/email \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com"}'
```

---

## 📱 Service URLs

- Eureka: http://localhost:8761
- Gateway: http://localhost:8080
- Auth: http://localhost:8081

---

## 🎯 Postman

Import: `POSTMAN_COLLECTION.json`

Environment:
- `baseUrl` = `http://localhost:8080/api/auth`
- `testEmail` = Your email

---

## 🔥 Quick Reference

```bash
# Full workflow
cd backend
docker-compose up --build  # Start (first time)
# ... test with Postman ...
docker-compose down  # Stop

# Next time
docker-compose up  # No rebuild needed
```

**🇮🇳 Jai Hind!**

