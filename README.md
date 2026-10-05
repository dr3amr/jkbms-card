# JK-BMS Lovelace Card for Home Assistant

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-41BDF5.svg)](https://github.com/hacs/default)
[![version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/)
![License](https://img.shields.io/badge/license-MIT-green.svg)

A feature-rich, highly customizable Home Assistant Lovelace card designed to display detailed status, telemetry, cell voltages, and control switches for **JK-BMS** devices. Designed to work seamlessly with the popular [`syssi/esphome-jk-bms`](https://github.com/syssi/esphome-jk-bms) ESPHome component.

---

## Preview

<img width="387" height="593" alt="Screenshot_4" src="https://github.com/user-attachments/assets/186bbb24-485c-4562-9781-9051166a8ab4" />

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

1. **Section 1 (Header Status)**: Displays system total runtime, active charging, discharging, and balancing state.
2. **Section 2 (Grid Data)**: Large voltage/current display header with customizable multi-column metric items.
3. **Section 3 (Cell Details)**: Displays individual cell voltages and internal resistances with dynamic highest/lowest voltage highlighting.
4. **Section 4 (Control Switches)**: Interactive switches to toggle balancing, charging, and discharging modes.

## Dashboard Configuration

### Using Visual UI Editor (Recommended)

The card includes a visual editor accessible via the dashboard edit interface:
- General Settings: Define Device Prefix and Cell Count.
- Formatting & Units: Configure decimal places for Section 2 headers & Section 3 cell voltages, and toggle mΩ internal resistance conversion.
- Section Font Sizes: Adjust pixel sizes individually across all four sections.
- Section Visibility: Enable or disable sections and headers independently.
- Styling & Alignment:
  - Color pickers for Section Background Color, Primary Font Color, Time Font Color, Max Cell Voltage Color, and Min Cell Voltage Color.
  - Alignment selectors for Section 2 and Section 3.
  - Checkboxes for transparent section background and custom value coloring.
- Section 2 Display Items:
  - Click + Add Item to append a new metric.
  - Use ▲ / ▼ buttons to reorder metrics.
  - Set custom labels, suffixes, units, decimals, column assignment, or override entities.

### YAML Configuration Example

Below is the complete list of available YAML options for the card:

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `type` | `string` | **Required** | Must be `custom:jkbms-card`. |
| `prefix` | `string` | `jk-bms` | Prefix applied to automatically construct entity IDs. |
| `cell_count` | `number` | `16` | Number of battery cells to display in Section 3. |
| `show_section_1` | `boolean` | `true` | Show or hide Section 1. |
| `show_section_2` | `boolean` | `true` | Show or hide Section 2. |
| `show_section_2_header` | `boolean` | `true` | Show or hide the main Voltage & Amperage header in Section 2. |
| `show_section_3` | `boolean` | `true` | Show or hide Section 3. |
| `show_cells_title` | `boolean` | `true` | Show or hide the "Cells" title in Section 3. |
| `show_section_4` | `boolean` | `true` | Show or hide Section 4. |
| `use_mohm_res` | `boolean` | `false` | Convert cell resistance to mΩ with 0 decimal places. |
| `sec2_header_decimals` | `number` | `1` | Decimal places for main Voltage and Current in Section 2. |
| `sec3_decimals` | `number` | `1` | Decimal places for cell voltages in Section 3. |
| `sec2_align` | `string` | `center` | Alignment for Section 2 rows (`center`, `space-between`, `flex-start`, `flex-end`). |
| `sec3_align` | `string` | `center` | Alignment for Section 3 cell rows (`center`, `space-between`, `flex-start`, `flex-end`). |
| `s1_font_size` | `number` | `15` | Font size in pixels for Section 1. |
| `s2_header_font_size` | `number` | `28` | Font size in pixels for Section 2 main values. |
| `s2_font_size` | `number` | `14` | Font size in pixels for Section 2 labels. |
| `s3_font_size` | `number` | `14` | Font size in pixels for Section 3. |
| `s4_font_size` | `number` | `15` | Font size in pixels for Section 4. |
| `use_primary_color_sec2` | `boolean` | `false` | Use Primary Font Color for Section 2 data values. |
| `remove_section_bg` | `boolean` | `false` | Set section backgrounds to transparent. |
| `section_bg_color` | `string` | `#121212` | Background color for sections. |
| `primary_font_color` | `string` | `#2e7d32` | Accent color for main values and status. |
| `time_font_color` | `string` | `#2196f3` | Accent color for total runtime. |
| `max_cell_color` | `string` | `#2196f3` | Color highlight for highest cell voltage. |
| `min_cell_color` | `string` | `#f44336` | Color highlight for lowest cell voltage. |
| `sec2_items` | `list` | *Default set* | Array of configurable metrics for Section 2. |

### Section 2 Item Structure

Each item in the `sec2_items` array supports the following keys:

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
