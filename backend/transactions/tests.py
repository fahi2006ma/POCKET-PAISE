from decimal import Decimal
from datetime import datetime, date
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

from categories.models import Category
from categories.views import ensure_default_categories
from transactions.models import Transaction
from budgets.models import Budget
from goals.models import Goal, GoalContribution
from notifications.models import Notification

User = get_user_model()

class PocketPaiseComprehensive20Tests(TestCase):
    def setUp(self):
        ensure_default_categories()
        self.client = APIClient()

        # Primary test user
        self.user = User.objects.create_user(
            email='tester@pocketpaise.com',
            password='Password123!',
            full_name='Test Developer'
        )

        # Secondary user for isolation tests
        self.other_user = User.objects.create_user(
            email='other@pocketpaise.com',
            password='Password123!',
            full_name='Other Person'
        )

        # Categories
        self.cat_food = Category.objects.filter(name='Food & Dining', user__isnull=True).first()
        self.cat_salary = Category.objects.filter(name='Salary', user__isnull=True).first()
        self.cat_shop = Category.objects.filter(name='Shopping', user__isnull=True).first()

    # ----------------- 1. AUTHENTICATION MODULE (TC 1 - 6) -----------------

    def test_tc01_user_registration(self):
        """TC-AUTH-01: User Registration with valid credentials"""
        res = self.client.post('/api/v1/auth/register/', {
            'full_name': 'Ananya Roy',
            'email': 'ananya@pocketpaise.com',
            'password': 'Password123!',
            'confirm_password': 'Password123!'
        })
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertIn('access', res.data)
        self.assertIn('refresh', res.data)
        self.assertEqual(res.data['user']['email'], 'ananya@pocketpaise.com')

    def test_tc02_user_login_success(self):
        """TC-AUTH-02: User Login with valid credentials"""
        res = self.client.post('/api/v1/auth/login/', {
            'email': 'tester@pocketpaise.com',
            'password': 'Password123!'
        })
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('access', res.data)
        self.assertIn('refresh', res.data)

    def test_tc03_invalid_login_rejected(self):
        """TC-AUTH-03: Invalid Login with incorrect password returns 401"""
        res = self.client.post('/api/v1/auth/login/', {
            'email': 'tester@pocketpaise.com',
            'password': 'WrongPassword999!'
        })
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_tc04_token_refresh(self):
        """TC-AUTH-04: JWT Token Refresh"""
        login_res = self.client.post('/api/v1/auth/login/', {
            'email': 'tester@pocketpaise.com',
            'password': 'Password123!'
        })
        refresh_token = login_res.data['refresh']

        res = self.client.post('/api/v1/auth/token/refresh/', {
            'refresh': refresh_token
        })
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('access', res.data)

    def test_tc05_user_profile_fetch(self):
        """TC-AUTH-05: Fetch Authenticated User Profile"""
        self.client.force_authenticate(user=self.user)
        res = self.client.get('/api/v1/me/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['email'], 'tester@pocketpaise.com')
        self.assertEqual(res.data['full_name'], 'Test Developer')

    def test_tc06_change_password(self):
        """TC-AUTH-06: Change Password with verification of old password"""
        self.client.force_authenticate(user=self.user)
        res = self.client.post('/api/v1/auth/change-password/', {
            'old_password': 'Password123!',
            'new_password': 'NewSecret2026!'
        })
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('NewSecret2026!'))

    # ----------------- 2. CATEGORIES MODULE (TC 7 - 8) -----------------

    def test_tc07_list_categories(self):
        """TC-CAT-01: List Categories includes system default categories"""
        self.client.force_authenticate(user=self.user)
        res = self.client.get('/api/v1/categories/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        cats = res.data.get('results', res.data)
        self.assertGreaterEqual(len(cats), 8)
        names = [c['name'] for c in cats]
        self.assertIn('Food & Dining', names)
        self.assertIn('Salary', names)

    def test_tc08_create_custom_category(self):
        """TC-CAT-02: Create User Custom Category"""
        self.client.force_authenticate(user=self.user)
        res = self.client.post('/api/v1/categories/', {
            'name': 'Gym & Fitness',
            'type': 'expense',
            'color': '#3b82f6',
            'icon': 'Dumbbell'
        })
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data['name'], 'Gym & Fitness')
        self.assertFalse(res.data['is_default'])

    # ----------------- 3. TRANSACTIONS MODULE (TC 9 - 14) -----------------

    def test_tc09_create_income_transaction(self):
        """TC-TXN-01: Create Income Transaction"""
        self.client.force_authenticate(user=self.user)
        res = self.client.post('/api/v1/transactions/', {
            'type': 'income',
            'amount': '50000.00',
            'category': self.cat_salary.id,
            'title': 'Monthly Software Developer Salary',
            'payment_method': 'netbanking',
            'date_time': datetime.now().isoformat()
        })
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data['type'], 'income')
        self.assertEqual(Decimal(res.data['amount']), Decimal('50000.00'))

    def test_tc10_create_expense_transaction(self):
        """TC-TXN-02: Create Expense Transaction"""
        self.client.force_authenticate(user=self.user)
        res = self.client.post('/api/v1/transactions/', {
            'type': 'expense',
            'amount': '2500.00',
            'category': self.cat_food.id,
            'title': 'Weekly Family Dinner',
            'payment_method': 'upi',
            'date_time': datetime.now().isoformat()
        })
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data['type'], 'expense')
        self.assertEqual(Decimal(res.data['amount']), Decimal('2500.00'))

    def test_tc11_filter_transactions_by_type(self):
        """TC-TXN-03: Filter Transactions by type (expense vs income)"""
        self.client.force_authenticate(user=self.user)
        Transaction.objects.create(
            user=self.user, category=self.cat_salary, type='income',
            amount=Decimal('10000.00'), title='Income Test', payment_method='upi', date_time=datetime.now()
        )
        Transaction.objects.create(
            user=self.user, category=self.cat_food, type='expense',
            amount=Decimal('1500.00'), title='Expense Test', payment_method='cash', date_time=datetime.now()
        )

        res = self.client.get('/api/v1/transactions/?type=expense')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        results = res.data.get('results', res.data)
        for t in results:
            self.assertEqual(t['type'], 'expense')

    def test_tc12_update_transaction(self):
        """TC-TXN-04: Update Transaction title and amount"""
        self.client.force_authenticate(user=self.user)
        txn = Transaction.objects.create(
            user=self.user, category=self.cat_food, type='expense',
            amount=Decimal('500.00'), title='Original Cafe', payment_method='upi', date_time=datetime.now()
        )

        res = self.client.patch(f'/api/v1/transactions/{txn.id}/', {
            'title': 'Updated Cafe & Pastry',
            'amount': '650.00'
        })
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['title'], 'Updated Cafe & Pastry')
        self.assertEqual(Decimal(res.data['amount']), Decimal('650.00'))

    def test_tc13_delete_transaction(self):
        """TC-TXN-05: Delete Transaction"""
        self.client.force_authenticate(user=self.user)
        txn = Transaction.objects.create(
            user=self.user, category=self.cat_food, type='expense',
            amount=Decimal('300.00'), title='To Be Deleted', payment_method='cash', date_time=datetime.now()
        )

        res = self.client.delete(f'/api/v1/transactions/{txn.id}/')
        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Transaction.objects.filter(id=txn.id).exists())

    def test_tc14_export_transactions_csv(self):
        """TC-TXN-06: Export Transactions as CSV format"""
        self.client.force_authenticate(user=self.user)
        Transaction.objects.create(
            user=self.user, category=self.cat_food, type='expense',
            amount=Decimal('420.00'), title='CSV Test Item', payment_method='upi', date_time=datetime.now()
        )

        res = self.client.get('/api/v1/transactions/export/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res['Content-Type'], 'text/csv')
        self.assertIn('CSV Test Item', res.content.decode('utf-8'))

    # ----------------- 4. BUDGETS MODULE (TC 15 - 16) -----------------

    def test_tc15_create_monthly_budget(self):
        """TC-BDG-01: Create Monthly Category Budget Limit"""
        self.client.force_authenticate(user=self.user)
        first_of_month = date.today().replace(day=1)

        res = self.client.post('/api/v1/budgets/', {
            'category': self.cat_shop.id,
            'limit_amount': '15000.00',
            'month': first_of_month.isoformat()
        })
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Decimal(res.data['limit_amount']), Decimal('15000.00'))

    def test_tc16_budget_spent_calculation_and_alert(self):
        """TC-BDG-02: Budget spent calculation & automatic 80% threshold notification"""
        self.client.force_authenticate(user=self.user)
        first_of_month = date.today().replace(day=1)

        budget = Budget.objects.create(
            user=self.user,
            category=self.cat_food,
            month=first_of_month,
            limit_amount=Decimal('2000.00')
        )

        # Spend ₹1,700 (85% of ₹2,000)
        self.client.post('/api/v1/transactions/', {
            'type': 'expense',
            'amount': '1700.00',
            'category': self.cat_food.id,
            'title': 'Gourmet Dinner',
            'payment_method': 'upi',
            'date_time': datetime.now().isoformat()
        })

        # Fetch budget and verify spent_amount & percentage
        res = self.client.get(f'/api/v1/budgets/?month={first_of_month.strftime("%Y-%m")}')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        budgets_list = res.data.get('results', res.data)
        food_b = next(b for b in budgets_list if b['id'] == budget.id)
        self.assertEqual(food_b['spent_amount'], 1700.0)
        self.assertEqual(food_b['percentage_used'], 85.0)

        # Verify automated in-app alert was created
        notif = Notification.objects.filter(user=self.user, kind='budget_alert').first()
        self.assertIsNotNone(notif)
        self.assertIn('Food & Dining', notif.message)

    # ----------------- 5. GOALS MODULE (TC 17 - 18) -----------------

    def test_tc17_create_savings_goal(self):
        """TC-GOL-01: Create Savings Goal Target"""
        self.client.force_authenticate(user=self.user)
        res = self.client.post('/api/v1/goals/', {
            'name': 'Emergency Fund',
            'target_amount': '100000.00',
            'target_date': '2027-12-31',
            'icon': 'Shield'
        })
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data['name'], 'Emergency Fund')
        self.assertEqual(Decimal(res.data['target_amount']), Decimal('100000.00'))

    def test_tc18_goal_contribution_and_completion(self):
        """TC-GOL-02: Add Goal Contribution and Auto-complete when Target Reached"""
        self.client.force_authenticate(user=self.user)
        goal = Goal.objects.create(
            user=self.user,
            name='New Laptop M3',
            target_amount=Decimal('40000.00'),
            status='active'
        )

        res = self.client.post(f'/api/v1/goals/{goal.id}/contributions/', {
            'amount': '40000.00',
            'date': date.today().isoformat(),
            'note': 'Full savings milestone achieved!'
        })
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        goal.refresh_from_db()
        self.assertEqual(goal.status, 'completed')

        # Check celebration notification
        notif = Notification.objects.filter(user=self.user, kind='goal_update').first()
        self.assertIsNotNone(notif)
        self.assertIn('achieved your savings goal', notif.message)

    # ----------------- 6. DASHBOARD & INSIGHTS (TC 19 - 20) -----------------

    def test_tc19_dashboard_summary_and_spending_breakdown(self):
        """TC-DASH-01: Dashboard Summary calculations & Category Breakdown"""
        self.client.force_authenticate(user=self.user)

        Transaction.objects.create(
            user=self.user, category=self.cat_salary, type='income',
            amount=Decimal('30000.00'), title='Salary', payment_method='netbanking', date_time=datetime.now()
        )
        Transaction.objects.create(
            user=self.user, category=self.cat_food, type='expense',
            amount=Decimal('6000.00'), title='Food', payment_method='upi', date_time=datetime.now()
        )

        res = self.client.get('/api/v1/dashboard/summary/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['total_income'], 30000.0)
        self.assertEqual(res.data['total_expenses'], 6000.0)
        self.assertEqual(res.data['savings'], 24000.0)

        # Spending by category
        res2 = self.client.get('/api/v1/dashboard/spending-by-category/')
        self.assertEqual(res2.status_code, status.HTTP_200_OK)
        self.assertEqual(res2.data['total_spent'], 6000.0)
        self.assertGreaterEqual(len(res2.data['categories']), 1)

    def test_tc20_financial_health_score_and_pdf_report(self):
        """TC-INS-01 & REP: Financial Score calculation & PDF Report generation"""
        self.client.force_authenticate(user=self.user)

        # 1. Financial Score
        res_score = self.client.get('/api/v1/insights/score/')
        self.assertEqual(res_score.status_code, status.HTTP_200_OK)
        self.assertIn('score', res_score.data)
        self.assertGreaterEqual(res_score.data['score'], 0)
        self.assertLessEqual(res_score.data['score'], 100)
        self.assertIn('parts', res_score.data)

        # 2. PDF Report Export
        res_pdf = self.client.get('/api/v1/reports/export/?format=pdf')
        self.assertEqual(res_pdf.status_code, status.HTTP_200_OK)
        self.assertEqual(res_pdf['Content-Type'], 'application/pdf')
        self.assertTrue(len(res_pdf.content) > 1000)
