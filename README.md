# NextMeal

### Inventory-Driven Meal Recommendation & Food Waste Reduction

NextMeal is a full-stack web application that helps people make better
use of the ingredients they already have. Users can manage household
food inventory, track quantities and expiration dates, and receive
recipe recommendations ranked by ingredient availability and expiration
urgency.

Instead of treating recipe discovery and pantry management as separate
tasks, NextMeal connects them: it turns a user's current inventory into
practical meal suggestions and supports the follow-through with shopping
lists, favorites, and inventory updates.

------------------------------------------------------------------------

## The Problem

Household food waste is often linked to over-purchasing, limited meal
planning, and forgetting which ingredients are available or when they
expire. Recipe applications may suggest meals without considering a
user's actual stock, while inventory tools may track items without
helping users decide what to cook before those items expire.

NextMeal addresses this gap by combining:

-   **User-managed inventory** with quantities, measurement units, and
    expiration dates.
-   **Inventory-aware recipe matching** based on the quantities a recipe
    requires.
-   **Expiration-aware ranking** that gives priority to recipes using
    ingredients nearing their expiration dates.
-   **Practical follow-up actions** through the "Use it" workflow and
    shopping list.

The goal is to make everyday meal decisions easier while helping users
reduce avoidable food waste.

## Core Features

### Inventory Management

-   Add, edit, search, filter, and remove inventory items.
-   Record ingredient quantities, measurement units, expiration dates,
    and optional minimum-stock thresholds.
-   View inventory status, including low-stock and expiration-related
    information.
-   Support ingredient-specific base units and unit conversions for
    consistent quantity comparisons.

### Meal Recommendations

-   Generate recipe suggestions using the user's current inventory.
-   Display ingredient match percentages and identify available and
    missing ingredients.
-   Highlight recipes that can use ingredients nearing expiration.
-   Sort recommendations by expiration urgency and then by ingredient
    match score.
-   Use **"Use it"** to deduct the recipe's required ingredient
    quantities from inventory.

### Recipes

-   Browse recipe details, including ingredients, quantities,
    preparation time, servings, and instructions.
-   Create and manage user-owned recipes.
-   Apply role- and ownership-based permissions to recipe editing and
    deletion.
-   Organize recipes using categories, cuisines, and cooking methods.

### Shopping List

-   Add, edit, check off, and remove shopping-list items.
-   Surface ingredients that are running low or are expired/expiring and
    may need replenishment.
-   Add checked-off shopping items to the user's inventory.

### Favorites

-   Save recipes to a personal favorites list.
-   View and manage saved recipes.

### Notifications

-   Display in-app notifications, including expiration and low-stock
    alerts.
-   Mark notifications as read and remove them.
-   Generate or update expiration notifications when inventory items are
    added or changed.
-   Respect the user's notification preference for expiration alerts.

### Admin Portal

-   Provide an administrative dashboard and system overview.
-   Manage users and roles.
-   Manage recipes, ingredients, units, categories, cuisines, and
    cooking methods.
-   Review inventory and shopping-list information across users.

### Progressive Web App (PWA)

-   Provide an installable web-app experience where supported by the
    browser.
-   Detect online/offline status and display an offline fallback page.
-   Detect available service-worker updates and provide an update flow.

> **Offline note:** The project includes PWA installation and
> offline-fallback support. Full offline data synchronization is
> identified as future work; the application should not be considered to
> provide complete offline-first inventory synchronization yet.

------------------------------------------------------------------------

## How the Recommendation Engine Works

The recommendation engine is a rule-based algorithm implemented in the
Laravel backend. It compares recipe requirements with the user's
inventory and incorporates expiration urgency into the ranking. It does
not currently rely on machine learning or generative AI.

### 1. Ingredient quantity matching

Recipe quantities and inventory quantities are converted to each
ingredient's base unit before comparison. Inventory quantities are
aggregated by ingredient, and expired inventory items are excluded from
recommendation matching.

For each required ingredient (j), the match ratio is:

\[ m_j =
`\min`{=tex}`\left`{=tex}(`\frac{\text{available quantity}_j}{\text{required quantity}_j}`{=tex},
1`\right`{=tex}) \]

The overall recipe match score is the average across its required
ingredients:

\[ MS = `\frac{\sum_{j=1}^{n}m_j}{n}`{=tex}`\times 100`{=tex} \]

This produces a percentage that reflects both fully and partially
available recipe ingredients.

### 2. Expiration urgency

The engine uses a configurable expiration reference window. The default
window in the project is **3 days**.

Let: - (h) be the expiration reference window in days. - (d_j) be the
number of days remaining until ingredient (j) expires.

The urgency score is:

\[ u_j =
```{=tex}
\begin{cases}
\frac{h-d_j}{h}, & 0 \leq d_j \leq h\\
0, & \text{otherwise}
\end{cases}
```
\]

Ingredients expiring sooner receive a higher urgency score. Ingredients
expiring today are included in the urgency window.

### 3. Filtering and ranking

-   Recipes with no matched ingredients and a zero match score are
    excluded.
-   Recipes that use ingredients within the expiration window are
    prioritized.
-   Within those groups, recipes are ranked by match score in descending
    order.

This approach makes recommendations actionable: it considers not only
what the user has, but also which ingredients should be used soon.

------------------------------------------------------------------------

## Application Workflow

1.  The user records ingredients, quantities, units, and expiration
    dates in their inventory.
2.  The frontend communicates with the Laravel API to validate and
    persist user data.
3.  The recommendation service compares the inventory with recipe
    ingredient requirements and calculates match and expiration scores.
4.  The frontend displays the ranked recipe suggestions and the
    ingredients available or still needed.
5.  When the user selects **"Use it,"** the required quantities are
    deducted from inventory. The backend applies deductions in
    expiration-date order (earliest-expiring items first).
6.  Users can add shopping-list items; checking an item off adds the
    purchased quantity to inventory.

------------------------------------------------------------------------

## System Architecture

NextMeal follows a modular, client-server architecture:

``` text
                  User
                    |
                    v
          Next.js Web Application
                    |
                    v
              Laravel API
                    |
          +---------+----------+
          |         |          |
          v         v          v
      Auth &     Business   Admin & User
      Access      Logic      Operations
          |         |
          +----+----+
               |
               v
            Database
```

The frontend is responsible for the user interface, navigation, and API
communication. The Laravel backend exposes RESTful endpoints, enforces
authentication and permissions, manages application data, and contains
the recommendation and notification logic. The relational database
stores user, inventory, recipe, shopping-list, favorite, and
notification data.

### Main Application Modules

-   **Frontend:** Next.js pages, shared contexts, API utilities, and PWA
    functionality.
-   **Backend API:** Authentication, inventory, recipes,
    recommendations, shopping lists, favorites, notifications, reference
    data, and administrative endpoints.
-   **Business logic:** Recipe scoring, unit conversion, inventory
    aggregation, recipe-use deductions, and expiration notification
    handling.
-   **Database:** Relational entities and migrations for user-specific
    and shared application data.

------------------------------------------------------------------------

## Technology Stack

  -----------------------------------------------------------------------
  Area                                Technologies
  ----------------------------------- -----------------------------------
  Frontend                            Next.js , React, TypeScript

  Styling                             Tailwind CSS

  Backend                             PHP , Laravel

  API authentication                  Laravel Sanctum

  Database                            MariaDB (relational schema and
                                      Laravel migrations)

  PWA                                 `@ducanh2912/next-pwa`,
                                      Workbox/service-worker support

------------------------------------------------------------------------


## User Roles and Access

NextMeal supports role-based access:

-   **User:** Manages their own inventory, shopping list, favorites,
    profile, and user-created recipes.
-   **Admin:** Has access to administrative functions for managing users
    and shared application content, including recipes, ingredients,
    units, categories, cuisines, and cooking methods.
-   **System-owned content:** System recipes and reference data are
    managed separately from user-created content.

Protected API endpoints use Laravel Sanctum authentication. Backend
authorization and ownership checks are used to restrict access to
user-specific records and privileged administrative operations.

------------------------------------------------------------------------

## Engineering Challenges & Solutions

  -----------------------------------------------------------------------
  Challenge                           Approach
  ----------------------------------- -----------------------------------
  Displaying protected backend images Implemented an authenticated image
  in the frontend                     component and a Next.js
                                      `/api/image-proxy` route rather
                                      than relying on direct public image
                                      rendering.

  Date-only values shifting across    Added
  browser time zones                  `parseISODateToLocalMidnight()` to
                                      interpret `YYYY-MM-DD` values at
                                      local midnight.

  Inconsistent image URL naming       Normalized backend `snake_case`
  between API and UI                  fields to the frontend's
                                      `camelCase` representation in the
                                      API/UI layer.

  Comparing inventory and recipe      Used ingredient base units and
  quantities                          conversion logic so quantities
                                      entered in different supported
                                      units can be compared consistently.

------------------------------------------------------------------------

## Project Scope

NextMeal was developed as a university capstone project to demonstrate
the design and implementation of an inventory-driven meal recommendation
system. The repository contains the Next.js frontend and Laravel backend
implementations. Features and future improvements described above
distinguish implemented functionality from planned enhancements.
