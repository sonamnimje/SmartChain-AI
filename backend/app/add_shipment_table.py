from app.database import engine
from app.models import Base, Shipment

if __name__ == "__main__":
    Base.metadata.create_all(bind=engine, tables=[Shipment.__table__])
    print("Shipments table created.") 