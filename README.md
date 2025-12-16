# Hackathon of Hackathons: AI Civic Tutor

An immersive educational platform designed to teach users about anti-corruption policies, laws, and civic duties through a gamified 3D interface and an interactive AI Tutor.

## 🌟 Overview

**Hackathon of Hackathons** (Civic Realm) combines modern web technologies with advanced AI agents to create an engaging learning experience. Users explore different "worlds" (Policy World, Law World, Theatre world), complete quizzes, and interact with **Grace**, an AI voice assistant powered by OpenAI's Realtime API, to deepen their understanding of civic concepts.

## 🏗️ Architecture

The project is divided into a frontend application and two specialized backend agents:

*   **Frontend**: A React + TypeScript + Vite application responding to user interactions, rendering the 3D map, and managing the UI.
*   **Backend**:
    *   **SpeechAgent** (`backend/SpeechAgent`): Handles real-time voice interactions, Speech-to-Text (STT), Text-to-Speech (TTS), and voice-driven RAG (Retrieval-Augmented Generation) queries.
    *   **TeacherAgent** (`backend/TeacherAgent`): Manages specialized tasks like Quiz Analysis, Reflection Grading, and text-based Q&A using specific pedagogical styles.

## 🚀 Getting Started

### Prerequisites

*   **Node.js** (v18 or higher)
*   **Python** (3.10 or higher)
*   **OpenAI API Key** (with access to `gpt-4o`, `realtime-preview` models)

### 1. Backend Setup

The backend consists of two agents that run on separate ports. You will need a `.env` file in the `backend/` directory to configure them.

1.  **Create Configuration**:
    Create a file named `.env` in the `backend/` directory with the following content:
    ```env
    OPENAI_API_KEY=your_openai_api_key_here
    VECTOR_STORE_ID=your_openai_vector_store_id
    # Optional: Custom Assistant ID if you have an existing one
    # KB_ASSISTANT_ID=...
    ```

2.  **Install Dependencies**:
    You will need to install the required Python packages for both agents.
    ```bash
    pip install fastapi uvicorn openai websockets python-dotenv pydantic
    ```
    *(Note: If the project has virtual environments set up in `backend/SpeechAgent/venv` and `backend/TeacherAgent/venv`, activate them before installing).*

### 2. Frontend Setup

1.  Navigate to the frontend directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```

## 🏃‍♂️ Running the Application

You will need **three separate terminal windows** to run the full solution.

#### Terminal 1: Speech Agent
This agent handles the voice interface (Grace).
```bash
cd backend/SpeechAgent
# Activate venv if using one
uvicorn main:app --reload --port 8000
```

#### Terminal 2: Teacher Agent
This agent handles quizzes and logic analysis.
```bash
cd backend/TeacherAgent
# Activate venv if using one
uvicorn agent:app --reload --port 8001
```

#### Terminal 3: Frontend
Starts the React development server.
```bash
cd frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) (or the URL shown in the terminal) to view the application.

## ✨ Key Features

*   **🗺️ Map Exploration**: Navigate between Policy World and Law World and theatre World
*   **🤖 Grace (AI Tutor)**: Have natural voice conversations with an AI (gracie) that knows the course material.
*   **📝 Interactive Quizzes**: Take quizzes with instant feedback. The Teacher Agent analyzes your mistakes and provides personalized explanations.
*   **💭 Reflection Analysis**: Write about corruption scenarios and get graded on your analysis of actors, harms, and breached duties.
*   **🎨 Dynamic UI**: A polished, "wow-factor" design with animations and responsive layouts.

## 🔧 Technologies

*   **Frontend**: React, TypeScript, Vite, CSS Modules.
*   **Backend**: Python, FastAPI, Uvicorn.
*   **AI**: OpenAI API (GPT-4o, Realtime API, Assistants API, Vector Stores).
