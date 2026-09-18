from datetime import datetime, timedelta

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models import Email, Message, User


def seed_database(session: Session) -> None:
    if session.scalar(select(func.count(User.id))):
        return

    users = [
        User(id=1, name="Peng Ma", email="peng@workhub.demo", job_title="Software Engineer", avatar="PM", status="online"),
        User(id=2, name="Amanda Johnson", email="amanda@workhub.demo", job_title="HR Manager", avatar="AJ", status="online"),
        User(id=3, name="John Smith", email="john@workhub.demo", job_title="Product Manager", avatar="JS", status="online"),
        User(id=4, name="Sophia Lee", email="sophia@workhub.demo", job_title="Software Engineer", avatar="SL", status="away"),
        User(id=5, name="Michael Brown", email="michael@workhub.demo", job_title="DevOps Engineer", avatar="MB", status="offline"),
        User(id=6, name="Emily Davis", email="emily@workhub.demo", job_title="Designer", avatar="ED", status="online"),
    ]
    session.add_all(users)
    session.flush()

    base = datetime(2026, 9, 17, 8, 20)
    conversations = {
        2: [
            (2, "Good morning Peng! How is the WorkHub demo coming along?"),
            (1, "Morning Amanda. The main messaging flow is ready."),
            (2, "Great. Please make sure the email scenario is polished too."),
            (1, "Absolutely — I am working through the reply flow now."),
            (2, "Could you share the latest version before our review?"),
        ],
        3: [
            (3, "I updated the acceptance criteria for the first release."),
            (1, "Thanks John, I will align the demo with those points."),
            (3, "The core story should stay focused on messaging and email."),
            (1, "Agreed. I am keeping the scope intentionally small."),
        ],
        4: [
            (4, "The API response types look clean after the last change."),
            (1, "Nice catch on the nullable timestamps."),
            (4, "I can review the persistence tests this afternoon."),
            (1, "That would be helpful, thank you."),
        ],
        5: [
            (5, "The staging database backup completed successfully."),
            (1, "Perfect. I only need local SQLite for this demo."),
            (5, "Sounds good. The schema will migrate cleanly later."),
            (1, "That is exactly the goal for phase one."),
        ],
        6: [
            (6, "I added the spacing notes to the design handoff."),
            (1, "The calmer blue palette is working well."),
            (6, "Great — keep the composer visually anchored."),
        ],
    }
    message_index = 0
    for contact_id, entries in conversations.items():
        for sender_id, content in entries:
            receiver_id = contact_id if sender_id == 1 else 1
            session.add(
                Message(
                    sender_id=sender_id,
                    receiver_id=receiver_id,
                    content=content,
                    created_at=base + timedelta(minutes=message_index * 9),
                    is_read=sender_id == 1 or message_index % 3 != 0,
                )
            )
            message_index += 1

    email_rows = [
        (2, 1, "Project Meeting", "Hi Peng,\n\nCan we review the WorkHub milestones on Monday afternoon? I would like to confirm the demo flow before the team presentation.\n\nBest,\nAmanda", "inbox", False, True),
        (3, 1, "Customer Feedback", "Hi Peng,\n\nThe pilot group liked the focused navigation and asked us to keep the first release simple. I added their notes to the product brief.\n\nJohn", "inbox", False, False),
        (2, 1, "Timesheet Approval", "Your September timesheet has been approved. No further action is needed.\n\nThanks,\nAmanda", "inbox", True, False),
        (5, 1, "Deployment Update", "The staging deployment completed at 07:30. API health checks and database initialization are both passing.\n\nMichael", "inbox", True, True),
        (4, 1, "Weekly Report", "This week we completed API contracts, persistence tests, and the initial frontend integration. Next week we will focus on usability polish.\n\nSophia", "inbox", True, False),
        (2, 1, "Interview Schedule", "Your portfolio review is scheduled for Thursday at 10:00. Please bring a short walkthrough of the WorkHub architecture.\n\nAmanda", "inbox", False, False),
        (5, 1, "Server Maintenance", "Planned maintenance will run Saturday from 02:00 to 03:00. The demo environment is not affected.\n\nMichael", "inbox", True, False),
        (6, 1, "Design Review Notes", "The new conversation layout feels clear and balanced. I recommend keeping the blue accent only for primary actions.\n\nEmily", "inbox", True, False),
        (1, 3, "WorkHub scope confirmation", "Hi John,\n\nI have kept phase one focused on messaging and email as agreed.\n\nBest regards,\nPeng", "sent", True, False),
        (1, 4, "API review follow-up", "Hi Sophia,\n\nThanks for reviewing the API types. The persistence tests are now included.\n\nPeng", "sent", True, False),
        (1, 5, "Staging checklist", "Hi Michael,\n\nThe local startup checklist is ready for the demo handoff.\n\nPeng", "sent", True, False),
        (1, 6, "Conversation layout", "Hi Emily,\n\nI applied your spacing and color feedback to the latest interface.\n\nPeng", "sent", True, True),
        (1, 2, "Demo walkthrough outline", "Hi Amanda,\n\nHere is the outline for the messaging and email walkthrough.\n\nPeng", "drafts", True, False),
        (1, 3, "Product notes", "Hi John,\n\nI am collecting the remaining product notes before sending the final summary.\n\nPeng", "drafts", True, False),
        (1, 6, "Old design export", "This design export is no longer needed.", "trash", True, False),
    ]
    for index, row in enumerate(email_rows):
        sender_id, receiver_id, subject, body, folder, is_read, is_starred = row
        session.add(
            Email(
                sender_id=sender_id,
                receiver_id=receiver_id,
                subject=subject,
                body=body,
                folder=folder,
                is_read=is_read,
                is_starred=is_starred,
                created_at=base + timedelta(hours=index * 3),
            )
        )
    session.commit()
