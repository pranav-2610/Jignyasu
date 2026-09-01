from fastapi import FastAPI 
from fastapi.middleware.cors import CORSMiddleware
from src.routers import akinator
from src.routers import map_timeline


app = FastAPI(title= 'Sootra Backend')
app.add_middleware(CORSMiddleware, allow_origins=["*"],allow_credentials=True, allow_methods=["*"], allow_headers=["*"] )
app.include_router(akinator.router)
app.include_router(map_timeline.router)
@app.get("/")
def read_root():
    return {"message": "Sootra API is alive!"}