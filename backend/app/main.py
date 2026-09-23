from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app import models  # noqa: F401
from app.database import Base, build_engine, build_session_factory, default_database_url
from app.routers import agent, contacts, emails, messages
from app.seed import seed_database


def create_app(database_url: Optional[str] = None) -> FastAPI:
    engine = build_engine(database_url or default_database_url())
    SessionLocal = build_session_factory(engine)

    @asynccontextmanager
    async def lifespan(app: FastAPI):
        Base.metadata.create_all(bind=engine)
        with SessionLocal() as session:
            seed_database(session)
        yield
        engine.dispose()

    app = FastAPI(
        title="WorkHub Demo API",
        description="Messaging and email APIs for the WorkHub enterprise collaboration demo.",
        version="0.1.0",
        lifespan=lifespan,
    )
    app.state.SessionLocal = SessionLocal
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.include_router(contacts.router)
    app.include_router(messages.router)
    app.include_router(emails.router)
    app.include_router(agent.router)

    @app.get("/api/health", tags=["system"])
    def health_check():
        return {"status": "ok"}

    return app


app = create_app()
