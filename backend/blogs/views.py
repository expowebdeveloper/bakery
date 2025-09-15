from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.authentication import JWTAuthentication

from account.permissions import AllowGetOnlyIsAdminStockManager, IsAdmin
from blogs.models import Blog, BlogCategory
from blogs.serializers import BlogCategorySerializer, BlogSerializer


class BlogListAPIView(APIView):
    permission_classes = [AllowGetOnlyIsAdminStockManager]
    pagination_class = PageNumberPagination

    def get(self, request):
        blogs = Blog.objects.all()

        # Filtering by query parameters
        category = request.query_params.get("category", None)
        author = request.query_params.get("author", None)
        search = request.query_params.get("search", None)

        if category:
            blogs = blogs.filter(category__slug=category)
        if author:
            blogs = blogs.filter(author__username=author)
        if search:
            blogs = blogs.filter(
                Q(title__icontains=search) | Q(content__icontains=search)
            )

        paginator = self.pagination_class()
        paginated_tasks = paginator.paginate_queryset(blogs, request, view=self)
        serializer = BlogSerializer(paginated_tasks, many=True)
        return paginator.get_paginated_response(serializer.data)

    def post(self, request):
        serializer = BlogSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(author=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class BlogUpdateAPIView(APIView):
    permission_classes = [IsAdmin]
    authentication_classess = [JWTAuthentication]

    def put(self, request, slug):
        blog = get_object_or_404(Blog, slug=slug, author=request.user)
        serializer = BlogSerializer(blog, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, slug):
        blog = get_object_or_404(Blog, slug=slug, author=request.user)
        blog.delete()
        return Response(
            {"detail": "Blog deleted successfully."}, status=status.HTTP_204_NO_CONTENT
        )


class BlogCategoryListCreateAPIView(APIView):
    """
    API for listing and creating BlogCategory entries.
    """

    permission_classes = [AllowGetOnlyIsAdminStockManager]
    authentication_classess = [JWTAuthentication]
    pagination_class = PageNumberPagination

    def get(self, request):
        categories = BlogCategory.objects.all()
        paginator = self.pagination_class()
        paginated_tasks = paginator.paginate_queryset(categories, request, view=self)
        serializer = BlogCategorySerializer(paginated_tasks, many=True)
        return paginator.get_paginated_response(serializer.data)

    def post(self, request):
        serializer = BlogCategorySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class BlogCategoryDetailAPIView(APIView):
    """
    API for retrieving, updating, and deleting a single BlogCategory entry.
    """

    permission_classes = [IsAdmin]
    authentication_classess = [JWTAuthentication]

    def get(self, request, pk):
        category = get_object_or_404(BlogCategory, pk=pk)
        serializer = BlogCategorySerializer(category)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, pk):
        category = get_object_or_404(BlogCategory, pk=pk)
        serializer = BlogCategorySerializer(category, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        category = get_object_or_404(BlogCategory, pk=pk)
        category.delete()
        return Response(
            {"detail": "Blog category deleted successfully."},
            status=status.HTTP_204_NO_CONTENT,
        )
