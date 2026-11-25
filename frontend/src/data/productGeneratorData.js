// frontend/src/data/productGeneratorData.js

import {
  Cake,
  PartyPopper,
  Baby,
  Church,
  Calendar,
  Crown,
  Sparkles,
  Wine,
  Snowflake,
  Ghost,
  Utensils,
  GraduationCap,
  Gem,
  Coffee,
  DoorOpen,
  Heart,
  Flag,
  Star,
  IceCream,
  LayoutPanelTop,
  ArrowRight,
  Dice5,
  HelpCircle,
  Gift,
  Search,
  MapPin,
  MessageCircle,
  Award,
  Blocks,
  Users,
  Tag,
  Cookie,
  Mail,
  Notebook,
  ClipboardList,
  Wallet,
  Clock,
  ListChecks,
  MessageSquare,
  Gamepad2,
  Camera,
  FileText,
  Palette,
  Maximize2,
  Layers,
  User,
  CalendarRange,
  Check,
} from "lucide-react";

import partyInvitationsImg from "../assets/categories/party-invitations.png";
import partyDecorationsImg from "../assets/categories/party-decorations.png";
import partyGamesImg from "../assets/categories/party-games.png";
import partyFavorProductsImg from "../assets/categories/party-favor-products.png";
import partyPlanningKitsImg from "../assets/categories/party-planning-kits.png";
import partyTablePrintablesImg from "../assets/categories/party-table-printables.png";
import partyPhotoBoothImg from "../assets/categories/party-photo-booth-kits.png";

// =====================================================
// CATEGORIES
// =====================================================

export const CATEGORIES = [
  { name: "Party Invitations", img: partyInvitationsImg },
  { name: "Party Decorations", img: partyDecorationsImg },
  { name: "Party Games & Activities", img: partyGamesImg },
  { name: "Party Favor Products", img: partyFavorProductsImg },
  { name: "Party Planning Kits", img: partyPlanningKitsImg },
  { name: "Party Table Printables", img: partyTablePrintablesImg },
  { name: "Party Photo Booth Kits", img: partyPhotoBoothImg },
];

export const IMAGE_CATEGORIES = [
  "Party Invitations",
  "Party Decorations",
  "Party Games & Activities",
  "Party Favor Products",
  "Party Table Printables",
  "Party Photo Booth Kits",
];

// =====================================================
// SHARED NORMALIZER
// =====================================================

export const normalizeKey = (s) =>
  String(s || "")
    .replace(/[\u2018\u2019\u201B]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

// =====================================================
// ASPECT RATIOS
// =====================================================

export const RATIO_OPTIONS = [
  { label: "5 × 7 in — Portrait (5:7)", value: "5:7" },
  { label: "7 × 5 in — Landscape (7:5)", value: "7:5" },
  { label: "4 × 6 in — Portrait (2:3)", value: "2:3" },
  { label: "6 × 4 in — Landscape (3:2)", value: "3:2" },
  { label: "Square (1:1)", value: "1:1" },
  { label: "A5 (148 × 210 mm)", value: "148:210" },
  { label: "A6 (105 × 148 mm)", value: "105:148" },
  { label: "Instagram Post (4:5)", value: "4:5" },
  { label: "Story / Reel (9:16)", value: "9:16" },
];

export const RATIO_ORIENTATION = {
  "5:7": "▣ Portrait",
  "7:5": "▧ Landscape",
  "2:3": "▣ Portrait",
  "3:2": "▧ Landscape",
  "1:1": "▣ Portrait",
  "148:210": "▣ Portrait",
  "105:148": "▣ Portrait",
  "4:5": "▣ Portrait",
  "9:16": "▣ Portrait",
};

// =====================================================
// ALL 140 PRODUCTS (unchanged)
// =====================================================

export const PRODUCTS_BY_CATEGORY = {
  "Party Invitations": [
    "Birthday Invitation",
    "Kids Themed Birthday Invitation",
    "First Birthday Invitation",
    "Wedding Invitation",
    "Save the Date Card",
    "Baby Shower Invitation",
    "Bridal Shower Invitation",
    "Gender Reveal Invitation",
    "Bachelorette Invitation",
    "Christmas Invitation",
    "Halloween Invitation",
    "Thanksgiving Invitation",
    "New Year's Eve Invitation",
    "Graduation Invitation",
    "Sweet 16 Invitation",
    "Quinceañera Invitation",
    "Engagement Invitation",
    "Retirement Invitation",
    "Housewarming Invitation",
    "Anniversary Invitation",
  ],

  "Party Decorations": [
    "Welcome Sign",
    "Birthday Banner",
    "Milestone Board",
    "Baby Shower Welcome Sign",
    "Wedding Welcome Sign",
    "Bridal Shower Welcome Sign",
    "Gender Reveal Welcome Sign",
    "Graduation Banner",
    "Christmas Poster",
    "Halloween Poster",
    "New Year's Eve Banner",
    "Cupcake Toppers",
    "Cake Topper",
    "Pennant Banner",
    "Party Backdrop",
    "Dessert Table Sign",
    "Birthday Number Poster",
    "Bachelorette Banner",
    "Memory Display Sign",
    "Directional Signs",
  ],

  "Party Games & Activities": [
    "Christmas Bingo",
    "Baby Shower Bingo",
    "Birthday Bingo",
    "Thanksgiving Bingo",
    "Christmas Trivia",
    "Thanksgiving Trivia",
    "Birthday Trivia",
    "Bridal Shower Trivia",
    "Gift Exchange Game",
    "Left-Right Gift Exchange",
    "Holiday Scavenger Hunt",
    "Birthday Treasure Hunt",
    "Escape Room Kit",
    "Christmas Charades",
    "Would You Rather Cards",
    "Bachelorette Challenge Cards",
    "New Year's Eve Games",
    "Birthday Coloring Sheets",
    "Word Search Puzzle",
    "Holiday Office Games",
  ],

  "Party Favor Products": [
    "Thank You Tags",
    "Birthday Favor Tags",
    "Baby Shower Tags",
    "Wedding Favor Tags",
    "Bridal Shower Tags",
    "Christmas Gift Tags",
    "Halloween Bag Toppers",
    "Candy Bar Wrappers",
    "Water Bottle Labels",
    "Favor Bag Toppers",
    "Party Stickers",
    "Mini Thank You Cards",
    "Popcorn Labels",
    "Graduation Tags",
    "Bachelorette Labels",
    "Gender Reveal Tags",
    "Juice Box Wrappers",
    "Treat Box Designs",
    "Cookie Packaging Labels",
    "Bubble Wand Tags",
  ],

  "Party Planning Kits": [
    "Birthday Planner",
    "Wedding Checklist",
    "Baby Shower Planner",
    "Bridal Shower Planner",
    "Christmas Party Planner",
    "Thanksgiving Hosting Planner",
    "Halloween Party Planner",
    "New Year's Eve Planner",
    "Party Budget Tracker",
    "Guest List Organizer",
    "Party Timeline Planner",
    "Shopping Checklist",
    "Food & Drink Planner",
    "Wedding Seating Planner",
    "Vendor Contact Sheet",
    "Setup Checklist",
    "Kids Activity Schedule",
    "Graduation Planner",
    "Bachelorette Itinerary",
    "Event Planning Workbook",
  ],

  "Party Table Printables": [
    "Wedding Menu Card",
    "Christmas Dinner Menu",
    "Thanksgiving Dinner Menu",
    "Place Cards",
    "Buffet Food Labels",
    "Baby Shower Food Labels",
    "Dessert Table Labels",
    "Drink Station Sign",
    "Cocktail Menu",
    "Mocktail Menu",
    "Table Number Cards",
    "Reserved Table Signs",
    "Thanksgiving Place Cards",
    "Kids Food Labels",
    "Candy Buffet Labels",
    "Hot Cocoa Bar Sign",
    "Coffee Bar Menu",
    "Napkin Ring Designs",
    "Dessert Menu Cards",
    "Table Stationery Set",
  ],

  "Party Photo Booth Kits": [
    "Birthday Photo Props",
    "Wedding Photo Props",
    "Baby Shower Props",
    "Christmas Props",
    "Halloween Props",
    "Graduation Props",
    "Bachelorette Props",
    "New Year's Eve Props",
    "Speech Bubble Props",
    "Mustache & Glasses Props",
    "Photo Booth Welcome Sign",
    "Personalized Selfie Frame",
    "Selfie Station Sign",
    "Instruction Sign",
    "Wedding Hashtag Props",
    "Gender Reveal Props",
    "First Birthday Props",
    "Retirement Props",
    "Sweet 16 Props",
    "Complete Photo Booth Kit",
  ],
};

// =====================================================
// FIELD BUILDERS (minimal)
// =====================================================

const text = (key, label, required = false) => ({
  key,
  label,
  type: "text",
  required,
});

const number = (key, label, required = false) => ({
  key,
  label,
  type: "number",
  required,
});

const date = (key, label, required = false) => ({
  key,
  label,
  type: "date",
  required,
});

const select = (key, label, options, required = false) => ({
  key,
  label,
  type: "select",
  options,
  required,
});

// =====================================================
// SHARED OPTION SETS (small, essential only)
// =====================================================

const THEMES = [
  "Classic",
  "Modern",
  "Elegant",
  "Minimal",
  "Floral",
  "Boho",
  "Rustic",
  "Luxury",
  "Vintage",
  "Rainbow",
  "Unicorn",
  "Princess",
  "Dinosaur",
  "Woodland",
  "Tropical",
  "Pastel",
  "Neon",
  "Custom",
];

const COLORS = [
  "Pastel",
  "Bright",
  "Neutral",
  "Black & Gold",
  "Pink & Gold",
  "Blue & Silver",
  "Earth Tones",
  "Rainbow",
  "Monochrome",
  "Custom",
];

const STYLES = [
  "Modern",
  "Minimal",
  "Elegant",
  "Luxury",
  "Playful",
  "Cute",
  "Vintage",
  "Boho",
  "Watercolor",
  "Cartoon",
  "Bold",
  "Custom",
];

const SIZES = [
  "5 × 7 in",
  "4 × 6 in",
  "8 × 10 in",
  "11 × 14 in",
  "18 × 24 in",
  "24 × 36 in",
  "A4",
  "A5",
  "A6",
  "US Letter",
  "Square",
  "Custom",
];

const SHAPES = [
  "Circle",
  "Square",
  "Rectangle",
  "Heart",
  "Star",
  "Oval",
  "Scalloped",
  "Custom",
];

const DIFFICULTIES = ["Easy", "Medium", "Hard"];
const AUDIENCES = ["Kids", "Teens", "Adults", "Families", "Mixed Ages"];

// =====================================================
// ESSENTIAL FIELD BUNDLES (reused across products)
// =====================================================

// Design block — every product needs these 3
const DESIGN = [
  select("theme", "Theme", THEMES),
  select("colorPalette", "Color Palette", COLORS),
  select("designStyle", "Design Style", STYLES),
];

// Print block — replaces the old image-print fields
const PRINT = [select("cardSize", "Print Size", SIZES)];

// =====================================================
// PRODUCT FIELD GENERATORS
// =====================================================

// Invitations: name + date + venue are the essentials
const invitation = (nameField, nameLabel, extra = []) => [
  text(nameField, nameLabel, true),
  date("date", "Event Date", true),
  text("venue", "Venue / Location", true),
  ...extra,
  ...DESIGN,
  ...PRINT,
];

// Signs: heading + name (essential)
const sign = (extra = []) => [
  text("headline", "Main Heading", true),
  text("name", "Name / Names"),
  ...extra,
  ...DESIGN,
  ...PRINT,
];

// Banners: banner text (essential)
const banner = (extra = []) => [
  text("bannerText", "Banner Text", true),
  text("name", "Name"),
  number("age", "Age"),
  ...extra,
  ...DESIGN,
  ...PRINT,
];

// Games: title + audience + player count
const game = (extra = []) => [
  text("gameTitle", "Game Title"),
  select("audience", "Target Audience", AUDIENCES),
  select("difficulty", "Difficulty", DIFFICULTIES),
  number("playerCount", "Number of Players"),
  ...extra,
  ...DESIGN,
];

// Favor tags/labels: name + quantity (essential)
const favor = (extra = []) => [
  text("name", "Name / Names"),
  text("message", "Personalized Message"),
  number("quantity", "Quantity", true),
  ...extra,
  ...DESIGN,
  ...PRINT,
];

// Planners: event name + date
const planner = (extra = []) => [
  text("eventName", "Event Name"),
  date("eventDate", "Event Date"),
  number("guestCount", "Guest Count"),
  ...extra,
  ...DESIGN,
];

// Table printables: heading + name
const tablePrintable = (extra = []) => [
  text("heading", "Heading / Title"),
  text("name", "Name / Names"),
  ...extra,
  ...DESIGN,
  ...PRINT,
];

// Photo props: event name + quantity
const photoProps = (extra = []) => [
  text("eventName", "Event Name"),
  text("name", "Name / Names"),
  number("numProps", "Number of Props", true),
  ...extra,
  ...DESIGN,
  ...PRINT,
];

// =====================================================
// ALL PRODUCT FIELD CONFIGURATIONS (LEAN)
// =====================================================

export const PRODUCT_FIELDS = {
  // ================= INVITATIONS =================

  "Birthday Invitation": invitation("childName", "Child's Name", [
    number("age", "Age", true),
  ]),

  "Kids Themed Birthday Invitation": invitation("childName", "Child's Name", [
    number("age", "Age", true),
    text("favoriteCharacter", "Favorite Character / Theme"),
  ]),

  "First Birthday Invitation": invitation("babyName", "Baby's Name", [
    number("age", "Age"),
  ]),

  "Wedding Invitation": invitation("coupleNames", "Couple Names"),

  "Save the Date Card": [
    text("coupleNames", "Couple Names", true),
    date("date", "Wedding Date", true),
    text("location", "Wedding Location"),
    ...DESIGN,
    ...PRINT,
  ],

  "Baby Shower Invitation": invitation("parentName", "Parent Name(s)", [
    text("babyName", "Baby Name (Optional)"),
  ]),

  "Bridal Shower Invitation": invitation("brideName", "Bride Name"),

  "Gender Reveal Invitation": invitation("parentNames", "Parent Names"),

  "Bachelorette Invitation": invitation("brideName", "Bride Name", [
    text("partyDestination", "Party Destination"),
  ]),

  "Christmas Invitation": invitation("hostName", "Host Name"),

  "Halloween Invitation": invitation("hostName", "Host Name", [
    text("costumeTheme", "Costume Theme"),
  ]),

  "Thanksgiving Invitation": invitation("hostName", "Host Name"),

  "New Year's Eve Invitation": invitation("hostName", "Host Name"),

  "Graduation Invitation": invitation("gradName", "Graduate Name", [
    text("school", "School / University"),
    number("graduationYear", "Graduation Year"),
  ]),

  "Sweet 16 Invitation": invitation("name", "Birthday Person's Name", [
    number("age", "Age", true),
  ]),

  "Quinceañera Invitation": invitation("name", "Birthday Person's Name"),

  "Engagement Invitation": invitation("coupleNames", "Couple Names"),

  "Retirement Invitation": invitation("honoreeName", "Honoree Name"),

  "Housewarming Invitation": invitation("hostName", "Host Name"),

  "Anniversary Invitation": invitation("coupleNames", "Couple Names", [
    number("anniversaryYear", "Anniversary Number"),
  ]),

  // ================= DECORATIONS =================

  "Welcome Sign": sign([text("welcomeText", "Welcome Text", true)]),

  "Birthday Banner": banner(),

  "Milestone Board": sign([
    text("childName", "Child's Name", true),
    number("age", "Age"),
  ]),

  "Baby Shower Welcome Sign": sign([
    text("parentNames", "Parent Names"),
    text("babyName", "Baby Name"),
  ]),

  "Wedding Welcome Sign": sign([text("coupleNames", "Couple Names", true)]),

  "Bridal Shower Welcome Sign": sign([text("brideName", "Bride Name", true)]),

  "Gender Reveal Welcome Sign": sign([text("parentNames", "Parent Names")]),

  "Graduation Banner": banner([
    text("graduateName", "Graduate Name"),
    number("graduationYear", "Graduation Year"),
  ]),

  "Christmas Poster": sign(),

  "Halloween Poster": sign(),

  "New Year's Eve Banner": banner([number("year", "New Year")]),

  "Cupcake Toppers": favor([number("topperCount", "Number of Toppers")]),

  "Cake Topper": favor([number("age", "Age")]),

  "Pennant Banner": banner(),

  "Party Backdrop": sign([text("eventName", "Event Name")]),

  "Dessert Table Sign": sign(),

  "Birthday Number Poster": sign([
    number("age", "Birthday Number", true),
    text("birthdayName", "Birthday Name"),
  ]),

  "Bachelorette Banner": banner([text("brideName", "Bride Name")]),

  "Memory Display Sign": sign([text("honoreeName", "Honoree Name")]),

  "Directional Signs": sign([text("destination", "Destination", true)]),

  // ================= GAMES =================

  "Christmas Bingo": game([number("numCards", "Number of Bingo Cards", true)]),

  "Baby Shower Bingo": game([
    number("numCards", "Number of Bingo Cards", true),
  ]),

  "Birthday Bingo": game([number("numCards", "Number of Bingo Cards", true)]),

  "Thanksgiving Bingo": game([
    number("numCards", "Number of Bingo Cards", true),
  ]),

  "Christmas Trivia": game([
    number("numQuestions", "Number of Questions", true),
  ]),

  "Thanksgiving Trivia": game([
    number("numQuestions", "Number of Questions", true),
  ]),

  "Birthday Trivia": game([
    number("numQuestions", "Number of Questions", true),
    text("birthdayPerson", "Birthday Person's Name"),
  ]),

  "Bridal Shower Trivia": game([
    number("numQuestions", "Number of Questions", true),
    text("brideName", "Bride Name"),
  ]),

  "Gift Exchange Game": game([number("giftCount", "Number of Gifts")]),

  "Left-Right Gift Exchange": game([
    text("storyTheme", "Story Theme", true),
    number("giftCount", "Number of Gifts"),
  ]),

  "Holiday Scavenger Hunt": game([number("numClues", "Number of Clues", true)]),

  "Birthday Treasure Hunt": game([
    number("numClues", "Number of Clues", true),
    number("birthdayAge", "Birthday Age"),
  ]),

  "Escape Room Kit": game([
    text("storyTheme", "Story Theme", true),
    number("puzzleCount", "Number of Puzzles", true),
  ]),

  "Christmas Charades": game([
    number("numCards", "Number of Charades Cards", true),
  ]),

  "Would You Rather Cards": game([
    number("numQuestions", "Number of Questions", true),
  ]),

  "Bachelorette Challenge Cards": game([
    number("numCards", "Number of Challenge Cards", true),
  ]),

  "New Year's Eve Games": game([number("numGames", "Number of Games", true)]),

  "Birthday Coloring Sheets": game([
    number("numPages", "Number of Coloring Pages", true),
    number("age", "Target Age"),
  ]),

  "Word Search Puzzle": game([
    text("puzzleTheme", "Puzzle Theme", true),
    number("wordCount", "Number of Words", true),
  ]),

  "Holiday Office Games": game([
    number("numGames", "Number of Office Games", true),
  ]),

  // ================= FAVOR PRODUCTS =================

  "Thank You Tags": favor([text("thankYouMessage", "Thank You Message", true)]),

  "Birthday Favor Tags": favor([
    text("birthdayName", "Birthday Name", true),
    number("age", "Age"),
  ]),

  "Baby Shower Tags": favor([
    text("parentNames", "Parent Names"),
    text("babyName", "Baby Name"),
  ]),

  "Wedding Favor Tags": favor([text("coupleNames", "Couple Names", true)]),

  "Bridal Shower Tags": favor([text("brideName", "Bride Name", true)]),

  "Christmas Gift Tags": favor([text("recipientName", "Recipient Name")]),

  "Halloween Bag Toppers": favor(),

  "Candy Bar Wrappers": favor([
    text("wrapperText", "Wrapper Text"),
    number("age", "Age"),
  ]),

  "Water Bottle Labels": favor([text("labelText", "Label Text")]),

  "Favor Bag Toppers": favor(),

  "Party Stickers": favor([text("stickerText", "Sticker Text", true)]),

  "Mini Thank You Cards": favor([
    text("thankYouMessage", "Thank You Message", true),
  ]),

  "Popcorn Labels": favor(),

  "Graduation Tags": favor([
    text("graduateName", "Graduate Name", true),
    number("graduationYear", "Graduation Year"),
  ]),

  "Bachelorette Labels": favor([text("brideName", "Bride Name")]),

  "Gender Reveal Tags": favor([text("parentNames", "Parent Names")]),

  "Juice Box Wrappers": favor([text("wrapperText", "Wrapper Text")]),

  "Treat Box Designs": favor(),

  "Cookie Packaging Labels": favor([text("cookieName", "Cookie Name")]),

  "Bubble Wand Tags": favor(),

  // ================= PLANNING KITS =================

  "Birthday Planner": planner([
    text("birthdayName", "Birthday Person's Name"),
    number("age", "Age"),
  ]),

  "Wedding Checklist": planner([
    text("coupleNames", "Couple Names"),
    date("weddingDate", "Wedding Date", true),
  ]),

  "Baby Shower Planner": planner([text("parentNames", "Parent Names")]),

  "Bridal Shower Planner": planner([text("brideName", "Bride Name")]),

  "Christmas Party Planner": planner(),

  "Thanksgiving Hosting Planner": planner(),

  "Halloween Party Planner": planner([text("costumeTheme", "Costume Theme")]),

  "New Year's Eve Planner": planner([
    number("celebrationYear", "Celebration Year"),
  ]),

  "Party Budget Tracker": planner([
    number("budgetAmount", "Budget Amount", true),
  ]),

  "Guest List Organizer": planner(),

  "Party Timeline Planner": planner(),

  "Shopping Checklist": planner(),

  "Food & Drink Planner": planner([number("mealCount", "Number of Dishes")]),

  "Wedding Seating Planner": planner([
    number("tableCount", "Number of Tables", true),
    number("seatsPerTable", "Seats Per Table"),
  ]),

  "Vendor Contact Sheet": planner(),

  "Setup Checklist": planner(),

  "Kids Activity Schedule": planner([number("ageGroup", "Age Group")]),

  "Graduation Planner": planner([
    text("graduateName", "Graduate Name"),
    text("school", "School / University"),
    number("graduationYear", "Graduation Year"),
  ]),

  "Bachelorette Itinerary": planner([
    text("brideName", "Bride Name"),
    text("destination", "Destination"),
  ]),

  "Event Planning Workbook": planner(),

  // ================= TABLE PRINTABLES =================

  "Wedding Menu Card": tablePrintable([
    text("coupleNames", "Couple Names", true),
    text("menuItems", "Menu Items", true),
  ]),

  "Christmas Dinner Menu": tablePrintable([
    text("menuItems", "Menu Items", true),
  ]),

  "Thanksgiving Dinner Menu": tablePrintable([
    text("menuItems", "Menu Items", true),
  ]),

  "Place Cards": tablePrintable([text("guestNames", "Guest Names", true)]),

  "Buffet Food Labels": tablePrintable([
    text("foodNames", "Food Names", true),
    number("quantity", "Number of Labels"),
  ]),

  "Baby Shower Food Labels": tablePrintable([
    text("foodNames", "Food Names", true),
    text("babyName", "Baby Name"),
  ]),

  "Dessert Table Labels": tablePrintable([
    text("dessertNames", "Dessert Names", true),
  ]),

  "Drink Station Sign": tablePrintable([
    text("stationTitle", "Station Title", true),
  ]),

  "Cocktail Menu": tablePrintable([
    text("cocktailNames", "Cocktail Names", true),
  ]),

  "Mocktail Menu": tablePrintable([
    text("mocktailNames", "Mocktail Names", true),
  ]),

  "Table Number Cards": tablePrintable([
    number("tableCount", "Number of Tables", true),
  ]),

  "Reserved Table Signs": tablePrintable([
    text("reservedFor", "Reserved For"),
    number("quantity", "Number of Signs"),
  ]),

  "Thanksgiving Place Cards": tablePrintable([
    text("guestNames", "Guest Names", true),
  ]),

  "Kids Food Labels": tablePrintable([text("foodNames", "Food Names", true)]),

  "Candy Buffet Labels": tablePrintable([
    text("candyNames", "Candy Names", true),
    number("quantity", "Number of Labels"),
  ]),

  "Hot Cocoa Bar Sign": tablePrintable([text("stationTitle", "Station Title")]),

  "Coffee Bar Menu": tablePrintable([
    text("coffeeItems", "Coffee Items", true),
  ]),

  "Napkin Ring Designs": tablePrintable([
    text("napkinText", "Napkin Ring Text"),
    number("quantity", "Quantity"),
  ]),

  "Dessert Menu Cards": tablePrintable([
    text("dessertItems", "Dessert Items", true),
  ]),

  "Table Stationery Set": tablePrintable([
    number("tableCount", "Number of Tables"),
  ]),

  // ================= PHOTO BOOTH =================

  "Birthday Photo Props": photoProps([
    number("age", "Age", true),
    text("birthdayName", "Birthday Name"),
  ]),

  "Wedding Photo Props": photoProps([
    text("coupleNames", "Couple Names", true),
  ]),

  "Baby Shower Props": photoProps([
    text("parentNames", "Parent Names"),
    text("babyName", "Baby Name"),
  ]),

  "Christmas Props": photoProps(),

  "Halloween Props": photoProps(),

  "Graduation Props": photoProps([
    text("graduateName", "Graduate Name"),
    number("graduationYear", "Graduation Year"),
  ]),

  "Bachelorette Props": photoProps([
    text("brideName", "Bride Name"),
    text("destination", "Destination"),
  ]),

  "New Year's Eve Props": photoProps([number("year", "Celebration Year")]),

  "Speech Bubble Props": photoProps([
    text("customPhrases", "Custom Phrases", true),
  ]),

  "Mustache & Glasses Props": photoProps(),

  "Photo Booth Welcome Sign": sign(),

  "Personalized Selfie Frame": photoProps([
    text("frameText", "Frame Text", true),
    text("hashtag", "Event Hashtag"),
  ]),

  "Selfie Station Sign": sign([text("hashtag", "Event Hashtag")]),

  "Instruction Sign": sign(),

  "Wedding Hashtag Props": photoProps([
    text("coupleNames", "Couple Names", true),
    text("weddingHashtag", "Wedding Hashtag", true),
  ]),

  "Gender Reveal Props": photoProps([text("parentNames", "Parent Names")]),

  "First Birthday Props": photoProps([
    text("babyName", "Baby Name", true),
    number("age", "Age"),
  ]),

  "Retirement Props": photoProps([text("honoreeName", "Honoree Name", true)]),

  "Sweet 16 Props": photoProps([
    text("birthdayName", "Birthday Name", true),
    number("age", "Age"),
  ]),

  "Complete Photo Booth Kit": photoProps([
    number("quantity", "Total Quantity"),
  ]),
};

// =====================================================
// CATEGORY ICONS
// =====================================================

export const CATEGORY_ICON = {
  "Party Invitations": FileText,
  "Party Decorations": Sparkles,
  "Party Games & Activities": Gamepad2,
  "Party Favor Products": Gift,
  "Party Planning Kits": CalendarRange,
  "Party Table Printables": Utensils,
  "Party Photo Booth Kits": Camera,
};

// =====================================================
// PRODUCT ICONS
// =====================================================

export const PRODUCT_ICON_MAP = {
  "Birthday Invitation": Cake,
  "Kids Themed Birthday Invitation": PartyPopper,
  "First Birthday Invitation": Baby,
  "Wedding Invitation": Church,
  "Save the Date Card": Calendar,
  "Baby Shower Invitation": Baby,
  "Bridal Shower Invitation": Crown,
  "Gender Reveal Invitation": Sparkles,
  "Bachelorette Invitation": Wine,
  "Christmas Invitation": Snowflake,
  "Halloween Invitation": Ghost,
  "Thanksgiving Invitation": Utensils,
  "New Year's Eve Invitation": Wine,
  "Graduation Invitation": GraduationCap,
  "Sweet 16 Invitation": Cake,
  "Quinceañera Invitation": Crown,
  "Engagement Invitation": Gem,
  "Retirement Invitation": Coffee,
  "Housewarming Invitation": DoorOpen,
  "Anniversary Invitation": Heart,

  "Welcome Sign": Flag,
  "Birthday Banner": Flag,
  "Milestone Board": Star,
  "Cupcake Toppers": IceCream,
  "Cake Topper": Cake,
  "Pennant Banner": Flag,
  "Party Backdrop": LayoutPanelTop,
  "Directional Signs": ArrowRight,

  "Christmas Bingo": Dice5,
  "Christmas Trivia": HelpCircle,
  "Holiday Scavenger Hunt": Search,
  "Escape Room Kit": DoorOpen,
  "Would You Rather Cards": MessageCircle,
  "Bachelorette Challenge Cards": Award,
  "Word Search Puzzle": Blocks,

  "Thank You Tags": Tag,
  "Party Stickers": Star,
  "Candy Bar Wrappers": Cookie,
  "Water Bottle Labels": Coffee,

  "Birthday Planner": Notebook,
  "Wedding Checklist": ClipboardList,
  "Party Budget Tracker": Wallet,
  "Guest List Organizer": Users,

  "Wedding Menu Card": Utensils,
  "Place Cards": Mail,
  "Buffet Food Labels": Tag,
  "Cocktail Menu": Wine,

  "Birthday Photo Props": Camera,
  "Speech Bubble Props": MessageSquare,
  "Complete Photo Booth Kit": Camera,
};

// =====================================================
// HELPERS
// =====================================================

export const getProductIcon = (product, categoryName) =>
  PRODUCT_ICON_MAP[product] || CATEGORY_ICON[categoryName] || Sparkles;

export const getFieldIcon = (field) => {
  const k = (field.key || "").toLowerCase();

  if (
    k.includes("venue") ||
    k.includes("location") ||
    k.includes("address") ||
    k.includes("destination")
  )
    return MapPin;

  if (k.includes("date")) return Calendar;
  if (k.includes("time") || k.includes("duration")) return Clock;
  if (k.includes("name")) return User;
  if (k.includes("age")) return Cake;

  if (k.includes("theme") || k.includes("style") || k.includes("color"))
    return Palette;

  if (k.includes("ratio") || k.includes("size") || k.includes("dimension"))
    return Maximize2;

  if (k.includes("page")) return Layers;
  if (k.includes("budget")) return Wallet;

  if (
    k.includes("guest") ||
    k.includes("player") ||
    k.includes("team") ||
    k.includes("audience")
  )
    return Users;

  if (
    k.includes("count") ||
    k.includes("quantity") ||
    k.includes("num") ||
    k.includes("puzzle") ||
    k.includes("word")
  )
    return ListChecks;

  if (k.includes("clue")) return HelpCircle;
  if (k.includes("difficulty")) return Award;

  if (field.type === "select") return Palette;
  return User;
};

// =====================================================
// VALIDATION HELPERS
// =====================================================

export const getProductFields = (productName) =>
  PRODUCT_FIELDS[productName] || [];

export const getRequiredFields = (productName) =>
  getProductFields(productName).filter((field) => field.required);

export const getOptionalFields = (productName) =>
  getProductFields(productName).filter((field) => !field.required);

export const getProductCategory = (productName) =>
  Object.keys(PRODUCTS_BY_CATEGORY).find((category) =>
    PRODUCTS_BY_CATEGORY[category].includes(productName),
  ) || null;

export const getAllProducts = () => Object.values(PRODUCTS_BY_CATEGORY).flat();

export const getMissingProductFields = () =>
  getAllProducts().filter(
    (product) =>
      !Array.isArray(PRODUCT_FIELDS[product]) ||
      PRODUCT_FIELDS[product].length === 0,
  );

export const validateProductData = (productName, values = {}) => {
  const errors = {};

  if (!PRODUCT_FIELDS[productName]) {
    return { valid: false, errors: { product: "Unknown product" } };
  }

  for (const field of getRequiredFields(productName)) {
    const value = values[field.key];

    if (
      value === undefined ||
      value === null ||
      (typeof value === "string" && !value.trim()) ||
      (Array.isArray(value) && value.length === 0)
    ) {
      errors[field.key] = `${field.label} is required`;
    }
  }

  return { valid: Object.keys(errors).length === 0, errors };
};

// =====================================================
// DATA COVERAGE
// =====================================================

export const PRODUCT_DATA_STATS = {
  totalCategories: CATEGORIES.length,
  totalProducts: getAllProducts().length,
  configuredProducts: getAllProducts().filter(
    (product) =>
      Array.isArray(PRODUCT_FIELDS[product]) &&
      PRODUCT_FIELDS[product].length > 0,
  ).length,
  missingProducts: getMissingProductFields(),
};

// =====================================================
// OUTPUT FORMAT — PDF vs IMAGE
// =====================================================

// Products that produce multi-page PDFs
const PDF_PRODUCT_NAMES = [
  // Games
  "Christmas Bingo",
  "Baby Shower Bingo",
  "Birthday Bingo",
  "Thanksgiving Bingo",
  "Christmas Trivia",
  "Thanksgiving Trivia",
  "Birthday Trivia",
  "Bridal Shower Trivia",
  "Gift Exchange Game",
  "Left-Right Gift Exchange",
  "Holiday Scavenger Hunt",
  "Birthday Treasure Hunt",
  "Escape Room Kit",
  "Christmas Charades",
  "Would You Rather Cards",
  "Bachelorette Challenge Cards",
  "New Year's Eve Games",
  "Birthday Coloring Sheets",
  "Word Search Puzzle",
  "Holiday Office Games",

  // Multi-card table printables
  "Place Cards",
  "Thanksgiving Place Cards",
  "Buffet Food Labels",
  "Dessert Table Labels",
  "Baby Shower Food Labels",
  "Kids Food Labels",
  "Candy Buffet Labels",
  "Table Number Cards",
  "Reserved Table Signs",
  "Napkin Ring Designs",

  // Planning kits
  "Birthday Planner",
  "Wedding Checklist",
  "Baby Shower Planner",
  "Bridal Shower Planner",
  "Christmas Party Planner",
  "Thanksgiving Hosting Planner",
  "Halloween Party Planner",
  "New Year's Eve Planner",
  "Party Budget Tracker",
  "Guest List Organizer",
  "Party Timeline Planner",
  "Shopping Checklist",
  "Food & Drink Planner",
  "Wedding Seating Planner",
  "Vendor Contact Sheet",
  "Setup Checklist",
  "Kids Activity Schedule",
  "Graduation Planner",
  "Bachelorette Itinerary",
  "Event Planning Workbook",
];

// Sanity check — warn on any typo in PDF_PRODUCT_NAMES
const _allProductNames = new Set(Object.values(PRODUCTS_BY_CATEGORY).flat());
const _missing = PDF_PRODUCT_NAMES.filter((n) => !_allProductNames.has(n));
if (_missing.length > 0) {
  // eslint-disable-next-line no-console
  console.warn("[productGeneratorData] Unknown PDF products:", _missing);
}

export const PDF_PRODUCTS = new Set(PDF_PRODUCT_NAMES);
export const IMAGE_PRODUCTS = new Set(
  [..._allProductNames].filter((n) => !PDF_PRODUCTS.has(n)),
);

export const getOutputFormat = (productName) => {
  const normalized = String(productName || "").trim();
  return PDF_PRODUCTS.has(normalized) ? "PDF" : "Image";
};

export const isPdfProduct = (productName) =>
  getOutputFormat(productName) === "PDF";
