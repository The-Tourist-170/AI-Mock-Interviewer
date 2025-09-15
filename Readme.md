# AI Mock Interviewer for Excel Skills

## Overview

This project is a Proof of Concept (PoC) for an AI-powered mock interviewer focused on Excel skills. It simulates a conversational interview where an AI agent ("Alex") asks questions, evaluates user responses in real-time, and generates a performance report at the end. The system uses advanced prompt engineering with Gemini AI to handle the "cold start" problem without pre-existing datasets.

Key Features:
- Structured interview flow: Introduction, 3-4 progressively difficult questions, evaluation of answers, and conclusion.
- Chat-based interface for user-AI interaction.
- Storage of interview sessions and messages in a database.
- Final report summarizing performance.

The project is built with a backend in Spring Boot, frontend in React, PostgreSQL database, and Gemini AI for natural language processing.

For Design Document & Approach Strategy [https://docs.google.com/document/d/1jOVeloPpWW4m2tiuzN4S4MQLZIrfqYe-llOKfrXg97g/edit?usp=sharing](click here).

## Tech Stack

- **Backend:** Java 21, Spring Boot 3.3.5, JPA/Hibernate, PostgreSQL driver, Lombok, Google GenAI SDK.
- **Frontend:** React 18.3.1, Vite, Tailwind CSS, Fetch for API calls, Framer Motion for animations.
- **Database:** PostgreSQL.
- **AI Integration:** Google Gemini API.
- **Deployment:** Render (backend and database), Vercel (frontend).

## Dependencies and Installation

### Backend (Spring Boot)
Refer to `pom.xml` for full dependencies. Key ones include:

- Spring Boot Starter Data JPA
- Spring Boot Starter Web
- PostgreSQL Driver
- Lombok
- Google GenAI (for Gemini integration)

To install:
1. Ensure Java 21 and Maven are installed.
2. Clone the repo: `git clone <repo-url>`
3. Navigate to backend directory: `cd server`
4. Install dependencies: `mvn clean install`

### Frontend (React)
Refer to `package.json` for full dependencies. Key ones include:

- React and React DOM
- Axios (for API requests)
- Framer Motion (animations)
- Tailwind CSS (styling)

To install:
1. Ensure Node.js (v18+) and npm are installed.
2. Navigate to frontend directory: `cd client`
3. Install dependencies: `npm install`

## How to Run the Project Locally

### Prerequisites
- Docker for PostgreSQL (or local PostgreSQL installation).
- Gemini API key (from Google AI Studio).
- Update `application.properties` with your credentials (see Configuration section below).

### Backend
1. Start PostgreSQL via Docker: Use the provided `docker-compose.yml` or run `docker run -d -p 5432:5432 --name pg-db -e POSTGRES_USER=admin -e POSTGRES_PASSWORD=secret -e POSTGRES_DB=excel_interviewer_db postgres:16`.
2. Run the app: `mvn spring-boot:run` (or from IDE).
3. App runs on `http://localhost:8080`.

### Frontend
1. Run development server: `npm run dev`.
2. App runs on `http://localhost:5173` (Vite default).
3. Update API base in frontend code to `http://localhost:8080/api/v1`.

### Full Stack with Docker
- Use `docker-compose up` to start backend + DB.
- Access frontend separately.

## Deployment Details

- **Database:** Deployed on Render (PostgreSQL free tier). DB: excel_interviewer_db, User: admin.
- **Backend Server:** Deployed on Render (free tier) at ([Server](https://server-ai-mock-interviewer.onrender.com)).
- **Frontend Client:** Deployed on Vercel at ([Client]([https://ai-mock-interviewer-one-pearl.vercel.app/](https://ai-mock-interviewer-ku72pqujv-thetourist170s-projects.vercel.app/))).

**Note:** The deployed link may be slow or experience startup delays due to limitations of the Render free tier account (e.g., cold starts after inactivity, taking 30-60 seconds). For better performance, consider upgrading to a paid tier.

## Project Phase Map

The project was divided into phases to meet the 10-hour deadline, focusing on an MVP. Below is the roadmap:

### **Phase 1: Foundation & Design (2 Hours)**

This phase is about planning and setup. Getting this right will save a lot of time later.

* **Task 1: Design Document & Strategy (1.5 hours)**
    * This is a core deliverable. We'll create a concise Markdown document (`DESIGN.md`).
    * **Architecture:** Define a simple three-tier architecture: React Frontend ↔ Spring Boot REST API ↔ PostgreSQL Database. The Spring Boot application will handle all logic, including calls to the Gemini API.
    * **Tech Stack Justification:** We'll justify the stack based on your expertise and its suitability for rapid development.
        * **Spring Boot:** For building a robust, secure REST API quickly.
        * **React:** For creating a dynamic, single-page application for the chat interface.
        * **PostgreSQL:** A reliable relational database for storing interview transcripts.
        * **Gemini AI:** A powerful LLM capable of conversational logic, evaluation, and instruction following, which is perfect for our agent.
    * **"Cold Start" Solution:** We'll address this by using **advanced prompt engineering**. Our strategy is to create a detailed "meta-prompt" or system prompt that instructs Gemini on its persona, the interview structure, question progression, and how to evaluate answers on the fly. This bypasses the need for a pre-existing dataset for the PoC.
    * **Database Schema:** Define two simple tables: `InterviewSession` (to track each interview) and `ChatMessage` (to store the turn-by-turn conversation).

* **Task 2: Project Scaffolding (0.5 hours)**
    * Initialize a Git repository.
    * Use Spring Initializr to create the backend project with `Web`, `JPA`, `PostgreSQL Driver`, and `Lombok` dependencies.
    * Use `Vite` to quickly scaffold the React frontend project.
    * Set up a local PostgreSQL instance using Docker.

### **Phase 2: Backend API Development (3 Hours)**

This is the engine of our application. We'll focus on the API and the core AI logic.

* **Task 1: Database Models & API Endpoints (1 hour)**
    * Create JPA entities and repositories for `InterviewSession` and `ChatMessage`.
    * Build the REST Controller with essential endpoints:
        * `POST /api/v1/interviews`: To start a new interview.
        * `POST /api/v1/interviews/{id}/chat`: To send a user message and get the AI's response.
        * `GET /api/v1/interviews/{id}/report`: To conclude the interview and generate the final report.

* **Task 2: Gemini Integration & Prompt Engineering (2 hours)**
    * This is the most critical step. Create a `GeminiService` in Spring Boot.
    * **Main Interview Prompt:** We will design a comprehensive system prompt that commands the Gemini model to:
        1. Act as an expert Excel interviewer named 'Alex'.
        2. Follow a structured flow: introduction, 3-4 questions of increasing difficulty, and conclusion.
        3. Evaluate the user's previous answer *before* asking the next question. We'll instruct it to provide a brief, one-line evaluation (e.g., "Correct," "Partially correct," "That's not quite right").
        4. Manage the conversation history to ask relevant follow-up questions.
    * **Report Generation Prompt:** Create a second, separate prompt for the `/report` endpoint. This prompt will take the entire chat history as input and ask Gemini to generate a structured performance summary.

### **Phase 3: Frontend Development (3 Hours)**

We'll build a clean, functional chat interface.

* **Task 1: UI Components (1.5 hours)**
    * Build a main `Chat` component.
    * Create child components for the message list and the message input form.
    * Use a simple CSS framework like Tailwind CSS for quick styling to make it look professional.

* **Task 2: State Management & API Calls (1.5 hours)**
    * Use React hooks (`useState`, `useEffect`) to manage the conversation state.
    * Use `axios` to connect to the Spring Boot backend endpoints.
    * Implement the logic to start an interview, display the conversation, and fetch the final report on a separate modal or page.

### **Phase 4: Deployment & Finalization (2 Hours)**

The final push to get the project live and documented.

* **Task 1: Deployment (1.5 hours)**
    * **Backend:** Containerize the Spring Boot app with a `Dockerfile` and deploy it on a service like **Render** or **Fly.io**. We'll also provision a free-tier PostgreSQL database from one of these providers.
    * **Frontend:** Deploy the static React build to **Netlify** or **Vercel**. This is extremely fast and free.
    * Configure CORS on the backend to allow requests from the frontend domain.

* **Task 2: Testing and Documentation (0.5 hours)**
    * Conduct 2-3 full mock interviews to test the flow and generate sample transcripts.
    * Add the deployed links, sample transcripts, and setup instructions to the `README.md` and the `DESIGN.md` document.
    * Submit the repository link as the final deliverable.

## API Testing

To test the backend APIs, refer to the `apitest.txt` file. It provides a step-by-step guide using Postman, including endpoints like `POST /api/v1/interviews`, `POST /api/v1/interviews/{id}/chat`, and `GET /api/v1/interviews/{id}/report`. Run the backend locally and use Postman to validate responses and database interactions.

## Configuration

The backend configuration is managed via `application.properties`. Key variables to configure:

- `server.port=${PORT:8080}`: Dynamic port for deployment (uses environment `$PORT` if set).
- `spring.datasource.url=${SPRING_DATASOURCE_URL:...}`: JDBC URL for PostgreSQL (override with env var for deployment).
- `spring.datasource.username=${SPRING_DATASOURCE_USERNAME:...}`: DB username (e.g., `admin` for Render).
- `spring.datasource.password=${SPRING_DATASOURCE_PASSWORD:...}`: DB password (secure; use env vars).
- `spring.jpa.hibernate.ddl-auto=${SPRING_JPA_HIBERNATE_DDL_AUTO:update}`: Schema mode (update/create for dev).
- `cors.allowed-origin=${CORS_ALLOWED_ORIGIN}`: Allowed origins for CORS (update for frontend domains).
- `gemini.api.key=...`: Your Gemini API key (required for AI integration).

For local runs, update placeholders directly. For deployment, set as environment variables on Render/Vercel to avoid hardcoding secrets.
