from graphviz import Digraph
from PIL import Image
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4

# ========================
# DER (Diagrama Entidade-Relacionamento físico)
# ========================
der = Digraph("DER", format="png")
der.attr(rankdir="LR", size="8")

der.node("Customer", """Customer
- id (PK)
- name
- email
- document
- phone
- country
- loyalty_tier
- indexed_at""")

der.node("Hotel", """Hotel
- id (PK)
- name
- city
- state
- indexed_at""")

der.node("Reservation", """Reservation
- id (PK)
- uuid
- created_at
- updated_at
- type
- status
- total_amount
- currency
- customer_id (FK)
- hotel_id (FK)
- indexed_at""")

der.node("RoomCategory", """RoomCategory
- id (PK)
- name
- indexed_at""")

der.node("RoomSubCategory", """RoomSubCategory
- id (PK)
- name
- category_id (FK)
- indexed_at""")

der.node("Room", """Room
- id (PK)
- reservation_id (FK)
- room_number
- daily_rate
- number_of_days
- checkin_date
- checkout_date
- status
- guests
- breakfast_included
- category_id (FK)
- sub_category_id (FK)
- total_value (calc)
- indexed_at""")

der.node("Payment", """Payment
- id (PK)
- reservation_id (FK)
- method
- status
- transaction_id
- amount
- indexed_at""")

der.node("Metadata", """Metadata
- id (PK)
- reservation_id (FK)
- source
- user_agent
- ip_address
- version
- indexed_at""")

# Relacionamentos
der.edge("Customer", "Reservation", label="1:N")
der.edge("Hotel", "Reservation", label="1:N")
der.edge("Reservation", "Room", label="1:N")
der.edge("RoomCategory", "Room", label="1:N")
der.edge("RoomSubCategory", "Room", label="1:N")
der.edge("Reservation", "Payment", label="1:1")
der.edge("Reservation", "Metadata", label="1:1")

der.render("DER", format="png", cleanup=True)

# ========================
# MER (Modelo Entidade-Relacionamento conceitual)
# ========================
mer = Digraph("MER", format="png")
mer.attr(rankdir="LR", size="8")

mer.node("Customer", "Customer")
mer.node("Hotel", "Hotel")
mer.node("Reservation", "Reservation")
mer.node("Room", "Room")
mer.node("Category", "Category / SubCategory")
mer.node("Payment", "Payment")
mer.node("Metadata", "Metadata")

mer.edge("Customer", "Reservation", label="faz")
mer.edge("Hotel", "Reservation", label="possui")
mer.edge("Reservation", "Room", label="contém")
mer.edge("Category", "Room", label="classifica")
mer.edge("Reservation", "Payment", label="tem")
mer.edge("Reservation", "Metadata", label="gera")

mer.render("MER", format="png", cleanup=True)
