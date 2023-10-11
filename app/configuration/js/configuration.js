'use strict';

import notification from "../../libs/notifications";
import apiTools from "../../libs/apiTools";
import "../scss/configuration.scss";

class configuration {
    constructor() {
        this.setFormEvents();
    }

    setFormEvents() {
        const form = document.querySelector("#installation-form form");

        const apiTool = new apiTools();

        form?.addEventListener("submit", async (e) => {
            let response;

            try {
                response = await apiTool.sendForm(e);
            }

            catch(e) {
                const not = new notification();
                not.error(e, 10);
                return;
            }

            if((typeof response.continue != "undefined") && (response.continue)) {
                window.location.replace(response.continue);
                return;
            }

            setTimeout(async () => {
                const newPage = await fetch(window.location.href);
                const newPageCode = await newPage.text();

    
                const newPageDom = document.createElement("html");
                newPageDom.innerHTML = newPageCode;
                
                document.querySelector("#installation-form").replaceWith(newPageDom.querySelector("#installation-form"));
    
                this.setFormEvents();
            }, 50);
        });

        const inputs = form?.querySelectorAll("input[placeholder]") || [];
        for (const input of inputs) {
            input.addEventListener("keydown", (e) => {
                if(e.key == "Tab" && e.shiftKey == false) {
                    if(input.value == null || input.value == "") {
                        e.preventDefault();
                        input.value = input.placeholder;
                    }
                }
            });
        }

        const firstInput = form?.querySelector("input");
        firstInput?.focus();

        const partToggleElements = form?.querySelectorAll("[data-toggle-form-part]");
        partToggleElements?.forEach(element => {
            element.addEventListener("click", (e) => {
                const targetPart = document.querySelector(element.dataset.toggleFormPart);
                if(e.currentTarget.classList.contains("opened")) {
                    targetPart.style.height = null;
                    e.currentTarget.classList.remove("opened");
                }

                else {
                    const targetHeight = targetPart.scrollHeight;
                    targetPart.style.height = `${targetHeight}px`;
                    e.currentTarget.classList.add("opened");

                }
            });
        });
    }
}

new configuration();