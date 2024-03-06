// add the unwanted countries to tha array, to filter it out of the web
const unwanted = ['Israel'];
const lowerCaseUnwanted = unwanted.map(e => e.toLowerCase());

async function filterCountries(name = "all", region = false) {
    let url = "https://restcountries.com/v3.1/" 
    if (region){
        url += `region/`;
    } else if (name !== "all"){
        url += `name/`;
    } 
    return await fetch(`${url}${name}`)
    .then(response => response.json())
    .then((data) => {
        if(!lowerCaseUnwanted.includes(name.toLowerCase())){
            if(name !== "all" && region === false){
                // return one country data
                return data["0"];
            } else {
                // return all countries came in the filter
                return data;
            }
            
        }
    });
}
function createCard(data){
    // data is an object contains a country info
    let name = data["name"]["common"];
    let population = data["population"].toLocaleString('en'); //format the number to have a thousand separator
    let region = data["region"];
    let capital = data["capital"];
    let flag = data[`flags`]["png"];

    // creat a card and add it to the cards container
    // const cards = document.querySelector('.cards-container');
    const card = document.createElement('div');
    const mode = checkMode();
    card.innerHTML = `
    <div id="toggleMode" class="${mode} rounded-md shadow md:max-w-[270px] cursor-pointer" onclick='createCountryPage("${name}")'>
    <img class="w-[300px] h-[150px]" src="${flag}" alt="flag">
        <div class="m-6 pb-4">
            <h2 class="font-bold text-[16px] mb-4">${name}</h2>
            <p><strong>Population: </strong>${population}</p>
            <p><strong>Region: </strong>${region}</p>
            <p><strong>Capital: </strong>${capital}</p>
        </div>
    </div>`;
    return card;
    // cards.appendChild(card);
}

async function createCountryPage(country, backHome = true){
    let data = await filterCountries(country);
    let nativeName = data["name"]['nativeName'][Object.keys(data["name"]['nativeName'])[0]]["common"]; //get the first common name in "nativeName" object
    let population = data["population"].toLocaleString('en');  //format the number to have a thousand separator
    let region = data["region"];
    let subregion = data["subregion"];
    let capital = data["capital"];

    //check if there are more than one language
    let languages =[]; 
    for (const languageKey in data["languages"]){
        languages.push(data["languages"][languageKey]);
    }
    let currencies = data["currencies"][Object.keys(data["currencies"])[0]]["name"];
    let borders = data["borders"];
    let tld = data["tld"][0];
    let flag = data[`flags`]["png"];

    // if there are border countries, get the country names of those countries and add them
    const mode = checkMode();
    let borderButtons =[];
    let borderHTML ='';
    if  (borders != undefined) {
        for(let border in borders){
            const name = await findCountryByCCA3(borders[border]);
            // filtering unwanted countries from borders
            if(!lowerCaseUnwanted.includes(name.toLowerCase())){
                // using ("") in tag attributes caused some trobles when the text turns into html
            borderButtons.push(`<div id='toggleMode' class='${mode}'> <button type='reset' class='min-w-24 px-6 py-1 cursor-pointer hover:bg-[#323741]' onclick='createCountryPage("${name}", false)'>${name}</button> </div> `);
            }
        }
        borderHTML = borderButtons.join(' ');
    } else {
        borderHTML = `<p><strong>We Are Alone,</strong> no border countries in the API!</p>`;
    }
    
    const main = document.querySelector("main");
    // check if it is the first call for this function
    if(!main.classList.contains("hidden")){
        main.classList.toggle("hidden");
    } else {
        const previosPage = document.querySelector(`.page:last-child`);
        previosPage.classList.toggle("hidden");
    }
    let onclick;
    if (backHome){
        onclick=  `onclick='backToHome()'`
    } else {
        onclick=  `onclick='stepBack()'`
    }
    const newPage = document.createElement("div");
    newPage.classList.add("page");
    newPage.innerHTML = `
    <div class="m-4 md:mx-6 md:my-4 lg:mx-10 flex flex-col items-center gap-y-6">
    <div id="toggleMode" class="${mode} self-start">
    <button ${onclick} type="reset" class="px-6 py-2 cursor-pointer hover:bg-[#323741]"><i class="fa fa-arrow-left mr-2"></i> Back</button>
    </div>
    <div class="container w-full flex flex-col md:flex-row gap-y-8 md:place-content-between">
    <img class="w-full md:w-[45%] md:h-[350px]" src="${flag}" alt="flag">
    <div class="flex flex-col gap-y-8 w-full md:w-[50%]">
    <h1 class="font-bold text-3xl ">${country[0].toUpperCase()+country.slice(1)}</h1>
    <div class="flex flex-col md:flex-row gap-y-8 justify-between items-start w-full">
    <ul>
    <li><strong>Native Name: </strong> ${nativeName}</li>
    <li><strong>Population: </strong>${population}</li>
    <li><strong>Region: </strong>${region}</li>
    <li><strong>Sub Region: </strong>${subregion}</li>
    <li><strong>Capital: </strong>${capital}</li>
    </ul>
    <ul>
    <li><strong>Top Level Domain: </strong>${tld}</li>
    <li><strong>Currencies: </strong>${currencies}</li>
    <li><strong>Languages: </strong>${languages.join(", ")}</li>
    </ul>
    </div>
    <ul class="w-full">
    <li><strong>Border Countries: </strong></li>
    <li class="w-full gap-2 flex flex-wrap ">
    ${borderHTML}
    </li>
    </ul>
    </div>
    </div>
    </div>`
    const body = document.querySelector("body");
    body.appendChild(newPage);
}

function stepBack(){
    const currentPage = document.querySelector(`.page:last-child`);
    currentPage.remove()
    const lastPage = document.querySelector(`.page:last-child`);
    lastPage.classList.toggle("hidden");
}

function backToHome(){
    const currentPage = document.querySelector(`.page:last-child`);
    currentPage.remove()
    const main = document.querySelector(`main`);
    main.classList.toggle("hidden");
}
// createCountryPage("iraq");

async function getAllCountriesNames(CountriesDate ="all"){
    let data;
    if  (CountriesDate === "all") {
        data = await filterCountries();
    } else {
        data = CountriesDate;
    }
    let countries = [];
    countries = data.map(countryInfo  => countryInfo["name"]["common"]).sort(); 
    countries = countries.filter(country => !lowerCaseUnwanted.includes(country.toLowerCase()));
    return countries;
}
// getAllCountriesNames();


//create a card for each country in the array


function matchSearch(countries,name){
    return countries.filter(function(country){
        return country.toLowerCase().startsWith(name.toLowerCase());
    })
}

async function searchCountryNames(search){
    if(search != ''){
        const container = document.querySelector('.cards-container');
        container.innerHTML='';
        if (lowerCaseUnwanted.includes(search.toLowerCase())){
            // const cards = document.querySelector('.cards-container');
            // cards.innerHTML='';
            const p = document.createElement('p');
            p.textContent="We don't do that here :)";
            container.appendChild(p);
        } else {
            const countries = await getAllCountriesNames();
            const matchingNames =  await matchSearch(countries,search);
            let cards = [];
            for(const name of matchingNames) {
                const data = await filterCountries(name);
                cards.push(createCard(data));
            }
            cards.forEach(card =>container.appendChild(card));
        }
    } else {
        showAllCountries();
    }
}
// searchCountryNames('c');

async function showAllCountries(){
    const countries = await getAllCountriesNames();
    const container = document.querySelector('.cards-container');
    container.innerHTML='';
    let cards = [];
    for (let country in countries){
        const data = await filterCountries(countries[country]);
        cards.push(createCard(data));
    }
    cards.forEach(card =>container.appendChild(card));
}
async function filterByRegion(region){
    const countriesData = await filterCountries(region, true);
    const countriesNames = await getAllCountriesNames(countriesData)

    const container = document.querySelector('.cards-container');
    container.innerHTML='';
    let cards = [];
            // for(const name of matchingNames) {
            //     const data = await filterCountries(name);
            // }
        for (let name in countriesNames){
                const data = await filterCountries(countriesNames[name]);
                cards.push(createCard(data));
        }
        cards.forEach(card =>container.appendChild(card));
}

async function findCountryByCCA3(cca3){
    return await fetch(`https://restcountries.com/v3.1/alpha/${cca3}`)
    .then((response)=>{return response.json()})
    .then(data =>  data[0]["name"]['common'])
}
// findCountryByCCA3("IRQ");

function toggleDarkMode(){
    const body = document.querySelector("body");
    const elements = document.querySelectorAll("#toggleMode");
    body.classList.toggle("darkMode-body")
    body.classList.toggle("lightMode-body")
    for(const element of elements){
        element.classList.toggle("darkMode-element")
        element.classList.toggle("lightMode-element")
    }
}

function checkMode(){
    const body = document.querySelector("body");
    if (body.classList.contains('darkMode-body')){
       return "darkMode-element"
   }else{
      return "lightMode-element"
   }
}

// initilize the home page
showAllCountries();