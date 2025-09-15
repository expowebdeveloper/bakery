from rest_framework import serializers

from blogs.models import Blog, BlogCategory


class BlogCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogCategory
        fields = "__all__"


class BlogSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()
    category_name = serializers.ReadOnlyField(source="category.name")

    class Meta:
        model = Blog
        fields = [
            "id",
            "title",
            "slug",
            "content",
            "author",
            "author_name",
            "category",
            "category_name",
            "blog_image",
            "created_at",
            "updated_at",
        ]

    def get_author_name(self, obj):
        # Return the full name of the user (first name + last name)
        return f"{obj.author.first_name} {obj.author.last_name}"
