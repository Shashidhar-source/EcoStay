# 🌿 EcoStay Mobile Application (.NET MAUI)

Cross-platform native mobile client for **EcoStay — Sustainable & Budget Travel in India**, built with **.NET 10, .NET MAUI, C#, XAML, and MVVM**.

---

## 📱 Features

- **Exact Visual Match:** Adheres to the EcoStay design system (`#2E7D32` green palette, rounded cards, responsive mobile layout).
- **EcoScore Breakdown:** Displays the 6-pillar sustainability rating (Solar, Water, Zero-Waste, Energy Efficiency, Local Community, Green Construction).
- **Real-World Discovery:** Stays and farm-to-table restaurants in India (Kerala, Coorg, Ladakh, Rishikesh, Goa).
- **Food & Diet Filtering:** `🥗 Pure Vegetarian`, `🌱 Veg Friendly`, `🍗 Non-Vegetarian` categorization with categorized menus and ₹ INR meal cost estimations.
- **Side-by-Side Comparison:** Compare up to 4 stays on mobile with horizontal comparison matrices.
- **Offline & Poor-Network Resilient:** Local caching for offline browsing in remote rural eco-destinations.
- **Dynamic API Environment Switcher:** Supports Android Emulator (`10.0.2.2:5000`), iOS Simulator (`localhost:5000`), physical devices on local Wi-Fi LAN, and production servers.

---

## 🚀 Getting Started

### 1. Prerequisites
- **.NET SDK 10.0+**
- **.NET MAUI Workloads:**
  ```bash
  dotnet workload install maui
  dotnet workload install maui-android
  dotnet workload install maui-windows
  ```

### 2. Restore & Build
```bash
cd EcoStay.Mobile
dotnet restore
dotnet build
```

### 3. Running on Android Emulator
```bash
dotnet build -t:Run -f net10.0-android
```

### 4. Running on Windows Desktop
```bash
dotnet build -t:Run -f net10.0-windows10.0.19041.0
```

### 5. Running on iOS Simulator (macOS host)
```bash
dotnet build -t:Run -f net10.0-ios
```

---

## 🌐 Connecting to the EcoStay Backend

The mobile client consumes the existing Node.js / Express REST API running on port `5000`:
- **Android Emulator:** Automatically routes to `http://10.0.2.2:5000`.
- **iOS / Windows:** Automatically routes to `http://localhost:5000`.
- **Physical Device:** In the mobile app, go to **Dashboard/Profile → API Backend Configuration** and enter your computer's local Wi-Fi IP (e.g., `http://192.168.1.15:5000`).
