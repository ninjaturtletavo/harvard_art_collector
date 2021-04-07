const BASE_URL = "https://api.harvardartmuseums.org";
const KEY = "apikey=3ec295d8-a537-46e2-813b-cbbfb35dbec0"; // USE YOUR KEY HERE

// function fetchObjects() {
//   const url = `${BASE_URL}/object?${KEY}`;

//   fetch(url)
//     .then(function (response) {
//       return response.json();
//     })
//     .then(function (response) {
//       console.log(response);
//     })
//     .catch(function (error) {
//       console.error(error);
//     });
// }

// function that displays number of classifications and centuries in each category.
async function prefetchCategoryLists() {
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
    $(".century-count").text(`(${centuries.length}))`);

    centuries.forEach((century) => {
      // append a correctly formatted option tag into
      // the element with id select-century
      // creates a selection in drop down menu under these properties
      $("#select-century").append(
        `<option value="${century.name}">${century.name}</option>`
      );
    });
  } catch (error) {
    console.error(error);
  }
}

async function fetchAllCenturies() {
  const url = `${BASE_URL}/century?${KEY}&size=100&sort=temporalorder`;

  if (localStorage.getItem("centuries")) {
    console.log("saved");
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
  }
}

async function fetchAllClassifications() {
  const url = `${BASE_URL}/classification?${KEY}&size=100&sort=name`;

  if (localStorage.getItem("classifications")) {
    console.log("saved");
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
  }
}

async function fetchObjects() {
  const url = `${BASE_URL}/object?${KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    return data;
  } catch (error) {
    console.error(error);
  }
}

fetchObjects().then((x) => console.log(x)); // { info: {}, records: [{}, {},]}
prefetchCategoryLists();
