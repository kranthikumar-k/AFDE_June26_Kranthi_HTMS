"""
Helpdesk Phase 2 — Dataset Generator
Generates 220 realistic helpdesk tickets as CSV dataset
Output: datasets/tickets_dataset.csv
"""
import os, csv, random
from datetime import datetime, timedelta

random.seed(42)

ROOT     = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATASETS = os.path.join(ROOT, "datasets")
os.makedirs(DATASETS, exist_ok=True)

CATEGORIES = [
    "VPN Issue", "Password Reset", "Software Installation",
    "Laptop Issue", "Email Access", "Network Connectivity",
    "Hardware Request", "Printer Issue", "System Crash",
    "Access Denied", "Data Recovery", "Other"
]

PRIORITIES  = ["Low", "Medium", "High", "Critical"]
PRIORITY_W  = [20, 45, 25, 10]

STATUSES    = ["Open", "In Progress", "Resolved", "Closed"]
STATUS_W    = [15, 20, 40, 25]

DEPARTMENTS = [
    "Engineering", "HR", "Finance", "Operations",
    "Marketing", "Sales", "Legal", "IT Support", "Management"
]

EMPLOYEES = [
    "Arjun Sharma","Priya Mehta","Rohan Verma","Sneha Kapoor","Amit Joshi",
    "Divya Nair","Vikram Singh","Kavya Reddy","Sanjay Gupta","Meena Pillai",
    "Rahul Das","Anjali Bose","Kiran Kumar","Pooja Iyer","Suresh Reddy",
    "Nisha Patel","Manoj Tiwari","Rekha Nair","Deepak Sharma","Anita Roy",
    "Varun Menon","Swathi Rao","Prasad Kulkarni","Lakshmi Devi","Arun Pillai",
    "Geeta Singh","Harish Verma","Sunita Kumari","Ravi Shankar","Asha Nair",
]

DESCRIPTIONS = {
    "VPN Issue":              ["Unable to connect to VPN from home","VPN connection drops after 5 minutes","Cisco AnyConnect shows authentication error","VPN connects but cannot access internal resources","VPN speed is very slow, affecting productivity"],
    "Password Reset":         ["Forgot my Windows login password","Account locked after multiple failed attempts","Need to reset email password","Cannot login to ERP system","Password expired and reset link not working"],
    "Software Installation":  ["Need Microsoft Office installed on new laptop","AutoCAD installation failed with error 1603","Python environment setup required","Need VirtualBox installed for testing","SAP client installation permission denied"],
    "Laptop Issue":           ["Laptop not starting, black screen on boot","Battery draining very fast","Keyboard keys not working properly","Screen flickering issue","Laptop overheating and shutting down"],
    "Email Access":           ["Cannot access Outlook, showing connection error","Emails not syncing on mobile phone","Cannot send attachments above 10MB","Email account showing as disconnected","Not receiving emails from external senders"],
    "Network Connectivity":   ["No internet connection at my workstation","WiFi keeps disconnecting every few minutes","Very slow internet speed on 3rd floor","Cannot access company intranet","Network drive not accessible"],
    "Hardware Request":       ["Need a second monitor for design work","Requesting ergonomic keyboard","Need USB hub for laptop","Requesting webcam for video calls","Need external hard drive for backup"],
    "Printer Issue":          ["Printer showing offline status","Print jobs stuck in queue","Printer not found on network","Poor print quality, lines on paper","Printer paper jam error"],
    "System Crash":           ["Computer crashes with blue screen","Application crashes when opening large files","System freezes during video calls","Outlook crashes when opening attachments","Browser crashes repeatedly"],
    "Access Denied":          ["Cannot access shared drive folder","Permission denied for project folder","Cannot open HR portal","Access denied to finance system","Cannot view dashboard in BI tool"],
    "Data Recovery":          ["Accidentally deleted important project files","Need to recover data from old hard drive","Files missing after Windows update","Database backup restore required","Excel file corrupted, need recovery"],
    "Other":                  ["Need help with IT setup for new joiner","Monitor needs wall mounting","Need software license renewed","Requesting IT equipment audit","Need help with Teams configuration"],
}

RESOLUTION_NOTES = {
    "Resolved": [
        "Issue resolved by resetting network adapter settings.",
        "Fixed by reinstalling the VPN client and reconfiguring profile.",
        "Password reset successfully. User advised to update recovery email.",
        "Replaced faulty RAM module. System running normally.",
        "Software installed and licensed. User trained on basic usage.",
        "Printer driver reinstalled and port configured correctly.",
        "Restored files from daily backup. User data intact.",
        "Cleared print queue and restarted spooler service.",
        "Configured Outlook profile fresh. Emails syncing normally.",
        "Granted required folder permissions. Access confirmed by user.",
    ],
    "Closed": [
        "Issue resolved and confirmed by user. Ticket closed.",
        "Hardware replacement completed. User satisfied.",
        "Software configuration completed successfully.",
        "Network issue fixed at switch level. Stable connection restored.",
        "Data recovered from backup. User confirmed all files present.",
    ],
}

def random_date(start="2023-06-01", end="2024-04-30"):
    s = datetime.strptime(start, "%Y-%m-%d")
    e = datetime.strptime(end,   "%Y-%m-%d")
    return s + timedelta(days=random.randint(0, (e-s).days),
                         hours=random.randint(8,17), minutes=random.randint(0,59))

def resolution_time(priority):
    hours = {"Critical":4,"High":8,"Medium":24,"Low":72}[priority]
    return timedelta(hours=hours + random.randint(0, hours))

tickets = []
for i in range(1, 221):
    cat      = random.choice(CATEGORIES)
    priority = random.choices(PRIORITIES, weights=PRIORITY_W)[0]
    status   = random.choices(STATUSES,   weights=STATUS_W)[0]
    dept     = random.choice(DEPARTMENTS)
    emp      = random.choice(EMPLOYEES)
    created  = random_date()
    desc     = random.choice(DESCRIPTIONS[cat])

    resolved_at = ""
    resolution  = ""
    if status in ("Resolved", "Closed"):
        resolved_dt = created + resolution_time(priority)
        resolved_at = resolved_dt.strftime("%Y-%m-%d %H:%M:%S")
        resolution  = random.choice(RESOLUTION_NOTES[status])

    # Introduce some duplicates for ETL dedup demonstration (10 dupes)
    is_dup = (i > 210)

    tickets.append({
        "ticket_id":        i,
        "employee_name":    emp,
        "department":       dept,
        "issue_category":   cat,
        "description":      desc,
        "priority":         priority,
        "status":           status,
        "resolution_notes": resolution,
        "created_at":       created.strftime("%Y-%m-%d %H:%M:%S"),
        "resolved_at":      resolved_at,
        "is_duplicate":     "Yes" if is_dup else "No",
        "source":           "CSV Import",
    })

# Add 10 intentional duplicates (same employee+category+date combos)
for i in range(211, 221):
    orig = tickets[random.randint(0, 50)]
    tickets[i-1] = {**orig, "ticket_id": i, "is_duplicate": "Yes", "source": "Duplicate Import"}

# Write CSV
csv_path = os.path.join(DATASETS, "tickets_dataset.csv")
with open(csv_path, "w", newline="") as f:
    w = csv.DictWriter(f, fieldnames=tickets[0].keys())
    w.writeheader()
    w.writerows(tickets)

print(f"✅ Generated {len(tickets)} tickets → datasets/tickets_dataset.csv")
print(f"   Priorities: { {p: sum(1 for t in tickets if t['priority']==p) for p in PRIORITIES} }")
print(f"   Statuses:   { {s: sum(1 for t in tickets if t['status']==s) for s in STATUSES} }")
print(f"   Duplicates: { sum(1 for t in tickets if t['is_duplicate']=='Yes') }")
print(f"   Departments: {len(DEPARTMENTS)} departments")
print(f"   Categories:  {len(CATEGORIES)} categories")
