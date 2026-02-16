"""Add TASK_DUE_SOON to notificationtype enum in Neon database"""
import asyncio
from sqlalchemy import text
from src.db import engine

async def add_enum_value():
    print("\n" + "="*60)
    print("ADDING TASK_DUE_SOON TO NOTIFICATION ENUM")
    print("="*60 + "\n")
    
    async with engine.begin() as conn:
        try:
            # Check if the value already exists
            result = await conn.execute(text("""
                SELECT EXISTS (
                    SELECT 1 FROM pg_enum 
                    WHERE enumlabel = 'TASK_DUE_SOON' 
                    AND enumtypid = (
                        SELECT oid FROM pg_type WHERE typname = 'notificationtype'
                    )
                )
            """))
            exists = result.scalar()
            
            if exists:
                print("✓ TASK_DUE_SOON already exists in enum")
            else:
                # Add the new enum value
                await conn.execute(text("""
                    ALTER TYPE notificationtype ADD VALUE 'TASK_DUE_SOON'
                """))
                print("✓ Successfully added TASK_DUE_SOON to notificationtype enum")
            
            # Show all enum values
            result = await conn.execute(text("""
                SELECT enumlabel 
                FROM pg_enum 
                WHERE enumtypid = (
                    SELECT oid FROM pg_type WHERE typname = 'notificationtype'
                )
                ORDER BY enumsortorder
            """))
            values = [row[0] for row in result]
            print(f"\n✓ Current enum values:")
            for value in values:
                print(f"  - {value}")
            
        except Exception as e:
            print(f"✗ Error: {e}")
            raise
    
    print("\n" + "="*60)
    print("✓ ENUM UPDATE COMPLETE!")
    print("="*60 + "\n")

if __name__ == "__main__":
    asyncio.run(add_enum_value())
