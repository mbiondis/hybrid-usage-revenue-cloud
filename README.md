# Hybrid Usage Add-on

This package implements the logic needed to create products with a Hybrid Usage sell model. This is common in software companies that sell allowances for API calls, platform logins, or payment providers that process transactions and charge for overspend. These units are each tracked by individual Usage Meters, which are then added together using the Usage Accumulator. The latter contains the information of the allowance (referred to as Credits) and applies an overage surcharge if the credit limit is exceeded.

## Setup

### Assign Permission Set

All users need to have the following Permission Set Licenses already assigned:

- Salesforce CPQ License

All users need to have the following Permission Sets already assigned:

- Salesforce CPQ User (or Admin)
- Salesforce Billing Admin

Then, assign the Hybrid Usage Permission Set:

- Go to **Setup**
- In the Quick Find box, type `Users`
- Click on your user
- Scroll to **Permission Set Assignments**, and click **Edit Assignments**
- Add **Hybrid Usage - Management** to **Enabled Permission Sets**
- Click **Save**

### Add your Unit of Measure (global value set)

- Go to **Setup**
- In the Quick Find box, type `Picklist Value Sets`
- Click on **Unit of Measure**
- Under **Values**, click **New**
- Add your preferred values. These are used in the examples:

```
Quantity
Amount
```

- Check **Add the new picklist values to all Record Types that use this Global Value Set**

### Add your Unit of Measure (Consumption Schedule picklist)

- Go to **Setup**
- Open the **Object Manager** tab
- In the **Quick Find** box, type `Consumption Schedule`
- Click on **Consumption Schedule**
- On the left menu, click **Fields & Relationships**
- In the Quick Find box, type Unit of Measure
- Click on **Unit of Measure** (API name UnitOfMeasure)
- Under **Unit of Measure Picklist Values**, click **New**
- Add your preferred values. These are used in the examples:

```
Quantity
Amount
```

### Configure the Salesforce CPQ package

- Go to **Setup**
- In the Quick Find box, type `Installed Packages`
- Next to **Salesforce CPQ**, click **Configure**
- Open the **Plugins** tab
  - In **Quote Calculator Plugin**, type HybridUsageAddOn
- Open the Pricing and Calculation tab
  - Check **Enable Usage Based Pricing**
  - Check **Quote Line Edits for Usage Based Pricing**

Create the Custom Script record

This record applies logic in Salesforce CPQ’s Quote Line Editor that initializes a product for the Usage with Credits scenario.

- Click the **App Launcher**
- Type `Custom Scripts`
- Click **Custom Scripts**
- Click **New**
- Fill out the parameters
  - Script Name: `HybridUsageAddOn`
  - Code: _Copy from GitHub repository_
  - Quote Fields:
    - IncludedUsageCredits\_\_c
    - UsageTerm\_\_c
    - CarryoverFactor\_\_c
    - CarryoverLimit\_\_c
    - OverageSurcharge\_\_c
    - CreditCarryoverType\_\_c
    - CurrencyIsoCode
    - SBQQ**EffectiveSubscriptionTerm**c
    - SBQQ**Quantity**c
    - SBQQ**ProrateMultiplier**c
    - SBQQ**NetPrice**c
- Click **Save**

### Add the New (Hybrid Usage) button (Product list view)

- Go to **Setup**
- Open the **Object Manager** tab
- In the **Quick Find** box, type `Product`
- Click on **Product** (API name Product2)
- On the left menu, click **List View Button Layout**
- Click the chevron 🔽 and click **Edit**
- Under Custom Buttons, move **New (Hybrid Usage)** to **Selected Buttons**
- Click **Save**

### (Optional) Assign the Page Layouts

The package includes page layouts for the following objects:

- Product
- Order
- Order Product
- Usage Summary
- Product Option
- Quote Line

For each, use these steps, replacing sObject with the objects above:

- Go to **Setup**
- Open the **Object Manager** tab
- In the **Quick Find** box, type `sObject`
- Click on **sObject**
- On the left menu, click **Page Layouts**
- Click **Page Layout Assignments**
- Click **Edit Assignment**
- Click next to your Profile, and then in **Page Layout to Use** select `Hybrid Usage`

### (Optional) Assign the Compact Layouts

The package includes compact layouts for the following objects:

- Order Product
- Usage
- Usage Summary

For each, use these steps, replacing sObject with the objects above:

- Go to **Setup**
- Open the **Object Manager** tab
- In the **Quick Find** box, type `sObject`
- Click on **sObject**
- On the left menu, click **Compact Layouts**
- Click **Compact Layout Assignments**
- Click **Edit Assignment**
- Select **Hybrid Usage**
- Click **Save**
