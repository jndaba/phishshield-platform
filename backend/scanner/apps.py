
import os
import sys
import logging

from django.apps import AppConfig

logger = logging.getLogger(__name__)


class ScannerConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "scanner"

    def ready(self):
        # Only preload when starting Django's development server.
        # Avoid loading the model during migrations and other commands.
        if "runserver" not in sys.argv:
            return

        # Django's autoreloader starts a parent and a child process.
        # Load the model only in the child process.
        if (
            "--noreload" not in sys.argv
            and os.environ.get("RUN_MAIN") != "true"
        ):
            return

        try:
            from .ml_model.predict import get_model_and_metadata

            logger.info("PhishShield: Initialising Random Forest model...")
            get_model_and_metadata()
            logger.info("PhishShield: Random Forest model loaded successfully.")

        except Exception:
            logger.exception("PhishShield: Model initialisation failed.")
