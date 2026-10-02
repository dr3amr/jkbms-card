# JK-BMS Lovelace Card for Home Assistant (v1.0.0)

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-41BDF5.svg)](https://github.com/hacs/default)
[![version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/)

A custom Home Assistant Lovelace card that replicates the official **JK-BMS Android Application UI** interface. Designed to work seamlessly with the popular [`syssi/esphome-jk-bms`](https://github.com/syssi/esphome-jk-bms) ESPHome component.

---

## Preview

![JK-BMS Card Preview](screenshot.png)
*(Replace `screenshot.png` with an actual screenshot of your card running in Home Assistant)*

---

## Features

- **JK-BMS Android UI Replica**: Faithfully reproduces the layout and aesthetics of the official mobile app.
- **Auto-Entity Resolution**: Supply your ESPHome device prefix (`substitutions: name: <prefix>`), and all default entities automatically link up (`sensor.<prefix>_min_cell_voltage`, `sensor.<prefix>_total_capacity`, etc.).
- **Full Visual Editor Support**: Configure options directly in the Home Assistant UI without editing YAML.
- **Cell Highlighting**:
  - Automatically highlights the **highest voltage cell** in **Blue** (or custom color).
  - Automatically highlights the **lowest voltage cell** in **Red** (or custom color).
  - Configurable cell counts (defaults to 16 cells).
- **Customizable Section 2 Items**:
  - Add, remove, or reorder data points in Section 2.
  - Assign items specifically to **Column 1** or **Column 2**.
  - Choose text alignment in Section 2 (**Centered**, **Spread/Justified**, **Left**, **Right**).
- **Section Visibility Controls**: Hide/show any of the 4 sections individually or toggle the "Cells" title text in Section 3.
- **Color Customization**: Easily change primary status green, uptime blue, and cell highlight colors through the UI editor.
- **Default Action**: Clicking any data point opens Home Assistant's standard "More Info" dialog.

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

## Dashboard Configuration

### Using Visual UI Editor (Recommended)

1. Edit your dashboard and click **Add Card**.
2. Search for **JK-BMS Android App UI Card**.
3. Use the visual options to configure your prefix, colors, section toggles, and Section 2 columns.

### YAML Configuration Example

```yaml
type: custom:jk-bms-card
prefix: jk-bms
cell_count: 16
sec2_align: center

# Section Toggles
show_section_1: true
show_section_2: true
show_section_3: true
show_section_4: true
show_cells_title: true

# Custom Colors
primary_green_color: "#2e7d32"
time_color: "#2196f3"
max_cell_color: "#2196f3"
min_cell_color: "#f44336"
sec2_value_color: "#ffffff"

# Custom Section 2 items & column assignments
sec2_items:
  - label: "Battery Power:"
    entity_suffix: power
    unit: "W"
    column: 1
  - label: "Remain Battery:"
    entity_suffix: capacity_remaining_percentage
    unit: "%"
    column: 2
  - label: "MOS Temp.:"
    entity_suffix: mosfet_temperature
    unit: "°C"
    column: 2
```

---

## Versioning & Releases

This project follows [Semantic Versioning](https://semver.org/).
- **v1.0.0**: Initial release featuring standard HA theme typography, customizable column alignment, variable column spacing, HACS compatibility, and visual editor support.

---

## License

This project is open-source under the MIT License.
