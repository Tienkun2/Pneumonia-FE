# Clinical Decision Support System - Frontend

A Next.js 15 application for pneumonia diagnosis support using AI.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Shadcn/UI (Radix Primitives)
- **State Management**: Redux Toolkit
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts
- **Icons**: Lucide React
- **Data Fetching**: TanStack Query
- **HTTP Client**: Axios

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                  # Next.js App Router
├── components/
│   ├── ui/               # Shadcn UI components
│   ├── layout/           # Layout components (Header, Sidebar)
│   └── common/           # Shared components
├── features/             # Feature-based modules
│   ├── dashboard/
│   ├── diagnosis/
│   ├── patients/
│   ├── results/
│   └── knowledge/
├── lib/                  # Utils, axios instance
├── store/                # Redux store
└── types/                # Global types
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
