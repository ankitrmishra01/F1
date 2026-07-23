from fastapi import APIRouter

router = APIRouter(prefix="/api/cars", tags=["Car Specs"])

F1_TECHNICAL_REGS_2026 = {
    "engine_architecture": "1.6-litre V6 90° Turbocharged Internal Combustion Engine (ICE)",
    "power_output": "1,000+ bhp (50% ICE + 50% Electrical Energy)",
    "ers_power": "350 kW (469 bhp) MGU-K Output (Up from 120 kW)",
    "mgu_h": "Removed for 2026 (Simplified Turbo Hybrid Architecture)",
    "fuel_specification": "100% Sustainable Advanced E-Fuel / Bio-fuel",
    "chassis_aerodynamics": "Active Aerodynamics (High-Downforce Z-Mode & Low-Drag X-Mode)",
    "min_weight": "768 kg (Reduced by 30kg for lighter, nimbler cars)",
    "drs_replacement": "Manual Override Mode (MOM) for electrical overtake boost"
}

TEAM_CARS_DATA = [
    {
        "team_id": "red_bull",
        "team_name": "Red Bull Racing",
        "car_model": "Red Bull RB21",
        "power_unit": "Honda RBPT V6 Turbo Hybrid",
        "chassis": "Carbon-composite monocoque with pull-rod front suspension",
        "aero_package": "Floor edge wing revisions & sculpted sidepod inlet channels",
        "engine_specs": "1.6L V6 15,000 RPM, 350kW MGU-K",
        "expected_upgrades": "High-efficiency low-drag rear wing for Monza & floor stiffness upgrade",
        "color": "#3671C6"
    },
    {
        "team_id": "ferrari",
        "team_name": "Scuderia Ferrari",
        "car_model": "Ferrari SF-25",
        "power_unit": "Ferrari 066/12 V6 Turbo Hybrid",
        "chassis": "Carbon-fibre honeycomb monocoque with push-rod front/rear suspension",
        "aero_package": "Overbite radiator intake & outwash sidepod geometry",
        "engine_specs": "1.6L V6 15,000 RPM, 350kW MGU-K",
        "expected_upgrades": "Revised front wing flap load distribution & brake duct cooling vents",
        "color": "#E80020"
    },
    {
        "team_id": "mclaren",
        "team_name": "McLaren F1 Team",
        "car_model": "McLaren MCL39",
        "power_unit": "Mercedes-AMG F1 M16 E Performance",
        "chassis": "Moulded carbon fibre monocoque with pull-rod front suspension",
        "aero_package": "Aggressive undercut sidepods & high-downforce beam wing",
        "engine_specs": "1.6L V6 15,000 RPM, 350kW MGU-K",
        "expected_upgrades": "New floor edge wing geometry & ultra-light chassis weight reduction",
        "color": "#FF8000"
    },
    {
        "team_id": "mercedes",
        "team_name": "Mercedes-AMG PETRONAS",
        "car_model": "Mercedes-AMG F1 W16 E Performance",
        "power_unit": "Mercedes-AMG F1 M16 E Performance",
        "chassis": "Carbon-composite structure with push-rod rear suspension",
        "aero_package": "Vented sidepod gullwing & refined anti-dive front suspension",
        "engine_specs": "1.6L V6 15,000 RPM, 350kW MGU-K",
        "expected_upgrades": "Rear suspension kinematics tweak & modified engine cover cooling gills",
        "color": "#27F4D2"
    },
    {
        "team_id": "aston_martin",
        "team_name": "Aston Martin Aramco",
        "car_model": "Aston Martin AMR25",
        "power_unit": "Mercedes-AMG F1 M16 E Performance",
        "chassis": "Carbon fibre monocoque with push-rod front suspension",
        "aero_package": "Deep waterslide sidepod channels & revised beam wing",
        "engine_specs": "1.6L V6 15,000 RPM, 350kW MGU-K",
        "expected_upgrades": "New front wing endplate flex wing & rear brake duct winglets",
        "color": "#229971"
    },
    {
        "team_id": "alpine",
        "team_name": "BWT Alpine F1 Team",
        "car_model": "Alpine A525",
        "power_unit": "Renault E-Tech RE25 V6 Turbo Hybrid",
        "chassis": "Moulded carbon fibre monocoque",
        "aero_package": "Wide intake sidepods & aggressive diffuser ramp angle",
        "engine_specs": "1.6L V6 15,000 RPM, 350kW MGU-K",
        "expected_upgrades": "Sub-floor diffuser fence redesign & lighter rear crash structure",
        "color": "#0093CC"
    },
    {
        "team_id": "williams",
        "team_name": "Williams Racing",
        "car_model": "Williams FW47",
        "power_unit": "Mercedes-AMG F1 M16 E Performance",
        "chassis": "Carbon-composite construction",
        "aero_package": "Slimline engine cowl & high-speed low-drag rear wing",
        "engine_specs": "1.6L V6 15,000 RPM, 350kW MGU-K",
        "expected_upgrades": "Steering column weight optimization & front brake duct air scoop",
        "color": "#64C4FF"
    },
    {
        "team_id": "rb",
        "team_name": "Visa Cash App RB F1 Team",
        "car_model": "RB VCARB 02",
        "power_unit": "Honda RBPT V6 Turbo Hybrid",
        "chassis": "Carbon monocoque with Red Bull Red Bull Technology front suspension",
        "aero_package": "Square sidepod inlet & deep floor undercut",
        "engine_specs": "1.6L V6 15,000 RPM, 350kW MGU-K",
        "expected_upgrades": "Floor edge wing flap geometry & lightweight halo fairing",
        "color": "#6692FF"
    },
    {
        "team_id": "haas",
        "team_name": "MoneyGram Haas F1 Team",
        "car_model": "Haas VF-25",
        "power_unit": "Ferrari 066/12 V6 Turbo Hybrid",
        "chassis": "Dallara carbon-fibre honeycomb monocoque",
        "aero_package": "Ferrari-inspired downwash sidepod architecture",
        "engine_specs": "1.6L V6 15,000 RPM, 350kW MGU-K",
        "expected_upgrades": "Upgraded floor fences & rear brake duct cooling louvres",
        "color": "#B6BABD"
    },
    {
        "team_id": "audi",
        "team_name": "Kick Sauber / Audi F1 Team",
        "car_model": "Audi C45",
        "power_unit": "Audi / Ferrari 066/12 V6 Turbo Hybrid",
        "chassis": "Carbon fibre monocoque with push-rod front suspension",
        "aero_package": "High undercut sidepods & redesigned floor edges",
        "engine_specs": "1.6L V6 15,000 RPM, 350kW MGU-K",
        "expected_upgrades": "New front wing mainplane & revised sidepod radiator layout",
        "color": "#52E252"
    }
]

@router.get("/")
def get_car_specs():
    """Returns technical regulations overview and 10 team car specs & upgrades"""
    return {
        "regulations": F1_TECHNICAL_REGS_2026,
        "cars": TEAM_CARS_DATA
    }
