import uuid
from decimal import Decimal
from datetime import datetime, date, timedelta
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from categories.models import Category
from categories.views import ensure_default_categories
from transactions.models import Transaction
from budgets.models import Budget
from goals.models import Goal, GoalContribution
from notifications.models import Notification

User = get_user_model()

class Command(BaseCommand):
    help = 'Seeds initial demonstration data matching the UI draft'

    def handle(self, *args, **options):
        self.stdout.write("Ensuring default categories...")
        ensure_default_categories()

        email = "dreamer@pocketpaise.com"
        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                'full_name': 'Dreamer',
                'is_verified': True,
                'currency': 'INR',
                'theme': 'light'
            }
        )
        user.set_password("Password123!")
        user.save()
        self.stdout.write(f"Demo user created: {email} / Password123!")

        # Clear existing data for fresh seed if rerun
        Transaction.objects.filter(user=user).delete()
        Budget.objects.filter(user=user).delete()
        Goal.objects.filter(user=user).delete()
        Notification.objects.filter(user=user).delete()

        cat_food = Category.objects.filter(name='Food & Dining', user__isnull=True).first()
        cat_shop = Category.objects.filter(name='Shopping', user__isnull=True).first()
        cat_travel = Category.objects.filter(name='Travel', user__isnull=True).first()
        cat_bills = Category.objects.filter(name='Bills', user__isnull=True).first()
        cat_others = Category.objects.filter(name='Others', user__isnull=True).first()
        cat_salary = Category.objects.filter(name='Salary', user__isnull=True).first()
        cat_part_time = Category.objects.filter(name='Part-time Work', user__isnull=True).first()

        now = datetime.now()
        cur_year = now.year
        cur_month = now.month

        # Current Month Income: Total ₹18,000
        # Salary ₹13,000 on 1st, Part-time Work ₹5,000 on 13th
        Transaction.objects.create(
            user=user, category=cat_salary, type='income',
            amount=Decimal('13000.00'), title='Monthly Stipend / Salary',
            payment_method='netbanking', date_time=datetime(cur_year, cur_month, 1, 10, 0)
        )
        Transaction.objects.create(
            user=user, category=cat_part_time, type='income',
            amount=Decimal('5000.00'), title='Part-time Work (Freelance UI)',
            payment_method='upi', date_time=datetime(cur_year, cur_month, min(13, now.day), 10, 0)
        )

        # Current Month Expenses: Total ₹13,420
        # Food & Dining: ₹4,290
        Transaction.objects.create(
            user=user, category=cat_food, type='expense',
            amount=Decimal('350.00'), title='Burger King',
            payment_method='upi', date_time=datetime(cur_year, cur_month, min(16, now.day), 19, 30),
            notes='Dinner with friends'
        )
        Transaction.objects.create(
            user=user, category=cat_food, type='expense',
            amount=Decimal('1850.00'), title='Supermarket Grocery',
            payment_method='card', date_time=datetime(cur_year, cur_month, min(10, now.day), 15, 0)
        )
        Transaction.objects.create(
            user=user, category=cat_food, type='expense',
            amount=Decimal('1450.00'), title='Campus Cafe & Snacks',
            payment_method='upi', date_time=datetime(cur_year, cur_month, min(5, now.day), 18, 0)
        )
        Transaction.objects.create(
            user=user, category=cat_food, type='expense',
            amount=Decimal('640.00'), title='Boba Tea & Pastries',
            payment_method='upi', date_time=datetime(cur_year, cur_month, min(3, now.day), 17, 30)
        )

        # Shopping: ₹3,750
        Transaction.objects.create(
            user=user, category=cat_shop, type='expense',
            amount=Decimal('1200.00'), title='Zudio Clothing',
            payment_method='upi', date_time=datetime(cur_year, cur_month, min(15, now.day), 17, 45)
        )
        Transaction.objects.create(
            user=user, category=cat_shop, type='expense',
            amount=Decimal('1950.00'), title='Cozy Room Decor & Fairy Lights',
            payment_method='card', date_time=datetime(cur_year, cur_month, min(8, now.day), 14, 20)
        )
        Transaction.objects.create(
            user=user, category=cat_shop, type='expense',
            amount=Decimal('600.00'), title='Art Journal & Pens',
            payment_method='cash', date_time=datetime(cur_year, cur_month, min(4, now.day), 12, 10)
        )

        # Travel: ₹2,420
        Transaction.objects.create(
            user=user, category=cat_travel, type='expense',
            amount=Decimal('100.00'), title='Bus Ticket',
            payment_method='cash', date_time=datetime(cur_year, cur_month, min(14, now.day), 20, 20)
        )
        Transaction.objects.create(
            user=user, category=cat_travel, type='expense',
            amount=Decimal('1500.00'), title='Weekend Metro Card Recharge',
            payment_method='upi', date_time=datetime(cur_year, cur_month, min(9, now.day), 11, 0)
        )
        Transaction.objects.create(
            user=user, category=cat_travel, type='expense',
            amount=Decimal('820.00'), title='Cab Ride to Airport',
            payment_method='upi', date_time=datetime(cur_year, cur_month, min(2, now.day), 7, 30)
        )

        # Bills: ₹1,610
        Transaction.objects.create(
            user=user, category=cat_bills, type='expense',
            amount=Decimal('799.00'), title='High-speed WiFi Bill',
            payment_method='netbanking', date_time=datetime(cur_year, cur_month, min(7, now.day), 9, 0)
        )
        Transaction.objects.create(
            user=user, category=cat_bills, type='expense',
            amount=Decimal('499.00'), title='Mobile Recharge 5G',
            payment_method='upi', date_time=datetime(cur_year, cur_month, min(6, now.day), 16, 20)
        )
        Transaction.objects.create(
            user=user, category=cat_bills, type='expense',
            amount=Decimal('312.00'), title='Spotify & Cloud Storage',
            payment_method='card', date_time=datetime(cur_year, cur_month, min(2, now.day), 10, 0)
        )

        # Others: ₹1,350
        Transaction.objects.create(
            user=user, category=cat_others, type='expense',
            amount=Decimal('850.00'), title='Reference Books & Notes',
            payment_method='upi', date_time=datetime(cur_year, cur_month, min(11, now.day), 13, 0)
        )
        Transaction.objects.create(
            user=user, category=cat_others, type='expense',
            amount=Decimal('500.00'), title='Emergency Printouts & Supplies',
            payment_method='cash', date_time=datetime(cur_year, cur_month, min(3, now.day), 14, 0)
        )

        # Prior months history so total balance equals ₹24,580 and monthly trend is gorgeous
        # Previous 5 months data
        for offset in range(1, 6):
            m_date = now - timedelta(days=30 * offset)
            # Add past income
            Transaction.objects.create(
                user=user, category=cat_salary, type='income',
                amount=Decimal('16000.00'), title='Previous Month Income',
                payment_method='netbanking', date_time=m_date.replace(day=1, hour=10)
            )
            # Add past expense
            exp_amt = Decimal('12000.00') + Decimal(str(offset * 200))
            Transaction.objects.create(
                user=user, category=cat_food, type='expense',
                amount=exp_amt, title='Past Expenses Total',
                payment_method='card', date_time=m_date.replace(day=15, hour=18)
            )

        # Budgets for current month
        first_of_month = date(cur_year, cur_month, 1)
        Budget.objects.create(user=user, category=cat_food, month=first_of_month, limit_amount=Decimal('5000.00'))
        Budget.objects.create(user=user, category=cat_shop, month=first_of_month, limit_amount=Decimal('4500.00'))
        Budget.objects.create(user=user, category=cat_travel, month=first_of_month, limit_amount=Decimal('3000.00'))
        Budget.objects.create(user=user, category=cat_bills, month=first_of_month, limit_amount=Decimal('2000.00'))
        Budget.objects.create(user=user, category=cat_others, month=first_of_month, limit_amount=Decimal('1800.00'))

        # Goals: "Next Trip ✈️" target ₹25,000, 40% saved (₹10,000 saved, ₹15,000 to go / ₹10,000 more to go based on draft)
        goal_trip = Goal.objects.create(
            user=user,
            name='Next Trip ✈️',
            target_amount=Decimal('25000.00'),
            target_date=date(cur_year + 1, 5, 20),
            status='active',
            icon='Plane'
        )
        GoalContribution.objects.create(
            goal=goal_trip,
            amount=Decimal('6000.00'),
            date=date(cur_year, cur_month, 2),
            note='Initial savings for vacation flight tickets'
        )
        GoalContribution.objects.create(
            goal=goal_trip,
            amount=Decimal('4000.00'),
            date=date(cur_year, cur_month, 10),
            note='Freelance savings contribution'
        )

        goal_emergency = Goal.objects.create(
            user=user,
            name='Emergency Fund 🛡️',
            target_amount=Decimal('50000.00'),
            target_date=date(cur_year + 1, 12, 31),
            status='active',
            icon='Shield'
        )
        GoalContribution.objects.create(
            goal=goal_emergency,
            amount=Decimal('15000.00'),
            date=date(cur_year, cur_month, 1),
            note='Fixed deposit allocation'
        )

        goal_laptop = Goal.objects.create(
            user=user,
            name='New Laptop M3 💻',
            target_amount=Decimal('85000.00'),
            target_date=date(cur_year + 1, 8, 15),
            status='active',
            icon='Laptop'
        )
        GoalContribution.objects.create(
            goal=goal_laptop,
            amount=Decimal('30000.00'),
            date=date(cur_year, cur_month, 5),
            note='Design prize stipend contribution'
        )

        # Notifications
        Notification.objects.create(
            user=user,
            kind='goal_update',
            message="🌟 You're 40% of the way to your Next Trip ✈️ goal! Keep going!",
            is_read=False
        )
        Notification.objects.create(
            user=user,
            kind='budget_alert',
            message="💡 Notice: Food & Dining budget is at 85% for this month.",
            is_read=False
        )
        Notification.objects.create(
            user=user,
            kind='system',
            message="✨ Welcome to Pocket Paise! Your personal financial sanctuary.",
            is_read=True
        )

        self.stdout.write(self.style.SUCCESS("Successfully seeded Pocket Paise sample data!"))
