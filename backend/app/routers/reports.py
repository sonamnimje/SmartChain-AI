from fastapi import APIRouter, Depends
from typing import List
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..database import SessionLocal
from ..models import Inventory, Order, Product, Shipment
from datetime import datetime, timedelta
from ..schemas import InventoryRead
import os
import smtplib
from email.mime.text import MIMEText
from fastapi import BackgroundTasks
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
import tempfile
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
import datetime as dt

router = APIRouter()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Pydantic schemas for API responses
class Report(BaseModel):
    name: str
    date: str
    action: str

class SalesData(BaseModel):
    name: str
    sales: int

class CategoryData(BaseModel):
    name: str
    value: int

class InventoryData(BaseModel):
    name: str
    value: int

def format_date(val):
    if isinstance(val, (dt.datetime, dt.date)):
        return val.strftime('%Y-%m-%d')
    elif isinstance(val, str):
        return val[:10] if val else ''
    return ''

def generate_monthly_report(db: Session):
    # Example: summarize inventory and shipments
    inventory_count = db.query(Inventory).count()
    shipment_count = db.query(Shipment).count()
    order_count = db.query(Order).count()
    return f"Monthly Report\n\nInventory Items: {inventory_count}\nShipments: {shipment_count}\nOrders: {order_count}\n"

def generate_monthly_report_pdf(db: Session, filename: str):
    doc = SimpleDocTemplate(filename, pagesize=letter)
    styles = getSampleStyleSheet()
    elements = []
    elements.append(Paragraph("<b>SmartChain AI Monthly Report</b>", styles['Title']))
    elements.append(Spacer(1, 12))
    # Inventory Table
    inventory = db.query(Inventory).all()
    inv_data = [["ID", "Name", "Stock", "Category", "Warehouse", "Expiry"]]
    for item in inventory:
        inv_data.append([
            str(item.id), item.name, str(item.stock), getattr(item, 'category', ''), getattr(item, 'location', ''),
            format_date(getattr(item, 'expiry_date', ''))
        ])
    elements.append(Paragraph("<b>Inventory</b>", styles['Heading2']))
    t = Table(inv_data, repeatRows=1)
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.lightgrey),
        ('GRID', (0,0), (-1,-1), 0.5, colors.grey),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
    ]))
    elements.append(t)
    elements.append(Spacer(1, 18))
    # Shipments Table
    shipments = db.query(Shipment).all()
    ship_data = [["ID", "Order ID", "Status", "Carrier", "Shipped", "Expected"]]
    for s in shipments:
        ship_data.append([
            str(s.id), str(s.order_id), s.status, s.carrier or '',
            format_date(getattr(s, 'shipped_date', '')),
            format_date(getattr(s, 'expected_delivery_date', ''))
        ])
    elements.append(Paragraph("<b>Shipments</b>", styles['Heading2']))
    t2 = Table(ship_data, repeatRows=1)
    t2.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.lightgrey),
        ('GRID', (0,0), (-1,-1), 0.5, colors.grey),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
    ]))
    elements.append(t2)
    doc.build(elements)

def send_email(subject, body, to_email, pdf_path=None):
    smtp_host = os.getenv('SMTP_HOST', 'smtp.example.com')
    smtp_port = int(os.getenv('SMTP_PORT', 587))
    smtp_user = os.getenv('SMTP_USER', 'user@example.com')
    smtp_pass = os.getenv('SMTP_PASS', 'password')
    from_email = os.getenv('FROM_EMAIL', smtp_user)
    msg = MIMEMultipart()
    msg['Subject'] = subject
    msg['From'] = from_email
    msg['To'] = to_email
    msg.attach(MIMEText(body, 'plain'))
    if pdf_path:
        with open(pdf_path, 'rb') as f:
            part = MIMEBase('application', 'octet-stream')
            part.set_payload(f.read())
            encoders.encode_base64(part)
            part.add_header('Content-Disposition', f'attachment; filename="{os.path.basename(pdf_path)}"')
            msg.attach(part)
    with smtplib.SMTP(smtp_host, smtp_port) as server:
        server.starttls()
        server.login(smtp_user, smtp_pass)
        server.sendmail(from_email, [to_email], msg.as_string())

# Endpoint: Recent Reports (latest 5 orders)
@router.get("/api/reports", response_model=List[Report])
def get_reports(db: Session = Depends(get_db)):
    orders = db.query(Order).order_by(Order.created_at.desc()).limit(5).all()
    return [
        {
            "name": f"Order for {order.product}",
            "date": order.created_at.strftime("%Y-%m-%d") if order.created_at else "",
            "action": "View"
        }
        for order in orders
    ]

# Endpoint: Sales Overview (orders per month)
@router.get("/api/sales", response_model=List[SalesData])
def get_sales(db: Session = Depends(get_db)):
    # Use "%Y-%m" for year-month (works in SQLite)
    sales = (
        db.query(
            func.strftime("%Y-%m", Order.created_at).label("month"),
            func.sum(Order.quantity).label("sales")
        )
        .group_by("month")
        .order_by("month")
        .all()
    )
    return [
        {"name": month or "", "sales": int(sales_amt or 0)}
        for month, sales_amt in sales
    ]

# Endpoint: Sales by Category (order quantities by product category)
@router.get("/api/categories", response_model=List[CategoryData])
def get_categories(db: Session = Depends(get_db)):
    results = (
        db.query(Product.category, func.sum(Order.quantity))
        .join(Product, Product.name == Order.product)
        .group_by(Product.category)
        .all()
    )
    return [
        {"name": cat or "Uncategorized", "value": int(total or 0)}
        for cat, total in results
    ]

# Endpoint: Inventory Summary (stock by category)
@router.get("/api/inventory", response_model=List[InventoryRead])
def get_inventory(db: Session = Depends(get_db)):
    return db.query(Inventory).all()

# Endpoint: Inventory Level Trends (stock per month for last 12 months)
@router.get("/api/inventory-trends")
def inventory_trends(db: Session = Depends(get_db)):
    now = datetime.utcnow()
    trends = []
    for i in range(11, -1, -1):
        month_start = datetime(now.year, now.month, 1) - timedelta(days=30*i)
        month_end = datetime(month_start.year, month_start.month, 28) + timedelta(days=4)  # next month
        month_end = month_end - timedelta(days=month_end.day)
        stock = db.query(func.sum(Inventory.stock)).filter(Inventory.last_updated >= month_start, Inventory.last_updated < month_end).scalar() or 0
        trends.append({
            "month": month_start.strftime("%b %Y"),
            "level": int(stock)
        })
    return trends

# Endpoint: Monthly Shipment Volume by Vendor (last 12 months)
@router.get("/api/shipment-trends")
def shipment_trends(db: Session = Depends(get_db)):
    now = datetime.utcnow()
    months = []
    for i in range(11, -1, -1):
        month_start = datetime(now.year, now.month, 1) - timedelta(days=30*i)
        month_end = datetime(month_start.year, month_start.month, 28) + timedelta(days=4)
        month_end = month_end - timedelta(days=month_end.day)
        months.append(month_start.strftime("%b %Y"))
    vendors = db.query(Shipment.carrier).distinct().all()
    vendor_names = [v[0] for v in vendors if v[0]]
    data = []
    for idx, month in enumerate(months):
        row = {"month": month}
        month_start = datetime(now.year, now.month, 1) - timedelta(days=30*(11-idx))
        month_end = datetime(month_start.year, month_start.month, 28) + timedelta(days=4)
        month_end = month_end - timedelta(days=month_end.day)
        for vendor in vendor_names:
            count = db.query(Shipment).filter(Shipment.carrier == vendor, Shipment.shipped_date >= month_start, Shipment.shipped_date < month_end).count()
            row[vendor] = count
        data.append(row)
    return data

@router.post("/api/send-monthly-report")
def send_monthly_report(background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    report = generate_monthly_report(db)
    to_email = os.getenv('REPORT_EMAIL', 'admin@example.com')
    subject = 'SmartChain AI: Monthly Report'
    with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as tmp:
        generate_monthly_report_pdf(db, tmp.name)
        pdf_path = tmp.name
    background_tasks.add_task(send_email, subject, report, to_email, pdf_path)
    return {"status": "Report email is being sent with PDF attachment."}

# For scheduler use

def scheduled_send_monthly_report():
    db = SessionLocal()
    try:
        report = generate_monthly_report(db)
        to_email = os.getenv('REPORT_EMAIL', 'admin@example.com')
        subject = 'SmartChain AI: Monthly Report'
        with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as tmp:
            generate_monthly_report_pdf(db, tmp.name)
            pdf_path = tmp.name
        send_email(subject, report, to_email, pdf_path)
    finally:
        db.close() 