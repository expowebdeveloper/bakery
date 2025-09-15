import json

import openai
from django.conf import settings
from groq import Groq

api_key = settings.GROQ_API


def get_nutritions(ingredients_list):
    """
    Calculate total nutrition facts for a list of ingredients using the Groq API.

    Args:
        ingredients_list (list): List of dictionaries containing ingredient information.
            Each dictionary should have 'quantity', 'unit_of_measure', and 'name' keys.

    Returns:
        str: JSON string containing total nutrition values including calories, protein,
            fat, carbohydrates, energy, fibre, salt, and sugar.
    """
    client = Groq(api_key=api_key)

    ingredients_text = "\n".join(
        [
            f"{item['quantity']} {item['unit_of_measure']} of {item['name']}"
            for item in ingredients_list
        ]
    )

    chat_completion = client.chat.completions.create(
        messages=[
            {
                "role": "user",
                "content": f"""Can you provide the nutrition \
                    facts for these ingredients?\n{ingredients_text}

                **IMPORTANT:** Respond only in JSON format like this:

                {{
                    "ingredients": [
                        {{
                            "name": "ingredient_name",
                            "calories": 0.0,
                            "protein": 0.0,
                            "fat": 0.0,
                            "carbohydrates": 0.0,
                            "engergy:0.0,
                            "fiber": 0.0,
                            "salt": 0.0,
                            "sugar":0.0
                        }}
                    ]
                }}
                """,
            }
        ],
        model="llama3-70b-8192",
        temperature=0,
        response_format={"type": "json_object"},
    )

    ai_response = chat_completion.model_dump()
    nutrition_json_str = ai_response["choices"][0]["message"]["content"]

    # Convert string to Python dictionary
    nutrition_data = json.loads(nutrition_json_str)

    # Initialize total nutrition values
    total_nutrition = {
        "calories": 0.0,
        "protein": 0.0,
        "fat": 0.0,
        "carbohydrates": 0.0,
        "energy": 0.0,
        "fibre": 0.0,
        "salt": 0.0,
        "sugar": 0.0,
    }

    for ingredient in nutrition_data.get("ingredients", []):
        total_nutrition["calories"] += ingredient.get("calories", 0.0)
        total_nutrition["protein"] += ingredient.get("protein", 0.0)
        total_nutrition["fat"] += ingredient.get("fat", 0.0)
        total_nutrition["carbohydrates"] += ingredient.get("carbohydrates", 0.0)
        total_nutrition["energy"] += ingredient.get("energy", 0.0)
        total_nutrition["fibre"] += ingredient.get("fibre", 0.0)
        total_nutrition["salt"] += ingredient.get("salt", 0.0)
        total_nutrition["sugar"] += ingredient.get("sugar", 0.0)

    # Round the total nutrition values to 2 decimal places
    for key in total_nutrition:
        total_nutrition[key] = round(total_nutrition[key], 2)

    # Print total nutrition summary
    print("🟢 Total Nutrition Summary:")
    result = json.dumps(total_nutrition, indent=4)
    return result


def get_nutritions_openai(ingredients_list):
    """
    Calculate total nutrition facts for a list of ingredients using the OpenAI API.

    Args:
        ingredients_list (list): List of dictionaries containing ingredient information.
            Each dictionary should have 'quantity', 'unit_of_measure', and 'name' keys.

    Returns:
        str: JSON string containing total nutrition values including calories, protein,
            fat, carbohydrates, energy, fiber, salt, and sugar.
        None: If there's an error parsing the API response.
    """
    client = openai.OpenAI(api_key="open_api_key")

    ingredients_text = "\n".join(
        [
            f"{item['quantity']} {item['unit_of_measure']} of {item['name']}"
            for item in ingredients_list
        ]
    )

    chat_completion = client.chat.completions.create(
        messages=[
            {
                "role": "user",
                "content": f"""Provide the nutrition facts in JSON format.

                Ingredients:
                {ingredients_text}

                **IMPORTANT:** Respond **only** in JSON format, like this:
                ```json
                {{
                    "ingredients": [
                        {{
                            "name": "ingredient_name",
                            "calories": 0.0,
                            "protein": 0.0,
                            "fat": 0.0,
                            "carbohydrates": 0.0,
                            "energy": 0.0,
                            "fiber": 0.0,
                            "salt": 0.0,
                            "sugar": 0.0
                        }}
                    ]
                }}
                ```
                """,
            }
        ],
        model="gpt-4-turbo",
        temperature=0,
        response_format={"type": "json_object"},
    )

    ai_response = chat_completion.model_dump()
    print("RAW RESPONSE:", ai_response)

    try:
        nutrition_json_str = ai_response["choices"][0]["message"]["content"]
        nutrition_data = json.loads(nutrition_json_str)
    except (KeyError, json.JSONDecodeError) as e:
        print("Error parsing response:", e)
        return None

    # Initialize total nutrition values
    total_nutrition = {
        "calories": 0.0,
        "protein": 0.0,
        "fat": 0.0,
        "carbohydrates": 0.0,
        "energy": 0.0,
        "fiber": 0.0,
        "salt": 0.0,
        "sugar": 0.0,
    }

    for ingredient in nutrition_data.get("ingredients", []):
        total_nutrition["calories"] += ingredient.get("calories", 0.0)
        total_nutrition["protein"] += ingredient.get("protein", 0.0)
        total_nutrition["fat"] += ingredient.get("fat", 0.0)
        total_nutrition["carbohydrates"] += ingredient.get("carbohydrates", 0.0)
        total_nutrition["energy"] += ingredient.get("energy", 0.0)
        total_nutrition["fiber"] += ingredient.get("fiber", 0.0)
        total_nutrition["salt"] += ingredient.get("salt", 0.0)
        total_nutrition["sugar"] += ingredient.get("sugar", 0.0)

    # Round the total nutrition values to 2 decimal places
    for key in total_nutrition:
        total_nutrition[key] = round(total_nutrition[key], 2)

    return json.dumps(total_nutrition, indent=4)
