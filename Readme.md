# Project Setup Guide

1. Set up environment variables
Copy the example `.env` file and update values:
```bash
# macOS/Linux
cp .env.example .env

# Windows CMD
copy .env.example .env
```

**Update .env with your database credentials:**

POSTGRES_USER=your_db_user
POSTGRES_PASSWORD=strong_secret_password
POSTGRES_DB=shikshak_db

2. Start Docker containers
```bash
docker-compose up -d
```
This starts PostgreSQL and any other services defined in ```docker-compose.yml```.

3. Backup the database
```bash
# Linux/macOS
docker exec -t shikshak_db pg_dump -U $POSTGRES_USER $POSTGRES_DB > backup.sql

#Windows (PowerShell)
docker exec -t shikshak_db pg_dump -U $env:POSTGRES_USER $env:POSTGRES_DB > backup.sql
```
*Tip: Use ```stop_with_backup.sh``` (Linux/macOS) or ```Stop-With-Backup.ps1``` (Windows) for automatic timestamped backups and container shutdown.*

4. Restore the database
```bash
#Linux/macOS
cat backup.sql | docker exec -i shikshak_db psql -U $POSTGRES_USER -d $POSTGRES_DB

#Windows (PowerShell)
Get-Content .\backup.sql | docker exec -i shikshak_db psql -U $env:POSTGRES_USER -d $env:POSTGRES_DB
```

5. Stop containers
- Stop containers without deleting volumes (data persists):
```bash
docker-compose down
```
- Stop containers and delete volumes (data removed):
```bash
docker-compose down -v
```

6. Navigate into backend folder
```bash
cd backend
```

**Create and activate virtual environment**
```bash
# macOS/Linux
python3 -m venv venv
source venv/bin/activate

# Windows PowerShell
python -m venv venv
.\venv\Scripts\activate
```

**To run backend**
```bash
uvicorn app.main:app --reload
```

7. Notes
- All database backups are stored in the ```backups/``` folder with timestamps.
- Use ```.env``` for credentials; do not commit sensitive passwords.
- The ```stop_with_backup.sh``` / ```Stop-With-Backup.ps1``` scripts automate backup and container shutdown.
- For restoring a specific backup, replace ```backup.sql``` with the timestamped backup filename.


8. Alembic usage(make sure to add the ```DATABASE_URL``` into the ```alembic.ini``` file where it says ```sqlalchemy.url```)
```bash
alembic revision --autogenerate -m "Add message here"
alembic upgrade head
```

To access a PostgreSQL server from the terminal using the ```psql``` command, follow this format:
```bash
psql -h <host> -p <port> -U <username> -d <database>
# psql -h localhost -p 5432 -U shikshak_user -d shikshak_db
```

If when running ```alembic revision --autogenerate``` any problems arise, do:
```
netstat -ano | findstr "5432"
```
& kill processes which are not docker(there should only be one)

8. To run frontend

```bash
cd fronend
npm install
npm run dev
```

## (latest) To Build and run the whole application:
```bash
docker-compose up --build
```

Once the containers are up and running, you should be able to access the application at http://localhost:8080/.
