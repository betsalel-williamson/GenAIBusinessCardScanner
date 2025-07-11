import os
from dagster_card_processor.defs import GoogleSheetsResource

sheet_id = "1JSbMpy6nM0y8S_-eavKR-hgvayrQ6urN5Y4TpnQVi9k"
worksheet_name = "Data"
credentials_path = os.getenv("GOOGLE_SHEETS_CREDENTIALS_PATH")

if not credentials_path:
    print("Error: GOOGLE_SHEETS_CREDENTIALS_PATH environment variable not set.")
    print("Please set it to the absolute path of your service account JSON key file.")
    exit(1)

try:
    print(
        f"Attempting to read from Google Sheet ID: {sheet_id}, Worksheet: {worksheet_name}"
    )
    resource = GoogleSheetsResource(credentials_path=credentials_path)
    data = resource.read_sheet(sheet_id, worksheet_name)
    print("Successfully read data from Google Sheet!")
    print("First 5 rows of data:")
    for row in data[:5]:
        print(row)
    if not data:
        print("Worksheet is empty or no records found.")
except Exception as e:
    print(f"An error occurred: {e}")
    print("Please ensure:")
    print(
        "- The GOOGLE_SHEETS_CREDENTIALS_PATH is correct and points to a valid JSON key file."
    )
    print(
        "- The service account email (from the JSON key file) has 'Viewer' or 'Editor' access to the Google Sheet."
    )
    print("- The Google Sheets API is enabled for your GCP project.")
