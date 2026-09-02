import io
import uuid
from datetime import datetime
from reportlab.lib.pagesizes import letter, landscape
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

def generate_certificate_pdf(student_name="Student Candidate", score=85.0):
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=landscape(letter),
        rightMargin=40,
        leftMargin=40,
        topMargin=35,
        bottomMargin=35
    )
    
    cert_id = f"ICONS-SEC-{datetime.now().year}-{uuid.uuid4().hex[:8].upper()}"
    date_str = datetime.now().strftime("%B %d, %Y")
    
    styles = getSampleStyleSheet()
    
    header_style = ParagraphStyle(
        'CertHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=26,
        leading=32,
        alignment=1,
        textColor=colors.HexColor('#0F172A')
    )
    
    sub_institution_style = ParagraphStyle(
        'CertInst',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=15,
        leading=18,
        alignment=1,
        textColor=colors.HexColor('#0D9488')
    )
    
    awarded_style = ParagraphStyle(
        'CertAwarded',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        alignment=1,
        textColor=colors.HexColor('#64748B')
    )
    
    name_style = ParagraphStyle(
        'CertName',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        alignment=1,
        textColor=colors.HexColor('#1E293B')
    )
    
    body_style = ParagraphStyle(
        'CertBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=11,
        leading=16,
        alignment=1,
        textColor=colors.HexColor('#334155')
    )
    
    meta_style = ParagraphStyle(
        'CertMeta',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=12,
        alignment=1,
        textColor=colors.HexColor('#94A3B8')
    )

    story = []
    story.append(Paragraph("CERTIFICATE OF PROFICIENCY", header_style))
    story.append(Paragraph("ICONS COMPUTER SCHOOL AND CYBER", sub_institution_style))
    story.append(Spacer(1, 10))
    story.append(HRFlowable(width="80%", thickness=2, color=colors.HexColor('#0D9488'), spaceAfter=15, spaceBefore=5))
    
    story.append(Paragraph("This is to certify that", awarded_style))
    story.append(Spacer(1, 8))
    story.append(Paragraph(student_name.upper(), name_style))
    story.append(Spacer(1, 8))
    
    desc_text = (
        f"has successfully completed the complete Cybersecurity & Phishing Defense curriculum, "
        f"demonstrating excellence in email spoof analysis, technical heuristic scanning, and threat containment with a final evaluation score of <b>{score}%</b>."
    )
    story.append(Paragraph(desc_text, body_style))
    story.append(Spacer(1, 20))
    
    meta_text = f"<b>Certificate ID:</b> {cert_id} &nbsp;&nbsp;|&nbsp;&nbsp; <b>Date Issued:</b> {date_str} &nbsp;&nbsp;|&nbsp;&nbsp; <b>Authority:</b> Icons Computer School and Cyber"
    story.append(Paragraph(meta_text, meta_style))
    
    doc.build(story)
    buffer.seek(0)
    return buffer, cert_id