# Carb Calculator & Race Planner

A minimalist React + Vite + TailwindCSS single-page app for endurance athletes to plan carbohydrate intake during training or racing.

## Features

Carb/hour Calculator

- Enter total duration and target carbs per hour
- Instantly calculates total carbs needed
- Displays per-hour breakdown, including the final partial hour
- Simple, clean, and fast interface
- Export breakdown as .csv

Race Day Planner

- Choose between Half Marathon, Marathon, Olympic, 70.3, Ironman
- Enter expected pace/speed for each segment and target g/hour
- Automatically calculates duration and total carbs for each discipline
- Provides full interval breakdown and timing suggestions
- Optional micro-interval timing (e.g., every 10–30 minutes)
- CSV export for both breakdown and timing plan

---

## Tech Stack

- React 18
- Vite
- TailwindCSS
- Fully client-side (no backend)
- Responsive layout and dark mode–ready

---

## Setup & Development

1. Clone the repository
   git clone [https://github.com/yourusername/carb-calculator.git](https://github.com/yourusername/carb-calculator.git)
   cd carb-calculator

2. Install dependencies
   npm install

3. Run the development server
   npm run dev

Then open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Build

npm run build

Production files will be generated in the dist/ folder.

---

## Folder Structure

src/
├─ components/
│ ├─ BreakdownTable.jsx
│ ├─ IntakeSchedule.jsx
│ └─ RacePlanner.jsx
├─ utils/
│ └─ time.js
├─ App.jsx
├─ index.css
└─ main.jsx

---

## Notes

- All calculations are linear (total carbs = duration × g/hour ÷ 3600).
- Units are simplified (grams only — no product library).
- Designed for quick planning before training or race day.

---

## Future Ideas

- Save/load templates locally
- Hydration & electrolyte planner
- Race checklist export
- Mobile-friendly live timer for training sessions

---

Author: Kristian Borisov
Built for endurance athletes and triathletes planning their fuel strategy.
