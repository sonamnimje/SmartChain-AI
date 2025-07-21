from fastapi import APIRouter
from pydantic import BaseModel
import os
from omnidimension import Client

router = APIRouter()

class ChatRequest(BaseModel):
    message: str

@router.post("/chat")
async def chat_endpoint(request: ChatRequest):
    """
    Chatbot endpoint using Omnidimension for response generation.
    """
    try:
        api_key = os.getenv("OMNIDIMENSION_API_KEY")
        agent_id = os.getenv("OMNIDIMENSION_AGENT_ID")
        if not api_key or not agent_id:
            return {"reply": "Omnidimension API key or agent ID not set. Please set OMNIDIMENSION_API_KEY and OMNIDIMENSION_AGENT_ID environment variables."}
        if not hasattr(chat_endpoint, "client"):
            chat_endpoint.client = Client(api_key)
        client = chat_endpoint.client
        user_message = request.message
        response = client.agent.chat(agent_id, message=user_message)
        if isinstance(response, dict):
            reply = response.get("response") or response.get("text") or str(response)
        else:
            reply = str(response)
        if not reply or len(reply.strip()) < 2:
            reply = "I'm not sure how to respond to that."
        return {"reply": reply}
    except Exception as e:
        return {"reply": f"Sorry, the Omnidimension AI service is currently unavailable. ({str(e)})"}

@router.get("/insights")
async def ai_insights():
    return [
        {
            "type": "trend",
            "summary": "Your smart contract activity is trending up this week.",
            "details": "Activity increased by 14.7% compared to last week.",
        },
        {
            "type": "recommendation",
            "summary": "Consider optimizing gas usage.",
            "details": "Your most active contracts have higher than average gas fees.",
        },
        {
            "type": "anomaly",
            "summary": "Unusual contract activity detected.",
            "details": "A spike in failed transactions was observed yesterday.",
        },
        {
            "type": "forecast",
            "summary": "Gas fees expected to rise next week.",
            "details": "Based on current trends, average gas fees may increase by 8%.",
        }
    ]

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/smart-insights")
async def smart_insights(db: Session = Depends(get_db)):
    insights = []
    # 1. Reorder Recommendation
    reorder_items = db.query(Inventory).all()
    for item in reorder_items:
        if item.reorder_threshold is not None and item.stock <= item.reorder_threshold:
            insights.append({
                "type": "reorder_recommendation",
                "summary": f"Reorder Recommendation for {item.name}",
                "details": f"You are likely to run out of {item.name} soon (stock: {item.stock}). Consider placing an order now."
            })
            break  # Only show one for brevity
    # 2. Vendor Performance Score (last 3 months)
    three_months_ago = datetime.utcnow() - timedelta(days=90)
    vendors = db.query(Vendor).all()
    for vendor in vendors:
        # Find orders and deliveries for this vendor (assuming vendor name in order.product or similar)
        vendor_orders = db.query(Order).filter(Order.created_at >= three_months_ago, Order.product.ilike(f"%{vendor.name}%")).all()
        total_orders = len(vendor_orders)
        if total_orders == 0:
            continue
        # Assume all orders are fulfilled if no rejection/cancellation logic
        fulfilled_orders = [o for o in vendor_orders if o.status == "delivered"]
        on_time_deliveries = db.query(Delivery).filter(Delivery.created_at >= three_months_ago, Delivery.recipient.ilike(f"%{vendor.name}%"), Delivery.status == "delivered").count()
        # For now, use delivered as on-time (no expected date field)
        on_time_rate = (on_time_deliveries / total_orders) * 100 if total_orders else 0
        insights.append({
            "type": "vendor_performance",
            "summary": f"Vendor Performance Score for {vendor.name}",
            "details": f"{vendor.name} has a {on_time_rate:.0f}% on-time delivery rate over the last 3 months."
        })
        break  # Only show one for brevity
    # 3. Price Trend Analysis (placeholder)
    insights.append({
        "type": "price_trend",
        "summary": "Price Trend Analysis (Schema Update Needed)",
        "details": "Price trend analysis requires product price history. Please add a ProductPriceHistory table."
    })
    # 4. Order Delay Risk Prediction
    recent_deliveries = db.query(Delivery).filter(Delivery.created_at >= three_months_ago).all()
    delayed_vendors = {}
    for delivery in recent_deliveries:
        if delivery.status == "pending":
            days_pending = (datetime.utcnow() - delivery.created_at).days
            if days_pending > 7:  # Arbitrary threshold for 'delayed'
                delayed_vendors[delivery.recipient] = delayed_vendors.get(delivery.recipient, 0) + 1
    if delayed_vendors:
        vendor, count = max(delayed_vendors.items(), key=lambda x: x[1])
        insights.append({
            "type": "order_delay_risk",
            "summary": f"Order Delay Risk Prediction for {vendor}",
            "details": f"High chance of delay for {vendor} due to recent logistic issues."
        })
    # 5. Suggested Vendors (placeholder)
    insights.append({
        "type": "suggested_vendors",
        "summary": "Suggested Vendors (Schema Update Needed)",
        "details": "Vendor-product-price mapping required. Please add a VendorProduct table."
    })
    # 6. Low Stock Alerts (new)
    low_stock_items = db.query(Inventory).filter(Inventory.stock < 5).all()
    for item in low_stock_items:
        insights.append({
            "type": "low_stock",
            "summary": f"Low Stock Alert: {item.name}",
            "details": f"Only {item.stock} units left in stock for {item.name}. Consider restocking soon."
        })
    return insights 