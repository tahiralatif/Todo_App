"""
Migration script to add priority column to tasks table.
Run this script to update your database schema.
"""

import asyncio
import sys
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent))

from sqlalchemy import text
from src.db import engine


async def add_priority_column():
    """Add priority column to tasks table."""
    
    print("🚀 Starting migration: Add priority column to tasks table")
    
    async with engine.begin() as conn:
        try:
            # Step 1: Create ENUM type
            print("📝 Step 1: Creating taskpriority ENUM type...")
            await conn.execute(text("""
                DO $$ BEGIN
                    CREATE TYPE taskpriority AS ENUM ('LOW', 'MEDIUM', 'HIGH');
                EXCEPTION
                    WHEN duplicate_object THEN null;
                END $$;
            """))
            print("✅ ENUM type created/verified")
            
            # Step 2: Check if column already exists
            print("📝 Step 2: Checking if priority column exists...")
            result = await conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'tasks' AND column_name = 'priority'
            """))
            exists = result.fetchone()
            
            if exists:
                print("⚠️  Priority column already exists, skipping...")
            else:
                # Step 3: Add priority column
                print("📝 Step 3: Adding priority column to tasks table...")
                await conn.execute(text("""
                    ALTER TABLE tasks 
                    ADD COLUMN priority taskpriority NOT NULL DEFAULT 'MEDIUM'
                """))
                print("✅ Priority column added")
                
                # Step 4: Create index
                print("📝 Step 4: Creating index on priority column...")
                await conn.execute(text("""
                    CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority)
                """))
                print("✅ Index created")
            
            # Step 5: Verify
            print("📝 Step 5: Verifying changes...")
            result = await conn.execute(text("""
                SELECT column_name, data_type, column_default 
                FROM information_schema.columns 
                WHERE table_name = 'tasks' AND column_name = 'priority'
            """))
            row = result.fetchone()
            
            if row:
                print(f"✅ Verification successful:")
                print(f"   Column: {row[0]}")
                print(f"   Type: {row[1]}")
                print(f"   Default: {row[2]}")
            else:
                print("❌ Verification failed: Column not found")
                return False
            
            print("\n🎉 Migration completed successfully!")
            return True
            
        except Exception as e:
            print(f"\n❌ Migration failed: {e}")
            raise


async def main():
    """Run the migration."""
    try:
        success = await add_priority_column()
        if success:
            print("\n✨ Database is ready with priority support!")
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"\n💥 Error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
