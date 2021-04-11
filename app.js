const BASE_URL = "https://api.harvardartmuseums.org";
const KEY = ""; // USE YOUR KEY HERE

// function that displays number of classifications and centuries in each category.
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
      // console.log(century);
      $("#select-century").append(
        `<option value="${century.century}">${century.century}</option>`
      );
    });
  } catch (error) {
    console.error(error);
  } finally {
    onFetchEnd();
  }
}

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

function buildSearchString() {
  const classif = $("#select-classification").val();
  const century = $("#select-century").val();
  const keywords = $("#keywords").val();

  const url = `${BASE_URL}/object?${KEY}&classification=${classif}&century=${century}&keyword=${keywords}`;

  return url;
}

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

function updatePreview({ info, records }) {
  const root = $("#preview");
  root.find(".results").empty();
  // console.log(info);

  if (info.next) {
    root.find(".next").data("url", info.next).attr("disabled", false);
  } else {
    root.find(".next").data("url", null).attr("disabled", true);
  }

  if (info.prev) {
    root.find(".previous").data("url", info.prev).attr("disabled", false);
  } else {
    root.find(".previous").data("url", null).attr("disabled", true);
  }

  // loop over the records, and append the renderPreview
  records.forEach(function (record) {
    $(".results").append(renderPreview(record));
  });
}

function renderFeature(record) {
  /**
   * We need to read, from record, the following:
   * HEADER: title, dated
   * FACTS: description, culture, style, technique, medium, dimensions, people, department, division, contact, creditline
   * PHOTOS: images, primaryimageurl
   */
  // console.log(record.title);

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
    ${factHTML("Culture", culture, searchURL("culture", culture))}
    ${factHTML("Style", style)}
    ${factHTML("Technique", technique, searchURL("technique", technique))}
    ${factHTML("Medium", medium, searchURL("medium", medium))}
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

  return element;
}

function onFetchStart() {
  $("#loading").addClass("active");
}

function onFetchEnd() {
  $("#loading").removeClass("active");
}

function searchURL(searchType, searchString) {
  return `${BASE_URL}/object?${KEY}&${searchType}=${searchString}`;
}

function factHTML(title, content, searchTerm = null) {
  // if content is empty or undefined, return an empty string ''
  if (!content) {
    return "";
  }
  // otherwise, if there is no searchTerm, return the two spans
  else if (searchTerm === null) {
    return `<span class="title">${title}</span><span class="content">${content}</span>`;
  }
  // otherwise, return the two spans, with the content wrapped in an anchor tag
  else {
    `<span class="title">${title}</span>
<span class="content"><a href="${searchTerm}">${content}</a></span>`;
  }
}

function photosHTML(images, primaryimageurl) {
  const baseimageurl = primaryimageurl;
  // if images is defined AND images.length > 0, map the images to the correct image tags, then join them into a single string.
  // the images have a property called baseimageurl, use that as the value for src
  if (images && images.length > 0) {
    return images
      .map(function (image) {
        return `<img src="${image.baseimageurl}"/>`;
      })
      .join("");
  }
  // else if primaryimageurl is defined, return a single image tag with that as value for src
  else if (primaryimageurl) {
    return `<img src="${primaryimageurl}" />`;
  }
  // else we have nothing, so return the empty
  else {
    return "";
  }
}

$("#search").on("submit", async function (event) {
  // prevent the default
  event.preventDefault();
  onFetchStart();

  try {
    const searchString = buildSearchString();
    const encodeUrl = encodeURI(searchString);
    // get the url from `buildSearchString`
    // const url = buildSearchString();
    // fetch it with await, store the result
    const response = await fetch(encodeUrl);
    const { info, records } = await response.json();
    // const data = await response.json();
    updatePreview({ info, records });
    // log out both info and records when you get them
    console.log(info);
    console.log(records);
  } catch (error) {
    // log out the error
    console.error(error);
  } finally {
    onFetchEnd();
  }
});

$("#preview .next, #preview .previous").on("click", async function () {
  onFetchStart();
  /*
    read off url from the target 
    fetch the url
    read the records and info from the response.json()
    update the preview
  */ try {
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

$("#preview").on("click", ".object-preview", function (event) {
  event.preventDefault(); // they're anchor tags, so don't follow the link
  // find the '.object-preview' element by using .closest() from the target
  const data = $(this).closest(".object-preview").data("record");
  // recover the record from the element using the .data('record') we attached
  // log out the record object to see the shape of the data
  console.log(event);
  // NEW => set the html() on the '#feature' element to renderFeature()
  $("#feature").html(renderFeature(data));
});

$("#feature").on("click", "a", async function (event) {
  // read href off of $(this) with the .attr() method
  const href = $(this).attr("href");
  if (href.startsWith("mailto")) {
    return;
  }
  // prevent default
  event.preventDefault();

  // call onFetchStart
  onFetchStart();

  try {
    // fetch the href
    const response = await fetch(href);
    const { info, records } = await response.json();
    // render it into the preview
    updatePreview(info, records);
    console.log(data);
  } catch (error) {
    console.error(error);
  } finally {
    onFetchEnd();
  }
});

// fetchObjects().then((x) => console.log(x)); // { info: {}, records: [{}, {},]}
prefetchCategoryLists();
