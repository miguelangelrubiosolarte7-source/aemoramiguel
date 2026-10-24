"""Launcher estable para FastAPI + psycopg async en Windows."""

import asyncio
import os
import sys

if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

import uvicorn


if __name__ == "__main__":
    config = uvicorn.Config(
        "app.main:app",
        host="127.0.0.1",
        port=int(os.getenv("PORT", "8000")),
        loop="none",
        log_level="info",
    )
    server = uvicorn.Server(config)
    # Python 3.14/Windows may default to Proactor; psycopg async requires Selector.
    with asyncio.Runner(loop_factory=asyncio.SelectorEventLoop) as runner:
        runner.run(server.serve())
