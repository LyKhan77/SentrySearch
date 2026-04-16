import os
from datetime import datetime
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

DB_PATH = os.path.join(os.path.expanduser("~"), ".sentrysearch", "history.db")
os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)

engine = create_engine(f"sqlite:///{DB_PATH}")
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class SearchHistory(Base):
    __tablename__ = "search_history"
    id = Column(Integer, primary_key=True, index=True)
    query = Column(String, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    results_count = Column(Integer)
    best_score = Column(Float)
    results_metadata = Column(JSON) # Store top result info for easy history display

Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def log_search(query: str, count: int, score: float, metadata: dict = None):
    db = SessionLocal()
    try:
        entry = SearchHistory(
            query=query,
            results_count=count,
            best_score=score,
            results_metadata=metadata
        )
        db.add(entry)
        db.commit()
    finally:
        db.close()
