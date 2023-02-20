from django.urls import path
from rest_framework.authtoken.views import obtain_auth_token

from api import views
from api.views import RegisterView, UserView, LogoutView, GetGamesByYearView

urlpatterns = [
    path('games/<int:year>/<int:number>/<int:page>', GetGamesByYearView.as_view(), name='games'),
    # path('feedbacks/user', GetUsersFeedbacksView.as_view(), name='usersFeedbacks'),
    # path('feedbacks/<int:evaluation>', GetFilteredFeedbacks.as_view(), name='filteredFeedbacks'),
    # path('feedbacks/post', PostFeedbackView.as_view(), name='postFeedback'),
    # path('companies', GetCompaniesView.as_view(), name='companies'),
    # path('companies/details', GetCompanyDetailsView.as_view(), name='companyDetails'),
    # path('companies/<str:companyType>', GetFilteredCompanies.as_view(), name='filteredCompanies'),
    path('register', RegisterView.as_view(), name='register'),
    path('login', obtain_auth_token, name='login'),
    path('user', UserView.as_view(), name='user'),
    path('logout', LogoutView.as_view(), name='logout'),
]
