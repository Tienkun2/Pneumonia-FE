# Setup Instructions

## Installation

1. Install dependencies:
```bash
npm install
```

## Environment Variables

Create a `.env.local` file in the root directory:

```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Build

Build for production:

```bash
npm run build
```

Start production server:

```bash
npm start
```

## Project Structure

```
FE/
├── src/
│   ├── app/              # Next.js App Router pages
│   ├── components/       # Reusable components
│   │   ├── ui/          # Shadcn/UI components
│   │   └── layout/       # Layout components
│   ├── features/        # Feature modules
│   │   ├── dashboard/
│   │   ├── diagnosis/
│   │   ├── patients/
│   │   ├── results/
│   │   └── knowledge/
│   ├── lib/             # Utilities and API
│   ├── store/           # Redux store
│   └── types/           # TypeScript types
├── public/              # Static assets
└── package.json
```

## Features Implemented

✅ Dashboard with stats and charts
✅ Patient management (list and detail views)
✅ Multi-step diagnosis form
✅ Results view with risk assessment
✅ Medical knowledge base
✅ Settings page
✅ Responsive sidebar navigation
✅ Redux state management
✅ Form validation with React Hook Form + Zod

## Next Steps

1. Connect to backend API endpoints
2. Implement authentication
3. Add image viewer for DICOM files
4. Enhance error handling
5. Add loading states
6. Implement pagination for patient list
7. Add search and filtering
