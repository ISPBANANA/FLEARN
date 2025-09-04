# Docker Setup Instructions

This project includes a Docker Compose configuration for running PostgreSQL, pgAdmin, and MongoDB locally.

## Services Included

### PostgreSQL
- **Port**: 5432
- **Database**: flearn_db
- **Username**: flearn_user
- **Password**: flearn_password

### pgAdmin (PostgreSQL Web Interface)
- **URL**: http://localhost:8080
- **Email**: admin@flearn.com
- **Password**: admin123

### MongoDB
- **Port**: 27017
- **Database**: flearn_mongo_db
- **Username**: flearn_admin
- **Password**: flearn_mongo_password

### Mongo Express (MongoDB Web Interface)
- **URL**: http://localhost:8081
- **Username**: admin
- **Password**: admin123

## Quick Start

1. **Start all services**:
   ```bash
   docker-compose up -d
   ```

2. **View logs**:
   ```bash
   docker-compose logs -f
   ```

3. **Stop all services**:
   ```bash
   docker-compose down
   ```

4. **Stop and remove volumes** (⚠️ This will delete all data):
   ```bash
   docker-compose down -v
   ```

## Accessing the Databases

### PostgreSQL via pgAdmin
1. Open http://localhost:8080
2. Login with: admin@flearn.com / admin123
3. Add new server with these settings:
   - Host: postgres
   - Port: 5432
   - Database: flearn_db
   - Username: flearn_user
   - Password: flearn_password

### MongoDB via Mongo Express
1. Open http://localhost:8081
2. Login with: admin / admin123
3. Browse your MongoDB databases and collections

### Direct Database Connections

#### PostgreSQL
```bash
psql -h localhost -p 5432 -U flearn_user -d flearn_db
```

#### MongoDB
```bash
mongo mongodb://flearn_admin:flearn_mongo_password@localhost:27017/flearn_mongo_db?authSource=admin
```

## Environment Variables

The `.env` file contains all necessary configuration. Make sure to update the `MONGO_URL` in your application to use the Docker MongoDB instance:

```
MONGO_URL=mongodb://flearn_admin:flearn_mongo_password@localhost:27017/flearn_mongo_db?authSource=admin
```

## Data Persistence

All database data is stored in Docker volumes:
- `postgres_data`: PostgreSQL data
- `mongodb_data`: MongoDB data
- `pgadmin_data`: pgAdmin configuration

These volumes persist even when containers are stopped/restarted.

## Development Workflow

1. Start databases: `docker-compose up -d`
2. Run your Node.js app: `npm run dev`
3. Access web interfaces for database management
4. Stop databases when done: `docker-compose down`

## Troubleshooting

### Port Conflicts
If you get port conflicts, you can change the ports in `docker-compose.yml`:
- PostgreSQL: Change `"5432:5432"` to `"5433:5432"`
- MongoDB: Change `"27017:27017"` to `"27018:27017"`
- pgAdmin: Change `"8080:80"` to `"8082:80"`
- Mongo Express: Change `"8081:8081"` to `"8083:8081"`

### Reset Everything
```bash
docker-compose down -v
docker-compose up -d
```

This will remove all data and start fresh.
