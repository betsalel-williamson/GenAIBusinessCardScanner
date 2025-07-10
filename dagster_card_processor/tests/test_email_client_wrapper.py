from unittest.mock import MagicMock, patch
import pytest

from dagster_card_processor.postmark_email_client import PostmarkEmailClient
from postmarker.core import PostmarkClient

@patch('postmarker.core.PostmarkClient.__new__') # Patch __new__ to control instance creation
def test_postmark_email_client_send_templated_email(mock_postmark_client_new):
    """
    Tests that PostmarkEmailClient correctly wraps PostmarkClient's send_with_template method.
    """
    # Arrange
    mock_client_instance = MagicMock(spec=PostmarkClient) # Mock the instance returned by PostmarkClient()
    mock_client_instance.emails = MagicMock() # Ensure the mock instance has an 'emails' attribute
    mock_postmark_client_new.return_value = mock_client_instance # What PostmarkClient() returns

    mock_client_instance.emails.send_with_template.return_value = {
        'Message': 'OK', 'MessageID': '123'
    }

    client = PostmarkEmailClient(
        api_token="test_token",
        sender_email="sender@example.com"
    )

    to_email = "recipient@example.com"
    template_id = 12345
    template_model = {"name": "Test User", "item": "Test Item"}

    # Act
    response = client.send_templated_email(to_email, template_id, template_model)

    # Assert
    mock_postmark_client_new.assert_called_once_with(PostmarkClient, server_token="test_token") # Assert on the __new__ call
    mock_client_instance.emails.send_with_template.assert_called_once_with(
        From="sender@example.com",
        To=to_email,
        TemplateId=template_id,
        TemplateModel=template_model,
    )
    assert response == {'Message': 'OK', 'MessageID': '123'}
