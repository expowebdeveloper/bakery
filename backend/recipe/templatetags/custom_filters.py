from django import template

register = template.Library()


@register.filter(name="camel_case_with_space")
def camel_case_with_space(value):
    """
    Converts a string to camel case with spaces between words.
    Example: "hello world" -> "Hello World"
    """
    if not isinstance(value, str):
        return value

    words = value.split()
    camel_cased_with_space = " ".join(word.capitalize() for word in words)
    return camel_cased_with_space
