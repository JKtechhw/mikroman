class apiTools {

    constructor(){}

    sendForm(submitEvent) {
        return new Promise((resolve, reject) => {
            submitEvent.preventDefault();

            const submitedForm = submitEvent.currentTarget;

            if(submitedForm.getAttribute("action") == null) {
                throw new Error("Unspecified action attribute");
            }

            const formData = new URLSearchParams(new FormData(submitedForm));
    
            const submitButton = submitedForm.querySelector("button[type=\"submit\"]");

            if(submitButton) {
                submitButton.disabled = true;
            }

            const oldErrorInputs = submitedForm.querySelectorAll(".error-field");
            oldErrorInputs.forEach(element => {
                element.classList.remove("error-field");
            });

            submitedForm.querySelector(".error-message")?.remove();
    
            const XHR = new XMLHttpRequest();
    
            XHR.addEventListener("error", () => {
                reject("Během odesílání dat došlo k chybě");
            });
    
            XHR.addEventListener("readystatechange", () => {
                if (XHR.readyState === XMLHttpRequest.DONE) {
                    if(XHR.status === 0 || (XHR.status >= 200 && XHR.status < 400)) {
                        try {
                            const response = JSON.parse(XHR.responseText);
                            resolve(response);
                        }
    
                        catch(e) {
                            reject("Response is not in valid JSON format");
                        }
                    }
    
                    else {
                        try {
                            const response = JSON.parse(XHR.responseText);

                            if(response.error_field) {
                                const errorField = submitedForm.querySelector(`[name=${response.error_field}]`)
                                if(errorField) {
                                    errorField.classList.add("error-field");
                                    errorField.addEventListener("input", (e) => {
                                        e.currentTarget.classList.remove("error-field");
                                    }, {once: true});
                                    errorField.focus();
                                }
                            }

                            reject(response.message);
                        }

                        catch(e) {
                            reject("Odesílání dat se nezdařilo");
                        }
                    }

                    if(submitButton) {
                        submitButton.disabled = false;
                    }
                }
            });
    
            XHR.open(submitedForm.getAttribute("method"), submitedForm.getAttribute("action"));
            XHR.send(formData); 
        });
    }
}

export default apiTools;