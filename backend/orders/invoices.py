from decimal import Decimal
import re
import textwrap

from django.utils import timezone


PAGE_WIDTH = 595
PAGE_HEIGHT = 842
MARGIN = 48


def format_invoice_currency(value):
    amount = Decimal(value or 0)
    return f"BDT {amount:,.2f}"


def get_invoice_filename(order):
    safe_order_number = re.sub(r"[^a-zA-Z0-9_.-]+", "-", order.order_number).strip("-")
    return f"invoice-{safe_order_number or order.id}.pdf"


def _pdf_string(value):
    text = str(value or "").encode("cp1252", errors="replace").decode("cp1252")
    return text.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")


class InvoicePdf:
    def __init__(self):
        self.pages = []
        self.commands = []
        self.y = PAGE_HEIGHT - MARGIN
        self.add_page()

    def add_page(self):
        if self.commands:
            self.pages.append("\n".join(self.commands).encode("cp1252"))
        self.commands = []
        self.y = PAGE_HEIGHT - MARGIN

    def ensure_space(self, height):
        if self.y - height < MARGIN:
            self.add_page()

    def text(self, x, y, value, size=10, bold=False):
        font = "F2" if bold else "F1"
        self.commands.append(
            f"BT /{font} {size} Tf {x:.2f} {y:.2f} Td ({_pdf_string(value)}) Tj ET"
        )

    def line(self, x1, y1, x2, y2, width=1):
        self.commands.append(
            f"{width:.2f} w {x1:.2f} {y1:.2f} m {x2:.2f} {y2:.2f} l S"
        )

    def row_text(self, x, value, width, size=10, bold=False):
        chars = max(8, int(width / (size * 0.48)))
        lines = textwrap.wrap(str(value or ""), width=chars) or [""]
        for line in lines:
            self.text(x, self.y, line, size=size, bold=bold)
            self.y -= size + 4
        return len(lines)

    def section_title(self, title):
        self.ensure_space(36)
        self.y -= 18
        self.text(MARGIN, self.y, title, size=13, bold=True)
        self.y -= 8
        self.line(MARGIN, self.y, PAGE_WIDTH - MARGIN, self.y, width=0.8)
        self.y -= 18

    def render(self):
        if self.commands:
            self.pages.append("\n".join(self.commands).encode("cp1252"))
            self.commands = []
        return _build_pdf(self.pages)


def _build_pdf(page_streams):
    objects = [
        b"<< /Type /Catalog /Pages 2 0 R >>",
        None,
        b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
        b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>",
    ]
    page_ids = []

    for stream in page_streams:
        content_id = len(objects) + 1
        objects.append(
            b"<< /Length "
            + str(len(stream)).encode("ascii")
            + b" >>\nstream\n"
            + stream
            + b"\nendstream"
        )
        page_id = len(objects) + 1
        page_ids.append(page_id)
        objects.append(
            (
                "<< /Type /Page /Parent 2 0 R "
                f"/MediaBox [0 0 {PAGE_WIDTH} {PAGE_HEIGHT}] "
                "/Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> "
                f"/Contents {content_id} 0 R >>"
            ).encode("ascii")
        )

    kids = " ".join(f"{page_id} 0 R" for page_id in page_ids)
    objects[1] = f"<< /Type /Pages /Kids [{kids}] /Count {len(page_ids)} >>".encode(
        "ascii"
    )

    output = bytearray(b"%PDF-1.4\n%\xe2\xe3\xcf\xd3\n")
    offsets = [0]
    for index, obj in enumerate(objects, start=1):
        offsets.append(len(output))
        output.extend(f"{index} 0 obj\n".encode("ascii"))
        output.extend(obj)
        output.extend(b"\nendobj\n")

    xref_start = len(output)
    output.extend(f"xref\n0 {len(objects) + 1}\n".encode("ascii"))
    output.extend(b"0000000000 65535 f \n")
    for offset in offsets[1:]:
        output.extend(f"{offset:010d} 00000 n \n".encode("ascii"))
    output.extend(
        (
            f"trailer\n<< /Size {len(objects) + 1} /Root 1 0 R >>\n"
            f"startxref\n{xref_start}\n%%EOF\n"
        ).encode("ascii")
    )
    return bytes(output)


def _draw_label_value(pdf, label, value, x, width, size=10):
    pdf.row_text(x, label, width, size=9, bold=True)
    pdf.row_text(x, value, width, size=size)


def render_order_invoice_pdf(order):
    pdf = InvoicePdf()
    right_x = 365

    pdf.text(MARGIN, pdf.y, "Invoice", size=28, bold=True)
    pdf.text(MARGIN, pdf.y - 24, f"Order #{order.order_number}", size=11)
    pdf.text(
        right_x,
        pdf.y,
        f"Issued: {timezone.localtime().strftime('%B %d, %Y %I:%M %p')}",
        size=10,
    )
    pdf.text(
        right_x,
        pdf.y - 16,
        f"Placed: {timezone.localtime(order.created_at).strftime('%B %d, %Y %I:%M %p')}",
        size=10,
    )
    pdf.text(right_x, pdf.y - 32, f"Status: {order.get_status_display()}", size=10)
    pdf.y -= 58
    pdf.line(MARGIN, pdf.y, PAGE_WIDTH - MARGIN, pdf.y, width=1.4)

    pdf.section_title("Customer")
    customer_start_y = pdf.y
    _draw_label_value(pdf, "Name", order.customer_name, MARGIN, 230)
    if order.customer_email:
        _draw_label_value(pdf, "Email", order.customer_email, MARGIN, 230)
    if order.guest_mobile_number:
        _draw_label_value(pdf, "Phone", order.guest_mobile_number, MARGIN, 230)

    pdf.y = customer_start_y
    _draw_label_value(
        pdf, "Payment Method", order.get_payment_method_display(), right_x, 180
    )
    _draw_label_value(
        pdf, "Payment Status", order.get_payment_status_display(), right_x, 180
    )
    pdf.y = min(pdf.y, customer_start_y - 70)

    shipping_address = getattr(order, "shipping_address", None)
    if shipping_address:
        pdf.section_title("Shipping Address")
        address_lines = [
            shipping_address.full_name,
            shipping_address.mobile_number,
            shipping_address.address_line1,
            shipping_address.address_line2,
            (
                f"{shipping_address.city}, {shipping_address.state} "
                f"{shipping_address.postal_code}"
            ),
            shipping_address.country,
        ]
        for line in filter(None, address_lines):
            pdf.row_text(MARGIN, line, 450, size=10)

    pdf.section_title("Order Items")
    header_y = pdf.y
    pdf.text(MARGIN, header_y, "Product", size=9, bold=True)
    pdf.text(330, header_y, "Qty", size=9, bold=True)
    pdf.text(382, header_y, "Unit Price", size=9, bold=True)
    pdf.text(480, header_y, "Total", size=9, bold=True)
    pdf.y -= 10
    pdf.line(MARGIN, pdf.y, PAGE_WIDTH - MARGIN, pdf.y, width=0.6)
    pdf.y -= 18

    for item in order.items.all():
        pdf.ensure_space(54)
        row_y = pdf.y
        product_lines = textwrap.wrap(item.product_name, width=38) or [""]
        sku = item.product_sku or item.variant_sku
        for index, line in enumerate(product_lines[:3]):
            pdf.text(MARGIN, row_y - (index * 13), line, size=10, bold=index == 0)
        pdf.text(MARGIN, row_y - (len(product_lines[:3]) * 13), f"SKU: {sku}", size=8)
        pdf.text(335, row_y, item.quantity, size=10)
        pdf.text(382, row_y, format_invoice_currency(item.unit_price), size=10)
        pdf.text(480, row_y, format_invoice_currency(item.total_price), size=10)
        pdf.y -= max(42, (len(product_lines[:3]) + 1) * 13 + 10)
        pdf.line(MARGIN, pdf.y, PAGE_WIDTH - MARGIN, pdf.y, width=0.35)
        pdf.y -= 14

    pdf.ensure_space(120)
    summary_x = 355
    summary = [
        ("Subtotal", format_invoice_currency(order.subtotal)),
        ("Shipping", format_invoice_currency(order.shipping_amount)),
    ]
    if order.discount_amount > 0:
        summary.append(("Discount", f"-{format_invoice_currency(order.discount_amount)}"))
    if order.tax_amount > 0:
        summary.append(("Tax", format_invoice_currency(order.tax_amount)))

    for label, value in summary:
        pdf.text(summary_x, pdf.y, label, size=10)
        pdf.text(470, pdf.y, value, size=10, bold=True)
        pdf.y -= 18
    pdf.line(summary_x, pdf.y, PAGE_WIDTH - MARGIN, pdf.y, width=1)
    pdf.y -= 22
    pdf.text(summary_x, pdf.y, "Grand Total", size=12, bold=True)
    pdf.text(455, pdf.y, format_invoice_currency(order.total_amount), size=12, bold=True)
    pdf.y -= 24

    notes = [order.customer_note, order.admin_note]
    notes = [note for note in notes if note]
    if notes:
        pdf.section_title("Notes")
        for note in notes:
            pdf.row_text(MARGIN, note, 480, size=10)
            pdf.y -= 8

    return pdf.render()
