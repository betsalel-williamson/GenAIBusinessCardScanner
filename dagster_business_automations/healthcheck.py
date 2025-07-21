import requests
import sys

DAGSTER_UI_URL = "http://localhost:3000"


def health_check():
    """
    Performs a health check on the Dagster UI.
    """
    print(f"Attempting to connect to Dagster UI at {DAGSTER_UI_URL}...")
    try:
        response = requests.get(DAGSTER_UI_URL, timeout=5)
        if response.status_code == 200:
            print(
                f"Health check successful! Dagster UI is reachable (Status Code: {response.status_code})."
            )
            return True
        else:
            print(
                f"Health check failed: Received status code {response.status_code} from {DAGSTER_UI_URL}."
            )
            return False
    except requests.exceptions.ConnectionError:
        print(
            f"Health check failed: Could not connect to Dagster UI at {DAGSTER_UI_URL}. Is it running?"
        )
        return False
    except requests.exceptions.Timeout:
        print(f"Health check failed: Connection to {DAGSTER_UI_URL} timed out.")
        return False
    except Exception as e:
        print(f"An unexpected error occurred during health check: {e}")
        return False


if __name__ == "__main__":
    if not health_check():
        sys.exit(1)
