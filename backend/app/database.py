import os
from sqlalchemy import create_engine, Column, Integer, String, Float, Boolean, ForeignKey, Date, DateTime
from sqlalchemy.orm import declarative_base, relationship, sessionmaker

# Ensure the data directory exists
DB_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
os.makedirs(DB_DIR, exist_ok=True)
DB_PATH = os.path.join(DB_DIR, "f1.db")

SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class Driver(Base):
    __tablename__ = "drivers"
    
    driver_id = Column(String, primary_key=True, index=True)
    given_name = Column(String)
    family_name = Column(String)
    nationality = Column(String)
    date_of_birth = Column(String)
    url = Column(String)
    
    results = relationship("Result", back_populates="driver")

class Team(Base):
    __tablename__ = "teams"
    
    team_id = Column(String, primary_key=True, index=True) # Constructor ID
    name = Column(String)
    nationality = Column(String)
    url = Column(String)
    
    results = relationship("Result", back_populates="team")

class Race(Base):
    __tablename__ = "races"
    
    race_id = Column(Integer, primary_key=True, index=True)
    season = Column(Integer, index=True)
    round = Column(Integer)
    race_name = Column(String)
    date = Column(String)
    circuit_id = Column(String)
    circuit_name = Column(String)
    locality = Column(String)
    country = Column(String)
    circuit_type = Column(String, default="permanent") # We will map this manually or default to permanent
    
    sessions = relationship("Session", back_populates="race", cascade="all, delete-orphan")

class Session(Base):
    __tablename__ = "sessions"
    
    session_id = Column(Integer, primary_key=True, index=True)
    race_id = Column(Integer, ForeignKey("races.race_id"))
    session_name = Column(String) # FP1, FP2, FP3, Qualifying, Sprint, Race
    date = Column(String)
    time = Column(String)
    
    race = relationship("Race", back_populates="sessions")
    results = relationship("Result", back_populates="session", cascade="all, delete-orphan")

class Result(Base):
    __tablename__ = "results"
    
    result_id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("sessions.session_id"))
    driver_id = Column(String, ForeignKey("drivers.driver_id"))
    team_id = Column(String, ForeignKey("teams.team_id"))
    
    position = Column(Integer, nullable=True) # Finishing position
    points = Column(Float, default=0.0)
    grid = Column(Integer, nullable=True) # Starting grid position (mainly for Race)
    status = Column(String, nullable=True)
    
    session = relationship("Session", back_populates="results")
    driver = relationship("Driver", back_populates="results")
    team = relationship("Team", back_populates="results")

class Champion(Base):
    __tablename__ = "champions"
    
    id = Column(Integer, primary_key=True, index=True)
    season = Column(Integer)
    championship_type = Column(String) # 'drivers' or 'constructors'
    winner_id = Column(String) # driver_id or team_id
    points = Column(Float)
    
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
