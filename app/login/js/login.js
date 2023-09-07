'use strict';
import notification from "../../libs/notifications";
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
                const not = new notification();
                not.error(e, 10, "Přilášení se nezdařilo");
                return;
            }

            window.location.reload();
        });

        const firstInput = form?.querySelector("input");
        firstInput?.focus();
    }
}

new login();
