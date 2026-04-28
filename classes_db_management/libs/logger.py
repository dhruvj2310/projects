"""Logger utility for the chatbot application."""

import logging


class ColourisedFormatter(logging.Formatter):
    COLOR_MAP = {
        "DEBUG": "\033[94m",  # Blue
        "INFO": "\033[92m",  # Green
        "WARNING": "\033[93m",  # Yellow
        "ERROR": "\033[91m",  # Red
        "CRITICAL": "\033[95m",  # Magenta
    }
    RESET = "\033[0m"

    def __init__(self, fmt=None, datefmt=None, use_colors=True):
        super().__init__(fmt=fmt, datefmt=datefmt)
        self.use_colors = use_colors

    def format(self, record):
        if self.use_colors and record.levelname in self.COLOR_MAP:
            levelname_color = (
                self.COLOR_MAP[record.levelname] + record.levelname + self.RESET
            )
            record.levelname = levelname_color
        return super().format(record)


def get_logger() -> logging.Logger:
    """Returns a configured logger with colorful output."""
    logger = logging.getLogger()

    if logger.hasHandlers():
        return logger  # Prevent adding handlers multiple times

    logger.setLevel(logging.INFO)

    # Formatter with colors
    formatter = ColourisedFormatter(
        fmt="%(asctime)s | %(levelname)s | %(filename)s:%(lineno)d | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
        use_colors=True,
    )

    # Console handler
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)
    return logger
