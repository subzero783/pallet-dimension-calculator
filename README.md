# Pallet Dimension Calculator & Crating Build System

An industrial-grade web application engineered for shipping, crating, and manufacturing departments to compute precise custom pallet specifications, lumber cut lists, fastener requirements, and interactive 2D/3D CAD visual diagrams from product payload dimensions.

---

## Overview

In industrial manufacturing and marine crating (e.g., **Pacific Maritime Industries Corp.**), standard 48" × 40" GMA pallets are frequently insufficient for custom machinery, lockers, electrical enclosures, and turbine equipment. 

The **Pallet Dimension Calculator** bridges the gap between engineering CAD product dimensions and shipping floor sawyers by:
1. Converting CAD dimensions (Length, Width, Height, Weight) into pallet dimensions with customizable clearance allowances (defaulting to 2 inches).
2. Spacing uniform top and bottom deckboards evenly across the pallet length based on a selectable 3"–5" uniform gap or an omitted flush (0" gap) configuration.
3. Supporting heavy-duty reinforcement via a toggle between **1-piece standard runners** (3 pieces total: 1 left, 1 center, 1 right) for lighter loads and **2-pieces doubled sistered runners** (6 pieces total: 2 left, 2 center, 2 right) for heavy industrial loads.
4. Generating an itemized wood cut list with nominal and actual lumber dimensions, board feet (BF), estimated tare weight, and fastener counts.
5. Providing an interactive 3-mode visualizer: **Isometric 3D**, **Top CAD Blueprint** (with flush zero-gap rendering and dimension callouts), and **Elevation Side View** with accurate cumulative stack height.
6. Offering dedicated routing for shop-floor operators (`/pacmaritime`) with Job ID and Employee ID logging, alongside a password-protected **Supervisor Dashboard** (`/supervisor`).

---

## Key Features

### 1. Dimension & Engineering Engine
- **Configurable Clearance Allowances:** Defaults to 2.0" length and width clearance allowances over CAD product dimensions.
- **Uniform Deckboard Distribution:** Evenly distributes top and bottom boards across the pallet length. Lead boards have been eliminated in favor of continuous, uniform spacing.
- **Selectable Board Gaps:** Select 3.0", 3.5", 4.0", 4.5", 5.0", or **Omit Gap (0")** for continuous, flush decking.
- **Middle Support Runners:**
  - **1 Piece (3 Pieces Total):** Standard support for light items (1 left, 1 middle, 1 right).
  - **2 Pieces Doubled (6 Pieces Total):** Heavy-duty sistered support for heavy items (2 left, 2 middle, 2 right, touching side-by-side).
- **Lumber Specifications:** Computes nominal vs. actual dimensions for:
  - Deckboards: `1x4` (0.75" × 3.5") and `1x6` (0.75" × 5.5")
  - Runners/Stringers: `2x4` (1.5" × 3.5") and `4x4` (3.5" × 3.5")
- **Metrics Calculation:**
  - Board Feet ($BF = \frac{T_{nominal} \times W_{nominal} \times L}{144} \times Qty$)
  - Fastener nail count (3 spiral nails per deckboard-stringer junction)
  - Estimated tare weight based on lumber density (2.85 lbs/BF) and fasteners
  - Max safe distributed load capacity based on lumber span ratings

### 2. Itemized Wood Cut List
- Clean 3-tier cut sheet for shipping floor sawyers:
  1. **Top Boards:** Quantity, nominal spec, and actual thickness × width × cut length.
  2. **Middle Wood Pieces / Runners:** Quantity (3 or 6 pieces), nominal spec, and actual dimensions.
  3. **Bottom Boards:** Quantity, nominal spec, and actual cut dimensions.
- Quick actions: **Copy to Clipboard**, **Export CSV**, and **Print Cut Sheet**.

### 3. Interactive CAD Visualizer
- **Isometric 3D View:** Real-time 3D rendering with floor shadow, uniform bottom boards, runners, top deckboards, CAD product bounding box, front Width dimension line, receding Length dimension line, and vertical height stack callouts.
- **Top CAD Blueprint:** 2D top-down technical drafting view with dimension callouts (`W"` and `L"`), dotted base board footprints, sistered runner flush rendering, and flush zero-gap top deckboards when gap is omitted.
- **Elevation Side View:** End/side profile view displaying base boards, runner profiles, top deck surface, and cumulative vertical stack calculation ($H_{pallet} + H_{product} = H_{total}$).

### 4. Shop Floor & Supervisor Portals
- **`/pacmaritime` (Dedicated Station):** Tailored for Pacific Maritime Industries Corp. Shipping Floor Station. Requires `jobId`, `employeeId`, and `employeeFirstName` before saving to plant register.
- **`/calculator`:** General-purpose industrial crating calculator.
- **`/supervisor`:** Protected portal featuring operational KPI cards, real-time job registry, search and status filtering, and expandable job drawers.
- **Authentication:** JWT-based cookie sessions with environment-driven supervisor credentials and fallback authentication.

---

## Tech Stack

- **Framework:** [Next.js 15 (App Router)](https://nextjs.org/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **State Management:** [Redux Toolkit](https://redux-toolkit.js.org/) + `react-redux`
- **UI & Styling:** Vanilla CSS Design System with dark industrial glassmorphism and responsive layouts
- **Icons:** [Lucide React](https://lucide.dev/)
- **Database & Storage:** [Mongoose](https://mongoosejs.com/) (MongoDB) with automatic In-Memory Store fallback when offline
- **Authentication & Security:** [Jose](https://github.com/panva/jose) (JWT) + [Argon2](https://github.com/ranisalt/node-argon2)
- **Testing:** [Vitest](https://vitest.dev/) + React Testing Library + JSDOM

---

## Project Structure

```text
pallet-dimension-calculator/
├── app/
│   ├── api/
│   │   ├── auth/          # Login, logout, register, me endpoints
│   │   ├── calculate/     # Pallet calculation POST route
│   │   └── work-orders/   # Work orders CRUD API
│   ├── calculator/        # General calculator route
│   ├── history/           # Work order history listing
│   ├── login/             # Authentication & supervisor login portal
│   ├── pacmaritime/       # Dedicated Pacific Maritime Industries Corp. route
│   ├── supervisor/        # Supervisor inspection dashboard
│   ├── globals.css        # Global design tokens and styles
│   ├── layout.tsx         # Root layout with Redux & Toast providers
│   └── page.tsx           # Landing page
├── components/
│   ├── CutListTable.tsx   # Itemized wood cut sheet & metrics
│   ├── Navbar.tsx         # Top navigation bar
│   ├── PalletCalculator.tsx # Core interactive calculator component
│   └── PalletDiagram.tsx  # Interactive SVG CAD Visualizer (3D/Top/Side)
├── context/
│   └── ToastContext.tsx   # Floating notification toast system
├── lib/
│   ├── auth.ts            # JWT signing, verification, and session management
│   ├── db.ts              # MongoDB Mongoose connection handler
│   ├── memoryStore.ts     # In-memory storage fallback for offline/testing
│   └── palletEngine.ts    # Mathematical & lumber cut list calculation engine
├── models/
│   ├── User.ts            # User Mongoose schema
│   └── WorkOrder.ts       # Work order & calculation result schema
├── store/
│   ├── index.ts           # Redux store configuration
│   └── slices/
│       ├── calculatorSlice.ts # Active calculator state & actions
│       ├── authSlice.ts       # User session state
│       └── workOrderSlice.ts  # Work orders async thunks & state
└── vitest.config.ts       # Unit testing configuration
```

---

## Getting Started

### Prerequisites
- **Node.js:** v18.18.0 or higher (v20+ recommended)
- **npm:** v9+
- *(Optional)* **MongoDB:** Local instance or MongoDB Atlas URI (if unavailable, the application automatically uses an in-memory store).

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/subzero783/pallet-dimension-calculator.git
   cd pallet-dimension-calculator
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` to customize credentials if desired:
   ```env
   MONGODB_URI=mongodb://localhost:27017/pallet_calculator
   JWT_SECRET=production_super_secret_jwt_key_at_least_32_chars_long_12345
   NODE_ENV=development
   SUPERVISOR_USERNAME=oliver
   SUPERVISOR_PASSWORD=supervisor2026!
   SUPERVISOR_NAME=Oliver
   ```

---

## Running the Application

### Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

- **Pacific Maritime Station:** [http://localhost:3000/pacmaritime](http://localhost:3000/pacmaritime)
- **Standard Calculator:** [http://localhost:3000/calculator](http://localhost:3000/calculator)
- **Supervisor Login:** [http://localhost:3000/login](http://localhost:3000/login) (Log in with `oliver` / `supervisor2026!`)
- **Supervisor Dashboard:** [http://localhost:3000/supervisor](http://localhost:3000/supervisor)

### Production Build
```bash
npm run build
npm run start
```

---

## Running Tests

Run the full automated unit test suite with Vitest:
```bash
npm test
```

To run tests in watch mode during development:
```bash
npm run test:watch
```

To verify TypeScript types without emitting files:
```bash
npm run type-check
```

---

## Engineering Formulas & Standards

### 1. Board Feet (BF) Formula
$$\text{Board Feet} = \frac{\text{Thickness (nominal in)} \times \text{Width (nominal in)} \times \text{Length (in)}}{144} \times \text{Quantity}$$

### 2. Deckboard Spacing
Given pallet length $L$, board width $W_{board}$, and target maximum gap $G_{target}$:
$$N = \max\left(2, \left\lceil \frac{L - G_{target}}{W_{board} + G_{target}} \right\rceil + 1\right)$$
$$\text{Actual Gap} = \frac{L - N \times W_{board}}{N - 1}$$
When the gap is omitted ($G_{target} \le 0$):
$$N = \max\left(2, \left\lfloor \frac{L}{W_{board}} \right\rfloor\right), \quad \text{Actual Gap} = 0.0\text{"}$$

### 3. Cumulative Vertical Stack Height
$$\text{Stack Height} = T_{\text{bottom boards}} + H_{\text{stringers}} + T_{\text{top boards}} + H_{\text{CAD product}}$$
For standard 0.75" decking and 2x4 upright stringers (3.5"):
$$\text{Pallet Height} = 0.75\text{"} + 3.5\text{"} + 0.75\text{"} = 5.0\text{"}$$

---

## License

This project is licensed under the MIT License - see the repository details for full license terms.
