# 🧪 Scientific Lab Equipment Ordering & Management System (Microproject)

## 📌 Overview

The **Scientific Lab Equipment Ordering & Management System** is a real-world, production-ready web application designed to digitize and automate the complete workflow of **laboratory equipment procurement, order management, and administrative control**.

This project addresses practical problems faced by laboratories, research institutes, and educational organizations where manual ordering and tracking cause inefficiency, errors, and delays.

> ⚠️ **Patent Applied**  
> This system is part of an original workflow-based solution intended for commercialization.  
> A patent application has already been filed with the Government.

---

## 🎯 Problem Statement

Traditional lab procurement systems suffer from:

- Manual order handling  
- No centralized order tracking  
- Lack of cancellation and approval workflows  
- Poor communication between users and vendors  
- No role-based access (user vs admin)  
- Inefficient customer support handling  

This project solves these issues using a **secure, role-based, workflow-driven digital platform**.

---

## 🚀 Key Features

### 👤 User Features
- User Registration & Secure Login
- Browse Products and Chemicals
- Cart Management (stored in browser localStorage)
- Place Orders (login required)
- View Order History
- Cancel Orders with Reason
- Contact Admin via Email (no database storage)

### 🛠️ Admin Features
- Secure Admin Login
- View All Orders from All Users
- Approve Orders
- Change Order Status:
  - `Pending → Dispatched`
- Monitor Cancellations
- Centralized Administrative Control

---

## 🔄 Complete Workflow

### User Workflow
1. User visits the website  
2. Browses products and adds items to cart (without login)  
3. Clicks **Buy Now**  
4. If not logged in → redirected to Login  
5. After login → redirected back to Cart  
6. Order placed and stored in database  
7. User can:
   - View order status
   - Cancel order with a reason  

### Admin Workflow
1. Admin logs in  
2. Views all orders  
3. Approves orders  
4. Order status updates to **Dispatched**  
5. Users see updated status instantly  

---

## 🧱 System Architecture
Client (Browser)
│
├── HTML / CSS / JavaScript
│ ├── Cart (localStorage)
│ ├── Orders Page
│ └── Admin Panel
│
├── Flask Backend (Python)
│ ├── Authentication
│ ├── Session Management
│ ├── Order APIs
│ ├── Cancel APIs
│ ├── Admin Approval APIs
│ └── Contact Email Service
│
├── PostgreSQL Database (Render)
│ ├── register
│ ├── orders
│ └── cancelled_orders
│
└── Render Cloud Hosting
