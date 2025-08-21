# Atlas - Exa Spotlight Demo (Next.js)

A modern Next.js application demonstrating Exa search, similarity, and answer endpoints.

## Features

- **Search**: Query Exa with optional domain filters and recency windows
- **Similar Pages**: Find pages similar to a provided URL
- **Question Answering**: Use Exa to answer natural language questions with citations
- **Combined Query**: Single search box that returns both answers and search results
- **Modern UI**: Built with Next.js, React, and Tailwind CSS

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **API**: Exa AI Search API
- **Deployment**: Vercel-ready

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Exa API key (get one at [exa.ai](https://exa.ai))

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Atlas
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory:
```bash
EXA_API_KEY=your_exa_api_key_here
```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Endpoints

The application provides the following API routes:

- `POST /api/query` - Combined search and answer endpoint
- `POST /api/search` - Advanced search with filters
- `POST /api/answer` - Question answering
- `POST /api/similar` - Find similar pages
- `GET /api/health` - Health check

## Project Structure

```
Atlas/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── SearchForm.tsx     # Search input form
│   └── CombinedResults.tsx # Results display
├── public/               # Static assets
├── .env.local           # Environment variables
├── next.config.js       # Next.js configuration
├── package.json         # Dependencies
├── tailwind.config.js   # Tailwind CSS configuration
└── tsconfig.json        # TypeScript configuration
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Environment Variables

- `EXA_API_KEY` - Your Exa API key (required)

## Deployment

This application is ready to deploy on Vercel:

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add your `EXA_API_KEY` environment variable in Vercel
4. Deploy!

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
