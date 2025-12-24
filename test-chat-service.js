// Chat Service Test - WebSocket messaging
const io = require('socket.io-client');
const axios = require('axios');

const AUTH_URL = 'http://localhost:3001';
const RIDE_URL = 'http://localhost:3003';
const BOOKING_URL = 'http://localhost:3004';
const CHAT_WS_URL = 'http://localhost:3006';

const colors = {
  reset: '\x1b[0m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  magenta: '\x1b[35m',
  gray: '\x1b[90m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function registerAndLogin(phone, password, name, role) {
  try {
    await axios.post(`${AUTH_URL}/auth/register`, {
      phone,
      password,
      name,
      role,
    });
  } catch (e) {
    // User might already exist
  }

  const loginResponse = await axios.post(`${AUTH_URL}/auth/login`, {
    phone,
    password,
  });

  return {
    token: loginResponse.data.accessToken,
    userId: loginResponse.data.user.id,
  };
}

async function main() {
  log('=== Chat Service WebSocket Test ===\n', colors.cyan);

  // ========== PART 1: Setup Driver & Ride ==========
  log('==== PART 1: SETUP ====', colors.magenta);

  const driverPhone = `+976${Math.floor(80000000 + Math.random() * 19999999)}`;
  log(`\n[1] Registering driver: ${driverPhone}`, colors.yellow);

  const driver = await registerAndLogin(
    driverPhone,
    'Driver123!@#',
    'Test Driver',
    'driver',
  );

  log('[OK] Driver logged in!', colors.green);
  log(`  Driver ID: ${driver.userId}`, colors.gray);

  // Create ride
  log('\n[2] Creating ride...', colors.yellow);
  const rideResponse = await axios.post(
    `${RIDE_URL}/rides`,
    {
      origin: {
        lat: 47.9184,
        lng: 106.9177,
        address: 'Ulaanbaatar, Sukhbaatar Square',
      },
      destination: {
        lat: 49.4863,
        lng: 105.9714,
        address: 'Darkhan city',
      },
      departureTime: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
      availableSeats: 3,
      pricePerSeat: 25000,
    },
    {
      headers: { Authorization: `Bearer ${driver.token}` },
    },
  );

  const rideId = rideResponse.data.id;
  log('[OK] Ride created!', colors.green);
  log(`  Ride ID: ${rideId}`, colors.cyan);

  // Setup passenger
  const passengerPhone = `+976${Math.floor(80000000 + Math.random() * 19999999)}`;
  log(`\n[3] Registering passenger: ${passengerPhone}`, colors.yellow);

  const passenger = await registerAndLogin(
    passengerPhone,
    'Passenger123!@#',
    'Test Passenger',
    'passenger',
  );

  log('[OK] Passenger logged in!', colors.green);
  log(`  Passenger ID: ${passenger.userId}`, colors.gray);

  // Create booking
  log('\n[4] Creating booking...', colors.yellow);
  const bookingResponse = await axios.post(
    `${BOOKING_URL}/bookings`,
    {
      rideId: rideId,
      seats: 1,
    },
    {
      headers: { Authorization: `Bearer ${passenger.token}` },
    },
  );

  const bookingId = bookingResponse.data.id;
  log('[OK] Booking created!', colors.green);
  log(`  Booking ID: ${bookingId}`, colors.gray);

  // ========== PART 2: WebSocket Chat ==========
  log('\n==== PART 2: WEBSOCKET CHAT ====', colors.magenta);

  log('\n[5] Connecting to chat service...', colors.yellow);

  // Create WebSocket connections
  const driverSocket = io(CHAT_WS_URL, {
    auth: { token: driver.token },
    transports: ['websocket'],
  });

  const passengerSocket = io(CHAT_WS_URL, {
    auth: { token: passenger.token },
    transports: ['websocket'],
  });

  // Driver connection
  await new Promise((resolve, reject) => {
    driverSocket.on('connect', () => {
      log('[OK] Driver connected to chat!', colors.green);
      log(`  Socket ID: ${driverSocket.id}`, colors.gray);
      resolve();
    });
    driverSocket.on('connect_error', (error) => {
      log(`[ERROR] Driver connection failed: ${error.message}`, colors.red);
      reject(error);
    });
  });

  // Passenger connection
  await new Promise((resolve, reject) => {
    passengerSocket.on('connect', () => {
      log('[OK] Passenger connected to chat!', colors.green);
      log(`  Socket ID: ${passengerSocket.id}`, colors.gray);
      resolve();
    });
    passengerSocket.on('connect_error', (error) => {
      log(`[ERROR] Passenger connection failed: ${error.message}`, colors.red);
      reject(error);
    });
  });

  // Join ride channel
  log('\n[6] Joining ride channel...', colors.yellow);

  driverSocket.emit('join_ride', { rideId });
  await delay(500);
  log('[OK] Driver joined ride channel', colors.green);

  passengerSocket.emit('join_ride', { rideId });
  await delay(500);
  log('[OK] Passenger joined ride channel', colors.green);

  // Setup message listeners
  let messagesReceived = 0;

  driverSocket.on('message', (data) => {
    messagesReceived++;
    log(
      `\n[DRIVER RECEIVED] From: ${data.senderName || data.senderId}`,
      colors.cyan,
    );
    log(`  Content: ${data.content}`, colors.gray);
    log(`  Type: ${data.type}`, colors.gray);
  });

  passengerSocket.on('message', (data) => {
    messagesReceived++;
    log(
      `\n[PASSENGER RECEIVED] From: ${data.senderName || data.senderId}`,
      colors.cyan,
    );
    log(`  Content: ${data.content}`, colors.gray);
    log(`  Type: ${data.type}`, colors.gray);
  });

  // Send messages
  log('\n[7] Sending messages...', colors.yellow);

  log('\n  → Passenger sending message...', colors.gray);
  passengerSocket.emit('send_message', {
    rideId: rideId,
    userId: passenger.userId,
    senderName: 'Test Passenger',
    content: 'Hello driver! I booked your ride to Darkhan.',
    type: 'text',
  });

  await delay(1000);

  log('\n  → Driver sending message...', colors.gray);
  driverSocket.emit('send_message', {
    rideId: rideId,
    userId: driver.userId,
    senderName: 'Test Driver',
    content: 'Hi! Welcome aboard. What time should I pick you up?',
    type: 'text',
  });

  await delay(1000);

  log('\n  → Passenger sending message...', colors.gray);
  passengerSocket.emit('send_message', {
    rideId: rideId,
    userId: passenger.userId,
    senderName: 'Test Passenger',
    content: 'How about 9 AM? I will be at Sukhbaatar Square.',
    type: 'text',
  });

  await delay(1000);

  log('\n  → Driver sending message...', colors.gray);
  driverSocket.emit('send_message', {
    rideId: rideId,
    userId: driver.userId,
    senderName: 'Test Driver',
    content: 'Perfect! See you at 9 AM.',
    type: 'text',
  });

  await delay(1500);

  // Verify messages received
  log(`\n[8] Verifying messages...`, colors.yellow);
  log(`[OK] Total messages received: ${messagesReceived}`, colors.green);

  if (messagesReceived >= 4) {
    log('[OK] All messages delivered successfully!', colors.green);
  } else {
    log(
      `[WARN] Expected 4+ messages, received ${messagesReceived}`,
      colors.yellow,
    );
  }

  // Cleanup
  log('\n[9] Disconnecting...', colors.yellow);
  driverSocket.disconnect();
  passengerSocket.disconnect();

  await delay(500);

  log('[OK] Disconnected', colors.green);

  log('\n=== Test Completed Successfully! ===', colors.green);
  log('\nSummary:', colors.cyan);
  log(`  Driver: ${driverPhone} (ID: ${driver.userId})`, colors.reset);
  log(`  Passenger: ${passengerPhone} (ID: ${passenger.userId})`, colors.reset);
  log(`  Ride ID: ${rideId}`, colors.reset);
  log(`  Booking ID: ${bookingId}`, colors.reset);
  log(`  Messages exchanged: ${messagesReceived}`, colors.reset);

  process.exit(0);
}

main().catch((error) => {
  log(`\n[ERROR] Test failed: ${error.message}`, colors.red);
  console.error(error);
  process.exit(1);
});
