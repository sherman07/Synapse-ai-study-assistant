import threading
import unittest

from backend.app import run_blocking


class AnalysisOffloadingTests(unittest.IsolatedAsyncioTestCase):
    async def test_blocking_analysis_work_runs_outside_event_loop_thread(self):
        event_loop_thread = threading.get_ident()
        worker_thread = await run_blocking(threading.get_ident)

        self.assertNotEqual(
            worker_thread,
            event_loop_thread,
            "blocking analysis work must not starve Uvicorn's event loop",
        )


if __name__ == "__main__":
    unittest.main()
