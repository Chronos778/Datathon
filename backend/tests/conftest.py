import os
import socket
import pytest

# Ensure tests run offline and deterministically without external network calls
os.environ["GEMINI_API_KEY"] = ""
os.environ["FEEDBACKIQ_DISABLE_TRANSFORMER"] = "1"
os.environ["FEEDBACKIQ_DISABLE_EMBEDDINGS"] = "1"
os.environ["HF_HUB_OFFLINE"] = "1"
os.environ["TRANSFORMERS_OFFLINE"] = "1"


def _check_loopback_supported() -> bool:
    try:
        s = socket.socket()
        s.bind(("127.0.0.1", 0))
        s.listen(1)
        port = s.getsockname()[1]
        c = socket.socket()
        c.settimeout(0.5)
        c.connect(("127.0.0.1", port))
        c.close()
        s.close()
        return True
    except Exception:
        return False


LOOPBACK_AVAILABLE = _check_loopback_supported()


@pytest.fixture(autouse=True)
def skip_if_no_loopback_for_testclient(request):
    if not LOOPBACK_AVAILABLE:
        # Check if the test function or its module imports or uses TestClient
        test_func = request.function
        func_code = test_func.__code__
        names = func_code.co_names
        if "TestClient" in names:
            pytest.skip("TestClient requires loopback socket access which is restricted in this sandbox environment")
