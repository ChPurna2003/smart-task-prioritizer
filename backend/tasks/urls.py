from django.urls import path
from .views import AnalyzeTasksView, SuggestTasksView, FeedbackView

urlpatterns = [
    path("analyze/", AnalyzeTasksView.as_view(), name="analyze-tasks"),
    path("suggest/", SuggestTasksView.as_view(), name="suggest-tasks"),
    path("feedback/", FeedbackView.as_view(), name="tasks-feedback"),
]
