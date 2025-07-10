from unittest.mock import patch, MagicMock

import pytest

from dagster_card_processor.resources import GoogleSheetsResource


@patch('gspread.authorize')
@patch('oauth2client.service_account.ServiceAccountCredentials.from_json_keyfile_name')
def test_google_sheets_resource(mock_from_json_keyfile_name, mock_authorize):
    """Test the Google Sheets resource."""
    mock_creds = MagicMock()
    mock_from_json_keyfile_name.return_value = mock_creds

    mock_gc = MagicMock()
    mock_sh = MagicMock()
    mock_wks = MagicMock()
    mock_authorize.return_value = mock_gc
    mock_gc.open_by_key.return_value = mock_sh
    mock_sh.worksheet.return_value = mock_wks
    mock_wks.get_all_records.return_value = [{'foo': 'bar'}]

    resource = GoogleSheetsResource(credentials_path='/path/to/creds.json')
    result = resource.read_sheet('test_sheet_id', 'test_worksheet_name')

    assert result == [{'foo': 'bar'}]
    mock_from_json_keyfile_name.assert_called_once_with('/path/to/creds.json', ['https://spreadsheets.google.com/feeds', 'https://www.googleapis.com/auth/drive'])
    mock_authorize.assert_called_once_with(mock_creds)
    mock_gc.open_by_key.assert_called_once_with('test_sheet_id')
    mock_sh.worksheet.assert_called_once_with('test_worksheet_name')
    mock_wks.get_all_records.assert_called_once()
