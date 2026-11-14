
import requests
import datetime

API_KEY = "rk_live_kQkwmugGVugvp0-uwKJSsAWWgKr1D-77"
TRAIN_NUMBER = "12951"

ist = datetime.timezone(datetime.timedelta(hours=5, minutes=30))
run_date = datetime.datetime.now(ist).date().isoformat()

url = f"https://ir.railcore.tech/v1/trains/{TRAIN_NUMBER}/live"

response = requests.get(
    url,
    params={"date": run_date, "max_age": 0},
    headers={"X-Api-Key": API_KEY},
    timeout=30
)

body = response.json()

if not response.ok or not body.get("success"):
    print(body)
else:
    data = body["data"]

    print("\n===== TRAIN INFORMATION =====")
    print("Train:", data.get("train_name"))
    print("Number:", data.get("train_number"))
    print("Status:", data.get("status_text"))
    print("Cancellation:", data.get("cancellation"))

    print("\n===== LIVE LOCATION =====")
    print("Current:", data.get("current_station_name"))
    print("Previous Code:", data.get("previous_station_code"))
    print("Next Code:", data.get("next_station_code"))
    print("Latitude:", data.get("latitude"))
    print("Longitude:", data.get("longitude"))
    print("Speed:", data.get("speed_kmph"), "km/h")
    print("Delay:", data.get("delay_minutes"), "minutes")
    print("Progress:", data.get("progress_percent"), "%")
    print("Confidence:", data.get("confidence"))

    print("\n===== NEXT STATION =====")
    next_stop = data.get("next_stop") or {}

    for key, value in next_stop.items():
        print(f"{key}: {value}")

    print("\n===== ACTUAL STOPPING STATIONS =====")

    for station in data.get("stations", []):
        if station.get("is_stopping"):
            print("\n", station.get("sequence"),
                  station.get("station_name"),
                  f"({station.get('station_code')})")

            print("Arrival:", station.get("eta"))
            print("Departure:", station.get("etd"))
            print("Platform:", station.get("platform_number"))
            print("Arrived:", station.get("has_arrived"))
            print("Departed:", station.get("has_departed"))

    print("\n===== DATA FRESHNESS =====")
    print(data.get("freshness"))
