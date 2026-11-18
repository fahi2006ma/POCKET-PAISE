from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from accounts.views import (
    RegisterView,
    CustomTokenObtainPairView,
    VerifyEmailView,
    ForgotPasswordView,
    ResetPasswordView,
    ChangePasswordView,
    MeView,
    LogoutView,
)
from categories.views import CategoryViewSet
from transactions.views import TransactionViewSet
from budgets.views import BudgetViewSet
from goals.views import GoalViewSet
from notifications.views import NotificationViewSet
from reports.views import (
    DashboardSummaryView,
    SpendingByCategoryView,
    MonthlyTrendView,
    ReportsSummaryView,
    ReportsExportView,
    InsightsScoreView,
    InsightsTipsView,
)

router = DefaultRouter()
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'transactions', TransactionViewSet, basename='transaction')
router.register(r'budgets', BudgetViewSet, basename='budget')
router.register(r'goals', GoalViewSet, basename='goal')
router.register(r'notifications', NotificationViewSet, basename='notification')

urlpatterns = [
    path('admin/', admin.site.urls),

    # Auth endpoints
    path('api/v1/auth/register/', RegisterView.as_view(), name='register'),
    path('api/v1/auth/login/', CustomTokenObtainPairView.as_view(), name='login'),
    path('api/v1/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/v1/auth/logout/', LogoutView.as_view(), name='logout'),
    path('api/v1/auth/verify-email/', VerifyEmailView.as_view(), name='verify_email'),
    path('api/v1/auth/forgot-password/', ForgotPasswordView.as_view(), name='forgot_password'),
    path('api/v1/auth/reset-password/', ResetPasswordView.as_view(), name='reset_password'),
    path('api/v1/auth/change-password/', ChangePasswordView.as_view(), name='change_password'),

    # User Profile
    path('api/v1/me/', MeView.as_view(), name='user_profile'),

    # Dashboard & Reports
    path('api/v1/dashboard/summary/', DashboardSummaryView.as_view(), name='dashboard_summary'),
    path('api/v1/dashboard/spending-by-category/', SpendingByCategoryView.as_view(), name='dashboard_spending_category'),
    path('api/v1/dashboard/trend/', MonthlyTrendView.as_view(), name='dashboard_trend'),
    path('api/v1/reports/summary/', ReportsSummaryView.as_view(), name='reports_summary'),
    path('api/v1/reports/export/', ReportsExportView.as_view(), name='reports_export'),

    # Insights
    path('api/v1/insights/score/', InsightsScoreView.as_view(), name='insights_score'),
    path('api/v1/insights/tips/', InsightsTipsView.as_view(), name='insights_tips'),

    # Router endpoints (categories, transactions, budgets, goals, notifications)
    path('api/v1/', include(router.urls)),
]
