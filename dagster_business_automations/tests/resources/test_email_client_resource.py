from unittest.mock import MagicMock

from dagster_card_processor.resources.email_client_resource import EmailClientResource
from dagster_card_processor.email_client_interface import EmailClient


def test_email_client_resource_send_templated_email():
    """
    Tests that the EmailClientResource correctly initializes and calls the injected EmailClient's
    send_templated_email method.
    """
    # Arrange
    mock_context = MagicMock()  # Mock the context object
    mock_context.log = MagicMock()  # Mock the log attribute of the context

    mock_email_client_instance = MagicMock(
        spec=EmailClient
    )  # Mock the instance of our EmailClient
    mock_email_client_instance.send_templated_email.return_value = {
        "Message": "OK",
        "MessageID": "123",
    }

    resource = EmailClientResource(email_client=mock_email_client_instance)
    resource.setup_for_execution(mock_context)

    to_email = "recipient@example.com"
    template_id = 12345
    template_model = {"name": "Test User", "item": "Test Item"}

    # Act
    response = resource.send_templated_email(to_email, template_id, template_model)

    # Assert
    mock_email_client_instance.send_templated_email.assert_called_once_with(
        to_email,
        template_id,
        template_model,
    )
    assert response == {"Message": "OK", "MessageID": "123"}
    mock_context.log.info.assert_any_call(
        "EmailClientResource initialized with provided client."
    )
