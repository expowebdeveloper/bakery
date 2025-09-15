import { T } from "./utils/languageTranslator";

export const RAW_MATERIALS_ITEMS_PER_PAGE = 10;
export const TODO_ITEMS_PER_PAGE = 10;
export const CONFIGURATION_ITEMS_PER_PAGE = 10;
export const ITEMS_PER_PAGE = 10;

export const DUMMY_PRODUCT_DATA = [
  {
    id: 9,
    category: 2,
    sku: "00-cake-2991",
    name: "MIne Cakes",
    description: "This is tasty cheese cake",
    is_active: false,
    status: "available",
    images: [
      {
        id: 4,
        image:
          "http://192.168.1.86:8000/media/product_images/Screenshot_from_2024-10-21_10-16-08_k9pr89I.png",
        product: 9,
      },
    ],
    variants: [],
  },
  {
    id: 4,
    category: 2,
    sku: "00-cake-1323",
    name: "MIne Cakes",
    description: "This is tasty cheese cake",
    is_active: false,
    status: "available",
    images: [],
    variants: [],
  },
  {
    id: 11,
    category: 2,
    sku: "00-cake-2903",
    name: "MIne Cakes",
    description: "This is tasty cheese cake",
    is_active: false,
    status: "available",
    images: [
      {
        id: 6,
        image:
          "http://192.168.1.86:8000/media/product_images/Screenshot_from_2024-10-21_10-16-08_9GaEzEq.png",
        product: 11,
      },
    ],
    variants: [],
  },
  {
    id: 1,
    category: 2,
    sku: "00-cake-13009",
    name: "MIne Cakes",
    description: "This is tasty cheese cake",
    is_active: false,
    status: "available",
    images: [],
    variants: [],
  },
  {
    id: 5,
    category: 2,
    sku: "00-cake-1112",
    name: "MIne Cakes",
    description: "This is tasty cheese cake",
    is_active: false,
    status: "available",
    images: [
      {
        id: 1,
        image:
          "http://192.168.1.86:8000/media/product_images/Screenshot_from_2024-10-21_10-16-08.png",
        product: 5,
      },
    ],
    variants: [],
  },
  {
    id: 2,
    category: 2,
    sku: "00-cake-1303",
    name: "MIne Cakes",
    description: "This is tasty cheese cake",
    is_active: false,
    status: "available",
    images: [],
    variants: [],
  },
  {
    id: 3,
    category: 2,
    sku: "00-cake-1324",
    name: "MIne Cakes",
    description: "This is tasty cheese cake",
    is_active: false,
    status: "available",
    images: [],
    variants: [],
  },
  {
    id: 8,
    category: 2,
    sku: "00-cake-2992",
    name: "MIne Cakes",
    description: "This is tasty cheese cake",
    is_active: false,
    status: "available",
    images: [],
    variants: [],
  },
  {
    id: 12,
    category: 2,
    sku: "00-cake-2114",
    name: "MIne Cakes",
    description: "This is tasty cheese cake",
    is_active: false,
    status: "available",
    images: [
      {
        id: 7,
        image:
          "http://192.168.1.86:8000/media/product_images/Screenshot_from_2024-10-21_10-16-08_t51wQWy.png",
        product: 12,
      },
    ],
    variants: [
      {
        id: 7,
        product: 12,
        weight: 100,
        price: "390.90",
        quantity: 0,
        sku: "00-cake-2114-VAR-0-4051",
        start_series: null,
        end_series: null,
      },
      {
        id: 8,
        product: 12,
        weight: 100,
        price: "390.90",
        quantity: 0,
        sku: "00-cake-2114-VAR-0-1920",
        start_series: null,
        end_series: null,
      },
    ],
  },
  {
    id: 6,
    category: 2,
    sku: "00-cake-1003",
    name: "MIne Cakes",
    description: "This is tasty cheese cake",
    is_active: false,
    status: "available",
    images: [
      {
        id: 2,
        image:
          "http://192.168.1.86:8000/media/product_images/Screenshot_from_2024-10-21_10-16-08_bQSvvpU.png",
        product: 6,
      },
    ],
    variants: [
      {
        id: 1,
        product: 6,
        weight: 100,
        price: "390.90",
        quantity: 0,
        sku: "00-cake-1003-VAR--0",
        start_series: null,
        end_series: null,
      },
    ],
  },
]

export const DEFAULT_ERROR_MESSAGE = T["default_error_message"];
export const INVALID_ID = T["invalid_id"];

export const allowedImageTypes = [
  "image/png",
  "image/jpeg", // Covers both .jpg and .jpeg
  // "image/svg+xml",
  //   "image/gif",
  //   "image/webp",
];
export const PNG_TYPE = ["image/png"];

export const today = new Date().toISOString().split("T")[0];
export const DEFAULT_CLASS =
  "px-4 py-3 bg-gray-100 w-full text-sm outline-[#333] rounded-sm transition-all";

export const OPTIONS = [
  { value: "Option1", label: T["option1"] },
  { value: "Option2", label: T["option2"] },
  { value: "Option3", label: T["option3"] },
];

export const SORT_BY_OPTIONS = [
  // { value: "newest", label: T["newest"] },
  // { value: "oldest", label: T["oldest"] },
  { value: "asc", label: T["ascending"] },
  { value: "desc", label: T["descending"] },
];
export const PAYMENT_TYPE_OPTIONS = [{ value: "card", label: T["card"] }];

export const ORDERS_TYPE_OPTIONS = [
  { value: "rejected", label: T["declined"] },
  { value: "accepted", label: T["accepted"] },
  { value: "payment_pending", label: "Pending" },
  { value: "canceled", label: "Canceled" },
  { value: "delivered", label: "Delivered" },
  { value: "in_transit", label: "In Transit" },
  { value: "in_progress", label: "In progress" },
];

export const DUMMY_TODO_DATA = [
  {
    id: 3,
    task_id: 100,
    title: "Order Ingredients",
    description: "Order 50 lbs of flour and sugar",
    priority: "High",
    start_date: "2024-10-12",
    assigned_to: "vandana",
    end_date: "2024-10-15",
    status: "Not Started",
    notes: "Use supplier ABC",
    status: "unassigned",
  },
  {
    task_id: 101,
    title: "Staff Scheduling",
    description: "Schedule shifts for October",
    priority: "High",
    start_date: "",
    end_date: "2024-10-15",
    assigned_to: "John",
    status: "Not Started",
    notes: "Use supplier ABC",
  },
];

export const PRIORITY_OPTIONS = [
  { label: "High", value: "high" },
  { label: "Medium", value: "medium" },
  { label: "Low", value: "low" },
];
export const YYYY_MM_DD = "YYYY-MM-DD";

export const STATE_OPTIONS = [
  { label: "Alabama", value: "AL" },
  { label: "Alaska", value: "AK" },
  { label: "Arizona", value: "AZ" },
  { label: "Arkansas", value: "AR" },
  { label: "California", value: "CA" },
  { label: "Colorado", value: "CO" },
  { label: "Connecticut", value: "CT" },
  { label: "Delaware", value: "DE" },
  { label: "District of Columbia", value: "DC" },
  { label: "Florida", value: "FL" },
  { label: "Georgia", value: "GA" },
  { label: "Hawaii", value: "HI" },
  { label: "Idaho", value: "ID" },
  { label: "Illinois", value: "IL" },
  { label: "Indiana", value: "IN" },
  { label: "Iowa", value: "IA" },
  { label: "Kansas", value: "KS" },
  { label: "Kentucky", value: "KY" },
  { label: "Louisiana", value: "LA" },
  { label: "Maine", value: "ME" },
  { label: "Maryland", value: "MD" },
  { label: "Massachusetts", value: "MA" },
  { label: "Michigan", value: "MI" },
  { label: "Minnesota", value: "MN" },
  { label: "Mississippi", value: "MS" },
  { label: "Missouri", value: "MO" },
  { label: "Montana", value: "MT" },
  { label: "Nebraska", value: "NE" },
  { label: "Nevada", value: "NV" },
  { label: "New Hampshire", value: "NH" },
  { label: "New Jersey", value: "NJ" },
  { label: "New Mexico", value: "NM" },
  { label: "New York", value: "NY" },
  { label: "North Carolina", value: "NC" },
  { label: "North Dakota", value: "ND" },
  { label: "Ohio", value: "OH" },
  { label: "Oklahoma", value: "OK" },
  { label: "Oregon", value: "OR" },
  { label: "Pennsylvania", value: "PA" },
  { label: "Rhode Island", value: "RI" },
  { label: "South Carolina", value: "SC" },
  { label: "South Dakota", value: "SD" },
  { label: "Tennessee", value: "TN" },
  { label: "Texas", value: "TX" },
  { label: "Utah", value: "UT" },
  { label: "Vermont", value: "VT" },
  { label: "Virginia", value: "VA" },
  { label: "Washington", value: "WA" },
  { label: "West Virginia", value: "WV" },
  { label: "Wisconsin", value: "WI" },
  { label: "Wyoming", value: "WY" },
];

// export const SWEDEN_COUNTY_OPTIONS = [
//   { label: "Blekinge", value: "BL" },
//   { label: "Dalarna", value: "DL" },
//   { label: "Gotland", value: "GT" },
//   { label: "Gävleborg", value: "GV" },
//   { label: "Halland", value: "HL" },
//   { label: "Jämtland", value: "JM" },
//   { label: "Jönköping", value: "JK" },
//   { label: "Kalmar", value: "KL" },
//   { label: "Kronoberg", value: "KR" },
//   { label: "Norrbotten", value: "NB" },
//   { label: "Skåne", value: "SN" },
//   { label: "Stockholm", value: "ST" },
//   { label: "Södermanland", value: "SD" },
//   { label: "Uppsala", value: "UP" },
//   { label: "Värmland", value: "VL" },
//   { label: "Västerbotten", value: "VB" },
//   { label: "Västernorrland", value: "VN" },
//   { label: "Västmanland", value: "VM" },
//   { label: "Västra Götaland", value: "VG" },
//   { label: "Örebro", value: "OR" },
//   { label: "Östergötland", value: "OG" },
// ];

export const SWEDEN_COUNTY_OPTIONS = [
  { label: "Stockholm", value: "Stockholm" },
  { label: "Västernorrland", value: "Västernorrland" },
  { label: "Västmanland", value: "Västmanland" },
  { label: "Västra Götaland", value: "Västra Götaland" },
  { label: "Östergötland", value: "Östergötland" },
  { label: "Dalarna", value: "Dalarna" },
  { label: "Gävleborg", value: "Gävleborg" },
  { label: "Gotland", value: "Gotland" },
  { label: "Halland", value: "Halland" },
  { label: "Jämtland", value: "Jämtland" },
  { label: "Jönköping", value: "Jönköping" },
  { label: "Kalmar", value: "Kalmar" },
  { label: "Kristianstad", value: "Kristianstad" },
  { label: "Kopparberg", value: "Kopparberg" },
  { label: "Skåne", value: "Skåne" },
  { label: "Södermanland", value: "Södermanland" },
  { label: "Uppsala", value: "Uppsala" },
  { label: "Värmland", value: "Värmland" },
  { label: "Västerbotten", value: "Västerbotten" },
  { label: "Blekinge", value: "Blekinge" },
  { label: "Nordmaling", value: "Nordmaling" },
  { label: "Örebro", value: "Örebro" },
];

export const DUMMY_EMPLOYEE_DATA = [
  {
    id: 1,
    name: "Jane Smith",
    role: "Accountant",
    email: "jane.smith@bakers.com",
    phone: "123-456-7890",
    shift: "9AM-5PM",
    status: true,
  },
  {
    id: 2,
    name: "John Doe",
    role: "Supervisor",
    email: "john.doe@bakers.com",
    phone: "123-456-7890",
    shift: "9AM-5PM",
    status: true,
  },
];
export const MEASURE_OPTIONS = [
  { label: "Kilogram", value: "kg" },
  { label: "Gram", value: "g" },
  { label: "Litre", value: "litre" },
  { label: "Milligram", value: "mg" },
  { label: "Pound", value: "lb" },
  { label: "Ounce", value: "oz" },
  { label: "Millilitre", value: "ml" },
  { label: "Cup", value: "cup" },
  // { label: "Tablespoon", value: "tbsp" },
  // { label: "Teaspoon", value: "tsp" },
  // { label: "Piece", value: "piece" },
  // { label: "Slice", value: "slice" },
];
export const INVENTORY_PAGE_COLUMNS = [
  T["character_name"],
  T["current_stock"],
  T["reorder_level"],
  T["barcode_no"],
  T["sku"],
  T["status"],
  T["action"],
];
export const DUMMY_CUSTOMER_DATA = [
  // Update required: update according to the api parameters /////////
  {
    id: 41,
    user: {
      email: "sappaxeiddosei-4037@yopmail.com",
      role: "bakery",
      first_name: "Nina",
      last_name: "Gilbert",
    },
    created_at: "2024-12-23T11:42:54.117057Z",
    updated_at: "2024-12-23T11:42:54.117074Z",
    name: "christmas bakery shop",
    contact_no: "1238838338",
    contact_no_verified: true,
    email_verified: true,
    term_condition: true,
    sms_reminders: true,
    email_reminders: true,
    newletter_reminders: true,
  },
];

export const DUMMY_PAYMENT_DATA = [
  {
    id: 1,
    customer_name: "Sarah Wiliiams",
    date: "19/11/2024",
    order_id: "Botal",
    payment_method: "Credit Card",
    amount: 100,
    status: "Successful",
    transaction_id: "Txpdjnm",
  },
  {
    id: 2,
    customer_name: "Jake Wiliiams",
    date: "19/11/2024",
    order_id: "Botal",
    payment_method: "Credit Card",
    amount: 100,
    status: "Successful",
    transaction_id: "Txpdjnm",
  },
  {
    id: 3,
    customer_name: "devid Wiliiams",
    date: "19/11/2024",
    order_id: "Botal",
    payment_method: "Credit Card",
    amount: 100,
    status: "Successful",
    transaction_id: "Txpdjnm",
  },
];

export const DUMMY_NOTIFICATION_DATA = [
  {
    id: 1,
    title: "Lorem posted new job Housekeeping",
    description:
      "A description is a statement that provides details about a person or thing, or a communication method that aims to make something vivid",
    time: "2 min ago",
  },
  {
    id: 2,
    title: "Lorem posted new job Housekeeping",
    description:
      "A description is a statement that provides details about a person or thing, or a communication method that aims to make something vivid",
    time: "2 min ago",
  },
  {
    id: 3,
    title: "Lorem posted new job Housekeeping",
    description:
      "A description is a statement that provides details about a person or thing, or a communication method that aims to make something vivid",
    time: "2 min ago",
  },
  {
    id: 4,
    title: "Lorem posted new job Housekeeping",
    description:
      "A description is a statement that provides details about a person or thing, or a communication method that aims to make something vivid",
    time: "2 min ago",
  },
  {
    id: 5,
    title: "Lorem posted new job Housekeeping",
    description:
      "A description is a statement that provides details about a person or thing, or a communication method that aims to make something vivid",
    time: "2 min ago",
  },
  {
    id: 6,
    title: "Lorem posted new job Housekeeping",
    description:
      "A description is a statement that provides details about a person or thing, or a communication method that aims to make something vivid",
    time: "2 min ago",
  },
  {
    id: 7,
    title: "Lorem posted new job Housekeeping",
    description:
      "A description is a statement that provides details about a person or thing, or a communication method that aims to make something vivid",
    time: "2 min ago",
  },
];

export const DUMMY_INVENTORY_DATA = [
  {
    id: 1,
    name: "Sourdough",
    current_stock: "50 loaves",
    reorder: "20 loaves",
    sku: "SOU1234",
    status: "in_stock",
    barcode_no: "78901",
    barcode_to: "78653",
  },
  {
    id: 2,
    name: "Rye bread",
    current_stock: "50 loaves",
    reorder: "20 loaves",
    sku: "SOU1234",
    status: "in_stock",
    barcode_no: "78901",
    barcode_to: "78653",
  },

  {
    id: 3,
    name: "Semla",
    current_stock: "50 loaves",
    reorder: "20 loaves",
    sku: "SOU1234",
    status: "in_stock",
    barcode_no: "78901",
    barcode_to: "78653",
  },
];
export const DUMMY_SUPPORT_DATA = [
  {
    id: 1,
    name: "John Doe",
    email: "Individual",
    issue_description: "michael Johnson",
    status: "John@example.com",
    date_created: "45 bakery lane  london",
    assigned_to: "5 orders",
  },
  {
    id: 2,
    name: "John Doe",
    email: "Individual",
    issue_description: "michael Johnson",
    status: "John@example.com",
    date_created: "45 bakery lane  london",
    assigned_to: "5 orders",
  },
  {
    id: 3,
    name: "John Doe",
    email: "Individual",
    issue_description: "michael Johnson",
    status: "John@example.com",
    date_created: "45 bakery lane  london",
    assigned_to: "5 orders",
  },
  {
    id: 4,
    name: "John Doe",
    email: "Individual",
    issue_description: "michael Johnson",
    status: "John@example.com",
    date_created: "45 bakery lane  london",
    assigned_to: "5 orders",
  },
  {
    id: 5,
    name: "John Doe",
    email: "Individual",
    issue_description: "michael Johnson",
    status: "John@example.com",
    date_created: "45 bakery lane  london",
    assigned_to: "5 orders",
  },
  {
    id: 6,
    name: "John Doe",
    email: "Individual",
    issue_description: "michael Johnson",
    status: "John@example.com",
    date_created: "45 bakery lane  london",
    assigned_to: "5 orders",
  },
];

export const DISCOUNT_TYPE_OPTIONS = [
  { label: "Amount", value: "amount" },
  { label: "Percentage", value: "percentage" },
];

export const PURCHASE_REQUIREMENT_OPTIONS = [
  // update these things according
  {
    label: "No minimum requirements",
    value: "no_requirement",
  },
  {
    label: "Minimum purchase amount (SEK)",
    value: "minimum_purchase",
  },
  {
    label: "Minimum quantity of items",
    value: "minimum_items",
  },
];

export const CUSTOMER_ELIGIBILITY_OPTIONS = [
  {
    label: "All customers",
    value: "all_customer",
  },
  {
    label: "Specific customer segments",
    value: "specific_customer",
  },
];

export const COUNTRY_OPTIONS = [
  { label: "All countries", value: "all_countries" },
  { label: "Selected countries", value: "selected_countries" },
];

export const STATES_OPTIONS = [
  { label: "All states", value: "all_states" },
  { label: "Selected states", value: "specific_states" },
];

export const CUSTOMER_SPECIFIC_OPTIONS = [
  {
    label: "Customers who have not purchased ",
    value: "havent_purchased",
  },
  {
    label: "Customers who have purchased recently",
    value: "recent_purchased",
  },
  {
    label: "Customers who have purchased at least once  ",
    value: "purchased_once",
  },
  {
    label: "Customers who have purchased more than once",
    value: "purchased_more_than_once",
  },
  // {
  //   label: "Customers who have purchased at least once",
  //   value: "purchased_at_least_once",
  // },
];

export const COMBINATION_OPTIONS = [
  {
    label: "Product discounts",
    value: "product_discounts",
  },
  {
    label: "Order discounts",
    value: "order_discounts",
  },
  {
    label: "Shipping discounts",
    value: "shipping_discounts",
  },
];

export const APPLIES_TO_OPTIONS = [
  { label: "All Collections", value: "all_products" },
  { label: "Specific Collections", value: "specific_products" },
];

export const DISCOUNTED_VALUE_OPTIONS = [
  { label: "Percentage", value: "percentage" },
  { label: "Amount off each", value: "amount_off_each" },
  { label: "Free", value: "free" },
];

export const DISCOUNTED_USAGE_OPTIONS = [
  {
    label: "Limit to one use per customer",
    value: "per_customer",
  },
  {
    label: "Limit number of times this discount can be used in total",
    value: "limit_discount_usage_time",
  },
];
export const COMBINATION_OPTIONS_SHIPPING = [
  {
    label: "Product discounts",
    value: "product_discounts",
  },
  {
    label: "Order discounts",
    value: "order_discounts",
  },
];
export const BACKDOOR_OPTIONS = [
  {
    label: "Allow ",
    value: "allow",
  },
  {
    label: "Do Not Allow",
    value: "Do Not Allow",
  },
];

export const PNG_AND_JPG = "image/png, image/jpeg";
export const PNG = "image/png";

export const AVAILABILITY_OPTIONS = [
  { label: "Available", value: "available" },
  { label: "Not Available", value: "unavailable" },
];

export const SHIFT_OPTIONS = [
  { value: "Morning", label: "Morning" },
  { value: "Night", label: "Night" },
];

export const ROLE_OPTIONS = [
  { value: "accountant", label: "Accountant" },
  { value: "worker", label: "Worker" },
  { value: "admin", label: "Admin" },
  { value: "stock_manager", label: "Stock Manager" },
];
export const JOB_TYPE_OPTIONS = [
  { value: "FT", label: "Full-Time" },
  { value: "PT", label: "Part-Time" },
  { value: "CT", label: "Contract" },
  { value: "FL", label: "Freelance" },
  { value: "IN", label: "Internship" },
  { value: "TP", label: "Temporary" },
  { value: "RM", label: "Remote" },
];
export const TYPE_OPTIONS = [
  { label: T["all"], value: "all" },
  { label: T["published"], value: "publish" },
  { label: T["draft"], value: "draft" },
  { label: T["trash"], value: "trash" },
  // { label: T["trash"], value: "trash" },
];

export const ACTIONS = [
  { label: T["duplicate"], value: "duplicate" },
  { label: T["delete"], value: "delete" },
  { label: T["draft"], value: "draft" },
  { label: T["publish"], value: "publish" },
];

export const DUMMY_EMPLOYEE = {
  id: 4,
  email: "candidate2@email.com",
  role: "worker",
  first_name: "Candidate",
  last_name: "Vashisht",
  employee_detail: {
    employee_id: "kjhhkiu",
    address: "Artillerigatan, Stockholm, Sweden",
    city: "Alingsås, Sweden",
    state: "VB",
    country: "SE",
    zip_code: "14010",
    contact_no: "0987654411",
    hiring_date: "2024-11-12",
    shift: "Night",
  },
};
export const EMPLOYEE_ID_ERROR = "An employee with this ID already exists.";
export const DUMMY_ORDERS_DATA = [
  {
    id: 1,
    customer_name: "Sarah Wiliiams",
    date: "2024-11-23T00:00:00Z",
    items: "4X Dinner role",
    quantity: "02",
    reason_for_decline: "out of stock",
  },
  {
    id: 2,
    customer_name: "Sarah Wiliiams",
    date: "2024-11-23T00:00:00Z",
    items: "6X Dinner role",
    quantity: "01",
    reason_for_decline: 100,
  },
  {
    id: 3,
    customer_name: "Sarah Wiliiams",
    date: "2024-11-23T00:00:00Z",
    items: "8X Dinner role",
    quantity: "98",
    reason_for_decline: 100,
  },
  {
    id: 4,
    customer_name: "Sarah Wiliiams",
    date: "2024-11-23T00:00:00Z",
    items: "7X Dinner role",
    quantity: "7",
    reason_for_decline: 100,
  },
];
export const SAME_PRODUCT_NAME_ERROR = `duplicate key value violates unique constraint "product_product_name_04ac86ce_uniq"
DETAIL:  Key (name)=(Wheat) already exists.
 fieldError`;

export const RECIPE_MEASURE_OPTIONS = [
  { label: "Gram", value: "g" },
  { label: "Kilogram", value: "kg" },
  { label: "Teaspoon", value: "tsp" },
  { label: "Tablespoon", value: "tbsp" },
  { label: "Ounce", value: "oz" },
  { label: "Pound", value: "lb" },
  { label: "Cup", value: "cup" },
  { label: "Milliliter", value: "ml" },
  { label: "Liter", value: "litre" },
];

export const CUSTOMER_BUYS_OPTIONS = [
  { label: "Minimum quantity of items", value: "minimum_items_quantity" },
  { label: "Minimum purchase amount", value: "minimum_purchase_amount" },
];
export const ITEMS_FROM_OPTIONS = [
  { label: "All products", value: "all_products" },
  { label: "Specify product", value: "specific_products" },
];

export const ROLES = {
  accountManager: "accountant",
  stockManager: "stock_manager",
  admin: "admin",
  worker: "worker",
  bakery: "bakery",
};
export const INGREDIENTS_ITEMS = [
  {
    fieldName: "name",
    placeholder: T["enter_name"],
    label: `${T["ingredient_name"]} *`,
    isRequired: true,
  },
  {
    fieldName: "quantity",
    placeholder: T["enter_quantity"],
    label: `${T["ingredient_quantity"]} *`,
    isRequired: true,
    isNumberOnly: true,
  },
  {
    fieldName: "unit_of_measure",
    placeholder: T["select_unit"],
    label: `${T["unit_of_measure"]} *`,
    field_type: "react-select",
    isRequired: true,
    options: RECIPE_MEASURE_OPTIONS,
  },
];
export const PAYMENT_STATUS = [
  // { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Paid", value: "paid" },
  { label: "Cancelled", value: "cancelled" },
  { label: "Refunded", value: "refunded" },
];

export const ORDERS_STATUSES = {
  inTransit: "In transit",
  paymentPending: "Payment pending",
  inProgress: "In progress",
  rejected: "Rejected",
  delivered: "Delivered",
};

export const UPDATE_STATUS_OPTIONS = {
  paymentPending: "payment_pending",
  delivered: "delivered",
  inProgress: "in_progress",
  rejected: "rejected",
  canceled: "canceled",
  inTransit: "in_transit",
};
export const STATUS = [
  { label: T["published"], value: "publish" },
  { label: T["draft"], value: "draft" },
];

// sort by options start

export const PRODUCTS_SORT_BY = [
  { label: "Price (Low to High)", value: "price_asc" },
  { label: "Price (High to Low)", value: "price_desc" },
  { label: "Date (Newest)", value: "created_at" },
  { label: "Date (Oldest)", value: "-created_at" },
  { label: "Total Quantity (Highest to Lowest)", value: "total_quantity" },
  { label: "Total Quantity (Lowest to Highest)", value: "-total_quantity" },
  { label: "Status (Out-of-stock First)", value: "-status" },
  { label: "Status (In-stock First)", value: "status" },
];
export const CUSTOMER_TYPES = [
  { label: T["all"], value: "all" },
  { label: T["trash"], value: "trash" },
]

export const SORT_OPTIONS = {
  sort_by: "", // Options: price_asc, price_desc, total_quantity, created_at_asc, created_at_desc, min_order_quantity, status
  sort: "asc", // Options: asc, desc
};

export const RAW_MATERIALS_SORT_BY = [
  { label: "Date (Newest)", value: "desc" },
  { label: "Date (Oldest)", value: "asc" },
  { label: "Name (A-Z)", value: "name" },
  { label: "Name (Z-A)", value: "-name" },
  { label: "Expiry Date (Newest)", value: "-expiry_date" },
  { label: "Expiry Date (Oldest)", value: "expiry_date" },
  { label: "Cost (Lowest to Highest)", value: "cost" },
  { label: "Cost (Highest to Lowest)", value: "-cost" },
  // commented for future use
  // { label: "Description (A-Z)", value: "description" },
  // { label: "Description (Z-A)", value: "-description" },
  { label: "Quantity (Lowest to Highest)", value: "quantity" },
  { label: "Quantity (Highest to Lowest)", value: "-quantity" },
];

export const ORDERS_SORT_BY = [
  { label: "Order No (Lowest to Highest)", value: "order_id" },
  { label: "Order No (Highest to Lowest)", value: "-order_id" },
  { label: "Customer Name (A to Z)", value: "user__first_name" },
  { label: "Customer Name (Z to A)", value: "-user__first_name" },
  // { label: "Status (Active First)", value: "status" },
  // { label: "Status (Inactive First)", value: "-status" },
  { label: "Order Date (Newest First)", value: "-created_at" },
  { label: "Order Date (Oldest First)", value: "created_at" },
];

export const CATEGORIES_SORT_BY = [
  { label: "Date (Newest)", value: "asc" },
  { label: "Date (Oldest)", value: "desc" },
  { label: "Name (A-Z)", value: "name" },
  { label: "Name (Z-A)", value: "-name" },
  { label: "Status (Published first)", value: "status" },
  { label: "Status (Draft first)", value: "-status" },
];
export const INVENTORY_SORT_BY = [
  { label: "Date (Newest)", value: "asc" },
  { label: "Date (oldest)", value: "desc" },
  { label: "SKU (Ascending)", value: "sku" },
  { label: "SKU (Descending)", value: "-sku" },
  { label: "Total Quantity (Highest to Lowest)", value: "-total_quantity" },
  { label: "Total Quantity (Lowest to Highest)", value: "total_quantity" },
];
export const INVENTORY_STATUS_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Out of Stock", value: "out_of_stock" },
  { label: "Available", value: "available" },
];

export const DISCOUNTS_SORT_BY = [
  // { label: "Date (Newest)", value: "created_at" },
  // { label: "Date (Oldest)", value: "-created_at" },
  { label: "Date (Newest)", value: "asc" },
  { label: "Date (Oldest)", value: "desc" },
  { label: "Code (A-Z)", value: "code" },
  { label: "Code (Z-A)", value: "-code" },
  { label: "Status (Active First)", value: "is_active" },
  { label: "Status (Inactive First)", value: "-is_active" },
  { label: "Coupon Type (A-Z)", value: "coupon_type" },
  { label: "Coupon Type (Z-A)", value: "-coupon_type" },
];

export const SORT_VALUES = ["asc", "desc"];

export const EMPLOYEE_SORT_BY = [
  { label: "Date (Newest)", value: "asc" },
  { label: "Date (Oldest)", value: "desc" },
  { label: "Email (A-Z)", value: "email" },
  { label: "Email (Z-A)", value: "-email" },
  { label: "Name (A-Z)", value: "name" },
  { label: "Name (Z-A)", value: "-name" },
  { label: "Status (Active First)", value: "status" },
  { label: "Status (Inactive First)", value: "-status" },
  { label: "Shift (Start Time Ascending)", value: "shift" },
  { label: "Shift (Start Time Descending)", value: "-shift" },
  { label: "Joining Date (Newest)", value: "-hiring_date" },
  { label: "Joining Date (Oldest)", value: "hiring_date" },
  // { label: "Terminate Date (Newest)", value: "terminate_date" },
  // { label: "Terminate Date (Oldest)", value: "-terminate_date" },
];

export const CUSTOMER_SORT_BY = [
  { label: "Creation Date (Newest)", value: "-created_at" },
  { label: "Creation Date (Oldest)", value: "created_at" },
  { label: "Name (A-Z)", value: "name" },
  { label: "Name (Z-A)", value: "-name" },
  // { label: "Title (A-Z)", value: "title" },
  // { label: "Title (Z-A)", value: "-title" },
  { label: "Order Count (Highest First)", value: "-order_count" },
  { label: "Order Count (Lowest First)", value: "order_count" },
];

export const TODO_SORT_BY = [
  { label: "Priority (Low to High)", value: "-priority" },
  { label: "Priority (High to Low)", value: "priority" },
  { label: "Task Name (A-Z)", value: "title" },
  { label: "Task Name (Z-A)", value: "-title" },
  { label: "Task Created (Newest First)", value: "asc" },
  { label: "Task Created (Oldest First)", value: "desc" },
  { label: "Due Date (Latest First)", value: "end_date" },
  { label: "Due Date (Earliest First)", value: "-end_date" },
];

export const ZIP_CONFIGURATION_SORT_BY = [
  { label: "Zip Code (Ascending)", value: "desc" },
  { label: "Zip Code (Descending)", value: "asc" },
  { label: "Minimum Order (Ascending)", value: "min_order" },
  { label: "Minimum Order (Descending)", value: "-min_order" },
  // commented for future use
  // { label: "Delivery (Ascending)", value: "delivery" },
  // { label: "Delivery (Descending)", value: "-delivery" },
  {
    label: "Delivery Availability (Available first)",
    value: "delivery_availability",
  },
  {
    label: "Delivery Availability (Unavailable first)",
    value: "-delivery_availability",
  },
];

export const ORDER_HISTORY_SORT_BY_OPTIONS = [
  { label: "Date (Newest)", value: "asc" },
  { label: "Date (Oldest)", value: "desc" },
  { label: "Order ID (Ascending)", value: "order_id" },
  { label: "Order ID (Descending)", value: "-order_id" },
  { label: "Total Amount (Ascending)", value: "total_amount" },
  { label: "Total Amount (Descending)", value: "-total_amount" },
  { label: "A to Z (Alphabetical)", value: "a_to_z" },
  { label: "Z to A (Alphabetical)", value: "z_to_a" },
  { label: "Invoice Number (Ascending)", value: "invoice_number" },
  { label: "Invoice Number (Descending)", value: "-invoice_number" },
  // commented for future use
  // { label: "Status (Ascending)", value: "status" },
  // { label: "Status (Descending)", value: "-status" },
];
export const RECIPE_SORT_BY = [
  { label: "Recipe Date (Newest)", value: "asc" },
  { label: "Recipe Date (Oldest)", value: "desc" },
  { label: "Preparation Time (Shortest)", value: "preparation_time" },
  { label: "Preparation Time (Longest)", value: "-preparation_time" },
  { label: "Cook Time (Shortest)", value: "cook_time" },
  { label: "Cook Time (Longest)", value: "-cook_time" },
  { label: "Serving Size (Smallest)", value: "serving_size" },
  { label: "Serving Size (Largest)", value: "-serving_size" },
  { label: "Recipe Title (A-Z)", value: "recipe_title" },
  { label: "Recipe Title (Z-A)", value: "-recipe_title" },
  { label: "Status (Published First)", value: "-status" },
  { label: "Status (Draft First)", value: "status" },
];

export const PAYMENT_HISTORY_SORT_BY = [
  { label: "Date (Newest)", value: "asc" },
  { label: "Date (Oldest)", value: "desc" },
  { label: "User Name (A to Z)", value: "a_to_z" },
  { label: "User Name (Z to A)", value: "z_to_a" },
  { label: "Amount (Low to High)", value: "total_amount" },
  { label: "Amount (High to Low)", value: "-total_amount" },
];
export const UPDATE_STATUS_MESSAGE = "Are you sure you want to update status";
export const UPDATE_DESCRIPTION_TEXT =
  "This action will update the status of the order and cannot be undone";

export const NOTIFY_TEXT = "Notify the user about this status changes";
// sort by options end
export const DUMMY_NOTIFICATION_ICON_DATA = [
  { lable: T["project"], value: "project" },
  { lable: T["order"], value: "order" },
  { lable: T["todo"], value: "todo" },
  { lable: T["employee"], value: "employee" },  
  { lable: T["customers"], value: "value" },
  { lable: T["recipe"], value: "recipe" },
  { lable: T["dashboard"], value: "dashboard" },
  { lable: T["rawmaterials"], value: "rawmaterials" },
  { lable: T["discount"], value: "discount" },
  { lable: T["ZipConfiguration"], value: "zipConfiguration" },
];

export const ZIP_STATUS_OPTIONS = [
  {
    label: "Available",
    value: "available",
  },
  {
    label: "Not Available",
    value: "unavailable",
  },
];
//  class TaskStatus(Enum):
//     UNASSIGNED = "unassigned"
//     ASSIGNED = "assigned"
//     INPROGRESS = "in_progress"
//     COMPLETED = "completed"
//     NOTSTARTED = "not_started"
//     HOLD = "hold"

export const TASK_STATUS = [
  {
    label: "Unassiged",
    value: "unassigned",
  },
  {
    label: "Assigned",
    value: "assigned",
  },
  {
    label: "In Progress",
    value: "in_progress",
  },
  {
    label: "Completed",
    value: "completed",
  },
  {
    label: "Not Started",
    value: "not_started",
  },
  {
    label: "Hold",
    value: "hold",
  },
];

export const EMPLOYEE_TASK_STATUS = [
  {
    label: "Active",
    value: "active",
  },
  {
    label: "Inactive",
    value: "inactive",
  },
  {
    label: "On Leave",
    value: "on_leave",
  },
  {
    label: "Terminated",
    value: "terminated",
  },
  {
    label: "Probation",
    value: "probation",
  },
  {
    label: "Resigned",
    value: "resigned",
  },
];


export const DIETRY_OPTIONS = [
  { label: "Gluten-Free", value: "GF" },
  { label: "Dairy-Free", value: "DF" },
  { label: "Vegetarian", value: "VEG" },
  { label: "Vegan", value: "VEGAN" },
  { label: "Nut-Free", value: "NF" },
  { label: "Paleo", value: "PA" },
  { label: "Ketogenic", value: "KETO" },
  { label: "Low-Carb", value: "LC" },
  { label: "Pescatarian", value: "PESC" },
  { label: "Halal", value: "HAL" },
  { label: "Kosher", value: "KOS" },
  { label: "Soy-Free", value: "SF" },
  { label: "Sugar-Free", value: "SFREE" },
  { label: "Organic", value: "ORG" },
  { label: "Whole30", value: "W30" },
  { label: "Low-FODMAP", value: "LFOD" },
  { label: "High-Protein", value: "HP" },
  { label: "Raw Food", value: "RAW" },
  { label: "Flexitarian", value: "FLEX" },
  { label: "Low-Sodium", value: "LS" }]

export const BULK_DELETE_TITLE = T["confirm_bulk_delete"];
export const BULK_CATEGORY_DELETE_DESCRIPTION = "Are you sure you want to delete these categories? This action cannot be undone, and the selected items will be deleted permanently."
export const BULK_DELETE_DESCRIPTION =
  "Are you sure you want to delete these items?";
  export const BULK_RECIPE_DELETE_DESCRIPTION = "Are you sure you want to delete these recipes? This action cannot be undone, and the selected items will be  deleted permanently";
export const DELETE_CONFIRMATION_DESCRIPTION = "This action can be undone. Moving this raw material to trash will temporarily remove it from your inventory"
export const BULK_PRODUCT_DELETE_DESCRIPTION = "Are you sure you want to delete these products? This action cannot be undone, and the selected items will be deleted permanently."
export const BULK_RAW_MATERIAL_DELETE_DESCRIPTION = "Are you sure you want to delete these raw materials? This action cannot be undone, and the selected items will be deleted permanently."
export const BULK_COUPON_DELETE_DESCRIPTION = "Are you sure you want to delete these discounts? This action cannot be undone, and the selected items will be deleted permanently."  

export const PRICE_UNIT = "SEK"
export const NOTIFICATION_STATUS_OPTIONS = [
  {label: T["all"], value: "all"},
  {label: T["read"], value: "read"},
  {label: T["unread"], value: "unread"},
]

export const PASSWORD_REGEX = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[^A-Za-z0-9]).{8,}$/g;
