import io
from datetime import datetime
from reportlab.lib.pagesizes import landscape, letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

def generate_certificate_pdf(student_name, course_name="Cybersecurity Awareness & Phishing Defense"):
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=landscape(letter),
        rightMargin=0.5 * inch,
        leftMargin=0.5 * inch,
        topMargin=0.5 * inch,
        bottomMargin=0.5 * inch
    )

    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        'CertTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=28,
        leading=34,
        textColor=colors.HexColor('#0B1120'),
        alignment=1
    )
    
    subtitle_style = ParagraphStyle(
        'CertSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=14,
        leading=18,
        textColor=colors.HexColor('#64748B'),
        alignment=1
    )
    
    name_style = ParagraphStyle(
        'CertName',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=30,
        textColor=colors.HexColor('#0284C7'),
        alignment=1
    )
    
    meta_style = ParagraphStyle(
        'CertMeta',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=11,
        leading=15,
        textColor=colors.HexColor('#334155'),
        alignment=1
    )

    story = [
        Spacer(1, 0.4 * inch),
        Paragraph("PHISHSHIELD CYBER DEFENSE ACADEMY", subtitle_style),
        Spacer(1, 0.15 * inch),
        Paragraph("CERTIFICATE OF COMPLETION", title_style),
        Spacer(1, 0.25 * inch),
        Paragraph("This is officially awarded to", subtitle_style),
        Spacer(1, 0.15 * inch),
        Paragraph(student_name.upper(), name_style),
        Spacer(1, 0.15 * inch),
        Paragraph(
            f"For successfully demonstrating competence in recognizing social engineering attacks, "
            f"verifying suspicious digital links, and completing the <b>{course_name}</b> program.",
            meta_style
        ),
        Spacer(1, 0.4 * inch),
    ]

    issue_date = datetime.now().strftime("%B %d, %Y")
    footer_data = [
        [
            Paragraph(f"<b>Issue Date:</b> {issue_date}", meta_style),
            Paragraph("<b>Verification ID:</b> PS-SEC-" + str(abs(hash(student_name)))[:8], meta_style),
            Paragraph("<b>Platform:</b> Dedan Kimathi University of Technology IT Capstone", meta_style)
        ]
    ]
    
    footer_table = Table(footer_data, colWidths=[2.5 * inch, 2.5 * inch, 3.5 * inch])
    footer_table.setStyle(TableStyle([
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('LINEABOVE', (0,0), (-1,-1), 1, colors.HexColor('#CBD5E1')),
    ]))
    
    story.append(footer_table)
    doc.build(story)
    
    buffer.seek(0)
    return buffer