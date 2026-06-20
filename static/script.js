// Reset result section
function resetForm(){
    if(!confirm("Are you sure you want to reset the form?")){
        return false;
    }

    document.getElementById("res-sec").style.display = "none";
    document.getElementById("top_features").innerHTML = "";

    return true;

}

// main prediction using async-await and fetch api
async function predict(){
    try{
        const gender = document.querySelector('input[name="gender"]:checked').value;
        const seniorCitizen = document.querySelector('input[name="Senior Citizen"]:checked').value;
        const partner = document.querySelector('input[name="partner"]:checked').value;
        const dependents = document.querySelector('input[name="dependents"]:checked').value;
        const tenureMonths = document.getElementById("tenure_Months").value;
        const phoneService = document.querySelector('input[name="phone_Service"]:checked').value
        const multipleLines = document.querySelector('select[name="multiple_Lines"]').value
        const internetService = document.querySelector('select[name="internet_Service"]').value
        const onlineSecurity = document.querySelector('select[name="online_Security"]').value
        const onlineBackup = document.querySelector('select[name="online_Backup"]').value
        const deviceProtection = document.querySelector('select[name="device_Protection"]').value
        const techSupport = document.querySelector('select[name="tech_Support"]').value
        const streamingTV = document.querySelector('select[name="streaming_TV"]').value
        const streamingMovies = document.querySelector('select[name="streaming_Movies"]').value
        const contract = document.querySelector('select[name="contract"]').value
        const paperlessBilling = document.querySelector('input[name="paperless_Billing"]:checked').value
        const paymentMethod = document.querySelector('select[name="payment_Method"]').value
        const monthlyCharges = document.getElementById("monthly_Charges").value;
        const CLTV = document.getElementById("CLTV").value; 

        // from validation
        if (!tenureMonths || !monthlyCharges || !CLTV) {
            alert("Please fill all numeric fields.");
            return;
        }

        if (
            isNaN(Number(tenureMonths)) ||
            isNaN(Number(monthlyCharges)) ||
            isNaN(Number(CLTV))
        ) {
            alert("Numeric fields must contain valid numbers.");
            return;
        }

        // sending form data as HTTP request to the backend for prediction
        const res = await fetch("/predict", {
            method : "POST",
            headers : {
                "Content-Type" : "application/json"
            }, 
            body : JSON.stringify({
                gender : gender,
                seniorCitizen : seniorCitizen,
                partner : partner,
                dependents : dependents,
                tenureMonths : tenureMonths,
                phoneService : phoneService,
                multipleLines : multipleLines,
                internetService : internetService,
                onlineSecurity : onlineSecurity,
                onlineBackup : onlineBackup,
                deviceProtection : deviceProtection,
                techSupport : techSupport,
                streamingTV : streamingTV,
                streamingMovies : streamingMovies,
                contract : contract,
                paperlessBilling : paperlessBilling,
                paymentMethod : paymentMethod,
                monthlyCharges : monthlyCharges,
                CLTV : CLTV
            })
        })
        
        // Recieving Data as json string from the backend and convertinf it into javascript object
        const data = await res.json();

        // result section
        document.getElementById("res-sec").style.display = "flex";
        
        const churn_label = document.getElementById("churn_label")
        const churn_prob = document.getElementById("churn_prob");
        const offer_label = document.getElementById("offer_label");
        const uplift_score = document.getElementById("uplift_score");

        churn_label.innerHTML = `<p>Customer Status  : ${data.churn_label}</p>`;
        churn_prob.innerHTML = `<p>Churn probability : ${data.churn_prob}</p>`;
        offer_label.innerHTML = `<p>Recommendation  : ${data.offer}</p>`;
        uplift_score.innerHTML = `<p>Uplift Score : ${data.uplift_score}</p>`;

        // top features
        let featureHTML = "";

        data.top_features.forEach(item => {

            const sign =
                item.impact > 0 ? "⬆️" : "⬇️";

            featureHTML += `
                <div class="factor-item">
                    <span>${sign}</span>
                    <span>${item.feature}</span>
                    <span>(${item.impact.toFixed(3)})</span>
                </div>
            `;
        });

        document.getElementById("top_features").innerHTML =
            featureHTML;
        
        // result card footer for evident alert indication
        const churnFooter = document.querySelectorAll(".churn-footer");
        const upliftFooter = document.querySelectorAll(".uplift-footer");

        for(let el=0; el < churnFooter.length; el++) {
            if(data.churn_prob >= 0.7 && data.uplift_score < 0.2){
                churnFooter[el].classList.remove('bg-success')
                churnFooter[el].classList.add('bg-danger')

                upliftFooter[el].classList.remove('bg-success')
                upliftFooter[el].classList.add('bg-warning')
            }
            else if(data.churn_prob < 0.7 && data.uplift_score >= 0.2){
                churnFooter[el].classList.remove('bg-danger')
                churnFooter[el].classList.add('bg-success')

                upliftFooter[el].classList.remove('bg-warning')
                upliftFooter[el].classList.add('bg-success')
            }
            else if(data.churn_prob < 0.7 && data.uplift_score < 0.2){
                churnFooter[el].classList.remove('bg-danger')
                churnFooter[el].classList.add('bg-success')

                upliftFooter[el].classList.remove('bg-success')
                upliftFooter[el].classList.add('bg-warning')
            }
            else{
                churnFooter[el].classList.remove('bg-success')
                churnFooter[el].classList.add('bg-danger')

                upliftFooter[el].classList.remove('bg-warning')
                upliftFooter[el].classList.add('bg-success')
            }
        };
    }
    catch(error){
        console.error(error);
        alert("Prediction failed! Make sure you have filled the form completely!");
    }
}

// Dark Mode settings
document.getElementById("dark-mode").addEventListener("click", darkMode);

function darkMode(){
    if(document.body.classList.contains("dark")){
        document.body.classList.remove("dark");
        document.body.classList.add("light"); 
        
        // 
        document.getElementById("dark-img").style.background = "black";
    }
    else{
        document.body.classList.remove("light");
        document.body.classList.add("dark");

        document.getElementById("dark-img").style.background = "white";

    }
    
}

// Review Section
async function addReview(){

    const name = document.getElementById("review-name").value;

    const review = document.getElementById("review-text").value;

    // form validation
    if(!name || !review){
        alert("Please fill all fields");
        return;
    }
    
    const res = await fetch("/add-review",{
        method:"POST",
        
        headers:{
            "Content-Type":"application/json"
        },
        
        body:JSON.stringify({
            name:name,
            review:review
        })
    });

    if(!res.ok){
        alert("Failed to save review");
        return;
        }

    // resets the form inputs
    document.getElementById("review-name").value = "";
    document.getElementById("review-text").value = "";

    await loadReviews();
}

async function loadReviews(){

    const res = await fetch("/reviews");

    const data = await res.json();

    const reviewList =
        document.getElementById("review-list");

    reviewList.innerHTML = "";

    data.forEach(item => {

        reviewList.innerHTML += `
            <div class="review-item">
                <h5>${item.name}</h5>
                <div>
                    <p>${item.review}</p>
                </div>
            </div>
        `;
    });
}

window.addEventListener("DOMContentLoaded", loadReviews);
