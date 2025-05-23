#!/bin/bash

# Backup script for Voice Project

BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="voice_backup_${TIMESTAMP}"

echo "🔄 Starting backup of Voice Project..."

# Create backup directory
mkdir -p ${BACKUP_DIR}

# Check if containers are running
if ! docker-compose ps | grep -q "Up"; then
    echo "⚠️  Warning: Some containers might not be running"
fi

# Backup database
echo "🗄️  Backing up database..."
docker-compose exec -T postgres pg_dump -U postgres voicedb > "${BACKUP_DIR}/${BACKUP_NAME}_database.sql"

# Backup uploads directory
echo "📁 Backing up uploads..."
if [ -d "backend/uploads" ]; then
    tar -czf "${BACKUP_DIR}/${BACKUP_NAME}_uploads.tar.gz" -C backend uploads
fi

# Backup environment files
echo "🔧 Backing up configuration..."
tar -czf "${BACKUP_DIR}/${BACKUP_NAME}_config.tar.gz" .env docker-compose.yml nginx/

# Create a combined archive
echo "📦 Creating combined backup..."
cd ${BACKUP_DIR}
tar -czf "${BACKUP_NAME}.tar.gz" \
    "${BACKUP_NAME}_database.sql" \
    "${BACKUP_NAME}_uploads.tar.gz" \
    "${BACKUP_NAME}_config.tar.gz"

# Clean up individual files
rm -f "${BACKUP_NAME}_database.sql" \
      "${BACKUP_NAME}_uploads.tar.gz" \
      "${BACKUP_NAME}_config.tar.gz"

cd ..

# Keep only last 7 backups
echo "🧹 Cleaning old backups..."
ls -t ${BACKUP_DIR}/*.tar.gz | tail -n +8 | xargs -r rm

echo "✅ Backup completed: ${BACKUP_DIR}/${BACKUP_NAME}.tar.gz"