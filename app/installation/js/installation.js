'use strict';

import apiTools from "../../libs/apiTools";
import "../scss/installation.scss";

class installation {
    constructor() {
        this.setFormEvents();
    }

    setFormEvents() {
        const form = document.querySelector("#installation-form form");

        const apiTool = new apiTools();

        form?.addEventListener("submit", async (e) => {
            try {
                await apiTool.sendForm(e);
            }

            catch(e) {
                return;
            }

            setTimeout(async () => {
                const newPage = await fetch(window.location.href);
                const newPageCode = await newPage.text();
    
                console.log(newPageCode)
    
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
    }
}

new installation();