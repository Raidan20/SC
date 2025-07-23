// Loading the data
let table;


// Exploring the database button
const exp_btn =  document.getElementById('exp_btn');
const content_box = document.getElementById('content_box');
const header = document.getElementById('header');

exp_btn.addEventListener('click', function () {
  content_box.style.display = 'block';
  scrollToElementWithOffset('filterGovernorate', -40);  // 0 offset is fine

  setTimeout(function () {
    header.style.display = 'none';
  }, 1000);
});


function showRowDetails(row) {
  const modalBody = $("#modalDetailsBody");
  modalBody.empty();

  const fields = {
    "Week": row.weekly_report,
    "Date": row.event_date,
    "Event Type": row.event_type,
    "Sub Event Type": row.sub_event_type,
    "Actor 1": row.actor1,
    "Actor 2": row.actor2,
    "Governorate": row.admin1,
    "District": row.admin2,
    "Location": row.location,
    'Frontline': row.frontline,
    "Notes": row.notes,
    "Fatalities": row.fatalities,
    "Actor 1 Casualties": row.actor1_Casualties,
    "Actor 2 Casualties": row.actor2_Casualties,
    "Source": row.source,
  };

  for (const [key, value] of Object.entries(fields)) {
    modalBody.append(`
      <tr>
        <th style="width: 30%">${key}</th>
        <td>${value || "—"}</td>
      </tr>
    `);
  }

  // Correct ID reference
  const modalElement = document.getElementById("detailsModal");
  const modal = new bootstrap.Modal(modalElement);

  modal.show();
}



// showing the table data
function renderTableRows(data) {
  const tableBody = $("#dataTable");
  tableBody.empty();

  data.forEach((row, index) => {
    const tr = $("<tr>").css("cursor", "pointer");
    tr.append(`<td>${row.event_date}</td>`);
    tr.append(`<td>${row.event_type}</td>`);
    tr.append(`<td>${row.sub_event_type}</td>`);
    tr.append(`<td>${row.admin1}</td>`);
    tr.append(`<td>${row.admin2}</td>`);
    tr.append(`<td>${row.notes}</td>`);
    tr.append(`<td>${row.source}</td>`);

    // On row click, show modal
    tr.on("click", function () {
      showRowDetails(row);
    });

    tableBody.append(tr);
  });
}

  const type_data = {
      Economy: [],
      Health_and_Environment: [],
      Military_and_Security: ['Air/drone strike', 'Armed Clash among tribes', 'Armed Clash with Al-Qaeda', 'Armed Clash with Houthis',
                              'Armed clash (other groups)', 'Assassination & Arrest', 'Attacks on shipments', 'Disrupted weapons use',
                              'Looting/property destruction', 'Remote explosive/landmine/IED',
                              'Shelling/artillery/missile attack', 'Violence against civilians'],
      Politics_and_Diplomacy: ['Agreement', 'Change to group/activity', 'Excessive force against protesters', 'Headquarters or base established', 'International',
 '                             Non-violent transfer of territory', 'Other', 'Peaceful protest', 'Protest with intervention', 'Strategic developments',
                              'Violent demonstration'],
  };




// Showing stats information 

// Getting the elements
const event_num = document.getElementById('event_num');
const governorate = document.getElementById('governorate');
const eventType = document.getElementById('event_type');
const subType = document.getElementById('sub_type');
const startDate_stats = document.getElementById('start_date');
const endDate_stats = document.getElementById('end_date');



// Functions 
function animateCount(element, target, duration = 120) {
  let start = 0;
  const stepTime = Math.abs(Math.floor(duration / target));
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const value = Math.floor(progress * target);
    element.innerText = value.toLocaleString();

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

// Functions 
function animateCountPercent(element, targetPercent, duration = 1200) {
  const startTime = performance.now();
  const progressLine = element.previousElementSibling?.querySelector('.progress-line');

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const value = (progress * targetPercent).toFixed(2);

    element.innerText = `${value}%`;

    if (progressLine) {
      progressLine.style.width = `${value}%`;
    }

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}



// Governorates Stats
const gover_container = document.getElementById('gover_content');

function show_govers_stats(events) {
  gover_container.innerHTML = ''; 

  const clear_data = events
    .map(event => event.admin1)
    .filter(name => name && name !== "Outside Yemen" && !Number.isNaN(name));

  const data_len = clear_data.length;

  // Count events per governorate
  const govCounts = [...new Set(clear_data)].map(gover_name => {
    const count = events.filter(event => event.admin1 === gover_name).length;
    return { name: gover_name, count };
  });

  // Sort descending by count
  govCounts.sort((a, b) => b.count - a.count);

  // Create the elements
  govCounts.forEach(({ name: gover_name, count }) => {
    const percent = ((count / data_len) * 100).toFixed(2);

    const div = document.createElement('div');
    div.className = 'gover_percent';

    const h1 = document.createElement('h1');
    h1.className = 'stats_titles3';
    h1.innerHTML = gover_name;

    const progressContainer = document.createElement('div');
    progressContainer.className = 'progress-container';

    const progressLine = document.createElement('div');
    progressLine.className = 'progress-line';
    progressContainer.appendChild(progressLine);

    const h2 = document.createElement('h2');
    h2.className = 'stats_results3';

    div.appendChild(h1);
    div.appendChild(progressContainer);
    div.appendChild(h2);
    gover_container.appendChild(div);

    animateCountPercent(h2, percent, 1500);
  });
}


// Event types stats
const type_container = document.getElementById('type_content');

function show_event_type_stats(events) {
  type_container.innerHTML = '';

  // Filter event types, removing falsy, "Outside Yemen", NaN etc.
  const clean_types = events
    .map(event => event.event_type)
    .filter(type => type);

  const data_len = clean_types.length;

  // Count events per event type
  const typeCounts = [...new Set(clean_types)].map(typeName => {
    const count = events.filter(event => event.event_type === typeName).length;
    return { name: typeName, count };
  });

  // Sort descending by count
  typeCounts.sort((a, b) => b.count - a.count);

  // Build HTML and animate counts
  typeCounts.forEach(({ name: typeName, count }) => {
    const percent = ((count / data_len) * 100).toFixed(2);

    const div = document.createElement('div');
    div.className = 'type_percent';

    const h1 = document.createElement('h1');
    h1.className = 'stats_titles3';
    h1.innerHTML = typeName;
    h1.style.whiteSpace = 'nowrap'; // prevent wrapping

    const progressContainer = document.createElement('div');
    progressContainer.className = 'progress-container';

    const progressLine = document.createElement('div');
    progressLine.className = 'progress-line';
    progressContainer.appendChild(progressLine);

    const h2 = document.createElement('h2');
    h2.className = 'stats_results3';

    div.appendChild(h1);
    div.appendChild(progressContainer);
    div.appendChild(h2);
    type_container.appendChild(div);

    animateCountPercent(h2, percent, 1500);
  });
}

// Event Sub-type stats
const subType_container = document.getElementById('subType_content');

function show_subtype_stats(events) {
  subType_container.innerHTML = '';

  const clean_subtypes = events
    .map(event => event.sub_event_type)
    .filter(sub => sub);

  const data_len = clean_subtypes.length;

  const subTypeCounts = [...new Set(clean_subtypes)].map(subTypeName => {
    const count = events.filter(event => event.sub_event_type === subTypeName).length;
    return { name: subTypeName, count };
  });


  subTypeCounts.sort((a, b) => b.count - a.count);

  subTypeCounts.forEach(({ name: subTypeName, count }) => {
    const percent = ((count / data_len) * 100).toFixed(2);

    const div = document.createElement('div');
    div.className = 'subtype_percent';

    const h1 = document.createElement('h1');
    h1.className = 'stats_titles3';
    h1.innerHTML = subTypeName;
    h1.style.whiteSpace = 'nowrap';

    const progressContainer = document.createElement('div');
    progressContainer.className = 'progress-container';

    const progressLine = document.createElement('div');
    progressLine.className = 'progress-line';
    progressContainer.appendChild(progressLine);

    const h2 = document.createElement('h2');
    h2.className = 'stats_results3';

    div.appendChild(h1);
    div.appendChild(progressContainer);
    div.appendChild(h2);
    subType_container.appendChild(div);

    animateCountPercent(h2, percent, 1500);
  });
}


// Function for showing stats results
const today_date = new Date().toISOString().split('T')[0];
function showStatsInfo(events, gover, event_type, sub_type, start_date_value, end_date_value) {
  animateCount(event_num, events.length, 1500); 
  governorate.innerHTML = `${gover}`
  eventType.innerHTML = `${event_type}`

  show_govers_stats(events);
  show_event_type_stats(events);
  show_subtype_stats(events);

  if (start_date_value){
    startDate_stats.innerHTML = `${start_date_value}`
  }
  else {
    startDate_stats.innerHTML = '2023-09-13'
  }
  
  if (end_date_value){
    endDate_stats.innerHTML = `${end_date_value}`
  }
  else{
    endDate_stats.innerHTML = today_date
  }
  

  if (sub_type){
    subType.innerHTML = `${sub_type}`
  }
  else {subType.innerHTML ='All'} 

}


function capitalizeTitle(sentence) {
  if (!sentence || sentence.trim() === "") return ""; // handle empty input

  const lowerCaseWords = [
    "of", "in", "on", "at", "to", "for", "with", "a", "an", "the", "and", "but", "or", "nor"
  ];

  return sentence
    .replace("_", " ")
    .replace("_", " ")               // Replace all hyphens with spaces
    .toLowerCase()                    // Convert entire sentence to lowercase
    .split(" ")                       // Split by spaces into words
    .map((word, index) => {
      if (index === 0 || !lowerCaseWords.includes(word)) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      }
      return word;
    })
    .join(" ");
}


const governorates = database
  .map(event => event.admin1)
  .filter(name => name && name !== "Outside Yemen" && name !== "Shabwa" && !Number.isNaN(name));

const uniqueGovernorates = [...new Set(governorates)];




// intial values
let gover = 'All';
let event_type = 'All';
let sub_type = 'All';
let start_date_value = '2023-09-13';
let end_date_value = today_date;


showStatsInfo(database, gover, event_type, sub_type, start_date_value, end_date_value); 






// Working on the type selections filters
const type1 = document.getElementById('filterType1');
const type2 = document.getElementById('filterType2');


// Helper to populate select options
function populateSelect(selectElement, options) {
  selectElement.innerHTML = '<option value="">All</option>';
  for (let key of options) {
    selectElement.innerHTML += `<option value="${key}">${key}</option>`;
  }
}

// When select1 changes
type1.addEventListener('change', () => {

  if (type1.value == 'All'){
    type2.disabled = true;
    console.log(type1);
    
    type2.innerHTML = '<option value="">All</option>'
  }

  else {
      type2.disabled = false;
      const state1 = type1.value ? type_data[type1.value.replace(" ", "_").replace(";", "").replace("/", "_")] : [];
      populateSelect(type2, state1);

  }

});



const mapFrame = document.getElementById("mapFrame");


$(document).ready(function () {
  // Show only the first 100 rows initially
  const initialData = database.slice(0, 100);
  renderTableRows(initialData);

  // Initialize DataTable
  table = $('#excelTable').DataTable({
    paging: true,
    searching: false,
    info: false,
    language: {lengthMenu: "Show _MENU_"}
  });


  // Filter button handler
$("#filter").on("change", function () {
    const filterGov = $("#filterGovernorate").val().toLowerCase();
    const filterType1 = $("#filterType1").val().toLowerCase();
    const filterType2 = $("#filterType2").val().toLowerCase();
    const startDate = $("#startDate").val(); // Assuming this is in YYYY-MM-DD format
    const endDate = $("#endDate").val();     // Assuming this is in YYYY-MM-DD format
    const keyword = $("#keywordFilter").val().toLowerCase(); // New keyword input
    
    console.log(startDate);
    console.log(endDate);
    filteredData = database.filter(row => {
        // Governorate filter
        const govMatch = filterGov === "all" || 
                         !filterGov || 
                         row.admin1.toString().toLowerCase().includes(filterGov);
        
        // Type filter
        const typeMatch1 = filterType1 === "all" || 
              !filterType1 ||
              (row.event_type.replace("; ", "_").replace("/", "_").replace(" ", "_").replace(" ", "_") && row.event_type.replace("; ", "_").replace("/", "_").replace(" ", "_").replace(" ", "_").toString().toLowerCase().includes(filterType1))

                      
        const typeMatch2 = filterType2 === "all" || 
              !filterType2 ||
              (row.sub_event_type && row.sub_event_type.toString().toLowerCase().includes(filterType2));

        // Date range filter
        let dateMatch = true;
        if (startDate && endDate && row.formatted_date) {
            const rowDate = new Date(row.formatted_date);
            const start = new Date(startDate);
            const end = new Date(endDate);
            dateMatch = rowDate >= start && rowDate <= end;
        }
        
        const keywordMatch = !keyword || 
            (row.notes && row.notes.toLowerCase().includes(keyword.toLowerCase()));

      return govMatch && dateMatch && typeMatch1 && typeMatch2 && keywordMatch;
            });
    

    table.clear().draw();            // Clear DataTable
    renderTableRows(filteredData);   // Re-render
    table.rows.add($('#dataTable tr')).draw(); // Re-add filtered rows

    mapFrame.contentWindow.postMessage({ type: "updateMap", data: filteredData }, "*")
    showStatsInfo(filteredData, capitalizeTitle(filterGov), capitalizeTitle(filterType1), 
                  capitalizeTitle(filterType2), startDate, endDate);  

  });
});


document.getElementById('showMapBtn').addEventListener('click', () => {
  document.getElementById('tableContainer').style.display = 'none';
  document.getElementById('mapContainer').style.display = 'block';
  document.getElementById('stats_content').style.display = 'none';
});

document.getElementById('showTableBtn').addEventListener('click', () => {
  document.getElementById('tableContainer').style.display = 'block';
  document.getElementById('mapContainer').style.display = 'none';
  document.getElementById('stats_content').style.display = 'none';

});

document.getElementById('showStats').addEventListener('click', () => {
  document.getElementById('tableContainer').style.display = 'none';
  document.getElementById('mapContainer').style.display = 'none';
  document.getElementById('stats_content').style.display = 'block';
});

function scrollToElementWithOffset(id, offset) {
  const element = document.getElementById(id);
  const y = element.getBoundingClientRect().top + window.pageYOffset + offset;
  window.scrollTo({ top: y, behavior: 'smooth' });
}


window.addEventListener('load', () => {
  document.body.classList.remove('is-preload');
});






