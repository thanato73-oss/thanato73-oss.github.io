// 데이터 파일 로딩 후 실행되도록 보장

const percentileKeys = ["1st", "3rd", "5th", "10th", "15th", "25th", "50th", "75th", "85th", "90th", "95th", "97th", "99th"];
const displayPercentileKeys = ["3rd", "5th", "10th", "25th", "50th", "75th", "85th", "90th", "95th", "99th"];
const percentileNumeric = percentileKeys.map(p => parseInt(p));

console.log("Script loaded. Percentile keys defined.");

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded and parsed.");

    // --- DOM Elements ---
    const nameInput = document.getElementById('nameInput');
    const rrnInput = document.getElementById('rrnInput');
    const dobInput = document.getElementById('dob');
    const measurementDateInput = document.getElementById('measurementDate');
    const genderButtonsContainer = document.querySelector('.gender-buttons');
    const heightInput = document.getElementById('height');
    const weightInput = document.getElementById('weight');
    const headCircumferenceInput = document.getElementById('headCircumference');
    const birthWeightInput = document.getElementById('birthWeight');
    const calculateBtn = document.getElementById('calculateBtn');
    const resetBtn = document.getElementById('resetBtn');
    const printBtn = document.getElementById('printBtn');
    const resultContainer = document.getElementById('resultContent');
    const inputSection = document.querySelector('.input-section');

    let selectedGenderValue = null;

    if (!nameInput || !rrnInput || !dobInput || !measurementDateInput || !genderButtonsContainer || !heightInput || !weightInput || !headCircumferenceInput || !birthWeightInput || !calculateBtn || !resetBtn || !printBtn || !resultContainer || !inputSection) {
        console.error("Error: One or more DOM elements not found!");
        if (!nameInput) console.error("Missing: nameInput");
        if (!rrnInput) console.error("Missing: rrnInput");
        if (!dobInput) console.error("Missing: dobInput");
        if (!measurementDateInput) console.error("Missing: measurementDateInput");
        if (!genderButtonsContainer) console.error("Missing: genderButtonsContainer");
        return;
    }
    console.log("DOM elements acquired successfully.");

    // --- Initial Setup ---
    const today = new Date();
    const todayYear = today.getFullYear();
    const todayMonth = String(today.getMonth() + 1).padStart(2, '0');
    const todayDay = String(today.getDate()).padStart(2, '0');
    const todayFormatted = `${todayYear}-${todayMonth}-${todayDay}`;

    const oneYearAgo = new Date(today);
    oneYearAgo.setFullYear(today.getFullYear() - 1);
    const oneYearAgoYear = oneYearAgo.getFullYear();
    const oneYearAgoMonth = String(oneYearAgo.getMonth() + 1).padStart(2, '0');
    const oneYearAgoDay = String(oneYearAgo.getDate()).padStart(2, '0');
    const oneYearAgoFormatted = `${oneYearAgoYear}-${oneYearAgoMonth}-${oneYearAgoDay}`;

    function initializeInputs() {
        console.log("Initializing inputs...");
        nameInput.value = '';
        rrnInput.value = '';
        dobInput.value = oneYearAgoFormatted;
        measurementDateInput.value = todayFormatted;
        selectedGenderValue = null;
        genderButtonsContainer.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
        heightInput.value = 100;
        weightInput.value = 10;
        headCircumferenceInput.value = 0;
        birthWeightInput.value = 0;
        resultContainer.innerHTML = '<p>정보를 입력하고 \'분석하기\' 버튼을 누르세요.</p>';
        console.log("Inputs initialized.");
    }
    try {
        initializeInputs();
    } catch(e) {
        console.error("Error during initial input setup:", e);
    }

    // --- Event Listeners ---
    console.log("Adding event listeners...");
    try {
        // 주민등록번호 입력 리스너
        rrnInput.addEventListener('input', () => {
            let rrnValue = rrnInput.value.replace(/[^0-9]/g, '');
            if (rrnValue.length > 6) {
                rrnValue = rrnValue.substring(0, 6) + '-' + rrnValue.substring(6);
            }
            if (rrnValue.length > 14) {
                rrnValue = rrnValue.substring(0, 14);
            }
            rrnInput.value = rrnValue;

            const rrnRegex = /^(\d{2})(\d{2})(\d{2})-([1-890])\d{6}$/;
            const match = rrnValue.match(rrnRegex);

            if (match) {
                const yy = parseInt(match[1]);
                const mm = match[2];
                const dd = match[3];
                const genderDigit = match[4];
                let century, genderValue;

                switch (genderDigit) {
                    case '1': case '5': century = 1900; genderValue = 'male'; break;
                    case '2': case '6': century = 1900; genderValue = 'female'; break;
                    case '3': case '7': century = 2000; genderValue = 'male'; break;
                    case '4': case '8': century = 2000; genderValue = 'female'; break;
                    case '9': century = 1800; genderValue = 'male'; break;
                    case '0': century = 1800; genderValue = 'female'; break;
                    default: genderValue = null;
                }
                const fullYear = century + yy;
                const monthNum = parseInt(mm);
                const dayNum = parseInt(dd);

                if (monthNum >= 1 && monthNum <= 12 && dayNum >= 1 && dayNum <= 31) {
                    const tempDate = new Date(fullYear, monthNum - 1, dayNum);
                    if (tempDate.getFullYear() === fullYear && tempDate.getMonth() === monthNum - 1 && tempDate.getDate() === dayNum) {
                        dobInput.value = `${fullYear}-${mm}-${dd}`;

                        if (genderValue) {
                             selectedGenderValue = genderValue;
                             genderButtonsContainer.querySelectorAll('button').forEach(btn => {
                                 if (btn.getAttribute('data-gender') === genderValue) {
                                     btn.classList.add('active');
                                 } else {
                                     btn.classList.remove('active');
                                 }
                             });
                         } else {
                             selectedGenderValue = null;
                             genderButtonsContainer.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
                         }
                    } else {
                        dobInput.value = '';
                        selectedGenderValue = null;
                        genderButtonsContainer.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
                    }
                } else {
                    dobInput.value = '';
                    selectedGenderValue = null;
                    genderButtonsContainer.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
                }
            } else if (rrnValue.length >= 14) {
                 dobInput.value = '';
                 selectedGenderValue = null;
                 genderButtonsContainer.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
            }
        });

        // 성별 버튼 클릭 리스너
        genderButtonsContainer.addEventListener('click', (event) => {
            if (event.target.tagName === 'BUTTON' && event.target.hasAttribute('data-gender')) {
                const clickedButton = event.target;
                const gender = clickedButton.getAttribute('data-gender');
                selectedGenderValue = gender;
                genderButtonsContainer.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
                clickedButton.classList.add('active');
                console.log("Gender selected:", selectedGenderValue);
            }
        });

        // +/- 버튼 클릭 이벤트 위임
        inputSection.addEventListener('click', (event) => {
            if (event.target.tagName === 'BUTTON' && event.target.closest('.button-group') && !event.target.closest('.gender-buttons')) {
                const button = event.target;
                if (button.hasAttribute('data-unit')) {
                    const unit = button.getAttribute('data-unit');
                    const amount = parseInt(button.getAttribute('data-amount'));
                    const currentVal = dobInput.value;
                    if (!currentVal) return;
                    const parts = currentVal.split('-');
                    if (parts.length !== 3) return;
                    try {
                        const currentDob = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
                        if (isNaN(currentDob.getTime())) return;
                        if (unit === 'year') currentDob.setFullYear(currentDob.getFullYear() + amount);
                        else if (unit === 'month') currentDob.setMonth(currentDob.getMonth() + amount);
                        else if (unit === 'day') currentDob.setDate(currentDob.getDate() + amount);
                        const year = currentDob.getFullYear();
                        const month = String(currentDob.getMonth() + 1).padStart(2, '0');
                        const day = String(currentDob.getDate()).padStart(2, '0');
                        dobInput.value = `${year}-${month}-${day}`;
                    } catch (e) { console.error("Date adjustment error:", e); }
                } else if (button.hasAttribute('data-target')) {
                     try {
                         const targetId = button.getAttribute('data-target');
                         const amount = parseFloat(button.getAttribute('data-amount'));
                         const targetInput = document.getElementById(targetId);
                         if (targetInput) {
                             let currentValue = parseFloat(targetInput.value) || 0;
                             let newValue = currentValue + amount;
                             if (String(amount).includes('.') || String(currentValue).includes('.')) {
                                 newValue = parseFloat(newValue.toFixed(1));
                             }
                             if (newValue < 0 && ['height', 'weight', 'headCircumference', 'birthWeight'].includes(targetId)) {
                                 newValue = 0;
                             }
                             targetInput.value = newValue;
                         }
                     } catch(e) { console.error("Number adjustment error:", e); }
                }
            }
        });

        // 분석하기 버튼
        calculateBtn.addEventListener('click', () => {
            console.log("Calculate button clicked.");
            if (!dobInput.value || !selectedGenderValue || !measurementDateInput.value || !heightInput.value || parseFloat(heightInput.value) <= 0 || !weightInput.value || parseFloat(weightInput.value) <= 0 ) {
                 resultContainer.innerHTML = '<p style="color: red;">생년월일, 성별, 측정일, 키(0초과), 몸무게(0초과)를 올바르게 입력하거나 선택해주세요.</p>';
                 console.error("Calculation stopped: Required field missing or invalid.");
                 return;
             }
            try {
                calculateAndDisplayResults();
            } catch(e) {
                console.error("Error inside calculateAndDisplayResults:", e);
                resultContainer.innerHTML = '<p style="color: red;">계산 중 오류가 발생했습니다. 콘솔을 확인하세요.</p>';
            }
        });

        // 초기화 버튼
        resetBtn.addEventListener('click', () => {
            console.log("Reset button clicked.");
            try { initializeInputs(); } catch(e) { console.error("Error inside initializeInputs:", e); }
        });

        // 프린트 버튼
        printBtn.addEventListener('click', () => {
            console.log("Print button clicked.");
            try { window.print(); } catch(e) { console.error("Error calling window.print:", e); }
        });

        console.log("Event listeners added successfully.");
    } catch (e) {
        console.error("Error adding event listeners:", e);
    }

    // --- Calculation Functions ---
    function calculateAge(dob, measurementDate) {
         const birthParts = dob.split('-');
         const measureParts = measurementDate.split('-');
         if (birthParts.length !== 3 || measureParts.length !== 3) return null;

         const birthYear = parseInt(birthParts[0]);
         const birthMonth = parseInt(birthParts[1]) - 1;
         const birthDay = parseInt(birthParts[2]);
         const measureYear = parseInt(measureParts[0]);
         const measureMonth = parseInt(measureParts[1]) - 1;
         const measureDay = parseInt(measureParts[2]);

         if (isNaN(birthYear) || isNaN(birthMonth) || isNaN(birthDay) || isNaN(measureYear) || isNaN(measureMonth) || isNaN(measureDay)) {
             return null;
         }

         const birth = new Date(birthYear, birthMonth, birthDay);
         const measurement = new Date(measureYear, measureMonth, measureDay);

         if (isNaN(birth.getTime()) || isNaN(measurement.getTime()) || measurement < birth) {
             return null;
         }

         birth.setHours(0, 0, 0, 0);
         measurement.setHours(0, 0, 0, 0);

         let years = measurement.getFullYear() - birth.getFullYear();
         let months = measurement.getMonth() - birth.getMonth();
         let days = measurement.getDate() - birth.getDate();

         if (days < 0) {
             months--;
             const prevMonthLastDay = new Date(measurement.getFullYear(), measurement.getMonth(), 0).getDate();
             days += prevMonthLastDay;
         }

         if (months < 0) {
             years--;
             months += 12;
         }

         const totalMonths = (measurement.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24 * 30.4375);
         const totalMonthsFloor = years * 12 + months;

         let formattedString = "";
         if (totalMonthsFloor < 6) {
              formattedString = `${totalMonthsFloor}개월 ${days}일`;
         } else if (totalMonthsFloor < 24) {
              formattedString = `${totalMonthsFloor}개월`;
         } else if (totalMonthsFloor < 72) {
              formattedString = `${years}세 ${months}개월`;
         } else {
              formattedString = `${years}세`;
         }

         return { years, months, days, totalMonths, totalMonthsFloor, formattedString };
     }

    function interpolate(val1, val2, factor) {
        if (val1 === undefined || val1 === null) val1 = val2;
        if (val2 === undefined || val2 === null) val2 = val1;
        if (val1 === undefined || val1 === null) return null;
        factor = Math.max(0, Math.min(1, factor));
        return val1 + (val2 - val1) * factor;
    }

    function getInterpolatedPercentiles(data, gender, ageMonths, percentile = '50th') {
         if (!data || !data[gender] || ageMonths === undefined || ageMonths === null || ageMonths < 0) return null;

         const dataGender = data[gender];
         const ageFloor = Math.floor(ageMonths);
         const ageCeil = Math.ceil(ageMonths);
         const factor = ageMonths - ageFloor;

         const availableAges = Object.keys(dataGender).map(Number).sort((a, b) => a - b);
         if (availableAges.length === 0) return null;

         const minAge = availableAges[0];
         const maxAge = availableAges[availableAges.length - 1];

         let dataFloorKey = ageFloor.toString();
         let dataCeilKey = ageCeil.toString();

         if (ageMonths < minAge) {
             dataFloorKey = minAge.toString();
             dataCeilKey = minAge.toString();
         } else if (ageMonths > maxAge) {
             dataFloorKey = maxAge.toString();
             dataCeilKey = maxAge.toString();
         }

         const dataFloor = dataGender[dataFloorKey];
         const dataCeil = dataGender[dataCeilKey];

         if (!dataFloor && !dataCeil) return null;
         if (!dataFloor) return dataCeil ? dataCeil[percentile] : null;
         if (!dataCeil) return dataFloor ? dataFloor[percentile] : null;

         if (dataFloorKey === dataCeilKey || factor === 0) {
             return dataFloor[percentile];
         }

         return interpolate(dataFloor[percentile], dataCeil[percentile], factor);
     }

    function getInterpolatedWeightForHeightPercentiles(data, gender, heightCm) {
         if (!data || !data[gender] || heightCm === undefined || heightCm === null || heightCm <= 0) return null;

         const dataGender = data[gender];
         const sortedHeights = Object.keys(dataGender).map(parseFloat).sort((a, b) => a - b);
         if (sortedHeights.length === 0) return null;

         let heightFloorKey = null, heightCeilKey = null;
         let heightFloorVal = -Infinity, heightCeilVal = Infinity;

         for (const key in dataGender) {
             const h = parseFloat(key);
             if (!isNaN(h)) {
                 if (h <= heightCm && h > heightFloorVal) {
                     heightFloorVal = h;
                     heightFloorKey = key;
                 }
                 if (h >= heightCm && h < heightCeilVal) {
                     heightCeilVal = h;
                     heightCeilKey = key;
                 }
             }
         }

         if (heightFloorKey === null && heightCeilKey === null) return null;
         if (heightFloorKey === null) heightFloorKey = heightCeilKey;
         if (heightCeilKey === null) heightCeilKey = heightFloorKey;

         const dataFloor = dataGender[heightFloorKey];
         const dataCeil = dataGender[heightCeilKey];

         if (!dataFloor && !dataCeil) return null;
         if (!dataFloor) return dataCeil;
         if (!dataCeil) return dataFloor;

         const heightFloor = parseFloat(heightFloorKey);
         const heightCeil = parseFloat(heightCeilKey);

         let factor = 0;
         if (heightCeil > heightFloor) {
             factor = (heightCm - heightFloor) / (heightCeil - heightFloor);
         }
         factor = Math.max(0, Math.min(1, factor));

         const interpolated = {};
         percentileKeys.forEach(key => {
             interpolated[key] = interpolate(dataFloor[key], dataCeil[key], factor);
         });

         return interpolated;
     }

    function getFullInterpolatedPercentiles(data, gender, ageMonths) {
        if (!data || !data[gender] || ageMonths === undefined || ageMonths === null || ageMonths < 0) return null;

        const dataGender = data[gender];
        const ageFloor = Math.floor(ageMonths);
        const ageCeil = Math.ceil(ageMonths);
        const factor = ageMonths - ageFloor;

        const availableAges = Object.keys(dataGender).map(Number).sort((a, b) => a - b);
        if (availableAges.length === 0) return null;

        const minAge = availableAges[0];
        const maxAge = availableAges[availableAges.length - 1];

        let dataFloorKey = ageFloor.toString();
        let dataCeilKey = ageCeil.toString();

        if (ageMonths < minAge) {
             dataFloorKey = minAge.toString(); dataCeilKey = minAge.toString();
        } else if (ageMonths > maxAge) {
             dataFloorKey = maxAge.toString(); dataCeilKey = maxAge.toString();
        } else {
             if (!dataGender[dataFloorKey]) {
                 let closestFloor = -Infinity;
                 availableAges.forEach(age => { if (age <= ageFloor && age > closestFloor) closestFloor = age; });
                 dataFloorKey = closestFloor.toString();
             }
              if (!dataGender[dataCeilKey]) {
                 let closestCeil = Infinity;
                 availableAges.forEach(age => { if (age >= ageCeil && age < closestCeil) closestCeil = age; });
                 dataCeilKey = closestCeil.toString();
             }
              if (dataFloorKey === dataCeilKey && ageFloor !== ageCeil) {
                 const currentIndex = availableAges.indexOf(Number(dataFloorKey));
                 if (factor > 0 && currentIndex < availableAges.length - 1) {
                     dataCeilKey = availableAges[currentIndex + 1].toString();
                 } else if (factor < 0 && currentIndex > 0) {
                     dataFloorKey = availableAges[currentIndex - 1].toString();
                 }
             }
        }

        const dataFloor = dataGender[dataFloorKey];
        const dataCeil = dataGender[dataCeilKey];

        if (!dataFloor && !dataCeil) return null;
        if (!dataFloor) return dataCeil;
        if (!dataCeil) return dataFloor;

        if (dataFloorKey === dataCeilKey || factor === 0) {
            return dataFloor;
        }

        const interpolated = {};
        percentileKeys.forEach(key => {
            interpolated[key] = interpolate(dataFloor[key], dataCeil[key], factor);
        });
        return interpolated;
    }

    function findValuePercentile(value, fullInterpolatedPercentiles) {
        if (!fullInterpolatedPercentiles || value === undefined || value === null) return null;

        let lowerKey = null, upperKey = null;
        let lowerValue = -Infinity, upperValue = Infinity;

        for (const key of percentileKeys) {
            const pValue = fullInterpolatedPercentiles[key];
            if (pValue === undefined || pValue === null) continue;

            if (pValue <= value) {
                if (pValue >= lowerValue) {
                    lowerValue = pValue;
                    lowerKey = key;
                }
            }
            if (pValue >= value) {
                if (pValue < upperValue) {
                    upperValue = pValue;
                    upperKey = key;
                }
            }
        }

        const firstPValue = fullInterpolatedPercentiles[percentileKeys[0]];
        const lastPValue = fullInterpolatedPercentiles[percentileKeys[percentileKeys.length - 1]];

        if (lowerKey === null) {
            if (firstPValue !== undefined && firstPValue !== null && value < firstPValue) {
                const firstPercentile = parseInt(percentileKeys[0]);
                return Math.max(0, firstPercentile * (value / firstPValue));
            }
            return (firstPValue !== undefined && firstPValue !== null && value === firstPValue) ? parseInt(percentileKeys[0]) : 0;
        }

        if (upperKey === null) {
             if (lastPValue !== undefined && lastPValue !== null && value > lastPValue) {
                 const lastPercentile = parseInt(percentileKeys[percentileKeys.length - 1]);
                 if (lastPValue <= 0) return lastPercentile;
                 const nextHighestPercentile = 100;
                 const slope = (nextHighestPercentile - lastPercentile) / (lastPValue * 1.1 - lastPValue);
                 return Math.min(100, lastPercentile + (value - lastPValue) * slope);
             }
             return (lastPValue !== undefined && lastPValue !== null && value === lastPValue) ? parseInt(percentileKeys[percentileKeys.length - 1]) : 100;
        }

        const lowerPercentile = parseInt(lowerKey);
        const upperPercentile = parseInt(upperKey);

        if (value === lowerValue) return lowerPercentile;
        if (value === upperValue) return upperPercentile;

        if (lowerValue === upperValue) {
             return lowerPercentile;
        }

        const factor = (value - lowerValue) / (upperValue - lowerValue);
        if (isNaN(factor) || !isFinite(factor)) {
             return lowerPercentile;
        }

        const percentile = lowerPercentile + (upperPercentile - lowerPercentile) * factor;

        return Math.max(0, Math.min(100, percentile));
    }

    // --- Main Calculation and Display Logic ---
    function calculateAndDisplayResults() {
        console.log("--- Starting calculateAndDisplayResults ---");
        try {
            // 1. Get Inputs & Validate
            const name = nameInput.value.trim();
            const dob = dobInput.value;
            const measurementDate = measurementDateInput.value;
            const gender = selectedGenderValue;
            const height = parseFloat(heightInput.value);
            const weight = parseFloat(weightInput.value);
            const headCircumference = parseFloat(headCircumferenceInput.value);
            const birthWeight = parseFloat(birthWeightInput.value);
            const genderText = gender === 'male' ? '남아' : '여아';

            if (!dob || !measurementDate || !gender || isNaN(height) || height <= 0 || isNaN(weight) || weight <= 0) {
                 resultContainer.innerHTML = '<p style="color: red;">생년월일, 측정일, 성별, 키(0초과), 몸무게(0초과)를 올바르게 입력해주세요.</p>';
                 console.error("Calculation stopped: Required input missing or invalid (check DOB, Date, Gender, Height, Weight).");
                 return;
             }

            const isHeadCircumferenceValid = !isNaN(headCircumference) && headCircumference > 0;
            const isBirthWeightValid = !isNaN(birthWeight) && birthWeight > 0;

            // 3. Calculate Age
            const ageInfo = calculateAge(dob, measurementDate);
            if (!ageInfo) { resultContainer.innerHTML = '<p style="color: red;">측정일이 생년월일보다 빠르거나 날짜가 유효하지 않습니다.</p>'; return; }
            const ageMonths = ageInfo.totalMonths; const ageMonthsFloor = ageInfo.totalMonthsFloor;

             if (ageMonths > 240) {
                 resultContainer.innerHTML = '<p style="color: orange;">만 20세(240개월) 이하의 소아청소년을 위한 데이터입니다.</p>';
                 return;
             }

            // 4. Calculate BMI
            const bmi = weight / ((height / 100) ** 2);

            // 5. Get Interpolated Data for All Percentiles
            const heightPercentilesFull = getFullInterpolatedPercentiles(heightData, gender, ageMonths);
            const weightPercentilesFull = getFullInterpolatedPercentiles(weightData, gender, ageMonths);
            const headPercentilesFull = (isHeadCircumferenceValid && ageMonthsFloor < 72) ? getFullInterpolatedPercentiles(headCircumferenceData, gender, ageMonths) : null;
            const bmiPercentilesFull = (ageMonthsFloor >= 24) ? getFullInterpolatedPercentiles(bmiData, gender, ageMonths) : null;
            const birthWeightPercentilesData = (isBirthWeightValid && weightData[gender] && weightData[gender]["0"]) ? weightData[gender]["0"] : null;

            // 6. Find Percentiles for Input Values
            const heightP = findValuePercentile(height, heightPercentilesFull);
            const weightP = findValuePercentile(weight, weightPercentilesFull);
            const headP = (headPercentilesFull) ? findValuePercentile(headCircumference, headPercentilesFull) : null;
            const bmiP = (bmiPercentilesFull) ? findValuePercentile(bmi, bmiPercentilesFull) : null;
            const birthWeightP = (birthWeightPercentilesData) ? findValuePercentile(birthWeight, birthWeightPercentilesData) : null;

            // 7. Get Standard Weight (Weight for Height)
            let standardWeightData = null;
            if (ageMonthsFloor < 24) standardWeightData = weightDataUnder2;
            else if (ageMonthsFloor < 36) standardWeightData = weightData2To3;
            else standardWeightData = weightDataAbove3;
            const weightForHeightPercentiles = getInterpolatedWeightForHeightPercentiles(standardWeightData, gender, height);
            const standardWeight = weightForHeightPercentiles ? weightForHeightPercentiles['50th'] : null;

            // 8. Perform Assessments
            let weightForHeightAssessment = null;
            let weightForHeightPercentileValue = null;
            const wfhCriteria = [ { range: "< 3", label: "심한 저체중" }, { range: "3 ~ <5", label: "저체중" }, { range: "5 ~ <85", label: "정상" }, { range: "85 ~ <95", label: "과체중 위험" }, { range: "≥ 95", label: "과체중" } ];
            if (ageMonthsFloor < 24 && weightForHeightPercentiles) {
                 weightForHeightPercentileValue = findValuePercentile(weight, weightForHeightPercentiles);
                 if (weightForHeightPercentileValue !== null) {
                     if (weightForHeightPercentileValue < 3) weightForHeightAssessment = wfhCriteria[0].label;
                     else if (weightForHeightPercentileValue < 5) weightForHeightAssessment = wfhCriteria[1].label;
                     else if (weightForHeightPercentileValue < 85) weightForHeightAssessment = wfhCriteria[2].label;
                     else if (weightForHeightPercentileValue < 95) weightForHeightAssessment = wfhCriteria[3].label;
                     else weightForHeightAssessment = wfhCriteria[4].label;
                 }
            }

            let bmiAssessment = null;
            const bmiCriteria = [ { range: "< 5", label: "저체중" }, { range: "5 ~ <85", label: "정상" }, { range: "85 ~ <95", label: "과체중" }, { range: "≥ 95", label: "비만" } ];
            if (ageMonthsFloor >= 24 && bmiP !== null) {
                 if (bmiP < 5) bmiAssessment = bmiCriteria[0].label;
                 else if (bmiP < 85) bmiAssessment = bmiCriteria[1].label;
                 else if (bmiP < 95) bmiAssessment = bmiCriteria[2].label;
                 else bmiAssessment = bmiCriteria[3].label;
            }

            let obesityIndex = null;
            let obesityIndexAssessment = null;
            const oiCriteria = [ { range: "< 90%", label: "저체중" }, { range: "90 ~ <110%", label: "정상" }, { range: "110 ~ <120%", label: "과체중" }, { range: "120 ~ <130%", label: "경도비만" }, { range: "130 ~ <150%", label: "중등도비만" }, { range: "≥ 150%", label: "고도비만" } ];
            if (ageMonthsFloor >= 24 && standardWeight !== null && standardWeight > 0) {
                 obesityIndex = (weight / standardWeight) * 100;
                 if (obesityIndex < 90) obesityIndexAssessment = oiCriteria[0].label;
                 else if (obesityIndex < 110) obesityIndexAssessment = oiCriteria[1].label;
                 else if (obesityIndex < 120) obesityIndexAssessment = oiCriteria[2].label;
                 else if (obesityIndex < 130) obesityIndexAssessment = oiCriteria[3].label;
                 else if (obesityIndex < 150) obesityIndexAssessment = oiCriteria[4].label;
                 else obesityIndexAssessment = oiCriteria[5].label;
            }

            // Average Growth Prediction
             const age1m = ageMonths + 1;
             const age6m = ageMonths + 6;
             const age12m = ageMonths + 12;
             const h50_current = getInterpolatedPercentiles(heightData, gender, ageMonths, '50th');
             const h50_1m = getInterpolatedPercentiles(heightData, gender, age1m, '50th');
             const h50_6m = getInterpolatedPercentiles(heightData, gender, age6m, '50th');
             const h50_12m = getInterpolatedPercentiles(heightData, gender, age12m, '50th');
             const w50_current = getInterpolatedPercentiles(weightData, gender, ageMonths, '50th');
             const w50_1m = getInterpolatedPercentiles(weightData, gender, age1m, '50th');
             const w50_6m = getInterpolatedPercentiles(weightData, gender, age6m, '50th');
             const w50_12m = getInterpolatedPercentiles(weightData, gender, age12m, '50th');
             const h_diff_1m = (h50_1m !== null && h50_current !== null) ? h50_1m - h50_current : null;
             const h_diff_6m = (h50_6m !== null && h50_current !== null) ? h50_6m - h50_current : null;
             const h_diff_12m = (h50_12m !== null && h50_current !== null) ? h50_12m - h50_current : null;
             const w_diff_1m = (w50_1m !== null && w50_current !== null) ? w50_1m - w50_current : null;
             const w_diff_6m = (w50_6m !== null && w50_current !== null) ? w50_6m - w50_current : null;
             const w_diff_12m = (w50_12m !== null && w50_current !== null) ? w50_12m - w50_current : null;
             const h_pred_1m = (h_diff_1m !== null) ? height + h_diff_1m : null;
             const h_pred_6m = (h_diff_6m !== null) ? height + h_diff_6m : null;
             const h_pred_12m = (h_diff_12m !== null) ? height + h_diff_12m : null;
             const w_pred_1m = (w_diff_1m !== null) ? weight + w_diff_1m : null;
             const w_pred_6m = (w_diff_6m !== null) ? weight + w_diff_6m : null;
             const w_pred_12m = (w_diff_12m !== null) ? weight + w_diff_12m : null;

            // --- 9. Display Results ---
            let html = '<div id="printArea">';

            // 리포트 제목 (크게 강조)
            if (name) {
                html += `<h2 class="report-title">${name}님의 성장 종합분석</h2>`;
            } else {
                html += '<h2 class="report-title">성장 종합분석</h2>';
            }

            // --- 기본 정보 섹션 ---
            html += '<h3>기본 정보</h3>';
            html += `<p><strong>생년월일:</strong> <span class="result-value">${dob}</span> (${genderText}) / <strong>측정일:</strong> <span class="result-value">${measurementDate}</span></p>`;
            html += `<p><strong>현재 나이:</strong> <span class="result-value">${ageInfo.formattedString}</span> (만 ${ageInfo.totalMonths.toFixed(1)}개월)</p>`;

             const hasHeightGraph = heightP !== null;
             const clampedHeightP = hasHeightGraph ? Math.max(0, Math.min(100, heightP)) : 0;
             const heightBarAlertClass = (hasHeightGraph && (heightP < 5 || heightP > 95)) ? ' bar-alert' : '';
             html += `<p class="${hasHeightGraph ? 'info-line-with-graph' : ''}">`;
             html += `<span class="info-text">`;
             html += `<strong>키:</strong> <span class="result-value">${height.toFixed(1)} Cm</span>`;
             if (hasHeightGraph) { html += ` <span class="percentile-value">(${heightP.toFixed(1)} P)</span>`; }
             html += `</span>`;
             if (hasHeightGraph) {
                 html += `<span class="percentile-bar-container"><span class="percentile-bar-bg"><span class="percentile-bar-fill${heightBarAlertClass}" style="width: ${clampedHeightP.toFixed(1)}%;"></span></span></span>`;
             }
             html += `</p>`;

             if (isBirthWeightValid) {
                 const hasBirthWeightGraph = birthWeightP !== null;
                 const clampedBirthWeightP = hasBirthWeightGraph ? Math.max(0, Math.min(100, birthWeightP)) : 0;
                 const birthWeightBarAlertClass = (hasBirthWeightGraph && (birthWeightP < 5 || birthWeightP > 95)) ? ' bar-alert' : '';
                 html += `<p class="${hasBirthWeightGraph ? 'info-line-with-graph' : ''}">`;
                 html += `<span class="info-text">`;
                 html += `<strong>출생 체중:</strong> <span class="result-value">${birthWeight.toFixed(1)} Kg</span>`;
                 if (hasBirthWeightGraph) { html += ` <span class="percentile-value">(${birthWeightP.toFixed(1)} P)</span>`; }
                 html += `</span>`;
                 if (hasBirthWeightGraph) {
                     html += `<span class="percentile-bar-container"><span class="percentile-bar-bg"><span class="percentile-bar-fill${birthWeightBarAlertClass}" style="width: ${clampedBirthWeightP.toFixed(1)}%;"></span></span></span>`;
                 }
                 html += `</p>`;
             }

             const hasWeightGraph = weightP !== null;
             const clampedWeightP = hasWeightGraph ? Math.max(0, Math.min(100, weightP)) : 0;
             const weightBarAlertClass = (hasWeightGraph && (weightP < 5 || weightP > 95)) ? ' bar-alert' : '';
             html += `<p class="${hasWeightGraph ? 'info-line-with-graph' : ''}">`;
             html += `<span class="info-text">`;
             html += `<strong>체중:</strong> <span class="result-value">${weight.toFixed(1)} Kg</span>`;
             if (hasWeightGraph) { html += ` <span class="percentile-value">(${weightP.toFixed(1)} P)</span>`; }
             html += `</span>`;
             if (hasWeightGraph) {
                 html += `<span class="percentile-bar-container"><span class="percentile-bar-bg"><span class="percentile-bar-fill${weightBarAlertClass}" style="width: ${clampedWeightP.toFixed(1)}%;"></span></span></span>`;
             }
             html += `</p>`;

             if (isHeadCircumferenceValid && ageMonthsFloor < 72) {
                 const hasHeadGraph = headP !== null;
                 const clampedHeadP = hasHeadGraph ? Math.max(0, Math.min(100, headP)) : 0;
                 const headBarAlertClass = (hasHeadGraph && (headP < 5 || headP > 95)) ? ' bar-alert' : '';
                 html += `<p class="${hasHeadGraph ? 'info-line-with-graph' : ''}">`;
                 html += `<span class="info-text">`;
                 html += `<strong>머리둘레:</strong> <span class="result-value">${headCircumference.toFixed(1)} Cm</span>`;
                 if (hasHeadGraph) { html += ` <span class="percentile-value">(${headP.toFixed(1)} P)</span>`; }
                 html += `</span>`;
                 if (hasHeadGraph) {
                     html += `<span class="percentile-bar-container"><span class="percentile-bar-bg"><span class="percentile-bar-fill${headBarAlertClass}" style="width: ${clampedHeadP.toFixed(1)}%;"></span></span></span>`;
                 }
                 html += `</p>`;
             }

             if (ageMonthsFloor >= 24) {
                 const hasBmiGraph = bmiP !== null;
                 const clampedBmiP = hasBmiGraph ? Math.max(0, Math.min(100, bmiP)) : 0;
                 const bmiBarAlertClass = (hasBmiGraph && (bmiP < 5 || bmiP > 95)) ? ' bar-alert' : '';
                 html += `<p class="${hasBmiGraph ? 'info-line-with-graph' : ''}">`;
                 html += `<span class="info-text">`;
                 html += `<strong>BMI:</strong> <span class="result-value">${bmi.toFixed(1)} kg/m²</span>`;
                 if (hasBmiGraph) { html += ` <span class="percentile-value">(${bmiP.toFixed(1)} P)</span>`; }
                 html += `</span>`;
                 if (hasBmiGraph) {
                     html += `<span class="percentile-bar-container"><span class="percentile-bar-bg"><span class="percentile-bar-fill${bmiBarAlertClass}" style="width: ${clampedBmiP.toFixed(1)}%;"></span></span></span>`;
                 }
                 html += `</p>`;
             }

            // --- 연령별 백분위 참고표 ---
            html += '<h3>연령별 백분위 참고표</h3>';
            const hasPercentileData = heightPercentilesFull || weightPercentilesFull || headPercentilesFull || bmiPercentilesFull;
            if (hasPercentileData) {
                html += '<div class="percentile-table-container"><table class="data-table">';
                html += '<thead><tr><th>항목</th>'; displayPercentileKeys.forEach(key => html += `<th>${key}</th>`); html += '</tr></thead><tbody>';
                if(heightPercentilesFull) { html += '<tr><td>키 (Cm)</td>'; displayPercentileKeys.forEach(key => html += `<td>${heightPercentilesFull[key] !== undefined && heightPercentilesFull[key] !== null ? heightPercentilesFull[key].toFixed(1) : '-'}</td>`); html += '</tr>'; }
                if(weightPercentilesFull) { html += '<tr><td>몸무게 (Kg)</td>'; displayPercentileKeys.forEach(key => html += `<td>${weightPercentilesFull[key] !== undefined && weightPercentilesFull[key] !== null ? weightPercentilesFull[key].toFixed(1) : '-'}</td>`); html += '</tr>'; }
                if (headPercentilesFull) { html += '<tr><td>머리둘레 (Cm)</td>'; displayPercentileKeys.forEach(key => html += `<td>${headPercentilesFull[key] !== undefined && headPercentilesFull[key] !== null ? headPercentilesFull[key].toFixed(1) : '-'}</td>`); html += '</tr>'; }
                if (bmiPercentilesFull) { html += '<tr><td>BMI (kg/m²)</td>'; displayPercentileKeys.forEach(key => html += `<td>${bmiPercentilesFull[key] !== undefined && bmiPercentilesFull[key] !== null ? bmiPercentilesFull[key].toFixed(1) : '-'}</td>`); html += '</tr>'; }
                html += '</tbody></table></div>';
            } else {
                html += '<p>해당 나이에 대한 백분위수 참고표 데이터가 부족합니다.</p>';
            }

            // --- 평균 성장 예측 ---
            html += '<h3>평균 성장 예측 (50th 백분위 기준)</h3>';
            html += '<div class="percentile-table-container"><table class="data-table growth-prediction-table">';
            html += '<thead><tr><th>항목</th><th>오늘</th><th>1개월후</th><th>6개월후</th><th>1년후</th></tr></thead><tbody>';
            html += `<tr><td>키(Cm)</td><td>${height.toFixed(1)}</td><td>${h_pred_1m !== null ? h_pred_1m.toFixed(1) : '-'}</td><td>${h_pred_6m !== null ? h_pred_6m.toFixed(1) : '-'}</td><td>${h_pred_12m !== null ? `${h_pred_12m.toFixed(1)} <span style="font-size:0.9em; color:#555;">(+${h_diff_12m.toFixed(1)})</span>` : '-'}</td></tr>`;
            html += `<tr><td>몸무게(Kg)</td><td>${weight.toFixed(1)}</td><td>${w_pred_1m !== null ? w_pred_1m.toFixed(1) : '-'}</td><td>${w_pred_6m !== null ? w_pred_6m.toFixed(1) : '-'}</td><td>${w_pred_12m !== null ? `${w_pred_12m.toFixed(1)} <span style="font-size:0.9em; color:#555;">(+${w_diff_12m.toFixed(1)})</span>` : '-'}</td></tr>`;
            html += '</tbody></table></div>';
            html += '<p style="font-size: 0.8em; color: #666;">*주의: 예측값은 현재 성장 백분위가 아닌 50th 백분위의 평균 성장 속도를 기준으로 계산된 참고치입니다.</p>';

            // --- 표준 체중 ---
            html += '<h3>표준 체중 (신장 대비)</h3>';
            if (standardWeight !== null) {
                html += `<p>현재 키(${height.toFixed(1)}cm)에 대한 표준 체중(50th): <span class="result-value">${standardWeight.toFixed(1)} Kg</span></p>`;
            } else {
                 html += '<p>표준 체중 데이터를 계산할 수 없습니다 (데이터 범위 초과 등).</p>';
            }

            const showWeightForHeight = ageMonthsFloor < 24;
            const showBmiAndObesity = ageMonthsFloor >= 24;

            function getBadgeClass(assessmentLabel) {
                 if (!assessmentLabel) return 'badge-underweight';
                 if (assessmentLabel.includes('정상')) return 'badge-normal';
                 if (assessmentLabel.includes('과체중') || assessmentLabel.includes('위험')) return 'badge-caution';
                 if (assessmentLabel.includes('비만')) return 'badge-obese';
                 if (assessmentLabel.includes('저체중')) return 'badge-underweight';
                 return 'badge-underweight';
            }

            // --- 키에 대한 체중평가 (<24개월) ---
            html += `<div id="weightForHeightAssessmentSection" class="assessment-section ${showWeightForHeight ? '' : 'hidden'}">`;
            html += '<h3>키에 대한 체중평가 (&lt;24개월)</h3>';
            if (weightForHeightAssessment !== null) {
                html += `<p>신장별 체중 백분위수: ${weightForHeightPercentileValue !== null ? weightForHeightPercentileValue.toFixed(1) + ' P' : '계산 불가'}</p>`;
                html += `<span class="criteria-title">기준 (WHO Growth Standards):</span>`;
                html += '<div class="criteria-list">';
                wfhCriteria.forEach(item => {
                    html += `<div class="criterion-item ${weightForHeightAssessment === item.label ? 'highlighted' : ''}">`;
                    html += `${item.range} 백분위수 : ${item.label}`;
                    html += `</div>`;
                });
                html += '</div>';
                html += `<p><span class="judgement-title">판정 :</span> <span class="judgement-badge ${getBadgeClass(weightForHeightAssessment)}">${weightForHeightAssessment}</span></p>`;
            } else {
                html += '<p>평가 데이터를 계산할 수 없습니다.</p>';
            }
            html += '</div>';

            // --- BMI 평가와 비만도 평가를 나란히 표시 (≥24개월) ---
            html += `<div class="assessment-row ${showBmiAndObesity ? '' : 'hidden'}">`;

            // BMI 기준 비만평가
            html += `<div id="bmiAssessmentSection" class="assessment-section assessment-half">`;
            html += '<h3>BMI 기준 비만평가 (&ge;24개월)</h3>';
            if (bmiAssessment !== null) {
                html += `<p>BMI 백분위수: ${bmiP !== null ? bmiP.toFixed(1) + ' P' : '계산 불가'}</p>`;
                html += `<span class="criteria-title">기준 (2017 소아청소년 성장도표):</span>`;
                html += '<div class="criteria-list">';
                bmiCriteria.forEach(item => {
                    html += `<div class="criterion-item ${bmiAssessment === item.label ? 'highlighted' : ''}">`;
                    html += `${item.range} 백분위수 : ${item.label}`;
                    html += `</div>`;
                });
                html += '</div>';
                html += `<p><span class="judgement-title">판정 :</span> <span class="judgement-badge ${getBadgeClass(bmiAssessment)}">${bmiAssessment}</span></p>`;
            } else {
                html += '<p>평가 데이터를 계산할 수 없습니다.</p>';
            }
            html += '</div>';

            // 비만도 기준 비만평가
            html += `<div id="obesityIndexAssessmentSection" class="assessment-section assessment-half">`;
            html += '<h3>비만도 기준 비만평가 (&ge;24개월)</h3>';
            if (obesityIndexAssessment !== null && standardWeight !== null) {
                html += `<p>비만도: (${weight.toFixed(1)}Kg / ${standardWeight.toFixed(1)}Kg) × 100 = <span class="result-value">${obesityIndex.toFixed(1)} %</span></p>`;
                html += `<span class="criteria-title">기준:</span>`;
                html += '<div class="criteria-list">';
                oiCriteria.forEach(item => {
                    html += `<div class="criterion-item ${obesityIndexAssessment === item.label ? 'highlighted' : ''}">`;
                    html += `비만도 ${item.range} : ${item.label}`;
                    html += `</div>`;
                });
                html += '</div>';
                html += `<p><span class="judgement-title">판정 :</span> <span class="judgement-badge ${getBadgeClass(obesityIndexAssessment)}">${obesityIndexAssessment}</span></p>`;
            } else {
                html += '<p>평가 데이터를 계산할 수 없습니다 (표준 체중 계산 불가 등).</p>';
            }
            html += '</div>';

            html += '</div>'; // .assessment-row 닫기

            html += '</div>'; // Close #printArea

            resultContainer.innerHTML = html;
            console.log("--- Finished calculateAndDisplayResults ---");

        } catch (e) {
            console.error("Error during calculateAndDisplayResults execution:", e);
            resultContainer.innerHTML = `<p style="color: red;">결과 계산 또는 표시에 오류가 발생했습니다. 오류: ${e.message}. 콘솔을 확인하세요.</p>`;
        }
    } // End of calculateAndDisplayResults

}); // End DOMContentLoaded
