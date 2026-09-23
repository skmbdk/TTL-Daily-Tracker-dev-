import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

def build_pdf(filename="TTL_Tracker_Extensive_User_Manual.pdf"):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=45,
        bottomMargin=45
    )

    styles = getSampleStyleSheet()

    # Custom styles
    primary_color = colors.HexColor("#0284c7")  # Cyan/Sky 600
    dark_slate = colors.HexColor("#0f172a")     # Slate 900
    body_color = colors.HexColor("#334155")     # Slate 700
    light_bg = colors.HexColor("#f8fafc")       # Slate 50
    accent_green = colors.HexColor("#10b981")   # Emerald 500
    accent_amber = colors.HexColor("#f59e0b")   # Amber 500
    accent_rose = colors.HexColor("#f43f5e")    # Rose 500

    title_style = ParagraphStyle(
        'CoverTitle',
        parent=styles['Title'],
        fontName='Helvetica-Bold',
        fontSize=26,
        leading=32,
        textColor=dark_slate,
        alignment=0,
        spaceAfter=10
    )

    subtitle_style = ParagraphStyle(
        'CoverSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=14,
        leading=18,
        textColor=primary_color,
        spaceAfter=25
    )

    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=primary_color,
        spaceBefore=18,
        spaceAfter=10,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=17,
        textColor=dark_slate,
        spaceBefore=14,
        spaceAfter=6,
        keepWithNext=True
    )

    h3_style = ParagraphStyle(
        'Heading3_Custom',
        parent=styles['Heading3'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=colors.HexColor("#0369a1"),
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['BodyText'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=body_color,
        spaceAfter=6
    )

    bullet_style = ParagraphStyle(
        'Bullet_Custom',
        parent=body_style,
        leftIndent=15,
        firstLineIndent=-10,
        spaceAfter=4
    )

    example_style = ParagraphStyle(
        'Example_Custom',
        parent=body_style,
        fontName='Helvetica-Oblique',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#1e293b"),
        backColor=colors.HexColor("#f0f9ff"),
        borderColor=primary_color,
        borderWidth=1,
        borderPadding=8,
        spaceBefore=8,
        spaceAfter=10,
        borderRadius=4
    )

    table_header_style = ParagraphStyle(
        'TableHeader',
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=11,
        textColor=colors.white,
        alignment=1
    )

    table_cell_style = ParagraphStyle(
        'TableCell',
        fontName='Helvetica',
        fontSize=8.5,
        leading=11.5,
        textColor=dark_slate
    )

    table_cell_bold = ParagraphStyle(
        'TableCellBold',
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11.5,
        textColor=dark_slate
    )

    story = []

    # --- COVER / HEADER BANNER ---
    story.append(Paragraph("📘 TTL Tracker Enterprise System", subtitle_style))
    story.append(Paragraph("Extensive UI & Feature User Manual", title_style))
    story.append(Paragraph("<b>Authoritative Standard Operating Procedure (SOP)</b><br/>Role-Based Operational Guide for Administrators, Presenters/Managers, and Team Members", body_style))
    story.append(Spacer(1, 10))
    story.append(HRFlowable(width="100%", thickness=2, color=primary_color, spaceAfter=15))

    # Document Metadata Card
    meta_data = [
        [Paragraph("<b>Document Version:</b> 1.0.0 Enterprise", table_cell_style), Paragraph("<b>Target Audience:</b> Admins, Presenters, Members", table_cell_style)],
        [Paragraph("<b>System Core:</b> React Agile Tracker", table_cell_style), Paragraph("<b>Theme Compatibility:</b> Light & Dark Mode", table_cell_style)],
        [Paragraph("<b>Last Updated:</b> September 2026", table_cell_style), Paragraph("<b>Classification:</b> Operational Standard", table_cell_style)]
    ]
    t_meta = Table(meta_data, colWidths=[260, 270])
    t_meta.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f1f5f9")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#cbd5e1")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#e2e8f0")),
        ('PADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(t_meta)
    story.append(Spacer(1, 15))

    # --- EXECUTIVE SUMMARY & SYSTEM OVERVIEW ---
    story.append(Paragraph("1. System Overview & Platform Architecture", h1_style))
    story.append(Paragraph(
        "<b>TTL Tracker (Task & Team Lifecycle Tracker)</b> is an enterprise agile project management and team productivity workspace. "
        "It unifies real-time Kanban planning, project health analytics, daily remark logs, attachment management, user workload tracking, and security audit logging into a single cohesive web application.",
        body_style
    ))
    story.append(Paragraph("The platform enforces strict role-based access control (RBAC) across three primary user tiers:", body_style))
    story.append(Paragraph("• <b>Normal User (Member)</b>: Focused on daily task execution, updating Kanban status, submitting daily work logs, and uploading deliverables.", bullet_style))
    story.append(Paragraph("• <b>Presenter (Manager)</b>: Focused on executive reviews, monitoring project health, analyzing team workload balance, presenting breakdown modals, and exporting CSV metrics.", bullet_style))
    story.append(Paragraph("• <b>Administrator (Admin)</b>: Full system governance including project space creation, user onboarding, role management, security audit log analysis, and workspace archival.", bullet_style))

    story.append(Spacer(1, 10))

    # --- PERMISSION MATRIX TABLE ---
    story.append(Paragraph("2. Comprehensive Permission & Access Matrix", h1_style))
    story.append(Paragraph("The matrix below outlines feature availability across all three user roles:", body_style))

    perm_data = [
        [Paragraph("Feature / Capability", table_header_style), Paragraph("Normal User (Member)", table_header_style), Paragraph("Presenter (Manager)", table_header_style), Paragraph("Administrator (Admin)", table_header_style)],
        [Paragraph("View Personal Dashboard & KPIs", table_cell_bold), Paragraph("✅ Assigned Tasks", table_cell_style), Paragraph("✅ Full Workspace", table_cell_style), Paragraph("✅ Full Workspace", table_cell_style)],
        [Paragraph("Kanban Board Drag & Drop", table_cell_bold), Paragraph("✅ Assigned Tasks", table_cell_style), Paragraph("✅ All Tasks", table_cell_style), Paragraph("✅ All Tasks", table_cell_style)],
        [Paragraph("Daily Remarks & Work Logs", table_cell_bold), Paragraph("✅ Allowed", table_cell_style), Paragraph("✅ Allowed", table_cell_style), Paragraph("✅ Allowed", table_cell_style)],
        [Paragraph("Upload Attachments & Links", table_cell_bold), Paragraph("✅ Allowed", table_cell_style), Paragraph("✅ Allowed", table_cell_style), Paragraph("✅ Allowed", table_cell_style)],
        [Paragraph("Task Creation & Editing", table_cell_bold), Paragraph("🟡 Assigned Tasks", table_cell_style), Paragraph("✅ All Tasks", table_cell_style), Paragraph("✅ All Tasks", table_cell_style)],
        [Paragraph("Project Health & Metrics", table_cell_bold), Paragraph("✅ Read-only", table_cell_style), Paragraph("✅ Full Access", table_cell_style), Paragraph("✅ Full Access", table_cell_style)],
        [Paragraph("Project Breakdown Modal", table_cell_bold), Paragraph("✅ Read-only", table_cell_style), Paragraph("✅ Full Access", table_cell_style), Paragraph("✅ Full Access", table_cell_style)],
        [Paragraph("Create & Edit Projects", table_cell_bold), Paragraph("❌ Restricted", table_cell_style), Paragraph("🟡 View / Request", table_cell_style), Paragraph("✅ Full Control", table_cell_style)],
        [Paragraph("User Workload & Performance", table_cell_bold), Paragraph("🟡 Self Only", table_cell_style), Paragraph("✅ All Team Members", table_cell_style), Paragraph("✅ All Team Members", table_cell_style)],
        [Paragraph("User Onboarding & Roles", table_cell_bold), Paragraph("❌ Restricted", table_cell_style), Paragraph("❌ Restricted", table_cell_style), Paragraph("✅ Full Control", table_cell_style)],
        [Paragraph("Activity Audit Center", table_cell_bold), Paragraph("❌ Restricted", table_cell_style), Paragraph("🟡 View Logs", table_cell_style), Paragraph("✅ Full Control", table_cell_style)],
        [Paragraph("Export Reports to CSV", table_cell_bold), Paragraph("❌ Restricted", table_cell_style), Paragraph("✅ Allowed", table_cell_style), Paragraph("✅ Allowed", table_cell_style)],
    ]

    t_perm = Table(perm_data, colWidths=[150, 120, 130, 130])
    t_perm.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('ALIGN', (0,0), (-1,0), 'CENTER'),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#f8fafc")]),
        ('PADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t_perm)

    story.append(PageBreak())

    # --- SECTION 1: NORMAL USER / MEMBER GUIDE ---
    story.append(Paragraph("3. Role 1: Normal User / Member Guide", h1_style))
    story.append(Paragraph("As a <b>Normal User (Member)</b>, your daily workflow revolves around executing assigned tasks, maintaining clear visibility into your progress, and communicating completed milestones to team managers.", body_style))

    story.append(Paragraph("Feature 3.1: Kanban Board Navigation & Drag-and-Drop", h2_style))
    story.append(Paragraph("1. Click <b>Kanban</b> in the left navigation sidebar.", bullet_style))
    story.append(Paragraph("2. Understand the 4 standard Kanban columns:", bullet_style))
    story.append(Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;• <b>To Do</b>: Tasks assigned to you that are ready to begin.", bullet_style))
    story.append(Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;• <b>In Progress</b>: Tasks you are actively working on today.", bullet_style))
    story.append(Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;• <b>Testing / Review</b>: Tasks finished and undergoing quality assurance.", bullet_style))
    story.append(Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;• <b>Completed</b>: Delivered and verified tasks.", bullet_style))
    story.append(Paragraph("3. <b>Drag-and-Drop Action</b>: Click and hold any task card, drag it horizontally across columns, and release. The system updates status instantly.", bullet_style))

    story.append(Paragraph("Feature 3.2: Task Details Modal, Daily Remarks & Attachments", h2_style))
    story.append(Paragraph("1. Click on any task card on the Kanban Board or Task List to open the <b>Task Details Modal</b>.", bullet_style))
    story.append(Paragraph("2. <b>Daily Remarks</b>: Scroll to the <i>Daily Remarks</i> section. Type your detailed progress note in the text box and click <b>Add Remark</b>.", bullet_style))
    story.append(Paragraph("3. <b>File Uploads</b>: Navigate to <i>Task Attachments</i> -> click <b>Upload File</b> -> select document (PDF, PNG, JPG, ZIP, DOCX) -> confirm upload.", bullet_style))
    story.append(Paragraph("4. <b>Web Link Attachments</b>: Click <b>Add Link</b> -> enter external URL (e.g. GitHub Pull Request or Figma design link) and title -> click Save.", bullet_style))
    story.append(Paragraph("5. <b>Subtask Checklist</b>: Toggle subtask checkboxes as sub-items are completed.", bullet_style))

    story.append(Paragraph(
        "<b>💡 Practical Step-by-Step Example (Member Workflow):</b><br/>"
        "<b>Scenario:</b> Rahul (Software Engineer) starts work on Task <i>#34: Installation of TC Foundation</i>.<br/>"
        "• <b>Step 1:</b> Rahul opens the <b>Kanban Board</b> and drags Task <i>#34</i> card from <b>To Do</b> column into <b>In Progress</b>.<br/>"
        "• <b>Step 2:</b> He clicks Task <i>#34</i> card to open the Details Modal.<br/>"
        "• <b>Step 3:</b> Under <i>Daily Remarks</i>, he types: <i>'Configured server environment and installed prerequisite packages on 10.0.1.5'</i> and clicks <b>Add Remark</b>.<br/>"
        "• <b>Step 4:</b> Under <i>Task Attachments</i>, he clicks <b>Upload File</b> and attaches <code>deployment_log_v1.txt</code>.<br/>"
        "• <b>Step 5:</b> Once server verification completes, he drags Task <i>#34</i> to <b>Completed</b>.",
        example_style
    ))

    story.append(Spacer(1, 15))

    # --- SECTION 2: PRESENTER / MANAGER GUIDE ---
    story.append(Paragraph("4. Role 2: Presenter / Manager Guide", h1_style))
    story.append(Paragraph("As a <b>Presenter / Manager</b>, your primary responsibility is presenting project milestones to stakeholders, monitoring project health, managing team workload distribution, and identifying bottlenecks.", body_style))

    story.append(Paragraph("Feature 4.1: Project Health Indicators & Portfolio Monitoring", h2_style))
    story.append(Paragraph("1. Click <b>Projects</b> in the left sidebar menu.", bullet_style))
    story.append(Paragraph("2. Real-time Project Health Badges are computed automatically as follows:", bullet_style))

    health_data = [
        [Paragraph("Health Badge", table_header_style), Paragraph("Color", table_header_style), Paragraph("Trigger Condition / Business Meaning", table_header_style)],
        [Paragraph("On Track", table_cell_bold), Paragraph("🟢 Emerald Green", table_cell_style), Paragraph("Project is running smoothly; target deadline is <b>more than 5 days away</b>.", table_cell_style)],
        [Paragraph("Due Soon", table_cell_bold), Paragraph("🟡 Amber Yellow", table_cell_style), Paragraph("Target deadline is <b>within 5 days</b>; requires close team monitoring.", table_cell_style)],
        [Paragraph("Overdue", table_cell_bold), Paragraph("🔴 Rose Red", table_cell_style), Paragraph("Target deadline has passed without status being marked Completed.", table_cell_style)],
        [Paragraph("Completed", table_cell_bold), Paragraph("🔵 Blue / Green", table_cell_style), Paragraph("Project space is fully delivered.", table_cell_style)],
        [Paragraph("On Hold", table_cell_bold), Paragraph("🟡 Amber", table_cell_style), Paragraph("Project is temporarily paused by leadership.", table_cell_style)],
    ]
    t_health = Table(health_data, colWidths=[90, 110, 330])
    t_health.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), dark_slate),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#f8fafc")]),
        ('PADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t_health)
    story.append(Spacer(1, 8))

    story.append(Paragraph("Feature 4.2: Project Detail & Task Breakdown Modal (Presentation Mode)", h2_style))
    story.append(Paragraph("1. On the <b>Projects</b> table, click the <b>View Details</b> button (bar chart icon) or click anywhere on the project row.", bullet_style))
    story.append(Paragraph("2. The <b>Project Detail Modal</b> opens instantly, displaying:", bullet_style))
    story.append(Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;• <b>Top Header</b>: Project initials avatar, name, status badge, and project health badge.", bullet_style))
    story.append(Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;• <b>Key Metrics Grid</b>: Total Tasks count, Completion Rate %, Story Points Delivered vs Total, End Target Date.", bullet_style))
    story.append(Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;• <b>Assigned Team Members</b>: Full list of assigned members with avatar icons.", bullet_style))
    story.append(Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;• <b>Project Tasks Breakdown List</b>: List of all linked tasks with IDs, priority badges, story points, and direct links.", bullet_style))

    story.append(Paragraph("Feature 4.3: User Workload & Performance Analytics", h2_style))
    story.append(Paragraph("1. Click <b>Users</b> in the left menu.", bullet_style))
    story.append(Paragraph("2. Click <b>View Workload & Performance</b> on any user card to review assigned task volume, completion %, story points delivered, and overdue tasks count.", bullet_style))

    story.append(Paragraph("Feature 4.4: Executive CSV Report Export", h2_style))
    story.append(Paragraph("1. On <b>Projects</b> or <b>Users</b> page, click <b>Export CSV</b> in the top header.", bullet_style))
    story.append(Paragraph("2. Downloads a formatted CSV containing project IDs, completion %, story points, dates, health status, and member counts.", bullet_style))

    story.append(Paragraph(
        "<b>💡 Practical Step-by-Step Example (Presenter/Manager Review):</b><br/>"
        "<b>Scenario:</b> Priya (Engineering Lead) conducts the Weekly Executive Review.<br/>"
        "• <b>Step 1:</b> Priya opens <b>Projects</b> and filters by status <code>Active</code>.<br/>"
        "• <b>Step 2:</b> She identifies a project marked 🟡 <b>Due Soon</b> and clicks <b>View Details</b>.<br/>"
        "• <b>Step 3:</b> During screen sharing, she presents the Project Detail Modal showing 85% completion rate, 45/50 story points delivered, and assigned team members.<br/>"
        "• <b>Step 4:</b> She clicks <b>Export CSV</b> to attach the official summary report to director meeting minutes.",
        example_style
    ))

    story.append(PageBreak())

    # --- SECTION 3: ADMINISTRATOR (ADMIN) GUIDE ---
    story.append(Paragraph("5. Role 3: Administrator (Admin) Guide", h1_style))
    story.append(Paragraph("As an <b>Administrator (Admin)</b>, you hold complete operational governance over the platform: project space creation, user onboarding, role assignments, security audit log tracking, and workspace archival.", body_style))

    story.append(Paragraph("Feature 5.1: Project Space Creation & Assignment", h2_style))
    story.append(Paragraph("1. Navigate to <b>Projects</b> page -> click <b>Create Project</b> in top action bar.", bullet_style))
    story.append(Paragraph("2. Input Project Name, Status (Active, On Hold, Completed), Start & End Target Dates, and Description.", bullet_style))
    story.append(Paragraph("3. Select assigned Team Members from the multi-select dropdown.", bullet_style))
    story.append(Paragraph("4. Click <b>Save Project</b>.", bullet_style))

    story.append(Paragraph("Feature 5.2: User Onboarding, Status & Role Governance", h2_style))
    story.append(Paragraph("1. Navigate to <b>Users</b> page.", bullet_style))
    story.append(Paragraph("2. <b>Create User</b>: Click <b>Add User</b> -> enter Full Name, Email, Role (<code>Admin</code>, <code>Manager</code>, <code>User</code>), and password.", bullet_style))
    story.append(Paragraph("3. <b>Edit Role / Status</b>: Click <b>Edit</b> on any user row to change system roles or toggle account status (<code>Active</code> vs <code>Inactive</code>).", bullet_style))

    story.append(Paragraph("Feature 5.3: Security Audit Center & Activity Tracking", h2_style))
    story.append(Paragraph("1. Click <b>Activity Center</b> in the left sidebar menu.", bullet_style))
    story.append(Paragraph("2. Use the filter toolbar to inspect security logs:", bullet_style))
    story.append(Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;• <b>Search Bar</b>: Search logs by keyword or user name.", bullet_style))
    story.append(Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;• <b>User Filter</b>: Filter actions performed by a specific user.", bullet_style))
    story.append(Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;• <b>Action Type Filter</b>: Filter by <code>Task Creation</code>, <code>Project Edit</code>, <code>User Role Change</code>, <code>Login</code>.", bullet_style))
    story.append(Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;• <b>Date Filter</b>: Filter by Today, Last 7 Days, Last 30 Days, or Custom Date Picker.", bullet_style))
    story.append(Paragraph("3. Click any audit log row to launch the <b>Activity Detail Modal</b> displaying exact timestamp, IP address, and JSON payload parameters.", bullet_style))

    story.append(Paragraph(
        "<b>💡 Practical Step-by-Step Example (Administrator Workflow):</b><br/>"
        "<b>Scenario:</b> Amit (System Admin) onboards a new Senior Manager and sets up a new Project Space.<br/>"
        "• <b>Step 1:</b> Amit opens <b>Users</b> -> clicks <b>Add User</b> -> enters Name: <i>'Ananya Sharma'</i>, Role: <i>'Manager'</i>, Status: <i>'Active'</i>.<br/>"
        "• <b>Step 2:</b> He opens <b>Projects</b> -> clicks <b>Create Project</b> -> creates <i>'Cloud Migration 2026'</i>, assigns Ananya as Lead along with 4 engineers.<br/>"
        "• <b>Step 3:</b> He opens <b>Activity Center</b> to verify the audit log cleanly records <code>User Created</code> and <code>Project Created</code> events.",
        example_style
    ))

    story.append(Spacer(1, 15))

    # --- SECTION 4: UI NAVIGATION & STYLING ---
    story.append(Paragraph("6. UI Navigation, Theme Controls & Aesthetics", h1_style))
    story.append(Paragraph("Feature 6.1: Light & Dark Theme Switcher", h2_style))
    story.append(Paragraph("Click the <b>Sun / Moon toggle button</b> in the top-right header navigation bar to seamlessly toggle between <b>Light Theme</b> and <b>Dark Theme</b>. The system preserves your preference automatically.", body_style))

    story.append(Paragraph("Feature 6.2: Search & Filter Toolbar Standards", h2_style))
    story.append(Paragraph("All management pages (Activity Center, Users, Projects, Tasks) feature a unified toolbar containing:", body_style))
    story.append(Paragraph("• <b>Live Search Input</b>: Instant filtering as you type.", bullet_style))
    story.append(Paragraph("• <b>Select Dropdowns</b>: Status, Role, Stream, Member, and Timeframe filters.", bullet_style))
    story.append(Paragraph("• <b>Reset Filters Button</b>: Click <code>Reset filters (N)</code> to clear all active filter constraints in one click.", bullet_style))

    story.append(Spacer(1, 15))

    # --- SECTION 5: FAQ & TROUBLESHOOTING ---
    story.append(Paragraph("7. Frequently Asked Questions (FAQ) & Troubleshooting", h1_style))

    faq_data = [
        [Paragraph("Question / Issue", table_header_style), Paragraph("Resolution & Explanation", table_header_style)],
        [Paragraph("What does 'Health: On Track' mean?", table_cell_bold), Paragraph("<code>On Track</code> (Green badge) indicates the project is progressing smoothly and its target completion deadline is <b>more than 5 days away</b>.", table_cell_style)],
        [Paragraph("Why is a button opening a blank screen?", table_cell_bold), Paragraph("All modal components are fully guarded against missing data. If an uncaught error occurs, refresh your browser or notify your administrator.", table_cell_style)],
        [Paragraph("How do I export project reports?", table_cell_bold), Paragraph("Navigate to the Projects or Users page and click the <b>Export CSV</b> button in the top action header.", table_cell_style)],
        [Paragraph("Why can't a Normal User see Activity Center?", table_cell_bold), Paragraph("Activity Center contains security audit logs (including login events and role changes) reserved for Administrators and Managers for compliance reasons.", table_cell_style)],
    ]
    t_faq = Table(faq_data, colWidths=[180, 350])
    t_faq.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#f8fafc")]),
        ('PADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(t_faq)

    # Build document
    doc.build(story)
    print(f"Successfully generated PDF manual: {filename}")

if __name__ == '__main__':
    build_pdf()
