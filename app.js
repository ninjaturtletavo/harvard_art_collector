const BASE_URL = "https://api.harvardartmuseums.org";
const KEY = ""; // USE YOUR KEY HERE

//function that displays drop down menu based on classification and century.
async function prefetchCategoryLists() {
  onFetchStart();

  try {
    const [classifications, centuries] = await Promise.all([
      fetchAllClassifications(),
      fetchAllCenturies(),
    ]);

    // This provides a clue to the user, that there are items in the dropdown
    $(".classification-count").text(`(${classifications.length})`);

    classifications.forEach((classification) => {
      // append a correctly formatted option tag into
      // the element with id select-classification
      // creates a selection in drop down menu under these properties
      $("#select-classification").append(
        `<option value="${classification.name}">${classification.name}</option>`
      );
    });

    // This provides a clue to the user, that there are items in the dropdown
    $(".century-count").text(`(${centuries.length})`);

    centuries.forEach((century) => {
      // append a correctly formatted option tag into
      // the element with id select-century
      // creates a selection in drop down menu under these properties
      $("#select-century").append(
        `<option value="${century.name}">${century.century}</option>`
      );
    });
  } catch (error) {
    console.error(error);
  } finally {
    onFetchEnd();
  }
}

//
async function fetchAllCenturies() {
  const url = `${BASE_URL}/century?${KEY}&size=100&sort=temporalorder`;

  onFetchStart();

  if (localStorage.getItem("centuries")) {
    // console.log("saved");
    return JSON.parse(localStorage.getItem("centuries"));
  }

  try {
    const response = await fetch(url);
    const data = await response.json();
    const records = data.records;

    // storing in local storage
    localStorage.setItem("centuries", JSON.stringify(records));

    return records;
  } catch (error) {
    console.error(error);
  } finally {
    onFetchEnd();
  }
}

async function fetchAllClassifications() {
  const url = `${BASE_URL}/classification?${KEY}&size=100&sort=name`;

  onFetchStart();

  if (localStorage.getItem("classifications")) {
    // console.log("saved");
    return JSON.parse(localStorage.getItem("classifications"));
  }

  try {
    const response = await fetch(url);
    const data = await response.json();
    const records = data.records;

    // storing in local storage
    localStorage.setItem("classifications", JSON.stringify(records));

    return records;
  } catch (error) {
    console.error(error);
  } finally {
    onFetchEnd();
  }
}

async function fetchObjects() {
  const url = `${BASE_URL}/object?${KEY}`;
  onFetchStart();

  try {
    const response = await fetch(url);
    const data = await response.json();

    return data;
  } catch (error) {
    console.error(error);
  } finally {
    onFetchEnd();
  }
}

// function that returns new url as search string based on new search string and/or drop down menu selections
function buildSearchString() {
  const classif = $("#select-classification").val();
  const century = $("#select-century").val();
  const keywords = $("#keywords").val();

  const url = `${BASE_URL}/object?${KEY}&classification=${classif}&century=${century}&keyword=${keywords}`;

  return url;
}

// function that renders preview with an image, title, and description
function renderPreview(record) {
  const { description, primaryimageurl, title } = record;

  return $(`<div class="object-preview">
      <a href="#">
        ${primaryimageurl ? `<img src="${primaryimageurl}" />` : ""}
        ${title ? `<h3>${title}</h3>` : ""}
        ${description ? `<h3>${description}</h3>` : ""}
      </a>
    </div>`).data("record", record);
}

// function that updates preview when next and previous buttons clicked
function updatePreview({ info, records }) {
  $(".results").empty();
  const root = $("#preview");

  if (info.next) {
    $(".next").data("url", info.next).attr("disabled", false);
  } else {
    $(".next").data("url", null).attr("disabled", true);
  }

  if (info.prev) {
    $(".previous").data("url", info.prev).attr("disabled", false);
  } else {
    $(".previous").data("url", null).attr("disabled", true);
  }

  // loop over the records, and append the renderPreview
  records.forEach(function (record) {
    $(".results").append(renderPreview(record));
  });
}

// function that renders item selected and displays information based on key/value pairs
function renderFeature(record) {
  const {
    title,
    dated,
    description,
    culture,
    style,
    technique,
    medium,
    dimensions,
    people,
    department,
    division,
    contact,
    creditline,
    images,
    primaryimageurl,
  } = record;

  const element = $(`<div class="object-feature">
     <header>
    ${title ? `<h3>${title}</h3>` : ""}
    ${dated ? `<h3>${dated}</h3>` : ""}
  
     </header>
     <section class="facts">
      ${factHTML("Description", description)}
      ${factHTML("Culture", culture, "culture")}
      ${factHTML("Style", style)}
      ${factHTML("Technique", technique, "technique")}
      ${factHTML("Medium", medium, "medium")}
      ${factHTML("Dimensions", dimensions)}
      ${
        people
          ? people
              .map((person) => {
                return factHTML("Person", person.displayname, "person");
              })
              .join("")
          : ""
      }
      ${factHTML("Department", department)}
      ${factHTML("Division", division)}
      ${factHTML(
        "Contact",
        `<a target="_blank" href="mailto:${contact}">${contact}</a>`
      )}
      ${factHTML("Creditline", creditline)}
     </section>
     <section class="photos">
     ${photosHTML(images, primaryimageurl)}
     </section>
   </div>`);

  $("#feature").append(element);
  return element;
}

function searchURL(searchType, searchString) {
  return `${BASE_URL}/object?${KEY}&${searchType}=${searchString}`;
}

// function that returns information based on item selected in main section of page, object-preview
function factHTML(title, content, searchTerm = null) {
  if (!content) {
    return "";
  } else if (!searchTerm || searchTerm === null) {
    return `<span class="title">${title}</span><span class="content">${content}</span>`;
  } else {
    return `<span class="title">${title}</span>
  <span class="content"><a href="${searchURL(
    searchTerm,
    content
  )}">${content}</a></span>`;
  }
}

// function for displaying images in the main section of page, object-preview
function photosHTML(images, primaryimageurl) {
  if (images && images.length > 0) {
    return images
      .map(function (image) {
        return `<img src="${image.baseimageurl}"/>`;
      })
      .join("");
  } else if (primaryimageurl) {
    return `<img src="${primaryimageurl}" />`;
  } else {
    return "";
  }
}

function onFetchStart() {
  $("#loading").addClass("active");
}

function onFetchEnd() {
  $("#loading").removeClass("active");
}

// function that when search clicked/enter searches based on searchString and
$("#search").on("submit", async function (event) {
  // prevent the default
  event.preventDefault();
  onFetchStart();

  try {
    const searchString = buildSearchString();
    const encodeUrl = encodeURI(searchString);
    const response = await fetch(encodeUrl);
    // info brings back totalrecords, pages, and next url
    // records return item found with information and displays left side of page with a preview
    const { info, records } = await response.json();

    updatePreview({ info, records });
  } catch (error) {
    // log out the error
    console.error(error);
  } finally {
    onFetchEnd();
  }
});

// function that goes to next/previous page
$("#preview .next, #preview .previous").on("click", async function () {
  onFetchStart();

  try {
    const url = $(this).data("url");
    const response = await fetch(url);
    const { info, records } = await response.json();
    updatePreview({ info, records });

    console.log(info, records);
  } catch (error) {
    console.error(error);
  } finally {
    onFetchEnd();
  }
});

// function that displays item clicked on left side of page to main side of page previewing item with info
$("#preview").on("click", ".object-preview", function (event) {
  event.preventDefault();

  const element = $(this).closest(".object-preview");
  const data = element.data("record");

  $("#feature").html(renderFeature(data));
});

// function that on anchor tag click with email, opens new window to email the address
$("#feature").on("click", "a", async function (event) {
  const anchor = $(this).attr("href");
  if (href.startsWith("mailto")) {
    return;
  }

  event.preventDefault();
  onFetchStart();

  try {
    const response = await fetch(anchor);
    const { info, records } = await response.json();

    updatePreview(info, records);
  } catch (error) {
    console.error(error);
  } finally {
    onFetchEnd();
  }
});

prefetchCategoryLists();
