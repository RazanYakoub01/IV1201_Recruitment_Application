# Recruitment Application

## Overview
This is a recruitment management system built using **React (Vite) for the frontend**, **Node.js with Express for the backend**, and **PostgreSQL as the database**. The system is containerized using **Docker** and can be deployed locally with `docker-compose`. The application is also deployed live on **Render**.

## **Technologies Used**
### **Frontend**
- React 18.2.0
- React Router DOM 6.28.2
- i18next for translations
- Vite 5.0.0 (for fast frontend development)

### **Backend**
- Node.js 23
- Express.js 4.21.2
- PostgreSQL (pg library for database access)
- bcrypt for password hashing
- cors for cross-origin requests
- dotenv for environment variable management
- nodemon for development monitoring

### **Database**
- PostgreSQL 17.2
- Database initialized with SQL scripts (`server/init_db/`)

## **Setup and Installation**
### **1. Clone the Repository**
```sh
git clone https://github.com/RazanYakoub01/IV1201_Recruitment_Application.git

cd IV1201_Recruitment_Application
```
If you are running the application locally, you must remove or comment out the following lines from server/src/db.js:

```js
ssl: {
    rejectUnauthorized: false,
},
```

### **3. Start the Application Using Docker**
Run the following command:
```sh
docker-compose up --build -d
```
This will:
- Start the PostgreSQL database container (`recruitment_db_container`)
- Start the backend server (`recruitment_backend_container`)
- Start the frontend app (`recruitment_frontend_container`)

### **4. Verify Containers Are Running**
To check running containers:
```sh
docker ps
```

### **5. Access the Application**
- **Frontend:** [http://localhost:8080](http://localhost:8080)
- **Backend API:** [http://localhost:3001](http://localhost:3001)

## **Database Setup**
### **Access the PostgreSQL Database**
To manually inspect the database, connect using:
```sh
docker exec -it recruitment_db_container bash

psql -U postgres

\c recruitment
```
For example to list tables you can run the following:
```sql
\dt;
```

## **Rebuilding the Application**
To rebuild the whole application:
```sh
docker compose down -v

rm -rf ./postgres-data

docker volume prune -f

docker compose up --build
```

## **Development Notes**
### **Frontend**
- Located in `client/`
- Uses Vite for development (`npm run dev`)
- Runs on port 8080

### **Backend**
- Located in `server/`
- Uses Express.js
- Runs on port 3001
- Handles authentication with bcrypt and PostgreSQL

### **Render**
This application is deployed on Render. https://iv1201-recruitment-application-frontend.onrender.com

## **Testing**

### **Technologies Used for Testing**
- **Jest**: A JavaScript testing framework for running and organizing tests.
- **Selenium WebDriver**: A tool for automating web browsers.

### **Installing Dependencies**
To install the required dependencies, run:

```sh
npm install --save-dev jest selenium-webdriver
```

### **Test Folder Structure**
- Place all test files in the `tests` folder.
- Test files should be named in the format `name.test.js`.

### **Running All Tests**
To run all tests sequentially, use:

```sh
npx jest --runInBand
```

## **Contributing**

@18alba1- Alex Barhado
@Seemamian- Seema Bashir
@Lellalu- Siyu Lu
@RazanYakoub01- Razan Yakoub
