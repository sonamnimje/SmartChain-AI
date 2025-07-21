from backend.app.database import SessionLocal
from backend.app.models import Delivery, Order


def link_orphan_deliveries():
    session = SessionLocal()
    try:
        valid_order_ids = set(row[0] for row in session.query(Order.id).all())
        orphans = session.query(Delivery).filter(
            (Delivery.order_id == None) | (~Delivery.order_id.in_(valid_order_ids))
        ).all()
        if not orphans:
            print("No orphan deliveries found.")
            return
        print(f"Found {len(orphans)} orphan deliveries:")
        for d in orphans:
            print(f"\nDelivery ID: {d.id}, recipient: {d.recipient}, address: {d.address}, order_id: {d.order_id}")
            action = input("Enter a valid order_id to link, 'd' to delete, or press Enter to skip: ").strip()
            if action.lower() == 'd':
                session.delete(d)
                print(f"Deleted delivery {d.id}")
            elif action.isdigit() and int(action) in valid_order_ids:
                d.order_id = int(action)
                session.add(d)
                print(f"Linked delivery {d.id} to order {action}")
            elif action == '':
                print(f"Skipped delivery {d.id}")
            else:
                print(f"Invalid input. Skipped delivery {d.id}")
        session.commit()
        print("\nAll changes committed.")
    finally:
        session.close()

if __name__ == "__main__":
    link_orphan_deliveries() 