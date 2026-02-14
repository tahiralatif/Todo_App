import asyncio
from sqlalchemy import text
from src.db import engine

async def check_enum_values():
    async with engine.connect() as conn:
        result = await conn.execute(
            text("SELECT unnest(enum_range(NULL::notificationtype))::text")
        )
        values = [row[0] for row in result]
        print("Database ENUM values:")
        for val in values:
            print(f"  - {val}")

asyncio.run(check_enum_values())
