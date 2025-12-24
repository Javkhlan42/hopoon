# tHopOn API Documentation

**Version:** 1.0
**Base URL:** `https://api.hopon.mn/v1`
**Protocol:** HTTPS
**Authentication:** JWT Bearer Token
**Date:** December 20, 2025

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Common Patterns](#common-patterns)
4. [Error Handling](#error-handling)
5. [API Endpoints](#api-endpoints)
   - [Authentication &amp; Users](#authentication--users)
   - [Rides &amp; Feed](#rides--feed)
   - [Bookings](#bookings)
   - [Communication](#communication)
   - [Payments](#payments)
   - [Ratings &amp; Reviews](#ratings--reviews)
   - [Safety &amp; Reports](#safety--reports)
   - [Admin](#admin)
6. [WebSocket Events](#websocket-events)
7. [Rate Limiting](#rate-limiting)
8. [Versioning](#versioning)

---

## Overview

The HopOn API provides a RESTful interface for the carpooling platform. All endpoints return JSON responses and require HTTPS. The API follows REST principles with standard HTTP methods:

- `GET` - Retrieve resources
- `POST` - Create new resources
- `PUT` - Update existing resources
- `PATCH` - Partial update of resources
- `DELETE` - Remove resources
  update

---

## Authentication

### Bearer Token Authentication

All authenticated endpoints require a JWT token in the Authorization header:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Token Lifecycle

- **Access Token:** Valid for 7 days of activity
- **Refresh Token:** Valid for 30 days
- **Token Refresh:** Use `/auth/refresh` endpoint before expiration

### Token Payload

```json
{
  "userId": "uuid",
  "role": "driver|passenger|admin",
  "verified": true,
  "iat": 1703088000,
  "exp": 1703692800
}
```

---

## Common Patterns

### Pagination

Endpoints returning lists support pagination:

**Query Parameters:**

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)

**Response:**

```json
{
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

### Filtering

Use query parameters for filtering:

```
GET /rides?status=active&minRating=4.5&maxPrice=20000
```

### Sorting

```
GET /rides?sortBy=departure_time&order=asc
```

### Timestamps

All timestamps are in ISO 8601 format (UTC):

```
"2025-12-20T10:30:00.000Z"
```

### Coordinates

Geographic coordinates use WGS84 (EPSG:4326):

```json
{
  "lat": 47.9184,
  "lng": 106.9177
}
```

---

## Error Handling

### Error Response Format

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      "field": "Additional context"
    }
  }
}
```

### HTTP Status Codes

| Code | Meaning               |
| ---- | --------------------- |
| 200  | Success               |
| 201  | Created               |
| 204  | No Content            |
| 400  | Bad Request           |
| 401  | Unauthorized          |
| 403  | Forbidden             |
| 404  | Not Found             |
| 409  | Conflict              |
| 422  | Validation Error      |
| 429  | Too Many Requests     |
| 500  | Internal Server Error |
| 503  | Service Unavailable   |

### Common Error Codes

- `INVALID_TOKEN` - JWT token is invalid or expired
- `INSUFFICIENT_PERMISSIONS` - User lacks required permissions
- `RESOURCE_NOT_FOUND` - Requested resource doesn't exist
- `VALIDATION_ERROR` - Input validation failed
- `DUPLICATE_ENTRY` - Resource already exists
- `SEATS_UNAVAILABLE` - Not enough seats available
- `BOOKING_CONFLICT` - Booking time conflict
- `RATE_LIMIT_EXCEEDED` - Too many requests

---

## API Endpoints

---

## Authentication & Users

### Register User

Create a new user account.

**Endpoint:** `POST /auth/register`

**Request Body:**

```json
{
  "phone": "+97699123456",
  "role": "driver",
  "name": "Болдбаатар",
  "registrationType": "phone"
}
```

**Response:** `201 Created`

```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "otpSent": true,
  "message": "OTP sent to +97699123456"
}
```

---

### Verify OTP

Verify phone number with OTP code.

**Endpoint:** `POST /auth/verify-otp`

**Request Body:**

```json
{
  "phone": "+97699123456",
  "otp": "123456"
}
```

**Response:** `200 OK`

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "phone": "+97699123456",
    "name": "Болдбаатар",
    "role": "driver",
    "verified": false,
    "rating": null,
    "createdAt": "2025-12-20T10:30:00.000Z"
  }
}
```

---

### Login

Authenticate existing user.

**Endpoint:** `POST /auth/login`

**Request Body:**

```json
{
  "phone": "+97699123456"
}
```

**Response:** `200 OK`

```json
{
  "otpSent": true,
  "message": "OTP sent to +97699123456"
}
```

Then verify with `/auth/verify-otp` endpoint.

---

### Refresh Token

Get new access token using refresh token.

**Endpoint:** `POST /auth/refresh`

**Request Body:**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:** `200 OK`

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### Logout

Invalidate current token.

**Endpoint:** `POST /auth/logout`

**Headers:** `Authorization: Bearer {token}`

**Response:** `204 No Content`

---

### Get Current User

Retrieve authenticated user's profile.

**Endpoint:** `GET /users/me`

**Headers:** `Authorization: Bearer {token}`

**Response:** `200 OK`

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "phone": "+97699123456",
  "email": "bold@example.com",
  "name": "Болдбаатар",
  "role": "driver",
  "verified": true,
  "rating": 4.8,
  "reviewCount": 45,
  "badges": ["verified", "trusted"],
  "profilePhoto": "https://cdn.hopon.mn/users/550e8400.jpg",
  "createdAt": "2025-11-01T10:30:00.000Z",
  "stats": {
    "totalRidesAsDriver": 120,
    "totalRidesAsPassenger": 34,
    "totalDistance": 15420
  }
}
```

---

### Update Profile

Update user profile information.

**Endpoint:** `PATCH /users/me`

**Headers:** `Authorization: Bearer {token}`

**Request Body:**

```json
{
  "name": "Болдбаатар Ганбаатар",
  "email": "bold.new@example.com",
  "bio": "Өдөр бүр ажилдаа явдаг"
}
```

**Response:** `200 OK`

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Болдбаатар Ганбаатар",
  "email": "bold.new@example.com",
  "bio": "Өдөр бүр ажилдаа явдаг",
  "updatedAt": "2025-12-20T10:30:00.000Z"
}
```

---

### Upload Profile Photo

Upload or update profile photo.

**Endpoint:** `POST /users/me/photo`

**Headers:**

- `Authorization: Bearer {token}`
- `Content-Type: multipart/form-data`

**Request Body:**

```
photo: [binary file]
```

**Response:** `200 OK`

```json
{
  "photoUrl": "https://cdn.hopon.mn/users/550e8400.jpg",
  "uploadedAt": "2025-12-20T10:30:00.000Z"
}
```

---

### Submit Identity Verification

Upload ID and selfie for verification.

**Endpoint:** `POST /users/me/verify-identity`

**Headers:**

- `Authorization: Bearer {token}`
- `Content-Type: multipart/form-data`

**Request Body:**

```
idPhoto: [binary file]
selfiePhoto: [binary file]
```

**Response:** `202 Accepted`

```json
{
  "verificationId": "ver_123456",
  "status": "pending",
  "message": "Verification submitted. Results in 24-48 hours.",
  "submittedAt": "2025-12-20T10:30:00.000Z"
}
```

---

### Get User Profile

Get public profile of any user.

**Endpoint:** `GET /users/{userId}`

**Headers:** `Authorization: Bearer {token}`

**Response:** `200 OK`

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Болдбаатар",
  "verified": true,
  "rating": 4.8,
  "reviewCount": 45,
  "badges": ["verified", "trusted"],
  "profilePhoto": "https://cdn.hopon.mn/users/550e8400.jpg",
  "memberSince": "2025-11-01T10:30:00.000Z",
  "bio": "Өдөр бүр ажилдаа явдаг"
}
```

---

### Get User Reviews

Get reviews for a specific user.

**Endpoint:** `GET /users/{userId}/reviews`

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)

**Response:** `200 OK`

```json
{
  "data": [
    {
      "id": "rev_123456",
      "rating": 5,
      "comment": "Маш сайхан жолооч байна",
      "reviewer": {
        "id": "user_789",
        "name": "Сарантуяа",
        "profilePhoto": "https://cdn.hopon.mn/users/user_789.jpg"
      },
      "ride": {
        "id": "ride_abc",
        "route": "Улаанбаатар → Дархан"
      },
      "createdAt": "2025-12-15T10:30:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3,
    "averageRating": 4.8
  }
}
```

---

### Get Ride History

Get user's ride history.

**Endpoint:** `GET /users/me/rides`

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**

- `role` - Filter by role: `driver` or `passenger`
- `status` - Filter by status: `completed`, `cancelled`, etc.
- `page` - Page number
- `limit` - Items per page

**Response:** `200 OK`

```json
{
  "data": [
    {
      "id": "ride_123",
      "role": "driver",
      "route": {
        "origin": { "lat": 47.9184, "lng": 106.9177, "address": "Улаанбаатар" },
        "destination": { "lat": 49.4665, "lng": 105.9785, "address": "Дархан" }
      },
      "departureTime": "2025-12-15T10:00:00.000Z",
      "status": "completed",
      "passengers": 2,
      "earnings": 30000,
      "completedAt": "2025-12-15T14:30:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 120
  }
}
```

---

## Rides & Feed

### Create Ride

Create a new ride post.

**Endpoint:** `POST /rides`

**Headers:** `Authorization: Bearer {token}`

**Request Body:**

```json
{
  "origin": {
    "lat": 47.9184,
    "lng": 106.9177,
    "address": "Төв номын сан, Улаанбаатар"
  },
  "destination": {
    "lat": 49.4665,
    "lng": 105.9785,
    "address": "Төв талбай, Дархан"
  },
  "departureTime": "2025-12-21T10:00:00.000Z",
  "seatsAvailable": 3,
  "costPerSeat": 15000,
  "currency": "MNT",
  "recurring": {
    "enabled": false
  },
  "preferences": {
    "smokingAllowed": false,
    "petsAllowed": false,
    "musicPreference": "negotiable"
  },
  "notes": "Замдаа 1 цагийн завсарлага авна"
}
```

**Response:** `201 Created`

```json
{
  "id": "ride_550e8400",
  "driverId": "550e8400-e29b-41d4-a716-446655440000",
  "driver": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Болдбаатар",
    "rating": 4.8,
    "verified": true,
    "profilePhoto": "https://cdn.hopon.mn/users/550e8400.jpg"
  },
  "origin": {
    "lat": 47.9184,
    "lng": 106.9177,
    "address": "Төв номын сан, Улаанбаатар"
  },
  "destination": {
    "lat": 49.4665,
    "lng": 105.9785,
    "address": "Төв талбай, Дархан"
  },
  "route": {
    "polyline": "encoded_polyline_string",
    "distance": 245000,
    "duration": 15600
  },
  "departureTime": "2025-12-21T10:00:00.000Z",
  "seatsTotal": 3,
  "seatsAvailable": 3,
  "costPerSeat": 15000,
  "currency": "MNT",
  "status": "active",
  "miniMapUrl": "https://cdn.hopon.mn/maps/ride_550e8400.png",
  "createdAt": "2025-12-20T10:30:00.000Z"
}
```

---

### Get Ride Feed

Get social feed of active rides.

**Endpoint:** `GET /rides/feed`

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**

- `lat` - User's current latitude (optional)
- `lng` - User's current longitude (optional)
- `radius` - Search radius in meters (default: 50000)
- `page` - Page number
- `limit` - Items per page

**Response:** `200 OK`

```json
{
  "data": [
    {
      "id": "ride_550e8400",
      "driver": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Болдбаатар",
        "rating": 4.8,
        "verified": true,
        "badges": ["trusted"],
        "profilePhoto": "https://cdn.hopon.mn/users/550e8400.jpg"
      },
      "route": {
        "origin": "Төв номын сан",
        "destination": "Дархан",
        "distance": 245000
      },
      "departureTime": "2025-12-21T10:00:00.000Z",
      "seatsAvailable": 3,
      "costPerSeat": 15000,
      "miniMapUrl": "https://cdn.hopon.mn/maps/ride_550e8400.png",
      "commentCount": 2,
      "bookingCount": 0,
      "createdAt": "2025-12-20T10:30:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150
  }
}
```

---

### Search Rides

Search for rides matching specific route.

**Endpoint:** `GET /rides/search`

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**

- `originLat` - Origin latitude (required)
- `originLng` - Origin longitude (required)
- `destLat` - Destination latitude (required)
- `destLng` - Destination longitude (required)
- `date` - Departure date (ISO format)
- `minSeats` - Minimum seats needed
- `maxPrice` - Maximum price per seat
- `minRating` - Minimum driver rating
- `circleId` - Filter by community circle
- `page` - Page number
- `limit` - Items per page

**Response:** `200 OK`

```json
{
  "data": [
    {
      "id": "ride_550e8400",
      "driver": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Болдбаатар",
        "rating": 4.8,
        "verified": true,
        "profilePhoto": "https://cdn.hopon.mn/users/550e8400.jpg"
      },
      "route": {
        "origin": {
          "lat": 47.9184,
          "lng": 106.9177,
          "address": "Төв номын сан"
        },
        "destination": {
          "lat": 49.4665,
          "lng": 105.9785,
          "address": "Дархан"
        },
        "polyline": "encoded_polyline_string",
        "distance": 245000
      },
      "departureTime": "2025-12-21T10:00:00.000Z",
      "seatsAvailable": 3,
      "costPerSeat": 15000,
      "matchScore": 0.95,
      "pickupPoint": {
        "lat": 47.919,
        "lng": 106.918,
        "address": "Төв номын сангийн баруун тал",
        "walkingDistance": 150
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 5
  }
}
```

---

### Get Ride Details

Get detailed information about a specific ride.

**Endpoint:** `GET /rides/{rideId}`

**Headers:** `Authorization: Bearer {token}`

**Response:** `200 OK`

```json
{
  "id": "ride_550e8400",
  "driver": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Болдбаатар",
    "rating": 4.8,
    "reviewCount": 45,
    "verified": true,
    "badges": ["verified", "trusted"],
    "profilePhoto": "https://cdn.hopon.mn/users/550e8400.jpg",
    "memberSince": "2025-11-01T10:30:00.000Z"
  },
  "route": {
    "origin": {
      "lat": 47.9184,
      "lng": 106.9177,
      "address": "Төв номын сан, Улаанбаатар"
    },
    "destination": {
      "lat": 49.4665,
      "lng": 105.9785,
      "address": "Төв талбай, Дархан"
    },
    "polyline": "encoded_polyline_string",
    "distance": 245000,
    "duration": 15600
  },
  "departureTime": "2025-12-21T10:00:00.000Z",
  "seatsTotal": 3,
  "seatsAvailable": 3,
  "costPerSeat": 15000,
  "currency": "MNT",
  "status": "active",
  "preferences": {
    "smokingAllowed": false,
    "petsAllowed": false,
    "musicPreference": "negotiable"
  },
  "notes": "Замдаа 1 цагийн завсарлага авна",
  "passengers": [],
  "comments": [
    {
      "id": "comment_123",
      "user": {
        "id": "user_789",
        "name": "Сарантуяа",
        "profilePhoto": "https://cdn.hopon.mn/users/user_789.jpg"
      },
      "text": "Яармаг орчмоос авч болох уу?",
      "createdAt": "2025-12-20T11:00:00.000Z"
    }
  ],
  "createdAt": "2025-12-20T10:30:00.000Z",
  "updatedAt": "2025-12-20T10:30:00.000Z"
}
```

---

### Update Ride

Update ride details.

**Endpoint:** `PATCH /rides/{rideId}`

**Headers:** `Authorization: Bearer {token}`

**Request Body:**

```json
{
  "departureTime": "2025-12-21T11:00:00.000Z",
  "seatsAvailable": 2,
  "costPerSeat": 18000,
  "notes": "Замдаа 1 цагийн завсарлага авна. Шинэчилсэн цаг"
}
```

**Response:** `200 OK`

```json
{
  "id": "ride_550e8400",
  "departureTime": "2025-12-21T11:00:00.000Z",
  "seatsAvailable": 2,
  "costPerSeat": 18000,
  "notes": "Замдаа 1 цагийн завсарлага авна. Шинэчилсэн цаг",
  "updatedAt": "2025-12-20T12:00:00.000Z"
}
```

---

### Delete Ride

Cancel/delete a ride post.

**Endpoint:** `DELETE /rides/{rideId}`

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**

- `reason` - Cancellation reason (optional)

**Response:** `204 No Content`

---

### Add Comment to Ride

Post a comment on a ride.

**Endpoint:** `POST /rides/{rideId}/comments`

**Headers:** `Authorization: Bearer {token}`

**Request Body:**

```json
{
  "text": "Яармаг орчмоос авч болох уу?"
}
```

**Response:** `201 Created`

```json
{
  "id": "comment_123",
  "rideId": "ride_550e8400",
  "user": {
    "id": "user_789",
    "name": "Сарантуяа",
    "profilePhoto": "https://cdn.hopon.mn/users/user_789.jpg"
  },
  "text": "Яармаг орчмоос авч болох уу?",
  "createdAt": "2025-12-20T11:00:00.000Z"
}
```

---

### Start Ride

Mark ride as in progress.

**Endpoint:** `POST /rides/{rideId}/start`

**Headers:** `Authorization: Bearer {token}`

**Response:** `200 OK`

```json
{
  "id": "ride_550e8400",
  "status": "in_progress",
  "startedAt": "2025-12-21T10:00:00.000Z",
  "trackingEnabled": true
}
```

---

### End Ride

Mark ride as completed.

**Endpoint:** `POST /rides/{rideId}/end`

**Headers:** `Authorization: Bearer {token}`

**Response:** `200 OK`

```json
{
  "id": "ride_550e8400",
  "status": "completed",
  "startedAt": "2025-12-21T10:00:00.000Z",
  "completedAt": "2025-12-21T14:30:00.000Z",
  "trackingEnabled": false,
  "stats": {
    "actualDistance": 248500,
    "actualDuration": 16200
  }
}
```

---

## Bookings

### Create Booking Request

Request to join a ride.

**Endpoint:** `POST /bookings`

**Headers:** `Authorization: Bearer {token}`

**Request Body:**

```json
{
  "rideId": "ride_550e8400",
  "seatsRequested": 2,
  "pickupNote": "Төв номын сангийн урд хүлээж байя",
  "paymentMethod": "wallet"
}
```

**Response:** `201 Created`

```json
{
  "id": "booking_abc123",
  "rideId": "ride_550e8400",
  "passengerId": "user_789",
  "seatsRequested": 2,
  "status": "pending",
  "pickupNote": "Төв номын сангийн урд хүлээж байя",
  "totalCost": 30000,
  "currency": "MNT",
  "createdAt": "2025-12-20T11:30:00.000Z"
}
```

---

### Get My Bookings

Get user's booking requests.

**Endpoint:** `GET /bookings`

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**

- `status` - Filter by status: `pending`, `approved`, `rejected`, `cancelled`
- `role` - Filter by role: `driver`, `passenger`
- `page` - Page number
- `limit` - Items per page

**Response:** `200 OK`

```json
{
  "data": [
    {
      "id": "booking_abc123",
      "ride": {
        "id": "ride_550e8400",
        "route": {
          "origin": "Төв номын сан",
          "destination": "Дархан"
        },
        "departureTime": "2025-12-21T10:00:00.000Z"
      },
      "driver": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Болдбаатар",
        "rating": 4.8,
        "profilePhoto": "https://cdn.hopon.mn/users/550e8400.jpg"
      },
      "seatsRequested": 2,
      "status": "pending",
      "totalCost": 30000,
      "createdAt": "2025-12-20T11:30:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 5
  }
}
```

---

### Approve Booking

Approve a passenger's booking request.

**Endpoint:** `POST /bookings/{bookingId}/approve`

**Headers:** `Authorization: Bearer {token}`

**Request Body:**

```json
{
  "message": "Тавтай морил! Цагтаа уулзъя"
}
```

**Response:** `200 OK`

```json
{
  "id": "booking_abc123",
  "status": "approved",
  "approvedAt": "2025-12-20T12:00:00.000Z",
  "message": "Тавтай морил! Цагтаа уулзъя"
}
```

---

### Reject Booking

Reject a passenger's booking request.

**Endpoint:** `POST /bookings/{bookingId}/reject`

**Headers:** `Authorization: Bearer {token}`

**Request Body:**

```json
{
  "reason": "Уучлаарай, суудал дүүрсэн"
}
```

**Response:** `200 OK`

```json
{
  "id": "booking_abc123",
  "status": "rejected",
  "rejectedAt": "2025-12-20T12:00:00.000Z",
  "reason": "Уучлаарай, суудал дүүрсэн"
}
```

---

### Cancel Booking

Cancel own booking.

**Endpoint:** `POST /bookings/{bookingId}/cancel`

**Headers:** `Authorization: Bearer {token}`

**Request Body:**

```json
{
  "reason": "Төлөвлөгөө өөрчлөгдсөн"
}
```

**Response:** `200 OK`

```json
{
  "id": "booking_abc123",
  "status": "cancelled",
  "cancelledAt": "2025-12-20T12:00:00.000Z",
  "refundAmount": 30000,
  "refundStatus": "processed"
}
```

---

## Communication

### Get Conversations

Get list of chat conversations.

**Endpoint:** `GET /chats`

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**

- `page` - Page number
- `limit` - Items per page

**Response:** `200 OK`

```json
{
  "data": [
    {
      "id": "chat_xyz789",
      "ride": {
        "id": "ride_550e8400",
        "route": "Төв номын сан → Дархан"
      },
      "participant": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Болдбаатар",
        "profilePhoto": "https://cdn.hopon.mn/users/550e8400.jpg"
      },
      "lastMessage": {
        "text": "Цагтаа уулзъя",
        "sentAt": "2025-12-20T12:00:00.000Z",
        "read": true
      },
      "unreadCount": 0
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 8
  }
}
```

---

### Get Chat Messages

Get messages from a conversation.

**Endpoint:** `GET /chats/{chatId}/messages`

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**

- `before` - Get messages before this timestamp
- `limit` - Number of messages (default: 50)

**Response:** `200 OK`

```json
{
  "data": [
    {
      "id": "msg_001",
      "chatId": "chat_xyz789",
      "senderId": "user_789",
      "text": "Яармаг орчмоос авч болох уу?",
      "type": "text",
      "sentAt": "2025-12-20T11:00:00.000Z",
      "read": true,
      "readAt": "2025-12-20T11:05:00.000Z"
    },
    {
      "id": "msg_002",
      "chatId": "chat_xyz789",
      "senderId": "550e8400-e29b-41d4-a716-446655440000",
      "text": "Тийм ээ, болно",
      "type": "text",
      "sentAt": "2025-12-20T11:10:00.000Z",
      "read": true,
      "readAt": "2025-12-20T11:11:00.000Z"
    }
  ],
  "meta": {
    "hasMore": true,
    "oldestTimestamp": "2025-12-20T11:00:00.000Z"
  }
}
```

---

### Send Message

Send a chat message (prefer WebSocket for real-time).

**Endpoint:** `POST /chats/{chatId}/messages`

**Headers:** `Authorization: Bearer {token}`

**Request Body:**

```json
{
  "text": "Би цагтаа ирнэ",
  "type": "text"
}
```

**Response:** `201 Created`

```json
{
  "id": "msg_003",
  "chatId": "chat_xyz789",
  "senderId": "user_789",
  "text": "Би цагтаа ирнэ",
  "type": "text",
  "sentAt": "2025-12-20T12:00:00.000Z",
  "read": false
}
```

---

### Mark Messages as Read

Mark messages as read.

**Endpoint:** `POST /chats/{chatId}/read`

**Headers:** `Authorization: Bearer {token}`

**Request Body:**

```json
{
  "messageIds": ["msg_001", "msg_002"]
}
```

**Response:** `204 No Content`

---

### Get Notifications

Get user's notifications.

**Endpoint:** `GET /notifications`

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**

- `unreadOnly` - Show only unread (boolean)
- `type` - Filter by type
- `page` - Page number
- `limit` - Items per page

**Response:** `200 OK`

```json
{
  "data": [
    {
      "id": "notif_001",
      "type": "booking_approved",
      "title": "Захиалга батлагдлаа",
      "message": "Болдбаатар таны хүсэлтийг зөвшөөрлөө",
      "data": {
        "bookingId": "booking_abc123",
        "rideId": "ride_550e8400"
      },
      "read": false,
      "createdAt": "2025-12-20T12:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 15,
    "unreadCount": 3
  }
}
```

---

### Mark Notification as Read

Mark notification as read.

**Endpoint:** `POST /notifications/{notificationId}/read`

**Headers:** `Authorization: Bearer {token}`

**Response:** `204 No Content`

---

## Payments

### Get Wallet Balance

Get user's wallet information.

**Endpoint:** `GET /wallet`

**Headers:** `Authorization: Bearer {token}`

**Response:** `200 OK`

```json
{
  "userId": "user_789",
  "balance": 150000,
  "currency": "MNT",
  "pendingBalance": 30000,
  "totalEarnings": 500000,
  "totalSpent": 380000,
  "updatedAt": "2025-12-20T12:00:00.000Z"
}
```

---

### Add Funds

Add money to wallet.

**Endpoint:** `POST /wallet/deposit`

**Headers:** `Authorization: Bearer {token}`

**Request Body:**

```json
{
  "amount": 50000,
  "paymentMethod": "card",
  "cardToken": "tok_xxxxxxxxxx"
}
```

**Response:** `200 OK`

```json
{
  "transactionId": "txn_abc123",
  "amount": 50000,
  "newBalance": 200000,
  "status": "completed",
  "createdAt": "2025-12-20T12:00:00.000Z"
}
```

---

### Withdraw Funds

Withdraw money from wallet.

**Endpoint:** `POST /wallet/withdraw`

**Headers:** `Authorization: Bearer {token}`

**Request Body:**

```json
{
  "amount": 100000,
  "bankAccount": {
    "accountNumber": "1234567890",
    "bankName": "Хаан банк"
  }
}
```

**Response:** `200 OK`

```json
{
  "transactionId": "txn_def456",
  "amount": 100000,
  "fee": 1000,
  "netAmount": 99000,
  "newBalance": 100000,
  "status": "pending",
  "estimatedCompletion": "2025-12-21T12:00:00.000Z"
}
```

---

### Get Transaction History

Get wallet transaction history.

**Endpoint:** `GET /wallet/transactions`

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**

- `type` - Filter by type: `deposit`, `withdrawal`, `payment`, `refund`, `tip`
- `startDate` - Start date (ISO format)
- `endDate` - End date (ISO format)
- `page` - Page number
- `limit` - Items per page

**Response:** `200 OK`

```json
{
  "data": [
    {
      "id": "txn_abc123",
      "type": "payment",
      "amount": -30000,
      "balance": 170000,
      "description": "Аяллын төлбөр - Дархан",
      "relatedRide": {
        "id": "ride_550e8400",
        "route": "Төв номын сан → Дархан"
      },
      "status": "completed",
      "createdAt": "2025-12-20T10:00:00.000Z"
    },
    {
      "id": "txn_def456",
      "type": "deposit",
      "amount": 50000,
      "balance": 200000,
      "description": "Данс цэнэглэлт",
      "status": "completed",
      "createdAt": "2025-12-19T15:30:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 45
  }
}
```

---

### Send Tip

Send tip to driver after ride.

**Endpoint:** `POST /wallet/tip`

**Headers:** `Authorization: Bearer {token}`

**Request Body:**

```json
{
  "rideId": "ride_550e8400",
  "recipientId": "550e8400-e29b-41d4-a716-446655440000",
  "amount": 5000,
  "message": "Маш сайхан аялал байлаа!"
}
```

**Response:** `200 OK`

```json
{
  "transactionId": "txn_tip001",
  "amount": 5000,
  "recipient": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Болдбаатар"
  },
  "newBalance": 145000,
  "createdAt": "2025-12-20T15:00:00.000Z"
}
```

---

## Ratings & Reviews

### Submit Rating

Rate a user after ride completion.

**Endpoint:** `POST /ratings`

**Headers:** `Authorization: Bearer {token}`

**Request Body:**

```json
{
  "rideId": "ride_550e8400",
  "ratedUserId": "550e8400-e29b-41d4-a716-446655440000",
  "rating": 5,
  "comment": "Маш сайхан жолооч, цаг баримталдаг",
  "tags": ["punctual", "friendly", "safe_driver"]
}
```

**Response:** `201 Created`

```json
{
  "id": "rating_001",
  "rideId": "ride_550e8400",
  "ratedUser": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Болдбаатар",
    "newRating": 4.85,
    "totalReviews": 46
  },
  "rating": 5,
  "comment": "Маш сайхан жолооч, цаг баримталдаг",
  "tags": ["punctual", "friendly", "safe_driver"],
  "createdAt": "2025-12-20T15:00:00.000Z"
}
```

---

## Safety & Reports

### Trigger SOS

Activate emergency SOS.

**Endpoint:** `POST /safety/sos`

**Headers:** `Authorization: Bearer {token}`

**Request Body:**

```json
{
  "rideId": "ride_550e8400",
  "location": {
    "lat": 48.5234,
    "lng": 106.4521
  },
  "reason": "emergency"
}
```

**Response:** `200 OK`

```json
{
  "sosId": "sos_emergency_001",
  "status": "active",
  "alertSent": true,
  "emergencyContacts": ["admin", "emergency_contact_1"],
  "createdAt": "2025-12-20T13:30:00.000Z"
}
```

---

### Report User

Report inappropriate user behavior.

**Endpoint:** `POST /reports`

**Headers:** `Authorization: Bearer {token}`

**Request Body:**

```json
{
  "reportedUserId": "user_bad",
  "rideId": "ride_550e8400",
  "category": "inappropriate_behavior",
  "description": "Тамхи татаж байсан",
  "evidence": ["https://cdn.hopon.mn/evidence/screenshot1.jpg"]
}
```

**Response:** `201 Created`

```json
{
  "id": "report_001",
  "status": "pending_review",
  "ticketNumber": "RPT-20251220-001",
  "message": "Таны гомдлыг хүлээн авлаа. 24-48 цагийн дотор шийдвэрлэнэ.",
  "createdAt": "2025-12-20T14:00:00.000Z"
}
```

---

### Block User

Block a user.

**Endpoint:** `POST /users/block`

**Headers:** `Authorization: Bearer {token}`

**Request Body:**

```json
{
  "blockedUserId": "user_bad"
}
```

**Response:** `200 OK`

```json
{
  "blockedUserId": "user_bad",
  "status": "blocked",
  "message": "Хэрэглэгч амжилттай блоклогдлоо",
  "blockedAt": "2025-12-20T14:00:00.000Z"
}
```

---

### Unblock User

Unblock a user.

**Endpoint:** `DELETE /users/block/{blockedUserId}`

**Headers:** `Authorization: Bearer {token}`

**Response:** `204 No Content`

---

## Admin

### Get Dashboard Stats

Get admin dashboard statistics.

**Endpoint:** `GET /admin/stats`

**Headers:** `Authorization: Bearer {admin_token}`

**Query Parameters:**

- `period` - Time period: `today`, `week`, `month`, `year`

**Response:** `200 OK`

```json
{
  "period": "today",
  "rides": {
    "active": 145,
    "completed": 89,
    "cancelled": 5,
    "total": 239
  },
  "users": {
    "newRegistrations": 24,
    "activeUsers": 1520,
    "verifiedUsers": 890
  },
  "bookings": {
    "pending": 56,
    "approved": 189,
    "rejected": 12
  },
  "revenue": {
    "total": 4500000,
    "commission": 450000
  },
  "sosAlerts": {
    "active": 0,
    "resolved": 2
  },
  "systemHealth": {
    "cpu": 45,
    "memory": 62,
    "apiResponseTime": 120
  }
}
```

---

### Get All Users

Get list of all users (admin).

**Endpoint:** `GET /admin/users`

**Headers:** `Authorization: Bearer {admin_token}`

**Query Parameters:**

- `search` - Search by name, phone, email
- `verified` - Filter by verification status
- `role` - Filter by role
- `status` - Filter by status: `active`, `suspended`, `banned`
- `page` - Page number
- `limit` - Items per page

**Response:** `200 OK`

```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Болдбаатар",
      "phone": "+97699123456",
      "email": "bold@example.com",
      "role": "driver",
      "verified": true,
      "rating": 4.8,
      "status": "active",
      "totalRides": 154,
      "createdAt": "2025-11-01T10:30:00.000Z",
      "lastActive": "2025-12-20T14:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 50,
    "total": 1520
  }
}
```

---

### Suspend User

Suspend a user account.

**Endpoint:** `POST /admin/users/{userId}/suspend`

**Headers:** `Authorization: Bearer {admin_token}`

**Request Body:**

```json
{
  "reason": "Multiple reports of inappropriate behavior",
  "duration": 7,
  "durationType": "days"
}
```

**Response:** `200 OK`

```json
{
  "userId": "user_bad",
  "status": "suspended",
  "suspendedUntil": "2025-12-27T14:00:00.000Z",
  "reason": "Multiple reports of inappropriate behavior"
}
```

---

### Get Reports Queue

Get pending moderation reports.

**Endpoint:** `GET /admin/reports`

**Headers:** `Authorization: Bearer {admin_token}`

**Query Parameters:**

- `status` - Filter by status: `pending`, `reviewing`, `resolved`
- `category` - Filter by category
- `page` - Page number
- `limit` - Items per page

**Response:** `200 OK`

```json
{
  "data": [
    {
      "id": "report_001",
      "ticketNumber": "RPT-20251220-001",
      "reporter": {
        "id": "user_789",
        "name": "Сарантуяа"
      },
      "reportedUser": {
        "id": "user_bad",
        "name": "Буруу хэрэглэгч"
      },
      "ride": {
        "id": "ride_550e8400",
        "route": "Улаанбаатар → Дархан"
      },
      "category": "inappropriate_behavior",
      "description": "Тамхи татаж байсан",
      "evidence": ["https://cdn.hopon.mn/evidence/screenshot1.jpg"],
      "status": "pending_review",
      "createdAt": "2025-12-20T14:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 5
  }
}
```

---

### Resolve Report

Resolve a moderation report.

**Endpoint:** `POST /admin/reports/{reportId}/resolve`

**Headers:** `Authorization: Bearer {admin_token}`

**Request Body:**

```json
{
  "action": "warn_user",
  "notes": "First warning issued to user",
  "notifyReporter": true
}
```

**Response:** `200 OK`

```json
{
  "reportId": "report_001",
  "status": "resolved",
  "action": "warn_user",
  "resolvedBy": "admin_001",
  "resolvedAt": "2025-12-20T15:00:00.000Z"
}
```

---

## WebSocket Events

Connect to WebSocket server for real-time updates.

**WebSocket URL:** `wss://api.hopon.mn/ws`

**Authentication:**

```javascript
const socket = io("wss://api.hopon.mn", {
  auth: {
    token: "your_jwt_token",
  },
});
```

---

### Client → Server Events

#### join_ride

Join a ride's real-time channel.

```javascript
socket.emit("join_ride", {
  rideId: "ride_550e8400",
});
```

#### leave_ride

Leave a ride's channel.

```javascript
socket.emit("leave_ride", {
  rideId: "ride_550e8400",
});
```

#### send_message

Send a chat message.

```javascript
socket.emit("send_message", {
  chatId: "chat_xyz789",
  text: "Би цагтаа ирнэ",
  type: "text",
});
```

#### update_location

Update driver's location (drivers only).

```javascript
socket.emit("update_location", {
  rideId: "ride_550e8400",
  lat: 48.1234,
  lng: 106.5678,
  accuracy: 10,
  speed: 45,
});
```

#### typing

Send typing indicator.

```javascript
socket.emit("typing", {
  chatId: "chat_xyz789",
  isTyping: true,
});
```

---

### Server → Client Events

#### message

Receive a chat message.

```javascript
socket.on("message", (data) => {
  // data: {
  //   id: 'msg_003',
  //   chatId: 'chat_xyz789',
  //   senderId: 'user_789',
  //   text: 'Би цагтаа ирнэ',
  //   sentAt: '2025-12-20T12:00:00.000Z'
  // }
});
```

#### location_update

Receive driver location update.

```javascript
socket.on("location_update", (data) => {
  // data: {
  //   rideId: 'ride_550e8400',
  //   driverId: '550e8400-e29b-41d4-a716-446655440000',
  //   lat: 48.1234,
  //   lng: 106.5678,
  //   speed: 45,
  //   eta: 1200,
  //   timestamp: '2025-12-20T12:00:00.000Z'
  // }
});
```

#### booking_update

Receive booking status update.

```javascript
socket.on("booking_update", (data) => {
  // data: {
  //   bookingId: 'booking_abc123',
  //   status: 'approved',
  //   message: 'Тавтай морил!'
  // }
});
```

#### notification

Receive push notification.

```javascript
socket.on("notification", (data) => {
  // data: {
  //   id: 'notif_001',
  //   type: 'booking_approved',
  //   title: 'Захиалга батлагдлаа',
  //   message: 'Болдбаатар таны хүсэлтийг зөвшөөрлөө',
  //   data: {...}
  // }
});
```

#### ride_status_changed

Ride status changed.

```javascript
socket.on("ride_status_changed", (data) => {
  // data: {
  //   rideId: 'ride_550e8400',
  //   status: 'in_progress',
  //   timestamp: '2025-12-21T10:00:00.000Z'
  // }
});
```

#### typing

User typing indicator.

```javascript
socket.on("typing", (data) => {
  // data: {
  //   chatId: 'chat_xyz789',
  //   userId: 'user_789',
  //   isTyping: true
  // }
});
```

#### sos_alert

SOS alert triggered (admin only).

```javascript
socket.on("sos_alert", (data) => {
  // data: {
  //   sosId: 'sos_emergency_001',
  //   rideId: 'ride_550e8400',
  //   userId: 'user_789',
  //   location: { lat: 48.5234, lng: 106.4521 },
  //   timestamp: '2025-12-20T13:30:00.000Z'
  // }
});
```

---

## Rate Limiting

### Standard Limits

- **Authenticated users:** 100 requests per minute
- **Unauthenticated:** 20 requests per minute
- **Admin users:** 500 requests per minute
- **WebSocket messages:** 50 messages per minute

### Rate Limit Headers

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1703088120
```

### Rate Limit Exceeded Response

**Status:** `429 Too Many Requests`

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "retryAfter": 60
  }
}
```

---

## Versioning

### API Versions

- **Current:** v1
- **Base URL:** `https://api.hopon.mn/v1`

### Version Header (Optional)

```http
Accept: application/vnd.hopon.v1+json
```

### Deprecation

Deprecated endpoints will:

1. Return warning header: `X-API-Deprecated: true`
2. Include deprecation date: `X-Deprecation-Date: 2026-03-20`
3. Be removed after 3 months notice

---

## Appendix

### Postman Collection

Download complete Postman collection:

```
https://api.hopon.mn/docs/postman-collection.json
```

### OpenAPI/Swagger Specification

View interactive API documentation:

```
https://api.hopon.mn/docs
```

### SDKs

**JavaScript/TypeScript:**

```bash
npm install @hopon/api-client
```

**React Native:**

```bash
npm install @hopon/react-native-sdk
```

### Support

- **Email:** api-support@hopon.mn
- **Documentation:** https://docs.hopon.mn
- **Status Page:** https://status.hopon.mn

---

**Last Updated:** December 20, 2025
**API Version:** 1.0
**Documentation Version:** 1.0
