'use strict';
import apiTools from "../../libs/apiTools";

import "../scss/login.scss";

class login {
    constructor() {
        this.setFormEvents();
    }

    setFormEvents() {
        const form = document.querySelector("#login-form form");

        const apiTool = new apiTools();

        form?.addEventListener("submit", async (e) => {
            try {
                await apiTool.sendForm(e);
            }

            catch(e) {
                return;
            }
        });
    }
}

new login();
