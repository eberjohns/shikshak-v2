# -------------------------------
# Stop-With-Backup.ps1
# Automatically backup PostgreSQL before stopping containers
# -------------------------------

# Path to backups folder
$BackupDir = ".\backups"
if (-not (Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir
}

# Load .env variables
$EnvPath = ".\.env"
if (Test-Path $EnvPath) {
    Get-Content $EnvPath | ForEach-Object {
        if ($_ -match "^\s*([^#=]+)\s*=\s*(.+)\s*$") {
            [System.Environment]::SetEnvironmentVariable($matches[1], $matches[2])
        }
    }
}

# Container name
$ContainerName = "shikshak_db"

# Timestamp
$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"

# Backup file path
$BackupFile = "$BackupDir\backup_$Timestamp.sql"

# Database credentials
$DBUser = $env:POSTGRES_USER
$DBName = $env:POSTGRES_DB

Write-Host "Backing up database from container $ContainerName..."

docker exec -i $ContainerName pg_dump -U $DBUser $DBName > $BackupFile

if ($LASTEXITCODE -eq 0) {
    Write-Host "Backup successful: $BackupFile"
} else {
    Write-Host "Backup failed!"
    exit 1
}

Write-Host "Stopping containers..."
docker-compose down

Write-Host "All done!"
