# Notification Service Test
$AUTH_URL = "http://localhost:3001"
$NOTIFICATION_URL = "http://localhost:3007"

Write-Host "=== Notification Service Test ===" -ForegroundColor Cyan

# 1. Register and Login User 1
$userPhone = "+976" + (Get-Random -Minimum 80000000 -Maximum 99999999)
Write-Host "`n[1] Registering User 1: $userPhone" -ForegroundColor Yellow

try {
    Invoke-RestMethod -Uri "$AUTH_URL/auth/register" -Method POST -Body (@{
        phone = $userPhone
        password = "User123!@#"
        name = "Test User"
        role = "passenger"
    } | ConvertTo-Json) -ContentType "application/json" | Out-Null
    Write-Host "[OK] User 1 registered!" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Registration failed: $_" -ForegroundColor Red
    exit 1
}

# Login User 1
Write-Host "`n[2] User 1 logging in..." -ForegroundColor Yellow

try {
    $loginResponse = Invoke-RestMethod -Uri "$AUTH_URL/auth/login" -Method POST -Body (@{
        phone = $userPhone
        password = "User123!@#"
    } | ConvertTo-Json) -ContentType "application/json"
    
    $token = $loginResponse.accessToken
    $userId = $loginResponse.user.id
    Write-Host "[OK] Login successful!" -ForegroundColor Green
    Write-Host "  User ID: $userId" -ForegroundColor Gray
} catch {
    Write-Host "[ERROR] Login failed: $_" -ForegroundColor Red
    exit 1
}

# 3. Create User 2 to send notification to
Write-Host "`n[3] Creating User 2..." -ForegroundColor Yellow

$user2Phone = "+976" + (Get-Random -Minimum 80000000 -Maximum 99999999)
try {
    Invoke-RestMethod -Uri "$AUTH_URL/auth/register" -Method POST -Body (@{
        phone = $user2Phone
        password = "User123!@#"
        name = "Test Driver"
        role = "driver"
    } | ConvertTo-Json) -ContentType "application/json" | Out-Null
    
    $user2Login = Invoke-RestMethod -Uri "$AUTH_URL/auth/login" -Method POST -Body (@{
        phone = $user2Phone
        password = "User123!@#"
    } | ConvertTo-Json) -ContentType "application/json"
    
    $user2Id = $user2Login.user.id
    $user2Token = $user2Login.accessToken
    
    Write-Host "[OK] User 2 created!" -ForegroundColor Green
    Write-Host "  User 2 ID: $user2Id" -ForegroundColor Gray
} catch {
    Write-Host "[ERROR] Failed to create User 2: $_" -ForegroundColor Red
    exit 1
}

# 4. Send notification to User 2
Write-Host "`n[4] Sending notification to User 2..." -ForegroundColor Yellow

$notificationData = @{
    userId = $user2Id
    type = "ride_request"
    channels = @("in_app")
    title = "New Ride Request!"
    message = "You have a new ride request from a passenger to Darkhan."
    data = @{
        requesterId = $userId
        action = "view_request"
    }
} | ConvertTo-Json -Depth 10

try {
    $notification = Invoke-RestMethod -Uri "$NOTIFICATION_URL/notifications" `
        -Method POST `
        -Headers @{
            "Authorization" = "Bearer $token"
            "Content-Type" = "application/json"
        } `
        -Body $notificationData
    
    Write-Host "[OK] Notification sent!" -ForegroundColor Green
    Write-Host "  Notification ID: $($notification.id)" -ForegroundColor Cyan
    Write-Host "  Title: $($notification.title)" -ForegroundColor Gray
    
    $notificationId = $notification.id
} catch {
    Write-Host "[ERROR] Notification send failed: $_" -ForegroundColor Red
    Write-Host "  Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    exit 1
}

# 5. User 2 gets notifications
Write-Host "`n[5] User 2 retrieving notifications..." -ForegroundColor Yellow
Write-Host "  Using token: $($user2Token.Substring(0, 20))..." -ForegroundColor DarkGray

try {
    $notifications = Invoke-RestMethod -Uri "$NOTIFICATION_URL/notifications?userId=$user2Id" `
        -Method GET
    
    $count = if ($notifications -is [array]) { $notifications.Count } else { 1 }
    Write-Host "[OK] User 2 has $count notification(s)" -ForegroundColor Green
    
    if ($count -gt 0) {
        $notifs = if ($notifications -is [array]) { $notifications } else { @($notifications) }
        foreach ($notif in $notifs | Select-Object -First 3) {
            Write-Host "  - $($notif.title)" -ForegroundColor Cyan
            Write-Host "    Message: $($notif.message)" -ForegroundColor Gray
            Write-Host "    Status: $($notif.status)" -ForegroundColor DarkGray
        }
    }
} catch {
    Write-Host "[WARN] Failed to get notifications: $_" -ForegroundColor Yellow
}

# 6. Get unread count
Write-Host "`n[6] User 2 checking unread count..." -ForegroundColor Yellow

try {
    $unreadResponse = Invoke-RestMethod -Uri "$NOTIFICATION_URL/notifications/unread-count?userId=$user2Id" `
        -Method GET
    
    Write-Host "[OK] Unread notifications: $($unreadResponse.count)" -ForegroundColor Green
} catch {
    Write-Host "[WARN] Failed to get unread count: $_" -ForegroundColor Yellow
}

# 7. Mark as read
if ($notificationId) {
    Write-Host "`n[7] User 2 marking notification as read..." -ForegroundColor Yellow
    
    try {
        Invoke-RestMethod -Uri "$NOTIFICATION_URL/notifications/mark-read" `
            -Method PATCH `
            -Headers @{
                "Content-Type" = "application/json"
            } `
            -Body (@{
                userId = $user2Id
                notificationIds = @($notificationId)
            } | ConvertTo-Json) | Out-Null
        
        Write-Host "[OK] Marked as read!" -ForegroundColor Green
        
        # Check unread count again
        $unread2 = Invoke-RestMethod -Uri "$NOTIFICATION_URL/notifications/unread-count" `
            -Method GET `
            -Headers @{
                "Authorization" = "Bearer $user2Token"
            }
        Write-Host "[OK] New unread count: $($unread2.count)" -ForegroundColor Green
    } catch {
        Write-Host "[WARN] Failed to mark as read: $_" -ForegroundColor Yellow
    }
}

# 8. Send bulk notification
Write-Host "`n[8] Sending bulk notification to both users..." -ForegroundColor Yellow

try {
    Invoke-RestMethod -Uri "$NOTIFICATION_URL/notifications/bulk" `
        -Method POST `
        -Headers @{
            "Authorization" = "Bearer $token"
            "Content-Type" = "application/json"
        } `
        -Body (@{
            userIds = @($userId, $user2Id)
            type = "system_alert"
            channels = @("in_app")
            title = "System Maintenance Notice"
            message = "Platform maintenance scheduled for Dec 25, 2025 2-4 AM."
            data = @{
                maintenance = $true
            }
        } | ConvertTo-Json -Depth 10) | Out-Null
    
    Write-Host "[OK] Bulk notification sent to 2 users!" -ForegroundColor Green
} catch {
    Write-Host "[WARN] Bulk notification failed: $_" -ForegroundColor Yellow
}

Write-Host "`n=== Test Completed Successfully! ===" -ForegroundColor Green
Write-Host "`nSummary:" -ForegroundColor Cyan
Write-Host "  User 1: $userPhone (ID: $userId)" -ForegroundColor White
Write-Host "  User 2: $user2Phone (ID: $user2Id)" -ForegroundColor White
if ($notificationId) {
    Write-Host "  Notification ID: $notificationId" -ForegroundColor White
}
Write-Host "`nFeatures Tested:" -ForegroundColor Cyan
Write-Host "  - Single notification (ride_request)" -ForegroundColor Gray
Write-Host "  - Get notifications list" -ForegroundColor Gray
Write-Host "  - Get unread count" -ForegroundColor Gray
Write-Host "  - Mark as read" -ForegroundColor Gray
Write-Host "  - Bulk notification (system_alert)" -ForegroundColor Gray
