# Local Development Setup
## First-time setup (important)

If you are setting up the project for the first time, please follow the README inside the `/deploy` folder step by step.

It contains all required instructions for installing dependencies.

Make sure everything from `/deploy/README` is completed before continuing.

## Start the project locally

After the initial setup is done, you can start the full project with the following commands:

```bas
supabase start
docker compose up -d --build
```

This will start:

- Supabase (local database + services)

- Spring Boot backend

- Angular frontend 

## Access the running services

Once everything is running, you can access the application here:

| Service | URL |
|---------|---------|
| Frontend	| http://localhost |
| Backend	| http://localhost:8080 |
| Supabase Studio	| http://localhost:54323 |
| Supabase Database	| localhost:54322 |

Supabase Studio allows you to inspect the database, tables, and logs via browser.

## Stopping the project

To stop everything:

```bash
docker compose down
supabase stop
```

## Notes

Always start Supabase first, then the Docker containers.

If you make changes to the backend or frontend Dockerfiles, rebuild with:

```bash
docker compose up -d --build
```

On Linux, host.docker.internal is mapped inside docker-compose for database access.