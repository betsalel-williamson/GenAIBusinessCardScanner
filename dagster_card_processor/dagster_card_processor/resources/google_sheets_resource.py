from dagster import ConfigurableResource
import gspread
from oauth2client.service_account import ServiceAccountCredentials

class GoogleSheetsResource(ConfigurableResource):
    credentials_path: str

    def get_client(self):
        scope = ['https://spreadsheets.google.com/feeds', 'https://www.googleapis.com/auth/drive']
        creds = ServiceAccountCredentials.from_json_keyfile_name(self.credentials_path, scope)
        client = gspread.authorize(creds)
        return client

    def read_sheet(self, sheet_id, worksheet_name):
        client = self.get_client()
        sheet = client.open_by_key(sheet_id).worksheet(worksheet_name)
        return sheet.get_all_records()