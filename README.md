# BusinessCardGenAI

This is a program that input is PDFs of business cards and output is structured dataset of the business card information.

The scale is to handle up to 500 cards a day.

Sample of card takes 127 seconds to transcribe and format the data manually into the spread sheet.

The initial dataset contains 132 cards which would take approximately 04:39:24 HH:MM:SS to process manually.

Considering that this is likely to become a regular task (get new cards after an event or process cards from prior events) it becomes a nice target for automation.

The issue is that manual parsers aren't flexible enough to deal with unstructured data.

I would like to build the system that makes it simple to scan the information and then allow me to confirm that the data is correct.

Workflow is that I have the card scanned as PDF or Image (I don't want to care about the formatting), then this information is passed on to GenAI to perform OCR with well formed output given data fields

I may also want to input data from spreadsheets.

```JSON
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Business Card Data Array",
  "description": "A JSON array containing one or more extracted business card data objects.",
  "type": "array",
  "items": {
    "$ref": "#/definitions/BusinessCard"
  },
  "definitions": {
    "BusinessCard": {
      "type": "object",
      "title": "Business Card",
      "description": "Represents the data extracted from a single business card. Only include properties for which data was found.",
      "properties": {
        "Company": {
          "type": "string",
          "description": "The legal or brand name of the company."
        },
        "Website": {
          "type": "string",
          "description": "The company's website URL.",
          "format": "uri"
        },
        "Prefix": {
          "type": "string",
          "description": "An honorific prefix for the contact's name (e.g., Mr., Mrs., Dr.)."
        },
        "Full Name": {
          "type": "string",
          "description": "The full name of the contact."
        },
        "First Name": {
          "type": "string",
          "description": "The first name of the contact."
        },
        "Last Name": {
          "type": "string",
          "description": "The last name of the contact."
        },
        "Title": {
          "type": "string",
          "description": "The job title of the contact."
        },
        "Address 1": {
          "type": "string",
          "description": "The first line of the street address."
        },
        "Address 2": {
          "type": "string",
          "description": "The second line of the address (e.g., suite, apartment number)."
        },
        "Address 3": {
          "type": "string",
          "description": "The third line of the address."
        },
        "City": {
          "type": "string"
        },
        "State/State Code": {
          "type": "string",
          "description": "The state, province, or territory."
        },
        "Country/Country Code": {
          "type": "string"
        },
        "Zip Code/Post Code": {
          "type": "string",
          "description": "The postal or ZIP code."
        },
        "Phone": {
          "type": "string"
        },
        "Extension": {
          "type": "string"
        },
        "Cell": {
          "type": "string"
        },
        "Email": {
          "type": "string",
          "format": "email"
        },
        "Retailer Type": {
          "type": "string"
        },
        "Store Count": {
          "type": "string"
        },
        "Show Status": {
          "type": "string"
        },
        "Source": {
          "type": "string",
          "description": "The filename or other information of the source."
        },
        "Sheet": {
          "type": "string",
          "description": "If data is from a spreadsheet, the name of the sheet that the data is from."
        },
        "Date Imported": {
          "type": "string",
          "description": "ISO 8601 date YYYY-MM-DD in UTC"
        },
        "Time Imported": {
          "type": "string",
          "description": "ISO 8601 time HH:MM:SSZ"
        },
        "Company Assignment": {
          "type": "string",
          "description": "Which entity is responsible for dealing with the data"
        },
        "Contact Type": {
          "type": "string",
          "description": "B2B or D2C lead"
        },
        "Color": {
          "type": "string",
          "description": "A color code or name associated with the contact. This is needed if the data source is a spreadsheet and the row was highlighed"
        },
        "Qualifiers": {
          "type": "string",
          "description": "If the lead is a sales qualified lead"
        },
        "Notes": {
          "type": "string",
          "description": "A compilation of qualitative information, including visual details of the card, business type, handwritten notes, and decoded QR code URLs."
        },
        "ConfirmationNumber": {
          "type": "string"
        },
        "ClientID": {
          "type": "string"
        },
        "Products": {
          "type": "string",
          "description": "A description of the company's products or services."
        }
      },
      "additionalProperties": false
    }
  }
}
```
