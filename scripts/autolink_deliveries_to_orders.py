from backend.app.database import SessionLocal
from backend.app.models import Delivery, Order

def autolink_deliveries_to_orders():
    session = SessionLocal()
    try:
        valid_order_ids = set(row[0] for row in session.query(Order.id).all())
        orphans = session.query(Delivery).filter(
            (Delivery.order_id == None) | (~Delivery.order_id.in_(valid_order_ids))
        ).all()
        if not orphans:
            print("No orphan deliveries found.")
            return
        print(f"Found {len(orphans)} orphan deliveries. Attempting to auto-link...")
        linked = 0
        for d in orphans:
            # Try to find an order with matching customer_name and address
            order = session.query(Order).filter(
                Order.customer_name == d.recipient,
                Order.address == d.address
            ).first()
            if order:
                d.order_id = order.id
                session.add(d)
                print(f"Linked delivery {d.id} to order {order.id} (recipient: {d.recipient}, address: {d.address})")
                linked += 1
            else:
                print(f"No matching order found for delivery {d.id} (recipient: {d.recipient}, address: {d.address})")
        session.commit()
        print(f"\nAuto-linking complete. {linked} deliveries linked to orders.")
    finally:
        session.close()

if __name__ == "__main__":
    autolink_deliveries_to_orders() 