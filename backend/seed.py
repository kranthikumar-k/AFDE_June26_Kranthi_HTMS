import sys
import os
import random
from datetime import datetime, timedelta

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from database import engine, SessionLocal
from models import Base, Ticket

random.seed(42)

CATEGORIES = [
    "VPN Issue", "Password Reset", "Software Installation",
    "Laptop Issue", "Email Access", "Network Connectivity",
    "Hardware Request", "Printer Issue", "System Crash", "Access Denied"
]

PRIORITIES = ["Low", "Medium", "Medium", "Medium", "High", "High", "Critical"]

STATUSES = ["Open", "Open", "In Progress", "Resolved", "Resolved", "Closed"]

DEPARTMENTS = ["Engineering", "HR", "Finance", "Operations", "Marketing", "Sales", "IT Support"]

EMPLOYEES = [
    "Arjun Sharma", "Priya Mehta", "Rohan Verma", "Sneha Kapoor",
    "Amit Joshi", "Divya Nair", "Vikram Singh", "Kavya Reddy",
    "Sanjay Gupta", "Meena Pillai", "Rahul Das", "Anjali Bose"
]

DESCRIPTIONS = [
    "Unable to connect to corporate VPN from home network.",
    "Account locked after multiple failed login attempts.",
    "Need Microsoft Office installed on new laptop.",
    "Laptop not starting, showing black screen on boot.",
    "Cannot access Outlook, showing connection error.",
    "No internet connection at workstation on 2nd floor.",
    "Requesting a second monitor for design work.",
    "Network printer showing offline, unable to print.",
    "Computer crashes with blue screen during video calls.",
    "Cannot access shared drive folder for project files.",
]

RESOLUTIONS = [
    "Issue resolved by resetting network adapter settings.",
    "Password reset successfully.",
    "Software installed and licensed.",
    "Replaced faulty RAM module. System running normally.",
    "Configured Outlook profile. Emails syncing normally.",
    "Fixed network switch port. Connection restored.",
    "Hardware delivered and set up.",
    "Printer driver reinstalled and configured.",
    "Cleared print queue and restarted spooler service.",
    "Granted required folder permissions.",
]


def random_date(days_back=180):
    delta = timedelta(
        days=random.randint(0, days_back),
        hours=random.randint(0, 23)
    )
    return datetime.now() - delta


def main():
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("Tables created.")

    db = SessionLocal()
    try:
        existing = db.query(Ticket).count()
        if existing > 0:
            print("Database already has " + str(existing) + " tickets. Skipping seed.")
            return

        print("Seeding 50 sample tickets...")
        tickets = []
        for i in range(50):
            priority = random.choice(PRIORITIES)
            status = random.choice(STATUSES)
            created = random_date()
            resolution = ""
            if status in ("Resolved", "Closed"):
                resolution = random.choice(RESOLUTIONS)

            t = Ticket(
                employee_name=random.choice(EMPLOYEES),
                department=random.choice(DEPARTMENTS),
                issue_category=random.choice(CATEGORIES),
                description=random.choice(DESCRIPTIONS),
                priority=priority,
                status=status,
                resolution_notes=resolution,
                created_at=created,
                updated_at=created,
            )
            tickets.append(t)

        db.add_all(tickets)
        db.commit()
        print("Done! " + str(len(tickets)) + " tickets seeded successfully.")

    except Exception as e:
        print("Error: " + str(e))
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    main()