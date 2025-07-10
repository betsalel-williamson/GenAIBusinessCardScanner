from abc import ABC, abstractmethod

class EmailClient(ABC):
    @abstractmethod
    def send_templated_email(
        self, to_email: str, template_id: int, template_model: dict
    ) -> dict:
        pass
