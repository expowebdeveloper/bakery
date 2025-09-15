from enum import Enum


class USState(Enum):
    ALABAMA = "AL"
    ALASKA = "AK"
    ARIZONA = "AZ"
    ARKANSAS = "AR"
    CALIFORNIA = "CA"
    COLORADO = "CO"
    CONNECTICUT = "CT"
    DELAWARE = "DE"
    FLORIDA = "FL"
    GEORGIA = "GA"
    HAWAII = "HI"
    IDAHO = "ID"
    ILLINOIS = "IL"
    INDIANA = "IN"
    IOWA = "IA"
    KANSAS = "KS"
    KENTUCKY = "KY"
    LOUISIANA = "LA"
    MAINE = "ME"
    MARYLAND = "MD"
    MASSACHUSETTS = "MA"
    MICHIGAN = "MI"
    MINNESOTA = "MN"
    MISSISSIPPI = "MS"
    MISSOURI = "MO"
    MONTANA = "MT"
    NEBRASKA = "NE"
    NEVADA = "NV"
    NEW_HAMPSHIRE = "NH"
    NEW_JERSEY = "NJ"
    NEW_MEXICO = "NM"
    NEW_YORK = "NY"
    NORTH_CAROLINA = "NC"
    NORTH_DAKOTA = "ND"
    OHIO = "OH"
    OKLAHOMA = "OK"
    OREGON = "OR"
    PENNSYLVANIA = "PA"
    RHODE_ISLAND = "RI"
    SOUTH_CAROLINA = "SC"
    SOUTH_DAKOTA = "SD"
    TENNESSEE = "TN"
    TEXAS = "TX"
    UTAH = "UT"
    VERMONT = "VT"
    VIRGINIA = "VA"
    WASHINGTON = "WA"
    WEST_VIRGINIA = "WV"
    WISCONSIN = "WI"
    WYOMING = "WY"


def apply_bulk_price(cart):
    """
    Update cart item prices based on bulk price rules.
    """
    if cart and cart.pk:
        if not cart.cart_items.exists():  # Ensure the cart has items
            return

        for item in cart.cart_items.all():  # Iterate over the items directly
            if (
                not item.product_variant or not item.product_variant.inventory_items
            ):  # Skip items without inventory
                continue

            inventory = item.product_variant.inventory_items
            bulk_price_rules = inventory.bulking_price_rules

            if bulk_price_rules:
                sorted_rules = sorted(
                    bulk_price_rules, key=lambda x: x.get("quantity_from", 0)
                )
                applied_price = None

                for rule in sorted_rules:
                    quantity_from = rule.get("quantity_from", 0)
                    quantity_to = rule.get("quantity_to", float("inf"))
                    price = rule.get("price")

                    if quantity_from <= item.quantity <= quantity_to:

                        applied_price = price
                        break

                if applied_price:
                    try:
                        item.price = applied_price
                        item.save()
                    except Exception as e:
                        print(f"Error saving item {item.id}: {e}")
