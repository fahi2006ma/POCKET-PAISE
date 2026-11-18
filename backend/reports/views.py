import csv
from datetime import datetime, date, timedelta
from decimal import Decimal
from dateutil.relativedelta import relativedelta
from io import BytesIO

from django.http import HttpResponse
from django.db.models import Sum, Q, Count
from rest_framework import views, permissions, status
from rest_framework.response import Response

from transactions.models import Transaction
from transactions.serializers import TransactionSerializer
from budgets.models import Budget
from goals.models import Goal
from goals.serializers import GoalSerializer
from categories.models import Category

def parse_month_param(month_param):
    if not month_param:
        return date.today().replace(day=1)
    try:
        if len(month_param) == 7:
            return datetime.strptime(month_param, '%Y-%m').date().replace(day=1)
        return datetime.strptime(month_param[:10], '%Y-%m-%d').date().replace(day=1)
    except Exception:
        return date.today().replace(day=1)

def calculate_financial_score_data(user, target_month=None):
    if not target_month:
        target_month = date.today().replace(day=1)

    # 1. Savings score S
    month_income = Transaction.objects.filter(
        user=user,
        type='income',
        date_time__year=target_month.year,
        date_time__month=target_month.month
    ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')

    month_expense = Transaction.objects.filter(
        user=user,
        type='expense',
        date_time__year=target_month.year,
        date_time__month=target_month.month
    ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')

    month_savings = month_income - month_expense
    savings_rate = Decimal('0.00')
    if month_income > Decimal('0.00'):
        savings_rate = (month_savings / month_income) * Decimal('100.0')

    # S = (savings_rate / 30%) * 100, capped at 100, floor at 0
    s_score = min(Decimal('100.0'), max(Decimal('0.0'), (savings_rate / Decimal('30.0')) * Decimal('100.0')))

    # 2. Budget score B
    budgets = Budget.objects.filter(user=user, month=target_month)
    b_score = Decimal('100.0')
    has_budgets = False
    if budgets.exists():
        has_budgets = True
        total_budgets = budgets.count()
        within_budget_count = 0
        for b in budgets:
            cat_spent = Transaction.objects.filter(
                user=user,
                category=b.category,
                type='expense',
                date_time__year=target_month.year,
                date_time__month=target_month.month
            ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
            if cat_spent <= b.limit_amount:
                within_budget_count += 1
        b_score = (Decimal(str(within_budget_count)) / Decimal(str(total_budgets))) * Decimal('100.0')

    # 3. Goal score G
    goals = Goal.objects.filter(user=user, status__in=['active', 'completed'])
    g_score = Decimal('100.0')
    has_goals = False
    if goals.exists():
        has_goals = True
        total_pct = Decimal('0.0')
        for g in goals:
            saved = g.contributions.aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
            if g.target_amount > 0:
                pct = min(Decimal('100.0'), (saved / g.target_amount) * Decimal('100.0'))
                total_pct += pct
        g_score = total_pct / Decimal(str(goals.count()))

    # Weighted calculation
    # If a part has no data, scale weights as specified in SRS Appendix A
    weights = []
    if month_income > 0:
        weights.append(('S', Decimal('0.4'), s_score))
    if has_budgets:
        weights.append(('B', Decimal('0.3'), b_score))
    if has_goals:
        weights.append(('G', Decimal('0.3'), g_score))

    if not weights:
        final_score = 80
    else:
        total_w = sum(w[1] for w in weights)
        final_score = sum((w[1] / total_w) * w[2] for w in weights)

    final_score_int = int(round(float(final_score)))
    final_score_int = max(0, min(100, final_score_int))

    if final_score_int >= 90:
        label = "Excellent"
        message = "You're a smart spender 💚"
    elif final_score_int >= 70:
        label = "Very Good"
        message = "Great financial balance and saving discipline ✨"
    elif final_score_int >= 40:
        label = "Good"
        message = "Consistent progress, keep watching expenses 📈"
    else:
        label = "Needs Attention"
        message = "Let's trim some variable expenses this month 💪"

    return {
        'score': final_score_int,
        'label': label,
        'message': message,
        'parts': {
            'savings_score': round(float(s_score), 1),
            'budget_score': round(float(b_score), 1),
            'goal_score': round(float(g_score), 1),
            'savings_rate': round(float(savings_rate), 1),
        }
    }

class DashboardSummaryView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        cur_month = parse_month_param(request.query_params.get('month'))
        prev_month = cur_month - relativedelta(months=1)

        # All-time Total Balance
        all_income = Transaction.objects.filter(user=user, type='income').aggregate(t=Sum('amount'))['t'] or Decimal('0.00')
        all_expense = Transaction.objects.filter(user=user, type='expense').aggregate(t=Sum('amount'))['t'] or Decimal('0.00')
        total_balance = all_income - all_expense

        # Current Month Totals
        cur_income = Transaction.objects.filter(
            user=user, type='income',
            date_time__year=cur_month.year, date_time__month=cur_month.month
        ).aggregate(t=Sum('amount'))['t'] or Decimal('0.00')

        cur_expense = Transaction.objects.filter(
            user=user, type='expense',
            date_time__year=cur_month.year, date_time__month=cur_month.month
        ).aggregate(t=Sum('amount'))['t'] or Decimal('0.00')

        cur_savings = cur_income - cur_expense

        # Previous Month Totals
        prev_income = Transaction.objects.filter(
            user=user, type='income',
            date_time__year=prev_month.year, date_time__month=prev_month.month
        ).aggregate(t=Sum('amount'))['t'] or Decimal('0.00')

        prev_expense = Transaction.objects.filter(
            user=user, type='expense',
            date_time__year=prev_month.year, date_time__month=prev_month.month
        ).aggregate(t=Sum('amount'))['t'] or Decimal('0.00')

        prev_savings = prev_income - prev_expense

        def calc_pct_change(curr, prev):
            if prev and prev != Decimal('0.00'):
                diff = ((curr - prev) / abs(prev)) * Decimal('100.0')
                return round(float(diff), 1)
            return None

        income_pct_change = calc_pct_change(cur_income, prev_income)
        expense_pct_change = calc_pct_change(cur_expense, prev_expense)
        savings_pct_change = calc_pct_change(cur_savings, prev_savings)
        # For balance, compare current month savings impact (+8% default fallback if initial)
        balance_pct_change = 8.0 if not prev_income else calc_pct_change(cur_savings, prev_savings)

        # Financial Score
        score_info = calculate_financial_score_data(user, cur_month)

        # Nearest active goal
        nearest_goal = Goal.objects.filter(user=user, status='active').order_by('target_date', '-created_at').first()
        nearest_goal_data = GoalSerializer(nearest_goal).data if nearest_goal else None

        # Recent transactions (top 5)
        recent_txns = Transaction.objects.filter(user=user).order_by('-date_time', '-created_at')[:5]
        recent_txns_data = TransactionSerializer(recent_txns, many=True).data

        return Response({
            'month': cur_month.strftime('%Y-%m'),
            'total_balance': float(total_balance),
            'total_income': float(cur_income),
            'total_expenses': float(cur_expense),
            'savings': float(cur_savings),
            'changes': {
                'balance': balance_pct_change,
                'income': income_pct_change,
                'expenses': expense_pct_change,
                'savings': savings_pct_change,
            },
            'financial_score': score_info,
            'nearest_goal': nearest_goal_data,
            'recent_transactions': recent_txns_data,
        })

class SpendingByCategoryView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        cur_month = parse_month_param(request.query_params.get('month'))

        txns = Transaction.objects.filter(
            user=user,
            type='expense',
            date_time__year=cur_month.year,
            date_time__month=cur_month.month
        )

        total_spent = txns.aggregate(total=Sum('amount'))['total'] or Decimal('0.00')

        category_data = []
        if total_spent > Decimal('0.00'):
            # Aggregate per category
            grouped = txns.values('category__id', 'category__name', 'category__color', 'category__icon')\
                          .annotate(cat_total=Sum('amount'))\
                          .order_by('-cat_total')

            for g in grouped:
                amt = g['cat_total']
                pct = (amt / total_spent) * Decimal('100.0')
                category_data.append({
                    'category_id': g['category__id'],
                    'name': g['category__name'],
                    'color': g['category__color'] or '#10b981',
                    'icon': g['category__icon'] or 'Folder',
                    'amount': float(amt),
                    'percentage': round(float(pct), 1),
                })

        return Response({
            'month': cur_month.strftime('%Y-%m'),
            'total_spent': float(total_spent),
            'categories': category_data
        })

class MonthlyTrendView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        try:
            num_months = int(request.query_params.get('months', 6))
        except Exception:
            num_months = 6

        today = date.today().replace(day=1)
        months_list = []
        for i in range(num_months - 1, -1, -1):
            m = today - relativedelta(months=i)
            months_list.append(m)

        trend_data = []
        for m in months_list:
            inc = Transaction.objects.filter(
                user=user, type='income',
                date_time__year=m.year, date_time__month=m.month
            ).aggregate(t=Sum('amount'))['t'] or Decimal('0.00')

            exp = Transaction.objects.filter(
                user=user, type='expense',
                date_time__year=m.year, date_time__month=m.month
            ).aggregate(t=Sum('amount'))['t'] or Decimal('0.00')

            trend_data.append({
                'month_key': m.strftime('%Y-%m'),
                'month': m.strftime('%b'),
                'year': m.year,
                'income': float(inc),
                'expense': float(exp),
                'savings': float(inc - exp),
            })

        return Response(trend_data)

class ReportsSummaryView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        from_date = request.query_params.get('from')
        to_date = request.query_params.get('to')

        today = date.today()
        if not from_date:
            from_date = today.replace(day=1).strftime('%Y-%m-%d')
        if not to_date:
            to_date = today.strftime('%Y-%m-%d')

        txns = Transaction.objects.filter(
            user=user,
            date_time__date__gte=from_date,
            date_time__date__lte=to_date
        )

        total_income = txns.filter(type='income').aggregate(t=Sum('amount'))['t'] or Decimal('0.00')
        total_expenses = txns.filter(type='expense').aggregate(t=Sum('amount'))['t'] or Decimal('0.00')
        savings = total_income - total_expenses
        savings_rate = 0.0
        if total_income > 0:
            savings_rate = round(float((savings / total_income) * 100), 1)

        # Average daily spending
        d1 = datetime.strptime(from_date, '%Y-%m-%d').date()
        d2 = datetime.strptime(to_date, '%Y-%m-%d').date()
        days_count = max(1, (d2 - d1).days + 1)
        avg_daily = round(float(total_expenses / Decimal(str(days_count))), 2)

        # Top 5 expense categories
        top_cats = txns.filter(type='expense').values('category__name', 'category__color')\
                       .annotate(amt=Sum('amount'))\
                       .order_by('-amt')[:5]

        top_categories = []
        for tc in top_cats:
            amt = tc['amt']
            pct = round(float((amt / total_expenses) * 100), 1) if total_expenses > 0 else 0
            top_categories.append({
                'name': tc['category__name'],
                'color': tc['category__color'],
                'amount': float(amt),
                'percentage': pct
            })

        return Response({
            'from_date': from_date,
            'to_date': to_date,
            'total_income': float(total_income),
            'total_expenses': float(total_expenses),
            'savings': float(savings),
            'savings_rate': savings_rate,
            'average_daily_spending': avg_daily,
            'days_count': days_count,
            'top_categories': top_categories
        })

class ReportsExportView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def perform_content_negotiation(self, request, force=False):
        renderers = self.get_renderers()
        return (renderers[0], renderers[0].media_type)

    def get(self, request):
        user = request.user
        fmt = request.query_params.get('format', 'csv').lower()
        from_date = request.query_params.get('from', (date.today().replace(day=1)).strftime('%Y-%m-%d'))
        to_date = request.query_params.get('to', date.today().strftime('%Y-%m-%d'))

        txns = Transaction.objects.filter(
            user=user,
            date_time__date__gte=from_date,
            date_time__date__lte=to_date
        ).order_by('-date_time')

        if fmt == 'pdf':
            # Generate ReportLab PDF
            from reportlab.lib.pagesizes import letter
            from reportlab.lib import colors
            from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
            from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

            buffer = BytesIO()
            doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
            elements = []
            styles = getSampleStyleSheet()

            title_style = ParagraphStyle(
                'DocTitle',
                parent=styles['Heading1'],
                fontSize=20,
                leading=24,
                textColor=colors.HexColor('#134e4a'),
                spaceAfter=6
            )
            sub_style = ParagraphStyle(
                'DocSubtitle',
                parent=styles['Normal'],
                fontSize=11,
                leading=14,
                textColor=colors.HexColor('#64748b'),
                spaceAfter=15
            )

            elements.append(Paragraph("Pocket Paise – Financial Summary Report", title_style))
            elements.append(Paragraph(f"User: {user.full_name} ({user.email}) | Period: {from_date} to {to_date}", sub_style))

            total_inc = txns.filter(type='income').aggregate(t=Sum('amount'))['t'] or Decimal('0.00')
            total_exp = txns.filter(type='expense').aggregate(t=Sum('amount'))['t'] or Decimal('0.00')
            net_savings = total_inc - total_exp

            summary_data = [
                ['Total Income', 'Total Expenses', 'Net Savings'],
                [f"INR {total_inc:,.2f}", f"INR {total_exp:,.2f}", f"INR {net_savings:,.2f}"]
            ]
            sum_table = Table(summary_data, colWidths=[180, 180, 180])
            sum_table.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#e6f4ea')),
                ('TEXTCOLOR', (0,0), (-1,0), colors.HexColor('#134e4a')),
                ('FONTNAME', (0,0), (-1,-1), 'Helvetica-Bold'),
                ('FONTSIZE', (0,0), (-1,-1), 11),
                ('ALIGN', (0,0), (-1,-1), 'CENTER'),
                ('BOTTOMPADDING', (0,0), (-1,-1), 8),
                ('GRID', (0,0), (-1,-1), 1, colors.HexColor('#cbd5e1')),
            ]))
            elements.append(sum_table)
            elements.append(Spacer(1, 15))

            elements.append(Paragraph("Transactions Breakdown", styles['Heading3']))
            table_data = [['Date', 'Title', 'Type', 'Category', 'Amount']]
            for t in txns[:60]:
                table_data.append([
                    t.date_time.strftime('%Y-%m-%d'),
                    t.title[:25],
                    t.type.capitalize(),
                    t.category.name[:20],
                    f"INR {t.amount:,.2f}"
                ])

            txn_table = Table(table_data, colWidths=[75, 160, 75, 130, 100])
            txn_table.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#f1f5f9')),
                ('TEXTCOLOR', (0,0), (-1,0), colors.HexColor('#1e293b')),
                ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
                ('FONTSIZE', (0,0), (-1,-1), 9),
                ('ALIGN', (4,1), (4,-1), 'RIGHT'),
                ('BOTTOMPADDING', (0,0), (-1,-1), 4),
                ('TOPPADDING', (0,0), (-1,-1), 4),
                ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
            ]))
            elements.append(txn_table)

            doc.build(elements)
            pdf = buffer.getvalue()
            buffer.close()

            response = HttpResponse(content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="PocketPaise_Report_{from_date}_to_{to_date}.pdf"'
            response.write(pdf)
            return response
        else:
            # CSV export
            response = HttpResponse(content_type='text/csv')
            response['Content-Disposition'] = f'attachment; filename="PocketPaise_Report_{from_date}_to_{to_date}.csv"'
            writer = csv.writer(response)
            writer.writerow(['Date', 'Title', 'Type', 'Category', 'Amount (INR)', 'Payment Method', 'Notes'])
            for t in txns:
                writer.writerow([
                    t.date_time.strftime('%Y-%m-%d %H:%M'),
                    t.title,
                    t.type.capitalize(),
                    t.category.name,
                    f"{t.amount:.2f}",
                    t.payment_method.upper(),
                    t.notes or ''
                ])
            return response

class InsightsScoreView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        cur_month = parse_month_param(request.query_params.get('month'))
        score_data = calculate_financial_score_data(user, cur_month)
        return Response(score_data)

class InsightsTipsView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        cur_month = parse_month_param(request.query_params.get('month'))
        prev_month = cur_month - relativedelta(months=1)

        tips = []

        # 1. Largest spending category rise
        cats = Category.objects.filter(type='expense')
        largest_increase = Decimal('0.00')
        rising_cat = None

        for cat in cats:
            cur_cat = Transaction.objects.filter(
                user=user, category=cat, type='expense',
                date_time__year=cur_month.year, date_time__month=cur_month.month
            ).aggregate(t=Sum('amount'))['t'] or Decimal('0.00')

            prev_cat = Transaction.objects.filter(
                user=user, category=cat, type='expense',
                date_time__year=prev_month.year, date_time__month=prev_month.month
            ).aggregate(t=Sum('amount'))['t'] or Decimal('0.00')

            if cur_cat > prev_cat and (cur_cat - prev_cat) > largest_increase:
                largest_increase = cur_cat - prev_cat
                rising_cat = cat.name

        if rising_cat and largest_increase > Decimal('100.00'):
            tips.append({
                'type': 'warning',
                'title': f'{rising_cat} Spending Jump',
                'text': f'Your {rising_cat} spending increased by ₹{largest_increase:,.2f} compared to last month. Consider reviewing recent transactions.',
                'icon': 'TrendingUp'
            })
        else:
            tips.append({
                'type': 'success',
                'title': 'Controlled Category Spending',
                'text': 'Your expense categories are stable with no sudden spikes compared to last month.',
                'icon': 'CheckCircle'
            })

        # 2. Check budgets near limit
        budgets = Budget.objects.filter(user=user, month=cur_month)
        for b in budgets:
            spent = Transaction.objects.filter(
                user=user, category=b.category, type='expense',
                date_time__year=cur_month.year, date_time__month=cur_month.month
            ).aggregate(t=Sum('amount'))['t'] or Decimal('0.00')
            if b.limit_amount > 0:
                pct = (spent / b.limit_amount) * 100
                if pct >= 100:
                    tips.append({
                        'type': 'danger',
                        'title': f'{b.category.name} Budget Exceeded',
                        'text': f'You are currently at {pct:.0f}% of your budget for {b.category.name}. Try pausing discretionary expenses in this category.',
                        'icon': 'AlertTriangle'
                    })
                elif pct >= 80:
                    tips.append({
                        'type': 'warning',
                        'title': f'{b.category.name} Budget at {pct:.0f}%',
                        'text': f'You have only ₹{(b.limit_amount - spent):,.2f} left in {b.category.name} for the remaining days of this month.',
                        'icon': 'AlertCircle'
                    })

        # 3. Savings tip
        cur_income = Transaction.objects.filter(
            user=user, type='income',
            date_time__year=cur_month.year, date_time__month=cur_month.month
        ).aggregate(t=Sum('amount'))['t'] or Decimal('0.00')

        cur_expense = Transaction.objects.filter(
            user=user, type='expense',
            date_time__year=cur_month.year, date_time__month=cur_month.month
        ).aggregate(t=Sum('amount'))['t'] or Decimal('0.00')

        if cur_income > 0:
            rate = ((cur_income - cur_expense) / cur_income) * 100
            if rate >= 30:
                tips.append({
                    'type': 'success',
                    'title': 'High Savings Rate (30%+)',
                    'text': f'Your savings rate is {rate:.1f}%, which beats the recommended 30% financial health benchmark!',
                    'icon': 'Award'
                })
            else:
                tips.append({
                    'type': 'info',
                    'title': 'Savings Target Benchmark',
                    'text': f'Your current savings rate is {rate:.1f}%. Aiming for 20-30% will help build your emergency fund faster.',
                    'icon': 'PiggyBank'
                })

        # 4. Consistency encouragement
        tips.append({
            'type': 'info',
            'title': 'Habit Building',
            'text': 'Recording transactions right after you pay takes less than 10 seconds and prevents end-of-month surprises.',
            'icon': 'Zap'
        })

        return Response(tips)
