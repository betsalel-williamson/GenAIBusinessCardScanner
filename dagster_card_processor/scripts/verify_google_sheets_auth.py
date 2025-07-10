import os
import gspread
from oauth2client.service_account import ServiceAccountCredentials

credentials_path = os.getenv("GOOGLE_SHEETS_CREDENTIALS_PATH")

if not credentials_path:
    print("Error: GOOGLE_SHEETS_CREDENTIALS_PATH environment variable not set.")
    print("Please set it to the absolute path of your service account JSON key file.")
    exit(1)

try:
    print(f"Attempting to authorize gspread with credentials from: {credentials_path}")
    scope = ['https://spreadsheets.google.com/feeds', 'https://www.googleapis.com/auth/drive']
    creds = ServiceAccountCredentials.from_json_keyfile_name(credentials_path, scope)
    client = gspread.authorize(creds)
    print("Successfully authorized gspread client!")
    print("Client object: ", client)
except Exception as e:
    print(f"An error occurred during authorization: {e}")
    print("Please ensure:")
    print("- The GOOGLE_SHEETS_CREDENTIALS_PATH is correct and points to a valid JSON key file.")
    print("- The service account email (from the JSON key file) has appropriate access to Google Drive/Sheets.")
    print("- The Google Sheets API is enabled for your GCP project.")
