import json
from unittest.mock import MagicMock

from dagster import build_sensor_context, SensorResult

from dagster_card_processor.sensors import pdf_files_sensor

def test_pdf_files_sensor_no_new_files(mocker):
    """
    Tests the sensor when no new files are present.
    """
    mocker.patch("os.path.isdir", return_value=True)
    mocker.patch("os.listdir", return_value=["file1.pdf"])

    context = build_sensor_context(cursor=json.dumps(["file1.pdf"]))
    result = pdf_files_sensor(context)

    assert result is None


def test_pdf_files_sensor_initial_run(mocker):
    """
    Tests the sensor on its first run with new files.
    """
    new_files = ["card1.pdf", "card2.pdf"]
    mocker.patch("os.path.isdir", return_value=True)
    mocker.patch("os.listdir", return_value=new_files)

    context = build_sensor_context(cursor=None)

    # Spy on the context's update_cursor method before running the sensor
    spy_update_cursor = mocker.spy(context, "update_cursor")

    result = pdf_files_sensor(context)

    assert isinstance(result, SensorResult)
    assert len(result.run_requests) == 2
    assert sorted([rr.run_key for rr in result.run_requests]) == sorted(new_files)
    assert result.run_requests[0].tags == {"concurrency_key": "gemini_api"}
    assert sorted(result.dynamic_partitions_requests[0].partition_keys) == sorted(new_files)

    # Fix: Assert that the cursor was updated correctly (order-independent)
    spy_update_cursor.assert_called_once()
    # Get the actual call argument, parse it, and compare contents
    actual_cursor_str = spy_update_cursor.call_args[0][0]
    assert sorted(json.loads(actual_cursor_str)) == sorted(new_files)


def test_pdf_files_sensor_incremental_run(mocker):
    """
    Tests the sensor when one new file is added after a previous run.
    """
    initial_files = ["card1.pdf"]
    updated_files = ["card1.pdf", "card2.pdf"]
    newly_added_file = "card2.pdf"

    mocker.patch("os.path.isdir", return_value=True)
    mocker.patch("os.listdir", return_value=updated_files)

    context = build_sensor_context(cursor=json.dumps(initial_files))
    spy_update_cursor = mocker.spy(context, "update_cursor")

    result = pdf_files_sensor(context)

    assert isinstance(result, SensorResult)
    assert len(result.run_requests) == 1
    assert result.run_requests[0].run_key == newly_added_file
    assert result.run_requests[0].partition_key == newly_added_file
    assert result.dynamic_partitions_requests[0].partition_keys == [newly_added_file]

    # Fix: Assert that the cursor was updated with the full new list of files (order-independent)
    spy_update_cursor.assert_called_once()
    actual_cursor_str = spy_update_cursor.call_args[0][0]
    assert sorted(json.loads(actual_cursor_str)) == sorted(updated_files)


def test_pdf_files_sensor_directory_not_exist(mocker):
    """
    Tests that the sensor does nothing if the input directory doesn't exist.
    """
    mocker.patch("os.path.isdir", return_value=False)
    mock_listdir = mocker.patch("os.listdir")

    context = build_sensor_context()
    result = pdf_files_sensor(context)

    assert result is None
    mock_listdir.assert_not_called()
