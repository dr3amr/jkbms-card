# JK-BMS Lovelace Card for Home Assistant (v1.0.0)

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-41BDF5.svg)](https://github.com/hacs/default)
[![version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/)
![License](https://img.shields.io/badge/license-MIT-green.svg)

A feature-rich, highly customizable Home Assistant Lovelace card designed to display detailed status, telemetry, cell voltages, and control switches for **JK-BMS** devices. Designed to work seamlessly with the popular [`syssi/esphome-jk-bms`](https://github.com/syssi/esphome-jk-bms) ESPHome component.

---

## Preview

![JK-BMS Card Preview](screenshot.png)
*(Replace `screenshot.png` with an actual screenshot of your card running in Home Assistant)*

---

## Features

- **4 Modular Sections**: Toggle and configure visibility for each section independently.
- **Compact Spacing**: Optimized layout with reduced padding when adjacent sections are enabled.
- **Dynamic Entity Prefixing**: Set a single `prefix` (e.g., `jk-bms`) to automatically detect and map standard JK-BMS entity suffixes.
- **Full Customization**:
  - Customize font sizes per section.
  - Configure colors for primary accents, time highlights, max/min cell voltage highlights, and card background.
  - Set decimal places individually for Section 2 headers and Section 3 cell voltages.
  - Align Section 2 and Section 3 cell grid items (Center, Space Between, Left, Right).
  - Auto-convert cell internal resistance to **mΩ**.
- **Visual Card Editor**: Complete UI configuration support—no manual YAML editing required.
- **Reorderable Grid Items**: Interactively add, remove, reorder, and override entities in Section 2.
- **Interactive Entities**: Click any value to open its Home Assistant `more-info` dialog or toggle control switches directly.

---

## Installation

### Method 1: HACS (Recommended)

1. Ensure **HACS** is installed on your Home Assistant instance.
2. Go to **HACS** > **Frontend**.
3. Click the 3 dots in the top right corner and select **Custom repositories**.
4. Add the repository URL: `https://github.com/dr3amr/jk-bms-card`
5. Category: **Dashboard** (or **Plugin**).
6. Click **Add**, then find **JK-BMS Lovelace Card** and click **Download**.
7. Reload your browser page.

### Method 2: Manual Installation

1. Download `jk-bms-card.js` from the latest release.
2. Copy `jk-bms-card.js` into your Home Assistant `<config>/www/` folder.
3. In Home Assistant, go to **Settings** > **Dashboards** > **3 dots (top right)** > **Resources**.
4. Add Resource:
   - **Url**: `/local/jk-bms-card.js`
   - **Resource Type**: `JavaScript Module`
5. Refresh your browser.

---

## Card Overview & Sections

1. **Section 1 (Header Status)**: Displays system total runtime, active charging, discharging, and balancing state[cite: 1].
2. **Section 2 (Grid Data)**: Large voltage/current display header with customizable multi-column metric items[cite: 1].
3. **Section 3 (Cell Details)**: Displays individual cell voltages and internal resistances with dynamic highest/lowest voltage highlighting[cite: 1].
4. **Section 4 (Control Switches)**: Interactive switches to toggle balancing, charging, and discharging modes[cite: 1].

## Dashboard Configuration

### Using Visual UI Editor (Recommended)

The card includes a visual editor accessible via the dashboard edit interface[cite: 1]:
- General Settings: Define Device Prefix and Cell Count[cite: 1].
- Formatting & Units: Configure decimal places for Section 2 headers & Section 3 cell voltages, and toggle mΩ internal resistance conversion[cite: 1].
- Section Font Sizes: Adjust pixel sizes individually across all four sections[cite: 1].
- Section Visibility: Enable or disable sections and headers independently[cite: 1].
- Styling & Alignment:
  - Color pickers for Section Background Color, Primary Font Color, Time Font Color, Max Cell Voltage Color, and Min Cell Voltage Color[cite: 1].
  - Alignment selectors for Section 2 and Section 3[cite: 1].
  - Checkboxes for transparent section background and custom value coloring[cite: 1].
- Section 2 Display Items:
  - Click + Add Item to append a new metric[cite: 1].
  - Use ▲ / ▼ buttons to reorder metrics[cite: 1].
  - Set custom labels, suffixes, units, decimals, column assignment, or override entities[cite: 1].

### YAML Configuration Example

Below is the complete list of available YAML options for the card[cite: 1]:

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `type` | `string` | **Required** | Must be `custom:jk-bms-card`[cite: 1]. |
| `prefix` | `string` | `jk-bms` | Prefix applied to automatically construct entity IDs[cite: 1]. |
| `cell_count` | `number` | `16` | Number of battery cells to display in Section 3[cite: 1]. |
| `show_section_1` | `boolean` | `true` | Show or hide Section 1[cite: 1]. |
| `show_section_2` | `boolean` | `true` | Show or hide Section 2[cite: 1]. |
| `show_section_2_header` | `boolean` | `true` | Show or hide the main Voltage & Amperage header in Section 2[cite: 1]. |
| `show_section_3` | `boolean` | `true` | Show or hide Section 3[cite: 1]. |
| `show_cells_title` | `boolean` | `true` | Show or hide the "Cells" title in Section 3[cite: 1]. |
| `show_section_4` | `boolean` | `true` | Show or hide Section 4[cite: 1]. |
| `use_mohm_res` | `boolean` | `false` | Convert cell resistance to mΩ with 0 decimal places[cite: 1]. |
| `sec2_header_decimals` | `number` | `1` | Decimal places for main Voltage and Current in Section 2[cite: 1]. |
| `sec3_decimals` | `number` | `1` | Decimal places for cell voltages in Section 3[cite: 1]. |
| `sec2_align` | `string` | `center` | Alignment for Section 2 rows (`center`, `space-between`, `flex-start`, `flex-end`)[cite: 1]. |
| `sec3_align` | `string` | `center` | Alignment for Section 3 cell rows (`center`, `space-between`, `flex-start`, `flex-end`)[cite: 1]. |
| `s1_font_size` | `number` | `15` | Font size in pixels for Section 1[cite: 1]. |
| `s2_header_font_size` | `number` | `28` | Font size in pixels for Section 2 main values[cite: 1]. |
| `s2_font_size` | `number` | `14` | Font size in pixels for Section 2 labels[cite: 1]. |
| `s3_font_size` | `number` | `14` | Font size in pixels for Section 3[cite: 1]. |
| `s4_font_size` | `number` | `15` | Font size in pixels for Section 4[cite: 1]. |
| `use_primary_color_sec2` | `boolean` | `false` | Use Primary Font Color for Section 2 data values[cite: 1]. |
| `remove_section_bg` | `boolean` | `false` | Set section backgrounds to transparent[cite: 1]. |
| `section_bg_color` | `string` | `#121212` | Background color for sections[cite: 1]. |
| `primary_font_color` | `string` | `#2e7d32` | Accent color for main values and status[cite: 1]. |
| `time_font_color` | `string` | `#2196f3` | Accent color for total runtime[cite: 1]. |
| `max_cell_color` | `string` | `#2196f3` | Color highlight for highest cell voltage[cite: 1]. |
| `min_cell_color` | `string` | `#f44336` | Color highlight for lowest cell voltage[cite: 1]. |
| `sec2_items` | `list` | *Default set* | Array of configurable metrics for Section 2[cite: 1]. |

### Section 2 Item Structure

Each item in the `sec2_items` array supports the following keys[cite: 1]:

```yaml
sec2_items:
  - label: "Battery Power:"
    entity_suffix: "power"
    unit: "W"
    decimals: 1
    column: 1
    entity: "sensor.custom_override_power" # Optional entity override
```

### Example YAML Configuration

```yaml
type: custom:jk-bms-card
prefix: jk_bms
cell_count: 16
show_section_1: true
show_section_2: true
show_section_2_header: true
show_section_3: true
show_section_4: true
use_mohm_res: true
sec2_header_decimals: 1
sec3_decimals: 3
sec2_align: space-between
sec3_align: space-between
s1_font_size: 15
s2_header_font_size: 28
s2_font_size: 14
s3_font_size: 14
s4_font_size: 15
use_primary_color_sec2: false
remove_section_bg: false
section_bg_color: "#121212"
primary_font_color: "#2e7d32"
time_font_color: "#2196f3"
max_cell_color: "#2196f3"
min_cell_color: "#f44336"
```

## License

This project is open-source under the MIT License.
