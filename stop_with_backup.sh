#!/bin/bash
# -------------------------------
# stop_with_backup.sh
# Automatically backup PostgreSQL before stopping containers
# -------------------------------

# Directory to store backups
BACKUP_DIR="./backups"
mkdir -p "$BACKUP_DIR"

# Load .env variables if exists
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

# Container name
CONTAINER_NAME="shikshak_db"

# Timestamp for backup
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Backup file path
BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.sql"

# Database credentials
DB_USER=${POSTGRES_USER:-shikshak_user}
DB_NAME=${POSTGRES_DB:-shikshak_db}

echo "Backing up database from container $CONTAINER_NAME..."

docker exec -i "$CONTAINER_NAME" pg_dump -U "$DB_USER" "$DB_NAME" > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
  echo "Backup successful: $BACKUP_FILE"
else
  echo "Backup failed!"
  exit 1
fi

# Stop the containers
echo "Stopping containers..."
docker-compose down

echo "All done!"
