# IV1201_Recruitment_Application

## How to run the project
Use Docker to run the whole repository, download Docker and then run:
```
docker compose up
```

If not using docker-compose: 

1. Initialize database by Docker in IV1201_Recruitment_Application/:
```
docker run -d \
  --name recruitment_db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=recruitment \
  -p 5432:5432 \
  -v ./server/init_db:/docker-entrypoint-initdb.d \
  postgres
```
2. run server in server/:
```
node src/server.js
```
3. run client in client/:
```
npm run dev
```

