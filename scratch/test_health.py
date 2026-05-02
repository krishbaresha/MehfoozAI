import httpx
import asyncio
import traceback

async def test():
    print("Starting test...")
    async with httpx.AsyncClient() as client:
        try:
            print("Sending GET request...")
            resp = await client.get("http://127.0.0.1:8000/health", timeout=10.0)
            print(f"Status: {resp.status_code}")
            print(f"Body: {resp.text}")
        except Exception as e:
            print(f"Caught Exception: {type(e).__name__}: {e}")
            traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test())
