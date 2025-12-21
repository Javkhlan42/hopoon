# Software Requirements Specification (SRS)

# HopOn - Social Carpooling Platform

**Version:** 1.0  
**Date:** December 20, 2025  
**Prepared by:** Г.Бадрал (ID: 22B1NUM0756)

---

## 1. Introduction

### 1.1 Purpose

This Software Requirements Specification (SRS) document provides a complete description of the HopOn social carpooling platform. The document specifies all functional and non-functional requirements for the system that connects drivers and passengers through a social feed-based interface, enabling cost-effective and community-driven ride-sharing.

### 1.2 Document Conventions

- **User:** Generic term for any person using the system
- **Driver:** User who creates ride posts and offers available seats
- **Passenger:** User who searches for and joins rides
- **Admin:** System administrator with moderation capabilities
- **Ride/Post:** A journey posted by a driver with available seats

### 1.3 Intended Audience

This SRS is intended for:

- Development team (frontend, backend, DevOps engineers)
- Project managers and stakeholders
- QA and testing teams
- System architects
- UI/UX designers

### 1.4 Project Scope

HopOn is a social network-inspired carpooling platform that enables users to share rides for both intercity and intracity travel. The system emphasizes trust through identity verification, real-time tracking, and community-based circles. Key objectives include:

- Reduce traffic congestion through ride-sharing
- Provide cost-effective transportation alternatives
- Build a trusted community through verification and rating systems
- Enable real-time communication and tracking for safety
- Support both recurring daily commutes and one-time intercity trips

### 1.5 References

- IEEE Std 830-1998 - IEEE Recommended Practice for Software Requirements Specifications
- PostGIS Documentation
- Mapbox API Documentation
- JWT Authentication Standards
- WebSocket Protocol (RFC 6455)

---

## 2. Overall Description

### 2.1 Product Perspective

HopOn operates as a standalone mobile application (iOS and Android) with a backend microservices architecture. The system integrates with:

- **Map Services:** Mapbox/Google Maps for route visualization and geocoding
- **Identity Services:** И-Монгол/Иргэний үнэмлэх for user verification
- **SMS Gateway:** For phone number verification via OTP
- **Cloud Infrastructure:** AWS/Google Cloud for hosting
- **Payment Systems:** Internal wallet and cash payment support

The system architecture follows a microservices pattern with the following core modules:

1. User & Identity Module
2. Ride & Feed Module
3. Booking & Transaction Module
4. Real-time Communication Module
5. Safety & Support Module
6. Admin & Monitoring Module

### 2.2 Product Features

The main features of HopOn include:

- **Social Feed Interface:** Facebook-like infinite scroll showing available rides
- **Identity Verification:** AI-powered verification using national ID and selfie
- **Route Matching:** Intelligent geospatial matching of passengers to driver routes
- **Real-time Tracking:** Live GPS location sharing during rides
- **In-app Chat:** WebSocket-based real-time messaging
- **SOS Function:** Emergency alert system with location broadcasting
- **Community Circles:** Verified groups (company, university, ladies-only)
- **Rating System:** Mutual 5-star ratings building trust scores
- **Recurring Rides:** Automated daily commute scheduling
- **Cost Sharing:** Flexible payment options including wallet and tips

### 2.3 User Classes and Characteristics

#### 2.3.1 Passenger

- **Frequency:** Daily commuters or occasional travelers
- **Technical Expertise:** Basic smartphone usage
- **Primary Tasks:** Search rides, join requests, chat with drivers, track rides
- **Priority:** High

#### 2.3.2 Driver

- **Frequency:** Regular users offering rides
- **Technical Expertise:** Moderate smartphone usage
- **Primary Tasks:** Create posts, manage bookings, approve/reject requests, navigate
- **Priority:** High

#### 2.3.3 Administrator

- **Frequency:** Continuous system monitoring
- **Technical Expertise:** Advanced technical knowledge
- **Primary Tasks:** Monitor system health, moderate content, handle SOS alerts, manage users
- **Priority:** Critical

### 2.4 Operating Environment

- **Mobile Platforms:** iOS 13+ and Android 8.0+
- **Backend:** Containerized microservices running on Kubernetes
- **Database:** PostgreSQL 13+ with PostGIS extension
- **Cache/Real-time:** Redis 6+
- **Infrastructure:** AWS EC2, RDS, S3 or equivalent cloud provider
- **Network:** Requires internet connectivity; limited offline mode for cached data

### 2.5 Design and Implementation Constraints

#### 2.5.1 Technical Constraints

- Must support simultaneous real-time tracking for thousands of active rides
- GPS accuracy limitations (±10-50 meters)
- Mobile network latency for real-time features
- Battery consumption from continuous GPS tracking
- Map API rate limits and costs

#### 2.5.2 Regulatory Constraints

- Must comply with data privacy laws regarding location tracking
- System is "ride-sharing" not "taxi service" for legal compliance
- User data retention and GDPR compliance
- Financial transaction regulations for wallet system

#### 2.5.3 Business Constraints

- Integration with И-Монгол requires government approval
- SMS gateway costs for OTP verification
- Map API usage costs (Mapbox/Google Maps)
- Cloud infrastructure scaling costs

### 2.6 Assumptions and Dependencies

#### 2.6.1 Assumptions

- Users have smartphones with GPS capability
- Users have valid phone numbers for verification
- Drivers have valid driver's licenses
- Stable internet connectivity in urban areas
- Users understand basic ride-sharing concepts

#### 2.6.2 Dependencies

- Third-party map service availability (Mapbox/Google Maps)
- SMS gateway service uptime
- И-Монгол API availability for identity verification
- Cloud infrastructure provider SLA
- Mobile OS platform updates and compatibility

---

## 3. Specific Requirements

### 3.1 Functional Requirements

#### 3.1.1 User Management

**FR-1.1: User Registration**

- **Description:** System shall allow users to register using phone number or И-Монгол/national ID
- **Input:** Phone number OR national ID credentials
- **Process:**
  - Validate input format
  - Send OTP for phone verification OR verify with И-Монгол
  - Allow user to select role (Driver/Passenger)
  - Create user account with JWT token
- **Output:** User account with unique ID and authentication token
- **Priority:** Critical

**FR-1.2: Identity Verification**

- **Description:** System shall verify user identity using national ID photo and selfie with AI
- **Input:** National ID photo, user selfie photo
- **Process:**
  - Extract face features from both images
  - Compare using AI facial recognition
  - Match ID information with government database (if available)
  - Mark account as "Verified" upon successful match
- **Output:** Verification status (Verified/Unverified)
- **Priority:** High

**FR-1.3: Phone Verification**

- **Description:** System shall verify phone numbers using SMS OTP
- **Input:** Phone number
- **Process:**
  - Generate 6-digit OTP
  - Send via SMS gateway
  - User enters OTP within 5 minutes
  - Validate OTP code
- **Output:** Phone verification status
- **Priority:** Critical

**FR-1.4: Profile Management**

- **Description:** Users shall be able to view and edit their profile information
- **Input:** User profile data (name, photo, contact information)
- **Process:**
  - Display current profile information
  - Allow editing of permitted fields
  - Validate and save changes
  - Update profile timestamp
- **Output:** Updated user profile
- **Priority:** High

**FR-1.5: View User Ratings**

- **Description:** Users shall be able to view their own and other users' ratings and reviews
- **Input:** User ID
- **Process:**
  - Calculate average rating from all reviews
  - Display total number of reviews
  - Show recent reviews with text comments
  - Display "Trusted" badge for high-rated users
- **Output:** User rating summary and review list
- **Priority:** High

**FR-1.6: Ride History**

- **Description:** Users shall be able to view their complete ride history
- **Input:** User ID, filter criteria (date range, role)
- **Process:**
  - Query database for user's completed rides
  - Display rides with date, route, cost, participants
  - Allow filtering and sorting
- **Output:** Paginated list of past rides
- **Priority:** Medium

#### 3.1.2 Ride & Feed Management

**FR-2.1: Create Ride Post (Driver)**

- **Description:** Drivers shall be able to create ride posts with route and details
- **Input:**
  - Origin point (GPS coordinates + address)
  - Destination point (GPS coordinates + address)
  - Departure date and time
  - Number of available seats (1-5)
  - Cost (per seat or total)
  - Optional: Recurring schedule
- **Process:**
  - Validate all input fields
  - Generate route using map API
  - Store route as PostGIS LINESTRING
  - Create ride post with status "Active"
  - Generate mini-map preview
- **Output:** Created ride post with unique ID
- **Priority:** Critical

**FR-2.2: Edit/Delete Ride Post**

- **Description:** Drivers shall be able to modify or remove their ride posts
- **Input:** Ride post ID, updated information OR delete command
- **Process:**
  - Verify user is the post owner
  - If edit: Update ride information, notify booked passengers
  - If delete: Cancel post, notify all passengers, refund if applicable
- **Output:** Updated or deleted ride post
- **Priority:** High

**FR-2.3: Recurring Rides**

- **Description:** Drivers shall be able to create recurring ride schedules
- **Input:** Ride details + recurrence pattern (daily, weekdays, custom)
- **Process:**
  - Create template ride post
  - Generate instances based on recurrence pattern
  - Auto-activate each instance at scheduled time
  - Allow individual instance modifications
- **Output:** Series of linked recurring ride posts
- **Priority:** Medium

**FR-2.4: Search Rides (Passenger)**

- **Description:** Passengers shall be able to search for rides matching their route
- **Input:**
  - Origin point (GPS coordinates + address)
  - Destination point (GPS coordinates + address)
  - Optional: Date/time range, price range, minimum rating
- **Process:**
  - Execute geospatial query using PostGIS ST_DWithin
  - Filter by buffer zone (500m-2km radius)
  - Check route directionality (origin before destination)
  - Apply additional filters (price, time, rating)
  - Sort by relevance (proximity, time, rating)
- **Output:** List of matching ride posts
- **Priority:** Critical

**FR-2.5: Social Feed Display**

- **Description:** System shall display active rides in a social feed format
- **Input:** User location (optional), filters
- **Process:**
  - Fetch active rides based on user's location or preferences
  - Display in reverse chronological order
  - Each post shows: driver photo, name, rating, route mini-map, seats, cost, time
  - Implement infinite scroll pagination
  - Real-time update when new posts are created
- **Output:** Scrollable feed of ride posts
- **Priority:** High

**FR-2.6: View Ride Details**

- **Description:** Users shall be able to view detailed information about a ride
- **Input:** Ride post ID
- **Process:**
  - Fetch ride details from database
  - Display full route on interactive map
  - Show driver profile and ratings
  - Show list of confirmed passengers
  - Display comments
  - Show "Join" button if seats available
- **Output:** Detailed ride view
- **Priority:** High

**FR-2.7: Comment on Ride**

- **Description:** Users shall be able to leave comments on ride posts
- **Input:** Ride post ID, comment text
- **Process:**
  - Validate comment (max length, profanity filter)
  - Store comment with timestamp and user ID
  - Notify post owner
  - Display in chronological order
- **Output:** Posted comment visible to all users
- **Priority:** Medium

#### 3.1.3 Booking Management

**FR-3.1: Request to Join Ride**

- **Description:** Passengers shall be able to request to join a ride
- **Input:**
  - Ride post ID
  - Number of seats requested (1-available seats)
  - Optional: Pickup location preference, comment
- **Process:**
  - Validate seats availability
  - Create booking with status "Pending"
  - Decrement available temporary seats
  - Send notification to driver
  - Store pickup preference
- **Output:** Booking request with pending status
- **Priority:** Critical

**FR-3.2: Approve/Reject Booking**

- **Description:** Drivers shall be able to approve or reject passenger requests
- **Input:** Booking ID, decision (approve/reject), optional reason
- **Process:**
  - Verify user is the driver
  - If approve:
    - Update booking status to "Approved"
    - Permanently decrement available seats
    - Send confirmation to passenger
    - Enable chat between driver and passenger
  - If reject:
    - Update booking status to "Rejected"
    - Restore temporary seat reservation
    - Send notification to passenger with reason
- **Output:** Updated booking status
- **Priority:** Critical

**FR-3.3: Cancel Booking**

- **Description:** Passengers shall be able to cancel their approved bookings
- **Input:** Booking ID, optional cancellation reason
- **Process:**
  - Verify user is the passenger
  - Check cancellation policy (time before departure)
  - Update booking status to "Cancelled"
  - Restore available seats
  - Notify driver
  - Process refund if applicable
- **Output:** Cancelled booking confirmation
- **Priority:** High

**FR-3.4: Real-time Seat Inventory**

- **Description:** System shall update available seats in real-time
- **Input:** Booking approval/cancellation events
- **Process:**
  - Update seat count atomically to prevent overbooking
  - If seats reach zero, set ride status to "Full"
  - Broadcast update to all viewing users
  - Remove from search results when full
- **Output:** Updated seat availability
- **Priority:** Critical

**FR-3.5: Manage Ride Status**

- **Description:** Drivers shall be able to start and end rides
- **Input:** Ride ID, action (start/end)
- **Process:**
  - If start:
    - Verify departure time is near
    - Update status to "In Progress"
    - Activate live tracking
    - Notify all passengers
  - If end:
    - Update status to "Completed"
    - Stop live tracking
    - Archive ride data
    - Trigger rating prompts
- **Output:** Updated ride status
- **Priority:** High

#### 3.1.4 Communication

**FR-4.1: In-app Chat**

- **Description:** System shall provide real-time chat between drivers and passengers
- **Input:** Message text, optional image, sender ID, recipient ID
- **Process:**
  - Validate users are connected through a booking
  - Transmit message via WebSocket (Socket.io)
  - Store message in database
  - Deliver real-time if recipient online
  - Send push notification if offline
  - Support image attachments
- **Output:** Delivered message
- **Priority:** High

**FR-4.2: Chat History**

- **Description:** System shall maintain chat history for active and past rides
- **Input:** Conversation ID
- **Process:**
  - Retrieve messages from database
  - Display in chronological order
  - Show read/delivered status
  - Load older messages on scroll
- **Output:** Chat message history
- **Priority:** Medium

**FR-4.3: Push Notifications**

- **Description:** System shall send push notifications for key events
- **Input:** Event type, user ID, event data
- **Process:**
  - Determine event type (booking request, approval, message, ride starting, etc.)
  - Format notification message
  - Send via platform notification service (FCM/APNS)
  - Store notification in user's inbox
  - Mark as read when user views
- **Output:** Push notification delivered
- **Events:**
  - New booking request received
  - Booking approved/rejected
  - New chat message
  - Ride starting soon (30 min reminder)
  - Driver is nearby
  - Ride started
  - Ride completed
- **Priority:** High

**FR-4.4: In-app Notifications**

- **Description:** Users shall be able to view notification history within app
- **Input:** User ID
- **Process:**
  - Fetch unread and recent notifications
  - Display with timestamp and action buttons
  - Allow marking as read
  - Link to relevant content (ride, chat, etc.)
- **Output:** Notification list
- **Priority:** Medium

#### 3.1.5 Real-time Tracking

**FR-5.1: Live Location Sharing**

- **Description:** System shall share driver's location in real-time during active rides
- **Input:** Driver's GPS coordinates (continuous stream)
- **Process:**
  - Capture driver location every 3-5 seconds
  - Store in Redis for fast access
  - Broadcast to all passengers via WebSocket
  - Calculate ETA to pickup points
  - Draw route on passenger's map
  - Auto-start when ride begins, auto-stop when ride ends
- **Output:** Real-time location updates to passengers
- **Priority:** High

**FR-5.2: ETA Calculation**

- **Description:** System shall calculate and display estimated time of arrival
- **Input:** Driver's current location, passenger's pickup point, traffic data
- **Process:**
  - Calculate route distance and time using map API
  - Factor in current traffic conditions
  - Update every 30 seconds
  - Display to passenger
- **Output:** ETA in minutes
- **Priority:** Medium

**FR-5.3: Trip Sharing**

- **Description:** Passengers shall be able to share trip details with trusted contacts
- **Input:** Ride ID, contact method (SMS, link)
- **Process:**
  - Generate secure shareable link
  - Link provides read-only access to:
    - Driver information
    - Live location
    - Ride route and details
  - Send via selected method
  - Track link access (optional)
- **Output:** Shareable trip link
- **Priority:** Medium

#### 3.1.6 Safety & Security

**FR-6.1: SOS Function**

- **Description:** System shall provide emergency alert functionality during active rides
- **Input:** SOS button press by passenger or driver
- **Process:**
  - Immediately capture current GPS location
  - Update ride status to "Emergency"
  - Send alert to admin dashboard with:
    - User information (both driver and passenger)
    - Current location
    - Ride details
    - Chat history
  - Notify user's emergency contacts
  - Optionally notify local authorities (if configured)
  - Log all actions
- **Output:** Emergency alert broadcast
- **Priority:** Critical

**FR-6.2: Report User**

- **Description:** Users shall be able to report inappropriate behavior
- **Input:** Reported user ID, reason category, description, optional evidence (screenshots)
- **Process:**
  - Create report with timestamp
  - Store in moderation queue
  - Notify admin team
  - Track report status
  - Prevent reported user from seeing reporter in future matches (optional)
- **Output:** Report submission confirmation
- **Priority:** High

**FR-6.3: Block User**

- **Description:** Users shall be able to block other users
- **Input:** User ID to block
- **Process:**
  - Add to user's block list
  - Prevent blocked user from:
    - Seeing blocker's posts
    - Joining blocker's rides
    - Sending messages to blocker
  - Hide blocker's posts from blocked user
- **Output:** Blocked user confirmation
- **Priority:** Medium

**FR-6.4: Trip Logging**

- **Description:** System shall maintain comprehensive logs of all ride activities
- **Input:** All ride-related events
- **Process:**
  - Log timestamps for all status changes
  - Store GPS coordinate history
  - Archive all chat messages
  - Record all booking actions
  - Store ratings and reviews
  - Retain for compliance period (e.g., 90 days)
- **Output:** Immutable trip logs
- **Priority:** High

#### 3.1.7 Payment & Cost Management

**FR-7.1: Cost Calculation**

- **Description:** System shall support flexible cost calculation methods
- **Input:** Ride distance, driver preferences, cost type
- **Process:**
  - Option 1: Auto-calculate based on distance (per km rate)
  - Option 2: Driver sets custom total cost
  - Option 3: Driver sets cost per seat
  - Display cost breakdown to passengers
  - Split costs among confirmed passengers
- **Output:** Calculated ride cost
- **Priority:** High

**FR-7.2: Internal Wallet**

- **Description:** Users shall have an internal wallet for transactions
- **Input:** Wallet operations (deposit, withdraw, transfer)
- **Process:**
  - For deposit:
    - Support bank card integration
    - Update wallet balance
    - Record transaction
  - For ride payment:
    - Automatically deduct from passenger wallet when ride completes
    - Transfer to driver wallet
    - Record transaction
  - For withdrawal:
    - Verify sufficient balance
    - Process to bank account
- **Output:** Updated wallet balance, transaction record
- **Priority:** High

**FR-7.3: Cash Payment Option**

- **Description:** System shall support cash payment for short-distance rides
- **Input:** Payment method selection (cash)
- **Process:**
  - Driver marks ride as cash-payment accepted
  - Passenger selects cash option during booking
  - System tracks but doesn't process payment
  - Both parties confirm payment completion after ride
- **Output:** Cash payment record
- **Priority:** Medium

**FR-7.4: Tipping**

- **Description:** Passengers shall be able to give optional tips
- **Input:** Tip amount, recipient ID
- **Process:**
  - After ride completion, show tip option
  - Allow custom or preset amounts
  - Transfer from passenger wallet to driver wallet
  - Record tip transaction
  - Update driver's tip statistics
- **Output:** Tip transaction confirmation
- **Priority:** Low

**FR-7.5: Transaction History**

- **Description:** Users shall be able to view all financial transactions
- **Input:** User ID, date range filter
- **Process:**
  - Query wallet transactions
  - Display: date, type, amount, balance, related ride
  - Support export to PDF/CSV
  - Calculate summaries (total spent, earned)
- **Output:** Transaction history list
- **Priority:** Medium

#### 3.1.8 Rating & Review System

**FR-8.1: Mutual Rating**

- **Description:** After ride completion, both driver and passenger shall rate each other
- **Input:** Ride ID, rating (1-5 stars), optional text review
- **Process:**
  - Trigger rating prompt when ride status becomes "Completed"
  - Accept rating from both parties
  - Store ratings separately
  - Calculate updated average rating
  - Update user profiles
  - Make reviews visible on profiles
- **Output:** Submitted rating and review
- **Priority:** High

**FR-8.2: Rating Calculation**

- **Description:** System shall calculate and maintain user trust scores
- **Input:** New rating
- **Process:**
  - Add to user's rating history
  - Calculate new average: $\text{Average} = \frac{\sum \text{ratings}}{n}$
  - Update total review count
  - Recalculate trust level
- **Output:** Updated average rating
- **Priority:** High

**FR-8.3: Trust Badge System**

- **Description:** System shall award trust badges to highly-rated users
- **Input:** User rating, review count
- **Process:**
  - If average ≥ 4.5 and reviews ≥ 20: Award "Trusted" badge
  - If average ≥ 4.8 and reviews ≥ 50: Award "Super Trusted" badge
  - If verified ID + high rating: Award "Verified & Trusted" badge
  - Display badges on profile and in feed
- **Output:** Badge assignment
- **Priority:** Medium

**FR-8.4: Low Rating Warnings**

- **Description:** System shall warn or restrict users with poor ratings
- **Input:** User rating threshold
- **Process:**
  - If average < 3.0: Send warning notification
  - If average < 2.5: Temporarily restrict posting rides
  - If average < 2.0: Suspend account pending review
  - Notify user of restriction and improvement path
- **Output:** Warning/restriction action
- **Priority:** Medium

#### 3.1.9 Community Circles

**FR-9.1: Create Verified Groups**

- **Description:** System shall support creation of verified community circles
- **Input:** Group type, verification method
- **Process:**
  - Organization email verification (@company.mn domain)
  - University student ID verification
  - Gender verification for ladies-only groups
  - Assign verified users to circle
  - Display circle badge on profile
- **Output:** Created verified circle
- **Priority:** Medium

**FR-9.2: Circle-based Filtering**

- **Description:** Users shall be able to filter rides by community circle
- **Input:** Circle ID, filter preference
- **Process:**
  - Show only posts from circle members
  - Give priority to circle members in search results
  - Allow "Circle Only" posting option for drivers
- **Output:** Filtered feed by circle
- **Priority:** Medium

**FR-9.3: Join Circle**

- **Description:** Users shall be able to request to join circles
- **Input:** Circle ID, verification credentials
- **Process:**
  - Submit verification (email, student ID, etc.)
  - Auto-approve if credentials valid
  - Manual review for ambiguous cases
  - Add user to circle upon approval
- **Output:** Circle membership
- **Priority:** Low

#### 3.1.10 Geospatial Processing

**FR-10.1: Route Matching Algorithm**

- **Description:** System shall match passenger requests to driver routes using geospatial analysis
- **Input:** Passenger origin/destination, driver route polyline
- **Process:**
  - Query: Find routes where passenger origin is within 500m-2km buffer:
    ```sql
    ST_DWithin(route, passenger_origin, 0.005)
    ```
  - Verify destination is also within buffer of route
  - Check directionality: origin point must come before destination on route
  - Calculate pickup point deviation time (< 10 min detour)
  - Rank results by proximity and time match
- **Output:** Ranked list of matching rides
- **Priority:** Critical

**FR-10.2: Snap to Road**

- **Description:** System shall correct GPS coordinates to nearest road
- **Input:** Raw GPS coordinates
- **Process:**
  - Call map API snap-to-road function
  - Receive corrected coordinates on actual road
  - Use corrected coordinates for route display
  - Store both raw and corrected coordinates
- **Output:** Road-snapped coordinates
- **Priority:** Medium

**FR-10.3: Proximity Alerts**

- **Description:** System shall notify passengers when driver is nearby
- **Input:** Driver location, passenger pickup point
- **Process:**
  - Continuously monitor driver location
  - Calculate distance to pickup point
  - When distance < 500m: Send "Driver is nearby" notification
  - When distance < 100m: Send "Driver is arriving" notification
- **Output:** Proximity notification
- **Priority:** Medium

**FR-10.4: Hotspot Suggestions**

- **Description:** System shall suggest common pickup points (bus stops, landmarks)
- **Input:** Passenger search location
- **Process:**
  - Identify nearby hotspots (bus stops, malls, universities)
  - Calculate distance to each
  - Suggest top 3 nearest hotspots
  - Allow passenger to select for easier driver coordination
- **Output:** Hotspot suggestion list
- **Priority:** Low

#### 3.1.11 Admin System

**FR-11.1: Dashboard Overview**

- **Description:** Admin shall have real-time system overview dashboard
- **Input:** Time range selection
- **Process:**
  - Display metrics:
    - Active rides count (real-time)
    - Today's bookings
    - New registrations (today/week/month)
    - System health (CPU, RAM, response time)
    - SOS alerts (active and resolved)
  - Refresh every 30 seconds
  - Support date range filtering
- **Output:** Dashboard with metrics
- **Priority:** High

**FR-11.2: Content Moderation**

- **Description:** Admin shall be able to review and moderate user content
- **Input:** Content ID, moderation action
- **Process:**
  - Queue flagged posts and comments
  - Display content with context
  - Actions available:
    - Approve (remove from queue)
    - Delete content
    - Warn user
    - Suspend user (temporary/permanent)
  - Log all moderation actions
  - Notify user of action taken
- **Output:** Moderation action confirmation
- **Priority:** High

**FR-11.3: User Management**

- **Description:** Admin shall be able to manage user accounts
- **Input:** User ID, management action
- **Process:**
  - View complete user profile and history
  - Actions:
    - Verify/unverify identity
    - Suspend/unsuspend account
    - Reset password
    - Adjust trust score
    - View all user's rides and reviews
  - Log all admin actions
- **Output:** Updated user status
- **Priority:** High

**FR-11.4: SOS Alert Management**

- **Description:** Admin shall be able to respond to SOS alerts
- **Input:** SOS alert ID
- **Process:**
  - Display alert details:
    - User information
    - Current location (live if still active)
    - Ride details
    - Chat history
  - Actions:
    - Contact emergency services
    - Contact users involved
    - Escalate to authorities
    - Mark as resolved
  - Track resolution status
- **Output:** SOS alert resolution
- **Priority:** Critical

**FR-11.5: Reports and Analytics**

- **Description:** Admin shall be able to generate system reports
- **Input:** Report type, date range, filters
- **Process:**
  - Generate reports:
    - User growth statistics
    - Ride completion rates
    - Revenue/transaction summaries
    - Average ratings trends
    - Popular routes
    - SOS incident reports
  - Export to PDF/Excel
  - Schedule automated reports
- **Output:** Generated report
- **Priority:** Medium

#### 3.1.12 Additional Features

**FR-12.1: Instant Book Mode**

- **Description:** System shall support quick booking without chat for urgent rides
- **Input:** Instant book toggle (driver), join request (passenger)
- **Process:**
  - Driver enables instant book on ride post
  - Passenger join request is auto-approved if seats available
  - Chat remains available but booking is immediate
  - Notification sent to both parties
- **Output:** Instantly confirmed booking
- **Priority:** Low

**FR-12.2: Multi-language Support**

- **Description:** System shall support multiple languages
- **Input:** Language preference selection
- **Process:**
  - Support Mongolian and English
  - Translate UI elements
  - Store user language preference
  - Display content in selected language
- **Output:** Localized user interface
- **Priority:** Medium

**FR-12.3: Offline Mode**

- **Description:** System shall provide limited functionality offline
- **Input:** Network disconnection
- **Process:**
  - Cache user profile and recent rides
  - Allow viewing cached ride history
  - Queue actions (messages, ratings) for later sync
  - Show offline indicator
  - Sync when connection restored
- **Output:** Limited offline functionality
- **Priority:** Low

---

### 3.2 Non-Functional Requirements

#### 3.2.1 Performance Requirements

**NFR-1.1: Response Time**

- API response time shall be < 500ms for 95% of requests
- Search queries shall return results in < 2 seconds
- Real-time location updates shall have latency < 3 seconds
- Feed scroll shall load new items in < 1 second

**NFR-1.2: Throughput**

- System shall support minimum 10,000 concurrent users
- Handle 1,000 simultaneous active rides
- Process 100 booking requests per minute
- Support 50 messages per second in chat system

**NFR-1.3: Database Performance**

- Geospatial queries shall execute in < 500ms
- Database connection pool shall support 200 concurrent connections
- PostGIS spatial index shall be maintained for all route data

**NFR-1.4: Mobile App Performance**

- App shall launch in < 3 seconds on mid-range devices
- Map rendering shall be smooth at 30+ FPS
- Battery drain shall not exceed 5% per hour during tracking
- App size shall be < 50MB

#### 3.2.2 Scalability Requirements

**NFR-2.1: Horizontal Scaling**

- System architecture shall support horizontal scaling of all microservices
- Kubernetes cluster shall auto-scale based on CPU/memory thresholds (>70%)
- Load balancer shall distribute traffic across multiple instances

**NFR-2.2: Database Scaling**

- PostgreSQL shall support read replicas for scaling reads
- Redis cluster shall be used for distributed caching
- Database shall handle 1M+ ride records efficiently

**NFR-2.3: Geographic Scaling**

- System shall support deployment in multiple regions
- CDN shall be used for static assets (maps, images)
- Database replication across regions for disaster recovery

#### 3.2.3 Reliability & Availability

**NFR-3.1: Uptime**

- System shall maintain 99.5% uptime (< 3.6 hours downtime/month)
- Planned maintenance shall be scheduled during low-traffic periods
- Zero-downtime deployment shall be implemented

**NFR-3.2: Fault Tolerance**

- Critical services shall have redundancy (minimum 2 instances)
- System shall gracefully degrade if non-critical services fail
- Automatic failover for database and cache services
- Circuit breaker pattern for external API calls

**NFR-3.3: Data Backup**

- Database shall be backed up daily with 30-day retention
- Transaction logs shall be backed up every hour
- Point-in-time recovery capability within 24 hours
- Backup restoration test quarterly

**NFR-3.4: Error Handling**

- All errors shall be logged with stack traces
- User-facing errors shall display friendly messages
- Critical errors shall trigger admin alerts
- Automatic retry for transient failures (max 3 attempts)

#### 3.2.4 Security Requirements

**NFR-4.1: Authentication**

- JWT tokens shall expire after 7 days of inactivity
- Refresh tokens shall be securely stored and rotated
- Multi-factor authentication via SMS OTP
- Password storage using bcrypt with salt (cost factor 12)

**NFR-4.2: Authorization**

- Role-based access control (RBAC) for all endpoints
- Drivers can only modify their own rides
- Passengers can only access their bookings
- Admin-only routes protected with separate auth layer

**NFR-4.3: Data Encryption**

- All API communication via HTTPS/TLS 1.3
- Sensitive data encrypted at rest (AES-256)
- Database connections encrypted
- Private keys stored in secure key management system

**NFR-4.4: Privacy**

- Phone numbers masked in UI (show only last 4 digits)
- Location data shared only during active rides
- Chat history encrypted end-to-end (optional)
- Users can delete their accounts and data (GDPR compliance)

**NFR-4.5: API Security**

- Rate limiting: 100 requests per minute per user
- API keys required for all integrations
- Input validation and sanitization on all endpoints
- SQL injection prevention via parameterized queries
- XSS protection in frontend

**NFR-4.6: Session Management**

- Secure session handling with HttpOnly cookies
- Session timeout after 30 minutes of inactivity
- Logout invalidates all tokens
- Device-specific sessions tracked

#### 3.2.5 Maintainability

**NFR-5.1: Code Quality**

- Code coverage shall be minimum 70% for unit tests
- All code shall pass ESLint/TSLint checks
- Code reviews required before merging to main branch
- Follow Airbnb style guide for JavaScript/TypeScript

**NFR-5.2: Documentation**

- All APIs documented with OpenAPI/Swagger
- Inline code comments for complex logic
- README files for each microservice
- Architecture diagrams kept up-to-date

**NFR-5.3: Monitoring & Logging**

- Centralized logging via ELK Stack (Elasticsearch, Logstash, Kibana)
- Application metrics via Prometheus
- Real-time dashboards via Grafana
- Log retention: 90 days for debug logs, 1 year for audit logs

**NFR-5.4: Versioning**

- Semantic versioning for APIs (v1.x.x)
- Backward compatibility for at least 2 major versions
- Deprecation warnings 3 months before removal
- Git-based version control with tagged releases

#### 3.2.6 Portability

**NFR-6.1: Platform Independence**

- Backend services containerized with Docker
- Database migrations portable across PostgreSQL versions 13+
- Frontend compatible with iOS 13+ and Android 8.0+

**NFR-6.2: Cloud Agnostic**

- Infrastructure defined as code (Terraform/Helm)
- Ability to deploy on AWS, GCP, or DigitalOcean
- No vendor-specific services in core logic

#### 3.2.7 Usability

**NFR-7.1: User Interface**

- UI shall follow Material Design (Android) and Human Interface Guidelines (iOS)
- All text shall have minimum contrast ratio 4.5:1 (WCAG AA)
- Touch targets shall be minimum 44x44 points
- Offline indicators shall be clearly visible

**NFR-7.2: Accessibility**

- Screen reader support for visually impaired users
- Alternative text for all images
- Keyboard navigation support in web admin panel
- Font size adjustable up to 200%

**NFR-7.3: User Experience**

- Maximum 3 taps to complete any core action
- Loading indicators for operations > 1 second
- Confirmation dialogs for destructive actions
- Contextual help and tooltips

**NFR-7.4: Learnability**

- First-time user onboarding flow (5 screens max)
- In-app tutorials for key features
- FAQ section accessible from menu
- Error messages shall provide actionable guidance

#### 3.2.8 Localization

**NFR-8.1: Language Support**

- Support Mongolian (Cyrillic) and English
- Unicode support for all text fields
- RTL (Right-to-Left) ready architecture for future expansion

**NFR-8.2: Regional Settings**

- Date/time formats based on user locale
- Currency display in Mongolian Tugrik (₮)
- Distance units in kilometers

#### 3.2.9 Compliance

**NFR-9.1: Legal Compliance**

- System categorized as "ride-sharing" not "commercial taxi"
- Terms of Service acceptance required during registration
- Privacy policy compliant with local data protection laws
- Age restriction: users must be 18+ years old

**NFR-9.2: Data Retention**

- Active ride data: retained indefinitely
- Completed ride data: 1 year minimum for disputes
- User data: retained until account deletion requested
- Logs: 90 days operational, 1 year audit logs

---

### 3.3 External Interface Requirements

#### 3.3.1 User Interfaces

**UI-1: Mobile Application Screens**

The mobile application shall include the following main screens:

1. **Splash Screen**

   - App logo and loading indicator
   - Version number

2. **Authentication Screens**

   - Login/Register screen with phone number input
   - OTP verification screen
   - Profile setup screen (role selection, basic info)
   - Identity verification screen (ID upload, selfie)

3. **Home/Feed Screen**

   - Top navigation bar with filters and search
   - Infinite scroll feed of ride posts
   - Each post card displaying:
     - Driver photo, name, verified badge, rating
     - Origin → Destination with mini-map
     - Departure time, available seats, cost
     - "Join" button and comment count
   - Floating action button to create ride (drivers)

4. **Ride Detail Screen**

   - Full-size interactive map with route
   - Complete ride information
   - Driver/passenger profile section
   - List of confirmed passengers (if driver)
   - Comment section
   - "Join" or "Manage Bookings" button

5. **Search Screen**

   - Origin and destination input with autocomplete
   - Map interface for point selection
   - Date/time picker
   - Filter options (price, rating, seats)
   - Results list with sorting options

6. **Create/Edit Ride Screen**

   - Route selection on map
   - Date/time picker
   - Seats and cost input
   - Recurring ride options
   - Preview before posting

7. **My Rides Screen**

   - Tab: As Driver / As Passenger
   - List of upcoming rides
   - List of past rides
   - Filter and search options

8. **Bookings Screen**

   - Pending requests (for drivers)
   - Approved bookings
   - Each with accept/reject or cancel actions
   - Passenger/driver profile quick view

9. **Active Ride Screen**

   - Large map view with live tracking
   - Driver/passenger info panel
   - ETA display
   - Chat button
   - SOS button (prominent red)
   - "End Ride" button (for drivers)

10. **Chat Screen**

    - Message history
    - Text input with send button
    - Image attachment option
    - Typing indicators
    - Read receipts

11. **Profile Screen**

    - User photo and basic info
    - Rating and review statistics
    - Badges and verification status
    - Edit profile button
    - Ride history
    - Settings access

12. **Wallet Screen**

    - Current balance display
    - Add funds button
    - Transaction history list
    - Withdrawal option

13. **Notifications Screen**

    - List of all notifications
    - Mark as read functionality
    - Deep links to related content

14. **Settings Screen**

    - Language selection
    - Notification preferences
    - Privacy settings
    - Help & Support
    - About & Version
    - Logout

15. **Rating Screen**
    - Star rating selector (1-5)
    - Text review input
    - Optional tip amount
    - Submit button

**UI-2: Admin Web Dashboard**

The admin web dashboard shall include:

1. **Login Screen**

   - Admin credentials input
   - Two-factor authentication

2. **Main Dashboard**

   - Key metrics cards (active rides, users, bookings)
   - Real-time charts (rides over time, user growth)
   - System health indicators
   - Recent SOS alerts section

3. **Users Management**

   - Searchable user list
   - User detail view
   - Actions: verify, suspend, delete
   - User activity history

4. **Rides Management**

   - All rides list with filters
   - Ride detail view
   - Moderation actions

5. **Content Moderation Queue**

   - Flagged posts and comments
   - Review interface
   - Approve/delete/warn actions

6. **Reports & Analytics**

   - Report generator with filters
   - Charts and graphs
   - Export functionality

7. **SOS Alerts**

   - Active alerts (flashing indicator)
   - Alert history
   - Alert detail with map and context
   - Resolution tracking

8. **System Monitoring**
   - Grafana dashboard embed
   - Server metrics
   - API performance
   - Error logs

#### 3.3.2 Hardware Interfaces

**HW-1: GPS Sensor**

- **Interface:** Mobile device GPS chip via platform APIs
- **Data:** Latitude, longitude, accuracy, altitude, speed
- **Frequency:** Every 3-5 seconds during active tracking
- **Accuracy:** Minimum 10-meter accuracy required

**HW-2: Camera**

- **Interface:** Mobile device camera via platform APIs
- **Purpose:** Capture ID photos and selfies for verification
- **Resolution:** Minimum 2MP for facial recognition
- **Format:** JPEG with EXIF data

**HW-3: Network Interface**

- **Interface:** WiFi and cellular data via platform network APIs
- **Protocols:** HTTPS, WebSocket
- **Requirements:** Minimum 3G connectivity for core features

#### 3.3.3 Software Interfaces

**SW-1: Map Services (Mapbox/Google Maps)**

- **Interface:** REST API and SDK
- **Functions:**
  - Geocoding (address ↔ coordinates)
  - Route calculation and drawing
  - Distance matrix calculation
  - Snap to road
  - Static map image generation
- **Data Format:** JSON (GeoJSON for geometries)
- **Authentication:** API key
- **Rate Limits:** Per vendor terms

**SW-2: PostgreSQL Database**

- **Version:** 13+ with PostGIS 3.0+
- **Interface:** pg library (Node.js), connection pooling
- **Protocol:** PostgreSQL wire protocol
- **Functions:**
  - CRUD operations
  - Geospatial queries (ST_DWithin, ST_Contains, etc.)
  - Full-text search
  - JSON operations
- **Connection:** SSL/TLS encrypted

**SW-3: Redis Cache**

- **Version:** 6+
- **Interface:** redis/ioredis library (Node.js)
- **Functions:**
  - Session storage
  - Real-time location caching
  - Rate limiting
  - Pub/Sub for WebSocket scaling
- **Protocol:** RESP (Redis Serialization Protocol)

**SW-4: SMS Gateway**

- **Interface:** REST API (provider-specific)
- **Purpose:** Send OTP verification codes
- **Format:** JSON request/response
- **Authentication:** API key or OAuth
- **Fallback:** Alternative provider in case of primary failure

**SW-5: И-Монгол/National ID Service**

- **Interface:** REST API (government-provided)
- **Purpose:** Identity verification
- **Data Exchange:** Encrypted citizen information
- **Authentication:** Government-issued credentials
- **Compliance:** Data protection regulations

**SW-6: Payment Gateway (Future)**

- **Interface:** REST API
- **Purpose:** Bank card deposits, withdrawals
- **Protocol:** HTTPS with PCI-DSS compliance
- **Data Format:** JSON
- **Security:** Tokenization of card data

**SW-7: Push Notification Services**

- **iOS:** Apple Push Notification Service (APNS)
  - Protocol: HTTP/2
  - Authentication: Token-based (p8 certificate)
- **Android:** Firebase Cloud Messaging (FCM)
  - Protocol: HTTPS
  - Authentication: Server key

**SW-8: Object Storage (AWS S3 / Compatible)**

- **Interface:** S3 API
- **Purpose:** Store user photos, ID images, chat attachments
- **Protocol:** HTTPS
- **Authentication:** Access key and secret
- **Data Format:** Binary objects with metadata

**SW-9: Monitoring Stack**

- **Prometheus:**
  - Interface: HTTP metrics endpoint
  - Format: OpenMetrics/Prometheus format
  - Scrape interval: 30 seconds
- **Grafana:**
  - Interface: HTTP API
  - Data source: Prometheus
  - Dashboards: JSON configuration
- **ELK Stack:**
  - Logstash: Beats protocol
  - Elasticsearch: REST API
  - Kibana: Web UI

**SW-10: AI/ML Service (Face Verification)**

- **Interface:** REST API or SDK
- **Purpose:** Compare ID photo with selfie
- **Input:** Two images (JPEG/PNG)
- **Output:** Match confidence score (0-100%)
- **Provider:** AWS Rekognition, Azure Face API, or open-source (DeepFace)

#### 3.3.4 Communication Interfaces

**COM-1: HTTP/HTTPS**

- **Protocol:** HTTP/2 over TLS 1.3
- **Port:** 443
- **Format:** JSON (request/response bodies)
- **Headers:**
  - Authorization: Bearer {JWT}
  - Content-Type: application/json
- **Status Codes:** Standard HTTP codes (200, 400, 401, 404, 500, etc.)

**COM-2: WebSocket**

- **Protocol:** WebSocket (RFC 6455) over TLS
- **Port:** 443 (same as HTTPS)
- **Library:** Socket.io
- **Purpose:** Real-time chat, location updates, notifications
- **Message Format:** JSON
- **Events:**
  - `message`: Chat messages
  - `location`: GPS coordinates
  - `notification`: Push notifications
  - `booking_update`: Booking status changes
- **Authentication:** JWT token in connection handshake

**COM-3: Database Connection**

- **Protocol:** PostgreSQL wire protocol over TLS
- **Port:** 5432
- **Connection Pooling:** Max 200 connections
- **Timeout:** 30 seconds
- **Retry:** 3 attempts with exponential backoff

**COM-4: Mobile App to Backend**

- **Base URL:** https://api.hopon.mn/v1
- **Authentication:** JWT in Authorization header
- **Request Format:** JSON
- **Response Format:** JSON
- **Error Format:**
  ```json
  {
    "error": "ERROR_CODE",
    "message": "Human-readable message",
    "details": {}
  }
  ```

**COM-5: Admin Dashboard to Backend**

- **Base URL:** https://admin.hopon.mn/api
- **Authentication:** Separate admin JWT
- **CORS:** Restricted to admin domain only
- **Rate Limiting:** Higher limits for admin users

---

## Appendices

### Appendix A: Glossary

- **Buffer Zone:** A geographic area around a route used for matching passengers
- **Carpooling:** Sharing a vehicle journey with others to reduce costs
- **Circle:** A verified community group within the app
- **ETA:** Estimated Time of Arrival
- **Feed:** Social media-style list of ride posts
- **Geofencing:** Virtual perimeter for real-world geographic area
- **Hotspot:** Common pickup/dropoff location (bus stop, landmark)
- **JWT:** JSON Web Token for authentication
- **Mini-map:** Small embedded map preview on ride post cards
- **OTP:** One-Time Password for verification
- **PostGIS:** Spatial database extension for PostgreSQL
- **Snap to Road:** Correcting GPS coordinates to nearest road
- **SOS:** Emergency distress signal
- **Trust Score:** Aggregate rating indicating user reliability
- **Verified Badge:** Indicator showing identity verification status
- **Wallet:** Internal account balance for transactions

### Appendix B: Technology Stack Summary

| Layer                   | Technology                        |
| ----------------------- | --------------------------------- |
| Mobile App              | React Native / Flutter            |
| Backend Framework       | Node.js with NestJS               |
| API Gateway             | Kong / NGINX                      |
| Primary Database        | PostgreSQL 13+ with PostGIS       |
| Cache/Real-time         | Redis 6+                          |
| Real-time Communication | Socket.io                         |
| Map Services            | Mapbox SDK                        |
| Authentication          | JWT + Firebase Auth               |
| Containerization        | Docker                            |
| Orchestration           | Kubernetes (EKS/GKE)              |
| CI/CD                   | GitHub Actions / GitLab CI        |
| Monitoring              | Prometheus + Grafana              |
| Logging                 | ELK Stack                         |
| Cloud Provider          | AWS / Google Cloud / DigitalOcean |
| CDN                     | CloudFront / Cloudinary           |

### Appendix C: API Endpoint Examples

**POST /api/v1/rides**

```json
Request:
{
  "origin": {"lat": 47.9184, "lng": 106.9177, "address": "Төв номын сан"},
  "destination": {"lat": 49.4665, "lng": 105.9785, "address": "Дархан төв талбай"},
  "departure_time": "2025-12-21T10:00:00Z",
  "seats_available": 3,
  "cost_per_seat": 15000,
  "currency": "MNT"
}

Response:
{
  "id": "ride_123456",
  "status": "active",
  "route_polyline": "encoded_polyline_string",
  "created_at": "2025-12-20T15:30:00Z"
}
```

**GET /api/v1/rides/search**

```json
Request:
?origin_lat=47.9184&origin_lng=106.9177
&dest_lat=49.4665&dest_lng=105.9785
&date=2025-12-21&max_price=20000

Response:
{
  "results": [
    {
      "id": "ride_123456",
      "driver": {
        "id": "user_789",
        "name": "Болд",
        "rating": 4.8,
        "verified": true
      },
      "route": { ... },
      "departure_time": "2025-12-21T10:00:00Z",
      "seats_available": 3,
      "cost_per_seat": 15000
    }
  ],
  "total": 1
}
```

### Appendix D: Database Schema Highlights

**Users Table:**

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  phone VARCHAR(20) UNIQUE,
  email VARCHAR(255),
  name VARCHAR(100),
  role VARCHAR(20), -- 'driver', 'passenger', 'both'
  rating DECIMAL(3,2),
  review_count INT,
  verified BOOLEAN,
  created_at TIMESTAMP
);
```

**Rides Table:**

```sql
CREATE TABLE rides (
  id UUID PRIMARY KEY,
  driver_id UUID REFERENCES users(id),
  route GEOMETRY(LineString, 4326),
  origin_point GEOMETRY(Point, 4326),
  destination_point GEOMETRY(Point, 4326),
  departure_time TIMESTAMP,
  seats_total INT,
  seats_available INT,
  cost_per_seat DECIMAL(10,2),
  status VARCHAR(20), -- 'active', 'full', 'in_progress', 'completed'
  created_at TIMESTAMP
);

CREATE INDEX idx_route_geom ON rides USING GIST(route);
```

**Bookings Table:**

```sql
CREATE TABLE bookings (
  id UUID PRIMARY KEY,
  ride_id UUID REFERENCES rides(id),
  passenger_id UUID REFERENCES users(id),
  seats_booked INT,
  status VARCHAR(20), -- 'pending', 'approved', 'rejected', 'cancelled'
  pickup_note TEXT,
  created_at TIMESTAMP
);
```

---

**Document End**

_This SRS is a living document and will be updated as requirements evolve during development._
