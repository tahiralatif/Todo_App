"""Quick test to verify Neon database is working"""
import asyncio
from src.config import settings
from src.db import AsyncSessionLocal
from sqlalchemy import text

async def test_neon():
    print("\n" + "="*60)
    print("TESTING NEON DATABASE CONNECTION")
    print("="*60 + "\n")
    
    # Check configuration
    is_neon = "neon.tech" in settings.database_url
    is_sqlite = "sqlite" in settings.database_url
    
    print(f"✓ Using Neon: {is_neon}")
    print(f"✓ Using SQLite: {is_sqlite}")
    
    if not is_neon:
        print("\n❌ ERROR: Not using Neon database!")
        return
    
    # Test database operations
    async with AsyncSessionLocal() as session:
        # Check users
        result = await session.execute(text("SELECT COUNT(*) FROM users"))
        user_count = result.scalar()
        print(f"\n✓ Users in database: {user_count}")
        
        # Check tasks
        result = await session.execute(text("SELECT COUNT(*) FROM tasks"))
        task_count = result.scalar()
        print(f"✓ Tasks in database: {task_count}")
        
        # Check recent user
        result = await session.execute(text("""
            SELECT name, email, created_at 
            FROM users 
            ORDER BY created_at DESC 
            LIMIT 1
        """))
        user = result.first()
        if user:
            print(f"\n✓ Most recent user:")
            print(f"  - Name: {user[0]}")
            print(f"  - Email: {user[1]}")
            print(f"  - Created: {user[2]}")
    
    print("\n" + "="*60)
    print("✓ NEON DATABASE IS WORKING!")
    print("="*60 + "\n")

if __name__ == "__main__":
    asyncio.run(test_neon())
