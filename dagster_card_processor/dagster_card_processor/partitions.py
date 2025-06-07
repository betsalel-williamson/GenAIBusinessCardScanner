from dagster import DynamicPartitionsDefinition

# The DynamicPartitionsDefinition is now just a named container.
# The sensor is responsible for discovering and adding keys to it.
# The 'partitions_fn' is not needed for a sensor-driven workflow.
pdf_partitions = DynamicPartitionsDefinition(name="pdf_files")
