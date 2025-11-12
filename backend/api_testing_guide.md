# Driving School Management System - API Testing Guide

## Base URL
```
http://localhost:5000/api/v1
```

## Authentication
All protected routes require a Bearer token in the Authorization header:
```
Authorization: Bearer generated_token
```

---

## 1. Authentication Endpoints

### 1.1 Register Admin
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "password123",
  "role": "admin"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "admin",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
  }
}
```

### 1.2 Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "password123"
}
```

### 1.3 Get Current User
```http
GET /api/v1/auth/me
Authorization: Bearer YOUR_TOKEN
```

### 1.4 Update Password
```http
PUT /api/v1/auth/updatepassword
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "currentPassword": "password123",
  "newPassword": "newpassword123"
}
```

### 1.5 Logout
```http
POST /api/v1/auth/logout
Authorization: Bearer YOUR_TOKEN
```

---

## 2. Student Endpoints

### 2.1 Get All Students (with pagination & filters)
```http
GET /api/v1/students?page=1&limit=10&licenseType=B&search=john
Authorization: Bearer YOUR_TOKEN
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `licenseType`: Filter by license type (A, B, C, D)
- `search`: Search in name, email, phone
- `sortBy`: Sort field (e.g., name, -registrationDate)

### 2.2 Get Single Student
```http
GET /api/v1/students/:id
Authorization: Bearer YOUR_TOKEN
```

### 2.3 Create Student
```http
POST /api/v1/students
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "address": "123 Main St, City",
  "licenseType": "B",
  "dateOfBirth": "2000-01-15"
}
```

### 2.4 Update Student
```http
PUT /api/v1/students/:id
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "name": "John Doe Updated",
  "status": "active"
}
```

### 2.5 Delete Student
```http
DELETE /api/v1/students/:id
Authorization: Bearer YOUR_TOKEN
```

### 2.6 Get Student Statistics
```http
GET /api/v1/students/stats
Authorization: Bearer YOUR_TOKEN
```

---

## 3. Instructor Endpoints

### 3.1 Get All Instructors
```http
GET /api/v1/instructors?page=1&limit=10&minExperience=5
Authorization: Bearer YOUR_TOKEN
```

### 3.2 Get Single Instructor
```http
GET /api/v1/instructors/:id
Authorization: Bearer YOUR_TOKEN
```

### 3.3 Create Instructor
```http
POST /api/v1/instructors
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "0987654321",
  "experienceYears": 5,
  "certifications": [
    {
      "name": "Advanced Driving Instructor",
      "issueDate": "2020-01-01",
      "expiryDate": "2025-01-01"
    }
  ]
}
```

### 3.4 Update Instructor
```http
PUT /api/v1/instructors/:id
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "experienceYears": 6,
  "status": "active"
}
```

### 3.5 Delete Instructor
```http
DELETE /api/v1/instructors/:id
Authorization: Bearer YOUR_TOKEN
```

### 3.6 Get Instructor Schedule
```http
GET /api/v1/instructors/:id/schedule
Authorization: Bearer YOUR_TOKEN
```

---

## 4. Vehicle Endpoints

### 4.1 Get All Vehicles
```http
GET /api/v1/vehicles?status=available&minYear=2020
Authorization: Bearer YOUR_TOKEN
```

### 4.2 Get Single Vehicle
```http
GET /api/v1/vehicles/:id
Authorization: Bearer YOUR_TOKEN
```

### 4.3 Create Vehicle
```http
POST /api/v1/vehicles
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "plateNumber": "ABC123",
  "model": "Toyota Corolla",
  "manufacturer": "Toyota",
  "year": 2022,
  "status": "available",
  "fuelType": "petrol",
  "transmission": "manual",
  "capacity": 5
}
```

### 4.4 Update Vehicle
```http
PUT /api/v1/vehicles/:id
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "status": "maintenance",
  "mileage": 50000
}
```

### 4.5 Delete Vehicle
```http
DELETE /api/v1/vehicles/:id
Authorization: Bearer YOUR_TOKEN
```

### 4.6 Check Vehicle Availability
```http
GET /api/v1/vehicles/:id/availability?date=2025-01-15
Authorization: Bearer YOUR_TOKEN
```

### 4.7 Get Maintenance History
```http
GET /api/v1/vehicles/:id/maintenance
Authorization: Bearer YOUR_TOKEN
```

### 4.8 Add Maintenance Record
```http
POST /api/v1/vehicles/:id/maintenance
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "type": "oil-change",
  "description": "Regular oil change service",
  "cost": 150,
  "nextMaintenanceDate": "2025-04-15"
}
```

### 4.9 Get Vehicle Statistics
```http
GET /api/v1/vehicles/stats
Authorization: Bearer YOUR_TOKEN
```

---

## 5. Lesson Endpoints

### 5.1 Get All Lessons
```http
GET /api/v1/lessons?status=scheduled&startDate=2025-01-01&endDate=2025-01-31
Authorization: Bearer YOUR_TOKEN
```

**Query Parameters:**
- `status`: Filter by status (scheduled, completed, cancelled)
- `studentId`: Filter by student
- `instructorId`: Filter by instructor
- `vehicleId`: Filter by vehicle
- `startDate`: Start date filter
- `endDate`: End date filter

### 5.2 Get Single Lesson
```http
GET /api/v1/lessons/:id
Authorization: Bearer YOUR_TOKEN
```

### 5.3 Schedule Lesson
```http
POST /api/v1/lessons
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "studentId": "STUDENT_ID",
  "instructorId": "INSTRUCTOR_ID",
  "vehicleId": "VEHICLE_ID",
  "date": "2025-01-15",
  "time": "10:00",
  "duration": 60,
  "lessonType": "practical",
  "location": "School parking lot"
}
```

### 5.4 Update Lesson
```http
PUT /api/v1/lessons/:id
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "date": "2025-01-16",
  "time": "14:00",
  "notes": "Student requested time change"
}
```

### 5.5 Cancel Lesson
```http
DELETE /api/v1/lessons/:id
Authorization: Bearer YOUR_TOKEN
```

### 5.6 Check Availability
```http
POST /api/v1/lessons/check-availability
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "instructorId": "INSTRUCTOR_ID",
  "vehicleId": "VEHICLE_ID",
  "date": "2025-01-15",
  "time": "10:00"
}
```

### 5.7 Complete Lesson
```http
PUT /api/v1/lessons/:id/complete
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "notes": "Student performed well. Ready for next level.",
  "rating": 5
}
```

### 5.8 Get Lesson Statistics
```http
GET /api/v1/lessons/stats
Authorization: Bearer YOUR_TOKEN
```

---

## 6. Payment Endpoints

### 6.1 Get All Payments
```http
GET /api/v1/payments?status=paid&method=card&startDate=2025-01-01
Authorization: Bearer YOUR_TOKEN
```

**Query Parameters:**
- `status`: Filter by status (pending, paid, refunded)
- `method`: Filter by payment method (cash, card, transfer)
- `studentId`: Filter by student
- `startDate`: Start date filter
- `endDate`: End date filter
- `minAmount`: Minimum amount
- `maxAmount`: Maximum amount

### 6.2 Get Single Payment
```http
GET /api/v1/payments/:id
Authorization: Bearer YOUR_TOKEN
```

### 6.3 Record Payment
```http
POST /api/v1/payments
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "studentId": "STUDENT_ID",
  "amount": 500,
  "method": "card",
  "status": "paid",
  "category": "lesson",
  "description": "Payment for 5 driving lessons"
}
```

### 6.4 Update Payment
```http
PUT /api/v1/payments/:id
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "status": "paid",
  "transactionId": "TXN123456"
}
```

### 6.5 Delete Payment
```http
DELETE /api/v1/payments/:id
Authorization: Bearer YOUR_TOKEN
```

### 6.6 Get Payment Statistics
```http
GET /api/v1/payments/stats
Authorization: Bearer YOUR_TOKEN
```

### 6.7 Get Student Payment History
```http
GET /api/v1/payments/student/:studentId
Authorization: Bearer YOUR_TOKEN
```

### 6.8 Get Pending Payments
```http
GET /api/v1/payments/pending
Authorization: Bearer YOUR_TOKEN
```

### 6.9 Mark Payment as Paid
```http
PUT /api/v1/payments/:id/mark-paid
Authorization: Bearer YOUR_TOKEN
```

---

## Testing Workflow

### Step 1: Setup
1. Start MongoDB: `mongod`
2. Start backend: `cd backend && npm run dev`

### Step 2: Authentication
1. Register an admin account
2. Copy the token from response
3. Use token in all subsequent requests

### Step 3: Create Test Data
1. Create 2-3 students
2. Create 2-3 instructors
3. Create 2-3 vehicles

### Step 4: Test Lesson Scheduling
1. Schedule a lesson
2. Try scheduling conflicting lesson (should fail)
3. Check availability before scheduling
4. Complete a lesson
5. Check student progress

### Step 5: Test Payment System
1. Record payments for students
2. Check payment statistics
3. View pending payments
4. Mark pending payments as paid

### Step 6: Test Advanced Features
1. Use pagination on list endpoints
2. Use search and filters
3. Get statistics endpoints
4. Test update and delete operations

---

## Common Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": "Not authorized, no token provided"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

### 500 Server Error
```json
{
  "success": false,
  "error": "Server Error"
}
```

---

## Tips for Testing

1. **Save Environment Variables in Postman:**
   - `baseUrl`: http://localhost:5000/api/v1
   - `token`: Your JWT token
   - `studentId`, `instructorId`, etc.

2. **Test in Order:**
   - Auth → Students → Instructors → Vehicles → Lessons → Payments

3. **Use Postman Collections:**
   - Organize requests by resource
   - Use pre-request scripts for token refresh
   - Use tests for response validation

4. **Check Console Logs:**
   - Monitor server logs for errors
   - Check MongoDB logs for query issues

5. **Test Edge Cases:**
   - Empty fields
   - Invalid IDs
   - Duplicate entries
   - Scheduling conflicts
