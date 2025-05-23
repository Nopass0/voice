#!/bin/bash

echo "🔧 Исправление развертывания на сервере"
echo "======================================"

# Подключитесь к серверу и выполните эти команды:

cat << 'EOF'

# 1. Подключитесь к серверу
ssh root@194.58.105.224

# 2. Перейдите в папку проекта
cd /opt/voice

# 3. Проверьте и исправьте SSL файлы
if [ -f ssl/voicecxr.pro.key ]; then
    cp ssl/voicecxr.pro.key ssl/private.key
    chmod 600 ssl/private.key
fi

# 4. Создайте правильный docker-compose.yml
cat > docker-compose.yml << 'COMPOSE'
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: voice_postgres
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-voice_secure_password}
      POSTGRES_DB: voicedb
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - voice_network
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    image: ghcr.io/nopass0/voice-backend:latest
    container_name: voice_backend
    environment:
      DATABASE_URL: postgresql://postgres:${POSTGRES_PASSWORD:-voice_secure_password}@postgres:5432/voicedb?schema=public
      JWT_SECRET: ${JWT_SECRET:-your-super-secret-jwt-key-change-this}
      NODE_ENV: production
    ports:
      - "3000:3000"
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - voice_network
    restart: unless-stopped
    volumes:
      - ./uploads:/app/uploads

  frontend:
    image: ghcr.io/nopass0/voice-frontend:latest
    container_name: voice_frontend
    environment:
      NEXT_PUBLIC_API_URL: http://backend:3000
      NODE_ENV: production
      PORT: 3001
    ports:
      - "3001:3001"
    depends_on:
      - backend
    networks:
      - voice_network
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    container_name: voice_nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/conf.d:/etc/nginx/conf.d:ro
      - ./ssl:/etc/nginx/ssl:ro
      - ./nginx/logs:/var/log/nginx
    depends_on:
      - frontend
      - backend
    networks:
      - voice_network
    restart: unless-stopped

volumes:
  postgres_data:

networks:
  voice_network:
    driver: bridge
COMPOSE

# 5. Создайте папки для логов и загрузок
mkdir -p nginx/logs uploads

# 6. Запустите контейнеры
docker-compose up -d

# 7. Проверьте статус
docker ps

# 8. Проверьте логи
docker-compose logs --tail=50

# 9. Выполните миграции базы данных
docker-compose exec backend bun run prisma migrate deploy

# 10. Если все работает, проверьте сайт
echo "Проверьте:"
echo "http://194.58.105.224"
echo "https://194.58.105.224"

EOF