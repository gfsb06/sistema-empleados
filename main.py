import logging
from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy import create_engine, Column, Integer, String, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel
import jwt
import datetime
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
import bcrypt

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuración de la base de datos
DATABASE_URL = "postgresql://postgres:admin123@localhost:5432/sistema_empleados_db"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Modelos de la base de datos
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    email = Column(String, unique=True, nullable=True)

class TimeLog(Base):
    __tablename__ = "time_logs"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    log_time = Column(DateTime, default=datetime.datetime.utcnow)
    duration = Column(Integer, nullable=True)  # Duración en minutos

# Crear las tablas en la base de datos
Base.metadata.create_all(bind=engine)

# Modelos Pydantic
class UserCreate(BaseModel):
    username: str
    password: str
    email: str | None = None

class UserUpdate(BaseModel):
    username: str | None = None
    password: str | None = None
    email: str | None = None

class TimeLogCreate(BaseModel):
    user_id: int
    duration: int  # Duración en minutos

# Configuración de JWT
SECRET_KEY = "tu_secreto_aqui"  # Cambia esto por una clave secreta segura
ALGORITHM = "HS256"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

app = FastAPI()

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependencia para obtener la sesión de la base de datos
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Función para hashear la contraseña
def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

# Función para verificar la contraseña
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

# Función para autenticar usuario
def authenticate_user(db: Session, username: str, password: str):
    logger.info(f"Authenticating user: {username}")
    user = db.query(User).filter(User.username == username).first()
    if not user:
        logger.warning(f"User not found: {username}")
        return False
    if not verify_password(password, user.hashed_password):
        logger.warning(f"Password verification failed for user: {username}")
        return False
    return user

# Generar token JWT
def create_access_token(data: dict, expires_delta: datetime.timedelta):
    logger.info(f"Creating access token for user: {data.get('sub')}")
    to_encode = data.copy()
    expire = datetime.datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

@app.post("/token")
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    logger.info(f"Login attempt for username: {form_data.username}")
    try:
        user = authenticate_user(db, form_data.username, form_data.password)
        if not user:
            logger.warning(f"Authentication failed for username: {form_data.username}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        logger.info(f"User authenticated: {user.username}")
        access_token = create_access_token(
            data={"sub": user.username}, expires_delta=datetime.timedelta(minutes=30)
        )
        logger.info(f"Token generated for user: {user.username}")
        return {"access_token": access_token, "token_type": "bearer"}
    except Exception as e:
        logger.error(f"Error during login: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.post("/register")
async def register(user: UserCreate, db: Session = Depends(get_db)):
    logger.info(f"Registering user: {user.username}")
    try:
        db_user = db.query(User).filter(User.username == user.username).first()
        if db_user:
            logger.warning(f"Username already registered: {user.username}")
            raise HTTPException(status_code=400, detail="Username already registered")
        hashed_password = hash_password(user.password)
        new_user = User(username=user.username, hashed_password=hashed_password, email=user.email)
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        logger.info(f"User registered successfully: {new_user.username}")
        return {"message": "User registered successfully", "id": new_user.id}
    except Exception as e:
        logger.error(f"Error during registration: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.get("/employees", dependencies=[Depends(oauth2_scheme)])
def list_employees(db: Session = Depends(get_db)):
    logger.info("Fetching list of employees")
    try:
        employees = db.query(User).all()
        logger.info(f"Found {len(employees)} employees in the database")
        if not employees:
            logger.warning("No employees found in the database")
            return []
        result = [{"id": emp.id, "name": emp.username, "email": emp.email} for emp in employees]
        logger.info(f"Returning {len(result)} employees")
        return result
    except Exception as e:
        logger.error(f"Error fetching employees: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.post("/log-time", dependencies=[Depends(oauth2_scheme)])
async def log_time(time_log: TimeLogCreate, db: Session = Depends(get_db)):
    logger.info(f"Logging time for user_id: {time_log.user_id}")
    try:
        user = db.query(User).filter(User.id == time_log.user_id).first()
        if not user:
            logger.warning(f"User not found: {time_log.user_id}")
            raise HTTPException(status_code=404, detail="User not found")
        new_time_log = TimeLog(user_id=time_log.user_id, duration=time_log.duration)
        db.add(new_time_log)
        db.commit()
        db.refresh(new_time_log)
        logger.info(f"Time logged successfully for user_id: {time_log.user_id}")
        return {"message": "Time logged successfully", "id": new_time_log.id}
    except Exception as e:
        logger.error(f"Error logging time: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.post("/admin/add-employee", dependencies=[Depends(oauth2_scheme)])
async def add_employee(user: UserCreate, db: Session = Depends(get_db)):
    logger.info(f"Adding employee: {user.username}")
    try:
        db_user = db.query(User).filter(User.username == user.username).first()
        if db_user:
            logger.warning(f"Username already registered: {user.username}")
            raise HTTPException(status_code=400, detail="Username already registered")
        hashed_password = hash_password(user.password)
        new_user = User(username=user.username, hashed_password=hashed_password, email=user.email)
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        logger.info(f"Employee added successfully: {new_user.username}")
        return {"message": "Employee added successfully", "id": new_user.id}
    except Exception as e:
        logger.error(f"Error adding employee: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.put("/admin/update-employee/{user_id}", dependencies=[Depends(oauth2_scheme)])
async def update_employee(user_id: int, user: UserUpdate, db: Session = Depends(get_db)):
    logger.info(f"Updating employee with ID: {user_id}")
    try:
        db_user = db.query(User).filter(User.id == user_id).first()
        if not db_user:
            logger.warning(f"User not found: {user_id}")
            raise HTTPException(status_code=404, detail="User not found")
        if user.username is not None:
            db_user.username = user.username
        if user.password is not None:
            db_user.hashed_password = hash_password(user.password)
        if user.email is not None:
            db_user.email = user.email
        db.commit()
        db.refresh(db_user)
        logger.info(f"Employee updated successfully: {db_user.username}")
        return {"message": "Employee updated successfully"}
    except Exception as e:
        logger.error(f"Error updating employee: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.delete("/admin/delete-employee/{user_id}", dependencies=[Depends(oauth2_scheme)])
async def delete_employee(user_id: int, db: Session = Depends(get_db)):
    logger.info(f"Deleting employee with ID: {user_id}")
    try:
        db_user = db.query(User).filter(User.id == user_id).first()
        if not db_user:
            logger.warning(f"User not found: {user_id}")
            raise HTTPException(status_code=404, detail="User not found")
        db.delete(db_user)
        db.commit()
        logger.info(f"Employee deleted successfully: {user_id}")
        return {"message": "Employee deleted successfully"}
    except Exception as e:
        logger.error(f"Error deleting employee: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

# Endpoint de prueba
@app.get("/test")
async def test():
    logger.info("Test endpoint accessed")
    return {"message": "Backend is working!"}