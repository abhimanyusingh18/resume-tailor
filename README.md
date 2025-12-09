# AI Resume Tailor

AI Resume Tailor is a Next.js application designed to help job seekers optimize their resumes for specific job descriptions. By leveraging the power of Google's Gemini AI, it analyzes your existing resume (PDF or text) against a provided job description and rewrites it to highlight relevant skills and experiences, improving your chances of getting noticed by recruiters and ATS systems.

## Features

-   **PDF Parsing**: Upload your existing PDF resume directly.
-   **AI-Powered Tailoring**: Uses Google's Gemini 2.0 Flash model to rewrite resume content.
-   **Job Description Analysis**: specific customization based on the target role.
-   **Instant Preview**: See the tailored resume immediately in the browser.
-   **PDF Export**: Download the polished, tailored resume as a clean, ATS-friendly PDF.
-   **Privacy Focused**: Your data is processed for the session and not permanently stored.

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Ensure you have the following installed:

-   [Node.js](https://nodejs.org/) (v18 or higher recommended)
-   npm (comes with Node.js) or yarn/pnpm/bun

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/abhimanyusingh18/resume-tailor.git
    cd resume-tailor
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```

3.  **Environment Setup:**

    You need a Google Gemini API key to run this project.
    
    1.  Get an API key from [Google AI Studio](https://aistudio.google.com/).
    2.  Create a `.env.local` file in the root directory.
    3.  Add your API key:

    ```env
    GEMINI_API_KEY=your_api_key_here
    ```

### Running the Application

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Building and Deploying

To create a production build:

```bash
npm run build
```

To run the production build locally:

```bash
npm run start
```

### Deployment

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Contributing

Contributions are always welcome! If you have ideas for improvements or new features, please follow these steps:

1.  **Fork the Project**
2.  **Create your Feature Branch** (`git checkout -b feature/AmazingFeature`)
3.  **Commit your Changes** (`git commit -m 'Add some AmazingFeature'`)
4.  **Push to the Branch** (`git push origin feature/AmazingFeature`)
5.  **Open a Pull Request**

Please ensure your code follows the existing style and conventions.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
