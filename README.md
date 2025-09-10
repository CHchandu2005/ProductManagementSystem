## Product Management System

A full-stack MERN application to manage products with CRUD Operations, authentication, image uploads, filtering/sorting, and server-side pagination.

### Architecture
- **Frontend**: React + Vite, Context API for auth, CSS Modules for styling.
- **Backend**: Node.js + Express, JWT authentication middleware, Cloudinary for image storage.
- **Database**: MongoDB via Mongoose.

### Tech Stack
- React, Vite, React Context, PropTypes, react-toastify
- Node.js, Express, Mongoose, JSON Web Token
- Cloudinary (image storage)
- MongoDB (Atlas/local)

### Features
- **Authentication**
  - Admin login via email/password (from server env vars).
  - JWT issuance on login with 1h expiry.
  - Token validation endpoint: `GET /api/auth/verify` (protected) used by the client on refresh.
- **Products**
  - Create, Read, Update, Delete products.
  - Image upload to Cloudinary.
  - Rich list page with search, category filtering, price sorting.
  - Server-side pagination using `page` and `limit` query params.
  - Accessible pagination controls with Previous/Next and clickable page numbers.
- **Filtering & Sorting**
  - Search by name(case-insensitive).
  - Multi-category filter via `categories` query (comma-separated).
  - Sorting by price (asc/desc) via `sort=price&order=asc|desc`.
- **Pagination**
  - Implemented using MongoDB `.skip()` and `.limit()`.
  - API returns `page`, `limit`, `totalPages`, `totalItems`, and `products`.

---

## Project Structure
```
ProductManagementSystem/
  client/                     # React frontend (Vite)
    src/
      components/
      context/
        AuthContext.jsx       # Auth state, login/logout, token verification on refresh
      pages/
        ProductListPage/      # Listing, filtering, pagination, CRUD modals
      config/                 # (optional) removed; env used directly
    .env                      # Vite env (VITE_API_BASE_URL)
  server/                     # Node/Express backend
    models/
      Product.js              # Mongoose schema
    controllers/
      productController.js    # Listing (filters/sort/pagination), CRUD
      authController.js       # Login, verify
    routes/
      products.js             # /api/products routes
      auth.js                 # /api/auth routes
    middleware/
      auth.js                 # JWT verification middleware
      upload.js               # Multer config for file uploads
    config/
      db.js                   # MongoDB connection
      cloudinary.js           # Cloudinary configuration
```

---

## Environment Variables

### Client (Vite)
Create `client/.env`:
```
VITE_API_BASE_URL=http://localhost:5000
```

Note: Restart the Vite dev server after changing `.env`.

### Server (Express)
Create `server/.env`:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/product_management
JWT_SECRET=replace-with-strong-secret
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## Installation & Running

### 1) Backend
```
cd server
npm install
node server.js
```
This starts the API at `http://localhost:5000`.

### 2) Frontend
```
cd ../client
npm install
npm run dev
```
Open the URL shown by Vite (typically `http://localhost:5173`).

---

## Database
- Product schema (`server/models/Product.js`):
  - `name: String (required)`
  - `price: Number (required)`
  - `description: String (required)`
  - `category: String (required)`
  - `image: String (required)` – Cloudinary URL
  - `createdAt: Date (default: now)`

Indexes can be added for frequent query fields (e.g., `name`, `category`) if needed.

---

## Backend API

Base URL: `${PORT or deployment URL}` (e.g., `http://localhost:5000`)

### Auth
- `POST /api/auth/login`
  - Body: `{ email, password }`
  - Returns: `{ success: true, token }`

- `GET /api/auth/verify` (protected)
  - Headers: `Authorization: Bearer <token>`
  - Returns: `{ success: true, user }` if the token is valid.

### Products
- `GET /api/products`
  - Query Params:
    - `search` (string): case-insensitive search in name/description
    - `categories` (comma-separated string): filter by categories
    - `sort` (e.g., `price`)
    - `order` (`asc` | `desc`)
    - `page` (number, 1-based)
    - `limit` (number)
  - Response:
    ```json
    {
      "success": true,
      "page": 1,
      "limit": 5,
      "totalPages": 3,
      "totalItems": 15,
      "products": [ { ...product }, ... ]
    }
    ```

- `GET /api/products/:id`
  - Returns a single product by id.

- `POST /api/products` (protected, multipart/form-data)
  - Headers: `Authorization: Bearer <token>`
  - Body (FormData): `name`, `price`, `description`, `category`, `image` (file)
  - Creates a product with an uploaded image (Cloudinary) and returns it.

- `PUT /api/products/:id` (protected, multipart/form-data)
  - Headers: `Authorization: Bearer <token>`
  - Body: same as POST (image optional)
  - Updates and returns the product.

- `DELETE /api/products/:id` (protected)
  - Headers: `Authorization: Bearer <token>`
  - Deletes the product.

---

## Frontend Details

### Auth Flow (`client/src/context/AuthContext.jsx`)
- On login, client calls `POST /api/auth/login` and stores the JWT in `localStorage` as `auth_token`.
- On application load and whenever the token changes, client calls `GET /api/auth/verify` to validate the token. If invalid, it clears the token and logs the user out.
- `useMemo` exposes `isAuthenticated`, `token`, `login`, and `logout` to the app.

### Product List (`client/src/pages/ProductListPage/ProductListPage.jsx`)
- Reads API base URL from `VITE_API_BASE_URL`.
- Maintains state for search term, selected categories, sort option, pagination (`page`, fixed `limit` = 5), total pages/items.
- Debounced fetch runs on changes to search/filter/sort/page.
- Pagination controls: Previous/Next buttons and up to 5 numbered pages around the current page.
- CRUD actions open modals for add/edit and a confirmation modal for delete.

### Environment usage (Client)
- All requests use `const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;`

---

## Pagination, Filtering, Sorting (Backend)

Implemented in `server/controllers/productController.js`:
- Build a Mongoose query based on provided params:
  - `search` → `$or: [{ name: /term/i }, { description: /term/i }]`
  - `categories` → `{ category: { $in: [categories...] } }`
  - `sort` + `order` → `.sort({ [sortField]: order === 'desc' ? -1 : 1 })`
- Pagination:
  - Validate `page` and `limit` (default server-side values if not provided by client).
  - Compute `skip = (page - 1) * limit` and use `.skip(skip).limit(limit)`.
  - Return `page`, `limit`, `totalPages`, `totalItems`, and `products`.

---

## Centralized Error Handling
- `AppError` used on the backend to generate consistent error responses with proper HTTP status codes.
- `errorMiddleware` (if enabled in the server) should catch thrown errors and return JSON.
- Frontend displays toast notifications for failures (network/server errors).

---

## Security
- JWT signed with `JWT_SECRET` and checked by middleware for protected routes.
- Admin-only access for mutating product endpoints.
- Image upload uses Cloudinary signed configuration from server-side env vars.

---

## Testing (Manual)
1. Start MongoDB locally or set `MONGO_URI` to your cluster.
2. Start the backend, then the frontend.
3. Login with `ADMIN_EMAIL`/`ADMIN_PASSWORD`.
4. Add a product with an image, verify it appears.
5. Test search (by part of name), filter by category, and sort by price.
6. Change pages and verify counts/metadata match.
7. Edit and delete a product, confirm list updates and toasts appear.
8. Refresh the app; token should be validated automatically.

---

## Production Notes
- Set strong `JWT_SECRET` and secure admin credentials.
- Configure CORS appropriately for your deployment.
- Use a production MongoDB (Atlas), and a Cloudinary production account.
- Consider adding indexes on `name`, `category`, and `createdAt`.
- Add rate limiting and request validation for public endpoints if opened beyond admin use.

---

## Scripts
Backend (`server/package.json`):
- `npm run dev` – start server with nodemon.
- `npm start` – start server.

Frontend (`client/package.json`):
- `npm run dev` – start Vite dev server.
- `npm run build` – build for production.
- `npm run preview` – preview production build.

---

## Screenshots & Demos
- Login page:
-  admin credentials submit to `/api/auth/login`.
- <img width="1892" height="936" alt="Screenshot (313)" src="https://github.com/user-attachments/assets/f299ddc4-2e3b-4edb-a1d4-a80d6272c24d" />
- Products page: header with search, sidebar with filters/sort, grid of product cards, and pagination controls.
- Modals: add/edit product with image upload; delete confirmation.

---


