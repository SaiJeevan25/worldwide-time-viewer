// Importing Day.js and necessary plugins
import dayjs from 'https://unpkg.com/dayjs@1.11.10/esm/index.js';
import utc from 'https://unpkg.com/dayjs@1.11.10/esm/plugin/utc/index.js';
import timezone from 'https://unpkg.com/dayjs@1.11.10/esm/plugin/timezone/index.js';

// Extending Day.js with the plugins
dayjs.extend(utc);
dayjs.extend(timezone);

let locationTimeInterval;
let currentInterval;

// Function to fetch timezone details from a JSON file
const timeZoneDetails = async () => {
  try {
    const response = await fetch('time-zone-file/timezones.json');
    if (!response.ok) {
      throw new Error('Network Issue');
    }
    const details = await response.json();
    return details;
  } catch (error) {
    console.error('There was a problem with the fetch operation: ', error);
  }
};

// Fetching timezone data
const timeZoneData = await timeZoneDetails();

// Selecting necessary DOM elements
const regionSelect = document.getElementById('region');
const timeZoneSelect = document.getElementById('time-zone');
const timeDisplayElement = document.querySelector('.time-display');
const dateDisplayElement = document.querySelector('.date-display');
const regionDisplayElement = document.querySelector('.region-display');
const randomRegions = document.querySelector('.random-regions');
const timeAtLocButton = document.getElementById('timeAtLoc');

const regionsArray = [
  ['America', 'New_York'],
  ['Europe', 'London'],
  ['Africa', 'Johannesburg'],
  ['Asia', 'Dubai'],
  ['Asia', 'Kolkata'],
  ['Asia', 'Tokyo'],
  ['Australia', 'Sydney'],
  ['Pacific', 'Fiji']
];

function displayTime(timeZone) {  
  const formattedDate = dayjs().tz(timeZone).format('dddd, DD MMMM YYYY');
  const formattedTime = dayjs().tz(timeZone).format('HH:mm:ss');
  timeDisplayElement.innerHTML = formattedTime;
  dateDisplayElement.innerHTML = formattedDate;
}

function optionAdd(selectedRegion) {
  let timeZoneSelectHTML = '<option value="" disabled selected>Select a time zone</option>';
  if (timeZoneData[selectedRegion]) {
    timeZoneData[selectedRegion].forEach((timeZone) => {
      timeZoneSelectHTML += `<option value="${timeZone}">${timeZone}</option>`;
    });
    timeZoneSelect.innerHTML = timeZoneSelectHTML;
  }
}

function addRegions() {
  setInterval(() => {
    let regionHTML = '';

    regionsArray.forEach(async (area) => {
      const [region, timeZone] = area;
      const selectedTimeZone = `${region}/${timeZone}`;
      
      const formattedTime = dayjs().tz(selectedTimeZone).format('HH:mm');
      regionHTML += `
        <div class='region-box'>
          <p class='random-timeZone'>${timeZone}</p>
          <p class='random-time'>${formattedTime}</p>
        </div>
      `;
      randomRegions.innerHTML = regionHTML;
    });
  }, 1000);
}

async function fetchIpAddress() {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    if (!response.ok) {
      throw new Error('Network Issue');
    }
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error('Unable to fetch IP address: ', error);
  }
}

async function fetchLocation() {
  try {
    const ipAddress = await fetchIpAddress();
    const response = await fetch(`https://ipinfo.io/${ipAddress}?token=cf0361deb8e6bc`);
    if (!response.ok) {
      throw new Error('Network Issue');
    }
    const data = await response.json();
    const { city, timezone } = data;
    const locationText = `Time in <span>${city}, ${timezone}</span> now: `;
    regionDisplayElement.innerHTML = locationText;
  } catch (error) {
    console.error('Unable to fetch location information: ', error);
    regionDisplayElement.textContent = 'Unable to fetch location information';
  }
}

function presentLocationTime() {
  if (currentInterval) {
    clearInterval(currentInterval);
  }

  if (locationTimeInterval) {
    clearInterval(locationTimeInterval);
  }
  fetchLocation();
  locationTimeInterval = setInterval(() => {
    const formattedDate = dayjs().format('dddd, DD MMMM YYYY');
    const formattedTime = dayjs().format('HH:mm:ss');
    timeDisplayElement.innerHTML = formattedTime;
    dateDisplayElement.innerHTML = formattedDate;
  }, 1000);
}

presentLocationTime();
addRegions();

regionSelect.addEventListener('change', () => {
  const regionValue = regionSelect.value;
  optionAdd(regionValue);
  document.querySelector('.time-zone-container').classList.add('js-time-zone-container');
});

timeZoneSelect.addEventListener('change', () => {
  if (currentInterval) {
    clearInterval(currentInterval);
  }

  if (locationTimeInterval) {
    clearInterval(locationTimeInterval);
  }
  const regionValue = regionSelect.value;
  const timeZoneValue = timeZoneSelect.value;
  const selectedTimeZone = `${regionValue}/${timeZoneValue}`;

  currentInterval = setInterval(() => {
    regionDisplayElement.innerHTML = `Time in <span>${timeZoneValue}, ${regionValue}</span> now: `;
    displayTime(selectedTimeZone);
  }, 1000); 
});

timeAtLocButton.addEventListener('click', () => {
  presentLocationTime();
});
