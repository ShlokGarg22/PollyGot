# PollyGot

PollyGot is an interactive language learning application that uses OpenAI's GPT-4 model to evaluate translations and provide feedback. Users can input an English sentence, select a target language, and submit their translation attempt to receive a score, reference translation, and feedback.

## Features
- Translate English sentences into supported languages.
- Get instant feedback on your translation attempts.
- Scores translations from 0 to 100.
- Provides reference translations and constructive feedback.

## Prerequisites
- Node.js (v16 or higher recommended)
- An OpenAI API key

## Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/ShlokGarg22/PollyGot.git
   cd PollyGot
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory and add your OpenAI API key:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   ```

## Usage
1. Start the server:
   ```bash
   npm start
   ```
2. Open `index.html` in your browser or use a static server (e.g., Five Server).
3. Interact with the app by entering an English sentence, selecting a target language, and submitting your translation.

## API Endpoints
### `POST /api/check`
- **Description:** Evaluates the user's translation attempt.
- **Request Body:**
  ```json
  {
    "english": "The English sentence",
    "attempt": "User's translation",
    "lang": "Target language"
  }
  ```
- **Response:**
  ```json
  {
    "is_correct": true,
    "score": 85,
    "reference_translation": "La traduction de référence",
    "feedback": "Good attempt, but consider revising the verb tense."
  }
  ```

## License
This project is licensed under the MIT License.
