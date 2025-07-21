from backend.app.database import SessionLocal
from backend.app.models import Delivery, Order

def find_orphan_deliveries():
    session = SessionLocal()
    try:
        # Get all valid order IDs
        valid_order_ids = set(row[0] for row in session.query(Order.id).all())
        # Find deliveries with null or invalid order_id
        orphans = session.query(Delivery).filter(
            (Delivery.order_id == None) | (~Delivery.order_id.in_(valid_order_ids))
        ).all()
        if not orphans:
            print("No orphan deliveries found. All deliveries are linked to valid orders.")
        else:
            print(f"Found {len(orphans)} orphan deliveries:")
            for d in orphans:
                print(f"ID: {d.id}, recipient: {d.recipient}, address: {d.address}, order_id: {d.order_id}")
            # Optionally, prompt to delete or fix
            # Uncomment below to delete all orphans (use with caution!)
            # confirm = input("Delete all orphan deliveries? (y/N): ")
            # if confirm.lower() == 'y':
            #     for d in orphans:
            #         session.delete(d)
            #     session.commit()
            #     print("Deleted all orphan deliveries.")
    finally:
        session.close()

if __name__ == "__main__":
    find_orphan_deliveries() 