from django.urls import path

from blogs.views import (
    BlogCategoryDetailAPIView,
    BlogCategoryListCreateAPIView,
    BlogListAPIView,
    BlogUpdateAPIView,
)

urlpatterns = [
    path("blogs/", BlogListAPIView.as_view(), name="blog-list"),
    path("blogs/<slug:slug>/", BlogUpdateAPIView.as_view(), name="blog"),
    path(
        "blog-categories/",
        BlogCategoryListCreateAPIView.as_view(),
        name="blog-category-list-create",
    ),
    path(
        "blog-categories/<int:pk>/",
        BlogCategoryDetailAPIView.as_view(),
        name="blog-category-detail",
    ),
]
