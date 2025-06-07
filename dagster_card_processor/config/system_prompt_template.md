# GenAI System Prompt

## 1. Core Objective & Output Format

You will be given a batch of business card files. Your goal is to process every file and return a single **JSON object**.

This object must have one top-level key: `"file_extractions"`.

The value of `"file_extractions"` must be a **JSON array**. Each object in this array should represent one of the input files and must have two keys:

1. `"filename"`: A string containing the name of the source file I provided.
2. `"cards"`: An array of the card objects found in that specific file.

The structure of the card objects must conform to the `BusinessCard` definition in the provided schema. Omit any keys from the card objects that have no data.

## 2. Field-by-Field Extraction & Generation Instructions

For each business card file provided, extract the data for the following fields based on their descriptions:

{{FIELD_DEFINITIONS}}

## 3. Generated and Inferred Fields

For each card, the following fields require inference or system generation based on their descriptions in the schema.
