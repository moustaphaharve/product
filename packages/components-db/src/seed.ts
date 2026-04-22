import type { Component } from "@product/types";

/**
 * Real, purchasable components used to seed the database.
 *
 * The first ~35 entries are fully detailed with real specs, manufacturers,
 * and supplier URLs. The remaining entries are realistic placeholders
 * that look real but are flagged with `_stub: true` in `specs` so they
 * can be replaced with hand-curated data later.
 */

type SeedComponent = Omit<Component, "id"> & { id?: string };

const now = new Date().toISOString();

const supplier = (
  name: string,
  priceUsd: number,
  url: string,
  leadTimeDays = 3,
  inStock = true,
) => ({
  id: `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Math.random()
    .toString(36)
    .slice(2, 8)}`,
  name,
  priceUsd,
  inStock,
  leadTimeDays,
  purchaseUrl: url,
  affiliateUrl: null,
  lastChecked: now,
});

// ————————————————————————————————————————————————————————————
// Motors (30)
// ————————————————————————————————————————————————————————————
const motors: SeedComponent[] = [
  {
    slug: "dynamixel-xm430-w350",
    name: "Dynamixel XM430-W350-R",
    manufacturer: "Robotis",
    category: "MOTOR",
    subcategory: "smart_servo",
    description:
      "Smart serial-bus servo with integrated controller, position/velocity/current feedback, and TTL communication.",
    specs: {
      voltageNominalV: 12,
      stallTorqueNm: 4.1,
      stallCurrentA: 2.3,
      noLoadRpm: 46,
      weightG: 82,
      encoderResolution: 4096,
      communication: "TTL",
      protocol: "Dynamixel 2.0",
    },
    compatibility: {
      microcontrollers: ["arduino-uno", "rpi-4", "rpi-5", "jetson-orin-nano"],
      requires: ["U2D2", "power-hub"],
    },
    suppliers: [
      supplier(
        "Robotis Store",
        289.9,
        "https://www.robotis.us/dynamixel-xm430-w350-r/",
      ),
      supplier("ROBOTSHOP", 299.0, "https://www.robotshop.com/"),
    ],
    alternativeIds: ["dynamixel-xm540-w270"],
    imageUrl: null,
    datasheetUrl:
      "https://emanual.robotis.com/docs/en/dxl/x/xm430-w350/",
  },
  {
    slug: "dynamixel-xl430-w250",
    name: "Dynamixel XL430-W250-T",
    manufacturer: "Robotis",
    category: "MOTOR",
    subcategory: "smart_servo",
    description:
      "Budget-friendly Dynamixel X-series smart servo for educational and hobby robotics.",
    specs: {
      voltageNominalV: 11.1,
      stallTorqueNm: 1.4,
      noLoadRpm: 61,
      weightG: 57,
      communication: "TTL",
    },
    compatibility: { microcontrollers: ["arduino-uno", "rpi-4"] },
    suppliers: [
      supplier("Robotis Store", 49.9, "https://www.robotis.us/"),
    ],
    alternativeIds: [],
  },
  {
    slug: "sg90-micro-servo",
    name: "Tower Pro SG90 Micro Servo",
    manufacturer: "Tower Pro",
    category: "MOTOR",
    subcategory: "hobby_servo",
    description:
      "9g micro servo, 180° range, ubiquitous in hobbyist manipulators, camera gimbals, and small grippers.",
    specs: {
      voltageNominalV: 5,
      stallTorqueNm: 0.176,
      rotationDeg: 180,
      weightG: 9,
      communication: "PWM",
    },
    compatibility: { microcontrollers: ["arduino-uno", "esp32", "rpi-pico"] },
    suppliers: [
      supplier("Adafruit", 5.95, "https://www.adafruit.com/product/169"),
      supplier("Amazon", 4.5, "https://www.amazon.com/"),
    ],
    alternativeIds: ["mg90s-metal-gear-servo"],
  },
  {
    slug: "mg996r-servo",
    name: "Tower Pro MG996R",
    manufacturer: "Tower Pro",
    category: "MOTOR",
    subcategory: "hobby_servo",
    description:
      "Metal-gear high-torque hobby servo popular for robotic arms and larger steering assemblies.",
    specs: {
      voltageNominalV: 6,
      stallTorqueNm: 1.078,
      rotationDeg: 180,
      weightG: 55,
      communication: "PWM",
    },
    compatibility: { microcontrollers: ["arduino-uno", "esp32"] },
    suppliers: [
      supplier("Amazon", 10.99, "https://www.amazon.com/"),
    ],
    alternativeIds: ["sg90-micro-servo"],
  },
  {
    slug: "nema17-stepper-17hs4401",
    name: "NEMA 17 Stepper 17HS4401",
    manufacturer: "OMC-StepperOnline",
    category: "MOTOR",
    subcategory: "stepper",
    description:
      "Bipolar NEMA 17 stepper motor widely used in 3D printers, CNC, and linear actuators.",
    specs: {
      voltageNominalV: 12,
      stepsPerRev: 200,
      stepAngleDeg: 1.8,
      holdingTorqueNm: 0.4,
      currentPerPhaseA: 1.7,
      weightG: 220,
    },
    compatibility: {
      drivers: ["a4988", "drv8825", "tmc2209"],
      microcontrollers: ["arduino-uno", "rpi-pico"],
    },
    suppliers: [
      supplier(
        "StepperOnline",
        11.99,
        "https://www.omc-stepperonline.com/17hs4401",
      ),
    ],
    alternativeIds: [],
  },
  {
    slug: "pololu-37d-gearmotor-100rpm",
    name: "Pololu 37Dx70L 19:1 Gearmotor with Encoder",
    manufacturer: "Pololu",
    category: "MOTOR",
    subcategory: "geared_dc",
    description:
      "Robust brushed DC gearmotor with 64 CPR quadrature encoder. Classic choice for AMRs and wheeled robots.",
    specs: {
      voltageNominalV: 12,
      noLoadRpm: 500,
      stallTorqueNm: 1.67,
      stallCurrentA: 5,
      encoderCpr: 64,
      gearRatio: 19,
    },
    compatibility: {
      drivers: ["tb6612fng", "vnh5019", "cytron-10a"],
      microcontrollers: ["arduino-uno", "rpi-4", "esp32"],
    },
    suppliers: [
      supplier("Pololu", 44.95, "https://www.pololu.com/product/4754"),
    ],
    alternativeIds: [],
  },
  {
    slug: "tmotor-u8-lite-kv150",
    name: "T-Motor U8 Lite KV150 Brushless",
    manufacturer: "T-Motor",
    category: "MOTOR",
    subcategory: "brushless_dc",
    description:
      "High-efficiency brushless outrunner used in heavy-lift multirotors, robotic arms, and gimbals.",
    specs: {
      voltageNominalV: 22.2,
      kv: 150,
      maxCurrentA: 40,
      weightG: 240,
    },
    compatibility: { drivers: ["flipsky-vesc-6", "odrive-v3.6"] },
    suppliers: [supplier("T-Motor", 249.0, "https://store.tmotor.com/")],
    alternativeIds: [],
  },
];

for (let i = 0; i < 23; i++) {
  motors.push({
    slug: `motor-stub-${i + 1}`,
    name: `Generic DC Gearmotor ${i + 1}`,
    manufacturer: "Assorted",
    category: "MOTOR",
    subcategory: "geared_dc",
    description:
      "Placeholder entry — realistic DC gearmotor for wheeled robot drivetrains.",
    specs: {
      _stub: true,
      voltageNominalV: 12,
      noLoadRpm: 100 + i * 20,
      stallTorqueNm: 0.5 + i * 0.1,
    },
    compatibility: { _stub: true, drivers: ["tb6612fng"] },
    suppliers: [supplier("Amazon", 8 + i, "https://www.amazon.com/")],
    alternativeIds: [],
  });
}

// ————————————————————————————————————————————————————————————
// Microcontrollers (20)
// ————————————————————————————————————————————————————————————
const microcontrollers: SeedComponent[] = [
  {
    slug: "arduino-uno-r3",
    name: "Arduino Uno R3",
    manufacturer: "Arduino",
    category: "MICROCONTROLLER",
    subcategory: "arduino",
    description:
      "Classic ATmega328P board. Best for simple sensors, PWM actuators, and prototype control loops.",
    specs: {
      mcu: "ATmega328P",
      clockMhz: 16,
      flashKb: 32,
      ramKb: 2,
      digitalPins: 14,
      analogPins: 6,
      voltageV: 5,
    },
    compatibility: { languages: ["C", "C++", "Arduino"] },
    suppliers: [
      supplier(
        "Arduino Store",
        27.6,
        "https://store.arduino.cc/products/arduino-uno-rev3",
      ),
      supplier("Adafruit", 27.5, "https://www.adafruit.com/product/50"),
    ],
    alternativeIds: ["arduino-mega-2560", "arduino-nano"],
  },
  {
    slug: "arduino-mega-2560",
    name: "Arduino Mega 2560 R3",
    manufacturer: "Arduino",
    category: "MICROCONTROLLER",
    subcategory: "arduino",
    description:
      "ATmega2560 board with 54 digital pins — for projects that outgrow the Uno.",
    specs: { mcu: "ATmega2560", clockMhz: 16, flashKb: 256, ramKb: 8 },
    compatibility: { languages: ["C", "C++", "Arduino"] },
    suppliers: [supplier("Arduino Store", 48.4, "https://store.arduino.cc/")],
    alternativeIds: ["arduino-uno-r3"],
  },
  {
    slug: "arduino-nano",
    name: "Arduino Nano",
    manufacturer: "Arduino",
    category: "MICROCONTROLLER",
    subcategory: "arduino",
    description:
      "Compact ATmega328P board for space-constrained projects.",
    specs: { mcu: "ATmega328P", clockMhz: 16, flashKb: 32 },
    compatibility: { languages: ["C", "C++", "Arduino"] },
    suppliers: [supplier("Arduino Store", 24.2, "https://store.arduino.cc/")],
    alternativeIds: ["arduino-uno-r3"],
  },
  {
    slug: "rpi-4-4gb",
    name: "Raspberry Pi 4 Model B (4GB)",
    manufacturer: "Raspberry Pi Foundation",
    category: "MICROCONTROLLER",
    subcategory: "sbc",
    description:
      "Quad-core Cortex-A72 SBC. Runs Linux; ideal for vision, SLAM, ROS 2 nodes.",
    specs: { cpu: "BCM2711", cores: 4, clockGhz: 1.5, ramGb: 4 },
    compatibility: { os: ["Raspberry Pi OS", "Ubuntu", "ROS 2"] },
    suppliers: [
      supplier(
        "Adafruit",
        55.0,
        "https://www.adafruit.com/product/4296",
      ),
      supplier("CanaKit", 55.0, "https://www.canakit.com/"),
    ],
    alternativeIds: ["rpi-5-4gb", "jetson-orin-nano"],
  },
  {
    slug: "rpi-5-4gb",
    name: "Raspberry Pi 5 (4GB)",
    manufacturer: "Raspberry Pi Foundation",
    category: "MICROCONTROLLER",
    subcategory: "sbc",
    description:
      "Cortex-A76 SBC with PCIe 2.0, dual 4K, and RP1 I/O controller.",
    specs: { cpu: "BCM2712", cores: 4, clockGhz: 2.4, ramGb: 4 },
    compatibility: { os: ["Raspberry Pi OS", "Ubuntu", "ROS 2"] },
    suppliers: [supplier("Adafruit", 60.0, "https://www.adafruit.com/")],
    alternativeIds: ["rpi-4-4gb"],
  },
  {
    slug: "rpi-pico-w",
    name: "Raspberry Pi Pico W",
    manufacturer: "Raspberry Pi Foundation",
    category: "MICROCONTROLLER",
    subcategory: "mcu",
    description:
      "RP2040 dual-core microcontroller with built-in Wi-Fi, perfect for small wireless robots.",
    specs: { mcu: "RP2040", cores: 2, clockMhz: 133, flashMb: 2 },
    compatibility: { languages: ["C", "C++", "MicroPython"] },
    suppliers: [
      supplier("Adafruit", 6.0, "https://www.adafruit.com/product/5544"),
    ],
    alternativeIds: [],
  },
  {
    slug: "jetson-orin-nano-8gb",
    name: "NVIDIA Jetson Orin Nano 8GB Developer Kit",
    manufacturer: "NVIDIA",
    category: "MICROCONTROLLER",
    subcategory: "sbc_ai",
    description:
      "40-TOPS AI edge compute. Onboard CUDA/TensorRT for vision and perception pipelines.",
    specs: { gpuCores: 1024, cpu: "6-core Cortex-A78AE", ramGb: 8 },
    compatibility: { frameworks: ["ROS 2", "PyTorch", "TensorRT"] },
    suppliers: [
      supplier(
        "NVIDIA",
        499.0,
        "https://www.nvidia.com/en-us/autonomous-machines/embedded-systems/jetson-orin/",
      ),
    ],
    alternativeIds: ["jetson-nano-4gb", "rpi-5-4gb"],
  },
  {
    slug: "esp32-devkit-v1",
    name: "ESP32 DevKit V1",
    manufacturer: "Espressif",
    category: "MICROCONTROLLER",
    subcategory: "mcu",
    description:
      "Dual-core Xtensa LX6 with Wi-Fi + Bluetooth. The default pick for a connected small robot.",
    specs: { mcu: "ESP32-WROOM-32", cores: 2, clockMhz: 240, flashMb: 4 },
    compatibility: { languages: ["C", "C++", "Arduino", "MicroPython"] },
    suppliers: [supplier("Amazon", 8.99, "https://www.amazon.com/")],
    alternativeIds: ["rpi-pico-w"],
  },
  {
    slug: "teensy-4-1",
    name: "Teensy 4.1",
    manufacturer: "PJRC",
    category: "MICROCONTROLLER",
    subcategory: "mcu",
    description:
      "600 MHz Cortex-M7 with Ethernet and USB Host — great for real-time control.",
    specs: { mcu: "i.MX RT1062", clockMhz: 600, flashMb: 8 },
    compatibility: { languages: ["C", "C++", "Arduino"] },
    suppliers: [supplier("PJRC", 31.5, "https://www.pjrc.com/store/teensy41.html")],
    alternativeIds: [],
  },
];

for (let i = 0; i < 11; i++) {
  microcontrollers.push({
    slug: `mcu-stub-${i + 1}`,
    name: `ESP32-S3 Variant ${i + 1}`,
    manufacturer: "Espressif",
    category: "MICROCONTROLLER",
    subcategory: "mcu",
    description: "Placeholder ESP32-S3 dev board entry.",
    specs: { _stub: true, mcu: "ESP32-S3", clockMhz: 240 },
    compatibility: { _stub: true },
    suppliers: [supplier("Amazon", 12 + i, "https://www.amazon.com/")],
    alternativeIds: [],
  });
}

// ————————————————————————————————————————————————————————————
// Sensors (25)
// ————————————————————————————————————————————————————————————
const sensors: SeedComponent[] = [
  {
    slug: "hc-sr04",
    name: "HC-SR04 Ultrasonic Distance Sensor",
    manufacturer: "Assorted",
    category: "SENSOR",
    subcategory: "distance",
    description:
      "Basic 2–400cm ultrasonic sensor. Ubiquitous in hobbyist obstacle-avoidance.",
    specs: { rangeCm: [2, 400], voltageV: 5, accuracyCm: 0.3 },
    compatibility: { microcontrollers: ["arduino-uno", "esp32", "rpi-pico-w"] },
    suppliers: [supplier("Amazon", 3.99, "https://www.amazon.com/")],
    alternativeIds: ["vl53l0x"],
  },
  {
    slug: "vl53l0x",
    name: "VL53L0X Time-of-Flight Distance Sensor",
    manufacturer: "STMicroelectronics",
    category: "SENSOR",
    subcategory: "distance",
    description:
      "Laser ToF ranging sensor, I²C, 0–2m. Excellent indoor obstacle detection.",
    specs: { rangeMm: [30, 2000], interface: "I2C" },
    compatibility: { microcontrollers: ["arduino-uno", "rpi-4", "esp32"] },
    suppliers: [supplier("Adafruit", 14.95, "https://www.adafruit.com/product/3317")],
    alternativeIds: ["hc-sr04"],
  },
  {
    slug: "mpu6050",
    name: "MPU-6050 6-Axis IMU",
    manufacturer: "InvenSense",
    category: "SENSOR",
    subcategory: "imu",
    description:
      "Gyro + accelerometer, I²C. Used for stabilization on small drones and balancing robots.",
    specs: { axes: 6, interface: "I2C" },
    compatibility: { microcontrollers: ["arduino-uno", "esp32"] },
    suppliers: [supplier("Amazon", 3.5, "https://www.amazon.com/")],
    alternativeIds: ["bno055"],
  },
  {
    slug: "bno055",
    name: "BNO055 9-DOF Absolute Orientation IMU",
    manufacturer: "Bosch",
    category: "SENSOR",
    subcategory: "imu",
    description:
      "Sensor-fused absolute-orientation IMU. Gives you quaternions out of the box.",
    specs: { axes: 9, interface: "I2C", outputs: ["quaternion", "euler"] },
    compatibility: { microcontrollers: ["arduino-uno", "rpi-4"] },
    suppliers: [supplier("Adafruit", 34.95, "https://www.adafruit.com/product/2472")],
    alternativeIds: ["mpu6050"],
  },
  {
    slug: "rpi-camera-v3",
    name: "Raspberry Pi Camera Module 3",
    manufacturer: "Raspberry Pi Foundation",
    category: "SENSOR",
    subcategory: "camera",
    description:
      "12 MP IMX708 module with autofocus. Primary vision input for Pi-based robots.",
    specs: { resolutionMp: 12, autoFocus: true },
    compatibility: { microcontrollers: ["rpi-4-4gb", "rpi-5-4gb"] },
    suppliers: [
      supplier("Adafruit", 25.0, "https://www.adafruit.com/product/5657"),
    ],
    alternativeIds: ["arducam-imx219"],
  },
  {
    slug: "rplidar-a1",
    name: "Slamtec RPLIDAR A1M8",
    manufacturer: "Slamtec",
    category: "SENSOR",
    subcategory: "lidar",
    description:
      "360° 2D laser range scanner, up to 12m. Popular first-lidar for SLAM.",
    specs: { rangeM: 12, angleDeg: 360, scanHz: 10 },
    compatibility: { microcontrollers: ["rpi-4-4gb", "jetson-orin-nano-8gb"] },
    suppliers: [
      supplier("Slamtec", 99.0, "https://www.slamtec.com/"),
    ],
    alternativeIds: ["rplidar-a2"],
  },
  {
    slug: "intel-realsense-d435i",
    name: "Intel RealSense D435i",
    manufacturer: "Intel",
    category: "SENSOR",
    subcategory: "depth_camera",
    description:
      "Stereo depth camera with onboard IMU. Workhorse for indoor mapping & manipulation.",
    specs: { depthRangeM: [0.1, 10], imu: true, fov: "87×58" },
    compatibility: {
      microcontrollers: ["rpi-4-4gb", "jetson-orin-nano-8gb"],
      frameworks: ["ROS 2", "librealsense"],
    },
    suppliers: [
      supplier(
        "Intel",
        349.0,
        "https://www.intelrealsense.com/depth-camera-d435i/",
      ),
    ],
    alternativeIds: ["rpi-camera-v3"],
  },
];

for (let i = 0; i < 18; i++) {
  sensors.push({
    slug: `sensor-stub-${i + 1}`,
    name: `Sensor Placeholder ${i + 1}`,
    manufacturer: "Assorted",
    category: "SENSOR",
    subcategory: i % 2 === 0 ? "distance" : "environmental",
    description: "Placeholder sensor entry.",
    specs: { _stub: true },
    compatibility: { _stub: true },
    suppliers: [supplier("Amazon", 5 + i, "https://www.amazon.com/")],
    alternativeIds: [],
  });
}

// ————————————————————————————————————————————————————————————
// Chassis / wheels (10)
// ————————————————————————————————————————————————————————————
const chassisWheels: SeedComponent[] = [
  {
    slug: "pololu-romi-chassis",
    name: "Pololu Romi Chassis Kit",
    manufacturer: "Pololu",
    category: "CHASSIS",
    subcategory: "differential",
    description:
      "Circular two-wheel differential chassis with 70mm wheels and caster. Classic educational base.",
    specs: { diameterMm: 165, weightG: 354 },
    compatibility: {
      motors: ["pololu-37d-gearmotor-100rpm"],
      wheels: ["pololu-70mm-wheel"],
    },
    suppliers: [supplier("Pololu", 19.95, "https://www.pololu.com/category/202/romi-chassis")],
    alternativeIds: [],
  },
  {
    slug: "nanosaur-chassis",
    name: "NanoSaur 3D-printable Chassis",
    manufacturer: "Open-source",
    category: "CHASSIS",
    subcategory: "tracked",
    description:
      "Open-source 3D-printable chassis for Jetson Nano-class builds.",
    specs: { lengthMm: 145 },
    compatibility: { microcontrollers: ["jetson-orin-nano-8gb"] },
    suppliers: [
      supplier("Thingiverse / print-it-yourself", 12.0, "https://nanosaur.ai/"),
    ],
    alternativeIds: [],
  },
  {
    slug: "mecanum-wheel-80mm",
    name: "80mm Mecanum Wheel Set (4)",
    manufacturer: "Nexus Robot",
    category: "WHEEL",
    subcategory: "mecanum",
    description:
      "Set of 4 mecanum wheels for omnidirectional mobile robots.",
    specs: { diameterMm: 80, count: 4 },
    compatibility: { chassis: ["generic-aluminum-250"] },
    suppliers: [supplier("ROBOTSHOP", 69.0, "https://www.robotshop.com/")],
    alternativeIds: [],
  },
  {
    slug: "generic-tank-tracks",
    name: "Rubber Tank Tracks with Sprockets",
    manufacturer: "Assorted",
    category: "CHASSIS",
    subcategory: "tracked",
    description:
      "Pair of rubber tank tracks with matching drive sprockets for off-road rovers.",
    specs: { widthMm: 40 },
    compatibility: {},
    suppliers: [supplier("Amazon", 22.0, "https://www.amazon.com/")],
    alternativeIds: [],
  },
];
for (let i = 0; i < 6; i++) {
  chassisWheels.push({
    slug: `chassis-wheel-stub-${i + 1}`,
    name: i < 3 ? `Aluminum Chassis Plate ${i + 1}` : `65mm Rubber Wheel ${i + 1}`,
    manufacturer: "Assorted",
    category: i < 3 ? "CHASSIS" : "WHEEL",
    subcategory: i < 3 ? "plate" : "rubber",
    description: "Placeholder mechanical part.",
    specs: { _stub: true },
    compatibility: { _stub: true },
    suppliers: [supplier("Amazon", 9 + i, "https://www.amazon.com/")],
    alternativeIds: [],
  });
}

// ————————————————————————————————————————————————————————————
// Batteries (10)
// ————————————————————————————————————————————————————————————
const batteries: SeedComponent[] = [
  {
    slug: "lipo-3s-2200mah",
    name: "3S 11.1V 2200mAh LiPo Battery",
    manufacturer: "Turnigy",
    category: "BATTERY",
    subcategory: "lipo",
    description:
      "11.1V / 2200mAh LiPo pack. Good runtime for medium-sized mobile robots.",
    specs: {
      cells: 3,
      capacityMah: 2200,
      nominalV: 11.1,
      dischargeC: 25,
      weightG: 186,
    },
    compatibility: { _: "standard XT60" },
    suppliers: [supplier("HobbyKing", 18.95, "https://hobbyking.com/")],
    alternativeIds: ["lipo-4s-5000mah"],
  },
  {
    slug: "lipo-4s-5000mah",
    name: "4S 14.8V 5000mAh LiPo Battery",
    manufacturer: "Zippy Compact",
    category: "BATTERY",
    subcategory: "lipo",
    description: "High-capacity 4S LiPo for large mobile bases and drones.",
    specs: { cells: 4, capacityMah: 5000, nominalV: 14.8, dischargeC: 25 },
    compatibility: {},
    suppliers: [supplier("HobbyKing", 39.99, "https://hobbyking.com/")],
    alternativeIds: ["lipo-3s-2200mah"],
  },
  {
    slug: "18650-pack-4s2p",
    name: "18650 Li-Ion Pack 4S2P 14.8V 6800mAh",
    manufacturer: "Samsung 30Q",
    category: "BATTERY",
    subcategory: "li_ion",
    description:
      "Custom-built 4S2P 18650 pack. Long cycle life, for endurance platforms.",
    specs: { cells: 8, capacityMah: 6800, nominalV: 14.8 },
    compatibility: {},
    suppliers: [supplier("Battery Hookup", 49.0, "https://www.batteryhookup.com/")],
    alternativeIds: [],
  },
];
for (let i = 0; i < 7; i++) {
  batteries.push({
    slug: `battery-stub-${i + 1}`,
    name: `NiMH Pack 12V ${1200 + i * 200}mAh`,
    manufacturer: "Assorted",
    category: "BATTERY",
    subcategory: "nimh",
    description: "Placeholder NiMH pack entry.",
    specs: { _stub: true, nominalV: 12 },
    compatibility: { _stub: true },
    suppliers: [supplier("Amazon", 14 + i, "https://www.amazon.com/")],
    alternativeIds: [],
  });
}

// ————————————————————————————————————————————————————————————
// Misc (5)
// ————————————————————————————————————————————————————————————
const misc: SeedComponent[] = [
  {
    slug: "jumper-wires-40pk",
    name: "40-pack M-M / M-F / F-F Jumper Wires",
    manufacturer: "Assorted",
    category: "CABLE",
    subcategory: "jumper",
    description: "Silicone jumper wires for prototyping.",
    specs: { lengthCm: 20, count: 120 },
    compatibility: {},
    suppliers: [supplier("Adafruit", 7.5, "https://www.adafruit.com/")],
    alternativeIds: [],
  },
  {
    slug: "breadboard-830",
    name: "830-point Solderless Breadboard",
    manufacturer: "Assorted",
    category: "MISC",
    subcategory: "prototyping",
    description: "Standard prototyping breadboard.",
    specs: { points: 830 },
    compatibility: {},
    suppliers: [supplier("Adafruit", 5.95, "https://www.adafruit.com/")],
    alternativeIds: [],
  },
  {
    slug: "pdb-pcb-20a",
    name: "Power Distribution PCB 20A",
    manufacturer: "Matek",
    category: "MISC",
    subcategory: "power",
    description: "Compact PDB with 5V/12V BECs and XT60 input.",
    specs: { inputV: [7, 26], currentA: 20 },
    compatibility: {},
    suppliers: [supplier("Matek", 12.99, "https://www.mateksys.com/")],
    alternativeIds: [],
  },
  {
    slug: "standoff-m3-kit",
    name: "M3 Nylon Standoff Kit (180 pcs)",
    manufacturer: "Assorted",
    category: "MISC",
    subcategory: "mechanical",
    description: "Mixed M3 standoffs/screws/nuts for robot assembly.",
    specs: { threadSize: "M3", count: 180 },
    compatibility: {},
    suppliers: [supplier("Amazon", 10.99, "https://www.amazon.com/")],
    alternativeIds: [],
  },
  {
    slug: "xt60-connector-pair",
    name: "XT60 Connector Pair",
    manufacturer: "Amass",
    category: "CONNECTOR",
    subcategory: "power",
    description: "XT60 connector pair for LiPo battery hookups.",
    specs: { currentA: 60 },
    compatibility: {},
    suppliers: [supplier("Amazon", 2.5, "https://www.amazon.com/")],
    alternativeIds: [],
  },
];

export const SEED_COMPONENTS: SeedComponent[] = [
  ...motors,
  ...microcontrollers,
  ...sensors,
  ...chassisWheels,
  ...batteries,
  ...misc,
];

export function getSeedComponents(): SeedComponent[] {
  return SEED_COMPONENTS;
}
