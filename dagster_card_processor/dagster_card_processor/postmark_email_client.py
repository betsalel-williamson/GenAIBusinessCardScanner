from postmarker.core import PostmarkClient
from dagster_card_processor.email_client_interface import EmailClient


class PostmarkEmailClient(EmailClient):
    def __init__(self, api_token: str, sender_email: str):
        self._client = PostmarkClient(server_token=api_token)
        self._sender_email = sender_email

    def send_templated_email(
        self, to_email: str, template_id: int, template_model: dict
    ) -> dict:
        response = self._client.emails.send_with_template(
            From=self._sender_email,
            To=to_email,
            TemplateId=template_id,
            TemplateModel=template_model,
        )
        return response
