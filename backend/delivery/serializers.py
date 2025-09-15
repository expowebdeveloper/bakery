from rest_framework import serializers


class ZipcodeSerializer(serializers.Serializer):
    zipcode = serializers.CharField(max_length=6)
