# Sip & Smoke Tracker Card

The **Sip and Smoke Tracker Card** is a custom Home Assistant Lovelace card designed to enhance your experience of tracking consumables such as whiskies, wines, rums, and cigars. The card dynamically fetches your configured devices, aggregates their data, and displays statistics and featured cards for quick insight.

## Dependencies

This custom card depends on the **[sip-and-smoke-tracker-consumables-card](https://github.com/ZCZGit/sip-and-smoke-tracker-consumables-card)**. 

Make sure to have the `sip-and-smoke-tracker-consumables-card` installed and configured correctly in your Home Assistant setup before using this card. The `sip-and-smoke-tracker-consumables-card` provides the underlying data and entities required for aggregating and displaying consumable statistics.

This custom card also requires **[sip-and-smoke-tracker](https://github.com/ZCZGit/sip-and-smoke-tracker)** integration to function properly. The integration is responsible for providing device data, such as entities and attributes, which this card uses to display information dynamically.

### Optional Extras

This custom card can nest the **[sip-and-smoke-tracker-amount-changer](https://github.com/ZCZGit/sip-and-smoke-tracker-amount-changer)** if include_updater: true and card is also installed in HA. 

## Features

- **Dynamic Device Rendering**: Automatically detects and renders devices created by **[sip-and-smoke-tracker](https://github.com/ZCZGit/sip-and-smoke-tracker)**.
- **Aggregated Statistics**: Displays most popular attributes (e.g., regions, countries, types) for each consumable type which are retrieved from the cards nested.
- **Featured Card**: Automatically highlights a featured device based on its recent addition, or allows manual overrides via configuration.
- **Expandable Cards**: Nested cards for detailed views of individual devices.
- **Flexible Configuration**: Supports a wide range of consumables (whiskies, wines, rums, cigars) with tailored statistics for each.
- **Updater Integration**: Support for the "Sip and Smoke Updater Card" to modify and refresh consumable quantities dynamically.

## Installation

### Step 1: Add the Custom Card
1. Place the `sip-and-smoke-card.js` file into your Home Assistant `www` directory.
2. Add the card to your Lovelace resources. Navigate to **Configuration** > **Dashboards** > **Resources**, and add the file with the following URL:

`/local/sip-and-smoke-card.js`

Ensure the resource type is set to **JavaScript Module**.

### Step 2: Install Required Dependencies
As stated in the dependencies section above.

### Step 3: Configure the Card in Lovelace
Add the custom card to your Lovelace dashboard via YAML.

#### Example Configuration
```yaml
type: custom:sip-and-smoke-card
title: My Whisky Collection
consumable_type: whisky
image: /local/consumable_images/generic_whisky.png
include_updater: true
```

## Configuration Options

| Option          | Type      | Description                                                                                         |
|------------------|-----------|-----------------------------------------------------------------------------------------------------|
| `type`          | `string`  | **Required**. Must be `custom:sip-and-smoke-card`.                                                  |
| `title`         | `string`  | **Optional**. The title of the card.                                                               |
| `consumable_type`| `string`  | **Required**. The type of consumables to display (e.g., `whisky`, `wine`, `rum`, `cigar`).          |
| `image`         | `string`  | **Optional**. URL of an image to display in the card header.                                       |
| `featured_card` | `string`  | **Optional**. Name of the device to highlight as the featured card. Overwrites recently added      |
| `is_open`       | `boolean` | **Optional**. Mark the featured card as "open" (e.g., for open bottles). Default is `false`. If true a "The bottle is open. dive in" statement will appear on the card.        |
| `is_new`        | `boolean` | **Optional**. Mark the featured card as "newly added". Default is `false` unless auto populated. If true a "Recently added!" statement will appear on the card.                        |
| `humidity_sensor`| `string` | **Optional**. Used when humidor has a humidty sensor in HA. If card type is cigar then add an icon and reading to the nested cards. `false`.    |
| `include_updater`| `boolean` | **Optional**. If `true`, nests the "Sip and Smoke Updater Card" to dynamically update values.      |

## Features in Detail

### 1. Dynamic Device Rendering
The card automatically detects all devices associated with the configured `consumable_type` (e.g., whiskies, wines). Devices are filtered and displayed dynamically, ensuring the card is always up-to-date with your Home Assistant state.

### 2. Aggregated Statistics
View key insights about your collection, including:
- Most popular regions
- Most frequently consumed types
- Top countries and distilleries

Statistics are specific to the consumable type. For example:
- **Whisky**: Displays alcohol type, region, country, and distillery insights.
- **Cigar**: Highlights vitola, strength, country, and ring gauge.

### 3. Featured Card
The featured card can be manually set via the `featured_card` configuration option or automatically selected based on the most recently added device.

### 4. Expandable Nested Cards
Each device is displayed as a nested card, which can be expanded for detailed information such as alcohol content, region, or additional attributes.

### 5. Updater Card Integration
If the `include_updater` option is set to `true`, the "Sip and Smoke Updater Card" will be appended to the list of rendered cards. This feature enables:
- Selection of any registered devices of the `consumable_type` to modify their values.
- Removal of devices with amounts set to `0`, as the card will refresh and re-fetch devices dynamically.
- Note: When nested, the updater card resets the selected device to "Select Device" after an update and refresh cycle.

### Key Methods
- `generateStatistics()`: Aggregates and displays statistics specific to the consumable type.
- `createFeaturedCard()`: Dynamically creates the featured card UI.
- `fetchDevices()`: Fetches and filters devices based on the `consumable_type` configuration.
- `renderNestedCards(container)`: Renders detailed views for each device, including the updater card if applicable.


