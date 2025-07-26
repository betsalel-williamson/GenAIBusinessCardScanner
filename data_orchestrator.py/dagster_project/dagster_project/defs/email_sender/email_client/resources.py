from dagster import ConfigurableResource, InitResourceContext, ResourceDependency
from dagster_project.email_client_interface import EmailClient


class EmailClientResource(ConfigurableResource):
    email_client: ResourceDependency[EmailClient]
    _log = None

    def setup_for_execution(self, context: InitResourceContext) -> None:
        self._log = context.log
        self._log.info("EmailClientResource initialized with provided client.")

    def send_templated_email(
        self, to_email: str, template_id: int, template_model: dict
    ) -> dict:
        if self.email_client is None:
            raise Exception("EmailClient not set during resource initialization.")
        try:
            response = self.email_client.send_templated_email(
                to_email, template_id, template_model
            )
            self._log.info(
                f"Templated email sent to {to_email} using template {template_id}: {response}"
            )
            return response
        except Exception as e:
            self._log.error(f"Failed to send templated email to {to_email}: {e}")
            raise
