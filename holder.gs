function doPost(e) {
  try {
    console.log(
      "Received request:",
      e ? "Request object exists" : "No request object"
    );

    let data = {};

    // Check if we have parameters (form data)
    if (e && e.parameter) {
      console.log("Parameters received:", JSON.stringify(e.parameter));
      data = e.parameter;
    } else {
      // Try to get data from postData if available
      if (e && e.postData) {
        console.log("PostData type:", e.postData.type);
        if (e.postData.type === "application/x-www-form-urlencoded") {
          data = e.parameter || {};
        } else if (e.postData.type === "application/json") {
          data = JSON.parse(e.postData.contents);
        }
      } else {
        // If no data in expected locations, create empty data object
        console.log("No parameters or postData found, using empty data");
        data = {};
      }
    }

    console.log("Final data to process:", data);

    // Get the active sheet
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // Add headers if first row is empty
    if (sheet.getLastRow() === 0) {
      const headers = [
        "Timestamp",
        "Full Name",
        "Address",
        "City",
        "State",
        "ZIP",
        "Email",
        "Phone",
        "Experience",
        "Start Date",
        "References",
        "Comments",
        "Formatted Address",
        "Source",
      ];
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      console.log("Headers added to sheet");
    }

    // Prepare the row data with fallbacks
    const rowData = [
      data.timestamp || new Date().toLocaleString(),
      data.fullName || "",
      data.address || "",
      data.city || "",
      data.state || "",
      data.zip || "",
      data.email || "",
      data.phone || "",
      data.experience || "",
      data.start || "",
      data.references || "",
      data.comments || "",
      data.formattedAddress || "",
      data.source || "Personal Assistant Application Website",
    ];

    console.log("Appending row:", rowData);

    // Append the data to the sheet
    sheet.appendRow(rowData);

    const lastRow = sheet.getLastRow();
    console.log("Successfully added data to row:", lastRow);

    // Return success response
    return ContentService.createTextOutput(
      JSON.stringify({
        result: "success",
        message: "Data stored successfully",
        row: lastRow,
      })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    console.error("Error in doPost:", error.toString());

    // Return error response
    return ContentService.createTextOutput(
      JSON.stringify({
        result: "error",
        error: error.toString(),
      })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(
    JSON.stringify({
      status: "active",
      message: "Service is running",
      timestamp: new Date().toLocaleString(),
    })
  ).setMimeType(ContentService.MimeType.JSON);
}
