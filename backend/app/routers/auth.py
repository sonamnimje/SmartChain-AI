from fastapi import APIRouter, Depends, HTTPException, status, Body, Response, Request
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from datetime import datetime, timedelta
from .. import models, schemas, crud
from ..database import SessionLocal

SECRET_KEY = "supersecretkey"  # Change in production
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

router = APIRouter(prefix="/auth", tags=["auth"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

@router.post("/signup", response_model=schemas.Token)
def signup(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    new_user = crud.create_user(db, user)
    access_token = create_access_token(data={"sub": new_user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = crud.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    print("Token received:", token)  # Debug print
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = crud.get_user_by_email(db, email)
    if user is None:
        raise credentials_exception
    return user

@router.get("/me", response_model=schemas.UserRead)
def read_users_me(current_user: models.User = Depends(get_current_user)):
    return current_user

@router.put("/me", response_model=schemas.UserRead)
def update_profile(
    name: str = Body(None),
    phone: str = Body(None),
    avatar: str = Body(None),
    location: str = Body(None),
    username: str = Body(None),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    updated = False
    if name is not None:
        current_user.name = name
        updated = True
    if phone is not None:
        current_user.phone = phone
        updated = True
    if avatar is not None:
        current_user.avatar = avatar
        updated = True
    if location is not None:
        current_user.location = location
        updated = True
    if username is not None:
        current_user.username = username
        updated = True
    if updated:
        db.add(current_user)
        db.commit()
        db.refresh(current_user)
    return current_user

@router.post("/forgot-password")
def forgot_password():
    return {"message": "Forgot password endpoint (to be implemented)"}

# Utility for role-based access
def require_role(current_user, allowed_roles):
    if current_user.role not in allowed_roles:
        raise HTTPException(status_code=403, detail="Not authorized")

@router.get("/users", response_model=list[schemas.UserRead])
def list_users(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Allow both admin and staff to view users
    require_role(current_user, ["admin", "staff"])
    users = db.query(models.User).all()
    return users 