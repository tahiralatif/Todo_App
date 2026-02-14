"""
Add missing ENUM values to notificationtype
"""
import asyncio
from sqlalchemy import text
from src.db import engine

async def add_enum_values():
    async with engine.begin() as conn:
        # Add SIGNUP
        try:
            await conn.execute(
                text("ALTER TYPE notificationtype ADD VALUE 'SIGNUP'")
            )
            print("✅ Added 'SIGNUP' to notificationtype ENUM")
        except Exception as e:
            if "already exists" in str(e):
                print("⚠️  'SIGNUP' already exists")
            else:
                print(f"❌ Error adding SIGNUP: {e}")
        
        # Add LOGOUT
        try:
            await conn.execute(
                text("ALTER TYPE notificationtype ADD VALUE 'LOGOUT'")
            )
            print("✅ Added 'LOGOUT' to notificationtype ENUM")
        except Exception as e:
            if "already exists" in str(e):
                print("⚠️  'LOGOUT' already exists")
            else:
                print(f"❌ Error adding LOGOUT: {e}")
    
    print("\n✅ Migration complete!")
    
    # Verify
    async with engine.connect() as conn:
        result = await conn.execute(
            text("SELECT unnest(enum_range(NULL::notificationtype))::text")
        )
        values = [row[0] for row in result]
        print("\nCurrent ENUM values:")
        for val in sorted(values):
            print(f"  - {val}")

asyncio.run(add_enum_values())
