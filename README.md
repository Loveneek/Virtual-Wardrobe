# 👕 Virtual Wardrobe — AI Try-On App

> A full-stack web app that lets users digitally try on clothing using AI — upload a photo of yourself and a clothing item, and get back a realistic composite image of you wearing it.

---

## 📌 Overview

Virtual Wardrobe is a full-stack application that combines computer vision and generative AI to power a digital closet and virtual try-on experience:

1. Users register/login and upload a profile photo
2. Users upload a photo of a clothing item via the dashboard
3. **Google Gemini** automatically classifies it (category + body part)
4. The item is stored in the user's personal digital wardrobe, viewable in a grid UI
5. Users select clothing items from their wardrobe, and **Replicate's IDM-VTON model** generates a realistic try-on composite image
6. Results are stored and viewable per user, with full CRUD on wardrobe items

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS |
| Backend Language | Java 25 |
| Backend Framework | Spring Boot 4 |
| Security | Spring Security + JWT (jjwt) |
| Database | MySQL + Spring Data JPA |
| AI — Image Classification | Google Gemini 2.5 Flash |
| AI — Virtual Try-On | Replicate (IDM-VTON model) |
| Image Hosting | Cloudinary |
| HTTP Client | Axios |
| Build Tools | Maven (backend), npm (frontend) |

---

## 🏗️ Architecture

```
┌──────────────────────┐
│   Next.js Frontend    │
│  (React + TypeScript) │
│                        │
│  Login / Register      │
│  Dashboard (Wardrobe   │
│  Grid, Upload, Try-On) │
└──────────┬─────────────┘
           │  Axios (JWT Bearer)
           ▼
┌──────────────────────────────────────────┐
│              Spring Boot API              │
│                                            │
│  /api/auth      → JWT register/login      │
│  /api/clothing   → CRUD + AI classification│
│  /api/tryon      → AI try-on generation   │
│  /api/category   → category management   │
└──────────────────────────────────────────┘
        │              │              │
        ▼              ▼              ▼
   MySQL DB      Cloudinary       External AI APIs
  (users, items,  (image          (Gemini, Replicate)
   try-on history) storage)
```

Each backend domain (`auth`, `user`, `category`, `clothing`, `tryon`) follows a clean layered structure — `Controller → Service → Repository` — with shared integrations (`CloudinaryService`, `GeminiService`, `ReplicateService`) isolated under `shared/`. The frontend mirrors this with a `context/AuthContext` for global auth state and dedicated components for each wardrobe feature (`WardrobeGrid`, `UploadModal`, `TryOnSelector`, `TryOnResultModal`).

---

## 🔐 Authentication

JWT-based authentication. Every protected endpoint requires a `Bearer` token obtained from `/api/auth/login`.

```
POST /api/auth/register   → create account, returns JWT
POST /api/auth/login      → authenticate, returns JWT
```

---

## 📡 API Endpoints

### Clothing
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/clothing/detect-category` | Upload an image → Gemini AI returns predicted category + body part |
| `POST` | `/api/clothing` | Upload and save a new clothing item |
| `GET` | `/api/clothing` | List the authenticated user's clothing (optionally filtered by category) |
| `GET` | `/api/clothing/{id}` | Get a single clothing item |
| `PUT` | `/api/clothing/{id}` | Update a clothing item |
| `DELETE` | `/api/clothing/{id}` | Delete a clothing item |

### Try-On
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/tryon` | Run AI try-on with the user's profile photo + selected clothing item(s) |
| `GET` | `/api/tryon` | Retrieve the user's past try-on results |
| `DELETE` | `/api/tryon/{id}` | Delete a try-on result |

### Category
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` / `POST` | `/api/category` | Manage clothing categories |

---

## 🤖 How the AI Pipeline Works

**1. Auto-classification (Gemini)**
When a user uploads a clothing photo, the image is base64-encoded and sent to Gemini 2.5 Flash with a structured prompt asking it to classify the garment into a category (Shirts, T-Shirts, Pants, Shoes, Jackets) and body part (upper_body, lower_body, footwear). The response is parsed as strict JSON.

**2. Virtual try-on (Replicate / IDM-VTON)**
The user's profile photo and a clothing item's image are sent to Replicate's IDM-VTON model along with the detected body part category. The model generates a photorealistic image of the person wearing that item. For multi-item try-ons, the output image is chained as the input for the next item, allowing layered outfit composition.

---

## ⚙️ How to Run Locally

**1. Clone the repo**
```bash
git clone https://github.com/Loveneek/Virtual-Wardrobe
cd Virtual-Wardrobe/Backend
```

**2. Configure environment variables**

Create `src/main/resources/application.properties` (or use environment variables) with:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/virtual_wardrobe
spring.datasource.username=your_mysql_user
spring.datasource.password=your_mysql_password

google.gemini.api.key=your_gemini_api_key
replicate.api.token=your_replicate_api_token

cloudinary.cloud_name=your_cloudinary_name
cloudinary.api_key=your_cloudinary_key
cloudinary.api_secret=your_cloudinary_secret

jwt.secret=your_jwt_secret
```

**3. Run with Maven**
```bash
./mvnw spring-boot:run
```

Backend API will be available at `http://localhost:8080`

**4. Run the frontend**
```bash
cd ../frontend
npm install
npm run dev
```

Frontend will be available at `http://localhost:3000`

---

## 📁 Project Structure

```
Virtual-Wardrobe/
├── Backend/
│   └── src/main/java/com/virtualtryon/Backend/
│       ├── auth/          # JWT auth, login/register
│       ├── user/          # User entity, profile management
│       ├── category/      # Clothing category CRUD
│       ├── clothing/       # Clothing item CRUD + AI classification
│       ├── tryon/          # AI try-on generation and history
│       └── shared/
│           ├── cloudinary/  # Image upload/storage service
│           ├── gemini/      # Google Gemini classification service
│           └── replicate/   # Replicate IDM-VTON try-on service
└── frontend/
    ├── app/
    │   ├── login/          # Login page
    │   ├── register/       # Registration page
    │   └── dashboard/      # Main wardrobe + try-on dashboard
    ├── components/
    │   ├── Navbar.tsx
    │   ├── WardrobeGrid.tsx     # Grid view of user's clothing items
    │   ├── UploadModal.tsx      # Upload + AI-classify new items
    │   ├── TryOnSelector.tsx    # Select items to try on
    │   └── TryOnResultModal.tsx # Display AI try-on results
    └── context/
        └── AuthContext.tsx      # Global JWT auth state
```

---

## 🔮 Future Improvements

- Deploy backend to a cloud host (Render/Railway) with a managed MySQL instance, and frontend to Vercel
- Add outfit-level try-on (multiple garments composited in one request, already partially supported in `TryOnService`)
- Add async/polling support for long-running Replicate predictions with a loading state in the UI
- Write integration tests for the AI service layer and frontend component tests
- Add wardrobe filtering/search and outfit history page

---

## 👨‍💻 Author

**Loveneek Singh**  
Software Engineering Student — York University (2027)  
📧 singhloveneek8@gmail.com  
🔗 [GitHub](https://github.com/Loveneek)