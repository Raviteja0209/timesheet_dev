// Get the current date and calculate the previous week's dates (Monday to Friday)
const today = new Date();
var selectedDaysArr = [];
var selectedDateRange = "";
var flatpickrInstance;
const bulkEntryRadio = document.getElementById("bulkEntry");
const manualEntryRadio = document.getElementById("manualEntry");
const fileUploaderContainer = document.getElementById("fileUploaderContainer");
const clearBtn = document.getElementById("clearBtn");
const fileUploader = document.getElementById("fileUploader");
const submitBtn = document.getElementById("submitBtn");
const clearIcon = document.getElementById("clearIcon");
const manualfileUploader = document.getElementById("manualfileUploader");
const manualclearIcon = document.getElementById("manualclearIcon");
var validColumns = {
  date: true,
  length: true,
  dailyhours: true,
  workitems: true,
  comment: true,
  userid: true,
  authtoken: true,
};
// Event listener for radio button change
bulkEntryRadio.addEventListener("change", function () {
  if (this.checked) {
    fileUploaderContainer.style.display = "block"; // Show file uploader
  }
});

manualEntryRadio.addEventListener("change", function () {
  if (this.checked) {
    fileUploaderContainer.style.display = "none"; // Hide file uploader
  }
});

// Handle submit button click
submitBtn.addEventListener("click", function () {
  const bulkEntry = bulkEntryRadio.checked;
  const manualEntry = manualEntryRadio.checked;
  const fileInput = document.getElementById("fileUploader").files;

  if (!bulkEntry && !manualEntry) {
    DevExpress.ui.notify(`Please select any one option.`, "warning", 3000);
    return;
  }

  if (bulkEntry) {
    if (fileInput.length === 0) {
      DevExpress.ui.notify(
        `Please upload a file for Bulk Entry.`,
        "warning",
        3000
      );
      return;
    } else {
      readExcel("fileUploader", "bulk");
    }
  } else if (manualEntry) {
    $(".uploadmode").addClass("hidden");
    $(".date-picker-container").removeClass("hidden");
    frameCalender();
  }
});

// Clear the file input when the "X" icon is clicked
clearIcon.addEventListener("click", function () {
  fileUploader.value = ""; // Clear the file input
  clearIcon.style.display = "none"; // Hide the "X" icon
});

// Clear the file input when the "X" icon is clicked
manualclearIcon.addEventListener("click", function () {
  manualfileUploader.value = ""; // Clear the file input
  manualclearIcon.style.display = "none"; // Hide the "X" icon
});

// Event Listeners for Yes and No buttons
document.getElementById("yesButton").addEventListener("click", function () {
  $(".card").addClass("hidden");
  $(".uploadmode").removeClass("hidden");
});

document.getElementById("noButton").addEventListener("click", function () {
  alert("Thank you for confirming!");
  window.close();
});

// Show the "X" icon when a file is selected
fileUploader.addEventListener("change", function () {
  if (fileUploader.files.length > 0) {
    $(".clear-icon").removeClass("hidden");
    clearIcon.style.display = "inline"; // Show the "X" icon
  } else {
    clearIcon.style.display = "none"; // Hide if no file is selected
  }
});

manualfileUploader.addEventListener("change", function () {
  if (manualfileUploader.files.length > 0) {
    $(".clear-icon").removeClass("hidden");
    manualclearIcon.style.display = "inline"; // Show the "X" icon
  } else {
    manualclearIcon.style.display = "none"; // Hide if no file is selected
  }
});

function formatDate(inpdate) {
  const dateObj = new Date(inpdate);
  const formattedDate = new Intl.DateTimeFormat("en-GB").format(dateObj);
  return formattedDate;
}

function downloadFile(filedata) {
  const jsonData = JSON.stringify(filedata, null, 2);
  const blob = new Blob([jsonData], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "output.txt";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function frameCalender() {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();

  // Get the first day of the current month
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1)
    .toISOString()
    .split("T")[0];

  flatpickrInstance = flatpickr("#daterange", {
    mode: "multiple", // Enables date range selection
    dateFormat: "Y-m-d",
    disable: [
      (date) => date.getDay() === 0 || date.getDay() === 6, // Disable weekends
    ],
    minDate: firstDayOfMonth,
    maxDate: today, // Set min date to the first day of the current month
    onChange: function (selectedDates, dateStr, instance) {
      selectedDateRange = dateStr; // Store the selected date range
      selectedDaysArr = [];
      selectedDaysArr = selectedDates.map((date) => {
        const day = date.toLocaleDateString("en-US", { weekday: "long" });
        const formattedDate = date.toLocaleDateString("en-US");
        return { day: day, date: formattedDate };
      });
    },
    // Automatically open the calendar
    inline: true, // Show calendar inline
    allowInput: false, // Prevent manual input
  });
}

// Function to show the modal
function showModal() {
  if (!selectedDateRange) {
    DevExpress.ui.notify(
      `Please select a dates before submitting.`,
      "error",
      3000
    );
    return false;
  }

  const fileInput = document.getElementById("manualfileUploader").files;
  if (fileInput.length === 0) {
    DevExpress.ui.notify(`Please upload a file.`, "warning", 3000);
    return false;
  }

  validateExcel("manualfileUploader");
  return false; // Prevent the form from submitting
}

// Function to close the modal
function closeModal() {
  $(".flatpickr-prev-month").removeClass("hidden");
  $(".flatpickr-next-month").removeClass("hidden");
  document.getElementById("confirmationModal").style.display = "none";
}

// Function to submit the form after confirmation
function submitForm() {
  let datesselected = selectedDaysArr;
  showLoading("UploadLoader");
  setTimeout(() => {
    readExcel("manualfileUploader", "manual", datesselected);
  }, 3000);
}

// Function to clear the selection
function clearSelection() {
  selectedDates = []; // Reset the selected dates array
  document.getElementById("daterange").value = ""; // Clear the Flatpickr input
  flatpickrInstance.clear(); // Clear the Flatpickr selection but keep the calendar
}

function readExcel(filID, methodtype, datesselected = false) {
  let ExcelData = [];
  var FileUploaded = $("#" + filID)[0]; // Use the correct ID variable
  if (typeof FileReader !== "undefined") {
    var reader = new FileReader();

    // Handle the readAsArrayBuffer method
    reader.onload = function (e) {
      var data = new Uint8Array(e.target.result);
      var binaryString = "";
      for (var i = 0; i < data.length; i++) {
        binaryString += String.fromCharCode(data[i]);
      }
      ExcelData = ProcessExcel(binaryString);
      if (!!ExcelData && ExcelData.length > 0 && isValidFile(ExcelData[0])) {
        if (methodtype == "bulk") {
          showLoading("UploadLoader");
        }
        setTimeout(() => {
          saveData(ExcelData, methodtype, datesselected);
        }, 3000);
      } else {
        hideLoading("UploadLoader");
        DevExpress.ui.notify(`please upload valid excel file.`, "error", 3000);
      }
    };

    // Use readAsArrayBuffer for reading files
    reader.readAsArrayBuffer(FileUploaded.files[0]);
  } else {
    alert("This browser does not support HTML5.");
  }
}

function validateExcel(filID) {
  let ExcelData = [];
  var FileUploaded = $("#" + filID)[0]; // Use the correct ID variable
  let isvalidexcelfile = false;
  if (typeof FileReader !== "undefined") {
    var reader = new FileReader();

    // Handle the readAsArrayBuffer method
    reader.onload = function (e) {
      var data = new Uint8Array(e.target.result);
      var binaryString = "";
      for (var i = 0; i < data.length; i++) {
        binaryString += String.fromCharCode(data[i]);
      }
      ExcelData = ProcessExcel(binaryString);
      if (!!ExcelData && ExcelData.length > 0 && isValidFile(ExcelData[0])) {
        $(".flatpickr-prev-month").addClass("hidden");
        $(".flatpickr-next-month").addClass("hidden");

        // Display the selected dates in the modal
        let datesDisplay = selectedDaysArr
          .map((item) => `${item.day}: ${item.date}`)
          .join("<br>");
        document.getElementById(
          "selectedDatesDisplay"
        ).innerHTML = `You have selected:<br><strong>${datesDisplay}</strong>`;

        // Show the modal
        document.getElementById("confirmationModal").style.display = "flex";
        $("#confirmationModal").removeClass("hidden");
      } else {
        DevExpress.ui.notify(`please upload valid excel file.`, "error", 3000);
      }
    };

    // Use readAsArrayBuffer for reading files
    reader.readAsArrayBuffer(FileUploaded.files[0]);
  } else {
    alert("This browser does not support HTML5.");
  }
}

function processmanualinfo(exceldata, datesselected) {
  let gridsource = [];
  datesselected.forEach((ele) => {
    for (i = 0; i < 3; i++) {
      gridsource.push({
        timeStamp: ele.date,
        length: Number(exceldata[0].length),
        billableLength: i == 0 ? 3 : i == 1 ? 3 : i == 2 ? 2 : 0,
        workItemId: Number(exceldata[i].Workitems),
        comment: exceldata[0].Comment,
        userId: exceldata[0].UserID,
        Authtoken: exceldata[0].Authtoken,
      });
    }
  });
  return gridsource;
}

function ProcessExcel(data) {
  var workbook = XLSX.read(data, {
    type: "binary",
  });
  var firstSheet = workbook.SheetNames[0];
  var excelRows = XLSX.utils.sheet_to_row_object_array(
    workbook.Sheets[firstSheet]
  );
  return excelRows;
}

function showLoading(id) {
  const modal = $("#" + id);
  modal.removeClass("hidden");
  document.body.style.overflow = "hidden"; // Hide scrollbar
}

function hideLoading(id) {
  const modal = $("#" + id);
  modal.addClass("hidden");
  document.body.style.overflow = "auto"; // Show scrollbar
}

function isValidFile(data) {
  let keys = Object.keys(data);
  let isValid = false;
  keys.forEach((ele) => {
    isValid = validColumns[ele.toLowerCase().replaceAll(" ", "")];
  });
  return isValid;
}

async function saveData(datainp, methodType, datesselected = false) {
  let payload = preparereq(datainp, methodType, datesselected);
  var settings = {
    url: "", //paste your api url here
    method: "POST",
    headers: {
      Authorization: datainp[0].Authtoken,
    },
    data: JSON.stringify(payload),
  };

  try {
    const res = await $.ajax(settings);
    if (!!res) {
      console.log(payload);
      hideLoading("UploadLoader");
      if (methodType == "manual") {
        closeModal();
        clearSelection();
      }
      confirmationDialog();
    }
  } catch (e) {
    hideLoading("UploadLoader");
    if (methodType == "manual") {
      closeModal();
      clearSelection();
    }
    DevExpress.ui.notify(
      `Failed to save your time entries,Please reach out to the support team`,
      "error",
      3000
    );
  }
}

function openHomePage(methodType) {
  $(".card").removeClass("hidden");
  $(".uploadmode").addClass("hidden");
  $(".date-picker-container").addClass("hidden");
  $(".clear-icon").addClass("hidden");
  methodType == "bulk"
    ? (fileUploader.value = "")
    : (manualfileUploader.value = "");
}

function hideUI() {
  $(".card").addClass("hidden");
  $(".uploadmode").addClass("hidden");
  $(".date-picker-container").addClass("hidden");
  $(".clear-icon").addClass("hidden");
  typeof fileUploader != undefined && !!fileUploader
    ? (fileUploader.value = "")
    : "";
  typeof manualfileUploader != undefined && !!manualfileUploader
    ? (manualfileUploader.value = "")
    : "";
}

function preparereq(data, methodType, seldates = false) {
  let reqpayload = [];
  if (methodType == "bulk") {
    data.forEach((ele) => {
      reqpayload.push({
        timeStamp: ele.date,
        length: Number(ele.length),
        billableLength: Number(ele["Daily Hours"]),
        workItemId: Number(ele.Workitems),
        comment: ele.Comment,
        userId: ele.UserID,
      });
    });
  } else if (methodType == "manual") {
    reqpayload = processmanualinfo(data, seldates);
  }
  return reqpayload;
}

function confirmationDialog() {
  hideUI();
  var result = DevExpress.ui.dialog.confirm(
    "Your timesheet has been successfully submitted. Would you like to close the application?"
  );
  result.done(function (dialogResult) {
    if (dialogResult) {
      window.close();
    } else {
      openHomePage();
    }
  });
}
