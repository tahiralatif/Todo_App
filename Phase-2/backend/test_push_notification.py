"""Test push notification system end-to-end"""
import asyncio
from src.db import AsyncSessionLocal
from src.services.push_notification_service import PushNotificationService
from sqlalchemy import select, text
from src.models.user import PushSubscription

async def test_push_notifications():
    print("\n" + "="*60)
    print("TESTING PUSH NOTIFICATION SYSTEM")
    print("="*60 + "\n")
    
    push_service = PushNotificationService()
    
    async with AsyncSessionLocal() as session:
        # Check if there are any push subscriptions
        result = await session.execute(select(PushSubscription))
        subscriptions = result.scalars().all()
        
        print(f"✓ Found {len(subscriptions)} push subscription(s) in database\n")
        
        if len(subscriptions) == 0:
            print("❌ No push subscriptions found!")
            print("   Please enable notifications in the browser first.\n")
            print("Steps:")
            print("1. Go to http://localhost:3000/dashboard")
            print("2. Click 'Enable Reminders' button")
            print("3. Allow notifications when browser asks")
            print("4. Run this script again\n")
            return
        
        # Show subscription details
        for i, sub in enumerate(subscriptions, 1):
            print(f"Subscription {i}:")
            print(f"  - User ID: {sub.user_id}")
            print(f"  - Endpoint: {sub.endpoint[:50]}...")
            print(f"  - Created: {sub.created_at}\n")
        
        # Test sending notification to first subscription
        test_sub = subscriptions[0]
        print(f"📤 Sending test notification to user {test_sub.user_id}...\n")
        
        try:
            success = await push_service.send_notification(
                subscription_info={
                    'endpoint': test_sub.endpoint,
                    'keys': {
                        'p256dh': test_sub.p256dh,
                        'auth': test_sub.auth
                    }
                },
                title="🎉 Test Notification",
                body="If you see this, push notifications are working!",
                data={'test': True}
            )
            
            if success:
                print("✅ Notification sent successfully!")
                print("   Check your browser for the notification.\n")
            else:
                print("❌ Failed to send notification")
                print("   Check the logs above for errors.\n")
                
        except Exception as e:
            print(f"❌ Error sending notification: {e}\n")
    
    print("="*60)
    print("TEST COMPLETE")
    print("="*60 + "\n")

if __name__ == "__main__":
    asyncio.run(test_push_notifications())
