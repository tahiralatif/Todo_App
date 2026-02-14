"""
Migration script to add due_date column to tasks table.
Run this script to update your database schema.
"""

import asyncio
import sys
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent))

from sqlalchemy import text
from src.db import engine


async def add_due_date_column():
    """Add due_date column to tasks table."""
    
    print("🚀 Starting migration: Add due_date column to tasks table")
    
    async with engine.begin() as conn:
        try:
            # Step 1: Check if column already exists
            print("📝 Step 1: Checking if due_date column exists...")
            result = await conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'tasks' AND column_name = 'due_date'
            """))
            exists = result.fetchone()
            
            if exists:
                print("⚠️  due_date column already exists, skipping...")
            else:
                # Step 2: Add due_date column
                print("📝 Step 2: Adding due_date column to tasks table...")
                await conn.execute(text("""
                    ALTER TABLE tasks 
                    ADD COLUMN due_date TIMESTAMP WITH TIME ZONE
                """))
                print("✅ due_date column added")
                
                # Step 3: Create index
                print("📝 Step 3: Creating index on due_date column...")
                await conn.execute(text("""
                    CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date)
                """))
                print("✅ Index created")
            
            # Step 4: Verify
            print("📝 Step 4: Verifying changes...")
            result = await conn.execute(text("""
                SELECT column_name, data_type, is_nullable 
                FROM information_schema.columns 
                WHERE table_name = 'tasks' AND column_name = 'due_date'
            """))
            row = result.fetchone()
            
            if row:
                print(f"✅ Verification successful:")
                print(f"   Column: {row[0]}")
                print(f"   Type: {row[1]}")
                print(f"   Nullable: {row[2]}")
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
        success = await add_due_date_column()
        if success:
            print("\n✨ Database is ready with due_date support!")
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"\n💥 Error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
