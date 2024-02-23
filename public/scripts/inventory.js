
// fetching models according to the brand selected
document.getElementById("brand").addEventListener("change", (e) => {

    const selectedBrand = e.target.value;

    fetch("/models", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ brand: selectedBrand }),
    })
    .then(response => response.json())
    .then(data => {

        const modelSelect = document.getElementById("model");
        modelSelect.innerHTML = "<option value=''>Select Model</option>";

        data.forEach(model => {
            let option = document.createElement('option');
            option.value = model;
            option.textContent = model;
            modelSelect.appendChild(option);
        });

    })
    .catch(error => {
        console.error(error);
    });
});

// fetching years according to the model selected
document.getElementById("model").addEventListener("change", (e) => {

    const selectedModel = e.target.value;

    fetch("/years", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ model: selectedModel })
    })
    .then(response => response.json())
    .then(data => {

        const yearSelect = document.getElementById("year");
        yearSelect.innerHTML = "<option value=''>Select Year</option>";

        data.forEach(year => {            
            let option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearSelect.appendChild(option);
        });
    })
    .catch(error => {
        console.error(error);
    });
});

//Form elements 
    const form = document.querySelector('#filter');
    const brandSelect = document.querySelector('#brand');
    const modelSelect = document.querySelector('#model');
    const yearSelect = document.querySelector('#year');

// Form dynamic action path and progressive selection
    modelSelect.disabled = true;
    yearSelect.disabled = true;

    form.addEventListener('change', (e) => {
       if (e.target === brandSelect || e.target === modelSelect || e.target === yearSelect) {
        updateFormAction();
       }
    });

function updateFormAction() {
    console.log(form);
    let brand = brandSelect.value;
    let model = modelSelect.value;
    let year = yearSelect.value;
    
    modelSelect.disabled = !brand;
    yearSelect.disabled = !model || !brand;

    let action = `/search`;
    if (brand) {
        action += `/${brand}`;      
    }

    if (model) {
        action += `/${model}`;
        
    }

    if (year) {
        action += `/${year}`;
    }

    form.action = action;
};
